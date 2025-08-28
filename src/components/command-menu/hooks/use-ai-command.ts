import { useCallback, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { AIState, AICommandResult } from '../ai-command-types';

export interface UseAICommandOptions {
  onAIRequest: (prompt: string) => Promise<AICommandResult>;
  debounceMs?: number;
  minInputLength?: number;
}

export function useAICommand({
  onAIRequest,
  debounceMs = 1500,
  minInputLength = 3
}: UseAICommandOptions) {
  const [aiState, setAIState] = useState<AIState>({
    isProcessing: false,
    hasUnresolvedQuery: false
  });

  // Create a stable AI request function
  const makeAIRequest = useCallback(async (prompt: string) => {
    if (prompt.length < minInputLength) return;

    setAIState(prev => ({
      ...prev,
      isProcessing: true,
      error: undefined
    }));

    try {
      const result = await onAIRequest(prompt);

      setAIState(prev => ({
        ...prev,
        isProcessing: false,
        result,
        hasUnresolvedQuery: true,
        originalQuery: prompt
      }));
    } catch (error) {
      setAIState(prev => ({
        ...prev,
        isProcessing: false,
        error: (error as Error).message
      }));
    }
  }, [onAIRequest, minInputLength]);

  // Debounced AI request function
  const debouncedAIRequest = useMemo(
    () => debounce(makeAIRequest, debounceMs),
    [makeAIRequest, debounceMs]
  );

  // Handle AI request
  const handleAIRequest = useCallback((prompt: string) => {
    debouncedAIRequest(prompt);
  }, [debouncedAIRequest]);

  // Handle applying AI result
  const handleApplyAIResult = useCallback((_result: AICommandResult) => {
    setAIState(prev => ({
      ...prev,
      hasUnresolvedQuery: false,
      result: undefined
    }));
  }, []);

  // Handle edit prompt
  const handleEditPrompt = useCallback(() => {
    setAIState(prev => ({
      ...prev,
      hasUnresolvedQuery: false,
      result: undefined,
      originalQuery: undefined
    }));
  }, []);

  // Clear results when input changes (user starts typing again)
  const clearResultsIfInputChanged = useCallback((currentInput: string) => {
    setAIState(prev => {
      if (prev.hasUnresolvedQuery && prev.originalQuery && prev.originalQuery !== currentInput.trim()) {
        return {
          ...prev,
          hasUnresolvedQuery: false,
          result: undefined,
          originalQuery: undefined
        };
      }
      return prev;
    });
  }, []);

  return {
    aiState,
    handleAIRequest,
    handleApplyAIResult,
    handleEditPrompt,
    clearResultsIfInputChanged
  };
}