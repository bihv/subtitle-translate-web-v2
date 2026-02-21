import { NextResponse } from 'next/server';
import { GEMINI_MODELS, fetchOpenRouterModels } from '@/lib/ai-services/models';
import { AIModel } from '@/types/translation';

export const runtime = 'nodejs';

export async function GET() {
    try {
        // Fetch OpenRouter models (cached internally)
        let openRouterModels: AIModel[];
        try {
            openRouterModels = await fetchOpenRouterModels();
        } catch {
            openRouterModels = [];
        }

        return NextResponse.json({
            google: GEMINI_MODELS.map(m => ({
                id: m.id,
                name: m.name,
            })),
            openrouter: openRouterModels.map(m => ({
                id: m.id,
                name: m.name,
                free: m.free || false,
                pricing: m.pricing,
                contextLength: m.contextLength,
            })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
