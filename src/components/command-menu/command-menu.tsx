import { useEffect } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import { AICommandEmpty } from './ai-command-empty';
import { useAICommand } from './hooks/use-ai-command';
import { useCommandNavigation } from './hooks/use-command-navigation';
import type {
  CommandMenuProps,
  AICommandResult,
} from './command-menu-types';
import 'iconify-icon';

export function CommandMenu({
  data,
  recentItems = [],
  onSelect,
  onEscape,
  aiConfig,
  showRecents = true,
  enableNavigation = true,
  enableAI = false,
  placeholder,
  emptyMessage = "No results found.",
  className,
  aiMessages = {},
}: CommandMenuProps) {

  // AI hook for intelligent suggestions (only if enabled)
  const aiState = useAICommand({
    onAIRequest: aiConfig?.onAIRequest || (async () => ({ suggestedItems: [], confidence: 0 })),
    debounceMs: aiConfig?.debounceMs,
    minInputLength: aiConfig?.minInputLength,
  });

  // Navigation hook for hierarchical functionality
  const navigation = useCommandNavigation({
    data,
    recentItems,
    onSelect: (item) => {
      onSelect?.(item);
      // Note: AI result clearing handled in useEffect below
    },
    onEscape,
  });

  // Trigger AI request when input changes (if AI is enabled)
  useEffect(() => {
    if (enableAI &&
        aiConfig?.onAIRequest &&
        navigation.searchInput &&
        !navigation.isInCommandView &&
        navigation.searchInput.length >= (aiConfig.minInputLength || 3)) {
      aiState.handleAIRequest?.(navigation.searchInput);
    }
  }, [
    enableAI,
    aiConfig?.onAIRequest,
    aiConfig?.minInputLength,
    navigation.searchInput,
    navigation.isInCommandView,
    aiState.handleAIRequest
  ]);

  // Handle AI result application
  const handleApplyAIResult = (result: AICommandResult) => {
    aiState.handleApplyAIResult?.(result);
    navigation.resetState();
  };

  // Determine what to show based on current state and enabled features
  const shouldShowRecents = showRecents &&
    !navigation.isInCommandView &&
    (!navigation.searchInput.trim() || navigation.filteredRecentItems.length > 0);

  const shouldShowAI = enableAI &&
    !navigation.isInCommandView &&
    navigation.searchInput.trim();

  const hasResults = navigation.filteredResults.parents.length > 0 ||
    navigation.filteredResults.children.length > 0 ||
    (shouldShowRecents && (navigation.filteredRecentItems.length > 0 || recentItems.length > 0));

  // Determine placeholder text
  const effectivePlaceholder = placeholder ||
    (enableAI ? "Ask AI or search commands..." : navigation.placeholder);

  return (
    <Command
      label="Command Menu"
      shouldFilter={false}
      onEscape={navigation.handleEscape}
      className={className}
    >
      <CommandInput
        placeholder={effectivePlaceholder}
        value={navigation.searchInput}
        onValueChange={navigation.setSearchInput}
        ref={navigation.inputRef}
      />
      <CommandList>
        {/* AI Empty State */}
        {shouldShowAI && (
          <AICommandEmpty
            searchInput={navigation.searchInput}
            aiState={aiState.aiState}
            onAIRequest={aiState.handleAIRequest}
            onApplyAIResult={handleApplyAIResult}
            onEditPrompt={aiState.handleEditPrompt}
            onInputChange={navigation.setSearchInput}
            onClose={navigation.resetState}
            emptyStateMessage={aiMessages.emptyStateMessage}
            noResultsMessage={aiMessages.noResultsMessage}
            aiProcessingMessage={aiMessages.aiProcessingMessage}
            aiErrorPrefix={aiMessages.aiErrorPrefix}
          />
        )}

        {/* Standard Empty State */}
        {!shouldShowAI && !hasResults && (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        )}

        {/* Recent items */}
        {shouldShowRecents && (
          <CommandGroup heading="Recent">
            {(navigation.searchInput.trim() ? navigation.filteredRecentItems : recentItems).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => navigation.handleRecentSelect(item.id)}
              >
                {item.icon && (
                  <iconify-icon icon={item.icon as string} slot="prefix"></iconify-icon>
                )}
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {navigation.isInCommandView ? (
          // Selected command mode: show children
          <CommandGroup>
            {navigation.filteredResults.children.map(({ child }) => (
              <CommandItem
                key={child.id}
                onSelect={() => navigation.handleChildSelect(child.id)}
              >
                {child.icon && (
                  <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                )}
                {child.name}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : (
          // Global search mode: show both top-level commands and child matches
          <>
            {/* Top-level commands */}
            {navigation.filteredResults.parents.length > 0 && (
              <CommandGroup heading="Commands">
                {navigation.filteredResults.parents.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => {
                      if (enableNavigation && command.children) {
                        navigation.handleCommandSelect(command.id);
                      } else {
                        onSelect?.(command as any);
                        navigation.resetState();
                      }
                    }}
                  >
                                    {command.icon && (
                  <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                )}
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
            {navigation.filteredResults.children.length > 0 && (
              <CommandGroup heading="Actions">
                {navigation.filteredResults.children.map(({ parent, child }) => (
                  <CommandItem
                    key={`${parent.id}-${child.id}`}
                    onSelect={() => navigation.handleChildSelect(child.id)}
                  >
                                    {child.icon && (
                  <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                )}
                {parent.name} {child.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </>
        )}
      </CommandList>
    </Command>
  );
}