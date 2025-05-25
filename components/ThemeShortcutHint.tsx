'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { X, Keyboard } from 'lucide-react';

export function ThemeShortcutHint() {
  const [showHint, setShowHint] = useState(false);
  const { effectiveTheme } = useTheme();

  useEffect(() => {
    // Hiển thị hint sau khi theme được toggle lần đầu
    const hasSeenHint = localStorage.getItem('theme-shortcut-hint-seen');
    if (!hasSeenHint) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    localStorage.setItem('theme-shortcut-hint-seen', 'true');
  };

  if (!showHint) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-lg shadow-lg p-4 max-w-sm animate-in slide-in-from-bottom">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 p-1 bg-primary/10 rounded">
          <Keyboard className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            Theme Shortcut
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs font-mono">
              Ctrl + Shift + T
            </kbd> to quickly switch themes
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-muted"
          onClick={dismissHint}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
