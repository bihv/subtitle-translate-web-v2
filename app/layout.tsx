import { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nContext";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { WebsiteSchema, OrganizationSchema, SoftwareApplicationSchema } from "../components/JsonLd";
import { generateMetadata as generateSiteMetadata } from '../lib/generateMetadata';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = generateSiteMetadata({
  title: "SubtitleAI",
  description: "Translate subtitles from SRT files using Gemini AI",
});

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
        <I18nProvider>
          {children}
        </I18nProvider>
        <GoogleAnalytics />
        <WebsiteSchema />
        <OrganizationSchema />
        <SoftwareApplicationSchema />
      </body>
    </html>
  );
}
