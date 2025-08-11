export enum CommentErrorType {
  INVALID_POINTER = 'INVALID_POINTER',
  THREAD_NOT_FOUND = 'THREAD_NOT_FOUND',
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  INVALID_SELECTION = 'INVALID_SELECTION',
  PERSISTENCE_ERROR = 'PERSISTENCE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

export class CommentError extends Error {
  constructor(
    public readonly type: CommentErrorType,
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CommentError';
  }
}

/**
 * Creates a standardized comment error with context
 */
export const createCommentError = (
  type: CommentErrorType,
  message: string,
  context?: Record<string, any>
): CommentError => {
  return new CommentError(type, message, context);
};

/**
 * Type guard to check if an error is a CommentError
 */
export const isCommentError = (error: unknown): error is CommentError => {
  return error instanceof CommentError;
};

/**
 * Standardized error handler for comment operations
 */
export class CommentErrorHandler {
  private static instance: CommentErrorHandler;
  private errorHandlers: Map<CommentErrorType, (error: CommentError) => void> = new Map();

  private constructor() {}

  static getInstance(): CommentErrorHandler {
    if (!CommentErrorHandler.instance) {
      CommentErrorHandler.instance = new CommentErrorHandler();
    }
    return CommentErrorHandler.instance;
  }

  /**
   * Register a custom error handler for a specific error type
   */
  registerHandler(type: CommentErrorType, handler: (error: CommentError) => void): void {
    this.errorHandlers.set(type, handler);
  }

  /**
   * Handle a comment error with appropriate logging and user feedback
   */
  handleError(error: unknown, context?: string): void {
    if (isCommentError(error)) {
      this.handleCommentError(error, context);
    } else if (error instanceof Error) {
      this.handleGenericError(error, context);
    } else {
      console.error(`Unknown error in ${context}:`, error);
    }
  }

  private handleCommentError(error: CommentError, context?: string): void {
    // Check for custom handler
    const customHandler = this.errorHandlers.get(error.type);
    if (customHandler) {
      customHandler(error);
      return;
    }

    // Default handling based on error type
    switch (error.type) {
      case CommentErrorType.INVALID_POINTER:
        console.warn(`Invalid pointer in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.THREAD_NOT_FOUND:
        console.warn(`Thread not found in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.COMMENT_NOT_FOUND:
        console.warn(`Comment not found in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.PERMISSION_DENIED:
        console.error(`Permission denied in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.INVALID_SELECTION:
        console.warn(`Invalid selection in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.PERSISTENCE_ERROR:
        console.error(`Persistence error in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.VALIDATION_ERROR:
        console.warn(`Validation error in ${context}: ${error.message}`, error.context);
        break;
        
      case CommentErrorType.SERVICE_UNAVAILABLE:
        console.error(`Service unavailable in ${context}: ${error.message}`, error.context);
        break;
        
      default:
        console.error(`Unhandled comment error in ${context}: ${error.message}`, error.context);
    }
  }

  private handleGenericError(error: Error, context?: string): void {
    console.error(`Generic error in ${context}: ${error.message}`, error);
  }
}

/**
 * Convenience function to get the global error handler instance
 */
export const getCommentErrorHandler = (): CommentErrorHandler => {
  return CommentErrorHandler.getInstance();
};

/**
 * Wrapper function for operations that might throw comment errors
 */
export const withCommentErrorHandling = <T>(
  operation: () => T,
  context: string
): T | null => {
  try {
    return operation();
  } catch (error) {
    getCommentErrorHandler().handleError(error, context);
    return null;
  }
};

/**
 * Async wrapper function for operations that might throw comment errors
 */
export const withAsyncCommentErrorHandling = async <T>(
  operation: () => Promise<T>,
  context: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    getCommentErrorHandler().handleError(error, context);
    return null;
  }
};

/**
 * Validation helpers for common comment operations
 */
export const validateThread = (threadId: string, threads: Map<string, any>): void => {
  if (!threadId) {
    throw createCommentError(
      CommentErrorType.VALIDATION_ERROR,
      'Thread ID is required',
      { threadId }
    );
  }
  
  if (!threads.has(threadId)) {
    throw createCommentError(
      CommentErrorType.THREAD_NOT_FOUND,
      `Thread with ID ${threadId} not found`,
      { threadId, availableThreads: Array.from(threads.keys()) }
    );
  }
};

export const validateComment = (commentId: string, comments: Map<string, any>): void => {
  if (!commentId) {
    throw createCommentError(
      CommentErrorType.VALIDATION_ERROR,
      'Comment ID is required',
      { commentId }
    );
  }
  
  if (!comments.has(commentId)) {
    throw createCommentError(
      CommentErrorType.COMMENT_NOT_FOUND,
      `Comment with ID ${commentId} not found`,
      { commentId, availableComments: Array.from(comments.keys()) }
    );
  }
};

export const validatePointer = (pointer: any): void => {
  if (!pointer) {
    throw createCommentError(
      CommentErrorType.INVALID_POINTER,
      'Pointer is required',
      { pointer }
    );
  }
  
  if (!pointer.type) {
    throw createCommentError(
      CommentErrorType.INVALID_POINTER,
      'Pointer must have a type',
      { pointer }
    );
  }
};