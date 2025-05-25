'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';

export function useKeyboardShortcuts() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + T để toggle theme
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        
        if (theme === 'light') {
          setTheme('dark');
        } else if (theme === 'dark') {
          setTheme('system');
        } else {
          setTheme('light');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);
}

export function KeyboardShortcuts() {
  useKeyboardShortcuts();
  return null;
}
