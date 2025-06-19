import { APIError } from "../utils/api";

// Generic interfaces matching the backend
export interface AISuggestionRequest {
  prompt: string;
  context: {
    type: 'filters' | 'commands' | 'navigation' | 'actions' | string;
    availableOptions: Record<string, any[]>;
    metadata?: Record<string, any>;
  };
}

export interface AISuggestionItem {
  id: string;
  label: string;
  value: any;
  confidence: number;
  metadata?: Record<string, any>;
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

/**
 * Get the appropriate API endpoint based on environment
 */
function getSuggestionApiEndpoint(): string {
  // Development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'http://localhost:3000/api/generate-suggestions';
  }

  // Production environment - use environment variable if available
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/generate-suggestions`;
  }

  // Fallback to same-origin API
  return '/api/generate-suggestions';
}

export class AISuggestionService {
  async generateSuggestions(request: AISuggestionRequest): Promise<AISuggestionResult> {
    const endpoint = getSuggestionApiEndpoint();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(`API returned ${response.status}: ${errorText}`, response.status);
      }

      const data = await response.json();

      if (!data.success) {
        throw new APIError(data.error || 'Unknown API error');
      }

      return this.transformBackendResponse(data.data);
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(`Failed to fetch AI suggestions: ${(error as Error).message}`);
    }
  }

  private transformBackendResponse(backendData: any): AISuggestionResult {
    try {
      // Transform backend response to frontend format
      const suggestions: AISuggestionItem[] = (backendData.suggestions || []).map((suggestion: any) => ({
        id: suggestion.id,
        label: suggestion.label,
        value: suggestion.value,
        confidence: Math.min(100, Math.max(0, suggestion.confidence || 70)),
        metadata: suggestion.metadata || {}
      }));

      return {
        suggestions,
        explanation: backendData.explanation || 'AI generated suggestions',
        confidence: Math.min(100, Math.max(0, backendData.confidence || 70)),
        unmatchedCriteria: backendData.unmatchedCriteria || []
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
  availableValues: Record<string, string[]>
): AISuggestionRequest => ({
  prompt,
  context: {
    type: 'filters',
    availableOptions: availableValues,
    metadata: { availableFilters }
  }
});

export const createCommandSuggestionRequest = (
  prompt: string,
  availableCommands: Record<string, string[]>
): AISuggestionRequest => ({
  prompt,
  context: {
    type: 'commands',
    availableOptions: availableCommands
  }
});

export const createNavigationSuggestionRequest = (
  prompt: string,
  availablePages: Record<string, string[]>
): AISuggestionRequest => ({
  prompt,
  context: {
    type: 'navigation',
    availableOptions: availablePages
  }
});