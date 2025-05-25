"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/I18nContext";

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

// Common languages for translation with country flags
const LANGUAGES = [
  { code: "🇿🇦", name: "Afrikaans", display: "🇿🇦 Afrikaans" },
  { code: "🇦🇱", name: "Albanian", display: "🇦🇱 Albanian" },
  { code: "🇸🇦", name: "Arabic", display: "🇸🇦 Arabic" },
  { code: "🇦🇲", name: "Armenian", display: "🇦🇲 Armenian" },
  { code: "🇧🇩", name: "Bengali", display: "🇧🇩 Bengali" },
  { code: "🇧🇬", name: "Bulgarian", display: "🇧🇬 Bulgarian" },
  { code: "🇨🇳", name: "Chinese (Simplified)", display: "🇨🇳 Chinese (Simplified)" },
  { code: "🇹🇼", name: "Chinese (Traditional)", display: "🇹🇼 Chinese (Traditional)" },
  { code: "🇭🇷", name: "Croatian", display: "🇭🇷 Croatian" },
  { code: "🇨🇿", name: "Czech", display: "🇨🇿 Czech" },
  { code: "🇩🇰", name: "Danish", display: "🇩🇰 Danish" },
  { code: "🇳🇱", name: "Dutch", display: "🇳🇱 Dutch" },
  { code: "🇺🇸", name: "English", display: "🇺🇸 English" },
  { code: "🇪🇪", name: "Estonian", display: "🇪🇪 Estonian" },
  { code: "🇵🇭", name: "Filipino", display: "🇵🇭 Filipino" },
  { code: "🇫🇮", name: "Finnish", display: "🇫🇮 Finnish" },
  { code: "🇫🇷", name: "French", display: "🇫🇷 French" },
  { code: "🇩🇪", name: "German", display: "🇩🇪 German" },
  { code: "🇬🇷", name: "Greek", display: "🇬🇷 Greek" },
  { code: "🇮🇱", name: "Hebrew", display: "🇮🇱 Hebrew" },
  { code: "🇮🇳", name: "Hindi", display: "🇮🇳 Hindi" },
  { code: "🇭🇺", name: "Hungarian", display: "🇭🇺 Hungarian" },
  { code: "🇮🇸", name: "Icelandic", display: "🇮🇸 Icelandic" },
  { code: "🇮🇩", name: "Indonesian", display: "🇮🇩 Indonesian" },
  { code: "🇮🇹", name: "Italian", display: "🇮🇹 Italian" },
  { code: "🇯🇵", name: "Japanese", display: "🇯🇵 Japanese" },
  { code: "🇰🇷", name: "Korean", display: "🇰🇷 Korean" },
  { code: "🇱🇻", name: "Latvian", display: "🇱🇻 Latvian" },
  { code: "🇱🇹", name: "Lithuanian", display: "🇱🇹 Lithuanian" },
  { code: "🇲🇾", name: "Malay", display: "🇲🇾 Malay" },
  { code: "🇳🇴", name: "Norwegian", display: "🇳🇴 Norwegian" },
  { code: "🇮🇷", name: "Persian", display: "🇮🇷 Persian" },
  { code: "🇵🇱", name: "Polish", display: "🇵🇱 Polish" },
  { code: "🇵🇹", name: "Portuguese", display: "🇵🇹 Portuguese" },
  { code: "🇷🇴", name: "Romanian", display: "🇷🇴 Romanian" },
  { code: "🇷🇺", name: "Russian", display: "🇷🇺 Russian" },
  { code: "🇷🇸", name: "Serbian", display: "🇷🇸 Serbian" },
  { code: "🇸🇰", name: "Slovak", display: "🇸🇰 Slovak" },
  { code: "🇸🇮", name: "Slovenian", display: "🇸🇮 Slovenian" },
  { code: "🇪🇸", name: "Spanish", display: "🇪🇸 Spanish" },
  { code: "🇹🇿", name: "Swahili", display: "🇹🇿 Swahili" },
  { code: "🇸🇪", name: "Swedish", display: "🇸🇪 Swedish" },
  { code: "🇹🇭", name: "Thai", display: "🇹🇭 Thai" },
  { code: "🇹🇷", name: "Turkish", display: "🇹🇷 Turkish" },
  { code: "🇺🇦", name: "Ukrainian", display: "🇺🇦 Ukrainian" },
  { code: "🇵🇰", name: "Urdu", display: "🇵🇰 Urdu" },
  { code: "🇻🇳", name: "Vietnamese", display: "🇻🇳 Vietnamese" },
];

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { t } = useI18n();
  // Filter languages based on input
  const [filter, setFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
  const filteredLanguages = filter
    ? LANGUAGES.filter(lang => 
        lang.name.toLowerCase().includes(filter.toLowerCase()) ||
        lang.display.toLowerCase().includes(filter.toLowerCase())
      )
    : LANGUAGES;

  // Find the selected language to display with flag
  const selectedLanguage = LANGUAGES.find(lang => lang.name === value);
  const displayValue = selectedLanguage ? selectedLanguage.display : value;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block mb-2">
        {t('translationSettings.targetLanguage')}
      </label>
      <div className="relative w-full">
      <div className="flex gap-2">
        <Input
          type="text"
          value={displayValue}
          onChange={(e) => {
            onChange(e.target.value);
            setFilter(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow for selection
            setTimeout(() => setIsOpen(false), 200);
          }}
          placeholder={t('translationSettings.selectLanguage')}
          className="w-full text-left"
        />
      </div>

      {isOpen && filteredLanguages.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-w-[400px] max-w-[90vw] bg-white dark:bg-gray-800 shadow-lg max-h-[400px] rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm custom-scrollbar border border-gray-200 dark:border-gray-600">
          <ul className="divide-y divide-gray-200 dark:divide-gray-600">
            {filteredLanguages.map((language) => (
              <li
                key={language.name}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 ${
                  value === language.name ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
                onMouseDown={() => {
                  onChange(language.name);
                  setIsOpen(false);
                }}
              >
                {language.display}
              </li>
            ))}
          </ul>
        </div>
      )}
      </div>
    </div>
  );
} 