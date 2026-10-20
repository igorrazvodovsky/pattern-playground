/**
 * Text transformation service for text lens functionality
 * Handles streaming API calls to the backend zoom endpoint
 */

import { streamSSE } from './api-client';

export interface TextLensRequest {
  text: string;
  context?: string;
  direction: 'in' | 'out';
  intensity: number;
  currentLevel?: number;
}

export interface TextLensCallbacks {
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
  currentLevel?: number;
}

/**
 * Text transformation service class
 */
export class TextTransformService {
  private abortController: AbortController | null = null;

  /**
   * Stream text lens transformation
   */
  async streamZoom(request: TextLensRequest, callbacks: TextLensCallbacks = {}): Promise<string> {
    // Cancel any existing stream
    this.cancelStream();

    const controller = new AbortController();
    this.abortController = controller;

    let accumulatedContent = '';

    try {
      await streamSSE('/api/text/zoom', request, {
        signal: controller.signal,
        onChunk: (content) => {
          accumulatedContent += content;
          callbacks.onChunk?.(content);
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return accumulatedContent;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(errorMessage);
      throw error;
    } finally {
      // A newer stream may have replaced this one; leave its controller alone.
      if (this.abortController === controller) this.abortController = null;
    }

    // Outside the try, so an exception in the caller's handler isn't reported as a stream failure.
    callbacks.onComplete?.();
    return accumulatedContent;
  }

  /**
   * Cancel the current streaming operation
   */
  cancelStream(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Check if a stream is currently active
   */
  isStreaming(): boolean {
    return this.abortController !== null;
  }

  /**
   * Convenience method for zoom in
   */
  async zoomIn(
    text: string,
    intensity: number = 25,
    callbacks?: TextLensCallbacks,
    context?: string,
  ): Promise<string> {
    return this.streamZoom(
      {
        text,
        direction: 'in',
        intensity,
        context,
      },
      callbacks,
    );
  }

  /**
   * Convenience method for zoom out
   */
  async zoomOut(
    text: string,
    intensity: number = 25,
    callbacks?: TextLensCallbacks,
    context?: string,
  ): Promise<string> {
    return this.streamZoom(
      {
        text,
        direction: 'out',
        intensity,
        context,
      },
      callbacks,
    );
  }
}

// Export singleton instance
export const textTransformService = new TextTransformService();
