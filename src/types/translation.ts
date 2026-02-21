export type FileFormat = 'srt' | 'vtt' | 'ass' | 'json' | 'xml';

export type TranslationStatus = 'pending' | 'translating' | 'completed' | 'error' | 'edited';

export interface TranslationItem {
  id: string;
  index: number;
  startTime: string;
  endTime: string;
  originalText: string;
  translatedText?: string;
  status: TranslationStatus;
  error?: string;
  metadata?: Record<string, any>; // For format-specific data (e.g., JSON key path)
}

export interface TranslationFile {
  name: string;
  format: FileFormat;
  content: string;
  items: TranslationItem[];
  totalItems: number;
}

export interface ParsedFile {
  format: FileFormat;
  items: TranslationItem[];
}

export interface ExportOptions {
  format: FileFormat;
  bilingual: boolean;
  originalFormat: boolean;
}

// Time utilities
export interface TimeCode {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// AI Provider types
export type AIProvider = 'google' | 'openrouter' | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  free?: boolean;
  pricing?: {
    prompt: number;
    completion: number;
  };
  contextLength?: number;
}

export interface TranslationConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  targetLanguage: string;
  context?: string;
  style?: string;
  batchSize: number;
  customEndpoint?: string;
}

export interface TranslationProgress {
  total: number;
  completed: number;
  status: 'preparing' | 'translating' | 'completed' | 'error';
  error?: string;
}

// OpenRouter API response types
export interface OpenRouterModelResponse {
  data: {
    id: string;
    name: string;
    pricing: {
      prompt: string;
      completion: string;
    };
    context_length: number;
    architecture?: {
      modality: string;
      input_modalities: string[];
      output_modalities: string[];
    };
  }[];
}