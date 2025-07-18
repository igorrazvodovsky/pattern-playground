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
  value: any;
  icon?: string;
  metadata?: Record<string, any>;
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