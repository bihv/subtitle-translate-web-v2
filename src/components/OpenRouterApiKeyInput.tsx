'use client';

import { useState, useEffect } from 'react';
import { Input, Button, Checkbox, Space, Typography, App } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateOpenRouterApiKey } from '@/lib/ai-services';

const { Text } = Typography;

// Storage keys for localStorage
const STORAGE_KEY = 'openrouter_api_key';
const SAVE_KEY_PREFERENCE = 'save_openrouter_api_key';

interface OpenRouterApiKeyInputProps {
  value?: string;
  onApiKeyChange: (apiKey: string) => void;
}

export default function OpenRouterApiKeyInput({ value, onApiKeyChange }: OpenRouterApiKeyInputProps) {
  const { message } = App.useApp();
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState<string>(value || '');
  const [saveKey, setSaveKey] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isKeyValid, setIsKeyValid] = useState<boolean | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY);
      const savePreference = localStorage.getItem(SAVE_KEY_PREFERENCE) === 'true';

      if (savedKey) {
        setApiKey(savedKey);
        setSaveKey(savePreference);
        setIsKeyValid(true);
        onApiKeyChange(savedKey);
      }
    }
  }, [onApiKeyChange]);

  // Update local state when prop changes
  useEffect(() => {
    if (value) {
      setApiKey(value);
    }
  }, [value]);

  // Validate API key
  const validateKey = async (key: string): Promise<boolean> => {
    if (!key.trim()) {
      setIsKeyValid(false);
      return false;
    }

    setIsValidating(true);

    try {
      const result = await validateOpenRouterApiKey(key);
      setIsKeyValid(result.valid);
      return result.valid;
    } catch (error) {
      setIsKeyValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  // Handle save key
  const handleSaveKey = async () => {
    const isValid = await validateKey(apiKey);

    if (isValid) {
      if (saveKey) {
        localStorage.setItem(STORAGE_KEY, apiKey);
        localStorage.setItem(SAVE_KEY_PREFERENCE, 'true');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(SAVE_KEY_PREFERENCE, 'false');
      }
      onApiKeyChange(apiKey);
      message.success(t.apiKeyInput.valid);
    } else {
      message.error(t.apiKeyInput.invalid);
    }
  };

  // Handle clear key
  const handleClearKey = () => {
    setApiKey('');
    setIsKeyValid(null);
    setSaveKey(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SAVE_KEY_PREFERENCE);
    onApiKeyChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* API Key Input */}
      <Input.Password
        placeholder={t.apiKeyInput.placeholder}
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
        status={isKeyValid === false ? 'error' : isKeyValid === true ? undefined : undefined}
        prefix={<KeyOutlined />}
        suffix={
          isKeyValid === true ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : isKeyValid === false ? (
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          ) : null
        }
      />

      {/* Get API Key Link */}
      <a
        href="https://openrouter.ai/keys"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 13 }}
      >
        <LinkOutlined /> {t.apiKeyInput.getKeyOpenRouter}
      </a>

      {/* Save Checkbox */}
      <Checkbox
        checked={saveKey}
        onChange={(e) => setSaveKey(e.target.checked)}
        style={{ fontSize: 13 }}
      >
        {t.apiKeyInput.saveInBrowser}
      </Checkbox>

      {/* Action Buttons */}
      <Space>
        {apiKey && (
          <Button size="small" onClick={handleClearKey} disabled={isValidating}>
            {t.clear}
          </Button>
        )}
        <Button
          type="primary"
          size="small"
          onClick={handleSaveKey}
          loading={isValidating}
          disabled={!apiKey || isValidating}
        >
          {isValidating
            ? t.apiKeyInput.validating
            : isKeyValid === true
              ? t.apiKeyInput.update
              : t.apiKeyInput.saveAndUse}
        </Button>
      </Space>
    </div>
  );
}
