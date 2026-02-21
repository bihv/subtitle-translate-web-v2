import { TranslationItem, TranslationConfig, TranslationProgress } from '@/types/translation';
import { CriticalError, TranslationError, TranslationErrorType } from '@/lib/errors';

// Translation result from streaming
export interface TranslationResult {
    index: number;
    text: string;
}

// Base Translation Service with shared batch/retry/progress logic
export abstract class BaseTranslationService {

    async translateSubtitles(
        subtitles: TranslationItem[],
        config: TranslationConfig,
        onProgress?: (progress: TranslationProgress) => void,
        onSubtitleTranslated?: (item: TranslationItem, index: number) => void,
        signal?: AbortSignal
    ): Promise<TranslationItem[]> {
        this.validateConfig();

        const results: TranslationItem[] = [...subtitles.map(s => ({ ...s, status: 'pending' as const }))];
        const batchSize = config.batchSize || 50;
        let completedCount = 0;

        // Create batch tasks
        const batches: { start: number; end: number }[] = [];
        for (let batchStart = 0; batchStart < subtitles.length; batchStart += batchSize) {
            batches.push({
                start: batchStart,
                end: Math.min(batchStart + batchSize, subtitles.length)
            });
        }

        // Callback handler for translations
        const handleTranslation = (translation: TranslationResult) => {
            const globalIndex = translation.index;
            if (globalIndex >= 0 && globalIndex < subtitles.length && results[globalIndex].status !== 'completed') {
                results[globalIndex] = {
                    ...subtitles[globalIndex],
                    translatedText: translation.text,
                    status: 'completed'
                };
                completedCount++;
                onSubtitleTranslated?.(results[globalIndex], globalIndex);
                onProgress?.({
                    total: subtitles.length,
                    completed: completedCount,
                    status: 'translating'
                });
            }
        };

        // Process batch with retry logic
        const processBatch = async (batchStart: number, batchEnd: number): Promise<boolean> => {
            if (signal?.aborted) return false;

            const batch = subtitles.slice(batchStart, batchEnd);

            // Mark batch as translating
            for (let i = batchStart; i < batchEnd; i++) {
                if (results[i].status === 'pending') {
                    results[i] = { ...subtitles[i], status: 'translating' };
                    onSubtitleTranslated?.(results[i], i);
                }
            }

            const maxRetries = 3;
            let lastError: Error | null = null;

            for (let attempt = 0; attempt < maxRetries; attempt++) {
                if (signal?.aborted) return false;

                try {
                    // Call abstract method - each provider implements their own streaming
                    await this.streamBatchTranslation(batch, batchStart, config, handleTranslation, signal);
                    return true; // Success
                } catch (error: any) {
                    lastError = error;
                    let translationError: TranslationError;

                    // Normalize error to TranslationError
                    if (error instanceof TranslationError) {
                        translationError = error;
                    } else {
                        // Wrap unknown errors
                        const msg = error.message || 'Unknown error';
                        translationError = new TranslationError(msg, TranslationErrorType.UNKNOWN, error);
                    }

                    // Check if critical (No Retry)
                    if (translationError instanceof CriticalError ||
                        translationError.code === TranslationErrorType.QUOTA_EXCEEDED ||
                        translationError.code === TranslationErrorType.API_KEY_INVALID ||
                        translationError.code === TranslationErrorType.API_ERROR) {
                        throw translationError;
                    }

                    const isRateLimit = translationError.code === TranslationErrorType.RATE_LIMIT;
                    console.warn(`Batch ${batchStart}-${batchEnd} attempt ${attempt + 1} failed:`, translationError.message);

                    if (attempt < maxRetries - 1) {
                        // Exponential backoff (longer for rate limits)
                        const baseMs = isRateLimit ? 2000 : 1000;
                        const backoffMs = Math.pow(2, attempt) * baseMs + Math.random() * 1000;
                        console.warn(`Retrying in ${Math.round(backoffMs)}ms...`);
                        await new Promise(resolve => setTimeout(resolve, backoffMs));
                    }
                }
            }

            // All retries failed - mark batch as error AND Throw
            console.warn(`Batch ${batchStart}-${batchEnd} failed after ${maxRetries} retries`);

            // Mark items as error
            for (let i = batchStart; i < batchEnd; i++) {
                if (results[i].status === 'pending') {
                    results[i] = { ...subtitles[i], status: 'error' };
                }
            }

            // Throw the last error so the UI knows the whole operation (or this batch) failed
            if (lastError) {
                throw lastError;
            }

            return false;
        };

        // Process all batches concurrently (but controlled)
        const concurrency = this.getConcurrency();
        let batchIndex = 0;
        const inProgress: Promise<void>[] = [];

        const processNextBatch = async (): Promise<void> => {
            while (batchIndex < batches.length && !signal?.aborted) {
                const batch = batches[batchIndex++];
                await processBatch(batch.start, batch.end);
            }
        };

        // Start concurrent workers
        for (let i = 0; i < Math.min(concurrency, batches.length); i++) {
            inProgress.push(processNextBatch());
        }

        await Promise.all(inProgress);

        return results;
    }

    // Abstract methods to be implemented by each provider
    protected abstract validateConfig(): void;

    public abstract streamBatchTranslation(
        batch: TranslationItem[],
        batchStart: number,
        config: TranslationConfig,
        onTranslation: (result: TranslationResult) => void,
        signal?: AbortSignal
    ): Promise<void>;

    // Override in subclass if needed (e.g., Gemini might want 1, OpenAI can handle 2)
    protected getConcurrency(): number {
        return 2;
    }

    // Shared NDJSON parsing logic
    protected parseNDJSON(buffer: string, onTranslation: (result: TranslationResult) => void): string {
        const lines = buffer.split(/\r?\n/);
        const remaining = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
                const parsed = JSON.parse(trimmed);
                if (parsed.index !== undefined && parsed.text !== undefined) {
                    onTranslation({ index: parsed.index, text: parsed.text });
                }
            } catch {
                // Invalid JSON line, skip
            }
        }

        return remaining;
    }

    // Shared prompt content generation
    private getPromptContent(subtitles: TranslationItem[], startIndex: number, config: TranslationConfig): { system: string; user: string } {
        const systemPrompt = `You are a professional subtitle translator. Translate subtitles to ${config.targetLanguage}.

IMPORTANT: Output ONLY valid NDJSON format - one JSON object per line, no other text.
Each line must be: {"index": <number>, "text": "<translated text>"}
IMPORTANT: Use the EXACT index number provided in the input. Do not helpfully renumber them.

${config.context ? `Context: ${config.context}` : ''}
${config.style ? `Style: ${config.style}` : ''}`;

        const userPrompt = `Translate these subtitles (output NDJSON only):

${subtitles.map((item, i) => `${startIndex + i}: ${item.originalText}`).join('\n')}`;

        return { system: systemPrompt, user: userPrompt };
    }

    // Shared prompt creation (for Gemini-style single prompt)
    protected createPrompt(subtitles: TranslationItem[], startIndex: number, config: TranslationConfig): string {
        const { system, user } = this.getPromptContent(subtitles, startIndex, config);
        return `${system}\n\n${user}\n\nOutput (NDJSON only, no explanation):`;
    }

    // Shared chat messages creation (for OpenAI-style system/user format)
    protected createChatMessages(subtitles: TranslationItem[], startIndex: number, config: TranslationConfig): { role: string; content: string }[] {
        const { system, user } = this.getPromptContent(subtitles, startIndex, config);
        return [
            { role: 'system', content: system },
            { role: 'user', content: user }
        ];
    }
}
