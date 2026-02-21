import { TranslationItem, TranslationConfig } from '@/types/translation';
import { BaseTranslationService, TranslationResult } from './base-translation-service';
import { TranslationError, TranslationErrorType } from '@/lib/errors';

export class ProxyService extends BaseTranslationService {

    protected validateConfig(): void {
        // No client-side validation needed for proxy
    }

    protected getConcurrency(): number {
        return 2;
    }

    public async streamBatchTranslation(
        batch: TranslationItem[],
        batchStart: number,
        config: TranslationConfig,
        onTranslation: (result: TranslationResult) => void,
        signal?: AbortSignal
    ): Promise<void> {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                batch,
                config,
                batchStart
            }),
            signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error || `Server error: ${response.status}`;

            // Critical: System Quota Exceeded -> STOP
            if (response.status === 429) {
                throw new TranslationError(errorMsg, TranslationErrorType.QUOTA_EXCEEDED);
            }

            // Critical: Auth/Permission -> STOP
            if (response.status === 403 || response.status === 401) {
                throw new TranslationError(errorMsg, TranslationErrorType.API_KEY_INVALID);
            }

            // Upstream: Rate Limited / Overloaded -> RETRY
            if (response.status === 503) {
                throw new TranslationError(errorMsg, TranslationErrorType.RATE_LIMIT);
            }

            // Upstream: Wrapped Error (500) -> Check message for "rate limit" -> RETRY
            const lowerMsg = errorMsg.toLowerCase();
            if (lowerMsg.includes('rate limit') || lowerMsg.includes('429') || lowerMsg.includes('too many requests')) {
                throw new TranslationError(errorMsg, TranslationErrorType.RATE_LIMIT);
            }

            // Default -> Generic Retry
            throw new Error(errorMsg);
        }

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let parsedCount = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // The server streams raw text chunks (parts of the translation)
            // But wait, my server implementation for OpenAI unwraps SSE and sends content.
            // My server implementation for Gemini sends raw text.
            // So 'buffer' here accumulates the raw text of the response.
            // AND the response itself is supposed to be NDJSON.
            // So I can use the same parseNDJSON logic!

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
            throw new Error('No valid translations parsed from server response');
        }
    }
}
