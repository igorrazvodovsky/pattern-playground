/**
 * Calls the OpenAI API with the given prompt
 * @param prompt - The prompt to send to OpenAI
 * @param options - Additional options
 * @param options.stream - Whether to stream the response
 * @param options.onChunk - Callback for each chunk when streaming
 * @returns The response from OpenAI
 */
export function callOpenAI(
  prompt: string,
  options?: {
    stream?: boolean;
    onChunk?: (chunk: string, isDone: boolean) => void;
  }
): Promise<string>;

/**
 * Get the appropriate API endpoint based on environment
 * @returns API endpoint URL
 */
declare function getApiEndpoint(): string;
