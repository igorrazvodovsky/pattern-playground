/**
 * Explanation service for dynamic explanation functionality
 * Handles streaming API calls to the backend explanation endpoint
 */

import type { SelectedReference } from '../components/reference/types';
import { streamSSE } from './api-client';

export interface ExplanationRequest {
  text: string;
  references?: SelectedReference[];
  context?: string;
}

export interface ExplanationCallbacks {
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Explanation service class
 */
export class ExplanationService {
  private abortController: AbortController | null = null;

  /**
   * Stream explanation for given text and references
   */
  async streamExplanation(
    request: ExplanationRequest,
    callbacks: ExplanationCallbacks = {}
  ): Promise<string> {
    // Cancel any existing stream
    this.cancelStream();

    const controller = new AbortController();
    this.abortController = controller;

    let accumulatedContent = '';

    try {
      await streamSSE('/api/explain', request, {
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
   * Convenience method for explaining text without references
   */
  async explainText(
    text: string,
    callbacks?: ExplanationCallbacks,
    context?: string
  ): Promise<string> {
    return this.streamExplanation({
      text,
      context
    }, callbacks);
  }

  /**
   * Convenience method for explaining text with references
   */
  async explainWithReferences(
    text: string,
    references: SelectedReference[],
    callbacks?: ExplanationCallbacks,
    context?: string
  ): Promise<string> {
    return this.streamExplanation({
      text,
      references,
      context
    }, callbacks);
  }
}

// Export singleton instance
export const explanationService = new ExplanationService();