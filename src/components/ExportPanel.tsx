'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Select,
  Switch,
  Space,
  Typography,
  Row,
  Col,
  Tooltip,
  App
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  GlobalOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationItem, FileFormat, ExportOptions } from '@/types/translation';
import { exportFile, batchExport } from '@/lib/file-exporter';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { Title, Text } = Typography;

interface ExportPanelProps {
  items: TranslationItem[];
  originalFileName: string;
  originalFormat: FileFormat;
  loading?: boolean;
}

export default function ExportPanel({
  items,
  originalFileName,
  originalFormat,
  loading = false
}: ExportPanelProps) {
  const { t } = useLanguage();
  const { message } = App.useApp();
  const [exportFormat, setExportFormat] = useState<FileFormat>(originalFormat);
  const [bilingual, setBilingual] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<FileFormat[]>([originalFormat]);
  const [exporting, setExporting] = useState(false);

  // Sync state with props when file changes
  useEffect(() => {
    setExportFormat(originalFormat);
    setSelectedFormats([originalFormat]);
  }, [originalFormat]);
  const { handleError } = useErrorHandler({
    showNotification: true,
    logErrors: true
  });

  // Statistics
  const totalItems = items.length;
  const translatedItems = items.filter(item => item.translatedText).length;

  // Handle single export
  const handleExport = async () => {
    if (items.length === 0) {
      message.warning(t.warning);
      return;
    }

    setExporting(true);
    try {
      const options: ExportOptions = {
        format: exportFormat,
        bilingual,
        originalFormat: false
      };

      await handleError(
        async () => exportFile(items, options, originalFileName),
        {
          errorMessage: t.exportPanel.exportFailed,

        }
      );
    } finally {
      setExporting(false);
    }
  };

  // Handle batch export
  const handleBatchExport = async () => {
    if (items.length === 0 || selectedFormats.length === 0) {
      message.warning(t.warning);
      return;
    }

    setExporting(true);
    try {
      await handleError(
        async () => batchExport(items, selectedFormats, originalFileName, bilingual),
        {
          errorMessage: t.exportPanel.batchExportFailed,

        }
      );
    } finally {
      setExporting(false);
    }
  };

  // Helper to check if format is subtitle
  const isSubtitleFormat = ['srt', 'vtt', 'ass'].includes(originalFormat);

  // Render content for subtitle formats
  const renderSubtitleExport = () => {
    const formatOptions = [
      { value: 'srt', label: 'SRT', icon: <FileTextOutlined /> },
      { value: 'vtt', label: 'VTT', icon: <GlobalOutlined /> },
      { value: 'ass', label: 'ASS', icon: <SettingOutlined /> },
    ];

    return (
      <>
        {/* Export Mode Toggle */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>{t.exportFormat}:</Text>
            <Switch
              checked={batchMode}
              onChange={setBatchMode}
              checkedChildren={<AppstoreOutlined />}
              unCheckedChildren={<FileTextOutlined />}
            />
            <Text type="secondary">
              {batchMode ? t.exportPanel.batchExport : t.exportPanel.singleExport}
            </Text>
          </Space>
        </div>

        {/* Format Selection */}
        <div style={{ marginBottom: 16 }}>
          {batchMode ? (
            <>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.exportPanel.selectFormats}
              </Text>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder={t.exportPanel.chooseFormats}
                value={selectedFormats}
                onChange={setSelectedFormats}
                options={formatOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                optionRender={(option) => {
                  const opt = formatOptions.find(o => o.value === option.data.value);
                  return (
                    <Space>
                      {opt?.icon}
                      {option.label}
                    </Space>
                  );
                }}
              />
            </>
          ) : (
            <>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                {t.exportFormat}:
              </Text>
              <Select
                style={{ width: '100%' }}
                value={exportFormat}
                onChange={setExportFormat}
                options={formatOptions.map(option => ({
                  value: option.value,
                  label: option.label
                }))}
                optionRender={(option) => {
                  const opt = formatOptions.find(o => o.value === option.data.value);
                  return (
                    <Space>
                      {opt?.icon}
                      {option.label}
                    </Space>
                  );
                }}
              />
            </>
          )}
        </div>

        {/* Bilingual Option */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Switch
              checked={bilingual}
              onChange={setBilingual}
              disabled={translatedItems === 0}
            />
            <Text strong>{t.exportBilingual}</Text>
            <Tooltip title={t.exportPanel.bilingualTooltip}>
              <Text type="secondary">{t.exportPanel.bilingualSubtext}</Text>
            </Tooltip>
          </Space>
        </div>

        {/* Export Buttons */}
        <Space style={{ width: '100%' }} orientation="vertical">
          {batchMode ? (
            <Button
              type="primary"
              size="large"
              block
              icon={<AppstoreOutlined />}
              loading={exporting}
              disabled={loading || selectedFormats.length === 0}
              onClick={handleBatchExport}
            >
              Export {selectedFormats.length} Format{selectedFormats.length > 1 ? 's' : ''}
            </Button>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              icon={<DownloadOutlined />}
              loading={exporting}
              disabled={loading}
              onClick={handleExport}
            >
              {t.download} {exportFormat.toUpperCase()}
            </Button>
          )}

          <Button
            size="large"
            block
            icon={<FileTextOutlined />}
            disabled={loading || exporting}
            onClick={async () => {
              const options: ExportOptions = {
                format: originalFormat,
                bilingual: false,
                originalFormat: true
              };
              await handleError(
                async () => exportFile(items, options, originalFileName),
                {
                  errorMessage: t.exportPanel.quickExportFailed,
                }
              );
            }}
          >
            {t.exportOriginal} ({originalFormat.toUpperCase()})
          </Button>
        </Space>
      </>
    );
  };

  // Render content for data formats (JSON, etc.)
  const renderDataExport = () => {
    return (
      <>
        <div style={{ marginBottom: 24 }}>
          <Text>{t.exportDescription || 'Download your translated file in the same format as the original.'}</Text>
        </div>

        <Space style={{ width: '100%' }} orientation="vertical">
          <Button
            type="primary"
            size="large"
            block
            icon={<DownloadOutlined />}
            loading={exporting}
            disabled={loading}
            onClick={async () => {
              setExporting(true);
              try {
                const options: ExportOptions = {
                  format: originalFormat,
                  bilingual: false,
                  originalFormat: false
                };
                await handleError(
                  async () => exportFile(items, options, originalFileName),
                  {
                    errorMessage: t.exportPanel.exportFailed,
                  }
                );
              } finally {
                setExporting(false);
              }
            }}
          >
            {t.exportPanel.downloadTranslated} {originalFormat.toUpperCase()}
          </Button>

          <Button
            size="large"
            block
            icon={<FileTextOutlined />}
            disabled={loading || exporting}
            onClick={async () => {
              const options: ExportOptions = {
                format: originalFormat,
                bilingual: false,
                originalFormat: true
              };
              await handleError(
                async () => exportFile(items, options, originalFileName),
                {
                  errorMessage: t.exportPanel.quickExportFailed,
                }
              );
            }}
          >
            {t.exportOriginal} ({originalFormat.toUpperCase()})
          </Button>
        </Space>
      </>
    );
  };

  return (
    <Card
      title={
        <Space>
          <DownloadOutlined />
          <span>{t.export}</span>
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      {isSubtitleFormat ? renderSubtitleExport() : renderDataExport()}

      {/* Export Info */}
      <div style={{ marginTop: 16, padding: 12, borderRadius: 6 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>{t.exportPanel.exportInfo}</strong><br />
          • {t.exportPanel.original}: {originalFileName}<br />
          • {t.exportPanel.format}: {batchMode && isSubtitleFormat ? selectedFormats.join(', ').toUpperCase() : (isSubtitleFormat ? exportFormat.toUpperCase() : originalFormat.toUpperCase())}<br />
          • {t.exportPanel.modeLabel}: {isSubtitleFormat && bilingual ? t.exportPanel.bilingual : t.exportPanel.translationOnly}<br />
          • {t.ai.items}: {bilingual || !batchMode || !isSubtitleFormat ? totalItems : translatedItems} {t.ai.items}
        </Text>
      </div>
    </Card>
  );
}