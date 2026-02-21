'use client';

import React, { useState, useRef } from 'react';
import {
  App,
  Card,
  Form,
  Button,
  Space,
  Row,
  Col,
  message,
  Alert
} from 'antd';
import {
  PlayCircleOutlined,
  StopOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

import { TranslationService, validateApiKey } from '@/lib/ai-services';
import { TranslationError, TranslationErrorType } from '@/lib/errors';
import {
  TranslationItem,
  TranslationConfig,
  TranslationProgress,
  AIModel
} from '@/types/translation';
import GeminiApiKeyInput from './GeminiApiKeyInput';
import OpenRouterApiKeyInput from './OpenRouterApiKeyInput';
import CustomApiInput from './CustomApiInput';
import ModelSelector from './ModelSelector';
import LanguageSelector from './LanguageSelector';
import AdvancedSettings from './AdvancedSettings';
import TranslationProgressBar from './TranslationProgressBar';
import TranslationModeSelector from './TranslationModeSelector';

interface AITranslationProps {
  items: TranslationItem[];
  onItemUpdate?: (item: TranslationItem, index: number) => void;
  onProgress?: (progress: TranslationProgress) => void;
  onTranslationComplete?: () => void;
}

export default function AITranslation({
  items,
  onItemUpdate,
  onTranslationComplete
}: AITranslationProps) {
  const { t } = useLanguage();

  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useOwnKey, setUseOwnKey] = useState(false); // Default to Guest Mode
  const [dailyQuota, setDailyQuota] = useState<{ remaining: number; limit: number } | null>(null);

  const fetchQuota = async () => {
    try {
      const res = await fetch('/api/translate/quota');
      if (res.ok) {
        const data = await res.json();
        setDailyQuota({ remaining: data.remaining, limit: data.limit || 5 });
      }
    } catch (e) {
      console.error('Failed to fetch quota', e);
    }
  };

  React.useEffect(() => {
    if (!useOwnKey) {
      fetchQuota();
    }
  }, [useOwnKey]);

  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>('');
  const [customConfig, setCustomConfig] = useState<{ endpoint: string; apiKey: string } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Watch provider for conditional API key input
  const provider = Form.useWatch('provider', form);

  // Handle form submission
  const handleTranslate = async (values: any) => {
    // Create new AbortController for this translation session
    abortControllerRef.current = new AbortController();

    try {
      let apiKey = '';
      let modelId = '';
      let providerType = provider;
      let customEndpoint = '';

      if (useOwnKey) {
        // Custom Key Mode Validation
        if (provider === 'custom') {
          if (!customConfig) {
            throw new Error(t.ai.configureEndpointAndKey);
          }
          apiKey = customConfig.apiKey;
          customEndpoint = customConfig.endpoint;
          modelId = values.customModel || 'gpt-4o-mini';
        } else {
          if (!selectedModel) {
            throw new Error(t.ai.selectModel);
          }
          apiKey = selectedModel.provider === 'google' ? geminiApiKey : openRouterApiKey;
          modelId = selectedModel.id;
          providerType = selectedModel.provider;

          if (!apiKey) {
            throw new Error(t.ai.enterApiKey);
          }

          if (!validateApiKey(selectedModel.provider, apiKey)) {
            throw new Error(t.ai.invalidApiKey);
          }
        }
      } else {
        // Guest Mode Defaults
        // Force Google Gemini for guest mode usually, or whichever is configured on server
        // For now, let's assume we pass the selected model config, but NO API Key
        // The server route will check if it supports the requested provider/model

        if (!selectedModel) {
          // Default to a safe model if none selected (though UI should enforce selection)
          modelId = 'gemini-1.5-flash';
          providerType = 'google';
        } else {
          modelId = selectedModel.id;
          providerType = selectedModel.provider;
        }
        // apiKey remains empty
      }

      setIsTranslating(true);
      setProgress({
        total: items.length,
        completed: 0,
        status: 'preparing'
      });

      const service = new TranslationService(
        providerType === 'google' ? apiKey : undefined,
        providerType === 'openrouter' ? apiKey : undefined,
        providerType === 'custom' ? { endpoint: customEndpoint, apiKey } : undefined
      );

      const config: TranslationConfig = {
        provider: providerType,
        model: modelId,
        apiKey: apiKey, // Empty in guest mode
        targetLanguage: values.targetLanguage,
        context: values.context,
        style: values.style,
        batchSize: values.batchSize || 50,
        customEndpoint: customEndpoint || undefined
      };

      const translatedItems = await service.translateSubtitles(
        items,
        config,
        (progressUpdate) => setProgress(progressUpdate),
        (translatedItem, index) => onItemUpdate?.(translatedItem, index),
        abortControllerRef.current?.signal
      );

      // Only set completed if not aborted
      if (!abortControllerRef.current?.signal.aborted) {
        const actualCompleted = translatedItems.filter(s => s.status === 'completed').length;
        setProgress({
          total: items.length,
          completed: actualCompleted,
          status: 'completed'
        });

        onTranslationComplete?.();

        // Refresh quota after successful translation if in guest mode
        if (!useOwnKey) {
          fetchQuota();
        }
      }

    } catch (error: any) {
      if (!abortControllerRef.current?.signal.aborted) {
        let errorMessage = error.message || t.ai.error;

        // Specialized error handling
        if (error instanceof TranslationError) {
          if (error.code === TranslationErrorType.QUOTA_EXCEEDED) {
            errorMessage = t.ai.quotaExceeded;
            message.error(errorMessage, 5);
          } else if (error.code === TranslationErrorType.API_KEY_INVALID) {
            errorMessage = t.ai.apiKeyExpired;
          }
          // Expected errors — warn only (avoids Next.js dev overlay)
          console.warn('Translation stopped:', errorMessage);
        } else {
          // Unexpected errors — log fully
          console.error('Translation error:', error);
        }

        setProgress({
          total: items.length,
          completed: 0,
          status: 'error',
          error: errorMessage
        });
      }
    }



    setIsTranslating(false);
  };

  // Stop translation
  const handleStop = () => {
    // Abort the current translation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTranslating(false);
    setProgress(null);
    message.info(t.ai.translationStopped);
  };

  return (
    <Card
      title={
        <Space>
          <SettingOutlined />
          <span>{t.ai.title}</span>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => setShowAdvanced(true)}
        >
          {t.ai.advancedSettings}
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleTranslate}
        initialValues={{
          targetLanguage: 'vi',
          batchSize: 50
        }}
      >
        <TranslationModeSelector
          value={useOwnKey}
          onChange={(val) => {
            setUseOwnKey(val);
            // Reset/clear validation errors when switching modes
            form.validateFields(['provider']);
          }}
          quota={dailyQuota}
        />

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <ModelSelector
              form={form}
              onModelSelect={setSelectedModel}
              guestMode={!useOwnKey}
            />
          </Col>
          <Col xs={24} md={8}>
            <LanguageSelector form={form} />
          </Col>
          <Col xs={24} md={8}>
            {useOwnKey ? (
              <Form.Item label={t.ai.enterApiKey} required>
                {provider === 'google' && (
                  <GeminiApiKeyInput onApiKeyChange={setGeminiApiKey} />
                )}
                {provider === 'openrouter' && (
                  <OpenRouterApiKeyInput
                    value={openRouterApiKey}
                    onApiKeyChange={setOpenRouterApiKey}
                  />
                )}
                {provider === 'custom' && (
                  <CustomApiInput onConfigChange={setCustomConfig} />
                )}
              </Form.Item>
            ) : (
              <Form.Item label={t.ai.guestAccess}>
                <Alert
                  description={t.ai.guestAccessDescription}
                  type="info"
                  showIcon
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <AdvancedSettings open={showAdvanced} onClose={() => setShowAdvanced(false)} />

        <TranslationProgressBar progress={progress} />

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<PlayCircleOutlined />}
              loading={isTranslating}
              disabled={items.length === 0}
            >
              {isTranslating ? t.ai.translating : t.startTranslation}
            </Button>

            {isTranslating && (
              <Button
                danger
                icon={<StopOutlined />}
                onClick={handleStop}
              >
                {t.ai.stop}
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}