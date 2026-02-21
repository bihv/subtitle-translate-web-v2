import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from '@google/generative-ai';
import { TranslationItem, TranslationConfig } from '@/types/translation';
import { BaseTranslationService, TranslationResult } from './base-translation-service';
import { TranslationError, TranslationErrorType } from '@/lib/errors';

// Google Gemini Service with Streaming
export class GeminiService extends BaseTranslationService {
    private genAI: GoogleGenerativeAI | null = null;

    constructor(apiKey?: string) {
        super();
        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
        }
    }

    protected validateConfig(): void {
        if (!this.genAI) {
            throw new Error('Google Gemini API key not configured');
        }
    }

    protected getConcurrency(): number {
        // Gemini has stricter rate limits, use 1 concurrent batch
        return 1;
    }

    public async streamBatchTranslation(
        batch: TranslationItem[],
        batchStart: number,
        config: TranslationConfig,
        onTranslation: (result: TranslationResult) => void,
        signal?: AbortSignal
    ): Promise<void> {
        try {
            const model = this.genAI!.getGenerativeModel({ model: config.model });
            const prompt = this.createPrompt(batch, batchStart, config);

            const streamResult = await model.generateContentStream(prompt);
            let buffer = '';
            let parsedCount = 0;

            for await (const chunk of streamResult.stream) {
                if (signal?.aborted) break;

                const text = chunk.text();
                buffer += text;

                // Parse NDJSON from buffer
                buffer = this.parseNDJSON(buffer, (result) => {
                    onTranslation(result);
                    parsedCount++;
                });
            }

            // Process remaining buffer
            if (buffer.trim()) {
                try {
                    const parsed = JSON.parse(buffer);
                    if (parsed.index !== undefined && parsed.text !== undefined) {
                        onTranslation({ index: parsed.index, text: parsed.text });
                        parsedCount++;
                    }
                } catch {
                    // Ignore incomplete JSON
                }
            }

            if (parsedCount === 0) {
                throw new TranslationError('No valid translations parsed from response', TranslationErrorType.API_ERROR);
            }
        } catch (error: any) {
            // Map Gemini errors to TranslationError
            const msg = error.message || '';

            if (error instanceof GoogleGenerativeAIFetchError) {
                if (error.status === 429) {
                    throw new TranslationError(msg, TranslationErrorType.QUOTA_EXCEEDED);
                }
                if (error.status === 403) {
                    // Permission denied or Quota
                    throw new TranslationError(msg, TranslationErrorType.QUOTA_EXCEEDED);
                }
                if (error.status === 400) {
                    // Invalid Argument (often API key or bad request)
                    throw new TranslationError(msg, TranslationErrorType.API_KEY_INVALID);
                }
            }

            throw new TranslationError(msg, TranslationErrorType.UNKNOWN, error);
        }
    }
}
