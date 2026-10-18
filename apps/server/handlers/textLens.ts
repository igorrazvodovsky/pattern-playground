import { Request, Response } from 'express';
import { textLensRequestSchema } from '../schemas.js';
import { openaiService } from '../services/openai.js';
import { streamSSE } from '../services/streaming.js';
import { withTimeout } from './shared.js';
import logger from '../logger.js';

export class TextLensHandler {
  static async handleTextLens(req: Request, res: Response): Promise<void> {
    logger.debug("Received text lens request:", req.body);
    const validatedRequest = textLensRequestSchema.parse(req.body);
    logger.info(`Processing text lens: ${validatedRequest.direction} ${validatedRequest.intensity}%`);

    await withTimeout(30000, (timeout) =>
      streamSSE(res, timeout, (signal) => openaiService.generateTextLensStream(validatedRequest, signal))
    );
  }
}
