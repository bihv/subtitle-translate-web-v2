/**
 * Token estimation utilities for different AI providers
 */

export interface TokenEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost?: number;
}

export interface ProviderPricing {
  inputPrice: number; // per 1M tokens
  outputPrice: number; // per 1M tokens
}

/**
 * Parse pricing from OpenRouter API format to number
 */
export function parseOpenRouterPricing(pricing: { prompt: string; completion: string }): ProviderPricing | null {
  if (pricing.prompt === "Free" || pricing.completion === "Free") {
    return { inputPrice: 0, outputPrice: 0 };
  }
  
  try {
    // Remove $ sign and parse the number (API returns per-token price)
    const inputPricePerToken = parseFloat(pricing.prompt.replace('$', ''));
    const outputPricePerToken = parseFloat(pricing.completion.replace('$', ''));
    
    if (isNaN(inputPricePerToken) || isNaN(outputPricePerToken)) {
      return null;
    }
    
    // Convert from per-token to per-1M-tokens for consistency with PROVIDER_PRICING
    const inputPrice = inputPricePerToken * 1_000_000;
    const outputPrice = outputPricePerToken * 1_000_000;
    
    return { inputPrice, outputPrice };
  } catch {
    return null;
  }
}

// Pricing data for different providers (per 1M tokens)
// Used as fallback when live pricing is not available
export const PROVIDER_PRICING: Record<string, ProviderPricing> = {
  // Gemini pricing (official rates as of Dec 2024)
  'gemini-1.5-pro': { inputPrice: 1.25, outputPrice: 5.0 },
  'gemini-1.5-pro-latest': { inputPrice: 1.25, outputPrice: 5.0 },
  'gemini-1.5-flash': { inputPrice: 0.075, outputPrice: 0.3 },
  'gemini-1.5-flash-latest': { inputPrice: 0.075, outputPrice: 0.3 },
  'gemini-2.0-flash-exp': { inputPrice: 0.075, outputPrice: 0.3 },
  'gemini-exp-1121': { inputPrice: 1.25, outputPrice: 5.0 },
  'gemini-exp-1206': { inputPrice: 1.25, outputPrice: 5.0 },
  
  // OpenRouter fallback pricing (will be overridden by live API data when available)
  'openai/gpt-4o': { inputPrice: 2.5, outputPrice: 10.0 },
  'openai/gpt-4o-mini': { inputPrice: 0.15, outputPrice: 0.6 },
  'openai/gpt-4-turbo': { inputPrice: 10.0, outputPrice: 30.0 },
  'anthropic/claude-3.5-sonnet': { inputPrice: 3.0, outputPrice: 15.0 },
  'anthropic/claude-3-haiku': { inputPrice: 0.25, outputPrice: 1.25 },
  'anthropic/claude-3-opus': { inputPrice: 15.0, outputPrice: 75.0 },
  'meta-llama/llama-3.1-8b-instruct': { inputPrice: 0.055, outputPrice: 0.055 },
  'meta-llama/llama-3.1-70b-instruct': { inputPrice: 0.59, outputPrice: 0.79 },
  'microsoft/wizardlm-2-8x22b': { inputPrice: 0.63, outputPrice: 0.63 },
  'google/gemini-pro-1.5': { inputPrice: 1.25, outputPrice: 5.0 },
  'google/gemini-flash-1.5': { inputPrice: 0.075, outputPrice: 0.3 },
};

/**
 * Estimate token count for text using a simple approximation
 * This uses the common rule of thumb: 1 token ≈ 4 characters for English
 * For other languages, we adjust the ratio
 */
export function estimateTokenCount(text: string, language: string = 'English'): number {
  if (!text || text.trim().length === 0) return 0;
  
  // Language-specific token ratios (characters per token)
  const languageRatios: Record<string, number> = {
    'English': 4,
    'Vietnamese': 3.5, // Vietnamese tends to be more token-dense
    'Chinese': 2, // Chinese characters are more information-dense
    'Japanese': 2.5,
    'Korean': 3,
    'Spanish': 4.2,
    'French': 4.5,
    'German': 5, // German words tend to be longer
    'Russian': 3.8,
    'Arabic': 3.5,
    'Thai': 3,
  };
  
  const ratio = languageRatios[language] || 4; // Default to English ratio
  return Math.ceil(text.length / ratio);
}

/**
 * Estimate tokens for subtitle translation task
 */
export function estimateSubtitleTokens(
  subtitles: Array<{text: string}>,
  targetLanguage: string,
  customPrompt: string,
  contextPerBatch: number = 3
): TokenEstimate {
  if (!subtitles || subtitles.length === 0) {
    return { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  }
  
  // Calculate input tokens
  let inputTokens = 0;
  
  // 1. Base prompt tokens
  const basePromptTokens = estimateTokenCount(customPrompt, 'English');
  
  // 2. Source text tokens
  const sourceTextTokens = subtitles.reduce((total, sub) => {
    return total + estimateTokenCount(sub.text, 'English'); // Assume source is English
  }, 0);
  
  // 3. Context tokens (previous translations for context)
  // Assume average context of 3 previous subtitles per batch
  const avgSubtitleLength = sourceTextTokens / subtitles.length;
  const contextTokens = Math.floor(subtitles.length / 10) * contextPerBatch * avgSubtitleLength * 2; // 2x for original + translation
  
  // 4. Instruction tokens (language specification, formatting)
  const instructionTokens = estimateTokenCount(`Translate to ${targetLanguage}. Maintain formatting.`, 'English');
  
  inputTokens = basePromptTokens + sourceTextTokens + contextTokens + instructionTokens;
  
  // Estimate output tokens (translated text is usually 1.1-1.5x longer)
  const outputMultiplier = getLanguageOutputMultiplier(targetLanguage);
  const outputTokens = Math.ceil(sourceTextTokens * outputMultiplier);
  
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  };
}

/**
 * Get output length multiplier for different target languages
 */
function getLanguageOutputMultiplier(targetLanguage: string): number {
  const multipliers: Record<string, number> = {
    'Vietnamese': 1.2,
    'Chinese': 0.8, // Chinese is often more compact
    'Japanese': 1.1,
    'Korean': 1.1,
    'Spanish': 1.3,
    'French': 1.4,
    'German': 1.5, // German translations tend to be longer
    'Russian': 1.2,
    'Arabic': 1.1,
    'Thai': 1.0,
    'English': 1.0,
  };
  
  return multipliers[targetLanguage] || 1.2; // Default multiplier
}

/**
 * Calculate estimated cost for a model
 */
export function calculateEstimatedCost(
  tokenEstimate: TokenEstimate,
  modelId: string,
  aiProvider: 'gemini' | 'openrouter' = 'gemini',
  customPricing?: { inputPrice: number; outputPrice: number }
): number {
  // For OpenRouter: Use live pricing from API if available
  if (customPricing) {
    const inputCost = (tokenEstimate.inputTokens / 1_000_000) * customPricing.inputPrice;
    const outputCost = (tokenEstimate.outputTokens / 1_000_000) * customPricing.outputPrice;
    return inputCost + outputCost;
  }

  // For Gemini or fallback: Use hardcoded pricing
  const pricing = PROVIDER_PRICING[modelId];
  if (!pricing) {
    console.log(`No pricing data available for model: ${modelId}`);
    return 0;
  }
  
  const inputCost = (tokenEstimate.inputTokens / 1_000_000) * pricing.inputPrice;
  const outputCost = (tokenEstimate.outputTokens / 1_000_000) * pricing.outputPrice;
  
  return inputCost + outputCost;
}

/**
 * Format token count for display
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1_000_000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1_000_000).toFixed(2)}M`;
}

/**
 * Format cost for display
 */
export function formatCost(cost: number): string {
  if (cost === 0) return '$0.00';
  if (cost < 0.000001) return `$${cost.toExponential(2)}`;
  if (cost < 0.001) return `$${cost.toFixed(6)}`;
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  if (cost < 1) return `$${cost.toFixed(3)}`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Get comprehensive token and cost estimate for subtitle translation
 */
export function getTranslationEstimate(
  subtitles: Array<{text: string}>,
  targetLanguage: string,
  customPrompt: string,
  modelId: string,
  aiProvider: 'gemini' | 'openrouter' = 'gemini',
  customPricing?: { inputPrice: number; outputPrice: number }
): TokenEstimate & { estimatedCost: number; pricingSource: 'live' | 'fallback' | 'none' } {
  const tokenEstimate = estimateSubtitleTokens(subtitles, targetLanguage, customPrompt);
  const estimatedCost = calculateEstimatedCost(tokenEstimate, modelId, aiProvider, customPricing);
  
  // Determine pricing source
  let pricingSource: 'live' | 'fallback' | 'none';
  if (customPricing) {
    pricingSource = 'live';
  } else if (PROVIDER_PRICING[modelId]) {
    pricingSource = 'fallback';
  } else {
    pricingSource = 'none';
  }
  
  return {
    ...tokenEstimate,
    estimatedCost,
    pricingSource
  };
}
