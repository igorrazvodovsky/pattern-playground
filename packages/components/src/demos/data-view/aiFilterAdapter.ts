import { attributeLabelFromBinding, productBinding } from '@shared/data/bindings';
import type { AICommandResult, AICommandItem } from '../../components/command-menu';

// Simplified AI adapter for the data-view filter demo. Suggestions come out
// in the shared clause vocabulary: { path, operator, values }.
export const generateProductFilterSuggestions = async (
  prompt: string,
  paths: string[],
  availableValues: Record<string, string[]>
): Promise<AICommandResult> => {
  // Simple mock implementation - in real app this would call AI service
  const suggestions: AICommandItem[] = [];

  // Basic keyword matching for demonstration
  const lowercasePrompt = prompt.toLowerCase();

  paths.forEach(path => {
    const label = attributeLabelFromBinding(productBinding, path);
    const values = availableValues[path] || [];
    values.forEach(value => {
      if (value.toLowerCase().includes(lowercasePrompt) ||
          label.toLowerCase().includes(lowercasePrompt)) {
        suggestions.push({
          label: `${label}: ${value}`,
          metadata: {
            path,
            operator: 'is',
            values: [value]
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
