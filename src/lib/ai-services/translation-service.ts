import { TranslationItem, TranslationConfig, TranslationProgress } from '@/types/translation';
import { GeminiService } from './gemini-service';
import { OpenAICompatibleService } from './openai-service';
import { ProxyService } from './proxy-service';

// Translation Service Factory
export class TranslationService {
    private geminiService: GeminiService;
    private openAIService: OpenAICompatibleService;
    private customService: OpenAICompatibleService | null;
    private proxyService: ProxyService | null = null;
    private useProxy: boolean = false;

    constructor(
        geminiApiKey?: string,
        openRouterApiKey?: string,
        customConfig?: { endpoint: string; apiKey: string }
    ) {
        this.geminiService = new GeminiService(geminiApiKey);
        this.openAIService = new OpenAICompatibleService(openRouterApiKey);

        // Custom provider reuses OpenAICompatibleService with custom endpoint
        this.customService = customConfig
            ? new OpenAICompatibleService(customConfig.apiKey, customConfig.endpoint)
            : null;

        // If no keys provided, enable proxy mode
        if (!geminiApiKey && !openRouterApiKey && !customConfig) {
            this.useProxy = true;
            this.proxyService = new ProxyService();
        }
    }

    async translateSubtitles(
        subtitles: TranslationItem[],
        config: TranslationConfig,
        onProgress?: (progress: TranslationProgress) => void,
        onSubtitleTranslated?: (item: TranslationItem, index: number) => void,
        signal?: AbortSignal
    ): Promise<TranslationItem[]> {
        if (this.useProxy && this.proxyService) {
            return this.proxyService.translateSubtitles(subtitles, config, onProgress, onSubtitleTranslated, signal);
        }

        if (config.provider === 'google') {
            return this.geminiService.translateSubtitles(subtitles, config, onProgress, onSubtitleTranslated, signal);
        } else if (config.provider === 'openrouter') {
            return this.openAIService.translateSubtitles(subtitles, config, onProgress, onSubtitleTranslated, signal);
        } else if (config.provider === 'custom' && this.customService) {
            return this.customService.translateSubtitles(subtitles, config, onProgress, onSubtitleTranslated, signal);
        } else {
            throw new Error(`Provider ${config.provider} not supported`);
        }
    }
}
