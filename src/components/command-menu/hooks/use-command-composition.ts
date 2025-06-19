import { useMemo } from 'react';
import { useCommandNavigation, type UseCommandNavigationOptions } from './use-command-navigation';
import { useCommandRecents, type UseCommandRecentsOptions, type UseCommandRecentsReturn } from './use-command-recents';
import { useCommandKeyboard, type UseCommandKeyboardOptions, type UseCommandKeyboardReturn } from './use-command-keyboard';
import { useCommandSelection, type UseCommandSelectionOptions, type UseCommandSelectionReturn } from './use-command-selection';
import { useAICommand } from './use-ai-command';
import type { CommandData, RecentItem, CommandMenuProps } from '../command-menu-types';
import type { AICommandItem } from '../ai-command-types';

export interface UseCommandCompositionOptions {
  data: CommandData[];
  enableNavigation?: boolean;
  enableRecents?: boolean;
  enableAI?: boolean;
  aiConfig?: CommandMenuProps['aiConfig'];
  recentsConfig?: UseCommandRecentsOptions;
  keyboardConfig?: UseCommandKeyboardOptions;
  selectionConfig?: UseCommandSelectionOptions;

  // Unified callbacks
  onSelect?: (item: CommandData | RecentItem | AICommandItem) => void;
  onEscape?: () => boolean | void;
}

export interface UnifiedResults {
  commands: CommandData[];
  children: Array<{ parent: CommandData; child: any }>;
  recents: RecentItem[];
  aiSuggestions: AICommandItem[];
  isEmpty: boolean;
}

export interface UseCommandCompositionReturn {
  // Combined state from all hooks
  searchInput: string;
  setSearchInput: (input: string) => void;

  // Hook returns (if enabled)
  navigation: ReturnType<typeof useCommandNavigation>;
  recents?: UseCommandRecentsReturn;
  ai?: ReturnType<typeof useAICommand>;
  keyboard: UseCommandKeyboardReturn;
  selection: UseCommandSelectionReturn;

  // Unified results
  results: UnifiedResults;

  // Unified state flags
  isInChildView: boolean;
  shouldShowRecents: boolean;
  shouldShowAI: boolean;
  hasResults: boolean;

  // Unified placeholder
  placeholder: string;
}

export function useCommandComposition({
  data,
  enableNavigation = true,
  enableRecents = true,
  enableAI = false,
  aiConfig,
  recentsConfig = {},
  keyboardConfig = {},
  selectionConfig = {},
  onSelect,
  onEscape,
}: UseCommandCompositionOptions): UseCommandCompositionReturn {

  // Initialize recents hook if enabled
  const recents = enableRecents
    ? useCommandRecents({
      maxRecents: 10,
      persistRecents: false,
      ...recentsConfig,
    })
    : undefined;

  // Selection configuration with unified onSelect
  const selectionOptions = {
    onSelect,
    closeOnSelect: true,
    ...selectionConfig,
  };

  // Navigation hook (always enabled for core functionality)
  const navigation = useCommandNavigation({
    data,
    recentItems: recents?.recentItems || [],
    onSelect: (item) => {
      // Add to recents if enabled
      if (recents && 'name' in item) {
        const recentItem: RecentItem = {
          id: item.id,
          name: item.name,
          icon: item.icon,
          searchableText: item.searchableText || item.name,
          timestamp: Date.now(),
        };
        recents.addToRecents(recentItem);
      }

      // Call unified selection handler
      onSelect?.(item);
    },
    onEscape,
  });

  // AI hook if enabled
  const ai = enableAI && aiConfig
    ? useAICommand({
      onAIRequest: aiConfig.onAIRequest,
      debounceMs: aiConfig.debounceMs,
      minInputLength: aiConfig.minInputLength,
    })
    : undefined;

  // Keyboard hook with navigation-aware shortcuts
  const keyboard = useCommandKeyboard({
    onEscape: navigation.handleEscape,
    navigationEnabled: enableNavigation,
    ...keyboardConfig,
  });

  // Selection hook
  const selection = useCommandSelection({
    ...selectionOptions,
    onSelect: (item) => {
      // Handle selection through navigation for proper state management
      const itemType = selection.getItemType(item);

      switch (itemType) {
        case 'command':
          navigation.handleCommandSelect(item.id);
          break;
        case 'recent':
          navigation.handleRecentSelect(item.id);
          break;
        case 'ai':
          // Handle AI result selection - placeholder for now
          // ai?.handleApplyAIResult?.(item as AICommandResult);
          navigation.resetState();
          break;
      }

      selectionOptions.onSelect?.(item);
    },
  });

  // Unified results combining all data sources
  const results = useMemo((): UnifiedResults => {
    const commands = navigation.filteredResults.parents as CommandData[];
    const children = navigation.filteredResults.children as Array<{ parent: CommandData; child: any }>;
    const currentRecents = recents
      ? recents.filterRecents(navigation.searchInput)
      : [];

    // AI suggestions would come from ai state - placeholder for now
    const aiSuggestions: AICommandItem[] = [];

    const isEmpty = commands.length === 0 &&
      children.length === 0 &&
      currentRecents.length === 0 &&
      aiSuggestions.length === 0;

    return {
      commands,
      children,
      recents: currentRecents,
      aiSuggestions,
      isEmpty,
    };
  }, [navigation.filteredResults, navigation.searchInput, recents, ai?.aiState]);

  // Unified state flags
  const isInChildView = navigation.isInCommandView;
  const shouldShowRecents = enableRecents &&
    !isInChildView &&
    results.recents.length > 0;

  const shouldShowAI = enableAI &&
    !isInChildView &&
    navigation.searchInput.trim() &&
    navigation.searchInput.length >= (aiConfig?.minInputLength || 3);

  const hasResults = !results.isEmpty;

  // Unified placeholder
  const placeholder = useMemo(() => {
    if (isInChildView) {
      return navigation.placeholder;
    }
    if (enableAI) {
      return "Ask AI or search commands...";
    }
    return "Type a command or search...";
  }, [isInChildView, enableAI, navigation.placeholder]);

  return {
    // Combined state
    searchInput: navigation.searchInput,
    setSearchInput: navigation.setSearchInput,

    // Hook returns
    navigation,
    recents,
    ai,
    keyboard,
    selection,

    // Unified results
    results,

    // Unified state flags
    isInChildView,
    shouldShowRecents,
    shouldShowAI,
    hasResults,

    // Unified placeholder
    placeholder,
  };
}