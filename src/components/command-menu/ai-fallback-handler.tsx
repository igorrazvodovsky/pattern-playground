import React from 'react';
import { CommandEmpty, CommandGroup, CommandItem } from './command';
import { Icon } from '@iconify/react';
import { Slot } from "@radix-ui/react-slot";
import { AIFallbackHandlerProps } from './ai-command-types';
import { PpToast } from '../toast/toast';
import { modalService } from '../../services/modal-service';
import { createTask } from '../task/task-utils';
import { ItemView } from '../item-view/ItemView';
import { ContentAdapterProvider } from '../item-view/ContentAdapterRegistry';
import { taskAdapter } from '../item-view/adapters/TaskAdapter';
import { taskToItemObject } from '../../stories/data/task-types';

export const AIFallbackHandler: React.FC<AIFallbackHandlerProps> = ({
  searchInput,
  aiState,
  onApplyAIResult,
  onEditPrompt,
  onInputChange,
  onClose,
  emptyStateMessage = "Start typing to search...",
  noResultsMessage = "No immediate results found.",
  aiProcessingMessage = "Thinking…",
  aiErrorPrefix = "AI service temporarily unavailable."
}) => {


  // Handle create new item with clickable toast
  const handleCreateNewItem = React.useCallback(() => {
    const task = createTask(searchInput.trim());
    PpToast.show(`Task created: ${task.title}`, () => {
      modalService.openDrawer(
        <ContentAdapterProvider adapters={[taskAdapter]}>
          <ItemView
            item={taskToItemObject(task)}
            contentType="task"
            scope="mid"
            mode="preview"
          />
        </ContentAdapterProvider>,
        { position: 'right', title: `Task: ${task.title}` }
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
        <CommandGroup>
          <CommandItem disabled>
            <Slot slot="prefix">
              <Icon icon="ph:sparkle" />
            </Slot>
            <span className="shimmer">{aiProcessingMessage}</span>
          </CommandItem>
        </CommandGroup>
      </>
    );
  }

  // Handle AI result state
  if (aiState.result && aiState.hasUnresolvedQuery) {
    const { result } = aiState;

    return (
      <>
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
            <CommandItem onSelect={handleCreateNewItem}>
               <Slot slot="prefix">
                <Icon icon="ph:sparkle" />
              </Slot>
              Create new task
            </CommandItem>
          )}

          {/* Show partial match indicator when there are both matches and unmatched criteria */}
          {result.suggestedItems.length > 0 && result.unmatchedCriteria && result.unmatchedCriteria.length > 0 && (
            <CommandItem onSelect={handleCreateNewItem}>
              <Slot slot="prefix">
                <Icon icon="ph:warning" />
              </Slot>
              <span>
                Partial match - couldn't understand: {result.unmatchedCriteria.join(', ')}
              </span>
            </CommandItem>
          )}
        </CommandGroup>
      </>
    );
  }

  if (aiState.error) {
    return (
      <>
        <CommandEmpty>
          {aiErrorPrefix} {aiState.error}
        </CommandEmpty>
      </>
    );
  }

  // Default empty state
  return (
    <>
      <CommandEmpty>
        {searchInput.trim() ? noResultsMessage : emptyStateMessage}
      </CommandEmpty>
    </>
  );
};