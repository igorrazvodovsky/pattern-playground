import { Request, Response } from 'express';
import { openaiService, AISuggestionRequest } from '../services/openai.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

export interface AISuggestionResponse {
  success: boolean;
  data: unknown | null;
  error: string | null;
}

export class SuggestionsHandler {
  static async handleGenerateSuggestions(req: Request, res: Response): Promise<void> {
    logger.debug("Received AI suggestion request:", req.body);

    if (!req.body || !req.body.prompt) {
      throw AppError.badRequest("Missing 'prompt' in request body");
    }

    if (!req.body.context || !req.body.context.type || !req.body.context.availableOptions) {
      throw AppError.badRequest("Missing or incomplete 'context' in request body");
    }

    const { prompt, context }: AISuggestionRequest = req.body;
    logger.info(`Processing ${context.type} suggestion prompt: "${prompt}"`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const suggestionData = await openaiService.generateSuggestions(prompt, context, controller.signal);

      res.status(200).json({
        success: true,
        data: suggestionData,
        error: null
      } as AISuggestionResponse);

    } finally {
      clearTimeout(timeoutId);
    }
  }
}