export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
  validationErrors?: ValidationError[];
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  public readonly validationErrors?: ValidationError[];

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>,
    validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.validationErrors = validationErrors;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static validation(message: string, validationErrors: ValidationError[]): AppError {
    return new AppError(message, 400, 'VALIDATION_ERROR', undefined, validationErrors);
  }

  static notFound(message: string = 'Resource not found'): AppError {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static unauthorized(message: string = 'Unauthorized'): AppError {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden'): AppError {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static internal(message: string = 'Internal server error', details?: Record<string, unknown>): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR', details);
  }

  toJSON(): ApiError {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      validationErrors: this.validationErrors
    };
  }
}