import { Request, Response } from 'express';
import { openaiService } from '../services/openai.js';
import config from '../config.js';
import { timelineGroupingRequestSchema } from '../schemas.js';
import { AppError } from '../types/api.js';
import logger from '../logger.js';

/* The same timeline is grouped identically every time it is asked for, and a
   pattern page asks on every visit. Keyed on the records themselves, so an
   edited ledger misses and re-groups; bounded because this is a demo server,
   not a cache tier. */
const groupings = new Map<string, unknown>();
const CACHE_LIMIT = 32;

/* Bumped whenever the prompt changes shape: a reply written against an older
   contract is not a cache hit, it is a wrong answer served fast. */
const PROMPT_VERSION = 6;

function cacheKey(body: unknown): string {
  /* The model is part of the key: swapping it changes the answer, and a
     process that outlives the swap shouldn't serve the old one. */
  return `${PROMPT_VERSION}|${config.openai.fastModel}|${JSON.stringify(body)}`;
}

export class TimelineHandler {
  static async handleGroup(req: Request, res: Response): Promise<void> {
    logger.debug('Received timeline grouping request');

    let validatedRequest;
    try {
      validatedRequest = timelineGroupingRequestSchema.parse(req.body);
    } catch (error) {
      throw AppError.badRequest(error instanceof Error ? error.message : 'Invalid request');
    }

    const key = cacheKey(validatedRequest);
    const cached = groupings.get(key);
    if (cached) {
      logger.info('Serving cached timeline grouping');
      res.status(200).json({ success: true, data: cached, error: null });
      return;
    }

    logger.info(`Grouping ${validatedRequest.records.length} timeline records`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const grouping = await openaiService.groupTimeline(validatedRequest, controller.signal);

      if (groupings.size >= CACHE_LIMIT) {
        groupings.delete(groupings.keys().next().value!);
      }
      groupings.set(key, grouping);

      res.status(200).json({ success: true, data: grouping, error: null });
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
