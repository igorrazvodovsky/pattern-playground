import { useMemo, useCallback, useEffect } from 'react'

import {
  Combobox,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../components/combobox";
import {
  AIFallbackHandler,
  useAICommand,
  type AICommandResult
} from "../components/command-menu";

import { useHierarchicalNavigation, type SearchableItem } from '../hooks/useHierarchicalNavigation';
import type { CommandParent, CommandChild } from '../types/hierarchical-navigation';
import { createSortedSearchFunction, sortByRelevance } from '../utility/hierarchical-search';

import {
  createAISuggestionService,
  createCommandSuggestionRequest
} from '../services/ai-suggestion-service';
import { convertToAICommandResult } from '../components/command-menu/adapters/ai-command-adapter';

import { commands, recentItems } from '@shared/data';

import 'iconify-icon';
import '../jsx-types';
const MIN_AI_TRIGGER_LENGTH = 3;

interface CommandOption extends CommandParent {
  children?: CommandChildOption[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CommandChildOption extends CommandChild {
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface RecentItem extends SearchableItem {
}

const commandData: CommandOption[] = commands as CommandOption[];

const recentItemsData: RecentItem[] = recentItems as RecentItem[];

function CommandMenu({ onClose }: { onClose?: () => void } = {}) {
  const { state, actions, results, inputRef, placeholder } = useHierarchicalNavigation({
    data: commandData,
    searchFunction: createSortedSearchFunction(
      (commands, query) => sortByRelevance(commands, query),
      (actions, query) => sortByRelevance(actions, query)
    ),
    onSelectChild: () => {
      onClose?.();
    },
    onClose,
    placeholder: "Type a command or search...",
    contextPlaceholder: (command) => command.name
  });

  const aiService = useMemo(() => createAISuggestionService(), []);
  const availableActions = useMemo(() =>
    Object.fromEntries(
      commandData.map(cmd => [cmd.name, cmd.children?.map(child => child.name) || []])
    ), []
  );

  const handleAIRequest = useCallback(async (prompt: string): Promise<AICommandResult> => {
    const request = createCommandSuggestionRequest(prompt, availableActions);
    const result = await aiService.generateSuggestions(request);
    return convertToAICommandResult(result);
  }, [aiService, availableActions]);

  const { aiState, handleAIRequest: handleAICommandRequest, handleApplyAIResult, handleEditPrompt, clearResultsIfInputChanged } = useAICommand({
    onAIRequest: handleAIRequest
  });

  const filteredRecentItems = useMemo(() => {
    if (!state.searchInput.trim()) return recentItemsData;
    const processedQuery = state.searchInput.toLowerCase();
    return recentItemsData.filter(item => {
      const searchText = item.searchableText || item.name;
      return searchText.toLowerCase().includes(processedQuery);
    });
  }, [state.searchInput]);

  const hasResults = useMemo(() => {
    if (state.mode === 'contextual') {
      return (results.contextualItems?.length || 0) > 0;
    }
    return results.parents.length > 0 || results.children.length > 0 || filteredRecentItems.length > 0;
  }, [state.mode, results, filteredRecentItems]);

  const handleApplyAICommands = useCallback((result: AICommandResult) => {
    handleApplyAIResult(result);
    actions.resetState();
    onClose?.();
  }, [handleApplyAIResult, actions, onClose]);

  useEffect(() => {
    if (state.searchInput && state.mode === 'global' && state.searchInput.length >= MIN_AI_TRIGGER_LENGTH && !hasResults) {
      handleAICommandRequest(state.searchInput);
    }
  }, [state.searchInput, state.mode, hasResults, handleAICommandRequest]);

  return (
    <>
      <Combobox label="Command menu" shouldFilter={false} onEscape={actions.handleEscape}>
        <ComboboxInput
          placeholder={placeholder}
          value={state.searchInput}
          onValueChange={actions.updateSearch}
          ref={inputRef}
        />
        <ComboboxList>
          {!hasResults && (
            <AIFallbackHandler
              searchInput={state.searchInput}
              aiState={aiState}
              onAIRequest={handleAICommandRequest}
              onApplyAIResult={handleApplyAICommands}
              onEditPrompt={handleEditPrompt}
              onInputChange={clearResultsIfInputChanged}
              onClose={() => {
                actions.resetState();
                onClose?.();
              }}
              emptyStateMessage="Start typing to search commands..."
              noResultsMessage="No commands found."
              aiProcessingMessage="Finding commands…"
              aiErrorPrefix="Command AI temporarily unavailable."
            />
          )}

          {hasResults && (
            <>
              {state.mode === 'global' && filteredRecentItems.length > 0 && (
                <ComboboxGroup heading="Recent">
                  {filteredRecentItems.map((item) => (
                    <ComboboxItem key={item.id}>
                      <iconify-icon icon={item.icon as string} slot="prefix"></iconify-icon>
                      {item.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              )}

              {state.mode === 'contextual' ? (
                <ComboboxGroup>
                  {results.contextualItems?.map((action) => (
                    <ComboboxItem key={action.id} onSelect={() => actions.selectChild(action)}>
                      <iconify-icon icon={action.icon as string} slot="prefix"></iconify-icon>
                      {action.name}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              ) : (
                <>
                  {results.parents.length > 0 && (
                    <ComboboxGroup heading="Commands">
                      {results.parents.map((command) => (
                        <ComboboxItem key={command.id} onSelect={() => actions.selectContext(command)}>
                          <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                          {command.name}
                          {command.shortcut && (
                            <span slot="suffix" className="cmdk-shortcuts">
                              {command.shortcut.map((key, index) => (
                                <kbd key={index}>{key}</kbd>
                              ))}
                            </span>
                          )}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  )}

                  {results.children.length > 0 && (
                    <ComboboxGroup heading="Actions">
                      {results.children.map(({ parent, child }) => (
                        <ComboboxItem key={`${parent.id}-${child.id}`} onSelect={() => actions.selectChild(child, parent)}>
                          <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                          {parent.name} {child.name}
                        </ComboboxItem>
                      ))}
                    </ComboboxGroup>
                  )}
                </>
              )}
            </>
          )}
        </ComboboxList>
      </Combobox>
    </>
  )
}

export default CommandMenu
