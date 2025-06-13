import React from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from './command';
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import { AICommandEmptyProps } from './ai-command-types';

export const AICommandEmpty: React.FC<AICommandEmptyProps> = ({
  searchInput,
  aiState,
  onAIRequest,
  onApplyAIResult,
  onEditPrompt,
  emptyStateMessage = "Start typing to search...",
  noResultsMessage = "No immediate results found.",
  aiProcessingMessage = "Thinking…",
  aiErrorPrefix = "AI service temporarily unavailable."
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
    const hasNaturalLanguage = /\b(show|find|get|filter|where|with|that|are|is|have|has|need|want)\b/i.test(trimmedInput);
    const isLongQuery = trimmedInput.length > 8;

    return isLongQuery || hasMultipleWords || hasNaturalLanguage;
  }, [searchInput]);

  // Handle AI processing state
  if (aiState.isProcessing) {
    return (
      <CommandEmpty>
        <span className="shimmer">{aiProcessingMessage}</span>
      </CommandEmpty>
    );
  }

  // Handle AI result state
  if (aiState.result && aiState.hasUnresolvedQuery) {
    const { result } = aiState;

    return (
      <CommandGroup>
        {result.suggestedItems.length > 0 && (
          <CommandItem
            onSelect={() => onApplyAIResult(result)}
          >
            {result.suggestedItems.length === 1 ? (
              // Display single match as regular result
              [
                <Slot key="prefix" slot="prefix">
                  <Icon icon="ph:sparkle" />
                </Slot>,
                <span key="content">
                  {result.suggestedItems[0].label}
                </span>,
                result.confidence < 85 && (
                  <small key="suffix" slot="suffix">
                    {result.confidence}% match
                  </small>
                )
              ]
            ) : (
              // Display multiple matches as AI suggestion
              [
                <Slot key="prefix" slot="prefix">
                  <Icon icon="ph:sparkle" />
                </Slot>,
                <span key="content">
                  Apply {result.suggestedItems.length} suggestions
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

        {/* Only show "no results" if there are truly no suggested items */}
        {result.suggestedItems.length === 0 && result.unmatchedCriteria && result.unmatchedCriteria.length > 0 && (
          <CommandItem onSelect={onEditPrompt}>
             <Slot slot="prefix">
              <Icon icon="ph:sparkle" />
            </Slot>
            Create new item
          </CommandItem>
        )}

        {/* Show partial match indicator when there are both matches and unmatched criteria */}
        {result.suggestedItems.length > 0 && result.unmatchedCriteria && result.unmatchedCriteria.length > 0 && (
          <CommandItem onSelect={onEditPrompt}>
            <Slot slot="prefix">
              <Icon icon="ph:warning" />
            </Slot>
            <span>
              Partial match - couldn't understand: {result.unmatchedCriteria.join(', ')}
            </span>
          </CommandItem>
        )}
      </CommandGroup>
    );
  }

  if (aiState.error) {
    return (
      <CommandEmpty>
        {aiErrorPrefix} {aiState.error}
      </CommandEmpty>
    );
  }

  // Default empty state with optional AI suggestion
  return (
    <CommandEmpty>
      <div>
        {searchInput.trim() ? (
          <div>
            <p>{noResultsMessage}</p>
            {shouldShowAIOption && (
              <div>
                <button onClick={() => onAIRequest(searchInput)}>
                  <Icon slot="prefix" icon="ph:sparkle" />
                  <span>Ask AI for suggestions</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          emptyStateMessage
        )}
      </div>
    </CommandEmpty>
  );
};