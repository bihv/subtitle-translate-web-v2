import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, Zap, DollarSign, FileText } from 'lucide-react';
import { 
  TokenEstimate, 
  formatTokenCount, 
  formatCost,
  getTranslationEstimate,
  parseOpenRouterPricing
} from '@/lib/tokenEstimator';
import { getOpenRouterModels, OpenRouterModel } from '@/lib/openrouterApi';
import { useI18n } from '@/lib/i18n/I18nContext';

interface TokenEstimatorDisplayProps {
  subtitles: Array<{text: string}>;
  targetLanguage: string;
  customPrompt: string;
  modelId: string;
  aiProvider: 'gemini' | 'openrouter';
  isVisible?: boolean;
}

export default function TokenEstimatorDisplay({
  subtitles,
  targetLanguage,
  customPrompt,
  modelId,
  aiProvider,
  isVisible = true
}: TokenEstimatorDisplayProps) {
  const { t } = useI18n();
  const [openRouterModels, setOpenRouterModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load OpenRouter models for pricing data
  useEffect(() => {
    if (aiProvider === 'openrouter') {
      setIsLoadingModels(true);
      getOpenRouterModels().then(models => {
        console.log('TokenEstimator: Loaded OpenRouter models:', models.length);
        setOpenRouterModels(models);
        setIsLoadingModels(false);
      }).catch(error => {
        console.error('Failed to load OpenRouter models for pricing:', error);
        setIsLoadingModels(false);
      });
    }
  }, [aiProvider]);

  if (!isVisible || !subtitles || subtitles.length === 0) {
    return null;
  }

  // Get pricing for OpenRouter models
  let customPricing;
  let originalPricing;
  if (aiProvider === 'openrouter') {
    const model = openRouterModels.find(m => m.id === modelId);
    if (model) {
      customPricing = parseOpenRouterPricing(model.pricing);
      originalPricing = model.pricing; // Keep original pricing for display
      console.log('Token Estimator Debug:', {
        modelId,
        modelPricing: model.pricing,
        parsedPricing: customPricing
      });
    } else {
      console.log('Token Estimator Debug: Model not found', { 
        modelId, 
        availableModels: openRouterModels.map(m => ({ id: m.id, pricing: m.pricing }))
      });
    }
  }

  const estimate = getTranslationEstimate(
    subtitles, 
    targetLanguage, 
    customPrompt, 
    modelId, 
    aiProvider,
    customPricing || undefined
  );
  const hasValidPricing = customPricing !== null && customPricing !== undefined || estimate.pricingSource !== 'none';

  return (
    <Card className="border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Calculator className="h-4 w-4 text-blue-600" />
          {t('tokenEstimate.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* File Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <FileText className="h-3 w-3" />
            <span>{subtitles.length} {t('tokenEstimate.subtitles')}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {targetLanguage}
          </Badge>
        </div>

        {/* Token Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('tokenEstimate.input')}</span>
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {formatTokenCount(estimate.inputTokens)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('tokenEstimate.output')}</span>
              <span className="font-medium text-green-700 dark:text-green-300">
                {formatTokenCount(estimate.outputTokens)}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">{t('tokenEstimate.total')}</span>
              <span className="font-bold text-indigo-700 dark:text-indigo-300">
                {formatTokenCount(estimate.totalTokens)}
              </span>
            </div>
            {hasValidPricing && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {t('tokenEstimate.cost')}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCost(estimate.estimatedCost)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Cost Breakdown */}
        {hasValidPricing && customPricing && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 space-y-1">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{t('tokenEstimate.costBreakdown')}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('tokenEstimate.inputCost')}</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCost((estimate.inputTokens / 1_000_000) * customPricing.inputPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('tokenEstimate.outputCost')}</span>
                <span className="text-green-600 dark:text-green-400">
                  {formatCost((estimate.outputTokens / 1_000_000) * customPricing.outputPrice)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        <div className="flex items-center gap-2 pt-2 border-t border-blue-200 dark:border-blue-800">
          <Zap className="h-3 w-3 text-yellow-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {estimate.totalTokens < 10000 ? (
              <span className="text-green-600 dark:text-green-400">{t('tokenEstimate.fastProcessing')}</span>
            ) : estimate.totalTokens < 50000 ? (
              <span className="text-yellow-600 dark:text-yellow-400">{t('tokenEstimate.moderateProcessing')}</span>
            ) : (
              <span className="text-orange-600 dark:text-orange-400">{t('tokenEstimate.largeFile')}</span>
            )}
          </span>
        </div>

        {/* Model Info and Pricing Details */}
        <div className="text-xs text-gray-500 dark:text-gray-400 pt-1 space-y-1">
          <div>
            <span className="font-medium">{aiProvider === 'gemini' ? 'Gemini' : 'OpenRouter'}:</span>
            <span className="ml-1">{modelId}</span>
            {aiProvider === 'openrouter' && isLoadingModels && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                {t('tokenEstimate.loadingPricing')}
              </span>
            )}
            {!hasValidPricing && !isLoadingModels && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                {t('tokenEstimate.pricingNotAvailable')}
              </span>
            )}
            {hasValidPricing && estimate.pricingSource === 'live' && (
              <span className="ml-2 text-green-600 dark:text-green-400">
                {t('tokenEstimate.livePricing')}
              </span>
            )}
            {hasValidPricing && estimate.pricingSource === 'fallback' && (
              <span className="ml-2 text-blue-600 dark:text-blue-400">
                {t('tokenEstimate.standardRates')}
              </span>
            )}
          </div>
          
          {/* Detailed pricing info */}
          {hasValidPricing && originalPricing && estimate.pricingSource === 'live' && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              <span>{t('tokenEstimate.inputToken')}: {originalPricing.prompt}{t('tokenEstimate.perToken')}</span>
              <span className="mx-2">•</span>
              <span>{t('tokenEstimate.outputToken')}: {originalPricing.completion}{t('tokenEstimate.perToken')}</span>
            </div>
          )}
          
          {/* Show pricing info for fallback models */}
          {hasValidPricing && estimate.pricingSource === 'fallback' && (
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {t('tokenEstimate.builtInPricing')} {modelId}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
          {t('tokenEstimate.disclaimer')}
        </div>
      </CardContent>
    </Card>
  );
}
