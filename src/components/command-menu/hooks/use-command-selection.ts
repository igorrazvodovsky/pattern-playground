import { useState, useCallback } from 'react';
import type { CommandData, RecentItem } from '../command-menu-types';
import type { AICommandItem } from '../ai-command-types';

export type SelectableItem = CommandData | RecentItem | AICommandItem;

export interface UseCommandSelectionOptions {
  onSelect?: (item: SelectableItem) => void;
  onCommandSelect?: (command: CommandData) => void;
  onRecentSelect?: (recent: RecentItem) => void;
  onAIResultSelect?: (result: AICommandItem) => void;
  closeOnSelect?: boolean;
}

export interface UseCommandSelectionReturn {
  // Actions
  selectItem: (item: SelectableItem) => void;
  selectCommand: (commandId: string, data: CommandData[]) => void;
  selectRecent: (recentId: string, recents: RecentItem[]) => void;
  selectAIResult: (result: AICommandItem) => void;

  // State
  selectedItemId: string | null;
  setSelectedItemId: (id: string | null) => void;

  // Utilities
  getItemType: (item: SelectableItem) => 'command' | 'recent' | 'ai';
}

export function useCommandSelection({
  onSelect,
  onCommandSelect,
  onRecentSelect,
  onAIResultSelect,
  closeOnSelect = true,
}: UseCommandSelectionOptions = {}): UseCommandSelectionReturn {

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Determine the type of an item
  const getItemType = useCallback((item: SelectableItem): 'command' | 'recent' | 'ai' => {
    if ('children' in item) {
      return 'command';
    }
    if ('timestamp' in item) {
      return 'recent';
    }
    return 'ai';
  }, []);

  // Generic item selection handler
  const selectItem = useCallback((item: SelectableItem) => {
    const itemType = getItemType(item);

    // Update selected item state
    if (closeOnSelect) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(item.id);
    }

    // Call appropriate handler based on item type
    switch (itemType) {
      case 'command':
        onCommandSelect?.(item as CommandData);
        break;
      case 'recent':
        onRecentSelect?.(item as RecentItem);
        break;
      case 'ai':
        onAIResultSelect?.(item as AICommandItem);
        break;
    }

    // Call generic selection handler
    onSelect?.(item);
  }, [getItemType, closeOnSelect, onCommandSelect, onRecentSelect, onAIResultSelect, onSelect]);

  // Select command by ID from data array
  const selectCommand = useCallback((commandId: string, data: CommandData[]) => {
    const command = data.find(cmd => cmd.id === commandId);
    if (command) {
      selectItem(command);
    }
  }, [selectItem]);

  // Select recent item by ID from recents array
  const selectRecent = useCallback((recentId: string, recents: RecentItem[]) => {
    const recentItem = recents.find(item => item.id === recentId);
    if (recentItem) {
      selectItem(recentItem);
    }
  }, [selectItem]);

  // Select AI result
  const selectAIResult = useCallback((result: AICommandItem) => {
    selectItem(result);
  }, [selectItem]);

  return {
    // Actions
    selectItem,
    selectCommand,
    selectRecent,
    selectAIResult,

    // State
    selectedItemId,
    setSelectedItemId,

    // Utilities
    getItemType,
  };
}