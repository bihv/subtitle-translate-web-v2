'use client';

import React, { useState, useEffect } from 'react';
import { Form, Select, Space, Input } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIModel } from '@/types/translation';
import { GEMINI_MODELS, fetchOpenRouterModels, GUEST_ALLOWED_GEMINI_MODELS } from '@/lib/ai-services';

const { Text } = require('antd').Typography;

interface ModelSelectorProps {
    form: any;
    onModelSelect: (model: AIModel | null) => void;
    guestMode?: boolean;
}

export default function ModelSelector({
    form,
    onModelSelect,
    guestMode = false
}: ModelSelectorProps) {
    const { t } = useLanguage();

    // Self-managed state
    const [openRouterModels, setOpenRouterModels] = useState<AIModel[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

    // Watch form values for reactive updates
    const provider = Form.useWatch('provider', form);
    const modelValue = Form.useWatch('model', form);

    // Fetch OpenRouter models on mount
    useEffect(() => {
        const loadModels = async () => {
            setIsLoadingModels(true);
            try {
                const models = await fetchOpenRouterModels();
                setOpenRouterModels(models);
            } catch (error) {
                console.error('Failed to load OpenRouter models:', error);
            } finally {
                setIsLoadingModels(false);
            }
        };
        loadModels();
    }, []);

    // Filter models based on guest mode
    const filteredGeminiModels = guestMode
        ? GEMINI_MODELS.filter(m => GUEST_ALLOWED_GEMINI_MODELS.includes(m.id))
        : GEMINI_MODELS;

    const filteredOpenRouterModels = guestMode
        ? openRouterModels.filter(m => m.free === true)
        : openRouterModels;

    // Combined models (from filtered lists)
    const allModels = [...filteredGeminiModels, ...filteredOpenRouterModels];

    // Separate free and paid OpenRouter models (from filtered list)
    const freeOpenRouterModels = filteredOpenRouterModels.filter(m => m.free === true);
    const paidOpenRouterModels = filteredOpenRouterModels.filter(m => m.free !== true);

    // Sync selectedModel with form's model value when it changes
    useEffect(() => {
        if (modelValue) {
            const model = allModels.find(m => m.id === modelValue);
            if (model) {
                if (model.id !== selectedModel?.id) {
                    setSelectedModel(model);
                    onModelSelect(model);
                }
            } else {
                // Current model ID is not in the allowed list (e.g. switched to guest mode)
                // We should reset selection if it's invalid
                // IMPORTANT: Only reset if we actually have models loaded (to avoid reset on initial load)
                if ((provider === 'google' && filteredGeminiModels.length > 0) ||
                    (provider === 'openrouter' && filteredOpenRouterModels.length > 0)) {

                    // Don't loop infinitely
                    if (selectedModel !== null) {
                        setSelectedModel(null);
                        form.setFieldsValue({ model: undefined });
                        onModelSelect(null);
                    }
                }
            }
        } else if (!modelValue && selectedModel) {
            setSelectedModel(null);
            onModelSelect(null);
        }
    }, [modelValue, allModels, provider, selectedModel]); // Added dependencies

    // Handle provider change
    const handleProviderChange = () => {
        form.setFieldsValue({ model: undefined });
        setSelectedModel(null);
        onModelSelect(null);
    };

    // Handle model selection
    const handleModelChange = (modelId: string) => {
        const model = allModels.find(m => m.id === modelId);
        setSelectedModel(model || null);
        form.setFieldsValue({ model: modelId });
        onModelSelect(model || null);
    };

    return (
        <>
            <Form.Item
                name="provider"
                label={t.ai.provider}
                rules={[{ required: true, message: t.ai.selectProvider }]}
            >
                <Select
                    placeholder={t.ai.selectProvider}
                    onChange={handleProviderChange}
                    options={[
                        { value: 'google', label: 'Google Gemini' },
                        { value: 'openrouter', label: 'OpenRouter' },
                        ...(!guestMode ? [{ value: 'custom', label: 'Custom (OpenAI Compatible)' }] : [])
                    ]}
                />
            </Form.Item>

            {provider !== 'custom' ? (
                <Form.Item
                    name="model"
                    label={t.ai.model}
                    rules={[{ required: true, message: t.ai.selectModel }]}
                >
                    <Select
                        placeholder={t.ai.selectModel}
                        onChange={handleModelChange}
                        disabled={!provider}
                        loading={provider === 'openrouter' && isLoadingModels}
                        showSearch
                        optionFilterProp="label"
                        options={(
                            provider === 'google'
                                ? filteredGeminiModels.map(model => ({
                                    value: model.id,
                                    label: model.name
                                }))
                                : provider === 'openrouter'
                                    ? [
                                        ...(freeOpenRouterModels.length > 0
                                            ? [{
                                                label: <Text type="success" strong>🆓 Free Models</Text>,
                                                options: freeOpenRouterModels.map(model => ({
                                                    value: model.id,
                                                    label: model.name
                                                }))
                                            }]
                                            : []),
                                        ...(paidOpenRouterModels.length > 0
                                            ? [{
                                                label: <Text type="warning" strong>💰 Paid Models</Text>,
                                                options: paidOpenRouterModels.map(model => ({
                                                    value: model.id,
                                                    label: model.name,
                                                    pricing: model.pricing
                                                }))
                                            }]
                                            : [])
                                    ]
                                    : []
                        ) as any}
                        optionRender={(option) => {
                            const data = option.data as any;
                            return (
                                <Space>
                                    <span>{option.label}</span>
                                    {data.pricing && (
                                        <Text type="secondary" style={{ fontSize: '10px' }}>
                                            ${(data.pricing.prompt * 1000000).toFixed(2)}/M
                                        </Text>
                                    )}
                                    {provider === 'openrouter' && !data.pricing && freeOpenRouterModels.some(m => m.id === data.value) && (
                                        <Text type="success" style={{ fontSize: '11px' }}>FREE</Text>
                                    )}
                                </Space>
                            );
                        }}
                    />
                </Form.Item>
            ) : (
                <Form.Item
                    name="customModel"
                    label={t.ai.model}
                    rules={[{ required: true, message: t.ai.selectModel }]}
                    initialValue="gpt-4o-mini"
                >
                    <Input placeholder="gpt-4o-mini, gpt-4o, claude-3-haiku..." />
                </Form.Item>
            )}
        </>
    );
}
