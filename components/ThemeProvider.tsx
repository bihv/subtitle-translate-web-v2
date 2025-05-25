'use client';

import { useEffect, useState } from 'react';
import { ThemeContext } from '@/lib/hooks/useTheme';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme = 'system' }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isMounted, setIsMounted] = useState(false);

  // Get effective theme (resolve 'system' to actual theme)
  const effectiveTheme = theme === 'system' ? systemTheme : theme;

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Set initial system theme
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    
    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
    setIsMounted(true);
  }, []);

  // Save theme to localStorage and apply to document
  useEffect(() => {
    if (!isMounted) return;
    
    localStorage.setItem('theme', theme);
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    // Add the effective theme class
    root.classList.add(effectiveTheme);
  }, [theme, effectiveTheme, isMounted]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (        <ThemeContext.Provider
          value={{
            theme,
            setTheme,
            systemTheme,
            effectiveTheme,
          }}
        >
          <div className="transition-colors duration-300">
            {children}
          </div>
        </ThemeContext.Provider>
  );
}
