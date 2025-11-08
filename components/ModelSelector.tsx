"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/I18nContext";

// Tên key để lưu trong localStorage
const STORAGE_KEY = "gemini_model";

// Đa ngôn ngữ cho các nhãn hiển thị
export const translations = {
  title: {
    vi: "Mô hình AI",
    en: "AI Model"
  },
  selectModel: {
    vi: "Chọn mô hình",
    en: "Select model"
  },
}

export interface ModelOption {
  id: string;
  name: string;
  description: {
    vi: string;
    en: string;
  };
}

// Danh sách các model có sẵn hỗ trợ dịch thuật text-to-text
export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: {
      vi: "Mô hình tiên tiến nhất, phù hợp cho dịch thuật chất lượng cao",
      en: "Most advanced model, suitable for high-quality translations"
    }
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: {
      vi: "Hiệu suất nhanh và cân bằng, phù hợp cho dịch thuật thông thường",
      en: "Fast and balanced performance, suitable for routine translations"
    }
  }
];

// Default model - sử dụng model miễn phí làm mặc định
export const DEFAULT_MODEL = "gemini-2.0-flash";

interface ModelSelectorProps {
  onModelChange: (modelId: string) => void;
  className?: string;
}

export default function ModelSelector({ onModelChange, className = "" }: ModelSelectorProps) {
  const { t, locale = 'vi' } = useI18n();
  const [currentModel, setCurrentModel] = useState<string>(DEFAULT_MODEL);
  
  // Tải model từ localStorage khi component được khởi tạo
  useEffect(() => {
    const savedModel = localStorage.getItem(STORAGE_KEY);
    
    if (savedModel) {
      setCurrentModel(savedModel);
      onModelChange(savedModel);
    }
  }, [onModelChange]);

  const handleModelChange = (value: string) => {
    setCurrentModel(value);
    localStorage.setItem(STORAGE_KEY, value);
    onModelChange(value);
  };

  // Lấy thông tin model hiện tại
  const currentModelInfo = AVAILABLE_MODELS.find(m => m.id === currentModel) || AVAILABLE_MODELS[0];
  
  // Xác định ngôn ngữ hiển thị, mặc định là tiếng Việt nếu không có
  const currentLanguage = locale === 'en' ? 'en' : 'vi';

  // Nhóm các mô hình theo loại giá - không cần phân nhóm nữa
  const models = AVAILABLE_MODELS;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="text-sm font-medium block mb-2">
        {translations.title[currentLanguage] || 'AI Model'}
      </label>
      <Select
        value={currentModel}
        onValueChange={handleModelChange}
      >
        <SelectTrigger className="w-full text-left">
          <SelectValue placeholder={translations.selectModel[currentLanguage] || 'Select model'} />
        </SelectTrigger>
        <SelectContent className="max-h-[400px] overflow-auto w-[400px] max-w-[90vw]">
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div>
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-gray-500">{model.description[currentLanguage]}</div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 