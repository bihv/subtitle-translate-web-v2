import { Metadata } from "next";

export interface MetadataParams {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  locale?: string;
  alternateLocales?: string[];
}

// Các ngôn ngữ được hỗ trợ
const LOCALES = ['vi', 'en'];

/**
 * Tạo metadata chuẩn hóa với hỗ trợ đa ngôn ngữ và SEO
 */
export function generateMetadata({
  title = "SubtitleAI",
  description = "Translate subtitles from SRT files using Gemini AI",
  path = "/",
  image,
  locale = "vi",
  alternateLocales = ["en"]
}: MetadataParams): Metadata {
  // Xác định baseUrl dựa trên môi trường
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  "https://translate.io.vn");
  
  const url = `${baseUrl}${path}`;
  
  // Tạo URL cho ảnh OG động nếu không có ảnh được cung cấp
  let imageUrl: string;
  
  if (image) {
    // Sử dụng ảnh được cung cấp nếu có
    imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  } else {
    // Tạo ảnh OG động với API
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    imageUrl = `${baseUrl}/api/og?title=${encodedTitle}&description=${encodedDescription}`;
  }

  // Tạo alternates cho hreflang
  const alternates: { [key: string]: string } = {};
  LOCALES.forEach(loc => {
    const localePath = loc === 'vi' ? path : `/${loc}${path}`;
    alternates[loc] = `${baseUrl}${localePath}`;
  });

  return {
    title,
    description,
    keywords: ["subtitle translation", "SRT files", "AI translation", "Gemini AI", "subtitle converter"],
    authors: [{ name: "SubtitleAI" }],
    creator: "SubtitleAI",
    publisher: "SubtitleAI",
    openGraph: {
      title,
      description,
      url,
      siteName: "SubtitleAI",
      locale,
      alternateLocale: alternateLocales,
      type: "website",
      images: [{
        url: imageUrl,
        width: 1200,
        height: 630,
        alt: title,
        // Đảm bảo hình ảnh luôn được cập nhật
        secureUrl: imageUrl
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    themeColor: "#ffffff",
    viewport: "width=device-width, initial-scale=1",
    alternates: {
      canonical: url,
      languages: alternates,
    },
    metadataBase: new URL(baseUrl),
  };
} 