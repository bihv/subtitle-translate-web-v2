'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Layout,
} from 'antd';
import {
  TranslationOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  SwapOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FileUpload } from '@/components/FileUpload';
import AITranslation from '@/components/AITranslation';
import TranslationTable from '@/components/TranslationTable';
import VideoPreview from '@/components/VideoPreview';
import { TranslationFile, TranslationItem } from '@/types/translation';
import ExportPanel from '@/components/ExportPanel';
import styles from './page.module.css';

const { Content } = Layout;
const { Title, Text } = Typography;

type FlowStep = 'upload' | 'settings' | 'translating' | 'results';

export default function Home() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [currentFile, setCurrentFile] = useState<TranslationFile | null>(null);
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [selectedItem, setSelectedItem] = useState<TranslationItem | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('upload');

  // Refs for auto-scroll
  const settingsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to section when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      let target: HTMLDivElement | null = null;
      if (currentStep === 'settings') target = settingsRef.current;
      if (currentStep === 'translating') target = tableRef.current;
      if (currentStep === 'results') target = resultsRef.current;

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Handle file upload
  const handleFileUploaded = useCallback((file: TranslationFile) => {
    setCurrentFile(file);
    setItems(file.items);
    setCurrentStep('settings');
  }, []);

  // Handle item update
  const handleItemUpdate = useCallback((id: string, updates: Partial<TranslationItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  // Handle streaming translation update
  const handleStreamingUpdate = useCallback((item: TranslationItem, index: number) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = item;
      return updated;
    });
    // Only advance to translating step when we get actual translated content
    if (item.status === 'completed') {
      setCurrentStep(prev => prev === 'settings' ? 'translating' : prev);
    }
  }, []);

  // Handle video time update
  const handleVideoTimeUpdate = useCallback((time: number) => {
    setCurrentVideoTime(time);
  }, []);

  // Handle item click from video
  const handleItemClick = useCallback((item: TranslationItem) => {
    setSelectedItem(item);
  }, []);

  const handleTranslationComplete = useCallback(() => {
    setCurrentStep('results');
  }, []);

  // Handle start over
  const handleStartOver = useCallback(() => {
    setCurrentFile(null);
    setItems([]);
    setCurrentStep('upload');
    setSelectedItem(null);
    setCurrentVideoTime(0);
  }, []);

  // Handle change file (keep settings, just re-upload)
  const handleChangeFile = useCallback(() => {
    setCurrentFile(null);
    setItems([]);
    setCurrentStep('upload');
  }, []);

  const isSubtitle = currentFile ? ['srt', 'vtt', 'ass'].includes(currentFile.format) : true;

  // Format badge color
  const getFormatColor = (format: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      srt: { bg: 'rgba(82, 196, 26, 0.1)', text: '#52c41a', border: '#52c41a' },
      vtt: { bg: 'rgba(24, 144, 255, 0.1)', text: '#1890ff', border: '#1890ff' },
      ass: { bg: 'rgba(114, 46, 209, 0.1)', text: '#722ed1', border: '#722ed1' },
      json: { bg: 'rgba(250, 173, 20, 0.1)', text: '#faad14', border: '#faad14' },
      xml: { bg: 'rgba(245, 108, 108, 0.1)', text: '#f5222d', border: '#f5222d' },
    };
    return colors[format] || colors.srt;
  };

  return (
    <Content style={{ padding: '24px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Step 1: Upload (Hero Layout) */}
        {currentStep === 'upload' && (
          <div className={`${styles.stepSection} ${styles.uploadHero}`}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <TranslationOutlined style={{
                fontSize: 56,
                color: '#1677ff',
                marginBottom: 16,
                display: 'block'
              }} />
              <Title level={2} style={{ marginBottom: 8 }}>
                {t.flow.heroTitle}
              </Title>
              <Text type="secondary" style={{ fontSize: 16 }}>
                {t.flow.heroSubtitle}
              </Text>
            </div>
            <FileUpload onFileUploaded={handleFileUploaded} />
          </div>
        )}

        {/* Step 2+: File Badge + Settings */}
        {currentStep !== 'upload' && currentFile && (
          <div ref={settingsRef}>
            {/* File Badge */}
            <div className={styles.stepSectionFade} style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
              {(() => {
                const fc = getFormatColor(currentFile.format);
                return (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 24px',
                      borderRadius: 14,
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)'
                        : 'linear-gradient(135deg, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0.01) 100%)',
                      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                      borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
                      borderLeft: `4px solid ${fc.border}`,
                      backdropFilter: 'blur(8px)',
                      boxShadow: isDark
                        ? '0 2px 12px rgba(0,0,0,0.3)'
                        : '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                  >
                    {/* Format Badge */}
                    <div style={{
                      background: fc.bg,
                      color: fc.text,
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: 0.5,
                      lineHeight: 1,
                    }}>
                      {currentFile.format.toUpperCase()}
                    </div>

                    {/* File Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text strong style={{ display: 'block', lineHeight: 1.3, fontSize: 14 }}>
                        {currentFile.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {currentFile.totalItems} {t.ai.items}
                      </Text>
                    </div>

                    {/* Change File */}
                    <Button
                      type="text"
                      size="small"
                      icon={<SwapOutlined />}
                      onClick={handleChangeFile}
                      style={{
                        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.35)',
                        fontSize: 12,
                      }}
                    >
                      {t.flow.changeFile}
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* AI Settings */}
            {(currentStep === 'settings' || currentStep === 'translating' || currentStep === 'results') && (
              <div
                className={`${styles.stepSection} ${currentStep !== 'settings' ? styles.settingsCollapsed : styles.settingsActive}`}
                style={{ marginBottom: 24 }}
              >
                <AITranslation
                  items={items}
                  onItemUpdate={handleStreamingUpdate}
                  onTranslationComplete={handleTranslationComplete}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 3: Translation Table */}
        {(currentStep === 'translating' || currentStep === 'results') && (
          <div ref={tableRef} className={styles.stepSection} style={{ marginBottom: 24 }}>
            <Card
              title={
                <Space>
                  <FileTextOutlined />
                  {currentFile ? `${t.originalText} - ${currentFile.name}` : t.originalText}
                </Space>
              }
              size="small"
            >
              <TranslationTable
                items={items}
                format={currentFile?.format || 'srt'}
                onUpdate={handleItemUpdate}
                loading={loading}
                selectedItem={selectedItem}
                currentVideoTime={currentVideoTime}
                onRowClick={handleItemClick}
              />
            </Card>
          </div>
        )}

        {/* Step 4: Results - Export & Video Preview */}
        {currentStep === 'results' && (
          <div ref={resultsRef} className={styles.stepSection}>
            {/* Ready Badge */}
            <div style={{
              textAlign: 'center',
              marginBottom: 24,
              padding: '12px 0'
            }}>
              <Space>
                <CheckCircleOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                  {t.flow.readyToExport}
                </Text>
              </Space>
            </div>

            <Row gutter={[16, 16]} style={{ display: 'flex' }}>
              <Col xs={24} md={isSubtitle ? 8 : 24} style={{ display: 'flex' }}>
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <ExportPanel
                    items={items}
                    originalFileName={currentFile?.name || 'translation'}
                    originalFormat={currentFile?.format || 'srt'}
                    loading={loading}
                  />
                </div>
              </Col>

              {isSubtitle && (
                <Col xs={24} md={16} style={{ display: 'flex' }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <VideoPreview
                      items={items}
                      onTimeUpdate={handleVideoTimeUpdate}
                      onSubtitleClick={handleItemClick}
                    />
                  </div>
                </Col>
              )}
            </Row>

            {/* Start Over button */}
            <div style={{ textAlign: 'center', marginTop: 32, marginBottom: 16 }}>
              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleStartOver}
              >
                {t.flow.startOver}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Content>
  );
}
