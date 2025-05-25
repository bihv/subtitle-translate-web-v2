'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/hooks/useTheme';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Zap, 
  Keyboard,
  Check,
  Info
} from 'lucide-react';

export function ThemeShowcase() {
  const { theme, setTheme, effectiveTheme, systemTheme } = useTheme();
  const [showDetails, setShowDetails] = useState(false);

  const themeOptions = [
    {
      value: 'light' as const,
      label: 'Light Theme',
      icon: Sun,
      description: 'Bright and clean interface',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    },
    {
      value: 'dark' as const,
      label: 'Dark Theme',
      icon: Moon,
      description: 'Easy on the eyes in low light',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    },
    {
      value: 'system' as const,
      label: 'System Theme',
      icon: Monitor,
      description: 'Follows your device settings',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Instant Switching',
      description: 'Themes change immediately with smooth transitions'
    },
    {
      icon: Keyboard,
      title: 'Keyboard Shortcut',
      description: 'Quick toggle with Ctrl+Shift+T'
    },
    {
      icon: Palette,
      title: 'System Integration',
      description: 'Respects your OS theme preferences'
    }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme System
        </CardTitle>
        <p className="text-muted-foreground">
          Choose your preferred theme or let the system decide
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Theme Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div>
            <p className="font-medium">Current Theme</p>
            <p className="text-sm text-muted-foreground">
              {theme} {theme === 'system' && `(${systemTheme} detected)`}
            </p>
          </div>
          <Badge variant="outline" className={
            theme === 'light' ? 'border-yellow-500' :
            theme === 'dark' ? 'border-gray-500' :
            'border-blue-500'
          }>
            {effectiveTheme}
          </Badge>
        </div>

        {/* Theme Options */}
        <div className="grid gap-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Choose Theme
          </h3>
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => setTheme(option.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                  isActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`p-2 rounded ${option.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {option.description}
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Features
          </h3>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="p-1 bg-primary/10 rounded">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {feature.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Keyboard Shortcut Info */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Press <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 rounded text-xs font-mono">
              Ctrl+Shift+T
            </kbd> to quickly cycle through themes
          </span>
        </div>

        {/* Technical Details Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          {showDetails ? 'Hide' : 'Show'} Technical Details
        </Button>

        {showDetails && (
          <div className="space-y-3 p-4 bg-muted rounded-lg text-sm">
            <div>
              <strong>Theme Storage:</strong> localStorage
            </div>
            <div>
              <strong>CSS Strategy:</strong> CSS custom properties with class switching
            </div>
            <div>
              <strong>Transition Duration:</strong> 300ms
            </div>
            <div>
              <strong>System Detection:</strong> prefers-color-scheme media query
            </div>
            <div>
              <strong>SSR Safe:</strong> Prevents hydration mismatches
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
