import { TranslationItem, TranslationConfig } from '@/types/translation';
import { BaseTranslationService, TranslationResult } from './base-translation-service';
import { TranslationError, TranslationErrorType } from '@/lib/errors';

// OpenAI-Compatible Service with Streaming (works with OpenRouter, OpenAI, and any compatible API)
export class OpenAICompatibleService extends BaseTranslationService {
    private apiKey: string | null = null;
    private baseUrl: string;

    constructor(apiKey?: string, customEndpoint?: string) {
        super();
        this.apiKey = apiKey || null;
        this.baseUrl = customEndpoint || 'https://openrouter.ai/api/v1';
    }

    protected validateConfig(): void {
        if (!this.apiKey) {
            throw new Error('API key not configured');
        }
    }

    protected getConcurrency(): number {
        // OpenAI-compatible APIs can handle 2 concurrent batches
        return 2;
    }

    public async streamBatchTranslation(
        batch: TranslationItem[],
        batchStart: number,
        config: TranslationConfig,
        onTranslation: (result: TranslationResult) => void,
        signal?: AbortSignal
    ): Promise<void> {
        const messages = this.createChatMessages(batch, batchStart, config);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
                'X-Title': 'SubtitleAI Translation'
            },
            body: JSON.stringify({
                model: config.model,
                messages,
                temperature: 0.3,
                max_tokens: 16000,
                stream: true
            }),
            signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || `Status ${response.status}`;

            if (response.status === 429) {
                throw new TranslationError(`Rate limit: ${errorMsg}`, TranslationErrorType.RATE_LIMIT);
            }
            if (response.status === 401) {
                throw new TranslationError(`Unauthorized: ${errorMsg}`, TranslationErrorType.API_KEY_INVALID);
            }
            throw new TranslationError(`API error: ${errorMsg}`, TranslationErrorType.API_ERROR);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let sseBuffer = '';
        let contentBuffer = '';
        let parsedCount = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split(/\r?\n/);
            sseBuffer = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data: ')) {
                    const data = trimmedLine.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content || '';
                        contentBuffer += content;

                        // Parse NDJSON from content buffer
                        contentBuffer = this.parseNDJSON(contentBuffer, (result) => {
                            onTranslation(result);
                            parsedCount++;
                        });
                    } catch {
                        // Invalid SSE JSON, skip
                    }
                }
            }
        }

        // Process remaining content buffer
        if (contentBuffer.trim()) {
            try {
                const parsed = JSON.parse(contentBuffer);
                if (parsed.index !== undefined && parsed.text !== undefined) {
                    onTranslation({ index: parsed.index, text: parsed.text });
                    parsedCount++;
                }
            } catch {
                // Ignore incomplete JSON
            }
        }

        if (parsedCount === 0) {
            throw new Error('No valid translations parsed from response');
        }
    }
}
