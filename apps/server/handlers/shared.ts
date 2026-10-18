import { Response } from 'express';
import { ApiResponse } from '../types/api.js';

/** Run `fn` with a signal that aborts after `ms` milliseconds. */
export async function withTimeout<T>(ms: number, fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Send a successful `{success, data, error}` response. */
export function ok<T>(res: Response, data: T): void {
  res.status(200).json({ success: true, data, error: null } satisfies ApiResponse<T>);
}

/* Bounded because this is a demo server, not a cache tier. The oldest entry
   goes first. */
export class BoundedCache<T> {
  private entries = new Map<string, T>();

  constructor(private limit = 32) {}

  get(key: string): T | undefined {
    return this.entries.get(key);
  }

  set(key: string, value: T): void {
    if (this.entries.size >= this.limit) {
      this.entries.delete(this.entries.keys().next().value!);
    }
    this.entries.set(key, value);
  }
}
