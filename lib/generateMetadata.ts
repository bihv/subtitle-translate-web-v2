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
  image = "/og-image.jpg",
  locale = "vi",
  alternateLocales = ["en"]
}: MetadataParams): Metadata {
  // Luôn sử dụng domain production cho hình ảnh OG bất kể môi trường nào
  // Điều này đảm bảo hình ảnh luôn có thể truy cập khi chia sẻ
  const productionUrl = "https://translate.io.vn";
  
  // Xác định baseUrl dựa trên môi trường chỉ cho các URL khác
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                  productionUrl);
  
  const url = `${baseUrl}${path}`;
  
  // Sử dụng URL sản phẩm THỰC TẾ cho hình ảnh OG bất kể đang ở môi trường nào
  // Điều này đảm bảo hình ảnh luôn khả dụng khi chia sẻ trên mạng xã hội
  let imageUrl: string;
  
  if (image) {
    // Sử dụng ảnh được cung cấp nếu có
    imageUrl = image.startsWith('http') ? image : `${productionUrl}${image}`;
  } else {
    // Sử dụng ảnh mặc định
    imageUrl = `${productionUrl}/og-image.jpg`;
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
    // Cấu hình favicon và các biểu tượng khác
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: '32x32' },
        { url: '/favicon/icon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon/icon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/favicon/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [
        { url: '/favicon/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        {
          rel: 'apple-touch-icon',
          url: '/favicon/apple-icon-180x180.png',
        },
      ],
    },
    // Manifest cho PWA
    manifest: '/manifest.json',
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