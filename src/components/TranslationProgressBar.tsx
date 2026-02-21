'use client';

import React from 'react';
import { Progress, Typography } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationProgress } from '@/types/translation';

const { Text } = Typography;

interface TranslationProgressBarProps {
    progress: TranslationProgress | null;
}

export default function TranslationProgressBar({ progress }: TranslationProgressBarProps) {
    const { t } = useLanguage();

    if (!progress) return null;

    const percentage = Math.round((progress.completed / progress.total) * 100);

    return (
        <div style={{ marginBottom: 16 }}>
            <Progress
                percent={percentage}
                status={progress.status === 'error' ? 'exception' : 'active'}
                format={() => `${progress.completed}/${progress.total}`}
            />
            <Text type="secondary">
                {progress.status === 'preparing' && t.ai.preparing}
                {progress.status === 'translating' && t.ai.translating}
                {progress.status === 'completed' && t.ai.completed}
                {progress.status === 'error' && (
                    <span style={{ color: '#ff4d4f' }}>
                        {progress.error || t.ai.error}
                    </span>
                )}
            </Text>
        </div>
    );
}
