"use client";

interface HrefLangMetadataProps {
  currentPath: string;
}

// Danh sách các ngôn ngữ hỗ trợ và mã quốc gia tương ứng
const SUPPORTED_LANGUAGES = [
  { lang: 'vi', region: 'VN', defaultPath: true },
  { lang: 'en', region: 'US' },
  // Có thể bổ sung thêm các ngôn ngữ khác
];

export default function HrefLangMetadata({ currentPath }: HrefLangMetadataProps) {
  const normalizePath = (path: string): string => {
    // Loại bỏ locale khỏi path nếu có
    const pathWithoutLocale = path.replace(/^\/(vi|en)(?:\/|$)/, '/');
    return pathWithoutLocale === '' ? '/' : pathWithoutLocale;
  };

  const baseUrl = 'https://translate.io.vn';
  const normalizedPath = normalizePath(currentPath);

  return (
    <>
      {SUPPORTED_LANGUAGES.map(({ lang, region, defaultPath }) => {
        const localePath = lang === 'vi' ? normalizedPath : `/${lang}${normalizedPath}`;
        const fullUrl = `${baseUrl}${localePath}`;
        
        return (
          <link 
            key={lang}
            rel="alternate" 
            hrefLang={`${lang}${region ? `-${region}` : ''}`}
            href={fullUrl}
          />
        );
      })}
      
      {/* Thẻ hreflang x-default cho phiên bản mặc định (thường là tiếng Việt trong trường hợp này) */}
      <link 
        rel="alternate" 
        hrefLang="x-default" 
        href={`${baseUrl}${normalizedPath}`}
      />
    </>
  );
} 