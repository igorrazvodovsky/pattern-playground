import { Request, Response } from 'express';
import { explanationRequestSchema } from '../schemas.js';
import { openaiService } from '../services/openai.js';
import { streamSSE } from '../services/streaming.js';
import { withTimeout } from './shared.js';
import logger from '../logger.js';

export class ExplanationHandler {
  static async handleExplain(req: Request, res: Response): Promise<void> {
    logger.debug('Received explanation request:', req.body);
    const validatedRequest = explanationRequestSchema.parse(req.body);
    logger.info(
      `Processing explanation request for text: ${validatedRequest.text.slice(0, 50)}...`,
    );

    await withTimeout(30000, (timeout) =>
      streamSSE(res, timeout, (signal) =>
        openaiService.generateExplanationStream(validatedRequest, signal),
      ),
    );
  }
}
