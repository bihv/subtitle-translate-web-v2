import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import GoogleAnalytics from "../components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SubtitleAI - Free AI Subtitle Translator",
    template: "%s | SubtitleAI",
  },
  description: "Easily translate SRT, VTT, ASS subtitles into multiple languages using AI (Gemini, GPT). Free, fast, and accurate subtitle translation tool.",
  keywords: ["subtitle translator", "ai subtitle", "srt translator", "translate subtitles", "gemini ai", "subtitle translation"],
  authors: [{ name: "SubtitleAI Team" }],
  creator: "SubtitleAI Team",
  openGraph: {
    title: "SubtitleAI - Free AI Subtitle Translator",
    description: "Easily translate SRT subtitles into multiple languages with AI. Perfect for movies, educational videos, entertainment, and much more!",
    url: "https://translate.io.vn/",
    siteName: "SubtitleAI",
    images: [
      {
        url: "https://translate.io.vn/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SubtitleAI - AI Subtitle Translator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubtitleAI - Free AI Subtitle Translator",
    description: "Easily translate SRT subtitles into multiple languages with AI. Perfect for movies, educational videos, entertainment, and much more!",
    images: ["https://translate.io.vn/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system">
          <I18nProvider>
            <KeyboardShortcuts />
            {children}
          </I18nProvider>
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
