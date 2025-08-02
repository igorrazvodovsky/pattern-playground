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

  onSelect?: (item: CommandData | RecentItem | AICommandItem) => void;
  onEscape?: () => boolean | void;
  onClose?: () => void;
}

export interface UnifiedResults {
  commands: CommandData[];
  children: Array<{ parent: CommandData; child: any }>;
  recents: RecentItem[];
  aiSuggestions: AICommandItem[];
  isEmpty: boolean;
}

export interface UseCommandCompositionReturn {
  searchInput: string;
  setSearchInput: (input: string) => void;

  navigation: ReturnType<typeof useCommandNavigation>;
  recents?: UseCommandRecentsReturn;
  ai?: ReturnType<typeof useAICommand>;
  keyboard: UseCommandKeyboardReturn;
  selection: UseCommandSelectionReturn;

  results: UnifiedResults;

  isInChildView: boolean;
  shouldShowRecents: boolean;
  shouldShowAI: boolean;
  hasResults: boolean;

  placeholder: string;
}

const DEFAULT_CONFIG = {
  maxRecents: 10,
  debounceMs: 300,
  minInputLength: 3,
} as const;

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
  onClose,
}: UseCommandCompositionOptions): UseCommandCompositionReturn {

  const recents = enableRecents
    ? useCommandRecents({
      maxRecents: DEFAULT_CONFIG.maxRecents,
      persistRecents: false,
      ...recentsConfig,
    })
    : undefined;

  const selectionOptions = {
    onSelect,
    closeOnSelect: true,
    ...selectionConfig,
  };

  const navigation = useCommandNavigation({
    data,
    recentItems: recents?.recentItems ?? [],
    onSelect: (item) => {
      if (recents && 'name' in item) {
        const recentItem: RecentItem = {
          id: item.id,
          name: item.name,
          icon: item.icon,
          searchableText: item.searchableText ?? item.name,
          timestamp: Date.now(),
        };
        recents.addToRecents(recentItem);
      }

      onSelect?.(item);

      onClose?.();
    },
    onEscape,
  });

  const ai = enableAI && aiConfig
    ? useAICommand({
      onAIRequest: aiConfig.onAIRequest,
      debounceMs: aiConfig.debounceMs,
      minInputLength: aiConfig.minInputLength,
    })
    : undefined;

  const keyboard = useCommandKeyboard({
    onEscape: navigation.handleEscape,
    navigationEnabled: enableNavigation,
    ...keyboardConfig,
  });

  const selection = useCommandSelection({
    ...selectionOptions,
    onSelect: (item) => {
      const itemType = selection.getItemType(item);

      switch (itemType) {
        case 'command':
          navigation.handleCommandSelect(item.id);
          break;
        case 'recent':
          navigation.handleRecentSelect(item.id);
          break;
        case 'ai':
          navigation.resetState();
          break;
      }

      selectionOptions.onSelect?.(item);
    },
  });

  const results = useMemo((): UnifiedResults => {
    const commands = navigation.filteredResults.parents as CommandData[];
    const children = navigation.filteredResults.children as Array<{ parent: CommandData; child: any }>;
    const currentRecents = recents
      ? recents.filterRecents(navigation.searchInput)
      : [];

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

  const isInChildView = navigation.isInCommandView;
  const shouldShowRecents = enableRecents &&
    !isInChildView &&
    results.recents.length > 0;

  const shouldShowAI = enableAI &&
    !isInChildView &&
    navigation.searchInput.trim() &&
    navigation.searchInput.length >= (aiConfig?.minInputLength ?? DEFAULT_CONFIG.minInputLength) &&
    results.isEmpty;

  const hasResults = !results.isEmpty;
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
    searchInput: navigation.searchInput,
    setSearchInput: navigation.setSearchInput,

    navigation,
    recents,
    ai,
    keyboard,
    selection,

      results,

      isInChildView,
    shouldShowRecents,
    shouldShowAI,
    hasResults,

      placeholder,
  };
}