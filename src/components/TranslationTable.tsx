'use client';

import React, { useState, useRef } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  message
} from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { TranslationItem, TranslationStatus, FileFormat } from '@/types/translation';

const { Text } = Typography;
const { TextArea } = Input;

interface TranslationTableProps {
  items: TranslationItem[];
  format: FileFormat;
  onUpdate: (id: string, updates: Partial<TranslationItem>) => void;
  loading?: boolean;
  selectedItem?: TranslationItem | null;
  currentVideoTime?: number;
  onRowClick?: (item: TranslationItem) => void;
}

interface EditingCell {
  id: string;
  field: 'originalText' | 'translatedText';
  value: string;
}

export default function TranslationTable({
  items,
  format,
  onUpdate,
  loading = false,
  selectedItem,
  currentVideoTime,
  onRowClick
}: TranslationTableProps) {
  const { t } = useLanguage();
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const inputRef = useRef<any>(null);

  // Status color mapping
  const getStatusColor = (status: TranslationStatus): string => {
    switch (status) {
      case 'pending': return 'default';
      case 'translating': return 'processing';
      case 'completed': return 'success';
      case 'error': return 'error';
      case 'edited': return 'warning';
      default: return 'default';
    }
  };

  // Format time display
  const formatTime = (timeStr: string): string => {
    return timeStr.replace(/\./g, ','); // Convert to standard subtitle format
  };

  // Handle cell edit start
  const handleEditStart = (id: string, field: 'originalText' | 'translatedText', currentValue: string) => {
    setEditingCell({ id, field, value: currentValue });
    // Focus input after state update
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle cell edit save
  const handleEditSave = () => {
    if (!editingCell) return;

    const { id, field, value } = editingCell;
    onUpdate(id, {
      [field]: value,
      status: 'edited' as TranslationStatus
    });

    setEditingCell(null);

  };

  // Handle cell edit cancel
  const handleEditCancel = () => {
    setEditingCell(null);
  };

  // Render editable cell
  const renderEditableCell = (
    text: string,
    record: TranslationItem,
    field: 'originalText' | 'translatedText'
  ) => {
    const isEditing = editingCell?.id === record.id && editingCell?.field === field;

    if (isEditing) {
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <TextArea
            ref={inputRef}
            value={editingCell.value}
            onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleEditSave();
              }
            }}
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ flex: 1 }}
          />
          <Space orientation="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              size="small"
              icon={<SaveOutlined />}
              onClick={handleEditSave}
            />
            <Button
              size="small"
              icon={<CloseOutlined />}
              onClick={handleEditCancel}
            />
          </Space>
        </div>
      );
    }

    return (
      <div
        style={{
          minHeight: '32px',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s'
        }}
        onClick={() => handleEditStart(record.id, field, text || '')}
      >
        <Text
          style={{
            whiteSpace: 'pre-wrap',
            fontStyle: (field === 'translatedText' && !text) ? 'italic' : 'normal'
          }}
        >
          {text || (field === 'translatedText' && record.status === 'translating' ? t.ai.translating : '-')}
        </Text>
        <EditOutlined style={{ marginLeft: 8, opacity: 0.5 }} />
      </div>
    );
  };


  // Table columns
  const columns: ColumnsType<TranslationItem> = [
    {
      title: t.index,
      dataIndex: 'index',
      key: 'index',
      width: 60,
      align: 'center',
      fixed: 'left',
      render: (index: number) => (
        <Text strong>{index}</Text>
      )
    }
  ];

  // Add format-specific columns
  if (format === 'json' || format === 'xml') {
    columns.push({
      title: 'Key',
      key: 'key',
      width: 200,
      render: (_, record: TranslationItem) => (
        <Text code>{record.metadata?.key || '-'}</Text>
      )
    });
  } else {
    // Subtitle formats (srt, vtt, ass)
    columns.push({
      title: t.ai.timeRange,
      key: 'timeRange',
      width: 160,
      align: 'center',
      render: (_, record: TranslationItem) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <Text code style={{ fontSize: '12px' }}>{formatTime(record.startTime)}</Text>
          <Text type="secondary" style={{ fontSize: '14px' }}>↓</Text>
          <Text code style={{ fontSize: '12px' }}>{formatTime(record.endTime)}</Text>
        </div>
      )
    });
  }

  // Add common text columns
  columns.push(
    {
      title: t.originalText,
      dataIndex: 'originalText',
      key: 'originalText',
      render: (text: string, record: TranslationItem) => renderEditableCell(text, record, 'originalText')
    },
    {
      title: t.translatedText,
      dataIndex: 'translatedText',
      key: 'translatedText',
      render: (text: string, record: TranslationItem) => renderEditableCell(text, record, 'translatedText')
    },
    {
      title: t.status,
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: TranslationStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    }
  );

  // Helper function to check if subtitle is currently active
  const isSubtitleActive = (item: TranslationItem): boolean => {
    if (!currentVideoTime || format === 'json' || format === 'xml') return false;

    const startSeconds = parseTimeToSeconds(item.startTime);
    const endSeconds = parseTimeToSeconds(item.endTime);

    return currentVideoTime >= startSeconds && currentVideoTime <= endSeconds;
  };

  // Helper function to parse time string to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.replace(',', '.').split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      const seconds = parseFloat(parts[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  // Handle subtitle row click for video synchronization
  const handleRowClick = (item: TranslationItem) => {
    if (onRowClick) {
      onRowClick(item);
    }
  };

  // Helper function to get status text
  const getStatusText = (status: TranslationStatus): string => {
    switch (status) {
      case 'pending': return t.pending;
      case 'translating': return t.translating;
      case 'completed': return t.completed;
      case 'error': return t.error;
      case 'edited': return t.edited;
      default: return status;
    }
  };

  return (
    <>
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={false}
        virtual
        scroll={{ y: 600 }}
        size="small"
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: 'pointer' }
        })}
      />
    </>
  );
}