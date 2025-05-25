'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light theme',
    },
    {
      value: 'dark' as const,
      label: 'Dark', 
      icon: Moon,
      description: 'Dark theme',
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Follow system preference',
    },
  ];

  const currentTheme = themeOptions.find(option => option.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 p-0"
          aria-label="Toggle theme"
          title={`Current theme: ${currentTheme?.label || 'System'} (Ctrl+Shift+T)`}
        >
          <CurrentIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`cursor-pointer ${
                theme === option.value ? 'bg-accent' : ''
              }`}
            >
              <Icon className="mr-2 h-4 w-4" />
              <div className="flex-1">
                <span className="font-medium">{option.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </p>
              </div>
              {theme === option.value && (
                <span className="ml-auto text-xs text-muted-foreground">
                  ✓
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 bg-muted rounded font-mono">Ctrl+Shift+T</kbd> to toggle
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
