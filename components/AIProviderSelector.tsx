"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/I18nContext";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ExternalLink } from "lucide-react";

// Storage key for localStorage
const STORAGE_KEY = "ai_provider";

export type AIProvider = "gemini" | "openrouter";

interface AIProviderSelectorProps {
  value: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
}

export default function AIProviderSelector({ value, onProviderChange }: AIProviderSelectorProps) {
  const { t } = useI18n();
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>(value);

  // Load saved provider from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProvider = localStorage.getItem(STORAGE_KEY) as AIProvider;
      if (savedProvider && (savedProvider === "gemini" || savedProvider === "openrouter")) {
        setSelectedProvider(savedProvider);
        onProviderChange(savedProvider);
      }
    }
  }, [onProviderChange]);

  // Update local state when prop changes
  useEffect(() => {
    setSelectedProvider(value);
  }, [value]);

  const handleProviderChange = (provider: AIProvider) => {
    setSelectedProvider(provider);
    onProviderChange(provider);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, provider);
    }
  };

  // Get display name for selected provider
  const getSelectedProviderDisplay = () => {
    if (!selectedProvider) return "";
    
    if (selectedProvider === "gemini") {
      return t('aiProvider.gemini');
    } else if (selectedProvider === "openrouter") {
      return t('aiProvider.openrouter');
    }
    
    return selectedProvider;
  };

  // Get icon for provider
  const getProviderIcon = (provider: AIProvider) => {
    if (provider === "gemini") {
      return <Sparkles className="h-4 w-4 text-purple-600" />;
    } else if (provider === "openrouter") {
      return <ExternalLink className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block mb-2">
        {t('aiProvider.title')}
      </label>
      <Select value={selectedProvider} onValueChange={handleProviderChange}>
        <SelectTrigger className="w-full text-left">
          <SelectValue placeholder={t('aiProvider.selectProvider')}>
            {selectedProvider && (
              <div className="flex items-center gap-2 w-full">
                {getProviderIcon(selectedProvider)}
                <span className="truncate text-sm">{getSelectedProviderDisplay()}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px] overflow-auto w-[400px] max-w-[90vw]">
          <SelectItem value="gemini" className="cursor-pointer py-4 px-6 min-h-[80px] flex items-start pl-12">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-medium flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {getProviderIcon("gemini")}
                  <span className="text-base">{t('aiProvider.gemini')}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {t('aiProvider.geminiDescription')}
              </div>
            </div>
          </SelectItem>
          <SelectItem value="openrouter" className="cursor-pointer py-4 px-6 min-h-[80px] flex items-start pl-12">
            <div className="flex flex-col gap-2 w-full">
              <div className="font-medium flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {getProviderIcon("openrouter")}
                  <span className="text-base">{t('aiProvider.openrouter')}</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                {t('aiProvider.openrouterDescription')}
              </div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
