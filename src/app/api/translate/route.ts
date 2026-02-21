import { NextRequest, NextResponse } from 'next/server';
import { TranslationConfig, TranslationItem } from '@/types/translation';
import { GeminiService } from '@/lib/ai-services/gemini-service';
import { OpenAICompatibleService } from '@/lib/ai-services/openai-service';
import { BaseTranslationService } from '@/lib/ai-services/base-translation-service';
import { GUEST_ALLOWED_GEMINI_MODELS, fetchOpenRouterModels } from '@/lib/ai-services/models';
import { RateLimiterService } from '@/lib/rate-limiter';

export const runtime = 'nodejs'; // Node runtime for crypto and consistency

export async function POST(req: NextRequest) {
    try {
        const { batch, config, batchStart } = await req.json() as {
            batch: TranslationItem[];
            config: TranslationConfig;
            batchStart: number;
        };

        if (!batch || !config) {
            return NextResponse.json({ error: 'Missing batch or config' }, { status: 400 });
        }

        const envKeys = config.provider === 'google'
            ? process.env.GEMINI_API_KEY
            : process.env.OPENROUTER_API_KEY;

        if (!envKeys) {
            return NextResponse.json({ error: 'Server API key not configured' }, { status: 500 });
        }

        // Parse multiple keys
        const apiKeys = envKeys.split(',').map(k => k.trim()).filter(Boolean);
        if (apiKeys.length === 0) {
            return NextResponse.json({ error: 'Server API key configuration is empty' }, { status: 500 });
        }

        // --- GUEST MODE CHECKS ---

        // 1. IP Rate Limiting (Daily Quota)
        // Get IP from headers (standard for Vercel/Next.js)
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

        const quotaCheck = await RateLimiterService.checkDailyQuota(ip);
        if (!quotaCheck.success) {
            return NextResponse.json({
                error: 'Daily translation limit reached. Please try again tomorrow or use your own API Key.'
            }, { status: 429 });
        }

        // 2. Allowed Models Validation
        if (config.provider === 'google') {
            if (!GUEST_ALLOWED_GEMINI_MODELS.includes(config.model)) {
                return NextResponse.json({
                    error: `Model '${config.model}' is not allowed in Guest Mode.`
                }, { status: 403 });
            }
        } else if (config.provider === 'openrouter') {
            try {
                const models = await fetchOpenRouterModels();
                const modelInfo = models.find(m => m.id === config.model);

                if (!modelInfo || !modelInfo.free) {
                    return NextResponse.json({
                        error: `Model '${config.model}' is not allowed in Guest Mode (must be free).`
                    }, { status: 403 });
                }
            } catch (error) {
                console.error('Failed to validate OpenRouter model:', error);
                return NextResponse.json({
                    error: 'Failed to validate model eligibility.'
                }, { status: 500 });
            }
        }

        // 3. Smart Key Acquisition (Concurrency)
        // Acquire a specific FREE key. If all busy, wait.
        const acquiredKey = await RateLimiterService.acquireAvailableKey(config.provider, apiKeys);

        if (!acquiredKey) {
            return NextResponse.json({
                error: 'Server is busy (all keys occupied). Please queue again in a few seconds.'
            }, { status: 503 });
        }

        let service: BaseTranslationService;
        if (config.provider === 'google') {
            service = new GeminiService(acquiredKey);
        } else {
            // OpenRouter or other OpenAI compatible
            service = new OpenAICompatibleService(acquiredKey);
        }

        const enc = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    await service.streamBatchTranslation(
                        batch,
                        batchStart,
                        config,
                        (result) => {
                            // Serialize result to NDJSON line
                            const line = JSON.stringify(result) + '\n';
                            controller.enqueue(enc.encode(line));
                        }
                    );

                    // Translation finished successfully
                    await RateLimiterService.incrementDailyUsage(ip);

                    controller.close();
                } catch (error: any) {
                    console.error('Proxy translation error:', error);
                    controller.error(error);
                } finally {
                    // IMPORTANT: Release the SPECIFIC key we used
                    await RateLimiterService.releaseKey(config.provider, acquiredKey);
                }
            }
        });

        return new NextResponse(stream);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
