import { Request, Response } from 'express';
import { openaiService } from '../services/openai.js';
import config from '../config.js';
import { deductionRequestSchema } from '../schemas.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

/* The same neighbourhood is deduced identically every time it is asked for, and
   a reader walking a model comes back to the same components. Keyed on the
   request body, so an edited model misses and re-deduces; bounded because this
   is a demo server, not a cache tier. */
const deductions = new Map<string, unknown>();
const CACHE_LIMIT = 32;

/* Bumped whenever the prompt changes shape: a reply written against an older
   contract is not a cache hit, it is a wrong answer served fast. */
const PROMPT_VERSION = 1;

function cacheKey(body: unknown): string {
  /* The model is part of the key: swapping it changes the answer, and a
     process that outlives the swap shouldn't serve the old one. */
  return `${PROMPT_VERSION}|${config.openai.fastModel}|${JSON.stringify(body)}`;
}

export class ModelDeduceHandler {
  static async handleDeduce(req: Request, res: Response): Promise<void> {
    logger.debug('Received model deduction request');

    let validatedRequest;
    try {
      validatedRequest = deductionRequestSchema.parse(req.body);
    } catch (error) {
      throw AppError.badRequest(error instanceof Error ? error.message : 'Invalid request');
    }

    const key = cacheKey(validatedRequest);
    const cached = deductions.get(key);
    if (cached) {
      logger.info('Serving cached model deduction');
      res.status(200).json({ success: true, data: cached, error: null });
      return;
    }

    logger.info(`Deducing connections for ${validatedRequest.focus.name}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const deduction = await openaiService.deduceConnections(validatedRequest, controller.signal);

      if (deductions.size >= CACHE_LIMIT) {
        deductions.delete(deductions.keys().next().value!);
      }
      deductions.set(key, deduction);

      res.status(200).json({ success: true, data: deduction, error: null });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
