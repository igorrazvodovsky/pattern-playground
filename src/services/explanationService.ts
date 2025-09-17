/**
 * Explanation service for dynamic explanation functionality
 * Handles streaming API calls to the backend explanation endpoint
 */

import type { SelectedReference } from '../components/reference/types';

export interface ExplanationRequest {
  text: string;
  references?: SelectedReference[];
  context?: string;
}

export interface ExplanationStreamChunk {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
}

export interface ExplanationCallbacks {
  onChunk?: (content: string) => void;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Get the appropriate API endpoint based on environment
 */
function getExplainApiEndpoint(): string {
  // Development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'http://localhost:3000/api/explain';
  }

  // Production environment - use environment variable if available
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/explain`;
  }

  // Fallback to same-origin API
  return '/api/explain';
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

    // Create new abort controller
    this.abortController = new AbortController();

    let accumulatedContent = '';

    try {
      const response = await fetch(getExplainApiEndpoint(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(request),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Create a reader for the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // Process SSE format (data: {...}\n\n)
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6); // Remove 'data: ' prefix
                const data: ExplanationStreamChunk = JSON.parse(jsonStr);

                if (data.type === 'chunk' && data.content) {
                  accumulatedContent += data.content;
                  callbacks.onChunk?.(data.content);
                } else if (data.type === 'complete') {
                  callbacks.onComplete?.();
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'Unknown server error');
                }
              } catch (parseError) {
                console.warn('Failed to parse SSE chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return accumulatedContent;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream was cancelled');
        return accumulatedContent;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      callbacks.onError?.(errorMessage);
      throw error;
    } finally {
      this.abortController = null;
    }
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