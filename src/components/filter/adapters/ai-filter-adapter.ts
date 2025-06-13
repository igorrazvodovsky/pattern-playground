import { AICommandResult, AICommandItem } from '../../command-menu/ai-command-types';
import { AIFilterResult } from '../../../services/ai-filter-service';
import { FilterType } from '../filter-types';

export function convertToAICommandResult(filterResult: AIFilterResult): AICommandResult {
  return {
    suggestedItems: filterResult.suggestedFilters.map(filter => ({
      id: filter.id,
      label: `${filter.type} ${filter.operator} ${filter.value.join(', ')}`,
      value: filter,
      icon: getFilterIcon(filter.type),
      metadata: {
        type: filter.type,
        operator: filter.operator,
        value: filter.value
      }
    })),
    confidence: filterResult.confidence,
    unmatchedCriteria: filterResult.unmatchedCriteria
  };
}

function getFilterIcon(type: FilterType): string {
  const iconMap: Record<FilterType, string> = {
    [FilterType.ASSIGNEE]: 'ph:user',
    [FilterType.DUE_DATE]: 'ph:calendar',
    [FilterType.PRIORITY]: 'ph:flag',
    [FilterType.STATUS]: 'ph:circle',
    [FilterType.TAG]: 'ph:tag'
  };
  return iconMap[type] || 'ph:sparkle';
}