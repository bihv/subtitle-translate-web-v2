import { GoogleGenerativeAI } from '@google/generative-ai';

// Utility functions
export function estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English, 2-3 for other languages
    return Math.ceil(text.length / 3);
}

export function validateApiKey(provider: 'google' | 'openrouter' | 'custom', apiKey: string): boolean {
    if (provider === 'google') {
        return apiKey.startsWith('AIza') && apiKey.length === 39;
    } else if (provider === 'openrouter') {
        return apiKey.startsWith('sk-or-') && apiKey.length > 20;
    } else if (provider === 'custom') {
        return apiKey.length > 0;
    }
    return false;
}

// Validate Google Gemini API Key by making a test request
export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });

        // Send a simple test prompt
        const result = await model.generateContent('Test');
        await result.response;

        return { valid: true };
    } catch (error: any) {
        console.error('Gemini API key validation error:', error);

        // Parse error messages
        if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('invalid')) {
            return { valid: false, error: 'Invalid API key' };
        } else if (error.message?.includes('403')) {
            return { valid: false, error: 'API key access forbidden' };
        } else if (error.message?.includes('429')) {
            return { valid: false, error: 'Rate limit exceeded' };
        }

        return { valid: false, error: error.message || 'Validation failed' };
    }
}

// Validate OpenRouter API Key by checking credits endpoint
export async function validateOpenRouterApiKey(apiKey: string): Promise<{
    valid: boolean;
    error?: string;
    warning?: string;
    credits?: number;
}> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/credits', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
                'X-Title': 'SubtitleAI API Key Test'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { valid: false, error: 'Invalid API key' };
            } else if (response.status === 403) {
                return { valid: false, error: 'API key access denied' };
            } else if (response.status === 429) {
                return { valid: false, error: 'Rate limit exceeded' };
            }

            const errorData = await response.json().catch(() => ({}));
            return { valid: false, error: errorData.error?.message || `HTTP ${response.status}` };
        }

        // API key is valid
        const creditsData = await response.json().catch(() => ({}));
        const totalCredits = creditsData.data?.total_credits || 0;
        const totalUsage = creditsData.data?.total_usage || 0;
        const remainingCredits = totalCredits - totalUsage;

        // Check for low credits warning
        if (remainingCredits < 0) {
            return {
                valid: true,
                warning: 'LOW_CREDITS',
                credits: remainingCredits
            };
        }

        return { valid: true, credits: remainingCredits };
    } catch (error: any) {
        console.error('OpenRouter API key validation error:', error);
        return { valid: false, error: error.message || 'Validation failed' };
    }
}
