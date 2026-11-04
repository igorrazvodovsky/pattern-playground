import React from 'react';
import { ComboboxEmpty, ComboboxGroup, ComboboxItem } from '../combobox';
import type { AIFallbackHandlerProps } from './ai-command-types';
import { PpToast } from '../toast/toast';
import { modalService } from '../../services/modal-service';
import { createTask } from '../task/task-utils';
import { ItemView } from '../item-view/ItemView';

export const AIFallbackHandler: React.FC<AIFallbackHandlerProps> = ({
  searchInput,
  aiState,
  onApplyAIResult,
  onEditPrompt,
  onInputChange,
  onClose,
  emptyStateMessage = 'Start typing to search...',
  noResultsMessage = 'No immediate results found.',
  aiProcessingMessage = 'Thinking…',
  aiErrorPrefix = 'AI service temporarily unavailable.',
}) => {
  // Handle create new item with clickable toast
  const handleCreateNewItem = React.useCallback(() => {
    const task = createTask(searchInput.trim());
    PpToast.show(`Task created: ${task.title} — open`, () => {
      modalService.openDrawer(
        <ItemView item={task} contentType="task" scope="mid" mode="preview" />,
        { position: 'right', title: `Task: ${task.title}` },
      );
    });
    onEditPrompt();
    onClose?.();
  }, [searchInput, onEditPrompt, onClose]);

  // Clear results when user starts typing again (input changes)
  React.useEffect(() => {
    if (onInputChange) {
      onInputChange(searchInput);
    }
  }, [searchInput, onInputChange]);

  // Handle AI processing state
  if (aiState.isProcessing) {
    return (
      <>
        <ComboboxGroup>
          <ComboboxItem disabled>
            <iconify-icon icon="ik:sparkles" slot="prefix"></iconify-icon>
            <span className="shimmer">{aiProcessingMessage}</span>
          </ComboboxItem>
        </ComboboxGroup>
      </>
    );
  }

  // Handle AI result state
  if (aiState.result && aiState.hasUnresolvedQuery) {
    const { result } = aiState;

    return (
      <>
        <ComboboxGroup>
          {result.suggestedItems.length > 0 && (
            <ComboboxItem onSelect={() => onApplyAIResult(result)}>
              {result.suggestedItems.length === 1
                ? // Display single match as regular result
                  [
                    <iconify-icon key="prefix" icon="ik:sparkles" slot="prefix"></iconify-icon>,
                    <span key="content">{result.suggestedItems[0].label}</span>,
                    result.confidence < 85 && (
                      <small key="suffix" slot="suffix">
                        {result.confidence}% match
                      </small>
                    ),
                  ]
                : // Display multiple matches as AI suggestion
                  [
                    <iconify-icon key="prefix" icon="ik:sparkles" slot="prefix"></iconify-icon>,
                    <span key="content">Apply {result.suggestedItems.length} suggestions</span>,
                    result.confidence < 85 && (
                      <span key="suffix" className="badge" slot="suffix">
                        {result.confidence}% match
                      </span>
                    ),
                  ]}
            </ComboboxItem>
          )}

          {/* Only show "no results" if there are truly no suggested items */}
          {result.suggestedItems.length === 0 &&
            result.unmatchedCriteria &&
            result.unmatchedCriteria.length > 0 && (
              <ComboboxItem onSelect={handleCreateNewItem}>
                <iconify-icon icon="ik:sparkles" slot="prefix"></iconify-icon>
                Create new task
              </ComboboxItem>
            )}

          {/* Show partial match indicator when there are both matches and unmatched criteria */}
          {result.suggestedItems.length > 0 &&
            result.unmatchedCriteria &&
            result.unmatchedCriteria.length > 0 && (
              <ComboboxItem onSelect={handleCreateNewItem}>
                <iconify-icon icon="ik:warning" slot="prefix"></iconify-icon>
                <span>
                  Partial match - couldn't understand: {result.unmatchedCriteria.join(', ')}
                </span>
              </ComboboxItem>
            )}
        </ComboboxGroup>
      </>
    );
  }

  if (aiState.error) {
    return (
      <>
        <ComboboxEmpty>
          {aiErrorPrefix} {aiState.error}
        </ComboboxEmpty>
      </>
    );
  }

  // Default empty state
  return (
    <>
      <ComboboxEmpty>{searchInput.trim() ? noResultsMessage : emptyStateMessage}</ComboboxEmpty>
    </>
  );
};
