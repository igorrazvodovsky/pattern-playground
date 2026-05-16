import { Request, Response } from 'express';
import { explanationRequestSchema } from '../schemas.js';
import { StreamingService } from '../services/streaming.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

export class ExplanationHandler {
  static async handleExplain(req: Request, res: Response): Promise<void> {
    logger.debug("Received explanation request:", req.body);

    try {
      // Validate request
      const validatedRequest = explanationRequestSchema.parse(req.body);
      logger.info(`Processing explanation request for text: ${validatedRequest.text.slice(0, 50)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        await StreamingService.handleExplanationStream(res, validatedRequest, controller.signal);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      logger.error("Error processing explanation request:", error);
      throw AppError.badRequest(error instanceof Error ? error.message : "Invalid request");
    }
  }
}