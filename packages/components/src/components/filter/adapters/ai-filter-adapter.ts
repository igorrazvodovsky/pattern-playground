import { AICommandResult } from '../../command-menu/ai-command-types';
import { AISuggestionResult, createFilterSuggestionRequest, createAISuggestionService } from '../../../services/ai-suggestion-service';
import { findAttribute, taskBinding } from '@shared/data/bindings';

function getFilterIcon(path: string): string {
  return findAttribute(taskBinding, path)?.icon ?? 'ph:sparkle';
}

export function convertGenericSuggestionToAICommandResult(suggestionResult: AISuggestionResult): AICommandResult {
  return {
    suggestedItems: suggestionResult.suggestions.map(suggestion => ({
      id: suggestion.id,
      label: suggestion.label,
      value: suggestion.value,
      icon: suggestion.metadata?.path ? getFilterIcon(String(suggestion.metadata.path)) : 'ph:sparkle',
      metadata: suggestion.metadata
    })),
    confidence: suggestionResult.confidence,
    unmatchedCriteria: suggestionResult.unmatchedCriteria
  };
}

// Main function to generate filter suggestions using the generic service
export async function generateFilterSuggestions(
  prompt: string,
  availablePaths: string[],
  availableValues: Record<string, string[]>,
  signal?: AbortSignal
): Promise<AICommandResult> {
  const service = createAISuggestionService();
  const request = createFilterSuggestionRequest(
    prompt,
    availablePaths,
    availableValues
  );

  const result = await service.generateSuggestions(request, signal);
  return convertGenericSuggestionToAICommandResult(result);
}
