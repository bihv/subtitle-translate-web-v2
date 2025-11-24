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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="og:title" content="SubtitleAI" />
        <meta property="og:description" content="Easily translate SRT subtitles into multiple languages with AI. Perfect for movies, educational videos, entertainment, and much more!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://translate.io.vn/" />
        <meta property="og:image" content="https://translate.io.vn/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SubtitleAI" />
        <meta name="twitter:description" content="Easily translate SRT subtitles into multiple languages with AI. Perfect for movies, educational videos, entertainment, and much more!" />
        <meta name="twitter:image" content="https://translate.io.vn/og-image.jpg" />
      </head>
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
