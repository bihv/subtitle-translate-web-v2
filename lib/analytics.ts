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
 * Theo dõi sự kiện nhấn nút dịch (riêng biệt với completion)
 */
export function trackTranslateButtonClick(
  sourceLanguage: string,
  targetLanguage: string,
  subtitleCount: number,
  aiProvider: 'gemini' | 'openrouter',
  model: string,
  modelType?: 'free' | 'paid' | 'experimental'
): void {
  trackEvent('translate_button_click', {
    source: sourceLanguage,
    target: targetLanguage,
    count: subtitleCount,
    ai_provider: aiProvider,
    model: model,
    model_type: modelType || 'unknown',
    // Thêm thông tin chi tiết về model provider
    provider_model: `${aiProvider}:${model}`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Theo dõi việc lựa chọn model
 */
export function trackModelSelection(
  aiProvider: 'gemini' | 'openrouter',
  previousModel: string,
  newModel: string,
  modelType?: 'free' | 'paid' | 'experimental'
): void {
  trackEvent('model_selection', {
    ai_provider: aiProvider,
    previous_model: previousModel,
    new_model: newModel,
    model_type: modelType || 'unknown',
    provider_model: `${aiProvider}:${newModel}`,
    timestamp: new Date().toISOString()
  });
}

/**
 * Theo dõi việc chuyển đổi AI provider
 */
export function trackProviderSwitch(
  previousProvider: 'gemini' | 'openrouter',
  newProvider: 'gemini' | 'openrouter',
  previousModel: string,
  newModel: string
): void {
  trackEvent('provider_switch', {
    previous_provider: previousProvider,
    new_provider: newProvider,
    previous_model: previousModel,
    new_model: newModel,
    previous_provider_model: `${previousProvider}:${previousModel}`,
    new_provider_model: `${newProvider}:${newModel}`,
    timestamp: new Date().toISOString()
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

/**
 * Helpers để xác định loại model và provider
 */

/**
 * Xác định loại model Gemini
 */
export function getGeminiModelType(modelId: string): 'free' | 'paid' | 'experimental' {
  // Free models
  if (modelId.includes('flash') || modelId.includes('2.0-flash')) {
    return 'free';
  }
  // Experimental models
  if (modelId.includes('exp') || modelId.includes('experimental')) {
    return 'experimental';
  }
  // Pro models (paid)
  if (modelId.includes('pro')) {
    return 'paid';
  }
  return 'free'; // Default to free
}

/**
 * Xác định loại model OpenRouter dựa trên pricing
 */
export function getOpenRouterModelType(
  modelId: string, 
  pricingInfo?: { prompt: string; completion: string }
): 'free' | 'paid' {
  if (pricingInfo) {
    const promptPrice = parseFloat(pricingInfo.prompt);
    const completionPrice = parseFloat(pricingInfo.completion);
    return (promptPrice === 0 && completionPrice === 0) ? 'free' : 'paid';
  }
  
  // Fallback: check common free model patterns
  const freeModelPatterns = [
    'free',
    'microsoft/wizardlm',
    'meta-llama/llama-3.1-8b-instruct:free'
  ];
  
  return freeModelPatterns.some(pattern => 
    modelId.toLowerCase().includes(pattern.toLowerCase())
  ) ? 'free' : 'paid';
}

/**
 * Tạo model key chi tiết cho analytics
 */
export function createDetailedModelKey(
  aiProvider: 'gemini' | 'openrouter',
  modelId: string,
  modelType: 'free' | 'paid' | 'experimental'
): string {
  return `${aiProvider}_${modelType}_${modelId.replace(/[^a-zA-Z0-9]/g, '_')}`;
}