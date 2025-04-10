/**
 * API module for calling OpenAI and handling responses
 */

// Type Definitions
export interface OpenAIOptions {
  /** Whether to stream the response */
  stream?: boolean;
  /** Callback for each chunk when streaming */
  onChunk?: (chunk: string, isDone: boolean) => void;
  /** Optional request timeout in milliseconds */
  timeout?: number;
  /** Whether to enable detailed logging */
  debug?: boolean;
}

export interface OpenAIResponse {
  model: OpenAIModelItem[];
}

export interface OpenAIModelItem {
  id: string;
  type: string;
  name: string;
  label: string;
  description: string;
  path: string[];
  parentId: string | null;
  childrenIds: string[];
  relationshipType: string | null;
  relationshipDescription: string | null;
  attributes: OpenAIAttribute[];
  rulesAndConstraints: string[];
  possibleActions: OpenAIAction[];
  relatedObjects: OpenAIRelatedObject[];
}

export interface OpenAIAttribute {
  name: string;
  label: string;
  value: string;
  unit: string | null;
}

export interface OpenAIAction {
  actionName: string;
  actionDescription: string;
}

export interface OpenAIRelatedObject {
  referenceId: string;
  relationshipType: string;
  relationshipDescription: string;
}

interface StreamChunk {
  /** The accumulated content as a JSON string */
  accumulated?: string;
  /** Whether this is the final chunk */
  done: boolean;
  /** Error message if there was an error */
  error?: string;
}

/**
 * Custom error class for API-related errors
 */
export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

/**
 * Calls the OpenAI API with the given prompt
 * @param prompt - The prompt to send to OpenAI
 * @param options - Additional options for the API call
 * @returns The response from OpenAI
 */
export async function callOpenAI(prompt: string, options: OpenAIOptions = {}): Promise<string> {
  const { stream = false, onChunk = null, timeout = 60000, debug = false } = options;

  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    throw new APIError('Prompt must be a non-empty string');
  }

  // Logger function that only logs when debug is enabled
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[API] ${message}`, ...args);
    }
  };

  // Error logger always logs
  const logError = (message: string, ...args: any[]) => {
    console.error(`[API ERROR] ${message}`, ...args);
  };

  // Use Express backend endpoint
  const endpoint = getApiEndpoint();
  log('Using API endpoint', endpoint);
  log('Sending prompt', prompt);
  log('Streaming mode', stream);

  try {
    const payload = JSON.stringify({ prompt });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': stream ? 'text/event-stream' : 'application/json'
      },
      mode: 'cors',
      credentials: 'include',
      body: payload,
      signal: controller.signal
    };

    log('Fetch options', fetchOptions);

    try {
      const response = await fetch(endpoint, fetchOptions);
      clearTimeout(timeoutId);

      log('Response status', response.status);

      if (debug) {
        log('Response headers', Object.fromEntries([...response.headers.entries()]));
      }

      if (!response.ok) {
        const errorText = await response.text();
        logError('API error response', errorText);
        throw new APIError(`API returned ${response.status}: ${errorText}`, response.status);
      }

      // Handle streaming response
      if (stream && onChunk && response.body) {
        return await handleStreamingResponse(response, onChunk, log, logError);
      }

      // Handle regular JSON response (non-streaming)
      return await handleJsonResponse(response, stream, onChunk, log, logError);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new APIError(`Request timed out after ${timeout}ms`);
      }

      throw error;
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    logError('Network or parsing error', error);
    throw new APIError(`Failed to fetch API: ${error.message}`);
  }
}

/**
 * Handles streaming response from the API
 */
async function handleStreamingResponse(
  response: Response,
  onChunk: (chunk: string, isDone: boolean) => void,
  log: (message: string, ...args: any[]) => void,
  logError: (message: string, ...args: any[]) => void
): Promise<string> {
  try {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let chunksReceived = false;

    // Process the stream
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunksReceived = true;
      // Decode the chunk
      const chunk = decoder.decode(value, { stream: true });
      log('Raw chunk received', chunk);

      // First, check if the chunk is a direct JSON response rather than SSE format
      if (chunk.trim().startsWith('{') && !chunk.includes('data: ')) {
        try {
          log('Detected direct JSON response instead of SSE format');
          const jsonData = JSON.parse(chunk);
          log('Parsed direct JSON response', jsonData);

          // Update the accumulated content
          accumulatedContent = chunk;

          // Call the callback with the complete content
          onChunk(accumulatedContent, true);

          // We're done processing since we got the full response
          return accumulatedContent;
        } catch (e) {
          log('Failed to parse direct JSON response', e);
        }
      }

      // Process SSE format (data: {...}\n\n)
      const lines = chunk.split('\n\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const eventData = JSON.parse(line.substring(6)) as StreamChunk;
            log('Parsed event data', eventData);

            if (eventData.error) {
              logError('Stream error', eventData.error);
              throw new APIError(eventData.error);
            }

            if (eventData.done) {
              // Final accumulated content
              accumulatedContent = eventData.accumulated || '';
              log('Stream complete');
              onChunk(accumulatedContent, true);
              break;
            }

            if (eventData.accumulated) {
              // Update accumulated content
              accumulatedContent = eventData.accumulated;
              log('Updated accumulated content');
              // Call the callback with the current accumulated content
              onChunk(accumulatedContent, false);
            }
          } catch (e) {
            log('Error parsing SSE data', e, line);
          }
        }
      }
    }

    // If we completed the stream but didn't receive any chunks,
    // we should try to handle it as a non-streaming response
    if (!chunksReceived) {
      log('No chunks received in stream, falling back to JSON response');
      try {
        const data = await response.clone().json();
        log('Fallback JSON response received');
        if (onChunk) {
          const jsonStr = JSON.stringify(data);
          onChunk(jsonStr, true);
        }
        return JSON.stringify(data);
      } catch (err) {
        log('Failed to parse fallback response as JSON', err);
        return accumulatedContent;
      }
    }

    return accumulatedContent;
  } catch (error) {
    logError('Error processing stream', error);
    throw error;
  }
}

/**
 * Handles regular JSON response from the API
 */
async function handleJsonResponse(
  response: Response,
  stream: boolean,
  onChunk: ((chunk: string, isDone: boolean) => void) | null,
  log: (message: string, ...args: any[]) => void,
  logError: (message: string, ...args: any[]) => void
): Promise<string> {
  try {
    const data = await response.json();
    log('Regular JSON response received');

    if (stream && onChunk) {
      // Call the onChunk function with the non-streaming response
      // to maintain consistent behavior even without streaming
      const jsonStr = JSON.stringify(data.data || data);
      onChunk(jsonStr, true);
      return jsonStr;
    }

    return JSON.stringify(data.data || data);
  } catch (error) {
    logError('Error parsing JSON response', error);
    throw new APIError(`Failed to parse JSON response: ${error.message}`);
  }
}
/**
 * Get the appropriate API endpoint based on environment
 * @returns API endpoint URL
 */
function getApiEndpoint(): string {
  // Development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'http://localhost:3000/api/generate';
  }

  // Production environment - use environment variable if available
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/generate`;
  }

  // Fallback to same-origin API (for backwards compatibility)
  return '/api/generate';
}
