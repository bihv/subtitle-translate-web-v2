"use client";

import { useState, useEffect, useRef } from "react";
import { translateWithGemini, setApiKey, getApiKey, setModel, getModel } from "@/lib/geminiApi";
import type { TranslationResult } from "@/lib/geminiApi";
import { translateWithOpenRouter, translateWithOpenRouterBatch, setOpenRouterApiKey as saveOpenRouterApiKey, getOpenRouterApiKey, setOpenRouterModel as saveOpenRouterModel, getOpenRouterModel, getOpenRouterModels } from "@/lib/openrouterApi";
import SubtitleTable from "@/components/SubtitleTable";
import LanguageSelector from "@/components/LanguageSelector";
import LoadingIndicator from "@/components/LoadingIndicator";
import ApiKeyInput from "@/components/ApiKeyInput";
import OpenRouterApiKeyInput from "@/components/OpenRouterApiKeyInput";
import ModelSelector, { AVAILABLE_MODELS, ModelOption, translations as modelTranslations } from "@/components/ModelSelector";
import OpenRouterModelSelector from "@/components/OpenRouterModelSelector";
import AIProviderSelector, { AIProvider } from "@/components/AIProviderSelector";
import ClientOnly from "@/components/ClientOnlyComponent";
import BatchErrorDisplay from "@/components/BatchErrorDisplay";
import TokenEstimatorDisplay from "@/components/TokenEstimatorDisplay";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveAs } from "file-saver";
import { ChevronDown, ChevronUp, Globe, AlertCircle, PauseCircle, PlayCircle, StopCircle, X, Maximize, Minimize, Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import SubtitlePreview from "@/components/SubtitlePreview";
import { 
  parseSubtitle, 
  stringifySubtitle, 
  detectFormat, 
  getAcceptAttribute, 
  getFileExtension,
  SubtitleFormat,
  SubtitleItem as SubtitleItemBase,
  getSupportedExtensions
} from '@/lib/subtitleUtils';
import { 
  trackFileUpload, 
  trackTranslation, 
  trackExport, 
  trackError,
  trackEvent,
  trackTranslateButtonClick,
  trackModelSelection,
  trackProviderSwitch,
  getGeminiModelType,
  getOpenRouterModelType,
  createDetailedModelKey
} from '@/lib/analytics';
import Link from "next/link";

// Define subtitle item interface
export interface SubtitleItem extends SubtitleItemBase {
    translatedText: string;
    status: "pending" | "translating" | "translated" | "error";
    error?: string;
}

// Define types for parsed SRT item
interface ParsedSubtitle {
    id: number;
    startTime: string;
    endTime: string;
    text: string;
}

const BATCH_SIZE = 10; // Number of subtitles to translate in a batch
const MAX_BATCH_SIZE = 30; // Maximum number of subtitles in one large batch
const RATE_LIMIT_DELAY = 2000; // Delay between batches in milliseconds

export default function SubtitleTranslator() {
    const { t, formatParams, locale = 'vi' } = useI18n();
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
    const [translating, setTranslating] = useState<boolean>(false);
    const [targetLanguage, setTargetLanguage] = useState<string>("Vietnamese");
    const [customPrompt, setCustomPrompt] = useState<string>(
        t('translationSettings.customPromptDefault')
    );
    const [translationProgress, setTranslationProgress] = useState<number>(0);
    const [apiKeyProvided, setApiKeyProvided] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>(getModel());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [failedBatches, setFailedBatches] = useState<{ index: number; items: SubtitleItem[] }[]>([]);
    const [isSettingsCollapsed, setIsSettingsCollapsed] = useState<boolean>(false);
    const [isSubtitleTableCollapsed, setIsSubtitleTableCollapsed] = useState<boolean>(false);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [translationError, setTranslationError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const pauseStateRef = useRef<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [dragCounter, setDragCounter] = useState<number>(0);
    const [isPreviewCollapsed, setIsPreviewCollapsed] = useState<boolean>(false);
    const [layoutMode, setLayoutMode] = useState<'default' | 'sidebyside'>('default');
    const [currentPlayingSubtitleId, setCurrentPlayingSubtitleId] = useState<number | null>(null);
    const subtitleTableRef = useRef<HTMLDivElement>(null);
    const [currentTranslatingItemId, setCurrentTranslatingItemId] = useState<number | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [subtitleFormat, setSubtitleFormat] = useState<SubtitleFormat>('srt');
    const [exportFormat, setExportFormat] = useState<SubtitleFormat | 'original'>('original');
    const [showTokenEstimate, setShowTokenEstimate] = useState<boolean>(true);
    
    // AI Provider state
    const [aiProvider, setAiProvider] = useState<AIProvider>('gemini');
    const [openRouterApiKey, setOpenRouterApiKey] = useState<string>(getOpenRouterApiKey());
    const [openRouterModel, setOpenRouterModel] = useState<string>(getOpenRouterModel());
    const [openRouterModels, setOpenRouterModels] = useState<any[]>([]); // Store OpenRouter models for display name lookup

    // Cập nhật pauseStateRef khi isPaused thay đổi
    useEffect(() => {
        pauseStateRef.current = isPaused;
        console.log(`Pause state changed to: ${isPaused}`);
    }, [isPaused]);

    // Update custom prompt when language changes
    useEffect(() => {
        setCustomPrompt(formatParams(t('translationSettings.customPromptDefault'), { language: targetLanguage }));
    }, [t, formatParams, targetLanguage]);

    // Theo dõi sự thay đổi ngôn ngữ để đánh dấu phụ đề cần dịch lại
    const [previousLanguage, setPreviousLanguage] = useState<string>(targetLanguage);

    useEffect(() => {
        // Nếu ngôn ngữ thay đổi và đã có dữ liệu phụ đề
        if (previousLanguage !== targetLanguage && subtitles.length > 0) {
            // Hiển thị thông báo nhỏ rằng cần dịch lại
            console.log(`Ngôn ngữ đã thay đổi từ ${previousLanguage} sang ${targetLanguage}. Phụ đề sẽ được dịch lại.`);
        }

        // Ghi nhớ ngôn ngữ hiện tại cho lần thay đổi tiếp theo
        setPreviousLanguage(targetLanguage);
    }, [targetLanguage, subtitles.length, previousLanguage]);

    // Kiểm tra nếu màn hình đủ lớn để sử dụng layout side-by-side
    useEffect(() => {
        const checkScreenSize = () => {
            if (typeof window !== 'undefined') {
                setLayoutMode(window.innerWidth >= 1600 ? 'sidebyside' : 'default');
            }
        };

        // Kiểm tra khi component mount
        checkScreenSize();

        // Thêm event listener để kiểm tra khi resize
        window.addEventListener('resize', checkScreenSize);

        // Cleanup
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Xử lý khi người dùng cung cấp API key
    const handleApiKeyChange = (apiKey: string) => {
        setApiKey(apiKey);
        setApiKeyProvided(!!apiKey);

        // Xóa thông báo lỗi nếu đã cung cấp API key
        if (!!apiKey && validationError?.includes("Gemini API key")) {
            setValidationError(null);
        }
    };

    // Handle OpenRouter API key change
    const handleOpenRouterApiKeyChange = (apiKey: string) => {
        setOpenRouterApiKey(apiKey); // Set in local state
        saveOpenRouterApiKey(apiKey); // Set in openrouterApi module
        
        // Clear validation error if API key is provided
        if (!!apiKey && validationError?.includes("OpenRouter API key")) {
            setValidationError(null);
        }
    };

    // Handle AI provider change
    const handleAiProviderChange = (provider: AIProvider) => {
        const previousProvider = aiProvider;
        const previousModel = previousProvider === 'gemini' ? selectedModel : openRouterModel;
        const newModel = provider === 'gemini' ? selectedModel : openRouterModel;
        
        // Track provider switch
        if (previousProvider !== provider) {
            trackProviderSwitch(previousProvider, provider, previousModel, newModel);
        }
        
        setAiProvider(provider);
        
        // Clear validation errors when switching providers
        setValidationError(null);
    };

    // Handle OpenRouter model change
    const handleOpenRouterModelChange = (model: string) => {
        const previousModel = openRouterModel;
        
        // Find model pricing info for analytics
        const modelData = openRouterModels.find((m: any) => m.id === model);
        const previousModelData = openRouterModels.find((m: any) => m.id === previousModel);
        
        const modelType = getOpenRouterModelType(model, modelData?.pricing);
        
        // Track model selection change
        trackModelSelection('openrouter', previousModel, model, modelType);
        
        console.log(`🎯 Model changed to: ${model}`);
        setOpenRouterModel(model); // Update local state
        saveOpenRouterModel(model); // Save to OpenRouter API module
    };

    // Translation wrapper function that works with both providers
    const translateTexts = async (
        texts: string[], 
        targetLanguage: string, 
        prompt: string,
        context?: string
    ) => {
        if (aiProvider === 'gemini') {
            return await translateWithGemini({
                texts,
                targetLanguage,
                prompt,
                context,
                model: selectedModel
            });
        } else if (aiProvider === 'openrouter') {
            // OpenRouter now supports batch translation!
            return await translateWithOpenRouterBatch(
                texts,
                targetLanguage,
                prompt,
                context
            );
        } else {
            throw new Error('Invalid AI provider selected');
        }
    };

    // Helper function to get the display name for the current model
    const getCurrentModelDisplayName = () => {
        if (aiProvider === 'gemini') {
            const geminiModel = AVAILABLE_MODELS.find((m) => m.id === selectedModel);
            return geminiModel?.name || selectedModel;
        } else if (aiProvider === 'openrouter') {
            // Try to find the model in the loaded OpenRouter models list
            const openRouterModelData = openRouterModels.find((m: any) => m.id === openRouterModel);
            return openRouterModelData?.name || openRouterModel || selectedModel;
        }
        return selectedModel;
    };

    // Xử lý khi người dùng thay đổi model
    const handleModelChange = (modelId: string) => {
        const previousModel = selectedModel;
        const previousModelType = getGeminiModelType(previousModel);
        const newModelType = getGeminiModelType(modelId);
        
        // Track model selection change
        trackModelSelection('gemini', previousModel, modelId, newModelType);
        
        setModel(modelId);
        setSelectedModel(modelId);
        console.log(`Model changed to: ${modelId}`);
    };

    // Clear current file and subtitles
    const handleClearFile = () => {
        setFile(null);
        setFileName("");
        setSubtitles([]);
        setTranslationProgress(0);
        setValidationError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Xác thực đầu vào trước khi dịch
    const validateBeforeTranslate = () => {
        // Kiểm tra API key theo provider
        if (aiProvider === 'gemini') {
            if (!getApiKey()) {
                setValidationError(t('errors.apiKeyRequired'));
                return false;
            }
        } else if (aiProvider === 'openrouter') {
            if (!openRouterApiKey) {
                setValidationError(t('openrouter.invalid'));
                return false;
            }
        }

        // Kiểm tra file SRT
        if (!file || subtitles.length === 0) {
            setValidationError(t('errors.fileRequired'));
            return false;
        }

        // Nếu tất cả đều hợp lệ, xóa thông báo lỗi
        setValidationError(null);
        return true;
    };

    // Tạm dừng hoặc tiếp tục dịch
    const handlePauseResume = () => {
        console.log("Toggling pause state:", !isPaused);
        setIsPaused(!isPaused);
        pauseStateRef.current = !isPaused;
    };

    // Dừng hoàn toàn quá trình dịch
    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort("Translation aborted by user.");
            abortControllerRef.current = null;
        }
        console.log("Translation stopped by user");
    };

    // Handle file selection
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        processFile(selectedFile);
    };

    // Process the selected/dropped file
    const processFile = async (selectedFile: File) => {
        // Kiểm tra xem file có phải là một định dạng phụ đề được hỗ trợ
        const format = detectFormat(selectedFile.name);
        if (!format) {
            setValidationError(t('fileUpload.invalidFormat'));
            return;
        }

        setFile(selectedFile);
        setFileName(selectedFile.name);
        setTranslationProgress(0);
        setValidationError(null);
        setSubtitleFormat(format);

        try {
            const content = await selectedFile.text();
            const parsedSubtitles = parseSubtitle(content, format);

            // Initialize subtitle items with status
            const subtitleItems: SubtitleItem[] = parsedSubtitles.map((sub: SubtitleItemBase, index: number) => ({
                ...sub,
                id: index + 1,
                translatedText: "",
                status: "pending"
            }));

            setSubtitles(subtitleItems);
            
            // Theo dõi sự kiện tải file
            trackFileUpload(format, selectedFile.size);
        } catch (error) {
            console.error(`Error parsing the ${format.toUpperCase()} file:`, error);
            setValidationError(t('fileUpload.invalidFormat'));
            
            // Theo dõi lỗi
            trackError('file_parsing', `Error parsing ${format} file: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        // Ngăn trình duyệt mở tệp khi kéo thả
        e.preventDefault();
        e.stopPropagation();

        if (translating) return;

        // Tăng bộ đếm khi có sự kiện enter
        setDragCounter(prev => prev + 1);

        // Chỉ set isDragging thành true nếu có file
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        // Ngăn trình duyệt mở tệp khi kéo thả
        e.preventDefault();
        e.stopPropagation();

        // Giảm bộ đếm khi có sự kiện leave
        setDragCounter(prev => prev - 1);

        // Chỉ khi bộ đếm về 0 (đã rời khỏi vùng thả hoàn toàn) mới set isDragging về false
        if (dragCounter === 1) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        // Rất quan trọng: ngăn chặn hành vi mặc định của trình duyệt
        // khi kéo file vào trang web
        e.preventDefault();
        e.stopPropagation();

        if (translating) return;

        // Hiển thị rõ cho người dùng biết có thể thả tệp vào đây
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        // Rất quan trọng: ngăn chặn hành vi mặc định của trình duyệt
        // để tránh trình duyệt mở tệp thay vì xử lý trong ứng dụng
        e.preventDefault();
        e.stopPropagation();

        // Reset trạng thái kéo thả
        setIsDragging(false);
        setDragCounter(0);

        if (translating) return;

        // Kiểm tra xem có file nào được thả không
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            const file = droppedFiles[0];

            // Kiểm tra xem file có phải là định dạng được hỗ trợ không
            const format = detectFormat(file.name);
            if (format) {
                processFile(file);
            } else {
                setValidationError(t('fileUpload.invalidFormat'));
            }
        }
    };

    // Start translation process
    const handleTranslate = async () => {
        // Xác thực đầu vào và dừng nếu có lỗi
        if (!validateBeforeTranslate()) {
            return;
        }

        // Đặt lại trạng thái cho tất cả phụ đề về "pending" khi dịch lại với ngôn ngữ mới
        if (subtitles.some(sub => sub.status === "translated")) {
            const resetSubtitles = subtitles.map(sub => ({
                ...sub,
                status: "pending" as const,
                translatedText: "", // Xóa bản dịch cũ
                error: undefined
            }));
            setSubtitles(resetSubtitles);
        }

        setTranslating(true);
        setFailedBatches([]); // Xóa danh sách batch lỗi cũ khi bắt đầu dịch lại
        setIsPaused(false);
        pauseStateRef.current = false;
        setTranslationError(null); // Reset thông báo lỗi dịch

        // Xác định model và provider hiện tại cho analytics
        const currentModel = aiProvider === 'gemini' ? selectedModel : openRouterModel;
        const modelType = aiProvider === 'gemini' 
            ? getGeminiModelType(currentModel)
            : getOpenRouterModelType(currentModel);

        // Theo dõi sự kiện nhấn nút dịch (button click tracking)
        trackTranslateButtonClick(
            'auto', 
            targetLanguage, 
            subtitles.length, 
            aiProvider,
            currentModel,
            modelType
        );

        // Theo dõi sự kiện bắt đầu dịch (legacy tracking for compatibility)
        trackTranslation('auto', targetLanguage, subtitles.length, currentModel);

        // Tạo abort controller mới
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            // Clone the subtitles array to avoid mutation during iteration
            const updatedSubtitles = [...subtitles];
            const pendingSubtitles = updatedSubtitles.filter(sub =>
                sub.status === "pending" || sub.status === "error"
            );

            console.log(`Translating ${pendingSubtitles.length} subtitles to ${targetLanguage}`);

            // Process subtitles in batches
            const newFailedBatches: { index: number; items: SubtitleItem[] }[] = [];

            // Xác định kích thước batch dựa vào số lượng phụ đề
            // Nếu có nhiều phụ đề, tăng kích thước batch để giảm số lần gọi API
            const dynamicBatchSize = pendingSubtitles.length > 100
                ? MAX_BATCH_SIZE // Nếu có nhiều phụ đề (>100), sử dụng batch lớn
                : BATCH_SIZE; // Ngược lại, sử dụng kích thước batch mặc định

            console.log(`Using batch size: ${dynamicBatchSize}`);

            for (let i = 0; i < pendingSubtitles.length; i += dynamicBatchSize) {
                // Kiểm tra nếu đã abort
                if (signal.aborted) {
                    console.log("Translation process aborted");
                    throw new Error("Translation aborted");
                }

                // Đợi nếu đang tạm dừng - sử dụng ref thay vì state trực tiếp
                while (pauseStateRef.current) {
                    if (signal.aborted) {
                        console.log("Translation process aborted while paused");
                        throw new Error("Translation aborted");
                    }
                    console.log("Paused, waiting...");
                    // Sử dụng await-sleep dài hơn để giảm CPU usage
                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                const batchIndex = Math.floor(i / dynamicBatchSize);
                const batch = pendingSubtitles.slice(i, i + dynamicBatchSize);

                console.log(`Processing batch ${batchIndex + 1}: ${batch.length} items, isPaused: ${pauseStateRef.current}`);

                // Update status to translating for this batch
                batch.forEach(sub => {
                    const index = updatedSubtitles.findIndex(s => s.id === sub.id);
                    if (index !== -1) {
                        updatedSubtitles[index].status = "translating";
                    }
                });
                setSubtitles([...updatedSubtitles]);

                // Process batch with context
                try {
                    await processBatchWithContext(batch, updatedSubtitles);
                } catch (batchError) {
                    // Nếu lỗi là do abort thì không xử lý retry
                    if (signal.aborted) {
                        throw batchError;
                    }

                    console.error(`Batch ${batchIndex} failed:`, batchError);

                    // Nếu batch lớn bị lỗi, thử chia nhỏ thành các batch nhỏ hơn
                    if (batch.length > BATCH_SIZE) {
                        console.log(`Retrying batch ${batchIndex} with smaller sub-batches...`);
                        let anySubBatchSucceeded = false;

                        // Chia thành các sub-batch nhỏ hơn
                        for (let j = 0; j < batch.length; j += BATCH_SIZE) {
                            const subBatch = batch.slice(j, j + BATCH_SIZE);
                            const subBatchIndex = batchIndex * (dynamicBatchSize / BATCH_SIZE) + Math.floor(j / BATCH_SIZE);

                            try {
                                await processBatchWithContext(subBatch, updatedSubtitles);
                                anySubBatchSucceeded = true;
                            } catch (subBatchError) {
                                console.error(`Sub-batch ${subBatchIndex} failed:`, subBatchError);
                                // Lưu lại batch bị lỗi
                                newFailedBatches.push({
                                    index: subBatchIndex,
                                    items: subBatch.map(item => ({
                                        ...item,
                                        status: "error",
                                        error: subBatchError instanceof Error ? subBatchError.message : "Failed to translate sub-batch"
                                    }))
                                });
                            }
                        }

                        // Nếu tất cả sub-batch đều thất bại, lưu lại batch lớn ban đầu
                        if (!anySubBatchSucceeded) {
                            newFailedBatches.push({
                                index: batchIndex,
                                items: batch.map(item => ({
                                    ...item,
                                    status: "error",
                                    error: batchError instanceof Error ? batchError.message : "Failed to translate batch"
                                }))
                            });
                        }
                    } else {
                        // Nếu là batch nhỏ, lưu lại luôn
                        newFailedBatches.push({
                            index: batchIndex,
                            items: batch.map(item => ({
                                ...item,
                                status: "error",
                                error: batchError instanceof Error ? batchError.message : "Failed to translate batch"
                            }))
                        });
                    }
                }

                // Update progress
                setTranslationProgress(Math.min(100, Math.round(((i + batch.length) / pendingSubtitles.length) * 100)));
            }

            setTranslationProgress(100);

            // Cập nhật danh sách batch lỗi
            if (newFailedBatches.length > 0) {
                console.log(`${newFailedBatches.length} batches failed`);
                setFailedBatches(newFailedBatches);
            }
        } catch (error) {
            console.error("Translation process error:", error);

            // Kiểm tra nếu lỗi là do người dùng chủ động dừng
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            if (!errorMessage.includes("aborted") && !errorMessage.includes("Translation aborted")) {
                // Hiển thị lỗi trong UI với translationError state
                setTranslationError(`Có lỗi xảy ra trong quá trình dịch: ${errorMessage}`);
            } else {
                console.log("Translation was stopped by user");
            }
        } finally {
            setTranslating(false);
        }
    };

    // Process batch with context
    const processBatchWithContext = async (batch: SubtitleItem[], allSubtitles: SubtitleItem[]) => {
        // Kiểm tra nếu đã abort
        if (abortControllerRef.current?.signal.aborted) {
            throw new Error("Translation aborted");
        }

        if (!batch || batch.length === 0) {
            throw new Error("Empty batch provided");
        }

        // Tạm dừng nếu người dùng đã nhấn nút tạm dừng
        if (pauseStateRef.current) {
            console.log("Translation paused, waiting to resume...");
            await new Promise<void>(resolve => {
                const checkPauseState = () => {
                    if (!pauseStateRef.current) {
                        resolve();
                    } else {
                        setTimeout(checkPauseState, 500);
                    }
                };
                checkPauseState();
            });
            console.log("Translation resumed");
        }

        // Lấy context từ các phụ đề trước và sau batch hiện tại
        const getContextForBatch = (batch: SubtitleItem[], allSubs: SubtitleItem[]): SubtitleItem[] => {
            const firstSubInBatch = batch[0];
            const lastSubInBatch = batch[batch.length - 1];
            const firstSubIndex = allSubs.findIndex(s => s.id === firstSubInBatch.id);
            const lastSubIndex = allSubs.findIndex(s => s.id === lastSubInBatch.id);

            // Lấy tối đa 3 phụ đề trước và 3 phụ đề sau
            const startIndex = Math.max(0, firstSubIndex - 3);
            const endIndex = Math.min(allSubs.length - 1, lastSubIndex + 3);

            // Chỉ lấy phụ đề đã dịch làm context
            return allSubs
                .slice(startIndex, firstSubIndex)
                .filter(s => s.status === "translated" && s.translatedText);
        };

        // Cập nhật trạng thái của một batch
        const updateBatchStatus = (batchItems: SubtitleItem[], status: SubtitleItem["status"], errorMsg?: string) => {
            setSubtitles(prev => {
                const newSubtitles = [...prev];
                batchItems.forEach(item => {
                    const index = newSubtitles.findIndex(s => s.id === item.id);
                    if (index !== -1) {
                        newSubtitles[index] = {
                            ...newSubtitles[index],
                            status,
                            error: errorMsg
                        };
                    }
                });
                return newSubtitles;
            });
        };

        try {
            // Extract text from batch
            const textsToTranslate = batch.map(item => item.text);

            // Lấy context từ các phụ đề trước batch hiện tại
            const contextSubtitles = getContextForBatch(batch, allSubtitles);
            const context = contextSubtitles.length > 0
                ? t('translationSettings.contextPrompt') + "\n" + contextSubtitles.map((s: SubtitleItem) => `${s.id}. ${s.text} → ${s.translatedText}`).join("\n")
                : "";

            // Update status to translating
            updateBatchStatus(batch, "translating");

            // Call translation API with the current provider
            const translatedResults = await translateTexts(
                textsToTranslate,
                targetLanguage,
                customPrompt,
                context
            );

            // Update subtitles with translations
            batch.forEach((subtitle, index) => {
                const translationResult = translatedResults[index];

                if (translationResult && !translationResult.error) {
                    subtitle.translatedText = translationResult.text;
                    subtitle.status = "translated";
                    subtitle.error = undefined;
                } else {
                    subtitle.status = "error";
                    subtitle.error = translationResult?.error || "Unknown error";
                }
            });

            // Update the subtitles state with the translated batch
            setSubtitles(prev => {
                const newSubtitles = [...prev];
                batch.forEach(subtitle => {
                    const index = newSubtitles.findIndex(s => s.id === subtitle.id);
                    if (index !== -1) {
                        newSubtitles[index] = subtitle;
                    }
                });
                return newSubtitles;
            });

            // Update progress
            setTranslationProgress(prev => {
                const totalCompleted = subtitles.filter(s => s.status === "translated" || s.status === "error").length;
                return Math.floor((totalCompleted / subtitles.length) * 100);
            });
        } catch (error) {
            console.error("Batch translation error:", error);

            // Mark all items in the batch as failed
            updateBatchStatus(batch, "error", error instanceof Error ? error.message : "Translation failed");

            // Tính toán batch index chính xác
            const firstSubtitleId = batch[0]?.id || 0;
            const actualBatchIndex = Math.floor((firstSubtitleId - 1) / BATCH_SIZE);

            // Add to failed batches
            setFailedBatches(prev => {
                // Kiểm tra xem batch này đã tồn tại trong failedBatches chưa
                const batchExists = prev.some(existingBatch => {
                    if (!existingBatch.items.length) return false;
                    
                    const existingFirstId = existingBatch.items[0]?.id;
                    const existingBatchIndex = Math.floor((existingFirstId - 1) / BATCH_SIZE);
                    
                    return existingBatchIndex === actualBatchIndex;
                });
                
                // Chỉ thêm vào nếu batch chưa tồn tại
                if (!batchExists) {
                    return [...prev, { index: actualBatchIndex, items: [...batch] }];
                }
                
                return prev;
            });

            // Update progress
            setTranslationProgress(prev => {
                const totalCompleted = subtitles.filter(s => s.status === "translated" || s.status === "error").length;
                return Math.floor((totalCompleted / subtitles.length) * 100);
            });

            // Theo dõi lỗi dịch
            trackError('translation_batch', 
                error instanceof Error ? error.message : String(error), 
                { 
                    batchIndex: batch[0].id, 
                    subtitleCount: batch.length, 
                    targetLanguage 
                }
            );
        }
    };

    // Handle retrying a subtitle or navigating to it
    const handleRetrySubtitle = async (id: number) => {
        // Check if this is just a click to navigate to this subtitle
        if (id === currentPlayingSubtitleId) {
            return; // Already selected, no need to retry translation
        }
        
        // Set the current playing subtitle immediately for navigation purposes
        setCurrentPlayingSubtitleId(id);
        
        // Only proceed with retry if the status is error
        const subtitleIndex = subtitles.findIndex(sub => sub.id === id);
        if (subtitleIndex === -1) return;
        
        const subtitle = subtitles[subtitleIndex];
        if (subtitle.status !== "error") {
            return; // Just navigation, not a retry
        }
        
        // If it's an actual retry (status is error), proceed with retry logic
        const updatedSubtitles = [...subtitles];
        updatedSubtitles[subtitleIndex].status = "translating";
        setSubtitles(updatedSubtitles);

        try {
            // Get a few previous subtitles for context
            const context: { original: string; translated: string }[] = [];
            for (let i = Math.max(0, subtitleIndex - 3); i < subtitleIndex; i++) {
                if (updatedSubtitles[i].status === "translated" && updatedSubtitles[i].translatedText) {
                    context.push({
                        original: updatedSubtitles[i].text,
                        translated: updatedSubtitles[i].translatedText
                    });
                }
            }

            // Create a context string
            const contextString = context.map(c => `"${c.original}" -> "${c.translated}"`).join('\n');

            // Translate this subtitle
            const translatedResult = await translateTexts(
                [subtitle.text],
                targetLanguage,
                customPrompt,
                contextString ? `Here are some previous translations for context:\n${contextString}` : ''
            );

            // Cập nhật kết quả
            if (translatedResult[0]?.error) {
                updatedSubtitles[subtitleIndex].status = "error";
                updatedSubtitles[subtitleIndex].error = translatedResult[0].error;
            } else {
                updatedSubtitles[subtitleIndex].translatedText = translatedResult[0]?.text || "";
                updatedSubtitles[subtitleIndex].status = "translated";
                updatedSubtitles[subtitleIndex].error = undefined;

                // Nếu dịch thành công, kiểm tra xem phụ đề này có thuộc batch nào đã thất bại không
                // và cập nhật trạng thái batch đó
                const batchIndex = Math.floor(subtitleIndex / BATCH_SIZE);
                const existingFailedBatchIndex = failedBatches.findIndex(b => b.index === batchIndex);

                if (existingFailedBatchIndex !== -1) {
                    // Kiểm tra xem tất cả các phụ đề trong batch này đã được dịch thành công chưa
                    const batchStart = batchIndex * BATCH_SIZE;
                    const batchEnd = Math.min(batchStart + BATCH_SIZE, updatedSubtitles.length);
                    const allTranslated = updatedSubtitles
                        .slice(batchStart, batchEnd)
                        .every(s => s.status === "translated");

                    if (allTranslated) {
                        // Nếu tất cả đã được dịch thành công, xóa batch này khỏi danh sách thất bại
                        const updatedFailedBatches = [...failedBatches];
                        updatedFailedBatches.splice(existingFailedBatchIndex, 1);
                        setFailedBatches(updatedFailedBatches);
                    }
                }
            }

            setSubtitles([...updatedSubtitles]);
        } catch (error) {
            updatedSubtitles[subtitleIndex].status = "error";
            updatedSubtitles[subtitleIndex].error = error instanceof Error
                ? error.message
                : "Failed to translate";
            setSubtitles([...updatedSubtitles]);

            // Theo dõi lỗi thử lại
            trackError('retry_subtitle', 
                error instanceof Error ? error.message : String(error), 
                { subtitleId: id }
            );
        }
    };

    // Export translated subtitles
    const handleExport = () => {
        if (!window || subtitles.length === 0 || !fileName) return;

        // Sử dụng định dạng được chọn cho xuất
        const formatToUse = exportFormat === 'original' ? subtitleFormat : exportFormat;

        // Create subtitle content with translations
        const exportContent = stringifySubtitle(subtitles.map(sub => ({
            id: sub.id,
            startTime: sub.startTime,
            endTime: sub.endTime,
            text: sub.translatedText || sub.text // Use original text as fallback if translation is missing
        })), formatToUse);

        // Generate file name with language indication
        const origName = fileName.replace(new RegExp(`\\.${subtitleFormat}$`, 'i'), '');
        const newFileName = `${origName}_${targetLanguage.toLowerCase()}${getFileExtension(formatToUse)}`;

        // Create and download the file
        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, newFileName);
        
        // Theo dõi sự kiện xuất file
        trackExport(formatToUse, subtitles.length, targetLanguage, false);
    };

    // Export bilingual subtitles (original + translated)
    const handleExportBilingual = () => {
        if (!window || subtitles.length === 0 || !fileName) return;

        // Sử dụng định dạng được chọn cho xuất
        const formatToUse = exportFormat === 'original' ? subtitleFormat : exportFormat;

        // Create subtitle content with both original and translated text
        const exportContent = stringifySubtitle(subtitles.map(sub => {
            // Skip subtitles that haven't been translated yet
            if (sub.status !== "translated" || !sub.translatedText) {
                return {
                    id: sub.id,
                    startTime: sub.startTime,
                    endTime: sub.endTime,
                    text: sub.text
                };
            }

            // Format as bilingual: original text followed by translated text
            return {
                id: sub.id,
                startTime: sub.startTime,
                endTime: sub.endTime,
                text: `${sub.text}\n${sub.translatedText}`
            };
        }), formatToUse);

        // Generate file name for bilingual version
        const origName = fileName.replace(new RegExp(`\\.${subtitleFormat}$`, 'i'), '');
        const newFileName = `${origName}_bilingual_${targetLanguage.toLowerCase()}${getFileExtension(formatToUse)}`;

        // Create and download the file
        const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, newFileName);
        
        // Theo dõi sự kiện xuất file song ngữ
        trackExport(formatToUse, subtitles.length, targetLanguage, true);
    };

    // Update subtitle manually
    const handleUpdateSubtitle = (id: number, translatedText: string) => {
        setSubtitles(prevSubtitles =>
            prevSubtitles.map(sub =>
                sub.id === id
                    ? { ...sub, translatedText, status: "translated" }
                    : sub
            )
        );
    };

    // Làm mới danh sách các batch lỗi
    const refreshFailedBatches = () => {
        // Lọc lại các batch lỗi dựa trên trạng thái hiện tại của subtitles
        const errorBatches: { [key: number]: SubtitleItem[] } = {};
        
        // Nhóm các subtitle lỗi theo batch
        subtitles.forEach(sub => {
            if (sub.status === "error") {
                const batchIndex = Math.floor((sub.id - 1) / BATCH_SIZE);
                if (!errorBatches[batchIndex]) {
                    errorBatches[batchIndex] = [];
                }
                errorBatches[batchIndex].push(sub);
            }
        });
        
        // Chuyển đổi sang định dạng mảng failedBatches
        const newFailedBatches = Object.entries(errorBatches).map(([batchIndex, items]) => ({
            index: parseInt(batchIndex),
            items
        }));
        
        // Cập nhật state nếu có sự thay đổi
        if (JSON.stringify(newFailedBatches.map(b => b.index)) !== 
            JSON.stringify(failedBatches.map(b => b.index))) {
            setFailedBatches(newFailedBatches);
        }
    };

    // Retry a batch of subtitles
    const handleRetryBatch = async (batchIndex: number) => {
        console.log(`Starting retry for batch ${batchIndex}`);
        
        // Làm mới danh sách batch lỗi trước khi thử tìm
        refreshFailedBatches();
        
        // Kiểm tra xem có batch lỗi nào không
        if (!failedBatches || failedBatches.length === 0) {
            console.warn("Không có batch lỗi nào để thử lại");
            return Promise.resolve(); // Trả về resolved promise để không gây lỗi UI
        }

        // Log danh sách failedBatches hiện tại để debug
        console.log("Current failedBatches:", failedBatches.map(b => ({
            index: b.index,
            firstId: b.items[0]?.id,
            calculatedIndex: Math.floor((b.items[0]?.id - 1) / BATCH_SIZE)
        })));

        // Tìm batch từ mảng failedBatches dựa vào batchIndex
        // Chú ý: batchIndex là vị trí của batch, nhưng batch.index có thể không trùng khớp
        const batchToRetry = failedBatches.find(batch => {
            if (!batch || batch.items.length === 0) return false;
            
            const firstItemId = batch.items[0]?.id;
            const calculatedIndex = Math.floor((firstItemId - 1) / BATCH_SIZE);
            
            // So sánh trực tiếp calculated index với batchIndex được truyền vào
            return calculatedIndex === batchIndex;
        });
        
        if (!batchToRetry) {
            console.warn(`Batch với index ${batchIndex} không tìm thấy trong danh sách failedBatches`);
            
            // Cập nhật lại UI để không hiển thị các batch không còn tồn tại
            const batchExists = subtitles.some(sub => {
                const subBatchIndex = Math.floor((sub.id - 1) / BATCH_SIZE);
                return subBatchIndex === batchIndex && sub.status === "error";
            });
            
            if (!batchExists) {
                console.log("Batch không còn lỗi trong danh sách subtitles, cập nhật UI");
                // Refresh UI nếu cần
            }
            
            return Promise.resolve(); // Trả về resolved promise để không gây lỗi UI
        }

        const updatedSubtitles = [...subtitles];

        console.log(`Retrying batch ${batchIndex} with ${batchToRetry.items.length} items`);

        // Update status to translating for all subtitles in this batch
        batchToRetry.items.forEach(item => {
            const subIndex = updatedSubtitles.findIndex(s => s.id === item.id);
            if (subIndex !== -1) {
                updatedSubtitles[subIndex].status = "translating";
            }
        });

        setSubtitles(updatedSubtitles);

        // Tạo abort controller mới nếu chưa có
        if (!abortControllerRef.current) {
            abortControllerRef.current = new AbortController();
        }

        try {
            // Track analytics for retry batch
            trackEvent('retry_batch', { 
                batchIndex, 
                itemCount: batchToRetry.items.length,
            });

            // Process the batch
            await processBatchWithContext(batchToRetry.items, updatedSubtitles);

            // If successful, remove this batch from failedBatches
            setFailedBatches(prev => {
                // Lọc các batch không thuộc về batchIndex hiện tại
                return prev.filter(batch => {
                    // Kiểm tra xem batch này có phải là batch chúng ta vừa retry không
                    // bằng cách so sánh ID của item đầu tiên
                    if (!batch || batch.items.length === 0) return true; // giữ lại các batch rỗng (hiếm khi xảy ra)
                    
                    // Dựa vào firstItemId để xác định batch
                    const firstItemIdOfBatch = batch.items[0].id;
                    const firstItemIdOfRetried = batchToRetry.items[0].id;
                    
                    // Giữ lại các batch khác với batch vừa retry
                    return firstItemIdOfBatch !== firstItemIdOfRetried;
                });
            });

            // Làm mới danh sách các batch lỗi để đảm bảo tính nhất quán
            setTimeout(refreshFailedBatches, 500);
            
            return Promise.resolve();
        } catch (error) {
            console.error(`Error retrying batch ${batchIndex}:`, error);

            // Không cập nhật lại lỗi nếu là do abort
            if (abortControllerRef.current?.signal.aborted) {
                return Promise.reject(error);
            }

            // Update error message but keep batch in failed batches
            setFailedBatches(prev =>
                prev.map(batch => {
                    // Kiểm tra xem batch này có phải là batch chúng ta vừa retry không
                    // bằng cách so sánh ID của item đầu tiên
                    if (!batch || batch.items.length === 0) return batch; // giữ nguyên các batch rỗng
                    
                    // Dựa vào firstItemId để xác định batch
                    const firstItemIdOfBatch = batch.items[0].id;
                    const firstItemIdOfRetried = batchToRetry.items[0].id;
                    
                    // Nếu đây là batch đang retry, cập nhật thông báo lỗi
                    if (firstItemIdOfBatch === firstItemIdOfRetried) {
                        return {
                            ...batch,
                            items: batch.items.map(item => ({
                                ...item,
                                error: error instanceof Error ? error.message : "Failed to translate after retry"
                            }))
                        };
                    }
                    
                    // Giữ nguyên các batch khác
                    return batch;
                })
            );

            // Track error for analytics
            trackError('retry_batch_failed', 
                error instanceof Error ? error.message : String(error),
                { batchIndex }
            );

            // Làm mới danh sách các batch lỗi để đảm bảo tính nhất quán
            setTimeout(refreshFailedBatches, 500);
            
            return Promise.reject(error);
        }
    };

    // Thêm effect để làm mới danh sách failedBatches khi subtitles thay đổi
    useEffect(() => {
        if (subtitles.length > 0) {
            // Làm mới khi subtitles thay đổi để cập nhật danh sách batch lỗi
            refreshFailedBatches();
        }
    }, [subtitles]); // Phụ thuộc vào toàn bộ subtitles để cập nhật khi có thay đổi trạng thái

    // Thêm hàm xử lý gợi ý dịch thuật
    const handleSuggestBetterTranslation = async (id: number, originalText: string, currentTranslation: string) => {
        // Validate API key based on provider
        if (aiProvider === 'gemini' && !getApiKey()) {
            setValidationError(t('errors.apiKeyRequired'));
            return [];
        } else if (aiProvider === 'openrouter' && !openRouterApiKey) {
            setValidationError(t('openrouter.invalid'));
            return [];
        }

        try {
            // Xác định ngôn ngữ nguồn dựa trên ngôn ngữ đích
            const sourceLanguage = targetLanguage === "Vietnamese" ? "English" : "Vietnamese";
            
            // Tạo prompt riêng cho gợi ý bản dịch tốt hơn
            const suggestPrompt = `Hãy đưa ra 3 phiên bản dịch HOÀN TOÀN KHÁC NHAU cho đoạn văn bản sau, mỗi phiên bản với phong cách và cách diễn đạt riêng biệt.

- Văn bản gốc (${sourceLanguage}): "${originalText}"
- Bản dịch hiện tại (${targetLanguage}): "${currentTranslation}"

Yêu cầu cụ thể cho mỗi phiên bản:

1. PHIÊN BẢN THÔNG DỤNG: Ngôn ngữ tự nhiên, dễ hiểu cho số đông người xem. Sử dụng từ ngữ phổ thông, đơn giản mà vẫn diễn đạt đầy đủ ý nghĩa.

2. PHIÊN BẢN HỌC THUẬT: Sát nghĩa với văn bản gốc, sử dụng thuật ngữ chính xác và ngôn ngữ trang trọng. Diễn đạt chặt chẽ về mặt ngữ nghĩa và cú pháp.

3. PHIÊN BẢN SÁNG TẠO: Tự do hơn về mặt diễn đạt, có thể dùng thành ngữ, cách nói địa phương hoặc biểu đạt hiện đại. Truyền tải không chỉ nội dung mà cả cảm xúc và tinh thần của văn bản gốc.

Đảm bảo ba phiên bản phải ĐỦ KHÁC BIỆT để người dùng có những lựa chọn đa dạng. Trả về chính xác 3 phiên bản, mỗi phiên bản trên một dòng, không có đánh số, không có giải thích.`;

            // Đánh dấu đang dịch phụ đề này
            setCurrentTranslatingItemId(id);
            
            let suggestions: string[] = [];
            
            if (aiProvider === 'gemini') {
                // Gọi API Gemini để lấy gợi ý
                const response = await translateWithGemini({
                    texts: [originalText],
                    targetLanguage,
                    prompt: suggestPrompt,
                    model: selectedModel
                });
                
                if (response[0]?.error) {
                    throw new Error(response[0].error);
                }
                
                for(let i = 0; i < 3; i++) {
                    if (response[i]?.text) {
                        suggestions.push(response[i].text);
                    }
                }
            } else if (aiProvider === 'openrouter') {
                // For OpenRouter, we'll make 3 separate calls with different prompts
                const prompts = [
                    `Translate this to ${targetLanguage} using simple, everyday language: "${originalText}"`,
                    `Translate this to ${targetLanguage} using formal, academic language: "${originalText}"`,
                    `Translate this to ${targetLanguage} using creative, natural expression: "${originalText}"`
                ];
                
                for (const prompt of prompts) {
                    const result = await translateWithOpenRouter(originalText, targetLanguage);
                    if (result.success) {
                        suggestions.push(result.translatedText);
                    }
                }
            }
            
            // Nếu vẫn không tìm thấy, trả về bản dịch hiện tại
            if (suggestions.length === 0) {
                suggestions.push(currentTranslation);
            }
            
            // Đảm bảo luôn có đủ 3 phiên bản
            while (suggestions.length < 3) {
                suggestions.push(currentTranslation);
            }
            
            return suggestions;
        } catch (error) {
            console.error("Error suggesting better translations:", error);
            setValidationError(t('errors.translationSuggestionFailed'));
            return [currentTranslation];
        } finally {
            setCurrentTranslatingItemId(null);
        }
    };

    // Initialize API key status on component mount
    useEffect(() => {
        const geminiKey = getApiKey();
        setApiKeyProvided(!!geminiKey);
    }, []);

    // Initialize AI provider from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedProvider = localStorage.getItem("ai_provider") as AIProvider;
            if (savedProvider && (savedProvider === "gemini" || savedProvider === "openrouter")) {
                setAiProvider(savedProvider);
            }
        }
    }, []);

    // Load OpenRouter models when AI provider changes to OpenRouter
    useEffect(() => {
        if (aiProvider === 'openrouter') {
            const loadOpenRouterModels = async () => {
                try {
                    const models = await getOpenRouterModels();
                    setOpenRouterModels(models);
                } catch (error) {
                    console.error("Failed to load OpenRouter models for display:", error);
                }
            };
            loadOpenRouterModels();
        }
    }, [aiProvider]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-4">
                {/* AI Provider and API Key Configuration */}
                <ClientOnly>
                    <div className="space-y-4 mb-4">
                        <AIProviderSelector 
                            value={aiProvider}
                            onProviderChange={handleAiProviderChange}
                        />
                        
                        {aiProvider === 'gemini' && (
                            <ApiKeyInput onApiKeyChange={handleApiKeyChange} />
                        )}
                        
                        {aiProvider === 'openrouter' && (
                            <OpenRouterApiKeyInput 
                                value={openRouterApiKey}
                                onApiKeyChange={handleOpenRouterApiKeyChange}
                            />
                        )}
                    </div>
                </ClientOnly>

                {((aiProvider === 'gemini' && apiKeyProvided) || (aiProvider === 'openrouter' && openRouterApiKey)) && (
                    <>
                        {/* Hiển thị lỗi dịch (nếu có) */}
                        {translationError && (
                            <div className="bg-rose-50 border border-rose-200 p-4 rounded-md relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 h-6 w-6 text-gray-400 hover:text-gray-500"
                                    onClick={() => setTranslationError(null)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-rose-800">{t('errors.translationError')}</h3>
                                        <p className="text-sm text-rose-700 mt-1">{translationError}</p>
                                        <p className="text-xs text-rose-600 mt-2">
                                            {t('errors.translationErrorDescription')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Layout Container - Side by Side or Stacked */}
                        <div className={`${layoutMode === 'sidebyside' ? 'flex gap-4' : ''}`}>
                            {/* Left Column - File Upload, Settings and Table */}
                            <div className={`${layoutMode === 'sidebyside' ? 'w-3/5' : 'w-full'} space-y-4`}>
                                {/* File Upload and Settings */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* File Upload */}
                                    <Card className="md:col-span-1">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{t('fileUpload.title')}</CardTitle>
                                                    <CardDescription>{t('fileUpload.description')}</CardDescription>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                                                >
                                                    {isSettingsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        {!isSettingsCollapsed && (
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <div
                                                        ref={dropZoneRef}
                                                        className={`border-2 border-dashed rounded-md p-4 sm:p-6 text-center cursor-pointer transition-colors
                              ${isDragging ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30' : ''}
                              ${validationError && !file ? 'border-rose-300 bg-rose-50/50 dark:border-rose-600 dark:bg-rose-950/30' : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                            `}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        onDragEnter={handleDragEnter}
                                                        onDragOver={handleDragOver}
                                                        onDragLeave={handleDragLeave}
                                                        onDrop={handleDrop}
                                                    >
                                                        <input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept={getAcceptAttribute()}
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                            disabled={translating}
                                                        />
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {isDragging ? (
                                                                <p className="text-blue-500 dark:text-blue-400 font-medium">{t('fileUpload.dropFileHere')}</p>
                                                            ) : (
                                                                <div>
                                                                    <p className="dark:text-gray-300">{t('fileUpload.dragAndDropHere')}</p>
                                                                    <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">{t('fileUpload.orClickToSelect')}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {file && (
                                                        <div className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                            <div className="truncate">
                                                                <div className="font-medium dark:text-gray-200">{t('fileUpload.fileSelected')} {fileName}</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">{formatParams(t('fileUpload.formatDetected'), { format: subtitleFormat.toUpperCase() })}</div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="ml-2 h-7 text-xs"
                                                                onClick={handleClearFile}
                                                                disabled={translating}
                                                            >
                                                                {t('fileUpload.clearFile')}
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {validationError && !file && (
                                                        <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            {validationError}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                        {isSettingsCollapsed && file && (
                                            <CardContent>
                                                <div className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                                    <div className="truncate">
                                                        <span className="font-medium dark:text-gray-200">{t('fileUpload.fileSelected')}</span> <span className="dark:text-gray-300">{fileName}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                        {isSettingsCollapsed && !file && (
                                            <CardContent>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                                                    {t('fileUpload.noFileSelected')}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>

                                    {/* Translation Settings */}
                                    <Card className="md:col-span-2">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{t('translationSettings.title')}</CardTitle>
                                                    <CardDescription>{t('translationSettings.description')}</CardDescription>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setLayoutMode(layoutMode === 'default' ? 'sidebyside' : 'default')}
                                                        title={layoutMode === 'default' ? 'Chế độ song song' : 'Chế độ mặc định'}
                                                    >
                                                        {layoutMode === 'default' ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setIsSettingsCollapsed(!isSettingsCollapsed)}
                                                    >
                                                        {isSettingsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {!isSettingsCollapsed && (
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {aiProvider === 'gemini' && (
                                                        <ModelSelector
                                                            onModelChange={handleModelChange}
                                                        />
                                                    )}
                                                    
                                                    {aiProvider === 'openrouter' && (
                                                        <OpenRouterModelSelector
                                                            value={openRouterModel}
                                                            onModelChange={handleOpenRouterModelChange}
                                                        />
                                                    )}
                                                    
                                                    <LanguageSelector
                                                        value={targetLanguage}
                                                        onChange={setTargetLanguage}
                                                    />

                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            {t('translationSettings.customPrompt')}
                                                        </label>
                                                        <Textarea
                                                            value={customPrompt}
                                                            onChange={(e) => setCustomPrompt(e.target.value)}
                                                            className="min-h-[80px] resize-y max-h-[200px] custom-scrollbar"
                                                            disabled={translating}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Translation Buttons */}
                                                <div className="flex justify-between">
                                                    <div className="flex-1 flex items-center">
                                                        {subtitles.length > 0 && (
                                                            <div className="text-sm text-gray-500">
                                                                {formatParams(t('fileUpload.successfullyParsed'), { count: subtitles.length })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {translating && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={handlePauseResume}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    {isPaused ? (
                                                                        <>
                                                                            <PlayCircle className="h-4 w-4" />
                                                                            {t('common.resume')}
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <PauseCircle className="h-4 w-4" />
                                                                            {t('common.pause')}
                                                                        </>
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={handleStop}
                                                                    className="flex items-center gap-1"
                                                                >
                                                                    <StopCircle className="h-4 w-4" />
                                                                    {t('common.stop')}
                                                                </Button>
                                                            </>
                                                        )}
                                                        {!translating && (
                                                            <Button
                                                                onClick={handleTranslate}
                                                                disabled={!file || subtitles.length === 0}
                                                                className="flex items-center gap-1"
                                                                title={`${t('translationSettings.startTranslation')} - ${getCurrentModelDisplayName()}`}
                                                            >
                                                                <Globe className="h-4 w-4" />
                                                                {t('translationSettings.startTranslation')}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}

                                        {isSettingsCollapsed && (
                                            <CardContent>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{t('translationSettings.targetLanguage')}:</span>
                                                        <span className="text-blue-600">{targetLanguage}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{modelTranslations.title[locale === 'en' ? 'en' : 'vi']}:</span>
                                                        <span className="text-indigo-600">
                                                            {getCurrentModelDisplayName()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}

                                        {translating && (
                                            <CardFooter className="pt-2 border-t">
                                                {isPaused ? (
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="text-sm font-medium text-amber-600">
                                                                {t('translationSettings.translationPaused')}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{translationProgress}%</div>
                                                        </div>
                                                        <LoadingIndicator progress={translationProgress} isPaused={isPaused} />
                                                        <div className="mt-2 text-xs text-amber-600 px-2 py-1 bg-amber-50 border border-amber-100 rounded-md">
                                                            {t('translationSettings.translationPaused')}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="w-full">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="text-sm font-medium text-blue-600">
                                                                {t('translationSettings.translationInProgress')}
                                                            </div>
                                                            <div className="text-sm text-gray-500">{translationProgress}%</div>
                                                        </div>
                                                        <LoadingIndicator progress={translationProgress} />
                                                        <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
                                                            <span>
                                                                {modelTranslations.title[locale === 'en' ? 'en' : 'vi']}:
                                                                <span className="font-medium ml-1">
                                                                    {getCurrentModelDisplayName()}
                                                                </span>
                                                            </span>
                                                            <span className="text-gray-500">{translationProgress > 0 && translationProgress < 100 ? `${Math.round(subtitles.length * translationProgress / 100)}/${subtitles.length}` : ''}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </CardFooter>
                                        )}
                                    </Card>
                                </div>

                                {/* Batch Error Display */}
                                {failedBatches.length > 0 && (
                                    <BatchErrorDisplay
                                        failedBatches={failedBatches}
                                        onRetryBatch={handleRetryBatch}
                                        isProcessing={translating}
                                    />
                                )}

                                {/* Token Usage Estimate */}
                                {subtitles.length > 0 && showTokenEstimate && (
                                    <TokenEstimatorDisplay
                                        subtitles={subtitles}
                                        targetLanguage={targetLanguage}
                                        customPrompt={customPrompt}
                                        modelId={aiProvider === 'gemini' ? selectedModel : openRouterModel}
                                        aiProvider={aiProvider}
                                        isVisible={showTokenEstimate}
                                    />
                                )}

                                {/* Subtitle Table */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{t('subtitleTable.title')}</CardTitle>
                                                <CardDescription>{t('subtitleTable.description')}</CardDescription>
                                            </div>
                                            {subtitles.length > 0 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setShowTokenEstimate(!showTokenEstimate)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {showTokenEstimate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        {showTokenEstimate ? t('tokenEstimate.hide') : t('tokenEstimate.show')}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setIsSubtitleTableCollapsed(!isSubtitleTableCollapsed)}
                                                    >
                                                        {isSubtitleTableCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                    </Button>
                                                    <div className="flex flex-col gap-2">
                                                        {/* Format selection */}
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-xs text-gray-500 dark:text-gray-400">{t('export.exportFormat')}</label>
                                                            <select 
                                                                value={exportFormat}
                                                                onChange={(e) => setExportFormat(e.target.value as SubtitleFormat | 'original')}
                                                                className="text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={!subtitles.some(s => s.status === "translated")}
                                                            >
                                                                <option value="original">{t('export.keepOriginalFormat')} ({subtitleFormat.toUpperCase()})</option>
                                                                <option value="srt">SRT</option>
                                                                <option value="vtt">WebVTT</option>
                                                                <option value="ass">ASS</option>
                                                            </select>
                                                        </div>
                                                        
                                                        {/* Export buttons */}
                                                        <div className="flex flex-wrap gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleExport}
                                                                disabled={!subtitles.some(s => s.status === "translated")}
                                                                title={t('export.exportTranslated')}
                                                            >
                                                                {t('export.exportTranslated')}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleExportBilingual}
                                                                disabled={!subtitles.some(s => s.status === "translated")}
                                                                title={t('export.bilingualDescription')}
                                                                className="whitespace-nowrap"
                                                            >
                                                                {t('export.exportBilingual')}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    {!isSubtitleTableCollapsed && (
                                        <CardContent>
                                            {subtitles.length > 0 ? (
                                                <SubtitleTable
                                                    subtitles={subtitles}
                                                    onRetry={handleRetrySubtitle}
                                                    onRetryBatch={handleRetryBatch}
                                                    onUpdateTranslation={handleUpdateSubtitle}
                                                    translating={translating}
                                                    batchSize={BATCH_SIZE}
                                                    highlightedSubtitleId={currentPlayingSubtitleId}
                                                    onSuggestTranslation={handleSuggestBetterTranslation}
                                                />
                                            ) : (
                                                <div className="text-center py-10 text-gray-500">
                                                    {t('fileUpload.noFileSelected')}
                                                </div>
                                            )}
                                        </CardContent>
                                    )}
                                </Card>
                            </div>

                            {/* Right Column - Video Preview (only shown in side-by-side mode or if not collapsed) */}
                            {(layoutMode === 'sidebyside' || !isPreviewCollapsed) && subtitles.length > 0 && (
                                <div className={`${layoutMode === 'sidebyside' ? 'w-2/5' : 'w-full mt-4'}`}>
                                    <Card className="overflow-hidden">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle>{t('preview.title')}</CardTitle>
                                                    <CardDescription>{t('preview.description')}</CardDescription>
                                                </div>
                                                {layoutMode !== 'sidebyside' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => setIsPreviewCollapsed(!isPreviewCollapsed)}
                                                    >
                                                        <EyeOff className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <SubtitlePreview
                                                subtitles={subtitles}
                                                isTranslating={translating}
                                                selectedMode={layoutMode}
                                                onModeChange={(mode: 'default' | 'sidebyside') => setLayoutMode(mode)}
                                                currentPlayingSubtitleId={currentPlayingSubtitleId}
                                                onSubtitleChange={setCurrentPlayingSubtitleId}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Toggle button to show preview (only in stacked mode and when preview is collapsed) */}
                            {layoutMode !== 'sidebyside' && isPreviewCollapsed && subtitles.length > 0 && (
                                <div className="w-full mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsPreviewCollapsed(false)}
                                        className="w-full flex items-center justify-center gap-2 py-6"
                                    >
                                        <Eye className="h-4 w-4" />
                                        {t('preview.title')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}