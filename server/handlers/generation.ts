import { Request, Response } from 'express';
import { juiceProductionSchema } from '../schemas.js';
import { openaiService } from '../services/openai.js';
import { StreamingService } from '../services/streaming.js';
import { ApiResponse } from '../types/api.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

export class GenerationHandler {
  static async handleGenerate(req: Request, res: Response): Promise<void> {
    logger.debug("Received request body:", req.body);

    if (!req.body || !req.body.prompt) {
      throw AppError.badRequest("Missing 'prompt' in request body");
    }

    const prompt: string = req.body.prompt;
    logger.info(`Processing prompt: "${prompt}"`);

    const shouldStream: boolean = !!(req.headers.accept?.includes('text/event-stream'));
    logger.debug(`Streaming requested: ${shouldStream}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      if (shouldStream) {
        await StreamingService.handleJuiceProductionStream(res, prompt, controller.signal);
      } else {
        await GenerationHandler.handleStandardResponse(res, prompt, controller.signal);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static async handleStandardResponse(res: Response, prompt: string, signal?: AbortSignal): Promise<void> {
    try {
      const parsedContent = await openaiService.generateJuiceProduction(prompt, signal);

      // Validate the response against our schema
      try {
        juiceProductionSchema.parse(parsedContent);
        logger.debug("Successfully validated OpenAI response");
      } catch (validationError) {
        logger.error("Failed to validate OpenAI response against schema:", validationError);

        // If validation fails but we have a valid object, return it anyway
        if (parsedContent && typeof parsedContent === 'object') {
          logger.warn("Returning unvalidated response object");
          res.status(200).json({
            success: true,
            data: parsedContent,
            error: null
          } as ApiResponse<typeof parsedContent>);
          return;
        }

        throw AppError.internal("Failed to validate OpenAI response against schema");
      }

      res.status(200).json({
        success: true,
        data: parsedContent,
        error: null
      } as ApiResponse<typeof parsedContent>);
    } catch (error) {
      logger.error("Error in standard response:", error);
      throw error;
    }
  }
}