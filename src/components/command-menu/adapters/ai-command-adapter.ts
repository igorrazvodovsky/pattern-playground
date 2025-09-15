import { AICommandResult as ComponentAIResult, AICommandItem } from '../ai-command-types';
import { AISuggestionResult } from '../../../services/ai-suggestion-service';

/**
 * Convert AI suggestion service result to component AI result format
 */
export function convertToAICommandResult(suggestionResult: AISuggestionResult): ComponentAIResult {
  const suggestedItems: AICommandItem[] = suggestionResult.suggestions.map((suggestion) => ({
    id: suggestion.id,
    label: suggestion.label,
    value: suggestion.value,
    icon: typeof suggestion.metadata?.icon === 'string' ? suggestion.metadata.icon : 'ph:sparkle',
    metadata: suggestion.metadata
  }));

  return {
    suggestedItems,
    confidence: suggestionResult.confidence,
    unmatchedCriteria: suggestionResult.unmatchedCriteria
  };
}