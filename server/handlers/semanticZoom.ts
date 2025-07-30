import { Request, Response } from 'express';
import { semanticZoomRequestSchema } from '../schemas.js';
import { StreamingService } from '../services/streaming.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

export class SemanticZoomHandler {
  static async handleSemanticZoom(req: Request, res: Response): Promise<void> {
    logger.debug("Received semantic zoom request:", req.body);

    try {
      // Validate request
      const validatedRequest = semanticZoomRequestSchema.parse(req.body);
      logger.info(`Processing semantic zoom: ${validatedRequest.direction} ${validatedRequest.intensity}%`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        await StreamingService.handleSemanticZoomStream(res, validatedRequest, controller.signal);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      logger.error("Error processing semantic zoom request:", error);
      throw AppError.badRequest(error instanceof Error ? error.message : "Invalid request");
    }
  }
}