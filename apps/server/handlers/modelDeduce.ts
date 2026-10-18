import { Request, Response } from 'express';
import { openaiService } from '../services/openai.js';
import config from '../config.js';
import { deductionRequestSchema, Deduction } from '../schemas.js';
import { BoundedCache, ok, withTimeout } from './shared.js';
import logger from '../logger.js';

/* The same neighbourhood is deduced identically every time it is asked for, and
   a reader walking a model comes back to the same components. Keyed on the
   request body, so an edited model misses and re-deduces. */
const deductions = new BoundedCache<Deduction>();

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
    const validatedRequest = deductionRequestSchema.parse(req.body);

    const key = cacheKey(validatedRequest);
    const cached = deductions.get(key);
    if (cached) {
      logger.info('Serving cached model deduction');
      ok(res, cached);
      return;
    }

    logger.info(`Deducing connections for ${validatedRequest.focus.name}`);

    const deduction = await withTimeout(60000, (signal) =>
      openaiService.deduceConnections(validatedRequest, signal)
    );
    deductions.set(key, deduction);
    ok(res, deduction);
  }
}
