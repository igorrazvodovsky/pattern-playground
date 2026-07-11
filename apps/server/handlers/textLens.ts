import { Request, Response } from 'express';
import { textLensRequestSchema } from '../schemas.js';
import { StreamingService } from '../services/streaming.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

export class TextLensHandler {
  static async handleTextLens(req: Request, res: Response): Promise<void> {
    logger.debug("Received text lens request:", req.body);

    try {
      // Validate request
      const validatedRequest = textLensRequestSchema.parse(req.body);
      logger.info(`Processing text lens: ${validatedRequest.direction} ${validatedRequest.intensity}%`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        await StreamingService.handleTextLensStream(res, validatedRequest, controller.signal);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      logger.error("Error processing text lens request:", error);
      throw AppError.badRequest(error instanceof Error ? error.message : "Invalid request");
    }
  }
}