import { AICommandResult as ComponentAIResult, AICommandItem } from '../ai-command-types';
import { AICommandResult as ServiceAIResult } from '../../../services/ai-command-service';

/**
 * Convert AI command service result to component AI result format
 */
export function convertToAICommandResult(serviceResult: ServiceAIResult): ComponentAIResult {
  const suggestedItems: AICommandItem[] = serviceResult.suggestedCommands.map((command) => ({
    id: command.id,
    label: command.name,
    value: command.action || command.name,
    icon: command.icon,
    metadata: {
      action: command.action,
      name: command.name
    }
  }));

  return {
    suggestedItems,
    confidence: serviceResult.confidence,
    unmatchedCriteria: serviceResult.unmatchedCriteria
  };
}