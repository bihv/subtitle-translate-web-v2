import React from 'react';
import { Segmented, Space, Tooltip } from 'antd';
import { UserOutlined, KeyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslationModeSelectorProps {
    value: boolean; // true = use own key (custom), false = guest
    onChange: (useOwnKey: boolean) => void;
    quota?: { remaining: number; limit: number } | null;
}

const TranslationModeSelector: React.FC<TranslationModeSelectorProps> = ({ value, onChange, quota }) => {
    const { t } = useLanguage();

    return (
        <div style={{ marginBottom: 16 }}>
            <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <span>{t.ai?.mode || 'Translation Mode'}:</span>
                    <Segmented
                        value={value ? 'custom' : 'guest'}
                        onChange={(val) => onChange(val === 'custom')}
                        options={[
                            {
                                label: (
                                    <Space>
                                        <UserOutlined />
                                        <span>
                                            {t.ai?.guestMode || 'Guest (Free)'}
                                            {quota && !value && ` (${quota.remaining}/${quota.limit})`}
                                        </span>
                                    </Space>
                                ),
                                value: 'guest'
                            },
                            {
                                label: (
                                    <Space>
                                        <KeyOutlined />
                                        <span>{t.ai?.customKey || 'Custom Key'}</span>
                                    </Space>
                                ),
                                value: 'custom'
                            }
                        ]}
                    />
                </Space>
                {!value && quota && (
                    <Tooltip title={t.translationMode.freeQuotaTooltip.replace('{remaining}', String(quota.remaining))}>
                        <Space>
                            <InfoCircleOutlined style={{ color: quota.remaining > 0 ? '#1890ff' : '#ff4d4f' }} />
                            <span style={{ color: quota.remaining > 0 ? '#1890ff' : '#ff4d4f', fontSize: '12px' }}>
                                {quota.remaining > 0 ? t.translationMode.freeQuotaAvailable : t.translationMode.dailyLimitReached}
                            </span>
                        </Space>
                    </Tooltip>
                )}
            </Space>
        </div>
    );
};

export default TranslationModeSelector;
