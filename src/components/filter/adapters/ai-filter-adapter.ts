import { AICommandResult } from '../../command-menu/ai-command-types';
import { AISuggestionResult, createFilterSuggestionRequest, createAISuggestionService } from '../../../services/ai-suggestion-service';
import { FilterType } from '../filter-types';

export function convertGenericSuggestionToAICommandResult(suggestionResult: AISuggestionResult): AICommandResult {
  return {
    suggestedItems: suggestionResult.suggestions.map(suggestion => ({
      id: suggestion.id,
      label: suggestion.label,
      value: suggestion.value,
      icon: suggestion.metadata?.type ? getFilterIcon(suggestion.metadata.type as FilterType) : 'ph:sparkle',
      metadata: suggestion.metadata
    })),
    confidence: suggestionResult.confidence,
    unmatchedCriteria: suggestionResult.unmatchedCriteria
  };
}

function getFilterIcon(type: FilterType): string {
  const iconMap: Record<FilterType, string> = {
    [FilterType.ASSIGNEE]: 'ph:user',
    [FilterType.DUE_DATE]: 'ph:calendar',
    [FilterType.PRIORITY]: 'ph:flag',
    [FilterType.STATUS]: 'ph:circle',
    [FilterType.LABELS]: 'ph:tag',
    [FilterType.CREATED_DATE]: 'ph:calendar-plus',
    [FilterType.UPDATED_DATE]: 'ph:calendar-check'
  };
  return iconMap[type] || 'ph:sparkle';
}

// Main function to generate filter suggestions using the generic service
export async function generateFilterSuggestions(
  prompt: string,
  availableFilters: FilterType[],
  availableValues: Record<FilterType, string[]>
): Promise<AICommandResult> {
  const service = createAISuggestionService();
  const request = createFilterSuggestionRequest(
    prompt,
    availableFilters,
    availableValues as Record<string, string[]>
  );

  const result = await service.generateSuggestions(request);
  return convertGenericSuggestionToAICommandResult(result);
}