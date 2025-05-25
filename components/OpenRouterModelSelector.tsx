"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { getOpenRouterModels, OpenRouterModel } from "@/lib/openrouterApi";

// Storage key for localStorage
const STORAGE_KEY = "openrouter-model";

interface OpenRouterModelSelectorProps {
  value: string;
  onModelChange: (modelId: string) => void;
}

export default function OpenRouterModelSelector({ value, onModelChange }: OpenRouterModelSelectorProps) {
  const { t, locale } = useI18n();
  const [selectedModel, setSelectedModel] = useState<string>(value);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load models from API
  useEffect(() => {
    const loadModels = async () => {
      setIsLoadingModels(true);
      try {
        const fetchedModels = await getOpenRouterModels();
        setModels(fetchedModels);
      } catch (error) {
        console.error("Failed to load OpenRouter models:", error);
        // Keep empty array, component will handle fallback
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Load saved model from localStorage on component mount only
  useEffect(() => {
    if (typeof window !== "undefined" && !value) {
      const savedModel = localStorage.getItem(STORAGE_KEY);
      if (savedModel) {
        setSelectedModel(savedModel);
        onModelChange(savedModel);
      }
    }
  }, []); // Remove onModelChange dependency to prevent re-runs

  // Update value when prop changes
  useEffect(() => {
    if (value !== selectedModel) {
      setSelectedModel(value);
    }
  }, [value]); // Remove selectedModel dependency to prevent circular updates

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) {
      return models;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return models.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);

  // Helper to highlight search terms in model names
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    onModelChange(modelId);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, modelId);
    }
  };

  // Clear search handler
  const clearSearch = () => {
    setSearchQuery("");
    // Refocus the search input after clearing
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatContextLength = (length: number): string => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K`;
    }
    return length.toString();
  };

  const formatPrice = (price: string): string => {
    if (price === "Free") return price;
    
    // If price already has $, return as is (direct from API)
    if (price.startsWith("$")) {
      return price;
    }
    
    // Otherwise add $ prefix
    return `$${price}`;
  };

  // Separate free and paid models from filtered results
  const freeModels = filteredModels.filter(model => model.isFree);
  const paidModels = filteredModels.filter(model => !model.isFree);

  // Get display name for selected model
  const getSelectedModelDisplay = () => {
    if (!selectedModel) return "";
    
    const model = models.find(m => m.id === selectedModel);
    return model ? model.name : selectedModel;
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block mb-2">
        {t('openrouter.modelTitle')}
      </label>

      {/* Search Input - moved outside Select to prevent focus loss */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder={t('openrouter.searchPlaceholder')}
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
          disabled={isLoadingModels || models.length === 0}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
            title={t('openrouter.clearSearch')}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Summary */}
      {searchQuery && (
        <div className="text-xs text-muted-foreground">
          {filteredModels.length === 0 
            ? `${t('openrouter.noModelsFound')} for "${searchQuery}"`
            : `Found ${filteredModels.length} model${filteredModels.length !== 1 ? 's' : ''} matching "${searchQuery}"`
          }
        </div>
      )}

      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger className="w-full text-left">
          <SelectValue placeholder={isLoadingModels ? t('common.loading') || "Loading..." : t('openrouter.selectModel')}>
            {selectedModel && !isLoadingModels && (
              <div className="flex items-center w-full">
                <span 
                  className="truncate text-sm flex-1" 
                  title={getSelectedModelDisplay()}
                >
                  {getSelectedModelDisplay()}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[400px] overflow-auto w-[500px] max-w-[90vw]">
          {isLoadingModels ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-sm text-muted-foreground">
                {t('common.loading') || "Loading models..."}
              </div>
            </div>
          ) : models.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
              <div className="text-sm text-muted-foreground mb-2">
                {t('openrouter.noModelsAvailable') || "No models available"}
              </div>
              <div className="text-xs text-muted-foreground">
                {t('openrouter.checkConnection') || "Please check your connection and try again"}
              </div>
            </div>
          ) : (
            <>
              {/* No Results Message */}
              {searchQuery && filteredModels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    {t('openrouter.noModelsFound') || "No models found"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Try different search terms
                  </div>
                </div>
              )}

              {/* Free Models Section */}
              {freeModels.length > 0 && (
                <SelectGroup className="mb-2">
                  <SelectLabel className="text-green-600 font-medium px-2 py-2 mb-1 text-sm border-b border-green-200">
                    🆓 {t('openrouter.freeModels')}
                    {searchQuery && ` (${freeModels.length})`}
                  </SelectLabel>
                  {freeModels.map((model) => (
                    <SelectItem 
                      key={model.id} 
                      value={model.id} 
                      className="cursor-pointer py-2 px-4 pl-8 pr-4 min-h-[60px] flex items-start relative"
                    >
                      <div className="flex flex-col gap-1 w-full pr-16">
                        <div className="font-medium">
                          <span 
                            className="truncate block" 
                            title={model.name}
                          >
                            {searchQuery ? highlightSearchTerm(model.name, searchQuery) : model.name}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="whitespace-nowrap">
                            {t('openrouter.context')}: {formatContextLength(model.context_length)} {t('openrouter.tokens')}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded whitespace-nowrap absolute top-2 right-4">
                        {t('aiProvider.free')}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}

              {/* Paid Models Section */}
              {paidModels.length > 0 && (
                <SelectGroup className="mb-2">
                  <SelectLabel className="text-blue-600 font-medium px-2 py-2 mb-1 text-sm border-b border-blue-200">
                    💎 {t('openrouter.paidModels')}
                    {searchQuery && ` (${paidModels.length})`}
                  </SelectLabel>
                  {paidModels.map((model) => (
                    <SelectItem 
                      key={model.id} 
                      value={model.id} 
                      className="cursor-pointer py-2 px-4 pl-8 pr-4 min-h-[60px] flex items-start relative"
                    >
                      <div className="flex flex-col gap-1 w-full pr-16">
                        <div className="font-medium">
                          <span 
                            className="truncate block" 
                            title={model.name}
                          >
                            {searchQuery ? highlightSearchTerm(model.name, searchQuery) : model.name}
                          </span>
                        </div>
                        <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="whitespace-nowrap">
                            {t('openrouter.context')}: {formatContextLength(model.context_length)} {t('openrouter.tokens')}
                          </span>
                          <div className="flex gap-2 flex-wrap">
                            <span className="whitespace-nowrap">
                              {t('openrouter.pricingPrompt')}: {formatPrice(model.pricing.prompt)}{model.pricing.prompt !== "Free" ? t('openrouter.perToken') : ""}
                            </span>
                            <span className="text-muted-foreground/50">|</span>
                            <span className="whitespace-nowrap">
                              {t('openrouter.pricingCompletion')}: {formatPrice(model.pricing.completion)}{model.pricing.completion !== "Free" ? t('openrouter.perToken') : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded whitespace-nowrap absolute top-2 right-4">
                        {t('aiProvider.paid')}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
