'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Upload,
  Switch,
  Row,
  Col,
  App,
  Tag
} from 'antd';
import {
  PlayCircleOutlined,
  UploadOutlined,
  LinkOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { TranslationItem } from '@/types/translation';

const { Text } = Typography;
const { Dragger } = Upload;

interface VideoPreviewProps {
  items?: TranslationItem[];
  onTimeUpdate?: (currentTime: number) => void;
  onSubtitleClick?: (item: TranslationItem) => void;
}

export default function VideoPreview({
  items = [],
  onTimeUpdate,
  onSubtitleClick
}: VideoPreviewProps) {
  const { t } = useLanguage();
  const { message } = App.useApp();
  const { handleError } = useErrorHandler({
    showNotification: true,
    logErrors: true
  });

  // Video refs and state
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [vttUrl, setVttUrl] = useState<string | null>(null);

  // Current subtitle tracking
  const [currentSubtitle, setCurrentSubtitle] = useState<TranslationItem | null>(null);

  // Convert subtitles to WebVTT format
  const convertItemsToVTT = (items: TranslationItem[]): string | null => {
    // Check if items have timing info (JSON/XML might not)
    const hasTiming = items.some(item => item.startTime && item.endTime);
    if (!hasTiming) return null;

    let vttContent = "WEBVTT\n\n";

    items.forEach(item => {
      // Skip items without timing
      if (!item.startTime || !item.endTime) return;

      const startTime = item.startTime.replace(',', '.');
      const endTime = item.endTime.replace(',', '.');

      let text = item.translatedText || item.originalText;

      // If both original and translated exist, show both
      if (item.translatedText && item.originalText) {
        text = `${item.translatedText}\n${item.originalText}`;
      }

      vttContent += `${item.id}\n${startTime} --> ${endTime}\n${text}\n\n`;
    });

    return vttContent;
  };

  // Create VTT URL
  const createVTTUrl = (content: string): string => {
    const blob = new Blob([content], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  };

  // Update VTT URL when subtitles change
  useEffect(() => {
    if (items.length > 0) {
      // Revoke old URL
      if (vttUrl) URL.revokeObjectURL(vttUrl);

      // Create new VTT
      const vttContent = convertItemsToVTT(items);
      if (vttContent) {
        const newVttUrl = createVTTUrl(vttContent);
        setVttUrl(newVttUrl);
      } else {
        setVttUrl(null);
      }
    }

    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl);
    };
  }, [items]);

  // Update video track when VTT URL changes
  useEffect(() => {
    if (!videoRef.current || !vttUrl) {
      // Clear tracks if no VTT
      if (videoRef.current) {
        while (videoRef.current.textTracks.length > 0) {
          const track = videoRef.current.querySelector('track');
          if (track) track.remove();
        }
      }
      return;
    }

    // Remove existing tracks
    while (videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.querySelector('track');
      if (track) track.remove();
    }

    // Add new track
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = 'Subtitles';
    track.srclang = 'vi';
    track.src = vttUrl;
    track.default = true;

    videoRef.current.appendChild(track);

    // Activate track
    setTimeout(() => {
      if (videoRef.current && videoRef.current.textTracks[0]) {
        videoRef.current.textTracks[0].mode = 'showing';
      }
    }, 100);
  }, [vttUrl, videoSrc]);

  // Utility function to parse time string to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseFloat(seconds);
    }
    return 0;
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);

      // Find current subtitle
      const current = items.find(sub => {
        if (!sub.startTime || !sub.endTime) return false;
        const startTime = parseTimeToSeconds(sub.startTime);
        const endTime = parseTimeToSeconds(sub.endTime);
        return time >= startTime && time <= endTime;
      });
      setCurrentSubtitle(current || null);
    }
  };

  // File upload handler
  const handleFileUpload = async (file: File): Promise<boolean> => {
    setLoading(true);
    try {
      // Validate video file
      if (!file.type.startsWith('video/')) {
        throw new Error(t.videoPreview.invalidVideoFile);
      }

      // Create object URL
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      message.success(t.videoPreview.videoLoaded);

      return false; // Prevent default upload
    } catch (error) {
      await handleError(
        async () => { throw error; },
        { errorMessage: t.videoPreview.videoLoadFailed }
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle load video from URL
  const handleLoadUrl = async () => {
    if (!videoUrl.trim()) {
      message.warning(t.videoPreview.enterVideoUrl);
      return;
    }

    setLoading(true);
    try {
      await handleError(
        async () => {
          // For CORS-restricted URLs, try to load directly without HEAD request
          // This allows the browser to handle CORS for video elements
          setVideoSrc(videoUrl);

          // Wait a bit to see if video loads successfully
          await new Promise((resolve, reject) => {
            const testVideo = document.createElement('video');
            testVideo.crossOrigin = 'anonymous';

            const timeout = setTimeout(() => {
              testVideo.remove();
              resolve(true); // Don't reject, let the video element handle it
            }, 3000);

            testVideo.onloadedmetadata = () => {
              clearTimeout(timeout);
              testVideo.remove();
              resolve(true);
            };

            testVideo.onerror = () => {
              clearTimeout(timeout);
              testVideo.remove();
              // Don't reject here, let the main video element try
              resolve(true);
            };

            testVideo.src = videoUrl;
          });

          message.success(t.videoPreview.videoUrlSet);
        },
        { errorMessage: t.videoPreview.videoUrlFailed }
      );
    } finally {
      setLoading(false);
    }
  };

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoSrc && videoSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoSrc);
      }
    };
  }, [videoSrc]);

  return (
    <Card
      title={
        <Space>
          <PlayCircleOutlined />
          <span>{t.videoPreview.title}</span>
          {currentSubtitle && (
            <Tag color="blue">
              {currentSubtitle.startTime} - {currentSubtitle.endTime}
            </Tag>
          )}
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Video Source Selection */}
      {!videoSrc && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Space orientation="vertical" style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div>
              <Space>
                <Text strong>{t.videoPreview.videoSource}</Text>
                <Switch
                  checked={useUrl}
                  onChange={setUseUrl}
                  checkedChildren={<LinkOutlined />}
                  unCheckedChildren={<UploadOutlined />}
                />
                <Text type="secondary">
                  {useUrl ? t.videoPreview.loadFromUrl : t.videoPreview.uploadFromDevice}
                </Text>
              </Space>
            </div>

            {useUrl ? (
              <div>
                <Row gutter={8}>
                  <Col flex={1}>
                    <Input
                      placeholder={t.videoPreview.urlPlaceholder}
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onPressEnter={handleLoadUrl}
                    />
                  </Col>
                  <Col>
                    <Button
                      type="primary"
                      icon={<LinkOutlined />}
                      loading={loading}
                      onClick={handleLoadUrl}
                    >
                      {t.videoPreview.loadUrl}
                    </Button>
                  </Col>
                </Row>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t.videoPreview.urlTip}
                  </Text>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Dragger
                  name="video"
                  multiple={false}
                  accept="video/*"
                  beforeUpload={handleFileUpload}
                  showUploadList={false}
                  disabled={loading}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}
                >
                  <div style={{ padding: '40px 20px' }}>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{ fontSize: '72px', color: '#1677ff' }} />
                    </p>
                    <p className="ant-upload-text" style={{ fontSize: '22px', fontWeight: 500, marginBottom: '16px' }}>
                      {t.videoPreview.clickOrDragVideo}
                    </p>
                    <p className="ant-upload-hint" style={{ fontSize: '16px', opacity: 0.7 }}>
                      {t.videoPreview.supportedFormats}
                    </p>
                  </div>
                </Dragger>
              </div>
            )}
          </Space>
        </div>
      )}

      {/* Video Player */}
      {videoSrc && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              backgroundColor: '#000',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <video
              ref={videoRef}
              src={videoSrc}
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                maxHeight: '500px',
                display: 'block',
                objectFit: 'contain'
              }}
              onTimeUpdate={handleTimeUpdate}
              onError={(e) => {
                console.warn('Video load error (may be CORS related):', e);
                message.warning(t.videoPreview.corsWarning);
              }}
              controls
            >
              {/* Track will be added dynamically via useEffect */}
            </video>
          </div>

          {/* Change Video Button */}
          <div style={{ marginTop: 16 }}>
            <Button
              block
              icon={<ReloadOutlined />}
              onClick={() => {
                setVideoSrc('');
                setVideoUrl('');
                setCurrentTime(0);
              }}
            >
              {t.videoPreview.changeVideo}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}