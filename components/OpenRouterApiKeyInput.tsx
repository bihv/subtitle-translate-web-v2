"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, Eye, EyeOff, X, AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";
import { testOpenRouterConnection } from "@/lib/openrouterApi";

// Storage keys for localStorage
const STORAGE_KEY = "openrouter_api_key";
const SAVE_KEY_PREFERENCE = "save_openrouter_api_key";

interface OpenRouterApiKeyInputProps {
  value: string;
  onApiKeyChange: (apiKey: string) => void;
}

export default function OpenRouterApiKeyInput({ value, onApiKeyChange }: OpenRouterApiKeyInputProps) {
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState(value);
  const [saveKey, setSaveKey] = useState<boolean>(false);
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showWarningPopup, setShowWarningPopup] = useState(false);

  // Load saved API key from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savePreference = localStorage.getItem(SAVE_KEY_PREFERENCE) === "true";
      
      if (savedKey) {
        setApiKey(savedKey);
        setSaveKey(savePreference);
        setIsKeyValid(true);
        setIsCollapsed(true); // Collapse section if API key exists
        onApiKeyChange(savedKey);
      }
    }
  }, [onApiKeyChange]);

  // Update local state when prop changes
  useEffect(() => {
    setApiKey(value);
  }, [value]);

  // Validate API key by testing connection
  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setIsKeyValid(false);
      return false;
    }

    setIsValidating(true);
    setErrorMessage(null);
    setWarningMessage(null);

    try {
      const { testOpenRouterConnection: testConnection } = await import("@/lib/openrouterApi");
      const tempSetKey = (await import("@/lib/openrouterApi")).setOpenRouterApiKey;
      
      tempSetKey(key);
      const result = await testConnection();
      
      if (result.success) {
        setIsKeyValid(true);
        setErrorMessage(null);
        
        // Check for warning (low credits)
        if (result.warning) {
          const warningMsg = result.warning === "LOW_CREDITS" 
            ? t('openrouter.lowCreditsWarning')
            : result.warning;
          setWarningMessage(warningMsg);
          setShowWarningPopup(true);
        } else {
          setWarningMessage(null);
          setShowWarningPopup(false);
        }
        
        return true;
      } else {
        setIsKeyValid(false);
        setErrorMessage(result.error || "API key validation failed");
        setWarningMessage(null);
        setShowWarningPopup(false);
        return false;
      }
    } catch (error) {
      console.error("OpenRouter API key validation error:", error);
      setIsKeyValid(false);
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      setErrorMessage(errorMsg);
      setWarningMessage(null);
      setShowWarningPopup(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async () => {
    const isValid = await validateApiKey(apiKey);

    if (isValid) {
      // Save key to localStorage if user chooses to save
      if (saveKey) {
        localStorage.setItem(STORAGE_KEY, apiKey);
        localStorage.setItem(SAVE_KEY_PREFERENCE, "true");
      } else {
        // Remove key from localStorage if user doesn't choose to save
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(SAVE_KEY_PREFERENCE, "false");
      }

      // Notify parent component about key change
      onApiKeyChange(apiKey);
      
      // Collapse section after successful save
      setIsCollapsed(true);
    }
  };

  const handleClearKey = () => {
    setApiKey("");
    setIsKeyValid(null);
    setSaveKey(false);
    setIsCollapsed(false);
    setErrorMessage(null);
    setWarningMessage(null);
    setShowWarningPopup(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SAVE_KEY_PREFERENCE);
    onApiKeyChange("");
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-background rounded-lg shadow-sm border border-border overflow-hidden transition-all duration-300">
      <div 
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={toggleCollapse}
      >
        <div className="flex items-start gap-3">
          <ExternalLink className="w-5 h-5 text-primary mt-1" />
          <div>
            <h2 className="text-lg font-medium text-foreground">{t('openrouter.title')}</h2>
            {isKeyValid === true && isCollapsed ? (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t('apiKey.configuredAndReady')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('openrouter.description')}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('openrouter.getKey')} <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            toggleCollapse();
          }}
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border">
          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('openrouter.placeholder')}
              className={`pr-20 ${isKeyValid === true ? 'border-green-500' : isKeyValid === false ? 'border-red-500' : ''}`}
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-0 top-0 h-full px-3 py-2 text-xs"
            >
              {showKey ? t('apiKey.hide') : t('apiKey.show')}
            </Button>
          </div>
          
          {isKeyValid === true && (
            <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {t('openrouter.valid')}
            </div>
          )}
          
          {isKeyValid === false && errorMessage && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="save-openrouter-key" 
              checked={saveKey}
              onCheckedChange={(checked) => setSaveKey(checked as boolean)}
            />
            <label
              htmlFor="save-openrouter-key"
              className="text-sm text-muted-foreground leading-none cursor-pointer"
            >
              {t('apiKey.saveInBrowser')}
            </label>
          </div>
          
          <div className="flex justify-end gap-2 mt-2">
            {apiKey && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearKey}
                disabled={!apiKey || isValidating}
              >
                {t('common.clear')}
              </Button>
            )}
            <Button 
              size="sm"
              onClick={handleSaveKey}
              disabled={!apiKey || isValidating}
              className={isValidating ? "opacity-80" : ""}
            >
              {isValidating ? t('apiKey.validating') : isKeyValid === true ? t('apiKey.update') : t('apiKey.saveAndUse')}
            </Button>
          </div>
        </div>
      )}
      
      {/* Warning Popup for Low Credits */}
      {showWarningPopup && warningMessage && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-4 relative">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-600 dark:text-amber-400 mb-2">
                  {t('openrouter.warningTitle')}
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                  {warningMessage}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  💡 {t('openrouter.freeModelsRecommendation')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWarningPopup(false)}
                className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWarningPopup(false)}
                className="text-sm"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
