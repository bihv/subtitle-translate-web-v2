"use client";

import { usePathname } from 'next/navigation';
import HrefLangMetadata from './HrefLangMetadata';

interface SeoMetadataProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
}

export default function SeoMetadata({
  title = "SubtitleAI - AI-Powered Subtitle Translation",
  description = "Translate subtitles from SRT files using Gemini AI - fast, accurate, and easy to use",
  canonicalPath,
  ogImage = "/og-image.jpg"
}: SeoMetadataProps) {
  const pathname = usePathname();
  const currentPath = canonicalPath || pathname || '/';
  const baseUrl = 'https://translate.io.vn';
  const fullCanonicalUrl = `${baseUrl}${currentPath}`;
  const fullOgImageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <>
      {/* Canonical URL */}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Hreflang tags for multi-language support */}
      <HrefLangMetadata currentPath={currentPath} />
    </>
  );
} 