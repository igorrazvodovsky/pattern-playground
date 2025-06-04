import React from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from './command';
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import { AIState, AIFilterResult } from '../../services/ai-filter-service';

interface AICommandEmptyProps {
  searchInput: string;
  aiState: AIState;
  onAIRequest: (prompt: string) => void;
  onApplyAIFilters: (result: AIFilterResult) => void;
  onEditPrompt: () => void;
}

export const AICommandEmpty: React.FC<AICommandEmptyProps> = ({
  searchInput,
  aiState,
  onAIRequest,
  onApplyAIFilters,
  onEditPrompt
}) => {
  // Determine if we should show AI option based on input characteristics
  const shouldShowAIOption = React.useMemo(() => {
    const trimmedInput = searchInput.trim();
    if (!trimmedInput) return false;

    // Show AI option for:
    // 1. Longer queries (>10 chars)
    // 2. Queries with multiple words
    // 3. Queries with natural language indicators
    const hasMultipleWords = trimmedInput.split(/\s+/).length > 1;
    const hasNaturalLanguage = /\b(show|find|get|filter|where|with|that|are|is|have|has|need|want|assigned|due|urgent|high|priority|status|done|todo|backlog|progress|review)\b/i.test(trimmedInput);
    const isLongQuery = trimmedInput.length > 8;

    return isLongQuery || hasMultipleWords || hasNaturalLanguage;
  }, [searchInput]);

  // Handle AI processing state
  if (aiState.isProcessing) {
    return (
      <CommandEmpty>
        <span className="shimmer">Thinking…</span>
      </CommandEmpty>
    );
  }

  // Handle AI result state
  if (aiState.result && aiState.hasUnresolvedQuery) {
    const { result } = aiState;

    return (
      <CommandGroup>
        {result.suggestedFilters.length > 0 && (
          <CommandItem
            onSelect={() => onApplyAIFilters(result)}
          >
            {result.suggestedFilters.length === 1 ? (
              // Display single match as regular result
              [
                <Slot key="prefix" slot="prefix">
                  <Icon icon="ph:sparkle" />
                </Slot>,
                <span key="content">
                  {result.suggestedFilters[0].type} {result.suggestedFilters[0].operator} {result.suggestedFilters[0].value.join(', ')}
                </span>,
                result.confidence < 85 && (
                  <span key="suffix" slot="suffix">
                    {result.confidence}% match
                  </span>
                )
              ]
            ) : (
              // Display multiple matches as AI suggestion
              [
                <Slot key="prefix" slot="prefix">
                  <Icon icon="ph:sparkle" />
                </Slot>,
                <span key="content">
                  Apply {result.suggestedFilters.length} filters
                </span>,
                result.confidence < 85 && (
                  <span key="suffix" className='badge' slot="suffix">
                    {result.confidence}% match
                  </span>
                )
              ]
            )}
          </CommandItem>
        )}

        {/* TODO: replace with a toast of something */}
        {/* {result.unmatchedCriteria && result.unmatchedCriteria.length > 0 && (
          <CommandItem onSelect={onEditPrompt}>
            Refine request. Some criteria couldn't be matched.
          </CommandItem>
        )} */}
      </CommandGroup>
    );
  }

  if (aiState.error) {
    return (
      <CommandEmpty>
        AI service temporarily unavailable. {aiState.error}
      </CommandEmpty>
    );
  }

  // Default empty state with optional AI suggestion
  return (
    <CommandEmpty>
      <div>
        {searchInput.trim() ? (
          <div>
            <p>No immediate results found</p>
            {shouldShowAIOption && (
              <div>
                <button onClick={() => onAIRequest(searchInput)}>
                  <Icon icon="ph:sparkle" />
                  <span>Ask AI to create filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          "Start typing to search filters..."
        )}
      </div>
    </CommandEmpty>
  );
};