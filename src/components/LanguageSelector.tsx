'use client';

import React, { useState } from 'react';
import { Form, Select, Space, Divider, App } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';



// Language options with flags
export const LANGUAGE_OPTIONS = [
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'pt', label: 'Português', flag: '🇵🇹' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'ar', label: 'العربية', flag: '🇸🇦' },
    { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'th', label: 'ไทย', flag: '🇹🇭' },
    { value: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
    { value: 'it', label: 'Italiano', flag: '🇮🇹' },
    { value: 'nl', label: 'Nederlands', flag: '🇳🇱' },
    { value: 'pl', label: 'Polski', flag: '🇵🇱' },
    { value: 'tr', label: 'Türkçe', flag: '🇹🇷' },
    { value: 'sv', label: 'Svenska', flag: '🇸🇪' },
    { value: 'da', label: 'Dansk', flag: '🇩🇰' },
    { value: 'no', label: 'Norsk', flag: '🇳🇴' },
    { value: 'fi', label: 'Suomi', flag: '🇫🇮' },
    { value: 'cs', label: 'Čeština', flag: '🇨🇿' },
    { value: 'hu', label: 'Magyar', flag: '🇭🇺' },
    { value: 'ro', label: 'Română', flag: '🇷🇴' },
    { value: 'uk', label: 'Українська', flag: '🇺🇦' },
    { value: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
    { value: 'he', label: 'עברית', flag: '🇮🇱' },
    { value: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
    { value: 'tl', label: 'Tagalog', flag: '🇵🇭' }
];

interface LanguageSelectorProps {
    form: any;
}

export default function LanguageSelector({ form }: LanguageSelectorProps) {
    const { t } = useLanguage();
    const { message } = App.useApp();

    // Self-managed search state
    const [searchValue, setSearchValue] = useState('');

    return (
        <Form.Item
            name="targetLanguage"
            label={
                <Space>
                    <span>{t.targetLanguage}</span>
                    <Tooltip title={t.languageSelector.tooltip}>
                        <InfoCircleOutlined style={{ fontSize: '12px' }} />
                    </Tooltip>
                </Space>
            }
            rules={[{ required: true, message: t.ai.selectTargetLanguage }]}
        >
            <Select
                placeholder={t.ai.selectTargetLanguage}
                showSearch
                optionFilterProp="txtLabel"
                searchValue={searchValue}
                onSearch={setSearchValue}
                options={LANGUAGE_OPTIONS.map(lang => ({
                    value: lang.value,
                    label: (
                        <Space>
                            <span style={{ fontSize: '18px' }}>{lang.flag}</span>
                            <span>{lang.label}</span>
                        </Space>
                    ),
                    txtLabel: lang.label
                }))}
                popupRender={(menu) => (
                    <>
                        {menu}
                        {searchValue && !LANGUAGE_OPTIONS.some(lang =>
                            lang.label.toLowerCase().includes(searchValue.toLowerCase())
                        ) && (
                                <>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <div
                                        style={{
                                            padding: '8px 12px',
                                            color: '#1890ff',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (searchValue.trim()) {
                                                form.setFieldsValue({ targetLanguage: searchValue.trim() });
                                                setSearchValue('');
                                                message.success(`${t.languageSelector.customLanguageSelected}: ${searchValue.trim()}`);
                                            }
                                        }}
                                    >
                                        <span>➕</span>
                                        <span><strong>{searchValue}</strong> {t.languageSelector.addCustomLanguage}</span>
                                    </div>
                                </>
                            )}
                    </>
                )}
            />
        </Form.Item>
    );
}
