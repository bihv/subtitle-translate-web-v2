'use client';

import React, { useState } from 'react';
import { Upload, App } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateFile, parseFile } from '@/lib/file-parser';
import { TranslationFile } from '@/types/translation';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const { Dragger } = Upload;

interface FileUploadProps {
  onFileUploaded: (file: TranslationFile) => void;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, loading = false }) => {
  const { message } = App.useApp();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const { handleError } = useErrorHandler({
    showNotification: true,
    logErrors: true
  });

  const handleFileUpload = async (file: File): Promise<boolean> => {
    setUploading(true);

    try {
      // Validate file
      const isValid = await validateFile(file);
      if (!isValid) {
        await handleError(
          async () => { throw new Error(t.fileUpload.invalidFormat); },
          { errorMessage: t.fileUpload.validationFailed }
        );
        return false;
      }

      // Read file content
      const content = await handleError(
        async () => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error(t.fileUpload.readFailed));
            reader.readAsText(file, 'utf-8');
          });
        },
        { errorMessage: t.fileUpload.readFailed }
      );

      if (!content) return false;

      // Parse file
      const parsed = await handleError(
        async () => parseFile(content),
        { errorMessage: t.fileUpload.parseFailed }
      );

      if (!parsed) return false;

      const translationFile: TranslationFile = {
        name: file.name,
        format: parsed.format,
        content,
        items: parsed.items,
        totalItems: parsed.items.length,
      };

      onFileUploaded(translationFile);


      return false; // Prevent default upload behavior
    } catch (error) {
      await handleError(
        async () => { throw error; },
        { errorMessage: t.fileUpload.uploadFailed }
      );
      return false;
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.srt,.vtt,.ass,.json,.xml',
    beforeUpload: handleFileUpload,
    showUploadList: false,
    disabled: loading || uploading,
  };

  return (
    <div className="file-upload-container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Dragger {...uploadProps} className="subtitle-uploader" style={{ flex: 1 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: '48px', color: '#1677ff' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: '18px', fontWeight: 500 }}>
          {t.uploadDragText}
        </p>
        <p className="ant-upload-hint" style={{ fontSize: '14px', opacity: 0.7 }}>
          {t.uploadClickText}
        </p>
        <p className="ant-upload-hint" style={{ fontSize: '12px', opacity: 0.5 }}>
          {t.uploadSupported} (.srt, .vtt, .ass, .json, .xml)
        </p>
      </Dragger>
    </div>
  );
};