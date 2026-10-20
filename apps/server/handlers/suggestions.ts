import { Request, Response } from 'express';
import { openaiService } from '../services/openai.js';
import { suggestionRequestSchema } from '../schemas.js';
import { ok, withTimeout } from './shared.js';
import logger from '../logger.js';

export class SuggestionsHandler {
  static async handleGenerateSuggestions(req: Request, res: Response): Promise<void> {
    logger.debug('Received AI suggestion request:', req.body);
    const { prompt, context } = suggestionRequestSchema.parse(req.body);
    logger.info(`Processing ${context.type} suggestion prompt: "${prompt}"`);

    const suggestionData = await withTimeout(30000, (signal) =>
      openaiService.generateSuggestions(prompt, context, signal),
    );
    ok(res, suggestionData);
  }
}
