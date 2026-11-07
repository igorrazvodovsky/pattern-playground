import { Request, Response } from 'express';
import { revisionRequestSchema } from '../schemas.js';
import { openaiService } from '../services/openai.js';
import { streamSSE } from '../services/streaming.js';
import { withTimeout } from './shared.js';
import logger from '../logger.js';

export class RevisionHandler {
  static async handleRevision(req: Request, res: Response): Promise<void> {
    const validatedRequest = revisionRequestSchema.parse(req.body);
    logger.info(`Processing revision: ${validatedRequest.instruction}`);

    await withTimeout(30000, (timeout) =>
      streamSSE(res, timeout, (signal) =>
        openaiService.generateRevisionStream(validatedRequest, signal),
      ),
    );
  }
}
