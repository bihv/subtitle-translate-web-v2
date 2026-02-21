'use client';

import { useState, useEffect } from 'react';
import { Input, Button, Checkbox, Space, App, Form } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, KeyOutlined, CheckCircleOutlined, CloseCircleOutlined, ApiOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

// Storage keys for localStorage
const ENDPOINT_STORAGE_KEY = 'custom_api_endpoint';
const API_KEY_STORAGE_KEY = 'custom_api_key';
const SAVE_PREFERENCE_KEY = 'save_custom_api';

interface CustomApiInputProps {
    onConfigChange: (config: { endpoint: string; apiKey: string } | null) => void;
}

export default function CustomApiInput({ onConfigChange }: CustomApiInputProps) {
    const { message } = App.useApp();
    const { t } = useLanguage();
    const [endpoint, setEndpoint] = useState<string>('');
    const [apiKey, setApiKey] = useState<string>('');
    const [saveConfig, setSaveConfig] = useState<boolean>(false);
    const [isValid, setIsValid] = useState<boolean | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedEndpoint = localStorage.getItem(ENDPOINT_STORAGE_KEY);
            const savedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
            const savePreference = localStorage.getItem(SAVE_PREFERENCE_KEY) === 'true';

            if (savedEndpoint && savedApiKey) {
                setEndpoint(savedEndpoint);
                setApiKey(savedApiKey);
                setSaveConfig(savePreference);
                setIsValid(true);
                onConfigChange({ endpoint: savedEndpoint, apiKey: savedApiKey });
            }
        }
    }, [onConfigChange]);

    // Handle save
    const handleSave = () => {
        if (!endpoint.trim() || !apiKey.trim()) {
            message.error(t.customApi.emptyFieldsError);
            setIsValid(false);
            return;
        }

        // Validate endpoint format
        try {
            new URL(endpoint);
        } catch {
            message.error(t.customApi.invalidEndpoint);
            setIsValid(false);
            return;
        }

        if (saveConfig) {
            localStorage.setItem(ENDPOINT_STORAGE_KEY, endpoint);
            localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
            localStorage.setItem(SAVE_PREFERENCE_KEY, 'true');
        } else {
            localStorage.removeItem(ENDPOINT_STORAGE_KEY);
            localStorage.removeItem(API_KEY_STORAGE_KEY);
            localStorage.setItem(SAVE_PREFERENCE_KEY, 'false');
        }

        setIsValid(true);
        onConfigChange({ endpoint, apiKey });
        message.success(t.customApi.configSaved);
    };

    // Handle clear
    const handleClear = () => {
        setEndpoint('');
        setApiKey('');
        setIsValid(null);
        setSaveConfig(false);
        localStorage.removeItem(ENDPOINT_STORAGE_KEY);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        localStorage.removeItem(SAVE_PREFERENCE_KEY);
        onConfigChange(null);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Endpoint Input */}
            <Input
                placeholder="https://api.openai.com/v1"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                prefix={<ApiOutlined />}
                suffix={
                    isValid === true ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : isValid === false ? (
                        <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                    ) : null
                }
            />

            {/* API Key Input */}
            <Input.Password
                placeholder="API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                prefix={<KeyOutlined />}
            />

            {/* Save Checkbox */}
            <Checkbox
                checked={saveConfig}
                onChange={(e) => setSaveConfig(e.target.checked)}
                style={{ fontSize: 13 }}
            >
                {t.apiKeyInput.saveInBrowser}
            </Checkbox>

            {/* Action Buttons */}
            <Space>
                {(endpoint || apiKey) && (
                    <Button size="small" onClick={handleClear}>
                        {t.clear}
                    </Button>
                )}
                <Button
                    type="primary"
                    size="small"
                    onClick={handleSave}
                    disabled={!endpoint || !apiKey}
                >
                    {isValid === true ? t.apiKeyInput.update : t.apiKeyInput.saveAndUse}
                </Button>
            </Space>
        </div>
    );
}
