/**
 * Text transformation service for semantic zoom functionality
 * Handles streaming API calls to the backend zoom endpoint
 */

export interface SemanticZoomRequest {
  text: string;
  context?: string;
  direction: 'in' | 'out';
  intensity: number;
  currentLevel?: number;
}

export interface SemanticZoomStreamChunk {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  done: boolean;
  error?: string;
}

export interface SemanticZoomCallbacks {
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
   * Stream semantic zoom transformation
   */
  async streamZoom(
    request: SemanticZoomRequest,
    callbacks: SemanticZoomCallbacks = {}
  ): Promise<string> {
    // Cancel any existing stream
    this.cancelStream();
    
    // Create new abort controller
    this.abortController = new AbortController();

    let accumulatedContent = '';

    try {
      const response = await fetch('http://localhost:3000/api/text/zoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
                const data: SemanticZoomStreamChunk = JSON.parse(jsonStr);
                
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
   * Convenience method for zoom in
   */
  async zoomIn(
    text: string,
    intensity: number = 25,
    callbacks?: SemanticZoomCallbacks,
    context?: string
  ): Promise<string> {
    return this.streamZoom({
      text,
      direction: 'in',
      intensity,
      context
    }, callbacks);
  }

  /**
   * Convenience method for zoom out
   */
  async zoomOut(
    text: string,
    intensity: number = 25,
    callbacks?: SemanticZoomCallbacks,
    context?: string
  ): Promise<string> {
    return this.streamZoom({
      text,
      direction: 'out',
      intensity,
      context
    }, callbacks);
  }
}

// Export singleton instance
export const textTransformService = new TextTransformService();