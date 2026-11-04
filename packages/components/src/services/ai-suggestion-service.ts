import type { JsonValue } from '../types/common.js';
import { APIError, postJSON } from './api-client';

export interface AISuggestionRequest {
  prompt: string;
  context: {
    type: 'filters' | 'commands' | 'navigation' | 'actions' | string;
    availableOptions: Record<string, (string | number | boolean)[]>;
    metadata?: Record<string, JsonValue>;
  };
}

export interface AISuggestionItem {
  id: string;
  label: string;
  value: string | number | boolean;
  confidence: number;
  metadata?: Record<string, JsonValue>;
}

export interface AISuggestionResult {
  suggestions: AISuggestionItem[];
  explanation: string;
  confidence: number;
  unmatchedCriteria?: string[];
}

export interface AIState {
  isProcessing: boolean;
  result?: AISuggestionResult;
  hasUnresolvedQuery: boolean;
  error?: string;
}

export class AISuggestionService {
  async generateSuggestions(
    request: AISuggestionRequest,
    signal?: AbortSignal,
  ): Promise<AISuggestionResult> {
    try {
      const data = await postJSON<unknown>('/api/generate-suggestions', request, { signal });
      return this.transformBackendResponse(data);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch AI suggestions: ${(error as Error).message}`);
    }
  }

  private transformBackendResponse(backendData: unknown): AISuggestionResult {
    try {
      // Type-safe response transformation
      const backendRecord = backendData as Record<string, unknown>;
      const suggestionsArray = (backendRecord.suggestions as unknown[]) || [];

      const suggestions: AISuggestionItem[] = suggestionsArray.map((suggestion: unknown) => {
        const suggestionRecord = suggestion as Record<string, unknown>;
        return {
          id: String(suggestionRecord.id),
          label: String(suggestionRecord.label),
          value: suggestionRecord.value as string | number | boolean,
          confidence: Math.min(100, Math.max(0, Number(suggestionRecord.confidence) || 70)),
          metadata: (suggestionRecord.metadata as Record<string, JsonValue>) || {},
        };
      });

      return {
        suggestions,
        explanation: String(backendRecord.explanation || 'AI generated suggestions'),
        confidence: Math.min(100, Math.max(0, Number(backendRecord.confidence) || 70)),
        unmatchedCriteria: (backendRecord.unmatchedCriteria as string[]) || [],
      };
    } catch (error) {
      throw new APIError(`Failed to transform AI response: ${(error as Error).message}`);
    }
  }
}

// Utility function to create the service instance
export const createAISuggestionService = (): AISuggestionService => {
  return new AISuggestionService();
};

// Context-specific helper functions
export const createFilterSuggestionRequest = (
  prompt: string,
  availableFilters: string[],
  availableValues: Record<string, string[]>,
): AISuggestionRequest => ({
  prompt,
  context: {
    type: 'filters',
    availableOptions: availableValues,
    metadata: { availableFilters },
  },
});

export const createCommandSuggestionRequest = (
  prompt: string,
  availableCommands: Record<string, string[]>,
): AISuggestionRequest => ({
  prompt,
  context: {
    type: 'commands',
    availableOptions: availableCommands,
  },
});
