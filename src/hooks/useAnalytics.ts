'use client';

import { useState, useCallback, useEffect } from 'react';

export interface AnalyticsEvent {
  id: string;
  type: string;
  action: string;
  data?: any;
  timestamp: number;
  duration?: number;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
}

export interface UsageStats {
  totalEvents: number;
  uniqueActions: number;
  averageSessionDuration: number;
  mostUsedFeatures: Array<{ action: string; count: number }>;
  errorRate: number;
  performanceMetrics: PerformanceMetric[];
}

interface UseAnalyticsProps {
  userId?: string;
  enableLocalStorage?: boolean;
  maxEvents?: number;
}

export function useAnalytics({
  userId,
  enableLocalStorage = true,
  maxEvents = 1000
}: UseAnalyticsProps = {}) {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [sessionStart] = useState(Date.now());

  // Load events from localStorage on mount
  useEffect(() => {
    if (enableLocalStorage) {
      try {
        const stored = localStorage.getItem('subtitle_analytics_events');
        if (stored) {
          const parsedEvents = JSON.parse(stored);
          setEvents(parsedEvents.slice(0, maxEvents));
        }
      } catch (error) {
        console.warn('Failed to load analytics from localStorage:', error);
      }
    }
  }, [enableLocalStorage, maxEvents]);

  // Save events to localStorage
  useEffect(() => {
    if (enableLocalStorage && events.length > 0) {
      try {
        localStorage.setItem('subtitle_analytics_events', JSON.stringify(events));
      } catch (error) {
        console.warn('Failed to save analytics to localStorage:', error);
      }
    }
  }, [events, enableLocalStorage]);

  // Track event
  const trackEvent = useCallback((
    type: string,
    action: string,
    data?: any,
    duration?: number
  ) => {
    const event: AnalyticsEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: Date.now(),
      duration,
      userId,
      sessionId
    };

    setEvents(prev => {
      const newEvents = [event, ...prev];
      return newEvents.slice(0, maxEvents);
    });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }, [userId, sessionId, maxEvents]);

  // Track performance metric
  const trackPerformance = useCallback((
    name: string,
    value: number,
    type: 'timing' | 'counter' | 'gauge' = 'timing'
  ) => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type
    };

    setPerformanceMetrics(prev => {
      const newMetrics = [metric, ...prev];
      return newMetrics.slice(0, 100); // Keep last 100 metrics
    });
  }, []);

  // Track page view
  const trackPageView = useCallback((page: string, data?: any) => {
    trackEvent('navigation', 'page_view', { page, ...data });
  }, [trackEvent]);

  // Track user action
  const trackAction = useCallback((action: string, data?: any) => {
    trackEvent('user_action', action, data);
  }, [trackEvent]);

  // Track error
  const trackError = useCallback((error: string, data?: any) => {
    trackEvent('error', 'error_occurred', { error, ...data });
  }, [trackEvent]);

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string, data?: any) => {
    trackEvent('feature', 'feature_used', { feature, ...data });
  }, [trackEvent]);

  // Track timing
  const trackTiming = useCallback((name: string, startTime: number, data?: any) => {
    const duration = Date.now() - startTime;
    trackEvent('performance', 'timing', { name, ...data }, duration);
    trackPerformance(name, duration, 'timing');
  }, [trackEvent, trackPerformance]);

  // Get usage statistics
  const getUsageStats = useCallback((): UsageStats => {
    const now = Date.now();
    const sessionDuration = now - sessionStart;

    // Count actions
    const actionCounts = events.reduce((acc, event) => {
      acc[event.action] = (acc[event.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedFeatures = Object.entries(actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([action, count]) => ({ action, count }));

    const errorEvents = events.filter(e => e.type === 'error');
    const errorRate = events.length > 0 ? (errorEvents.length / events.length) * 100 : 0;

    return {
      totalEvents: events.length,
      uniqueActions: Object.keys(actionCounts).length,
      averageSessionDuration: sessionDuration,
      mostUsedFeatures,
      errorRate,
      performanceMetrics: performanceMetrics.slice(0, 20)
    };
  }, [events, performanceMetrics, sessionStart]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    setEvents([]);
    setPerformanceMetrics([]);
    if (enableLocalStorage) {
      localStorage.removeItem('subtitle_analytics_events');
    }
  }, [enableLocalStorage]);

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    const data = {
      events,
      performanceMetrics,
      stats: getUsageStats(),
      sessionId,
      userId,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subtitle-analytics-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [events, performanceMetrics, getUsageStats, sessionId, userId]);

  return {
    events,
    performanceMetrics,
    sessionId,
    trackEvent,
    trackPerformance,
    trackPageView,
    trackAction,
    trackError,
    trackFeatureUsage,
    trackTiming,
    getUsageStats,
    clearAnalytics,
    exportAnalytics
  };
}

// Common analytics events
export const AnalyticsEvents = {
  // File operations
  FILE_UPLOADED: 'file_uploaded',
  FILE_PARSED: 'file_parsed',
  FILE_EXPORTED: 'file_exported',
  
  // Translation operations
  TRANSLATION_STARTED: 'translation_started',
  TRANSLATION_COMPLETED: 'translation_completed',
  TRANSLATION_FAILED: 'translation_failed',
  
  // UI interactions
  THEME_CHANGED: 'theme_changed',
  LANGUAGE_CHANGED: 'language_changed',
  SETTINGS_OPENED: 'settings_opened',
  
  // Subtitle operations
  SUBTITLE_EDITED: 'subtitle_edited',
  SUBTITLE_DELETED: 'subtitle_deleted',
  SUBTITLE_PREVIEWED: 'subtitle_previewed',
  
  // Export operations
  EXPORT_STARTED: 'export_started',
  EXPORT_COMPLETED: 'export_completed',
  BATCH_EXPORT: 'batch_export',
  
  // Keyboard shortcuts
  SHORTCUT_USED: 'shortcut_used',
  
  // Errors
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  NETWORK_ERROR: 'network_error'
} as const;