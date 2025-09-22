import { ProductFilterType, ProductFilterOperator } from './FilterTypes';
import type { AICommandResult, AICommandItem } from '../../../components/command-menu';

// Simplified AI adapter for product filters
export const generateProductFilterSuggestions = async (
  prompt: string,
  filterTypes: ProductFilterType[],
  availableValues: Record<ProductFilterType, string[]>
): Promise<AICommandResult> => {
  // Simple mock implementation - in real app this would call AI service
  const suggestions: AICommandItem[] = [];

  // Basic keyword matching for demonstration
  const lowercasePrompt = prompt.toLowerCase();

  filterTypes.forEach(type => {
    const values = availableValues[type] || [];
    values.forEach(value => {
      if (value.toLowerCase().includes(lowercasePrompt) ||
          type.toLowerCase().includes(lowercasePrompt)) {
        suggestions.push({
          label: `${type}: ${value}`,
          metadata: {
            type,
            operator: ProductFilterOperator.IS,
            value: [value]
          }
        });
      }
    });
  });

  return {
    prompt,
    suggestedItems: suggestions.slice(0, 5), // Limit to 5 suggestions
    reasoning: `Found ${suggestions.length} filter suggestions based on "${prompt}"`
  };
};