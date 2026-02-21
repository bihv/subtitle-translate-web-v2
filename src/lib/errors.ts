export enum TranslationErrorType {
    QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
    API_KEY_INVALID = 'API_KEY_INVALID',
    MODEL_NOT_AVAILABLE = 'MODEL_NOT_AVAILABLE',
    RATE_LIMIT = 'RATE_LIMIT',
    API_ERROR = 'API_ERROR',
    UNKNOWN = 'UNKNOWN'
}

export class TranslationError extends Error {
    code: TranslationErrorType;
    extras?: any;

    constructor(message: string, code: TranslationErrorType, extras?: any) {
        super(message);
        this.name = 'TranslationError';
        this.code = code;
        this.extras = extras;
    }
}

export class CriticalError extends TranslationError {
    isCritical: boolean;

    constructor(message: string, code: TranslationErrorType = TranslationErrorType.UNKNOWN, extras?: any) {
        super(message, code, extras);
        this.name = 'CriticalError';
        this.isCritical = true;
    }
}
