"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubtitleItem } from "@/components/SubtitleTranslator";
import { useI18n } from "@/lib/i18n/I18nContext";
import { Upload, Clock, Link, FileVideo } from "lucide-react";

interface SubtitlePreviewProps {
  subtitles: SubtitleItem[];
  isTranslating: boolean;
  onSubtitleChange?: (subtitleId: number | null) => void;
  currentPlayingSubtitleId?: number | null;
  selectedMode?: 'default' | 'sidebyside';
  onModeChange?: (mode: 'default' | 'sidebyside') => void;
}

export default function SubtitlePreview({ 
  subtitles, 
  isTranslating, 
  onSubtitleChange,
  currentPlayingSubtitleId,
  selectedMode,
  onModeChange
}: SubtitlePreviewProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleMode, setSubtitleMode] = useState<"translated" | "bilingual" | "original">("translated");
  const [loading, setLoading] = useState(false);
  const [videoName, setVideoName] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [vttUrl, setVttUrl] = useState<string | null>(null);
  const [originalVttUrl, setOriginalVttUrl] = useState<string | null>(null);
  const [bilingualVttUrl, setBilingualVttUrl] = useState<string | null>(null);
  const [activeSubtitleId, setActiveSubtitleId] = useState<number | null>(null);
  
  // New states for URL input functionality
  const [inputMode, setInputMode] = useState<'file' | 'url'>('file');
  const [videoUrlInput, setVideoUrlInput] = useState<string>('');
  const [urlError, setUrlError] = useState<string>('');

  // Hàm chuyển đổi phụ đề sang định dạng WebVTT
  const convertSubtitlesToVTT = (
    subtitles: SubtitleItem[], 
    mode: "translated" | "bilingual" | "original" = "translated"
  ): string => {
    // Header của WebVTT
    let vttContent = "WEBVTT\n\n";
    
    // Thêm từng phụ đề
    subtitles.forEach(subtitle => {
      // Chuyển đổi định dạng thời gian từ SRT (00:00:00,000) sang VTT (00:00:00.000)
      const startTime = subtitle.startTime.replace(',', '.');
      const endTime = subtitle.endTime.replace(',', '.');
      
      let text = '';
      if (mode === "original") {
        text = subtitle.text;
      } else if (mode === "translated") {
        text = subtitle.translatedText || subtitle.text;
      } else if (mode === "bilingual") {
        text = `${subtitle.text}\n${subtitle.translatedText || (isTranslating ? t('subtitleTable.translating') : t('subtitleTable.waitingToTranslate'))}`;
      }
      
      // Định dạng chuỗi VTT cho phụ đề này
      vttContent += `${subtitle.id}\n${startTime} --> ${endTime}\n${text}\n\n`;
    });
    
    return vttContent;
  };

  // Tạo URL cho file VTT
  const createVTTUrl = (content: string): string => {
    const blob = new Blob([content], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  };

  // Cập nhật VTT URLs khi subtitles hoặc mode thay đổi
  useEffect(() => {
    if (subtitles.length > 0) {
      // Revoke các URL cũ để tránh rò rỉ bộ nhớ
      if (vttUrl) URL.revokeObjectURL(vttUrl);
      if (originalVttUrl) URL.revokeObjectURL(originalVttUrl);
      if (bilingualVttUrl) URL.revokeObjectURL(bilingualVttUrl);
      
      // Tạo các URL mới cho từng mode
      const translatedVtt = convertSubtitlesToVTT(subtitles, "translated");
      const originalVtt = convertSubtitlesToVTT(subtitles, "original");
      const bilingualVtt = convertSubtitlesToVTT(subtitles, "bilingual");
      
      setVttUrl(createVTTUrl(translatedVtt));
      setOriginalVttUrl(createVTTUrl(originalVtt));
      setBilingualVttUrl(createVTTUrl(bilingualVtt));
    }
    
    // Clean up function để revoke URLs khi component unmount
    return () => {
      if (vttUrl) URL.revokeObjectURL(vttUrl);
      if (originalVttUrl) URL.revokeObjectURL(originalVttUrl);
      if (bilingualVttUrl) URL.revokeObjectURL(bilingualVttUrl);
    };
  }, [subtitles, subtitleMode, isTranslating, t]);

  // Cập nhật track khi subtitleMode thay đổi
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Xóa tất cả track hiện tại
    while (videoRef.current.textTracks.length > 0) {
      try {
        const track = videoRef.current.querySelector('track');
        if (track) track.remove();
      } catch (e) {
        console.error("Error removing tracks:", e);
        break;
      }
    }
    
    // Nếu đang ẩn phụ đề, không thêm track mới
    if (!showSubtitles) return;
    
    // Thêm track mới dựa trên mode được chọn
    if (videoRef.current && subtitles.length > 0) {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.label = 'Subtitles';
      track.default = true;
      
      if (subtitleMode === "translated" && vttUrl) {
        track.src = vttUrl;
      } else if (subtitleMode === "original" && originalVttUrl) {
        track.src = originalVttUrl;
      } else if (subtitleMode === "bilingual" && bilingualVttUrl) {
        track.src = bilingualVttUrl;
      }
      
      videoRef.current.appendChild(track);
      
      // Kích hoạt track
      setTimeout(() => {
        if (videoRef.current && videoRef.current.textTracks[0]) {
          videoRef.current.textTracks[0].mode = 'showing';
        }
      }, 100);
    }
  }, [subtitleMode, showSubtitles, vttUrl, originalVttUrl, bilingualVttUrl, subtitles.length]);

  // Xử lý khi người dùng chọn video
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    handleVideoFile(file);
  };

  // Xử lý file video
  const handleVideoFile = (file: File) => {
    // Kiểm tra loại file
    if (!file.type.startsWith('video/')) {
      alert(t('preview.invalidVideoType'));
      return;
    }

    // Rút lại URL cũ để tránh rò rỉ bộ nhớ
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }

    setLoading(true);
    setVideoName(file.name);
    setUrlError('');
    const newUrl = URL.createObjectURL(file);
    setVideoUrl(newUrl);
  };

  // Handle URL input
  const handleVideoUrl = () => {
    if (!videoUrlInput.trim()) {
      setUrlError(t('preview.urlRequired'));
      return;
    }

    // Basic URL validation
    try {
      const url = new URL(videoUrlInput.trim());
      if (!['http:', 'https:'].includes(url.protocol)) {
        setUrlError(t('preview.invalidUrl'));
        return;
      }
    } catch {
      setUrlError(t('preview.invalidUrl'));
      return;
    }

    // Clean up previous blob URL if exists
    if (videoUrl && videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl);
    }

    setLoading(true);
    setUrlError('');
    setVideoName(videoUrlInput.trim());
    setVideoUrl(videoUrlInput.trim());
  };

  // Handle input mode change
  const handleInputModeChange = (mode: 'file' | 'url') => {
    setInputMode(mode);
    setUrlError('');
    if (mode === 'file') {
      setVideoUrlInput('');
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  // Xử lý khi video metadata được load
  const handleVideoLoaded = () => {
    setLoading(false);
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // Cập nhật thời gian hiện tại của video khi phát
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setCurrentTime(currentTime);
      
      // Tìm phụ đề hiện tại dựa trên thời gian video
      updateActiveSubtitle(currentTime);
    }
  };
  
  // Hàm riêng để cập nhật subtitle đang hoạt động
  const updateActiveSubtitle = (currentTime: number) => {
    if (subtitles.length === 0) return;
    
    // Tìm phụ đề đang hiển thị
    const activeSubtitle = subtitles.find(sub => {
      const startTime = timeToSeconds(sub.startTime);
      const endTime = timeToSeconds(sub.endTime);
      // Mở rộng thêm một chút biên độ để tránh trường hợp sát ranh giới
      return currentTime >= startTime - 0.1 && currentTime <= endTime + 0.1;
    });
    
    // Cập nhật active subtitle ID
    const newActiveId = activeSubtitle?.id || null;
    if (newActiveId !== activeSubtitleId) {
      setActiveSubtitleId(newActiveId);
      // Gọi callback để thông báo cho component cha
      if (onSubtitleChange) {
        onSubtitleChange(newActiveId);
      }
    }
  };
  
  // Thiết lập interval để theo dõi thời gian video thường xuyên hơn
  useEffect(() => {
    if (!videoRef.current || !videoUrl || subtitles.length === 0) return;
    
    // Kiểm tra thời gian hiện tại và cập nhật subtitle đang hoạt động mỗi 100ms
    const intervalId = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = videoRef.current.currentTime;
        updateActiveSubtitle(currentTime);
      }
    }, 100);
    
    return () => clearInterval(intervalId);
  }, [videoUrl, subtitles]);

  // Chuyển đổi thời gian từ định dạng "00:00:00,000" sang giây
  const timeToSeconds = (timeString: string): number => {
    const [time, milliseconds] = timeString.split(',');
    const [hours, minutes, seconds] = time.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
  };

  // Format thời gian từ giây sang định dạng hh:mm:ss
  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  useEffect(() => {
    // Sync with external currentPlayingSubtitleId if provided
    if (currentPlayingSubtitleId !== undefined && 
        currentPlayingSubtitleId !== activeSubtitleId) {
      setActiveSubtitleId(currentPlayingSubtitleId);
      
      // If we have a video loaded, try to seek to the timestamp of this subtitle
      if (videoRef.current && videoUrl && currentPlayingSubtitleId) {
        const subtitle = subtitles.find(sub => sub.id === currentPlayingSubtitleId);
        if (subtitle) {
          const startTime = timeToSeconds(subtitle.startTime);
          
          // Set a flag to avoid triggering onSubtitleChange during the programmatic seek
          const isProgrammaticSeek = true;
          
          // Start a short delayed playback after seeking
          videoRef.current.currentTime = startTime;
          
          // Optionally auto-play after seeking
          videoRef.current.play().catch(err => {
            // Auto-play might be blocked by browser policy, that's fine
            console.log("Auto-play after seeking failed:", err);
          });
        }
      }
    }
  }, [currentPlayingSubtitleId, subtitles, videoUrl]);

  return (
    <div className="space-y-3">
      {/* Toggle between file upload and URL input */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-md border border-gray-200 bg-white p-1">
          <button
            onClick={() => handleInputModeChange('file')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              inputMode === 'file'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileVideo className="h-4 w-4 mr-1.5" />
            {t('preview.uploadFile')}
          </button>
          <button
            onClick={() => handleInputModeChange('url')}
            className={`flex items-center px-3 py-1.5 text-sm font-medium rounded transition-colors ${
              inputMode === 'url'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Link className="h-4 w-4 mr-1.5" />
            {t('preview.enterUrl')}
          </button>
        </div>
      </div>

      {/* File upload interface */}
      {inputMode === 'file' && (
        <div 
          className={`border-2 rounded-md transition-colors relative ${
            isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 border-dashed"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="p-3 text-center">
            <input
              type="file"
              id="video-upload"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            <label 
              htmlFor="video-upload" 
              className="cursor-pointer flex flex-col items-center justify-center py-2"
            >
              <Upload className="h-5 w-5 mb-1 text-gray-400" />
              <p className="text-sm text-gray-500">
                {isDragging ? t('preview.dropVideoHere') : t('preview.dragAndDropVideo')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('fileUpload.orClickToSelect')}</p>
            </label>
          </div>
        </div>
      )}

      {/* URL input interface */}
      {inputMode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder={t('preview.videoUrlPlaceholder')}
              value={videoUrlInput}
              onChange={(e) => setVideoUrlInput(e.target.value)}
              className={`flex-1 ${urlError ? 'border-red-500' : ''}`}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleVideoUrl();
                }
              }}
            />
            <Button 
              onClick={handleVideoUrl}
              disabled={!videoUrlInput.trim()}
              className="whitespace-nowrap"
            >
              {t('preview.loadVideo')}
            </Button>
          </div>
          {urlError && (
            <p className="text-sm text-red-500">{urlError}</p>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        {videoName && (
          <div className="text-xs flex items-center px-2 py-1 bg-gray-50 rounded-md flex-1 mr-2">
            <div className="font-medium truncate">
              <span className="text-gray-500 mr-1">{t('preview.videoName')}</span> {videoName}
            </div>
            {videoDuration > 0 && (
              <div className="flex items-center gap-1 text-gray-500 ml-2 flex-shrink-0">
                <span className="text-gray-500 mr-1">{t('preview.videoDuration')}</span>
                <Clock size={12} />
                <span>{formatTime(videoDuration)}</span>
              </div>
            )}
          </div>
        )}
        
        <Button 
          onClick={() => setShowSubtitles(!showSubtitles)}
          variant="outline"
          size="sm"
          className="whitespace-nowrap"
        >
          {showSubtitles ? t('preview.hideSubtitles') : t('preview.showSubtitles')}
        </Button>
      </div>

      {subtitles.length > 0 && (
        <div>
          <Tabs defaultValue="translated" onValueChange={(v: string) => setSubtitleMode(v as "translated" | "bilingual" | "original")}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="translated">{t('preview.translatedOnly')}</TabsTrigger>
              <TabsTrigger value="bilingual">{t('preview.bilingual')}</TabsTrigger>
              <TabsTrigger value="original">{t('preview.originalOnly')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="relative rounded-md overflow-hidden bg-black aspect-video">
        {videoUrl ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              crossOrigin="anonymous"
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleVideoLoaded}
              onLoadedData={handleVideoLoaded}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                <span className="text-white ml-2">{t('preview.loadingVideo')}</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white p-4">
            <Upload className="h-8 w-8 mb-2 opacity-60" />
            <p className="text-center opacity-80">{t('preview.uploadVideo')}</p>
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 text-center">
        {showSubtitles && subtitles.length > 0 && (
          <p>{t('preview.fullScreenSubtitleTip')}</p>
        )}
      </div>
    </div>
  );
}