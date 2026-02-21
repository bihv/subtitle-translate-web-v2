'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { App, ConfigProvider, theme, Spin } from 'antd';
import { lightTheme, darkTheme } from '@/lib/theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    if (savedTheme) {
      setThemeMode(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setThemeMode(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    if (themeMode) {
      localStorage.setItem('theme', themeMode);
      // Update document class for global styles
      document.documentElement.classList.toggle('dark', themeMode === 'dark');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = themeMode === 'dark';

  // Show loading until theme is ready
  if (!mounted || !themeMode) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, isDark }}>
      <ConfigProvider
        theme={{
          ...(isDark ? darkTheme : lightTheme),
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <App>
          {children}
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};