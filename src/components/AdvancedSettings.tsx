'use client';

import React from 'react';
import { Form, Select, Input, InputNumber, Space, Tooltip, Modal } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';

const { TextArea } = Input;

interface AdvancedSettingsProps {
    open: boolean;
    onClose: () => void;
}

export default function AdvancedSettings({ open, onClose }: AdvancedSettingsProps) {
    const { t } = useLanguage();

    return (
        <Modal
            title={t.ai.advancedSettings}
            open={open}
            onCancel={onClose}
            footer={null}
            width={500}
        >
            <Form.Item
                name="context"
                label={
                    <Space>
                        <span>{t.ai.context}</span>
                        <Tooltip title={t.ai.contextHelp}>
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Space>
                }
            >
                <TextArea
                    rows={2}
                    placeholder={t.ai.contextPlaceholder}
                />
            </Form.Item>

            <Form.Item
                name="style"
                label={
                    <Space>
                        <span>{t.ai.style}</span>
                        <Tooltip title={t.ai.styleHelp}>
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Space>
                }
            >
                <Select
                    placeholder={t.ai.selectStyle}
                    options={[
                        { value: 'formal', label: t.ai.styleFormal },
                        { value: 'casual', label: t.ai.styleCasual },
                        { value: 'technical', label: t.ai.styleTechnical },
                        { value: 'creative', label: t.ai.styleCreative }
                    ]}
                />
            </Form.Item>

            <Form.Item
                name="batchSize"
                label={
                    <Space>
                        <span>{t.ai.batchSize}</span>
                        <Tooltip title={t.ai.batchSizeHelp}>
                            <InfoCircleOutlined />
                        </Tooltip>
                    </Space>
                }
            >
                <InputNumber
                    min={30}
                    max={100}
                    placeholder="50"
                    style={{ width: '100%' }}
                />
            </Form.Item>
        </Modal>
    );
}
