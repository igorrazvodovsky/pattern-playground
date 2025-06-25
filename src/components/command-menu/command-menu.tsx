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
import { useCommandComposition } from './hooks/use-command-composition';
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
  onClose,
  aiConfig,
  showRecents = true,
  enableNavigation = true,
  enableAI = false,
  placeholder,
  emptyMessage = "¯\_(ツ)_/¯. No results found.",
  className,
  aiMessages = {},
}: CommandMenuProps) {

  // Use the composition hook to manage all command menu functionality
  const composition = useCommandComposition({
    data,
    enableNavigation,
    enableRecents: showRecents,
    enableAI,
    aiConfig,
    recentsConfig: {
      initialRecents: recentItems,
      maxRecents: 10,
      persistRecents: false,
    },
    onSelect,
    onEscape,
    onClose,
  });

  // Trigger AI request when conditions are met
  useEffect(() => {
    if (composition.shouldShowAI && composition.ai?.handleAIRequest) {
      composition.ai.handleAIRequest(composition.searchInput);
    }
  }, [
    composition.shouldShowAI,
    composition.searchInput,
    composition.ai?.handleAIRequest
  ]);

  // Handle AI result application
  const handleApplyAIResult = (result: AICommandResult) => {
    composition.ai?.handleApplyAIResult?.(result);
    composition.navigation.resetState();
    onClose?.();
  };

  // Determine effective placeholder
  const effectivePlaceholder = placeholder || composition.placeholder;

  return (
    <Command
      label="Command Menu"
      shouldFilter={false}
      onKeyDown={composition.keyboard.handleKeyDown}
      className={className}
    >
      <CommandInput
        placeholder={effectivePlaceholder}
        value={composition.searchInput}
        onValueChange={composition.setSearchInput}
        ref={composition.keyboard.inputRef}
      />
      <CommandList>
        {/* AI Empty State */}
        {composition.shouldShowAI && composition.ai && (
          <AICommandEmpty
            searchInput={composition.searchInput}
            aiState={composition.ai.aiState}
            onAIRequest={composition.ai.handleAIRequest}
            onApplyAIResult={handleApplyAIResult}
            onEditPrompt={composition.ai.handleEditPrompt}
            onInputChange={composition.setSearchInput}
            onClose={() => {
              composition.navigation.resetState();
              onClose?.();
            }}
            emptyStateMessage={aiMessages.emptyStateMessage}
            noResultsMessage={aiMessages.noResultsMessage}
            aiProcessingMessage={aiMessages.aiProcessingMessage}
            aiErrorPrefix={aiMessages.aiErrorPrefix}
          />
        )}

        {/* Standard Empty State */}
        {!composition.shouldShowAI && !composition.hasResults && (
          <CommandEmpty>{emptyMessage}</CommandEmpty>
        )}

        {/* Recent items */}
        {composition.shouldShowRecents && composition.results.recents.length > 0 && (
          <CommandGroup heading="Recent">
            {composition.results.recents.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => composition.navigation.handleRecentSelect(item.id)}
              >
                {item.icon && (
                  <iconify-icon icon={item.icon as string} slot="prefix"></iconify-icon>
                )}
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {composition.isInChildView ? (
          // Selected command mode: show children
          <CommandGroup>
            {composition.results.children.map(({ child }) => (
              <CommandItem
                key={child.id}
                onSelect={() => composition.navigation.handleChildSelect(child.id)}
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
            {composition.results.commands.length > 0 && (
              <CommandGroup heading="Commands">
                {composition.results.commands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => {
                      if (enableNavigation && command.children) {
                        composition.navigation.handleCommandSelect(command.id);
                      } else {
                        onSelect?.(command as any);
                        composition.navigation.resetState();
                      }
                    }}
                  >
                    {command.icon && (
                      <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                    )}
                    {command.name}
                    {command.shortcut && (
                      <span slot="suffix" className="cmdk-shortcuts">
                        {composition.keyboard.formatShortcut(command.shortcut)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Child command matches */}
            {composition.results.children.length > 0 && (
              <CommandGroup heading="Actions">
                {composition.results.children.map(({ parent, child }) => (
                  <CommandItem
                    key={`${parent.id}-${child.id}`}
                    onSelect={() => composition.navigation.handleChildSelect(child.id)}
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