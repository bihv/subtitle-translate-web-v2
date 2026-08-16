import { AIModel, OpenRouterModelResponse } from '@/types/translation';

// Google Gemini Models
export const GEMINI_MODELS: AIModel[] = [
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        provider: 'google'
    },
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        provider: 'google'
    },
    {
        id: 'gemini-2.5-flash-preview-09-2025',
        name: 'Gemini 2.5 Flash (Experimental)',
        provider: 'google'
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        provider: 'google'
    },
    {
        id: 'gemini-2.5-flash-lite-preview-09-2025',
        name: 'Gemini 2.5 Flash-Lite (Experimental)',
        provider: 'google'
    },
    {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        provider: 'google'
    },
    {
        id: 'gemini-2.0-flash-lite',
        name: 'Gemini 2.0 Flash-Lite',
        provider: 'google'
    },
    {
        id: 'gemma-4-31b-it',
        name: 'Gemma 4 31B IT',
        provider: 'google'
    },
    {
        id: 'gemma-4-26b-a4b-it',
        name: 'Gemma 4 26B A4B IT',
        provider: 'google'
    }
];

export const GUEST_ALLOWED_GEMINI_MODELS = ['gemma-4-31b-it', 'gemma-4-26b-a4b-it'];

// Cache for OpenRouter models
let openRouterModelsCache: AIModel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch OpenRouter models from API
export async function fetchOpenRouterModels(): Promise<AIModel[]> {
    // Return cached models if still valid
    if (openRouterModelsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return openRouterModelsCache;
    }

    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch OpenRouter models:', response.status);
            return [];
        }

        const data: OpenRouterModelResponse = await response.json();

        // Filter to only text->text models and format them
        const models: AIModel[] = data.data
            .filter(model => {
                // Only include models that support text input/output
                const modality = model.architecture?.modality || '';
                return modality.includes('text') || !model.architecture;
            })
            .map(model => {
                const promptPrice = parseFloat(model.pricing.prompt) || 0;
                const completionPrice = parseFloat(model.pricing.completion) || 0;
                const isFree = promptPrice === 0 && completionPrice === 0;

                return {
                    id: model.id,
                    name: model.name,
                    provider: 'openrouter' as const,
                    free: isFree,
                    pricing: {
                        prompt: promptPrice,
                        completion: completionPrice
                    },
                    contextLength: model.context_length
                };
            })
            // Sort: free models first, then by name
            .sort((a, b) => {
                if (a.free && !b.free) return -1;
                if (!a.free && b.free) return 1;
                return a.name.localeCompare(b.name);
            });

        openRouterModelsCache = models;
        cacheTimestamp = Date.now();

        return models;
    } catch (error) {
        console.error('Error fetching OpenRouter models:', error);
        return [];
    }
}

// Clear the cache (useful when API key changes)
export function clearOpenRouterModelsCache(): void {
    openRouterModelsCache = null;
    cacheTimestamp = 0;
}
