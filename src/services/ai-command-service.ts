export interface AICommandRequest {
  prompt: string;
  availableCommands: string[];
  availableActions: Record<string, string[]>;
}

export interface AICommandResult {
  suggestedCommands: Array<{
    id: string;
    name: string;
    icon: string;
    action?: string;
  }>;
  explanation: string;
  confidence: number;
  unmatchedCriteria?: string[];
  rawResponse?: string; // For debugging
}

export interface AICommandState {
  isProcessing: boolean;
  result?: AICommandResult;
  hasUnresolvedQuery: boolean;
  error?: string;
}

/**
 * Get the appropriate API endpoint based on environment
 * @returns API endpoint URL
 */
function getCommandApiEndpoint(): string {
  // Development environment - reuse the existing filters endpoint
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

export class AICommandService {

  async generateCommands(request: AICommandRequest): Promise<AICommandResult> {
    const endpoint = getCommandApiEndpoint();

    try {
      // Adapt the request to work with the existing filters API
      // We'll send command data in a format the backend can understand
      const adaptedRequest = {
        prompt: `Generate commands or actions for: ${request.prompt}`,
        availableFilters: request.availableCommands,
        availableValues: request.availableActions,
        // Add a flag to indicate this is a command request
        requestType: 'commands'
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(adaptedRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unknown API error');
      }

      return this.transformBackendResponse(data.data, request);
    } catch (error) {
      throw new Error(`Failed to fetch AI commands: ${(error as Error).message}`);
    }
  }

  private transformBackendResponse(backendData: any, originalRequest: AICommandRequest): AICommandResult {
    try {
      // Transform backend response to command format
      // The backend might return filters, so we need to adapt them to commands
      let suggestedCommands: Array<{
        id: string;
        name: string;
        icon: string;
        action?: string;
      }> = [];

      if (backendData.suggestedFilters && Array.isArray(backendData.suggestedFilters)) {
        // Try to map filter responses to commands
        suggestedCommands = backendData.suggestedFilters.map((filter: any, index: number) => ({
          id: `ai-command-${Date.now()}-${index}`,
          name: filter.value?.[0] || filter.type || `Generated Command ${index + 1}`,
          icon: this.getIconForCommand(filter.value?.[0] || filter.type),
          action: filter.value?.[0] || filter.type
        }));
      } else {
        // Fallback: create generic commands based on the prompt
        const prompt = originalRequest.prompt.toLowerCase();
        suggestedCommands = this.generateFallbackCommands(prompt);
      }

      return {
        suggestedCommands,
        explanation: backendData.explanation || 'AI generated commands',
        confidence: Math.min(100, Math.max(0, backendData.confidence || 70)),
        unmatchedCriteria: backendData.unmatchedCriteria || [],
        rawResponse: JSON.stringify(backendData)
      };
    } catch (error) {
      throw new Error(`Failed to transform AI response: ${(error as Error).message}`);
    }
  }

  private getIconForCommand(commandName: string): string {
    const name = commandName?.toLowerCase() || '';

    if (name.includes('create') || name.includes('new') || name.includes('add')) return 'ph:plus';
    if (name.includes('search') || name.includes('find')) return 'ph:magnifying-glass';
    if (name.includes('edit') || name.includes('modify') || name.includes('change')) return 'ph:pencil';
    if (name.includes('delete') || name.includes('remove')) return 'ph:trash';
    if (name.includes('export') || name.includes('download')) return 'ph:download';
    if (name.includes('import') || name.includes('upload')) return 'ph:upload';
    if (name.includes('schedule') || name.includes('calendar') || name.includes('meeting')) return 'ph:calendar';
    if (name.includes('backup') || name.includes('save')) return 'ph:floppy-disk';
    if (name.includes('settings') || name.includes('config')) return 'ph:gear';
    if (name.includes('help') || name.includes('support')) return 'ph:question';

    return 'ph:sparkle';
  }

  private generateFallbackCommands(prompt: string): Array<{
    id: string;
    name: string;
    icon: string;
    action?: string;
  }> {
    // Only provide a generic "create task" fallback
    return [{
      id: `fallback-${Date.now()}-task`,
      name: `Create "${prompt}" task`,
      icon: 'ph:plus-square',
      action: 'create-task'
    }];
  }
}

// Utility function to create the service instance
export const createAICommandService = (): AICommandService => {
  return new AICommandService();
};