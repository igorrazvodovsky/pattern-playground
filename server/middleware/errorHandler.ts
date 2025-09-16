import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError, ApiResponse } from '../types/api.js';
import logger from '../logger.js';

export interface HttpError extends Error {
  status?: number;
}

export const errorHandler = (err: Error | AppError | ZodError, _req: Request, res: Response, _next: NextFunction): void => {
  // Explicitly avoid the unused parameter issue by acknowledging it
  void _next;
  logger.error('Express error:', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
      code: error.code
    }));

    const appError = AppError.validation('Validation failed', validationErrors);
    
    res.status(appError.statusCode).json({
      success: false,
      data: null,
      error: appError.message,
      code: appError.code,
      validationErrors: appError.validationErrors
    } as ApiResponse<null>);
    return;
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      code: err.code,
      details: err.details,
      validationErrors: err.validationErrors
    } as ApiResponse<null>);
    return;
  }

  // Handle legacy HttpError instances
  const httpError = err as HttpError;
  if (httpError.status) {
    res.status(httpError.status).json({
      success: false,
      data: null,
      error: httpError.message || 'Internal Server Error'
    } as ApiResponse<null>);
    return;
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  } as ApiResponse<null>);
};

export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};