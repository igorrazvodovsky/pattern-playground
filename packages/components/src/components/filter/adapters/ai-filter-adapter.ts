import type { AICommandResult } from '../../command-menu/ai-command-types';
import { type AISuggestionResult, createFilterSuggestionRequest, createAISuggestionService } from '../../../services/ai-suggestion-service';
import { findAttribute, taskBinding } from '@shared/data/bindings';
import { attributeGlyph } from '../../../utility/attribute-icons';

function getFilterIcon(path: string): string {
  return attributeGlyph(findAttribute(taskBinding, path)?.icon) ?? 'ik:sparkles';
}

export function convertGenericSuggestionToAICommandResult(suggestionResult: AISuggestionResult): AICommandResult {
  return {
    suggestedItems: suggestionResult.suggestions.map(suggestion => ({
      id: suggestion.id,
      label: suggestion.label,
      value: suggestion.value,
      icon: suggestion.metadata?.path ? getFilterIcon(String(suggestion.metadata.path)) : 'ik:sparkles',
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
