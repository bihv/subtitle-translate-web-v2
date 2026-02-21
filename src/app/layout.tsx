import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import AppHeader from "@/components/AppHeader";
import ClientLayout from "@/components/ClientLayout";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SubtitleAI - AI-Powered Subtitle Translation",
  description: "Translate subtitles automatically using AI technology. Support for SRT, VTT, ASS formats with Google Gemini and OpenRouter integration.",
  keywords: "subtitle, translation, AI, SRT, VTT, ASS, Google Gemini, OpenRouter",
  authors: [{ name: "SubtitleAI Team" }],
  openGraph: {
    title: "SubtitleAI - AI-Powered Subtitle Translation",
    description: "Translate subtitles automatically using AI technology",
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>
          <ThemeProvider>
            <ClientLayout>
              <AppHeader />
              {children}
            </ClientLayout>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
