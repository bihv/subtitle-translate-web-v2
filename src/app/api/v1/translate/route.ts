import { NextRequest, NextResponse } from 'next/server';
import { TranslationConfig, TranslationItem, AIProvider } from '@/types/translation';
import { GeminiService } from '@/lib/ai-services/gemini-service';
import { OpenAICompatibleService } from '@/lib/ai-services/openai-service';
import { BaseTranslationService } from '@/lib/ai-services/base-translation-service';
import { parseFile } from '@/lib/file-parser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_EXTENSIONS = ['.srt', '.vtt', '.ass', '.json', '.xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // Extract fields
        const file = formData.get('file') as File | null;
        const apiKey = formData.get('apiKey') as string | null;
        const provider = formData.get('provider') as string | null;
        const model = formData.get('model') as string | null;
        const targetLanguage = formData.get('targetLanguage') as string | null;
        const context = formData.get('context') as string | null;
        const style = formData.get('style') as string | null;
        const batchSizeStr = formData.get('batchSize') as string | null;
        const customEndpoint = formData.get('customEndpoint') as string | null;

        // Validate required fields
        if (!file) {
            return NextResponse.json({ error: 'Missing required field: file' }, { status: 400 });
        }
        if (!apiKey) {
            return NextResponse.json({ error: 'Missing required field: apiKey' }, { status: 400 });
        }
        if (!provider || !['google', 'openrouter', 'custom'].includes(provider)) {
            return NextResponse.json({ error: 'Missing or invalid field: provider (must be google, openrouter, or custom)' }, { status: 400 });
        }
        if (!model) {
            return NextResponse.json({ error: 'Missing required field: model' }, { status: 400 });
        }
        if (!targetLanguage) {
            return NextResponse.json({ error: 'Missing required field: targetLanguage' }, { status: 400 });
        }

        // Validate file
        const fileName = file.name.toLowerCase();
        const hasValidExtension = VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
        if (!hasValidExtension) {
            return NextResponse.json({
                error: `Invalid file format. Supported: ${VALID_EXTENSIONS.join(', ')}`
            }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
        }

        // Validate custom provider
        if (provider === 'custom' && !customEndpoint) {
            return NextResponse.json({ error: 'customEndpoint is required for custom provider' }, { status: 400 });
        }

        // Parse file content
        const fileContent = await file.text();
        let parsed;
        try {
            parsed = parseFile(fileContent);
        } catch (error: any) {
            return NextResponse.json({ error: `Failed to parse file: ${error.message}` }, { status: 400 });
        }

        const subtitles = parsed.items;
        const batchSize = batchSizeStr ? parseInt(batchSizeStr, 10) : 50;

        // Build translation config
        const config: TranslationConfig = {
            provider: provider as AIProvider,
            model,
            apiKey,
            targetLanguage,
            context: context || undefined,
            style: style || undefined,
            batchSize: isNaN(batchSize) ? 50 : Math.max(1, Math.min(batchSize, 100)),
            customEndpoint: customEndpoint || undefined,
        };

        // Create service instance based on provider
        let service: BaseTranslationService;
        if (provider === 'google') {
            service = new GeminiService(apiKey);
        } else if (provider === 'custom') {
            service = new OpenAICompatibleService(apiKey, customEndpoint!);
        } else {
            // openrouter
            service = new OpenAICompatibleService(apiKey);
        }

        // Create streaming response — use ReadableStream with sync controller.enqueue()
        const encoder = new TextEncoder();
        let streamController: ReadableStreamDefaultController;
        let aborted = false;

        let completedCount = 0;
        const total = subtitles.length;



        const sendLine = (data: Record<string, any>) => {
            if (aborted) return;
            try {
                const chunk = encoder.encode(JSON.stringify(data) + '\n');
                streamController.enqueue(chunk);

            } catch (err: any) {

                aborted = true;
            }
        };

        const stream = new ReadableStream({
            start(controller) {
                streamController = controller;

                // Run translation in background — don't block start()
                (async () => {
                    try {
                        await service.translateSubtitles(
                            subtitles,
                            config,
                            undefined,
                            (item, index) => {
                                if (item.status === 'completed' && !aborted) {
                                    completedCount++;

                                    sendLine({
                                        index,
                                        originalText: item.originalText,
                                        translatedText: item.translatedText,
                                        status: completedCount < total ? 'translating' : 'done',
                                        completed: completedCount,
                                        total,
                                    });
                                }
                            }
                        );

                        if (!aborted) {

                            controller.close();
                        }
                    } catch (error: any) {

                        if (!aborted) {
                            sendLine({
                                status: 'error',
                                message: error.message || 'Translation failed',
                                code: error.code || 'UNKNOWN',
                                completed: completedCount,
                                total,
                            });
                            controller.close();
                        }
                    }
                })();
            },
            cancel() {
                // Client disconnected

                aborted = true;
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'application/x-ndjson',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
