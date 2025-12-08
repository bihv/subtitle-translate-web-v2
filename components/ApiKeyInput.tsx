"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, CheckCircle2, Key, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nContext";

// Tên key để lưu trong localStorage
const STORAGE_KEY = "gemini_api_key";
const SAVE_KEY_PREFERENCE = "save_gemini_api_key";

interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}

export default function ApiKeyInput({ onApiKeyChange }: ApiKeyInputProps) {
  const { t } = useI18n();
  const [apiKey, setApiKey] = useState<string>("");
  const [saveKey, setSaveKey] = useState<boolean>(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Tải API key từ localStorage khi component được khởi tạo
  useEffect(() => {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    const savePreference = localStorage.getItem(SAVE_KEY_PREFERENCE) === "true";

    if (savedKey) {
      setApiKey(savedKey);
      setSaveKey(savePreference);
      setIsKeyValid(true);
      setIsCollapsed(true); // Thu gọn section nếu đã có API key
      onApiKeyChange(savedKey); // Thông báo key đã được tải lên
    }
  }, [onApiKeyChange]);

  // Xác thực API key bằng cách gọi một request kiểm tra đơn giản
  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setIsKeyValid(false);
      return false;
    }

    setIsValidating(true);

    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(key);
      // Sử dụng model gemma-3-27b-it để kiểm tra API key
      const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });

      // Gửi một prompt đơn giản để kiểm tra key có hoạt động không
      const result = await model.generateContent("Hello, test");
      const response = await result.response;
      const text = response.text();

      setIsKeyValid(true);
      return true;
    } catch (error) {
      console.error("API key validation error:", error);
      setIsKeyValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async () => {
    const isValid = await validateApiKey(apiKey);

    if (isValid) {
      // Lưu key vào localStorage nếu người dùng chọn lưu
      if (saveKey) {
        localStorage.setItem(STORAGE_KEY, apiKey);
        localStorage.setItem(SAVE_KEY_PREFERENCE, "true");
      } else {
        // Xóa key khỏi localStorage nếu người dùng không chọn lưu
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(SAVE_KEY_PREFERENCE, "false");
      }

      // Thông báo cho component cha biết key đã thay đổi
      onApiKeyChange(apiKey);

      // Thu gọn section sau khi lưu thành công
      setIsCollapsed(true);
    }
  };

  const handleClearKey = () => {
    setApiKey("");
    setIsKeyValid(null);
    setSaveKey(false);
    setIsCollapsed(false);
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
          <Key className="w-5 h-5 text-primary mt-1" />
          <div>
            <h2 className="text-lg font-medium text-foreground">{t('apiKey.title')}</h2>
            {isKeyValid === true && isCollapsed ? (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                {t('apiKey.configuredAndReady')}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('apiKey.description')}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t('apiKey.getKey')} <ExternalLink className="w-3 h-3 ml-1" />
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
              placeholder={t('apiKey.enterKey')}
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
              {t('apiKey.isValid')}
            </div>
          )}

          {isKeyValid === false && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {t('apiKey.isInvalid')}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="save-key"
              checked={saveKey}
              onCheckedChange={(checked) => setSaveKey(checked as boolean)}
            />
            <label
              htmlFor="save-key"
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
    </div>
  );
} 