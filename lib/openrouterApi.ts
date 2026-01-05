"use client";

import { RateLimiter } from "@/lib/rateLimiter";

// Create a global rate limiter instance
const rateLimiter = new RateLimiter(1000, 3, 2);

// Variables to store current settings
let currentApiKey = "";
let currentModel = ""; // Will be loaded from localStorage

/**
 * Save OpenRouter API key to memory (for backward compatibility)
 * @param apiKey OpenRouter API key
 */
export function saveOpenRouterApiKey(apiKey: string) {
  currentApiKey = apiKey;
}

/**
 * Set OpenRouter API key (alias for backward compatibility)
 * @param apiKey OpenRouter API key
 */
export function setOpenRouterApiKey(apiKey: string) {
  currentApiKey = apiKey;
}

/**
 * Get current OpenRouter API key
 * @returns Current API key
 */
export function getOpenRouterApiKey(): string {
  return currentApiKey;
}

/**
 * Set OpenRouter model and save to localStorage
 * @param model Model ID
 */
export function setOpenRouterModel(model: string) {
  currentModel = model;
  if (typeof window !== 'undefined') {
    localStorage.setItem('openrouter-model', model);
  }
}

/**
 * Get current OpenRouter model from localStorage
 * @returns Current model ID
 */
export function getOpenRouterModel(): string {
  // If not loaded yet, try to load from localStorage
  if (!currentModel && typeof window !== 'undefined') {
    const savedModel = localStorage.getItem('openrouter-model');
    if (savedModel) {
      currentModel = savedModel;
    } else {
      // Default to first free model if no saved preference
      currentModel = "microsoft/wizardlm-2-8x22b";
    }
  }
  return currentModel;
}

// OpenRouter model options
export interface OpenRouterModel {
  id: string;
  name: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  isFree: boolean;
}

export interface OpenRouterApiModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
  };
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface ModelsResponse {
  data: OpenRouterApiModel[];
}

// Cache for models to avoid frequent API calls
let cachedModels: OpenRouterModel[] | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch models from OpenRouter API
 */
export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  // Return cached models if still valid
  if (cachedModels && Date.now() - lastFetchTime < CACHE_DURATION) {
    return cachedModels;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '',
        "X-Title": "SubtitleAI Model Selector"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: ModelsResponse = await response.json();

    // Filter models: must support text input and text output (for subtitle translation)
    // Include models with text->text, text+image->text, etc. as long as they support text I/O
    const textModels = data.data.filter(model =>
      model.architecture.input_modalities.includes("text") &&
      model.architecture.output_modalities.includes("text")
    );

    // Transform and categorize models
    const transformedModels: OpenRouterModel[] = textModels.map(model => {
      const promptPrice = parseFloat(model.pricing.prompt);
      const completionPrice = parseFloat(model.pricing.completion);
      const isFree = promptPrice === 0 && completionPrice === 0;

      return {
        id: model.id,
        name: model.name,
        context_length: model.context_length,
        pricing: {
          prompt: isFree ? "Free" : `$${model.pricing.prompt}`,
          completion: isFree ? "Free" : `$${model.pricing.completion}`
        },
        isFree
      };
    });

    // Sort models: free first, then by name
    transformedModels.sort((a, b) => {
      if (a.isFree !== b.isFree) {
        return a.isFree ? -1 : 1; // Free models first
      }
      return a.name.localeCompare(b.name);
    });

    // Cache the results
    cachedModels = transformedModels;
    lastFetchTime = Date.now();

    console.log(`📋 Fetched ${transformedModels.length} text-capable models from OpenRouter API`);
    console.log(`🆓 Free models: ${transformedModels.filter(m => m.isFree).length}`);
    console.log(`💰 Paid models: ${transformedModels.filter(m => !m.isFree).length}`);

    return transformedModels;
  } catch (error) {
    console.error("Failed to fetch OpenRouter models:", error);

    // Return fallback models if API fails
    return getFallbackModels();
  }
}

/**
 * Get fallback models if API fails
 */
function getFallbackModels(): OpenRouterModel[] {
  return [
    // Fallback free models
    {
      id: "microsoft/wizardlm-2-8x22b",
      name: "WizardLM-2 8x22B",
      context_length: 65536,
      pricing: {
        prompt: "Free",
        completion: "Free"
      },
      isFree: true
    },
    {
      id: "meta-llama/llama-3.1-8b-instruct:free",
      name: "Llama 3.1 8B (Free)",
      context_length: 131072,
      pricing: {
        prompt: "Free",
        completion: "Free"
      },
      isFree: true
    }
  ];
}

/**
 * Get OpenRouter models (fetched from API or cached)
 */
export async function getOpenRouterModels(): Promise<OpenRouterModel[]> {
  return await fetchOpenRouterModels();
}

/**
 * Get free models only
 */
export async function getFreeModels(): Promise<OpenRouterModel[]> {
  const allModels = await getOpenRouterModels();
  return allModels.filter(model => model.isFree);
}

/**
 * Get paid models only
 */
export async function getPaidModels(): Promise<OpenRouterModel[]> {
  const allModels = await getOpenRouterModels();
  return allModels.filter(model => !model.isFree);
}

export interface TranslationResult {
  translatedText: string;
  success: boolean;
  error?: string;
}

/**
 * Translate text using OpenRouter API
 */
export async function translateWithOpenRouter(
  text: string,
  targetLanguage: string,
  sourceLanguage: string = "auto"
): Promise<TranslationResult> {
  if (!currentApiKey) {
    return {
      translatedText: "",
      success: false,
      error: "OpenRouter API key not provided"
    };
  }

  // Ensure we have the latest model from localStorage
  const actualModel = getOpenRouterModel();
  console.log(`🔄 OpenRouter Translation - Using model: ${actualModel}`);

  const prompt = `You are a professional subtitle translator. Translate the following text from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}.

Important rules:
1. Preserve the original meaning and tone
2. Keep the translation concise and suitable for subtitles
3. Maintain proper punctuation and formatting
4. Do not add explanations or notes
5. Only return the translated text

Text to translate: "${text}"

Translation:`;

  try {
    return await rateLimiter.execute(async () => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '',
          "X-Title": "Subtitle Translator"
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response format from OpenRouter API");
      }

      const translatedText = data.choices[0].message.content.trim();

      return {
        translatedText,
        success: true
      };
    });
  } catch (error) {
    console.error("OpenRouter translation error:", error);
    return {
      translatedText: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Translate multiple texts using OpenRouter API (batch translation)
 * Similar to Gemini's batch approach
 */
export async function translateWithOpenRouterBatch(
  texts: string[],
  targetLanguage: string,
  prompt?: string,
  context?: string
): Promise<Array<{ text: string, error?: string }>> {
  if (!currentApiKey) {
    return texts.map(() => ({
      text: "",
      error: "API key not provided"
    }));
  }

  const actualModel = getOpenRouterModel();
  console.log(`🔄 OpenRouter Batch Translation - Using model: ${actualModel}, texts: ${texts.length}`);

  // Create a comprehensive prompt that handles multiple texts like Gemini
  const batchPrompt = `You are a professional subtitle translator. Translate the following subtitles to ${targetLanguage}.

${prompt || "Translate the following subtitles maintaining their original meaning, tone, and context. Keep translations concise and suitable for subtitles."}

${context ? `Context from previous translations:\n${context}\n` : ""}

Please translate each subtitle and respond in JSON format:
{"translations": ["translation1", "translation2", "translation3"]}

Subtitles to translate:
${texts.map((text, index) => `${index + 1}. "${text}"`).join('\n')}

Response (JSON only):`;

  try {
    return await rateLimiter.execute(async () => {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '',
          "X-Title": "Subtitle Translator"
        },
        body: JSON.stringify({
          model: actualModel,
          messages: [
            {
              role: "user",
              content: batchPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 8000, // Increased to handle longer subtitle batches
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `OpenRouter API error: ${response.status} ${response.statusText}`;
        return texts.map(() => ({
          text: "",
          error: errorMessage
        }));
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        return texts.map(() => ({
          text: "",
          error: "Invalid response format from OpenRouter API"
        }));
      }

      const responseText = data.choices[0].message.content.trim();

      try {
        // Try to parse JSON response first (like Gemini)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.translations && Array.isArray(parsed.translations)) {
            // Log warning if translation count doesn't match
            if (parsed.translations.length !== texts.length) {
              console.warn(`⚠️ OpenRouter batch mismatch: expected ${texts.length} translations, got ${parsed.translations.length}`);
              console.warn(`Response text length: ${responseText.length} characters`);
            }

            return texts.map((originalText, index) => {
              const translation = parsed.translations[index];
              if (!translation) {
                console.error(`❌ Missing translation for index ${index}: "${originalText.substring(0, 50)}..."`);
                return {
                  text: "",
                  error: `Missing translation ${index + 1}/${texts.length} - try with smaller batch`
                };
              }
              return { text: translation };
            });
          }
        }

        // Fallback: parse line by line
        const lines = responseText
          .split('\n')
          .filter((line: string) => line.trim())
          .map((line: string) => line.replace(/^\d+[\.\)]?\s*["']?|["']?\s*$/, "").trim());

        return texts.map((_, index) => ({
          text: lines[index] || `[Error: Failed to parse translation ${index + 1}]`
        }));
      } catch (parseError) {
        console.error("Error parsing OpenRouter batch response:", parseError);
        return texts.map(() => ({
          text: "",
          error: "Failed to parse translation response"
        }));
      }
    });
  } catch (error) {
    console.error("OpenRouter batch translation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return texts.map(() => ({
      text: "",
      error: errorMessage
    }));
  }
}

/**
 * Test OpenRouter API connection using the credits endpoint
 */
export async function testOpenRouterConnection(): Promise<{
  success: boolean;
  error?: string;
  warning?: string;
  credits?: number;
}> {
  if (!currentApiKey) {
    return {
      success: false,
      error: "API key not provided"
    };
  }

  try {
    // Use the credits endpoint to validate the API key - simple and fast
    const response = await fetch("https://openrouter.ai/api/v1/credits", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${currentApiKey}`,
        "HTTP-Referer": typeof window !== 'undefined' ? window.location.origin : '',
        "X-Title": "SubtitleAI API Key Test"
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error cases
      if (response.status === 401) {
        return {
          success: false,
          error: "Invalid API key"
        };
      } else if (response.status === 403) {
        return {
          success: false,
          error: "API key access denied"
        };
      } else if (response.status === 429) {
        return {
          success: false,
          error: "Rate limit exceeded"
        };
      }

      return {
        success: false,
        error: errorData.error?.message || `HTTP ${response.status}`
      };
    }

    // If we get here, the API key is valid
    const creditsData = await response.json().catch(() => ({}));
    console.log("OpenRouter credits:", creditsData);

    // Calculate remaining credits: total_credits - total_usage
    const totalCredits = creditsData.data?.total_credits || 0;
    const totalUsage = creditsData.data?.total_usage || 0;
    const remainingCredits = totalCredits - totalUsage;

    console.log(`Credits info: total=${totalCredits}, usage=${totalUsage}, remaining=${remainingCredits}`);

    // Check if credits are low and provide warning
    if (remainingCredits < 0) {
      return {
        success: true,
        credits: remainingCredits,
        warning: "LOW_CREDITS" // This will be translated in the component
      };
    }

    return {
      success: true,
      credits: remainingCredits
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection failed"
    };
  }
}
