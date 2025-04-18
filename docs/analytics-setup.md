# Google Analytics Integration

This project uses Google Analytics 4 (GA4) for tracking user interactions and application usage.

## Setup

1. The GA4 integration is implemented using both:
   - The `react-ga4` package for programmatic event tracking
   - Next.js `Script` component for proper server-side rendering support

2. The measurement ID is configured in two ways:
   - As an environment variable `NEXT_PUBLIC_GA_ID` (preferred)
   - As a fallback constant in `lib/analytics.ts`

3. Analytics are initialized through:
   - The `GoogleAnalytics` component (included in the application layout)
   - Script tags that load Google's gtag.js

## Environment Variables

To configure Google Analytics, you can set these environment variables:

```
# .env.local or other environment files
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Current Implementation

- **Page Views**: Automatically tracked when a user loads a page
- **Session Tracking**: Start and end of user sessions are tracked
- **Custom Events**: Various user interactions are tracked as custom events
  - File uploads
  - Translation operations
  - Export operations
  - Errors

## How to Update the GA4 Measurement ID

To update your Google Analytics Measurement ID:

1. Set the `NEXT_PUBLIC_GA_ID` environment variable in your deployment environment
2. Or update the fallback value in `lib/analytics.ts`

## Adding New Event Tracking

To track additional events, use the `trackEvent` function:

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a simple event
trackEvent('event_name');

// Track an event with properties
trackEvent('event_name', {
  property1: 'value1',
  property2: 'value2'
});
```

## Error Tracking

The application tracks errors using the `trackError` function:

```typescript
import { trackError } from '@/lib/analytics';

try {
  // Some operation
} catch (error) {
  trackError('error_category', error.message);
}
```

## Server-Side Rendering Compatibility

The Google Analytics implementation is designed to be SSR-friendly:
- The GoogleAnalytics component uses Next.js Script component with the "afterInteractive" strategy
- All client-side code includes checks for `typeof window !== 'undefined'`
- Tracking functions have fallbacks between gtag and ReactGA 