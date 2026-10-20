import { Response } from 'express';
import logger from '../logger.js';
import { StreamChunk as SSEChunk } from '../schemas.js';
import { StreamChunk } from './openai.js';

/**
 * Write a text stream as server-sent events: one `chunk` event per piece of
 * text, then `complete`. Once the headers are sent the status can't change, so
 * a failure mid-stream is reported as an `error` event rather than thrown.
 *
 * `open` receives a signal that aborts on `signal` or when the client
 * disconnects, so a cancelled request stops generating.
 */
export async function streamSSE(
  res: Response,
  signal: AbortSignal,
  open: (signal: AbortSignal) => AsyncIterable<StreamChunk>,
): Promise<void> {
  const disconnected = new AbortController();
  res.on('close', () => disconnected.abort());

  const send = (chunk: SSEChunk) => {
    if (!res.destroyed) res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  };

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  try {
    for await (const chunk of open(AbortSignal.any([signal, disconnected.signal]))) {
      if (chunk.text) send({ type: 'chunk', content: chunk.text, done: false });
    }
    send({ type: 'complete', done: true });
  } catch (error) {
    if (disconnected.signal.aborted) {
      logger.info('SSE stream stopped: client disconnected');
    } else {
      logger.error('Error in SSE stream:', error);
      send({
        type: 'error',
        error: error instanceof Error ? error.message : 'Server error',
        done: true,
      });
    }
  }
  res.end();
}
