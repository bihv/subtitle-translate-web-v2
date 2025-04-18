// Vietnamese translations
const vi = {
  common: {
    appTitle: "SubtitleAI",
    appDescription: "Dịch phụ đề từ tệp SRT sử dụng Gemini AI",
    loading: "Đang tải...",
    save: "Lưu",
    cancel: "Hủy",
    retry: "Thử lại",
    retryAll: "Thử lại tất cả",
    retrying: "Đang thử lại...",
    export: "Xuất",
    edit: "Sửa",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    stop: "Dừng",
    expand: "Mở rộng",
    collapse: "Thu gọn",
    error: "Lỗi",
    success: "Thành công",
    close: "Đóng",
    clear: "Xóa"
  },
  apiKey: {
    title: "Khóa API Gemini",
    description: "Nhập khóa API Gemini để dịch phụ đề.",
    getKey: "Lấy khóa",
    configuredAndReady: "Khóa API đã được cấu hình và sẵn sàng sử dụng",
    enterKey: "Nhập khóa API Gemini của bạn...",
    show: "Hiện",
    hide: "Ẩn",
    isValid: "Khóa API hợp lệ",
    isInvalid: "Khóa API không hợp lệ. Vui lòng kiểm tra và thử lại.",
    saveInBrowser: "Lưu khóa API trong trình duyệt này",
    saveAndUse: "Lưu & Sử dụng khóa",
    update: "Cập nhật khóa API",
    validating: "Đang xác thực..."
  },
  fileUpload: {
    title: "Tải lên tệp phụ đề",
    description: "Chọn tệp phụ đề SRT, VTT, hoặc ASS để dịch",
    dragAndDrop: "Kéo và thả tệp phụ đề vào đây, hoặc nhấp để chọn",
    dropFileHere: "Thả tệp phụ đề của bạn vào đây...",
    dragAndDropHere: "Kéo và thả tệp phụ đề của bạn vào đây",
    orClickToSelect: "hoặc nhấp để chọn",
    browsing: "Đang duyệt...",
    selectFile: "Chọn tệp",
    fileSelected: "Đã chọn tệp:",
    clearFile: "Xóa tệp",
    invalidFormat: "Định dạng tệp không hợp lệ. Vui lòng chọn tệp SRT, VTT, hoặc ASS.",
    noFileSelected: "Chưa chọn tệp",
    processingFile: "Đang xử lý tệp...",
    successfullyParsed: "Đã phân tích thành công {count} phụ đề.",
    invalidFileType: "Loại tệp không hợp lệ. Vui lòng chọn tệp .srt, .vtt, hoặc .ass.",
    errorReadingFile: "Lỗi đọc tệp. Vui lòng thử lại.",
    formatDetected: "Đã phát hiện định dạng: {format}",
    supportedFormats: "Định dạng hỗ trợ: SRT, VTT, ASS"
  },
  translationSettings: {
    title: "Cài đặt dịch",
    description: "Cấu hình cách phụ đề của bạn sẽ được dịch",
    targetLanguage: "Ngôn ngữ đích",
    selectLanguage: "Chọn hoặc nhập ngôn ngữ",
    customPrompt: "Prompt tùy chỉnh",
    customPromptDefault: "Dịch phụ đề sau sang {language}. Giữ nguyên giọng điệu, phong cách và sắc thái ban đầu. Giữ ngắn gọn để phù hợp với thời gian phụ đề.",
    startTranslation: "Bắt đầu dịch",
    translationInProgress: "Đang dịch phụ đề...",
    translationPaused: "Đã tạm dừng - Nhấn 'Tiếp tục' để tiếp tục dịch",
    translationStopped: "Đã dừng dịch",
    translationCompleted: "Dịch hoàn tất"
  },
  subtitleTable: {
    id: "ID",
    time: "Thời gian",
    originalText: "Văn bản gốc",
    translation: "Bản dịch",
    status: "Trạng thái",
    action: "Hành động",
    batch: "Nhóm",
    showing: "Đang hiển thị",
    subtitles: "phụ đề",
    translated: "đã dịch",
    errors: "lỗi",
    expandTable: "Mở rộng bảng",
    collapseTable: "Thu gọn bảng",
    waitingToTranslate: "Đang chờ dịch...",
    translating: "Đang dịch...",
    aiSuggestions: "Gợi ý từ AI",
    chooseSuggestion: "Chọn một bản dịch phù hợp hơn",
    clickToApply: "Nhấn để áp dụng",
    noSuggestions: "Không có gợi ý nào",
    suggestBetterTranslation: "Gợi ý bản dịch tốt hơn"
  },
  batchErrorDisplay: {
    failedBatches: "{count} nhóm {batches} thất bại",
    batch: "nhóm",
    batches: "nhóm",
    description: "Mỗi nhóm chứa tối đa 10 phụ đề. Thử lại các nhóm thất bại để hoàn thành việc dịch.",
    retryBatch: "Thử lại nhóm"
  },
  errors: {
    apiKeyRequired: "Cần có khóa API. Vui lòng cung cấp khóa API Gemini hợp lệ.",
    fileRequired: "Vui lòng chọn tệp SRT để dịch.",
    translationError: "Lỗi dịch",
    translationErrorDescription: "Đã xảy ra lỗi trong quá trình dịch:",
    rateLimit: "Đã vượt quá giới hạn tần suất. Vui lòng đợi một lát trước khi thử lại.",
    forbidden: "Truy cập API bị cấm. Vui lòng kiểm tra khóa API của bạn.",
    unauthorized: "Truy cập API không được ủy quyền. Khóa API của bạn có thể không hợp lệ.",
    serverError: "Lỗi máy chủ từ API Gemini. Vui lòng thử lại sau.",
    translationSuggestionFailed: "Không thể tạo gợi ý từ AI. Vui lòng thử lại."
  },
  export: {
    exportTranslated: "Xuất phụ đề đã dịch",
    exportBilingual: "Xuất phụ đề song ngữ",
    bilingualDescription: "Xuất file phụ đề bao gồm cả phụ đề gốc và bản dịch",
    downloading: "Đang tải xuống...",
    noTranslatedSubtitles: "Không có phụ đề đã dịch để xuất.",
    exportFormat: "Định dạng xuất:",
    keepOriginalFormat: "Giữ định dạng gốc"
  },
  preview: {
    title: "Xem trước video",
    description: "Tải lên video để xem trước với phụ đề",
    uploadVideo: "Tải lên video để xem trước với phụ đề",
    hideSubtitles: "Ẩn phụ đề",
    showSubtitles: "Hiện phụ đề",
    translatedOnly: "Bản dịch",
    bilingual: "Song ngữ",
    originalOnly: "Nguyên bản",
    loadingVideo: "Đang tải video...",
    videoName: "Tên video:",
    videoDuration: "Thời lượng:",
    selectVideo: "Chọn video",
    dropVideoHere: "Thả video của bạn vào đây...",
    invalidVideoType: "Loại tệp không hợp lệ. Vui lòng chọn tệp video.",
    dragAndDropVideo: "Kéo và thả tệp video vào đây",
    fullScreenSubtitleTip: "Phụ đề vẫn hiển thị trong chế độ toàn màn hình."
  },
  guide: {
    title: "Hướng dẫn sử dụng",
    subtitle: "Cách sử dụng công cụ dịch phụ đề",
    introTitle: "Chào mừng đến với SubtitleAI",
    introDescription: "Giải pháp tất cả trong một cho việc dịch phụ đề",
    introText: "Hướng dẫn này sẽ giúp bạn hiểu cách sử dụng SubtitleAI để dịch tệp phụ đề hiệu quả bằng công nghệ Gemini AI của Google. Hãy theo dõi các phần dưới đây để tìm hiểu từng khía cạnh của quá trình dịch.",
    backToApp: "Quay lại ứng dụng",
    tocTitle: "Mục lục",
    section1: "Bắt đầu",
    section2: "Tải lên phụ đề",
    section3: "Cài đặt dịch",
    section4: "Quá trình dịch",
    section5: "Chỉnh sửa phụ đề",
    section6: "Xuất phụ đề",
    section7: "Xử lý sự cố",
    section8: "Câu hỏi thường gặp",
    
    // Getting Started Section
    apiKeyTitle: "Thiết lập khóa API Gemini",
    apiKeyDescription: "Để sử dụng SubtitleAI, bạn cần có khóa API Gemini của Google.",
    apiKeyStep1: "Truy cập trang web Google AI Studio (https://ai.google.dev/)",
    apiKeyStep2: "Tạo hoặc đăng nhập vào tài khoản Google của bạn",
    apiKeyStep3: "Điều hướng đến phần API và tạo khóa API",
    apiKeyStep4: "Sao chép khóa và dán vào trường Khóa API trong SubtitleAI",
    
    modelSelectionTitle: "Lựa chọn mô hình AI",
    modelSelectionDescription: "Chọn mô hình Gemini phù hợp dựa trên nhu cầu dịch của bạn:",
    modelProDescription: "Cân bằng tốt giữa tốc độ và chất lượng cho hầu hết các bản dịch phụ đề",
    model15ProDescription: "Chất lượng cao hơn cho nội dung phức tạp hoặc có nhiều sắc thái với khả năng hiểu ngữ cảnh tốt hơn",
    model15FlashDescription: "Lựa chọn nhanh nhất cho các bản dịch đơn giản và tệp lớn",
    model20FlashDescription: "Được tối ưu hóa cho tốc độ với chất lượng tốt, hoàn hảo cho hầu hết các tệp phụ đề và xử lý hiệu quả",
    model25ProDescription: "Mô hình thử nghiệm tiên tiến với chất lượng dịch thuật vượt trội và hiểu ngữ cảnh cho nội dung phức tạp",
    
    // Uploading Subtitles Section
    uploadMethodsTitle: "Cách tải lên tệp phụ đề",
    uploadMethodsDescription: "Có hai cách để tải lên tệp phụ đề của bạn:",
    uploadMethod1Title: "Nhấp và chọn",
    uploadMethod1Description: "Nhấp vào khu vực tải lên tệp và chọn tệp phụ đề từ thiết bị của bạn",
    uploadMethod2Title: "Kéo và thả",
    uploadMethod2Description: "Kéo tệp phụ đề trực tiếp từ trình quản lý tệp và thả vào khu vực tải lên",
    supportedFormatsNote: "Các định dạng hiện được hỗ trợ: tệp phụ đề SRT, VTT và ASS",
    
    // Translation Settings Section
    targetLanguageTitle: "Chọn ngôn ngữ đích",
    targetLanguageDescription: "Chọn ngôn ngữ bạn muốn dịch phụ đề sang từ menu thả xuống. Bạn có thể chọn các ngôn ngữ phổ biến hoặc nhập một ngôn ngữ cụ thể không có trong danh sách.",
    
    customPromptTitle: "Tùy chỉnh prompt dịch",
    customPromptDescription: "Tinh chỉnh cách Gemini AI dịch phụ đề bằng cách sửa đổi mẫu prompt. Điều này có thể giúp đạt được bản dịch tốt hơn cho các loại nội dung cụ thể.",
    customPromptExample: "Dịch phụ đề sau sang {language}. Giữ nguyên giọng điệu, phong cách và sắc thái ban đầu. Giữ ngắn gọn để phù hợp với thời gian phụ đề.",
    customPromptTip: "Đối với các loại nội dung cụ thể (ví dụ: kỹ thuật, trang trọng, hài hước), hãy cân nhắc thêm hướng dẫn liên quan vào prompt.",
    
    // Translation Process Section
    startTranslationTitle: "Bắt đầu dịch",
    startTranslationDescription: "Sau khi đã tải lên tệp phụ đề và cấu hình cài đặt, nhấp vào nút 'Bắt đầu dịch' để bắt đầu quá trình dịch.",
    
    translationProgressTitle: "Hiểu trạng thái dịch",
    translationProgressDescription: "Trong quá trình dịch, mỗi dòng phụ đề sẽ hiển thị một trong các trạng thái sau:",
    statusPending: "Đang chờ",
    statusPendingDescription: "Phụ đề đang chờ được dịch",
    statusTranslating: "Đang dịch",
    statusTranslatingDescription: "Đang được xử lý bởi AI",
    statusTranslated: "Đã dịch",
    statusTranslatedDescription: "Đã dịch thành công",
    statusError: "Lỗi",
    statusErrorDescription: "Không thể dịch do lỗi",
    
    translationControlTitle: "Điều khiển quá trình dịch",
    translationControlDescription: "Bạn có thể quản lý quá trình dịch đang diễn ra bằng các điều khiển sau:",
    pauseResumeTitle: "Tạm dừng/Tiếp tục",
    pauseResumeDescription: "Tạm dừng quá trình dịch và tiếp tục sau mà không bị mất tiến độ",
    stopTitle: "Dừng",
    stopDescription: "Dừng hoàn toàn quá trình dịch (không thể tiếp tục)",
    
    // Editing Subtitles Section
    manualEditTitle: "Chỉnh sửa bản dịch thủ công",
    manualEditDescription: "Bạn có thể chỉnh sửa bất kỳ phụ đề đã dịch nào để sửa lỗi hoặc cải thiện chất lượng:",
    editStep1: "Nhấp vào nút 'Sửa' bên cạnh phụ đề bạn muốn sửa đổi",
    editStep2: "Thực hiện thay đổi trong khung văn bản xuất hiện",
    editStep3: "Nhấp 'Lưu' để áp dụng thay đổi hoặc 'Hủy' để loại bỏ chúng",
    
    improveTranslationTitle: "Cải thiện bản dịch với trợ giúp của AI",
    improveTranslationDescription: "Đối với các phụ đề không chính xác, bạn có thể sử dụng tính năng gợi ý AI để nhận các bản dịch thay thế.",
    aiSuggestionTip: "Nhấp vào biểu tượng tia sáng để nhận gợi ý AI cho bản dịch tốt hơn",
    
    retryFailedTitle: "Thử lại các bản dịch thất bại",
    retryFailedDescription: "Nếu một số phụ đề không dịch được, bạn có thể thử lại chúng riêng lẻ hoặc theo nhóm:",
    retryButtonDescription: "Nhấp vào nút thử lại bên cạnh phụ đề bị lỗi hoặc sử dụng tùy chọn thử lại nhóm ở trên cùng của nhóm bị lỗi",
    
    // Exporting Subtitles Section
    exportOptionsTitle: "Xuất phụ đề đã dịch",
    exportOptionsDescription: "Sau khi hoàn thành việc dịch và chỉnh sửa phụ đề, bạn có thể xuất chúng ở các định dạng khác nhau:",
    normalExportTitle: "Xuất tiêu chuẩn",
    normalExportDescription: "Chỉ xuất phụ đề đã dịch ở định dạng đã chọn",
    bilingualExportTitle: "Xuất song ngữ",
    bilingualExportDescription: "Xuất cả văn bản gốc và bản dịch trong mỗi phụ đề, lý tưởng cho việc học ngôn ngữ",
    exportFormatTip: "Bạn có thể chọn xuất ở định dạng gốc của tệp phụ đề hoặc chọn một định dạng cụ thể (SRT, VTT, ASS)",
    
    // Troubleshooting Section
    commonIssuesTitle: "Các vấn đề thường gặp và giải pháp",
    
    issue1Title: "Lỗi khóa API",
    issue1Solution: "Nếu bạn thấy lỗi liên quan đến khóa API, hãy xác minh rằng khóa đã được nhập chính xác và hạn ngạch API Gemini của bạn chưa bị vượt quá. Bạn có thể cần tạo khóa mới nếu khóa hiện tại không hợp lệ.",
    
    issue2Title: "Lỗi dịch",
    issue2Solution: "Nếu nhiều phụ đề không dịch được, có thể do giới hạn tần suất. Hãy thử dùng nút 'Tạm dừng' trong vài giây, sau đó 'Tiếp tục'. Bạn cũng có thể thử lại các nhóm thất bại sau khi đợi một lúc.",
    
    issue3Title: "Ký tự không được hỗ trợ",
    issue3Solution: "Nếu bản dịch của bạn hiển thị các ký tự bị thiếu hoặc không chính xác, hãy đảm bảo bạn đã chọn đúng ngôn ngữ đích. Một số ký tự đặc biệt có thể không hiển thị đúng trong một số định dạng phụ đề.",
    
    issue4Title: "Hiệu suất chậm",
    issue4Solution: "Đối với tệp phụ đề lớn, hãy cân nhắc chọn mô hình Gemini 1.5 Flash được tối ưu hóa cho tốc độ. Chia nhỏ các tệp rất lớn thành các phần nhỏ hơn cũng có thể giúp ích.",
    
    // Help and Feedback
    helpTitle: "Cần thêm trợ giúp?",
    helpText: "Hướng dẫn này bao gồm chức năng cơ bản của SubtitleAI. Đối với các tính năng nâng cao hơn hoặc các câu hỏi cụ thể, vui lòng tham khảo tài liệu hoặc liên hệ hỗ trợ.",
    feedbackText: "Chúng tôi liên tục cải thiện SubtitleAI dựa trên phản hồi của người dùng. Nếu bạn có đề xuất hoặc gặp vấn đề không được đề cập trong hướng dẫn này, vui lòng cho chúng tôi biết.",
    
    // FAQ Section
    faqTitle: "Câu hỏi thường gặp",
    faqDescription: "Câu trả lời nhanh cho các câu hỏi phổ biến về SubtitleAI",
    
    faq1Question: "Khóa API của tôi có an toàn không?",
    faq1Answer: "Có, khóa API Gemini của bạn được lưu trữ cục bộ trong trình duyệt của bạn và không bao giờ được gửi đến máy chủ của chúng tôi. Nó chỉ được sử dụng để giao tiếp trực tiếp với dịch vụ API của Google.",
    
    faq2Question: "Sử dụng SubtitleAI tốn bao nhiêu tiền?",
    faq2Answer: "SubtitleAI là công cụ miễn phí. Tuy nhiên, bạn cần khóa API Gemini của Google, có thể phát sinh chi phí tùy thuộc vào mức sử dụng và chính sách giá của Google. Người dùng mới thường được cấp tín dụng miễn phí khi đăng ký.",
    
    faq3Question: "Tôi có thể dịch nhiều tệp cùng lúc không?",
    faq3Answer: "Hiện tại, SubtitleAI xử lý từng tệp một. Chúng tôi khuyên bạn nên hoàn thành một bản dịch trước khi bắt đầu bản dịch khác để có hiệu suất tối ưu.",
    
    faq4Question: "Những ngôn ngữ nào được hỗ trợ?",
    faq4Answer: "SubtitleAI hỗ trợ dịch từ và sang hầu hết các ngôn ngữ mà Gemini AI hỗ trợ, bao gồm hầu hết các ngôn ngữ chính trên toàn thế giới.",
    
    faq5Question: "Tôi có thể sử dụng SubtitleAI khi không có kết nối internet không?",
    faq5Answer: "Không, SubtitleAI yêu cầu kết nối internet để giao tiếp với API Gemini của Google cho việc dịch thuật."
  },
  
  // New translations for enhanced guide UI
  guideUi: {
    searchPlaceholder: "Tìm kiếm trong hướng dẫn...",
    openTableOfContents: "Mở mục lục",
    backToTop: "Về đầu trang",
    printGuide: "In hướng dẫn",
    printedGuide: "In từ Hướng dẫn SubtitleAI"
  },
};

export default vi; 