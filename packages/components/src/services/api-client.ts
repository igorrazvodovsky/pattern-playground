/**
 * Client for the Express backend in `apps/server`. Every JSON endpoint answers
 * with an `ApiResponse<T>`; the streaming endpoints answer with server-sent
 * events of `StreamChunk`.
 */

import type { ApiResponse } from '../types/common.js';

/** An error from a backend API call, carrying the HTTP status when there was one. */
export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/** One server-sent event on a streaming endpoint. */
export interface StreamChunk {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
}

/**
 * Resolve an API path (e.g. `/api/explain`) against the backend for the
 * current environment: the local Express server in development, the
 * `VITE_API_URL` origin when set, the same origin otherwise.
 */
export function apiEndpoint(path: string): string {
  if (
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')
  ) {
    return `http://localhost:3000${path}`;
  }

  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return `${apiUrl}${path}`;

  return path;
}

async function post(path: string, body: unknown, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(apiEndpoint(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    /* The server's error handler answers with an `ApiResponse` too, so its
       message is better than the bare status when there is one. A validation
       failure also lists which fields were wrong. */
    const payload = (await response.json().catch(() => null)) as
      | (ApiResponse<unknown> & { validationErrors?: { field: string; message: string }[] })
      | null;
    const fields = payload?.validationErrors?.map((issue) => `${issue.field}: ${issue.message}`);
    const message = payload?.error ?? `${path} returned ${response.status}`;
    throw new APIError(fields?.length ? `${message} (${fields.join('; ')})` : message, response.status);
  }

  return response;
}

function readCache<T>(key: string): T | null {
  try {
    const cached = sessionStorage.getItem(key);
    return cached ? (JSON.parse(cached) as T) : null;
  } catch {
    return null;
  }
}

function writeCache(key: string, value: unknown): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* A full or blocked store is not a reason to fail the view. */
  }
}

/**
 * POST `body` as JSON and return the response's `data`. With `cacheKey`, a
 * successful reply is kept in session storage for the visit and returned
 * without a request next time; callers version the key so a reply written
 * against an older prompt is never served.
 */
export async function postJSON<T>(
  path: string,
  body: unknown,
  options: { signal?: AbortSignal; cacheKey?: string } = {}
): Promise<T> {
  const { signal, cacheKey } = options;
  if (cacheKey) {
    const cached = readCache<T>(cacheKey);
    if (cached) return cached;
  }

  const response = await post(path, body, signal);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success || payload.data == null) {
    throw new APIError(payload.error ?? `${path} returned no data`);
  }

  if (cacheKey) writeCache(cacheKey, payload.data);
  return payload.data;
}

/**
 * POST `body` as JSON and read the reply as a stream of `StreamChunk` events,
 * passing each piece of text to `onChunk`. Resolves with the whole text once
 * the server sends `complete`. An `error` event, or a stream that closes
 * before `complete`, rejects.
 */
export async function streamSSE(
  path: string,
  body: unknown,
  options: { signal?: AbortSignal; onChunk?: (content: string) => void } = {}
): Promise<string> {
  const response = await post(path, body, options.signal);
  if (!response.body) throw new APIError('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) throw new APIError('The stream ended before it completed');

      /* An event can arrive split across reads, so only complete lines are
         parsed; the remainder waits for the next read. */
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        let event: StreamChunk;
        try {
          event = JSON.parse(line.slice(6));
        } catch (parseError) {
          console.warn('Failed to parse SSE chunk:', parseError);
          continue;
        }

        if (event.type === 'chunk' && event.content) {
          text += event.content;
          options.onChunk?.(event.content);
        } else if (event.type === 'complete') {
          return text;
        } else if (event.type === 'error') {
          throw new APIError(event.error || 'Unknown server error');
        }
      }
    }
  } finally {
    /* Release the connection whether the stream completed, failed or was
       cut off; cancelling a finished body does nothing. */
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
