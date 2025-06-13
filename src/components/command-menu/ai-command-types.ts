export interface AIState {
  isProcessing: boolean;
  hasUnresolvedQuery: boolean;
  error?: string;
  result?: AICommandResult;
}

export interface AICommandResult {
  suggestedItems: AICommandItem[];
  confidence: number;
  unmatchedCriteria?: string[];
}

export interface AICommandItem {
  id: string;
  label: string;
  value: any;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface AICommandEmptyProps {
  searchInput: string;
  aiState: AIState;
  onAIRequest: (prompt: string) => void;
  onApplyAIResult: (result: AICommandResult) => void;
  onEditPrompt: () => void;
  emptyStateMessage?: string;
  noResultsMessage?: string;
  aiProcessingMessage?: string;
  aiErrorPrefix?: string;
}