import { NextRequest, NextResponse } from 'next/server';
import { RateLimiterService } from '@/lib/rate-limiter';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const { remaining, limit } = await RateLimiterService.checkDailyQuota(ip);

        return NextResponse.json({ remaining, limit });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch quota' }, { status: 500 });
    }
}
