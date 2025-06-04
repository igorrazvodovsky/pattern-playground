import { FilterType, FilterOperator, Filter } from "../components/filter/filter-types";
import { APIError } from "../utils/api";

export interface AIFilterRequest {
  prompt: string;
  availableFilters: FilterType[];
  availableValues: Record<FilterType, string[]>;
}

export interface AIFilterResult {
  suggestedFilters: Filter[];
  explanation: string;
  confidence: number;
  unmatchedCriteria?: string[];
  rawResponse?: string; // For debugging
}

export interface AIState {
  isProcessing: boolean;
  result?: AIFilterResult;
  hasUnresolvedQuery: boolean;
  error?: string;
}

/**
 * Get the appropriate API endpoint based on environment
 * @returns API endpoint URL
 */
function getFilterApiEndpoint(): string {
  // Development environment
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.location.hostname === 'localhost')) {
    return 'http://localhost:3000/api/generate-filters';
  }

  // Production environment - use environment variable if available
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return `${apiUrl}/api/generate-filters`;
  }

  // Fallback to same-origin API
  return '/api/generate-filters';
}

export class AIFilterService {

  async generateFilters(request: AIFilterRequest): Promise<AIFilterResult> {
    const endpoint = getFilterApiEndpoint();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          prompt: request.prompt,
          availableFilters: request.availableFilters,
          availableValues: Object.fromEntries(
            Object.entries(request.availableValues).map(([key, values]) => [
              key,
              values
            ])
          )
        })
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
      throw new APIError(`Failed to fetch AI filters: ${(error as Error).message}`);
    }
  }

  private transformBackendResponse(backendData: any): AIFilterResult {
    try {
      // Transform backend response to frontend format
      const suggestedFilters: Filter[] = (backendData.suggestedFilters || []).map((filter: any, index: number) => ({
        id: `ai-filter-${Date.now()}-${index}`,
        type: filter.type as FilterType,
        operator: filter.operator as FilterOperator,
        value: Array.isArray(filter.value) ? filter.value : [filter.value]
      }));

      return {
        suggestedFilters,
        explanation: backendData.explanation || 'AI generated filters',
        confidence: Math.min(100, Math.max(0, backendData.confidence || 70)),
        unmatchedCriteria: backendData.unmatchedCriteria || [],
        rawResponse: JSON.stringify(backendData)
      };
    } catch (error) {
      throw new APIError(`Failed to transform AI response: ${(error as Error).message}`);
    }
  }
}

// Utility function to create the service instance
export const createAIFilterService = (): AIFilterService => {
  return new AIFilterService();
};