import { Request, Response } from 'express';
import { openaiService } from '../services/openai.js';
import config from '../config.js';
import { timelineGroupingRequestSchema, TimelineGrouping } from '../schemas.js';
import { BoundedCache, ok, withTimeout } from './shared.js';
import logger from '../logger.js';

/* The same timeline is grouped identically every time it is asked for, and a
   pattern page asks on every visit. Keyed on the records themselves, so an
   edited ledger misses and re-groups. */
const groupings = new BoundedCache<TimelineGrouping>();

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
    const validatedRequest = timelineGroupingRequestSchema.parse(req.body);

    const key = cacheKey(validatedRequest);
    const cached = groupings.get(key);
    if (cached) {
      logger.info('Serving cached timeline grouping');
      ok(res, cached);
      return;
    }

    logger.info(`Grouping ${validatedRequest.records.length} timeline records`);

    const grouping = await withTimeout(60000, (signal) =>
      openaiService.groupTimeline(validatedRequest, signal)
    );
    groupings.set(key, grouping);
    ok(res, grouping);
  }
}
