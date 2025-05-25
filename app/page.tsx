"use client";

import dynamic from 'next/dynamic';
import TranslatorSkeleton from '@/components/TranslatorSkeleton';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeShortcutHint } from '@/components/ThemeShortcutHint';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useSessionTracking } from '@/lib/analytics';
import Link from 'next/link';
import { BookOpen, Palette } from 'lucide-react';

// Import the SubtitleTranslator component dynamically with SSR disabled
const SubtitleTranslator = dynamic(
  () => import('@/components/SubtitleTranslator'),
  { 
    ssr: false, // This ensures the component only renders on the client
    loading: () => <TranslatorSkeleton /> // Show a skeleton while loading
  }
);

export default function Home() {
  const { t } = useI18n();
  
  // Kích hoạt theo dõi phiên làm việc
  useSessionTracking();
  
  return (
    <>
      {/* Fixed header */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-sm transition-all duration-200">
        <div className="container max-w-6xl mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground transition-colors">
              {t('common.appTitle')}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 transition-colors">
              {t('common.appDescription')}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <Link href="/guide" className="flex items-center text-sm text-primary hover:text-primary/80 transition-colors">
              <BookOpen className="h-4 w-4 mr-1" />
              {t('guide.title')}
            </Link>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-3 md:p-6 pt-8">
        <div className="w-full max-w-6xl mx-auto">
          <SubtitleTranslator />
        </div>
        <ThemeShortcutHint />
      </main>
    </>
  );
}
