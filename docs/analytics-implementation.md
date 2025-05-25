# Google Analytics Implementation for Model Tracking

## Overview

This document describes the enhanced Google Analytics implementation for tracking subtitle translation interactions by AI model type and provider.

## Enhanced Tracking Features

### 1. Button Click Tracking (`trackTranslateButtonClick`)

Tracks when users click the translate button, providing detailed information about:
- AI Provider (Gemini vs OpenRouter)
- Specific model being used
- Model type (free, paid, experimental)
- Number of subtitles to translate
- Source and target languages

**Event Name:** `translate_button_click`

**Event Parameters:**
```javascript
{
  source: 'auto',
  target: 'vi', // or target language
  count: 150, // number of subtitles
  ai_provider: 'gemini', // or 'openrouter'
  model: 'gemini-2.0-flash', // specific model ID
  model_type: 'free', // 'free', 'paid', or 'experimental'
  provider_model: 'gemini:gemini-2.0-flash', // combined identifier
  timestamp: '2025-05-26T10:30:00.000Z'
}
```

### 2. Model Selection Tracking (`trackModelSelection`)

Tracks when users change AI models within the same provider:

**Event Name:** `model_selection`

**Event Parameters:**
```javascript
{
  ai_provider: 'gemini',
  previous_model: 'gemini-2.0-flash',
  new_model: 'gemini-2.5-pro-exp',
  model_type: 'experimental',
  provider_model: 'gemini:gemini-2.5-pro-exp',
  timestamp: '2025-05-26T10:30:00.000Z'
}
```

### 3. Provider Switch Tracking (`trackProviderSwitch`)

Tracks when users switch between AI providers (Gemini ↔ OpenRouter):

**Event Name:** `provider_switch`

**Event Parameters:**
```javascript
{
  previous_provider: 'gemini',
  new_provider: 'openrouter',
  previous_model: 'gemini-2.0-flash',
  new_model: 'openai/gpt-4o-mini',
  previous_provider_model: 'gemini:gemini-2.0-flash',
  new_provider_model: 'openrouter:openai/gpt-4o-mini',
  timestamp: '2025-05-26T10:30:00.000Z'
}
```

## Helper Functions

### Model Type Detection

- `getGeminiModelType(modelId)`: Returns 'free', 'paid', or 'experimental'
- `getOpenRouterModelType(modelId, pricingInfo)`: Returns 'free' or 'paid'
- `createDetailedModelKey(provider, modelId, modelType)`: Creates unique analytics key

## Usage in Components

The tracking is automatically integrated into:

1. **SubtitleTranslator.tsx**:
   - Button click tracking in `handleTranslate()`
   - Model change tracking in `handleModelChange()`
   - OpenRouter model change tracking in `handleOpenRouterModelChange()`
   - Provider switch tracking in `handleAiProviderChange()`

## Analytics Dashboard Queries

### Most Popular Models by Provider

```javascript
// GA4 Custom Report
// Dimensions: ai_provider, model, model_type
// Metrics: Event count
// Filter: Event name = translate_button_click
```

### Translation Volume by Model Type

```javascript
// GA4 Custom Report
// Dimensions: model_type, ai_provider
// Metrics: Event count, sum of custom parameter 'count'
// Filter: Event name = translate_button_click
```

### Provider Switching Patterns

```javascript
// GA4 Custom Report
// Dimensions: previous_provider, new_provider
// Metrics: Event count
// Filter: Event name = provider_switch
```

## Data Analysis Examples

### Top Performing Models

Use the `translate_button_click` events to identify:
- Most frequently used models
- Model preferences by language pair
- Usage patterns between free vs paid models

### User Journey Analysis

Track the sequence:
1. `provider_switch` → User changes from Gemini to OpenRouter
2. `model_selection` → User experiments with different models
3. `translate_button_click` → User performs translation

### Cost Analysis

Correlate `model_type` (free/paid) with translation volume to understand:
- Free vs paid model usage ratios
- Cost implications of model choices
- User willingness to use paid models

## Implementation Details

### Event Timing

- **Button Click**: Fired immediately when translate button is clicked
- **Model Selection**: Fired when user changes model within same provider
- **Provider Switch**: Fired when user switches between Gemini and OpenRouter

### Data Privacy

All tracking respects user privacy:
- No personal information is tracked
- Only usage patterns and model preferences
- No actual subtitle content is transmitted

### Performance Impact

- Lightweight tracking with minimal overhead
- Asynchronous event firing
- No impact on translation performance
