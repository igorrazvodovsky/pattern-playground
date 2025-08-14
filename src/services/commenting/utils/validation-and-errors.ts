import type { Quote, RichContent } from '../../../stories/shared-data/index.js';

/**
 * Production-ready validation and error handling utilities
 */

// Error classes for better error handling
export class QuoteCommentingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'QuoteCommentingError';
  }
}

export class ValidationError extends QuoteCommentingError {
  constructor(message: string, public field: string, value?: any) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class ServiceError extends QuoteCommentingError {
  constructor(message: string, public service: string, originalError?: Error) {
    super(message, 'SERVICE_ERROR', { service, originalError: originalError?.message });
    this.name = 'ServiceError';
  }
}

/**
 * Validation schemas and functions
 */

// Quote validation
export const validateQuote = (quote: any): quote is Quote => {
  const errors: string[] = [];

  if (!quote) {
    errors.push('Quote object is required');
    return false;
  }

  if (!quote.id || typeof quote.id !== 'string') {
    errors.push('Quote ID is required and must be a string');
  }

  if (!quote.name || typeof quote.name !== 'string') {
    errors.push('Quote name is required and must be a string');
  }

  if (quote.type !== 'quote') {
    errors.push('Quote type must be "quote"');
  }

  if (!quote.metadata) {
    errors.push('Quote metadata is required');
  } else {
    if (!quote.metadata.sourceDocument) {
      errors.push('Source document ID is required');
    }
    
    if (!quote.metadata.sourceRange || 
        typeof quote.metadata.sourceRange.from !== 'number' ||
        typeof quote.metadata.sourceRange.to !== 'number') {
      errors.push('Valid source range is required');
    }

    if (!quote.metadata.selectedText) {
      errors.push('Selected text is required');
    }

    if (!quote.metadata.createdBy) {
      errors.push('Creator user ID is required');
    }
  }

  if (!quote.content) {
    errors.push('Quote content is required');
  } else {
    if (!validateRichContent(quote.content)) {
      errors.push('Invalid rich content structure');
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Quote validation failed: ${errors.join(', ')}`, 'quote', quote);
  }

  return true;
};

// Rich content validation
export const validateRichContent = (content: any): content is RichContent => {
  if (!content) return false;
  
  // Must have plainText
  if (!content.plainText || typeof content.plainText !== 'string') {
    return false;
  }

  // Rich content should be valid TipTap JSON if present
  if (content.richContent) {
    if (typeof content.richContent !== 'object') return false;
    if (!content.richContent.type || content.richContent.type !== 'doc') return false;
    if (!Array.isArray(content.richContent.content)) return false;
  }

  return true;
};

// Comment content validation
export const validateCommentContent = (content: RichContent): void => {
  if (!validateRichContent(content)) {
    throw new ValidationError('Invalid comment content structure', 'content', content);
  }

  // Additional comment-specific validation
  const plainText = content.plainText.trim();
  if (plainText.length === 0) {
    throw new ValidationError('Comment content cannot be empty', 'content.plainText');
  }

  if (plainText.length > 10000) {
    throw new ValidationError('Comment content exceeds maximum length (10,000 characters)', 'content.plainText');
  }

  // Validate against common issues
  if (plainText.includes('<script') || plainText.includes('javascript:')) {
    throw new ValidationError('Comment content contains potentially unsafe content', 'content.plainText');
  }
};

// User ID validation
export const validateUserId = (userId: string): void => {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError('User ID is required and must be a string', 'userId', userId);
  }

  if (userId.trim().length === 0) {
    throw new ValidationError('User ID cannot be empty', 'userId', userId);
  }

  // Simple format validation
  if (!/^[a-zA-Z0-9\-_]+$/.test(userId)) {
    throw new ValidationError('User ID contains invalid characters', 'userId', userId);
  }
};

/**
 * Error boundary and recovery utilities
 */

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => R,
  errorContext: string
) => {
  return (...args: T): R => {
    try {
      return fn(...args);
    } catch (error) {
      if (error instanceof QuoteCommentingError) {
        // Re-throw our custom errors
        throw error;
      }

      // Wrap unknown errors
      throw new ServiceError(
        `${errorContext}: ${error instanceof Error ? error.message : String(error)}`,
        errorContext,
        error instanceof Error ? error : undefined
      );
    }
  };
};

export const withAsyncErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext: string
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof QuoteCommentingError) {
        throw error;
      }

      throw new ServiceError(
        `${errorContext}: ${error instanceof Error ? error.message : String(error)}`,
        errorContext,
        error instanceof Error ? error : undefined
      );
    }
  };
};

/**
 * Logging and monitoring utilities
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  context: string;
  message: string;
  data?: any;
}

export class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  log(level: LogEntry['level'], context: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${context}] ${message}`, data || '');
    }
  }

  info(context: string, message: string, data?: any): void {
    this.log('info', context, message, data);
  }

  warn(context: string, message: string, data?: any): void {
    this.log('warn', context, message, data);
  }

  error(context: string, message: string, data?: any): void {
    this.log('error', context, message, data);
  }

  debug(context: string, message: string, data?: any): void {
    this.log('debug', context, message, data);
  }

  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    const filtered = level ? this.logs.filter(log => log.level === level) : this.logs;
    return limit ? filtered.slice(-limit) : filtered;
  }

  getErrorCount(): number {
    return this.logs.filter(log => log.level === 'error').length;
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

/**
 * Performance monitoring
 */

export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();

  startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      logger.warn('PerformanceMonitor', `No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(operation);

    // Store metric
    const existing = this.metrics.get(operation) || [];
    existing.push(duration);
    
    // Keep only recent measurements
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }
    
    this.metrics.set(operation, existing);

    logger.debug('PerformanceMonitor', `Operation ${operation} took ${duration}ms`);
    return duration;
  }

  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation);
    if (!times || times.length === 0) return 0;

    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};

    this.metrics.forEach((times, operation) => {
      result[operation] = {
        average: this.getAverageTime(operation),
        count: times.length,
        latest: times[times.length - 1] || 0,
      };
    });

    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Utility for measuring function performance
 */
export const measurePerformance = <T extends any[], R>(
  fn: (...args: T) => R,
  operationName: string
) => {
  return (...args: T): R => {
    performanceMonitor.startTimer(operationName);
    try {
      const result = fn(...args);
      return result;
    } finally {
      performanceMonitor.endTimer(operationName);
    }
  };
};

export const measureAsyncPerformance = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    performanceMonitor.startTimer(operationName);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      performanceMonitor.endTimer(operationName);
    }
  };
};