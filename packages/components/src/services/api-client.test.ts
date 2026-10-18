import { afterEach, describe, expect, it, vi } from 'vitest';
import { APIError, postJSON, streamSSE } from './api-client.js';

// The stream reader is where the old copies went wrong, so the cases follow
// what a network actually does to an event stream: split events across reads,
// report failure mid-stream, and close without warning.

function streamOf(...pieces: string[]): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      pieces.forEach((piece) => controller.enqueue(encoder.encode(piece)));
      controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

const event = (data: object) => `data: ${JSON.stringify(data)}\n\n`;

function respondWith(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

afterEach(() => vi.unstubAllGlobals());

describe('streamSSE', () => {
  it('joins an event split across two reads', async () => {
    const whole = event({ type: 'chunk', content: 'hello', done: false });
    respondWith(streamOf(whole.slice(0, 12), whole.slice(12), event({ type: 'complete', done: true })));

    const chunks: string[] = [];
    const text = await streamSSE('/api/test', {}, { onChunk: (c) => chunks.push(c) });

    expect(text).toBe('hello');
    expect(chunks).toEqual(['hello']);
  });

  it('rejects on an error event', async () => {
    respondWith(streamOf(event({ type: 'error', error: 'model failed', done: true })));

    await expect(streamSSE('/api/test', {})).rejects.toThrow('model failed');
  });

  it('rejects when the stream closes before complete', async () => {
    respondWith(streamOf(event({ type: 'chunk', content: 'partial', done: false })));

    await expect(streamSSE('/api/test', {})).rejects.toBeInstanceOf(APIError);
  });
});

describe('postJSON', () => {
  it('names the invalid fields from a validation failure', async () => {
    respondWith(
      new Response(
        JSON.stringify({
          success: false,
          data: null,
          error: 'Validation failed',
          validationErrors: [{ field: 'text', message: 'Required', code: 'invalid_type' }],
        }),
        { status: 400 }
      )
    );

    await expect(postJSON('/api/test', {})).rejects.toThrow('Validation failed (text: Required)');
  });
});
