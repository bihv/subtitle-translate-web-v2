import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import crypto from 'crypto';

// Initialize Redis
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Configuration
const DAILY_LIMIT = parseInt(process.env.DAILY_QUOTA || '5', 10);
const QUEUE_TIMEOUT_MS = 30000; // 30 seconds wait for queue

export class RateLimiterService {
    /**
     * Check if the IP has exceeded the daily quota.
     * Does NOT increment the counter.
     */
    static async checkDailyQuota(ip: string): Promise<{ success: boolean; remaining: number; limit: number }> {
        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            return { success: true, remaining: 100, limit: 100 };
        }

        try {
            // Use a fixed window daily key: "daily-quota:{ip}:{yyyy-mm-dd}"
            const dateStr = new Date().toISOString().split('T')[0];
            const key = `daily-quota:${ip}:${dateStr}`;

            const count = await redis.get<number>(key);
            const currentUsage = count || 0;
            const remaining = Math.max(0, DAILY_LIMIT - currentUsage);

            return {
                success: currentUsage < DAILY_LIMIT,
                remaining,
                limit: DAILY_LIMIT
            };
        } catch (error) {
            console.error('RateLimiter check error:', error);
            return { success: true, remaining: 0, limit: DAILY_LIMIT };
        }
    }

    /**
     * Increment the daily usage for an IP.
     * Should be called after successful translation.
     */
    static async incrementDailyUsage(ip: string): Promise<void> {
        if (!process.env.UPSTASH_REDIS_REST_URL) return;

        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const key = `daily-quota:${ip}:${dateStr}`;

            const newCount = await redis.incr(key);

            // Set expiry on first increment (24 hours)
            if (newCount === 1) {
                await redis.expire(key, 86400);
            }
        } catch (error) {
            console.error('RateLimiter increment error:', error);
        }
    }

    /**
     * Try to acquire a lock on *one* of the candidate keys.
     * Iterates through keys to find a free one.
     * If all are busy, waits and retries until timeout.
     * 
     * @param provider - 'google' or 'openrouter' (used for key prefixing)
     * @param candidateKeys - Array of available API keys
     * @returns The acquired key, or null if timed out
     */
    static async acquireAvailableKey(provider: string, candidateKeys: string[]): Promise<string | null> {
        if (!process.env.UPSTASH_REDIS_REST_URL) {
            // If no Redis, just pick a random key (fallback)
            return candidateKeys[Math.floor(Math.random() * candidateKeys.length)];
        }

        const start = Date.now();

        while (Date.now() - start < QUEUE_TIMEOUT_MS) {
            // 1. Try to find a free key immediately (Scan pass)
            // We shuffle to avoid thundering herd on the first key
            const shuffledKeys = [...candidateKeys].sort(() => Math.random() - 0.5);

            for (const key of shuffledKeys) {
                const keyHash = crypto.createHash('sha256').update(key).digest('hex');
                const lockKey = `lock:${provider}:${keyHash}`;

                // Try to acquire lock: active = 1, expire = 600s (10 mins)
                // NX: Only set if not exists
                // The large expiration is a safety valve in case the server crashes. 
                // Normally, we explicitly release the key immediately after translation via finally block.
                // Upstash Redis .set with nx returns 'OK' if set, or null if not set.
                const acquired = await redis.set(lockKey, '1', { nx: true, ex: 600 });

                if (acquired === 'OK') {
                    return key; // Success!
                }
            }

            // 2. If we are here, ALL keys were busy in this pass.
            // Wait a bit before retrying.
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return null; // Timeout
    }

    /**
     * Release the lock for a specific key.
     */
    static async releaseKey(provider: string, key: string): Promise<void> {
        if (!process.env.UPSTASH_REDIS_REST_URL) return;

        const keyHash = crypto.createHash('sha256').update(key).digest('hex');
        const lockKey = `lock:${provider}:${keyHash}`;

        try {
            await redis.del(lockKey);
        } catch (e) {
            console.error('Redis release error:', e);
        }
    }
}
