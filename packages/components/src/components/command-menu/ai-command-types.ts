export interface AIState {
  isProcessing: boolean;
  hasUnresolvedQuery: boolean;
  error?: string;
  result?: AICommandResult;
  originalQuery?: string;
}

export interface AICommandResult {
  suggestedItems: AICommandItem[];
  confidence: number;
  unmatchedCriteria?: string[];
}

export interface AICommandItem {
  id: string;
  label: string;
  value: unknown;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface AIFallbackHandlerProps {
  searchInput: string;
  aiState: AIState;
  onAIRequest: (prompt: string) => void;
  onApplyAIResult: (result: AICommandResult) => void;
  onEditPrompt: () => void;
  onInputChange?: (input: string) => void;
  onClose?: () => void;
  emptyStateMessage?: string;
  noResultsMessage?: string;
  aiProcessingMessage?: string;
  aiErrorPrefix?: string;
}