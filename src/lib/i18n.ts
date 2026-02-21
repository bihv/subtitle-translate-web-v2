export type Language = 'vi' | 'en';

export interface Translations {
  // App Title
  appTitle: string;
  appDescription: string;

  // Navigation
  nav: {
    home: string;
    docs: string;
  };

  // Docs page
  docs: {
    title: string;
    subtitle: string;
    uiTab: string;
    apiTab: string;
    ui: {
      gettingStarted: string;
      gettingStartedDesc: string;
      step1Title: string;
      step1Desc: string;
      step2Title: string;
      step2Desc: string;
      step3Title: string;
      step3Desc: string;
      step4Title: string;
      step4Desc: string;
      supportedFormats: string;
      supportedFormatsDesc: string;
      formatSrt: string;
      formatVtt: string;
      formatAss: string;
      formatJson: string;
      formatXml: string;
      translationModes: string;
      translationModesDesc: string;
      guestModeTitle: string;
      guestModeDesc: string;
      customKeyTitle: string;
      customKeyDesc: string;
      providers: string;
      providersDesc: string;
      providerGemini: string;
      providerGeminiDesc: string;
      providerOpenRouter: string;
      providerOpenRouterDesc: string;
      providerCustom: string;
      providerCustomDesc: string;
      advancedSettings: string;
      advancedSettingsDesc: string;
      settingContext: string;
      settingContextDesc: string;
      settingStyle: string;
      settingStyleDesc: string;
      settingBatchSize: string;
      settingBatchSizeDesc: string;
      exportOptions: string;
      exportOptionsDesc: string;
      exportSingle: string;
      exportSingleDesc: string;
      exportBatch: string;
      exportBatchDesc: string;
      exportBilingual: string;
      exportBilingualDesc: string;
      videoPreview: string;
      videoPreviewDesc: string;
    };
    api: {
      overview: string;
      overviewDesc: string;
      baseUrl: string;
      authentication: string;
      authenticationDesc: string;
      endpoints: string;
      listModels: string;
      listModelsDesc: string;
      listModelsResponse: string;
      translateFile: string;
      translateFileDesc: string;
      requestFormat: string;
      parameters: string;
      paramName: string;
      paramType: string;
      paramRequired: string;
      paramDescription: string;
      paramYes: string;
      paramNo: string;
      paramFileDesc: string;
      paramApiKeyDesc: string;
      paramProviderDesc: string;
      paramModelDesc: string;
      paramTargetLanguageDesc: string;
      paramContextDesc: string;
      paramStyleDesc: string;
      paramBatchSizeDesc: string;
      paramCustomEndpointDesc: string;
      responseFormat: string;
      responseFormatDesc: string;
      streamingResponse: string;
      streamingResponseDesc: string;
      translatingEvent: string;
      doneEvent: string;
      errorEvent: string;
      streamingExample: string;
      errorExample: string;
      curlExample: string;
      jsExample: string;
      errorHandling: string;
      errorHandlingDesc: string;
      errorCode: string;
      errorDescription: string;
      error400: string;
      error400Desc: string;
      error500: string;
      error500Desc: string;
    };
  };

  // File Upload
  uploadTitle: string;
  uploadDragText: string;
  uploadClickText: string;
  uploadSupported: string;


  // AI Settings
  aiProvider: string;
  aiModel: string;
  apiKey: string;
  apiKeyPlaceholder: string;
  targetLanguage: string;
  customPrompt: string;
  customPromptPlaceholder: string;

  // Translation
  startTranslation: string;


  // Subtitle Table
  index: string;

  originalText: string;
  translatedText: string;
  status: string;
  actions: string;

  // Status
  pending: string;
  translating: string;
  completed: string;
  error: string;
  edited: string;

  // Export
  export: string;
  exportOriginal: string;
  exportBilingual: string;
  exportFormat: string;
  exportDescription: string;
  download: string;

  // Theme
  lightMode: string;
  darkMode: string;


  // Common
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  confirm: string;
  warning: string;

  clear: string;
  close: string;

  // API Key
  apiKeyInput: {
    geminiTitle: string;
    geminiDescription: string;
    openrouterTitle: string;
    openrouterDescription: string;
    placeholder: string;
    getKey: string;
    getKeyGemini: string;
    getKeyOpenRouter: string;
    show: string;
    hide: string;
    valid: string;
    invalid: string;
    validating: string;
    saveInBrowser: string;
    saveAndUse: string;
    update: string;
    configured: string;
    lowCreditsWarning: string;
    freeModelsRecommendation: string;
    warningTitle: string;
    errorValidating: string;
  };

  // AI Translation specific
  ai: {
    title: string;
    provider: string;
    model: string;
    selectProvider: string;
    selectModel: string;
    enterApiKey: string;
    invalidApiKey: string;
    sourceLanguage: string;
    selectSourceLanguage: string;
    selectTargetLanguage: string;
    advanced: string;
    basic: string;
    advancedSettings: string;
    context: string;
    contextHelp: string;
    contextPlaceholder: string;
    style: string;
    styleHelp: string;
    selectStyle: string;
    styleFormal: string;
    styleCasual: string;
    styleTechnical: string;
    styleCreative: string;
    batchSize: string;
    batchSizeHelp: string;
    estimatedCost: string;
    preparing: string;
    translating: string;
    completed: string;
    error: string;
    batch: string;
    stop: string;
    translationStopped: string;
    preview: string;
    deleteConfirm: string;
    of: string;
    items: string;
    timeRange: string;
    progress: string;
    failed: string;
    totalTokens: string;
    currentBatch: string;
    totalBatches: string;
    percentage: string;
    mode: string;
    guestMode: string;
    customKey: string;
    guestModeInfo: string;
    guestAccess: string;
    guestAccessDescription: string;
    quotaExceeded: string;
    apiKeyExpired: string;
    configureEndpointAndKey: string;
  };

  // Language Selector
  languageSelector: {
    tooltip: string;
    customLanguageSelected: string;
    addCustomLanguage: string;
  };

  // Video Preview
  videoPreview: {
    title: string;
    videoSource: string;
    loadFromUrl: string;
    uploadFromDevice: string;
    urlPlaceholder: string;
    loadUrl: string;
    urlTip: string;
    clickOrDragVideo: string;
    supportedFormats: string;
    changeVideo: string;
    videoLoaded: string;
    videoUrlSet: string;
    invalidVideoFile: string;
    videoLoadFailed: string;
    videoUrlFailed: string;
    enterVideoUrl: string;
    corsWarning: string;
  };

  // Export Panel
  exportPanel: {
    batchExport: string;
    singleExport: string;
    selectFormats: string;
    chooseFormats: string;
    bilingualTooltip: string;
    bilingualSubtext: string;
    exportFormats: string;
    exportInfo: string;
    original: string;
    format: string;
    modeLabel: string;
    bilingual: string;
    translationOnly: string;
    exportFailed: string;
    batchExportFailed: string;
    quickExportFailed: string;
    downloadTranslated: string;
  };

  // Translation Mode
  translationMode: {
    freeQuotaTooltip: string;
    freeQuotaAvailable: string;
    dailyLimitReached: string;
  };

  // Custom API
  customApi: {
    emptyFieldsError: string;
    invalidEndpoint: string;
    configSaved: string;
  };

  // File Upload
  fileUpload: {
    invalidFormat: string;
    validationFailed: string;
    readFailed: string;
    parseFailed: string;
    uploadFailed: string;
  };

  // Steps
  steps: {
    upload: string;
    settings: string;
    translating: string;
    results: string;
  };

  // Flow
  flow: {
    fileLoaded: string;
    changeFile: string;
    startOver: string;
    translationInProgress: string;
    readyToExport: string;
    heroTitle: string;
    heroSubtitle: string;
  };
}

export const translations: Record<Language, Translations> = {
  vi: {
    // App Title
    appTitle: 'SubtitleAI',
    appDescription: 'Dịch phụ đề tự động bằng AI',

    // Navigation
    nav: {
      home: 'Trang chủ',
      docs: 'Tài liệu',
    },

    // Docs page
    docs: {
      title: 'Tài liệu hướng dẫn',
      subtitle: 'Hướng dẫn sử dụng giao diện web và API',
      uiTab: 'Hướng dẫn sử dụng',
      apiTab: 'Tài liệu API',
      ui: {
        gettingStarted: 'Bắt đầu nhanh',
        gettingStartedDesc: 'SubtitleAI giúp bạn dịch phụ đề tự động bằng AI chỉ với 4 bước đơn giản:',
        step1Title: 'Tải lên file phụ đề',
        step1Desc: 'Kéo thả hoặc chọn file phụ đề (SRT, VTT, ASS, JSON, XML) từ máy tính.',
        step2Title: 'Cấu hình dịch thuật',
        step2Desc: 'Chọn nhà cung cấp AI, mô hình, ngôn ngữ đích và nhập API key (hoặc dùng chế độ khách miễn phí).',
        step3Title: 'Bắt đầu dịch',
        step3Desc: 'Nhấn nút dịch và theo dõi tiến trình dịch thuật theo thời gian thực.',
        step4Title: 'Xuất kết quả',
        step4Desc: 'Tải xuống file đã dịch với nhiều định dạng, hỗ trợ song ngữ và xem trước video.',
        supportedFormats: 'Định dạng hỗ trợ',
        supportedFormatsDesc: 'SubtitleAI hỗ trợ nhiều định dạng phụ đề và file văn bản phổ biến:',
        formatSrt: 'SRT — Định dạng phụ đề phổ biến nhất, tương thích với hầu hết trình phát video.',
        formatVtt: 'VTT (WebVTT) — Định dạng phụ đề web, hỗ trợ styling và positioning.',
        formatAss: 'ASS/SSA — Định dạng phụ đề nâng cao với hỗ trợ hiệu ứng và kiểu chữ phong phú.',
        formatJson: 'JSON — File JSON với các cặp key-value chứa văn bản cần dịch.',
        formatXml: 'XML — File XML chứa nội dung văn bản cần dịch.',
        translationModes: 'Chế độ dịch',
        translationModesDesc: 'Có 2 chế độ dịch thuật để bạn lựa chọn:',
        guestModeTitle: 'Chế độ Khách (Miễn phí)',
        guestModeDesc: 'Sử dụng API key hệ thống với Google Gemini Flash. Miễn phí nhưng có giới hạn số lượt dịch mỗi ngày.',
        customKeyTitle: 'Key riêng',
        customKeyDesc: 'Sử dụng API key cá nhân của bạn. Không giới hạn số lượt, hỗ trợ nhiều nhà cung cấp AI.',
        providers: 'Nhà cung cấp AI',
        providersDesc: 'SubtitleAI hỗ trợ 3 nhà cung cấp AI:',
        providerGemini: 'Google Gemini',
        providerGeminiDesc: 'Mô hình AI của Google. Hỗ trợ Gemini Flash (miễn phí) và Gemini Pro. Lấy API key tại Google AI Studio.',
        providerOpenRouter: 'OpenRouter',
        providerOpenRouterDesc: 'Truy cập hàng trăm mô hình AI (GPT-4, Claude, Llama, v.v.) với một API key duy nhất. Nhiều mô hình miễn phí.',
        providerCustom: 'Custom Endpoint',
        providerCustomDesc: 'Kết nối với bất kỳ API tương thích OpenAI nào. Nhập endpoint URL và API key của bạn.',
        advancedSettings: 'Cài đặt nâng cao',
        advancedSettingsDesc: 'Tùy chỉnh chất lượng dịch thuật với các cài đặt nâng cao:',
        settingContext: 'Ngữ cảnh',
        settingContextDesc: 'Mô tả nội dung video/file để AI hiểu ngữ cảnh tốt hơn. VD: "Phim hành động", "Video hướng dẫn nấu ăn".',
        settingStyle: 'Phong cách dịch',
        settingStyleDesc: 'Chọn phong cách: Trang trọng, Thân mật, Kỹ thuật, hoặc Sáng tạo.',
        settingBatchSize: 'Kích thước lô',
        settingBatchSizeDesc: 'Số lượng phụ đề xử lý cùng lúc (30-100). Lô lớn hơn nhanh hơn nhưng có thể giảm chất lượng.',
        exportOptions: 'Xuất file',
        exportOptionsDesc: 'Nhiều tùy chọn xuất file linh hoạt:',
        exportSingle: 'Xuất đơn',
        exportSingleDesc: 'Xuất một file với định dạng bạn chọn.',
        exportBatch: 'Xuất hàng loạt',
        exportBatchDesc: 'Xuất nhiều định dạng cùng lúc (SRT, VTT, ASS).',
        exportBilingual: 'Song ngữ',
        exportBilingualDesc: 'Bao gồm cả văn bản gốc và bản dịch trong file xuất.',
        videoPreview: 'Xem trước Video',
        videoPreviewDesc: 'Tải lên video hoặc nhập URL để xem trước phụ đề đã dịch trực tiếp trên video. Hỗ trợ MP4, WebM và nhiều định dạng khác.',
      },
      api: {
        overview: 'Tổng quan API',
        overviewDesc: 'SubtitleAI cung cấp REST API để dịch phụ đề tự động. API hỗ trợ streaming response (NDJSON) để theo dõi tiến trình dịch thuật theo thời gian thực.',
        baseUrl: 'Base URL',
        authentication: 'Xác thực',
        authenticationDesc: 'API sử dụng API key của nhà cung cấp AI (Google Gemini, OpenRouter, hoặc custom). Key được gửi qua trường `apiKey` trong form data, không qua header.',
        endpoints: 'Endpoints',
        listModels: 'Danh sách mô hình',
        listModelsDesc: 'Lấy danh sách các mô hình AI có sẵn từ Google Gemini và OpenRouter.',
        listModelsResponse: 'Response trả về object với 2 mảng: `google` (mô hình Gemini) và `openrouter` (mô hình OpenRouter với thông tin giá và context length).',
        translateFile: 'Dịch file phụ đề',
        translateFileDesc: 'Tải lên file phụ đề và dịch sang ngôn ngữ đích. Response là streaming NDJSON.',
        requestFormat: 'Định dạng request',
        parameters: 'Tham số',
        paramName: 'Tên',
        paramType: 'Kiểu',
        paramRequired: 'Bắt buộc',
        paramDescription: 'Mô tả',
        paramYes: 'Có',
        paramNo: 'Không',
        paramFileDesc: 'File phụ đề (.srt, .vtt, .ass, .json, .xml). Tối đa 10MB.',
        paramApiKeyDesc: 'API key của nhà cung cấp AI.',
        paramProviderDesc: 'Nhà cung cấp AI: google, openrouter, hoặc custom.',
        paramModelDesc: 'ID mô hình AI (VD: gemini-2.0-flash, gpt-4o).',
        paramTargetLanguageDesc: 'Ngôn ngữ đích (VD: vi, en, ja, ko).',
        paramContextDesc: 'Ngữ cảnh để cải thiện chất lượng dịch.',
        paramStyleDesc: 'Phong cách dịch: formal, casual, technical, creative.',
        paramBatchSizeDesc: 'Số phụ đề mỗi lô (1-100, mặc định 50).',
        paramCustomEndpointDesc: 'URL endpoint cho custom provider (bắt buộc khi provider=custom).',
        responseFormat: 'Định dạng response',
        responseFormatDesc: 'Response là streaming NDJSON (mỗi dòng là một JSON object):',
        streamingResponse: 'Streaming Response',
        streamingResponseDesc: 'Mỗi dòng trong response là một JSON object với các trường sau:',
        translatingEvent: 'Sự kiện đang dịch — chứa index, originalText, translatedText, completed, total.',
        doneEvent: 'Sự kiện hoàn thành — dòng cuối cùng có status "done".',
        errorEvent: 'Sự kiện lỗi — chứa message và code mô tả lỗi.',
        streamingExample: 'Ví dụ Streaming',
        errorExample: 'Ví dụ Error',
        curlExample: 'Ví dụ cURL',
        jsExample: 'Ví dụ JavaScript',
        errorHandling: 'Xử lý lỗi',
        errorHandlingDesc: 'API trả về mã lỗi HTTP chuẩn:',
        errorCode: 'Mã lỗi',
        errorDescription: 'Mô tả',
        error400: '400 Bad Request',
        error400Desc: 'Thiếu tham số bắt buộc, file không hợp lệ, hoặc provider không đúng.',
        error500: '500 Internal Server Error',
        error500Desc: 'Lỗi server nội bộ. Vui lòng thử lại sau.',
      },
    },

    // File Upload
    uploadTitle: 'Tải lên file phụ đề',
    uploadDragText: 'Kéo thả file vào đây',
    uploadClickText: 'hoặc click để chọn',
    uploadSupported: 'Hỗ trợ: SRT, VTT, ASS',


    // AI Settings
    aiProvider: 'Nhà cung cấp AI',
    aiModel: 'Mô hình AI',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Nhập API key của bạn',
    targetLanguage: 'Ngôn ngữ đích',
    customPrompt: 'Prompt tùy chỉnh',
    customPromptPlaceholder: 'Nhập prompt tùy chỉnh (tùy chọn)',

    // Translation
    startTranslation: 'Bắt đầu dịch',


    // Subtitle Table
    index: 'STT',

    originalText: 'Văn bản gốc',
    translatedText: 'Bản dịch',
    status: 'Trạng thái',
    actions: 'Thao tác',

    // Status
    pending: 'Chờ xử lý',
    translating: 'Đang dịch',
    completed: 'Hoàn thành',
    error: 'Lỗi',
    edited: 'Đã chỉnh sửa',

    // Export
    export: 'Xuất file',
    exportOriginal: 'Định dạng gốc',
    exportBilingual: 'Song ngữ',
    exportFormat: 'Định dạng xuất',
    exportDescription: 'Tải xuống file đã dịch với định dạng gốc.',
    download: 'Tải xuống',

    // Theme
    lightMode: 'Sáng',
    darkMode: 'Tối',


    // Common
    save: 'Lưu',
    cancel: 'Hủy',
    edit: 'Chỉnh sửa',
    delete: 'Xóa',
    confirm: 'Xác nhận',
    warning: 'Cảnh báo',

    clear: 'Xóa',
    close: 'Đóng',

    // API Key
    apiKeyInput: {
      geminiTitle: 'Khóa API Gemini',
      geminiDescription: 'Nhập khóa API Gemini để dịch phụ đề',
      openrouterTitle: 'Khóa API OpenRouter',
      openrouterDescription: 'OpenRouter cung cấp truy cập đến nhiều model AI với giá cả cạnh tranh',
      placeholder: 'Nhập API key của bạn',
      getKey: 'Lấy khóa',
      getKeyGemini: 'Lấy khóa API tại Google AI Studio',
      getKeyOpenRouter: 'Lấy API key miễn phí tại OpenRouter.ai',
      show: 'Hiện',
      hide: 'Ẩn',
      valid: 'Khóa API hợp lệ',
      invalid: 'Khóa API không hợp lệ',
      validating: 'Đang xác thực...',
      saveInBrowser: 'Lưu khóa API trong trình duyệt này',
      saveAndUse: 'Lưu & Sử dụng khóa',
      update: 'Cập nhật khóa API',
      configured: 'Khóa API đã được cấu hình và sẵn sàng sử dụng',
      lowCreditsWarning: 'Tài khoản OpenRouter của bạn có số dư âm. Hãy cân nhắc sử dụng các mô hình miễn phí để tránh phí.',
      freeModelsRecommendation: 'Các mô hình miễn phí như Llama 3.1 8B và Gemma 2 9B hoạt động rất tốt cho việc dịch thuật.',
      warningTitle: 'Cảnh báo về tín dụng',
      errorValidating: 'Lỗi khi xác thực API key'
    },

    // AI Translation specific
    ai: {
      title: 'Dịch thuật AI',
      provider: 'Nhà cung cấp',
      model: 'Mô hình',
      selectProvider: 'Chọn nhà cung cấp',
      selectModel: 'Chọn mô hình',
      enterApiKey: 'Nhập API key',
      invalidApiKey: 'API key không hợp lệ',
      sourceLanguage: 'Ngôn ngữ nguồn',
      selectSourceLanguage: 'Chọn ngôn ngữ nguồn',
      selectTargetLanguage: 'Chọn ngôn ngữ đích',
      advanced: 'Nâng cao',
      basic: 'Cơ bản',
      advancedSettings: 'Cài đặt nâng cao',
      context: 'Ngữ cảnh',
      contextHelp: 'Cung cấp ngữ cảnh để cải thiện chất lượng dịch',
      contextPlaceholder: 'VD: Đây là video về công nghệ, phim hành động...',
      style: 'Phong cách',
      styleHelp: 'Chọn phong cách dịch phù hợp',
      selectStyle: 'Chọn phong cách',
      styleFormal: 'Trang trọng',
      styleCasual: 'Thân mật',
      styleTechnical: 'Kỹ thuật',
      styleCreative: 'Sáng tạo',
      batchSize: 'Kích thước lô',
      batchSizeHelp: 'Số lượng phụ đề xử lý cùng lúc (30-100)',
      estimatedCost: 'Chi phí ước tính',
      preparing: 'Đang chuẩn bị...',
      translating: 'Đang dịch...',
      completed: 'Hoàn thành',
      error: 'Lỗi',
      batch: 'Lô',
      stop: 'Dừng',
      translationStopped: 'Đã dừng dịch thuật',
      preview: 'Xem trước',
      deleteConfirm: 'Bạn có chắc chắn muốn xóa phụ đề này?',
      of: 'của',
      items: 'mục',
      timeRange: 'Khoảng thời gian',
      progress: 'Tiến độ',
      failed: 'Thất bại',
      totalTokens: 'Tổng Token',
      currentBatch: 'Lô hiện tại',
      totalBatches: 'Tổng số lô',
      percentage: 'Phần trăm',
      mode: 'Chế độ dịch',
      guestMode: 'Khách (Miễn phí)',
      customKey: 'Key riêng',
      guestModeInfo: 'Sử dụng API key hệ thống với giới hạn tốc độ.',
      guestAccess: 'Truy cập khách',
      guestAccessDescription: 'Sử dụng API Key hệ thống. Dịch miễn phí bằng Google Gemini (Flash).',
      quotaExceeded: 'Đã đạt giới hạn dịch thuật hàng ngày. Vui lòng sử dụng API Key riêng hoặc thử lại vào ngày mai.',
      apiKeyExpired: 'API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra cài đặt.',
      configureEndpointAndKey: 'Vui lòng cấu hình endpoint và API key'
    },

    languageSelector: {
      tooltip: 'Chọn từ danh sách hoặc nhập ngôn ngữ tùy chỉnh (VD: Swahili, Zulu, etc.)',
      customLanguageSelected: 'Đã chọn ngôn ngữ',
      addCustomLanguage: 'làm ngôn ngữ tùy chỉnh'
    },

    videoPreview: {
      title: 'Xem trước Video',
      videoSource: 'Nguồn Video:',
      loadFromUrl: 'Tải từ URL',
      uploadFromDevice: 'Tải lên từ thiết bị',
      urlPlaceholder: 'Nhập URL video (mp4, webm, v.v.) - Lưu ý: Một số URL có thể bị hạn chế CORS',
      loadUrl: 'Tải URL',
      urlTip: '💡 Mẹo: Nếu video không tải được, hãy thử dùng URL trực tiếp hoặc tải lên file cục bộ. Một số dịch vụ video chặn yêu cầu cross-origin.',
      clickOrDragVideo: 'Click hoặc kéo thả file video vào đây',
      supportedFormats: 'Hỗ trợ MP4, WebM, AVI, MOV và các định dạng video khác',
      changeVideo: 'Đổi Video',
      videoLoaded: 'Đã tải video thành công',
      videoUrlSet: 'Đã thiết lập URL video thành công',
      invalidVideoFile: 'Vui lòng chọn một file video hợp lệ',
      videoLoadFailed: 'Không thể tải file video',
      videoUrlFailed: 'Không thể thiết lập URL video. Video vẫn có thể hoạt động nếu CORS được cấu hình đúng.',
      enterVideoUrl: 'Vui lòng nhập URL video',
      corsWarning: 'Video có thể không tải được do hạn chế CORS. Hãy thử dùng URL khác hoặc file cục bộ.'
    },

    exportPanel: {
      batchExport: 'Xuất hàng loạt',
      singleExport: 'Xuất đơn',
      selectFormats: 'Chọn định dạng:',
      chooseFormats: 'Chọn định dạng để xuất',
      bilingualTooltip: 'Bao gồm cả văn bản gốc và bản dịch',
      bilingualSubtext: '(Gốc + Bản dịch)',
      exportFormats: 'Xuất {count} định dạng',
      exportInfo: 'Thông tin xuất:',
      original: 'Gốc',
      format: 'Định dạng',
      modeLabel: 'Chế độ',
      bilingual: 'Song ngữ',
      translationOnly: 'Chỉ bản dịch',
      exportFailed: 'Xuất file thất bại',
      batchExportFailed: 'Xuất hàng loạt thất bại',
      quickExportFailed: 'Xuất nhanh thất bại',
      downloadTranslated: 'Tải xuống bản dịch'
    },

    translationMode: {
      freeQuotaTooltip: 'Bạn còn {remaining} lượt dịch miễn phí hôm nay.',
      freeQuotaAvailable: 'Còn quota miễn phí',
      dailyLimitReached: 'Đã đạt giới hạn hàng ngày'
    },

    customApi: {
      emptyFieldsError: 'Endpoint và API key không được để trống',
      invalidEndpoint: 'Endpoint không hợp lệ',
      configSaved: 'Đã lưu cấu hình'
    },

    fileUpload: {
      invalidFormat: 'Định dạng file không hợp lệ hoặc kích thước quá lớn',
      validationFailed: 'Xác minh file thất bại',
      readFailed: 'Không thể đọc nội dung file',
      parseFailed: 'Không thể phân tích file',
      uploadFailed: 'Tải lên thất bại'
    },

    steps: {
      upload: 'Tải lên',
      settings: 'Cài đặt',
      translating: 'Dịch thuật',
      results: 'Kết quả'
    },

    flow: {
      fileLoaded: 'File đã tải',
      changeFile: 'Đổi file',
      startOver: 'Bắt đầu lại',
      translationInProgress: 'Đang dịch...',
      readyToExport: 'Sẵn sàng xuất file!',
      heroTitle: 'Dịch phụ đề bằng AI',
      heroSubtitle: 'Tải lên file phụ đề để bắt đầu dịch tự động'
    }
  },
  en: {
    // App Title
    appTitle: 'SubtitleAI',
    appDescription: 'AI-Powered Subtitle Translation',

    // Navigation
    nav: {
      home: 'Home',
      docs: 'Docs',
    },

    // Docs page
    docs: {
      title: 'Documentation',
      subtitle: 'Guide for using the web interface and API',
      uiTab: 'User Guide',
      apiTab: 'API Reference',
      ui: {
        gettingStarted: 'Getting Started',
        gettingStartedDesc: 'SubtitleAI helps you translate subtitles automatically with AI in just 4 simple steps:',
        step1Title: 'Upload subtitle file',
        step1Desc: 'Drag & drop or select a subtitle file (SRT, VTT, ASS, JSON, XML) from your computer.',
        step2Title: 'Configure translation',
        step2Desc: 'Choose AI provider, model, target language and enter your API key (or use free guest mode).',
        step3Title: 'Start translation',
        step3Desc: 'Click translate and monitor the real-time translation progress.',
        step4Title: 'Export results',
        step4Desc: 'Download translated files in multiple formats, with bilingual support and video preview.',
        supportedFormats: 'Supported Formats',
        supportedFormatsDesc: 'SubtitleAI supports many popular subtitle and text file formats:',
        formatSrt: 'SRT — The most popular subtitle format, compatible with most video players.',
        formatVtt: 'VTT (WebVTT) — Web subtitle format with styling and positioning support.',
        formatAss: 'ASS/SSA — Advanced subtitle format with rich effects and typography support.',
        formatJson: 'JSON — JSON files with key-value pairs containing text to translate.',
        formatXml: 'XML — XML files containing text content to translate.',
        translationModes: 'Translation Modes',
        translationModesDesc: 'There are 2 translation modes to choose from:',
        guestModeTitle: 'Guest Mode (Free)',
        guestModeDesc: 'Uses system API key with Google Gemini Flash. Free but limited daily translations.',
        customKeyTitle: 'Custom Key',
        customKeyDesc: 'Use your own personal API key. Unlimited translations, supports multiple AI providers.',
        providers: 'AI Providers',
        providersDesc: 'SubtitleAI supports 3 AI providers:',
        providerGemini: 'Google Gemini',
        providerGeminiDesc: 'Google\'s AI models. Supports Gemini Flash (free) and Gemini Pro. Get API key at Google AI Studio.',
        providerOpenRouter: 'OpenRouter',
        providerOpenRouterDesc: 'Access hundreds of AI models (GPT-4, Claude, Llama, etc.) with a single API key. Many free models available.',
        providerCustom: 'Custom Endpoint',
        providerCustomDesc: 'Connect to any OpenAI-compatible API. Enter your endpoint URL and API key.',
        advancedSettings: 'Advanced Settings',
        advancedSettingsDesc: 'Customize translation quality with advanced settings:',
        settingContext: 'Context',
        settingContextDesc: 'Describe the video/file content so AI understands the context better. E.g., "Action movie", "Cooking tutorial".',
        settingStyle: 'Translation Style',
        settingStyleDesc: 'Choose style: Formal, Casual, Technical, or Creative.',
        settingBatchSize: 'Batch Size',
        settingBatchSizeDesc: 'Number of subtitles processed at once (30-100). Larger batches are faster but may reduce quality.',
        exportOptions: 'Export Options',
        exportOptionsDesc: 'Flexible export options:',
        exportSingle: 'Single Export',
        exportSingleDesc: 'Export a single file in your chosen format.',
        exportBatch: 'Batch Export',
        exportBatchDesc: 'Export multiple formats at once (SRT, VTT, ASS).',
        exportBilingual: 'Bilingual',
        exportBilingualDesc: 'Include both original and translated text in the exported file.',
        videoPreview: 'Video Preview',
        videoPreviewDesc: 'Upload a video or enter a URL to preview translated subtitles directly on the video. Supports MP4, WebM and many other formats.',
      },
      api: {
        overview: 'API Overview',
        overviewDesc: 'SubtitleAI provides a REST API for automatic subtitle translation. The API supports streaming responses (NDJSON) for real-time translation progress tracking.',
        baseUrl: 'Base URL',
        authentication: 'Authentication',
        authenticationDesc: 'The API uses the AI provider\'s API key (Google Gemini, OpenRouter, or custom). The key is sent via the `apiKey` field in form data, not via headers.',
        endpoints: 'Endpoints',
        listModels: 'List Models',
        listModelsDesc: 'Get the list of available AI models from Google Gemini and OpenRouter.',
        listModelsResponse: 'Response returns an object with 2 arrays: `google` (Gemini models) and `openrouter` (OpenRouter models with pricing and context length info).',
        translateFile: 'Translate Subtitle File',
        translateFileDesc: 'Upload a subtitle file and translate it to the target language. Response is streaming NDJSON.',
        requestFormat: 'Request Format',
        parameters: 'Parameters',
        paramName: 'Name',
        paramType: 'Type',
        paramRequired: 'Required',
        paramDescription: 'Description',
        paramYes: 'Yes',
        paramNo: 'No',
        paramFileDesc: 'Subtitle file (.srt, .vtt, .ass, .json, .xml). Max 10MB.',
        paramApiKeyDesc: 'AI provider API key.',
        paramProviderDesc: 'AI provider: google, openrouter, or custom.',
        paramModelDesc: 'AI model ID (e.g., gemini-2.0-flash, gpt-4o).',
        paramTargetLanguageDesc: 'Target language (e.g., vi, en, ja, ko).',
        paramContextDesc: 'Context to improve translation quality.',
        paramStyleDesc: 'Translation style: formal, casual, technical, creative.',
        paramBatchSizeDesc: 'Subtitles per batch (1-100, default 50).',
        paramCustomEndpointDesc: 'Endpoint URL for custom provider (required when provider=custom).',
        responseFormat: 'Response Format',
        responseFormatDesc: 'Response is streaming NDJSON (each line is a JSON object):',
        streamingResponse: 'Streaming Response',
        streamingResponseDesc: 'Each line in the response is a JSON object with the following fields:',
        translatingEvent: 'Translating event — contains index, originalText, translatedText, completed, total.',
        doneEvent: 'Done event — the last line has status "done".',
        errorEvent: 'Error event — contains message and code describing the error.',
        streamingExample: 'Streaming Example',
        errorExample: 'Error Example',
        curlExample: 'cURL Example',
        jsExample: 'JavaScript Example',
        errorHandling: 'Error Handling',
        errorHandlingDesc: 'The API returns standard HTTP error codes:',
        errorCode: 'Error Code',
        errorDescription: 'Description',
        error400: '400 Bad Request',
        error400Desc: 'Missing required parameters, invalid file, or incorrect provider.',
        error500: '500 Internal Server Error',
        error500Desc: 'Internal server error. Please try again later.',
      },
    },

    // File Upload
    uploadTitle: 'Upload Subtitle File',
    uploadDragText: 'Drag & drop file here',
    uploadClickText: 'or click to select',
    uploadSupported: 'Supported: SRT, VTT, ASS',


    // AI Settings
    aiProvider: 'AI Provider',
    aiModel: 'AI Model',
    apiKey: 'API Key',
    apiKeyPlaceholder: 'Enter your API key',
    targetLanguage: 'Target Language',
    customPrompt: 'Custom Prompt',
    customPromptPlaceholder: 'Enter custom prompt (optional)',

    // Translation
    startTranslation: 'Start Translation',


    // Subtitle Table
    index: 'Index',

    originalText: 'Original Text',
    translatedText: 'Translated Text',
    status: 'Status',
    actions: 'Actions',

    // Status
    pending: 'Pending',
    translating: 'Translating',
    completed: 'Completed',
    error: 'Error',
    edited: 'Edited',

    // Export
    export: 'Export',
    exportOriginal: 'Original Format',
    exportBilingual: 'Bilingual',
    exportFormat: 'Export Format',
    exportDescription: 'Download your translated file in the same format as the original.',
    download: 'Download',

    // Theme
    lightMode: 'Light',
    darkMode: 'Dark',


    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    warning: 'Warning',

    clear: 'Clear',
    close: 'Close',

    // API Key
    apiKeyInput: {
      geminiTitle: 'Gemini API Key',
      geminiDescription: 'Enter your Gemini API key to translate subtitles',
      openrouterTitle: 'OpenRouter API Key',
      openrouterDescription: 'OpenRouter provides access to multiple AI models at competitive prices',
      placeholder: 'Enter your API key',
      getKey: 'Get a key',
      getKeyGemini: 'Get API key at Google AI Studio',
      getKeyOpenRouter: 'Get free API key at OpenRouter.ai',
      show: 'Show',
      hide: 'Hide',
      valid: 'API key is valid',
      invalid: 'Invalid API key',
      validating: 'Validating...',
      saveInBrowser: 'Save API key in this browser',
      saveAndUse: 'Save & Use Key',
      update: 'Update API Key',
      configured: 'API key configured and ready to use',
      lowCreditsWarning: 'Your OpenRouter account has negative credits. Consider using free models to avoid charges.',
      freeModelsRecommendation: 'Free models like Llama 3.1 8B and Gemma 2 9B work great for translation tasks.',
      warningTitle: 'Credits Warning',
      errorValidating: 'Error validating API key'
    },

    // AI Translation specific
    ai: {
      title: 'AI Translation',
      provider: 'Provider',
      model: 'Model',
      selectProvider: 'Select Provider',
      selectModel: 'Select Model',
      enterApiKey: 'Enter API Key',
      invalidApiKey: 'Invalid API Key',
      sourceLanguage: 'Source Language',
      selectSourceLanguage: 'Select Source Language',
      selectTargetLanguage: 'Select Target Language',
      advanced: 'Advanced',
      basic: 'Basic',
      advancedSettings: 'Advanced Settings',
      context: 'Context',
      contextHelp: 'Provide context to improve translation quality',
      contextPlaceholder: 'e.g., This is a tech video, action movie...',
      style: 'Style',
      styleHelp: 'Choose appropriate translation style',
      selectStyle: 'Select Style',
      styleFormal: 'Formal',
      styleCasual: 'Casual',
      styleTechnical: 'Technical',
      styleCreative: 'Creative',
      batchSize: 'Batch Size',
      batchSizeHelp: 'Number of subtitles to process at once (30-100)',
      estimatedCost: 'Estimated Cost',
      preparing: 'Preparing...',
      translating: 'Translating...',
      completed: 'Completed',
      error: 'Error',
      batch: 'Batch',
      stop: 'Stop',
      translationStopped: 'Translation Stopped',
      preview: 'Preview',
      deleteConfirm: 'Are you sure you want to delete this subtitle?',
      of: 'of',
      items: 'items',
      timeRange: 'Time Range',
      progress: 'Progress',
      failed: 'Failed',
      totalTokens: 'Total Tokens',
      currentBatch: 'Current Batch',
      totalBatches: 'Total Batches',
      percentage: 'Percentage',
      mode: 'Translation Mode',
      guestMode: 'Guest (Free)',
      customKey: 'Custom Key',
      guestModeInfo: 'Uses system API key with rate limits.',
      guestAccess: 'Guest Access',
      guestAccessDescription: 'Using System API Key. Free translation powered by Google Gemini (Flash).',
      quotaExceeded: 'Daily translation limit reached. Please use your own API Key or try again tomorrow.',
      apiKeyExpired: 'API Key is invalid or expired. Please check your settings.',
      configureEndpointAndKey: 'Please configure endpoint and API key'
    },

    languageSelector: {
      tooltip: 'Choose from list or enter a custom language (e.g., Swahili, Zulu, etc.)',
      customLanguageSelected: 'Selected language',
      addCustomLanguage: 'as custom language'
    },

    videoPreview: {
      title: 'Video Preview',
      videoSource: 'Video Source:',
      loadFromUrl: 'Load from URL',
      uploadFromDevice: 'Upload from device',
      urlPlaceholder: 'Enter video URL (mp4, webm, etc.) - Note: Some URLs may have CORS restrictions',
      loadUrl: 'Load URL',
      urlTip: '💡 Tip: If video doesn\'t load, try using direct file URLs or upload a local file instead. Some video hosting services block cross-origin requests.',
      clickOrDragVideo: 'Click or drag video file here',
      supportedFormats: 'Supports MP4, WebM, AVI, MOV and other video formats',
      changeVideo: 'Change Video',
      videoLoaded: 'Video loaded successfully',
      videoUrlSet: 'Video URL set successfully',
      invalidVideoFile: 'Please select a valid video file',
      videoLoadFailed: 'Failed to load video file',
      videoUrlFailed: 'Failed to set video URL. The video may still work if CORS is properly configured.',
      enterVideoUrl: 'Please enter a video URL',
      corsWarning: 'Video may not load due to CORS restrictions. Try using a different URL or local file.'
    },

    exportPanel: {
      batchExport: 'Batch Export',
      singleExport: 'Single Export',
      selectFormats: 'Select Formats:',
      chooseFormats: 'Choose formats to export',
      bilingualTooltip: 'Include both original and translated text',
      bilingualSubtext: '(Original + Translation)',
      exportFormats: 'Export {count} Format(s)',
      exportInfo: 'Export Info:',
      original: 'Original',
      format: 'Format',
      modeLabel: 'Mode',
      bilingual: 'Bilingual',
      translationOnly: 'Translation Only',
      exportFailed: 'Export failed',
      batchExportFailed: 'Batch export failed',
      quickExportFailed: 'Quick export failed',
      downloadTranslated: 'Download Translated'
    },

    translationMode: {
      freeQuotaTooltip: 'You have {remaining} free translations remaining today.',
      freeQuotaAvailable: 'Free Quota Available',
      dailyLimitReached: 'Daily Limit Reached'
    },

    customApi: {
      emptyFieldsError: 'Endpoint and API key cannot be empty',
      invalidEndpoint: 'Invalid endpoint',
      configSaved: 'Configuration saved'
    },

    fileUpload: {
      invalidFormat: 'Invalid file format or size too large',
      validationFailed: 'File validation failed',
      readFailed: 'Failed to read file content',
      parseFailed: 'Failed to parse file',
      uploadFailed: 'Upload failed'
    },

    steps: {
      upload: 'Upload',
      settings: 'Settings',
      translating: 'Translate',
      results: 'Results'
    },

    flow: {
      fileLoaded: 'File loaded',
      changeFile: 'Change file',
      startOver: 'Start Over',
      translationInProgress: 'Translation in progress...',
      readyToExport: 'Ready to export!',
      heroTitle: 'AI Subtitle Translation',
      heroSubtitle: 'Upload a subtitle file to start automatic translation'
    }
  },
};