// English translations
const en = {
  common: {
    appTitle: "SubtitleAI",
    appDescription: "Translate subtitles from SRT files using Gemini AI",
    loading: "Loading...",
    save: "Save",
    cancel: "Cancel",
    retry: "Retry",
    retryAll: "Retry All",
    retrying: "Retrying...",
    export: "Export",
    edit: "Edit",
    pause: "Pause",
    resume: "Resume",
    stop: "Stop",
    expand: "Expand",
    collapse: "Collapse",
    error: "Error",
    success: "Success",
    close: "Close",
    clear: "Clear"
  },
  apiKey: {
    title: "Gemini API Key",
    description: "Enter your Gemini API key to translate subtitles.",
    getKey: "Get a key",
    configuredAndReady: "API key configured and ready to use",
    enterKey: "Enter your Gemini API key...",
    show: "Show",
    hide: "Hide",
    isValid: "API key is valid",
    isInvalid: "Invalid API key. Please check and try again.",
    saveInBrowser: "Save API key in this browser",
    saveAndUse: "Save & Use Key",
    update: "Update API Key",
    validating: "Validating..."
  },
  aiProvider: {
    title: "AI Provider",
    description: "Choose AI provider to translate subtitles",
    selectProvider: "Select provider",
    gemini: "Google Gemini",
    openrouter: "OpenRouter",
    geminiDescription: "Direct API from Google, high performance",
    openrouterDescription: "Access multiple AI models at competitive prices",
    free: "Free",
    paid: "Paid"
  },
  openrouter: {
    title: "OpenRouter API Key",
    description: "OpenRouter provides access to multiple AI models at competitive prices",
    placeholder: "Enter your OpenRouter API key",
    getKey: "Get free API key at OpenRouter.ai",
    modelTitle: "OpenRouter Model",
    selectModel: "Select model",
    pricing: "Pricing",
    pricingPrompt: "Input",
    pricingCompletion: "Output", 
    perToken: "/token",
    context: "Context",
    tokens: "tokens",
    testing: "Testing...",
    valid: "Valid API key",
    invalid: "Invalid API key",
    freeModels: "Free Models",
    paidModels: "Premium Models",
    customModel: "Custom Model",
    enterCustomModel: "Enter Custom Model",
    customModelDescription: "Enter any OpenRouter model ID manually",
    customModelPlaceholder: "e.g., anthropic/claude-3.5-sonnet, openai/gpt-4o",
    customModelHint: "Press Enter to save, Escape to cancel",
    customModelSelected: "Custom Model Selected",
    // Error and warning popup messages
    errorTitle: "API Key Error",
    warningTitle: "Credits Warning",
    lowCreditsWarning: "Your OpenRouter account has negative credits. Consider using free models to avoid charges.",
    freeModelsRecommendation: "Free models like WizardLM-2 8x22B and Llama 3.1 8B are available and work great for translation tasks.",
    editCustomModel: "Edit",
    // Search functionality
    searchModels: "Search models...",
    searchPlaceholder: "Type to search for models",
    noModelsFound: "No models found",
    clearSearch: "Clear search",
    // Model loading states
    noModelsAvailable: "No models available",
    checkConnection: "Please check your connection and try again"
  },
  fileUpload: {
    title: "Upload Subtitle File",
    description: "Select an SRT, VTT, or ASS subtitle file to translate",
    dragAndDrop: "Drag and drop a subtitle file here, or click to select",
    dropFileHere: "Drop your subtitle file here...",
    dragAndDropHere: "Drag and drop your subtitle file here",
    orClickToSelect: "or click to select",
    browsing: "Browsing...",
    selectFile: "Select File",
    fileSelected: "File selected:",
    clearFile: "Clear file",
    invalidFormat: "Invalid file format. Please select an SRT, VTT, or ASS file.",
    noFileSelected: "No file selected",
    processingFile: "Processing file...",
    successfullyParsed: "Successfully parsed {count} subtitles.",
    invalidFileType: "Invalid file type. Please select a .srt, .vtt, or .ass file.",
    errorReadingFile: "Error reading file. Please try again.",
    formatDetected: "Format detected: {format}",
    supportedFormats: "Supported formats: SRT, VTT, ASS"
  },
  translationSettings: {
    title: "Translation Settings",
    description: "Configure how your subtitles will be translated",
    targetLanguage: "Target Language",
    selectLanguage: "Select or type a language",
    customPrompt: "Custom Prompt",
    customPromptDefault: "Translate the following subtitle to {language}. Maintain the original tone, style, and nuances. Keep it concise to fit the subtitle timing.",
    startTranslation: "Start Translation",
    translationInProgress: "Translating subtitles...",
    translationPaused: "Paused - Press 'Continue' to resume translation",
    translationStopped: "Translation stopped",
    translationCompleted: "Translation completed"
  },
  subtitleTable: {
    title: "Subtitles",
    description: "View and edit translated subtitles",
    id: "ID",
    time: "Time",
    originalText: "Original Text",
    translation: "Translation",
    status: "Status",
    action: "Action",
    batch: "Batch",
    showing: "Showing",
    subtitles: "subtitles",
    translated: "translated",
    errors: "errors",
    expandTable: "Expand table",
    collapseTable: "Collapse table",
    waitingToTranslate: "Waiting to translate...",
    translating: "Translating...",
    aiSuggestions: "AI Suggestions",
    chooseSuggestion: "Choose a better translation",
    clickToApply: "Click to apply",
    noSuggestions: "No suggestions available",
    suggestBetterTranslation: "Suggest better translation"
  },
  batchErrorDisplay: {
    failedBatches: "{count} failed {batches}",
    batch: "batch",
    batches: "batches",
    description: "Each batch contains up to 10 subtitles. Retry failed batches to complete the translation.",
    retryBatch: "Retry Batch"
  },
  errors: {
    apiKeyRequired: "API key is required. Please provide a valid Gemini API key.",
    fileRequired: "Please select an SRT file to translate.",
    translationError: "Translation Error",
    translationErrorDescription: "An error occurred during translation:",
    rateLimit: "Rate limit exceeded. Please wait a moment before retrying.",
    forbidden: "API access forbidden. Please check your API key.",
    unauthorized: "Unauthorized API access. Your API key may be invalid.",
    serverError: "Server error from Gemini API. Please try again later.",
    translationSuggestionFailed: "Could not generate AI suggestions. Please try again."
  },
  export: {
    exportTranslated: "Export Translated Subtitle",
    exportBilingual: "Export Bilingual Subtitle",
    bilingualDescription: "Export subtitle file with both original and translated subtitles",
    downloading: "Downloading...",
    noTranslatedSubtitles: "No translated subtitles to export.",
    exportFormat: "Export format:",
    keepOriginalFormat: "Keep original format"
  },
  preview: {
    title: "Video Preview",
    description: "Upload a video to preview with subtitles",
    uploadVideo: "Upload video to preview with subtitles",
    hideSubtitles: "Hide subtitles",
    showSubtitles: "Show subtitles",
    translatedOnly: "Translated",
    bilingual: "Bilingual",
    originalOnly: "Original",
    loadingVideo: "Loading video...",
    videoName: "Video name:",
    videoDuration: "Duration:",
    selectVideo: "Select video",
    dropVideoHere: "Drop your video here...",
    invalidVideoType: "Invalid file type. Please select a video file.",
    dragAndDropVideo: "Drag and drop video file here",
    fullScreenSubtitleTip: "Subtitles will still be displayed in fullscreen mode."
  },
  guide: {
    title: "User Guide",
    subtitle: "How to use the subtitle translation tool",
    introTitle: "Welcome to SubtitleAI",
    introDescription: "Your all-in-one solution for subtitle translation",
    introText: "This guide will help you understand how to use SubtitleAI to translate subtitle files effectively using Google's Gemini AI technology. Follow the sections below to learn each aspect of the translation process.",
    backToApp: "Back to application",
    tocTitle: "Table of Contents",
    section1: "Getting Started",
    section2: "Uploading Subtitles",
    section3: "Translation Settings",
    section4: "Translation Process",
    section5: "Editing Subtitles",
    section6: "Exporting Subtitles",
    section7: "Troubleshooting",
    section8: "Frequently Asked Questions",
    
    // Getting Started Section
    apiKeyTitle: "Setting up your Gemini API Key",
    apiKeyDescription: "To use SubtitleAI, you'll need a Google Gemini API key.",
    apiKeyStep1: "Visit the Google AI Studio website (https://ai.google.dev/)",
    apiKeyStep2: "Create or sign in to your Google account",
    apiKeyStep3: "Navigate to the API section and generate an API key",
    apiKeyStep4: "Copy the key and paste it into the API Key field in SubtitleAI",
    
    modelSelectionTitle: "Selecting an AI Model",
    modelSelectionDescription: "Choose the appropriate Gemini model based on your translation needs:",
    modelProDescription: "Good balance of speed and quality for most subtitle translations",
    model15ProDescription: "Higher quality for complex or nuanced content with better context understanding",
    model15FlashDescription: "Fastest option for simple translations and large files",
    model20FlashDescription: "Optimized for speed with good quality, perfect for most subtitle files and efficient processing",
    model25ProDescription: "Advanced experimental model with superior translation quality and context understanding for complex content",
    
    // Uploading Subtitles Section
    uploadMethodsTitle: "How to Upload Subtitle Files",
    uploadMethodsDescription: "There are two ways to upload your subtitle files:",
    uploadMethod1Title: "Click and Select",
    uploadMethod1Description: "Click on the file upload area and select your subtitle file from your device",
    uploadMethod2Title: "Drag and Drop",
    uploadMethod2Description: "Drag your subtitle file directly from your file explorer and drop it into the upload area",
    supportedFormatsNote: "Currently supported formats: SRT, VTT, and ASS subtitle files",
    
    // Translation Settings Section
    targetLanguageTitle: "Selecting the Target Language",
    targetLanguageDescription: "Choose the language you want to translate your subtitles into from the dropdown menu. You can select common languages or type a specific language not listed.",
    
    customPromptTitle: "Customizing Translation Prompts",
    customPromptDescription: "Fine-tune how Gemini AI translates your subtitles by modifying the prompt template. This can help achieve better translations for specific content types.",
    customPromptExample: "Translate the following subtitles to {language}. Maintain the original tone, style, and nuances. Keep it concise to fit subtitle timing.",
    customPromptTip: "For specific content types (e.g., technical, formal, humor), consider adding relevant instructions to the prompt.",
    
    // Translation Process Section
    startTranslationTitle: "Starting the Translation",
    startTranslationDescription: "Once you've uploaded your subtitle file and configured your settings, click the 'Start Translation' button to begin the translation process.",
    
    translationProgressTitle: "Understanding Translation Progress",
    translationProgressDescription: "During translation, each subtitle line will show one of these statuses:",
    statusPending: "Pending",
    statusPendingDescription: "Subtitle is waiting to be translated",
    statusTranslating: "Translating",
    statusTranslatingDescription: "Currently being processed by the AI",
    statusTranslated: "Translated",
    statusTranslatedDescription: "Successfully translated",
    statusError: "Error",
    statusErrorDescription: "Failed to translate due to an error",
    
    translationControlTitle: "Controlling the Translation Process",
    translationControlDescription: "You can manage the ongoing translation process using these controls:",
    pauseResumeTitle: "Pause/Resume",
    pauseResumeDescription: "Temporarily halt the translation process and continue later without losing progress",
    stopTitle: "Stop",
    stopDescription: "Completely stop the translation process (cannot be resumed)",
    
    // Editing Subtitles Section
    manualEditTitle: "Manually Editing Translations",
    manualEditDescription: "You can edit any translated subtitle to correct or improve it:",
    editStep1: "Click the 'Edit' button next to the subtitle you want to modify",
    editStep2: "Make your changes in the text area that appears",
    editStep3: "Click 'Save' to apply your changes or 'Cancel' to discard them",
    
    improveTranslationTitle: "AI-Assisted Translation Improvements",
    improveTranslationDescription: "For subtitles that don't sound quite right, you can use the AI suggestions feature to get alternative translations.",
    aiSuggestionTip: "Click the sparkle icon to get AI suggestions for better translations",
    
    retryFailedTitle: "Retrying Failed Translations",
    retryFailedDescription: "If some subtitles fail to translate, you can retry them individually or in batches:",
    retryButtonDescription: "Click the retry button next to a failed subtitle or use the batch retry option at the top of the failed batch",
    
    // Exporting Subtitles Section
    exportOptionsTitle: "Exporting Your Translated Subtitles",
    exportOptionsDescription: "Once you've completed translating and editing your subtitles, you can export them in different formats:",
    normalExportTitle: "Standard Export",
    normalExportDescription: "Export only the translated subtitles in the selected format",
    bilingualExportTitle: "Bilingual Export",
    bilingualExportDescription: "Export both original and translated text in each subtitle, ideal for language learning",
    exportFormatTip: "You can choose to export in the original format of your subtitle file or select a specific format (SRT, VTT, ASS)",
    
    // Troubleshooting Section
    commonIssuesTitle: "Common Issues and Solutions",
    
    issue1Title: "API Key Errors",
    issue1Solution: "If you see errors related to your API key, verify that it's entered correctly and that your Gemini API quota hasn't been exceeded. You might need to create a new key if the current one is invalid.",
    
    issue2Title: "Translation Failures",
    issue2Solution: "If multiple subtitles fail to translate, it could be due to rate limiting. Try using the 'Pause' button for a few seconds, then 'Resume'. You can also retry failed batches after waiting.",
    
    issue3Title: "Unsupported Characters",
    issue3Solution: "If your translations show missing or incorrect characters, ensure you've selected the correct target language. Some special characters might not display properly in certain subtitle formats.",
    
    issue4Title: "Slow Performance",
    issue4Solution: "For large subtitle files, consider selecting the Gemini 1.5 Flash model which is optimized for speed. Breaking up very large files into smaller segments can also help.",
    
    // Help and Feedback
    helpTitle: "Need More Help?",
    helpText: "This guide covers the basic functionality of SubtitleAI. For more advanced features or specific questions, please refer to the documentation or contact support.",
    feedbackText: "We're constantly improving SubtitleAI based on user feedback. If you have suggestions or encounter issues not covered in this guide, please let us know.",
    
    // FAQ Section
    faqTitle: "Frequently Asked Questions",
    faqDescription: "Quick answers to common questions about SubtitleAI",
    
    faq1Question: "Is my API key secure?",
    faq1Answer: "Yes, your Gemini API key is stored locally in your browser and never sent to our servers. It is only used to communicate directly with Google's API services.",
    
    faq2Question: "How much does it cost to use SubtitleAI?",
    faq2Answer: "SubtitleAI is a free tool. However, you need a Google Gemini API key which may incur costs depending on your usage and Google's pricing policy. New users typically get free credits when signing up.",
    
    faq3Question: "Can I translate multiple files simultaneously?",
    faq3Answer: "Currently, SubtitleAI processes one file at a time. We recommend finishing one translation before starting another for optimal performance.",
    
    faq4Question: "What languages are supported?",
    faq4Answer: "SubtitleAI supports translation to and from virtually any language that Gemini AI supports, which includes most major languages worldwide.",
    
    faq5Question: "Can I use SubtitleAI offline?",
    faq5Answer: "No, SubtitleAI requires an internet connection to communicate with Google's Gemini API for translations."
  },
  
  // Token Estimate translations
  tokenEstimate: {
    show: "Show tokens",
    hide: "Hide tokens",
    title: "Token Usage Estimate",
    subtitles: "subtitles",
    input: "Input:",
    output: "Output:",
    total: "Total:",
    cost: "Cost:",
    costBreakdown: "Cost Breakdown:",
    inputCost: "Input cost:",
    outputCost: "Output cost:",
    fastProcessing: "Fast processing expected",
    moderateProcessing: "Moderate processing time",
    largeFile: "Large file - may take time",
    loadingPricing: "(Loading pricing...)",
    pricingNotAvailable: "(Pricing not available)",
    livePricing: "(Live pricing)",
    standardRates: "(Standard rates)",
    inputToken: "Input",
    outputToken: "Output",
    perToken: "/token",
    builtInPricing: "Built-in pricing rates for",
    disclaimer: "* Estimates are approximate and may vary based on actual usage. Does not include tokens for prompts and other factors."
  },
  
  // New translations for enhanced guide UI
  guideUi: {
    searchPlaceholder: "Search in guide...",
    openTableOfContents: "Open Table of Contents",
    backToTop: "Back to top",
    printGuide: "Print guide",
    printedGuide: "Printed from SubtitleAI Guide"
  },
};

export default en;