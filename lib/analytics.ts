import ReactGA from 'react-ga4';
import { useEffect } from 'react';

// Declare gtag as a global function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Google Analytics Measurement ID - replace with your actual GA4 measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-P374H6F49M';

/**
 * Initialize Google Analytics
 */
export function initGA(): void {
  try {
    if (typeof window !== 'undefined') {
      ReactGA.initialize(GA_MEASUREMENT_ID);
    }
  } catch (error) {
    console.error('Error initializing Google Analytics:', error);
  }
}

/**
 * Theo dõi sự kiện tùy chỉnh với Google Analytics
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      // Use gtag directly if available (set up by Script component)
      window.gtag('event', eventName, properties || {});
    } else {
      // Fallback to ReactGA
      ReactGA.event({
        category: 'User Interaction',
        action: eventName,
        ...(properties || {})
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

/**
 * Theo dõi lỗi với Google Analytics
 */
export function trackError(category: string, description: string, context?: Record<string, any>): void {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      // Use gtag directly if available
      window.gtag('event', 'error', {
        error_category: category,
        error_description: description,
        ...(context || {})
      });
    } else {
      // Fallback to ReactGA
      ReactGA.event({
        category: 'Error',
        action: category,
        label: description,
        ...(context || {})
      });
    }
  } catch (error) {
    console.error('Error tracking error event:', error);
  }
}

/**
 * Hook theo dõi phiên làm việc
 */
export function useSessionTracking(): void {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    // Ensure Google Analytics is initialized
    initGA();
    
    // Track page view
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: window.location.pathname
      });
    } else {
      ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
    
    // Theo dõi bắt đầu phiên làm việc
    const startTime = Date.now();
    trackEvent('session_start');

    // Xử lý khi người dùng rời trang
    const handleBeforeUnload = () => {
      const sessionDuration = Math.floor((Date.now() - startTime) / 1000); // Tính thời gian sử dụng bằng giây
      trackEvent('session_end', { duration: sessionDuration });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Cũng ghi nhận khi component unmount
    };
  }, []);
}

/**
 * Theo dõi sự kiện tải lên file
 */
export function trackFileUpload(fileFormat: string, fileSize: number): void {
  trackEvent('file_upload', {
    format: fileFormat,
    size: fileSize,
  });
}

/**
 * Theo dõi sự kiện dịch phụ đề
 */
export function trackTranslation(
  sourceLanguage: string, 
  targetLanguage: string, 
  subtitleCount: number,
  model: string
): void {
  trackEvent('translation', {
    source: sourceLanguage,
    target: targetLanguage,
    count: subtitleCount,
    model: model
  });
}

/**
 * Theo dõi sự kiện xuất phụ đề
 */
export function trackExport(
  format: string, 
  subtitleCount: number, 
  targetLanguage: string,
  isBilingual: boolean
): void {
  trackEvent('export', {
    format,
    count: subtitleCount,
    language: targetLanguage,
    bilingual: isBilingual
  });
} 