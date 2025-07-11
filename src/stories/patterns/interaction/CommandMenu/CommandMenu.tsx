import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../../components/command-menu/command";
import {
  AICommandEmpty,
  useAICommand,
  type AICommandResult,
  type AICommandItem
} from "../../../../components/command-menu";
import {
  searchHierarchy,
  searchWithinParent,
  type SearchableParent,
  type SearchableItem
} from '../../../../utils/hierarchical-search';
import {
  createAISuggestionService,
  createCommandSuggestionRequest
} from '../../../../services/ai-suggestion-service';
import { convertToAICommandResult } from '../../../../components/command-menu/adapters/ai-command-adapter';
import { commands, recentItems } from '../../../shared-data';
import 'iconify-icon';
import '../../../../jsx-types';


// Constants
const MIN_AI_TRIGGER_LENGTH = 3;

// Define the command structure using the generic search interfaces
interface CommandOption extends SearchableParent {
  shortcut?: string[];
  children?: CommandChildOption[];
}

interface CommandChildOption extends SearchableItem {
  // Command-specific properties can be added here
}

interface RecentItem extends SearchableItem {
  // Recent item specific properties can be added here
}

// Use centralized command data
const commandData: CommandOption[] = commands as CommandOption[];

// Use centralized recent items data
const recentItemsData: RecentItem[] = recentItems as RecentItem[];

function CommandMenu({ onClose }: { onClose?: () => void } = {}) {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Create AI service instance
  const aiService = useMemo(() => createAISuggestionService(), []);

  // Create available actions mapping for AI
  const availableActions = useMemo(() =>
    Object.fromEntries(
      commandData.map(cmd => [
        cmd.name,
        cmd.children?.map(child => child.name) || []
      ])
    ),
    []
  );

  // Create AI request handler
  const handleAIRequest = useCallback(async (prompt: string): Promise<AICommandResult> => {
    const request = createCommandSuggestionRequest(prompt, availableActions);
    const result = await aiService.generateSuggestions(request);
    return convertToAICommandResult(result);
  }, [aiService, availableActions]);

  // Use AI command hook
  const {
    aiState,
    handleAIRequest: handleAICommandRequest,
    handleApplyAIResult,
    handleEditPrompt,
    clearResultsIfInputChanged
  } = useAICommand({
    onAIRequest: handleAIRequest
  });

  // Get the currently selected command's data
  const selectedCommandData = useMemo(() =>
    commandData.find(cmd => cmd.id === selectedCommand),
    [selectedCommand]
  );

  // Get filtered results based on search input and current view
  const filteredResults = useMemo(() => {
    if (selectedCommand && selectedCommandData) {
      // When in a specific command view, search within its children
      const children = searchWithinParent(searchInput, selectedCommandData);
      return {
        parents: [],
        children: children.map(child => ({ parent: selectedCommandData, child }))
      };
    } else {
      // Global search mode using the generic search utility
      return searchHierarchy(searchInput, commandData);
    }
  }, [searchInput, selectedCommand, selectedCommandData]);

  // Filter recent items based on search input
  const filteredRecentItems = useMemo(() => {
    if (!searchInput.trim()) return recentItemsData;

    const processedQuery = searchInput.toLowerCase();
    return recentItemsData.filter(item => {
      const searchText = item.searchableText || item.name;
      return searchText.toLowerCase().includes(processedQuery);
    });
  }, [searchInput]);

  // Check if there are any results for current search
  const hasResults = useMemo(() => {
    if (selectedCommand) {
      return filteredResults.children.length > 0;
    }
    return filteredResults.parents.length > 0 ||
           filteredResults.children.length > 0 ||
           filteredRecentItems.length > 0;
  }, [selectedCommand, filteredResults, filteredRecentItems]);

  const handleCommandSelect = (commandId: string) => {
    const command = commandData.find(cmd => cmd.id === commandId);
    if (command?.children) {
      setSelectedCommand(commandId);
      setSearchInput("");
      inputRef.current?.focus();
    } else {
      // Reset state after execution
      setSelectedCommand(null);
      setSearchInput("");
      onClose?.();
    }
  };

  const handleChildSelect = () => {
    setSelectedCommand(null);
    setSearchInput("");
    onClose?.();
  };

  // Handle applying AI-generated commands
  const handleApplyAICommands = useCallback((result: AICommandResult) => {
    // Execute the suggested command(s)
    result.suggestedItems.forEach((item: AICommandItem) => {
      console.log(`Executing AI command: ${item.label}`, item.metadata);
    });

    handleApplyAIResult(result);

    // Reset state after execution
    setSelectedCommand(null);
    setSearchInput("");
    onClose?.();
  }, [handleApplyAIResult, onClose]);

  const handleEscape = () => {
    if (selectedCommand) {
      setSelectedCommand(null);
      setSearchInput("");
      inputRef.current?.focus();
      return true;
    }
    return false;
  };

  // Trigger AI request when input changes and there are no results
  useEffect(() => {
    // Only trigger AI when:
    // 1. There's input text
    // 2. No specific command is selected (global search mode)
    // 3. Input is long enough to be meaningful
    // 4. There are no regular search results
    if (searchInput &&
        !selectedCommand &&
        searchInput.length >= MIN_AI_TRIGGER_LENGTH &&
        !hasResults) {
      handleAICommandRequest(searchInput);
    }
  }, [searchInput, selectedCommand, hasResults, handleAICommandRequest]);

  return (
    <>
      <Command label="Command menu" shouldFilter={false} onEscape={handleEscape}>
        <CommandInput
          placeholder={selectedCommand ? `${selectedCommandData?.name}` : "Type a command or search..."}
          value={searchInput}
          onValueChange={setSearchInput}
          ref={inputRef}
        />
        <CommandList>
          {/* AI-powered empty state */}
          {!hasResults && (
            <AICommandEmpty
              searchInput={searchInput}
              aiState={aiState}
              onAIRequest={handleAICommandRequest}
              onApplyAIResult={handleApplyAICommands}
              onEditPrompt={handleEditPrompt}
              onInputChange={clearResultsIfInputChanged}
              onClose={() => {
                setSelectedCommand(null);
                setSearchInput("");
                onClose?.();
              }}
              emptyStateMessage="Start typing to search commands..."
              noResultsMessage="No commands found."
              aiProcessingMessage="Finding commands…"
              aiErrorPrefix="Command AI temporarily unavailable."
            />
          )}

          {/* Regular results */}
          {hasResults && (
            <>
              {/* Recent items - only show when not in a specific command view and there are matching results */}
              {!selectedCommand && filteredRecentItems.length > 0 && (
                <CommandGroup heading="Recent">
                  {filteredRecentItems.map((item) => (
                    <CommandItem key={item.id}>
                      <iconify-icon icon={item.icon as string} slot="prefix"></iconify-icon>
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {selectedCommand ? (
                // Selected command mode: show children and back option
                <CommandGroup>
                  {filteredResults.children.map(({ child }) => (
                    <CommandItem
                      key={child.id}
                      onSelect={() => handleChildSelect()}
                    >
                      <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                      {child.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                // Global search mode: show both top-level commands and child matches
                <>
                  {/* Top-level commands */}
                  {filteredResults.parents.length > 0 && (
                    <CommandGroup heading="Commands">
                      {filteredResults.parents.map((command) => (
                        <CommandItem
                          key={command.id}
                          onSelect={() => handleCommandSelect(command.id)}
                        >
                          <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                          {command.name}
                          {command.shortcut && (
                            <span slot="suffix" className="cmdk-shortcuts">
                              {command.shortcut.map((key, index) => (
                                <kbd key={index}>{key}</kbd>
                              ))}
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {/* Child command matches */}
                  {filteredResults.children.length > 0 && (
                    <CommandGroup heading="Actions">
                      {filteredResults.children.map(({ parent, child }) => (
                        <CommandItem
                          key={`${parent.id}-${child.id}`}
                          onSelect={() => handleChildSelect()}
                        >
                          <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                          {parent.name} {child.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </>
  )
}

export default CommandMenu
