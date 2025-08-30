import { useState, useMemo, useRef } from 'react';
import {
  searchHierarchy,
  searchWithinParent,
  type SearchableParent,
  type SearchableItem
} from '../../../utility/hierarchical-search';
import type { CommandData, RecentItem } from '../command-menu-types';

interface CommandOption extends SearchableParent {
  shortcut?: string[];
  children?: CommandChildOption[];
}

interface CommandChildOption extends SearchableItem {
}

export interface UseCommandNavigationOptions {
  data: CommandData[];
  recentItems?: RecentItem[];
  onSelect?: (item: any) => void;
  onEscape?: () => boolean | void;
}

export function useCommandNavigation({
  data,
  recentItems = [],
  onSelect,
  onEscape,
}: UseCommandNavigationOptions) {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const commandData: CommandOption[] = useMemo(() =>
    data.map(cmd => ({
      ...cmd,
      children: cmd.children?.map(child => ({ ...child }))
    })), [data]
  );

  const selectedCommandData = useMemo(() =>
    commandData.find(cmd => cmd.id === selectedCommand),
    [selectedCommand, commandData]
  );

  const filteredResults = useMemo(() => {
    if (selectedCommand && selectedCommandData) {
      const children = searchWithinParent(searchInput, selectedCommandData);
      return {
        parents: [],
        children: children.map(child => ({ parent: selectedCommandData, child }))
      };
    } else {
      return searchHierarchy(searchInput, commandData);
    }
  }, [searchInput, selectedCommand, selectedCommandData, commandData]);

  const filteredRecentItems = useMemo(() => {
    return searchInput.trim()
      ? recentItems.filter(item => {
          const searchText = item.searchableText ?? item.name;
          return searchText.toLowerCase().includes(searchInput.toLowerCase());
        })
      : recentItems;
  }, [searchInput, recentItems]);

  const handleCommandSelect = (commandId: string) => {
    const command = commandData.find(cmd => cmd.id === commandId);
    if (command?.children?.length) {
      setSelectedCommand(commandId);
      setSearchInput("");
      inputRef.current?.focus();
    } else {
      onSelect?.(command);
      setSelectedCommand(null);
      setSearchInput("");
    }
  };

  const handleChildSelect = (childId: string) => {
    const child = selectedCommandData?.children?.find(c => c.id === childId);
    onSelect?.(child);
    setSelectedCommand(null);
    setSearchInput("");
  };

  const handleRecentSelect = (recentId: string) => {
    const recentItem = recentItems.find(item => item.id === recentId);
    onSelect?.(recentItem);
    setSelectedCommand(null);
    setSearchInput("");
  };

  const handleEscape = () => {
    if (selectedCommand) {
      setSelectedCommand(null);
      setSearchInput("");
      inputRef.current?.focus();
      return true;
    }
    return onEscape?.() ?? false;
  };

  const resetState = () => {
    setSelectedCommand(null);
    setSearchInput("");
  };

  return {
    // State
    selectedCommand,
    selectedCommandData,
    searchInput,
    inputRef,

    // Filtered data
    filteredResults,
    filteredRecentItems,

    // Actions
    setSearchInput,
    handleCommandSelect,
    handleChildSelect,
    handleRecentSelect,
    handleEscape,
    resetState,

    // Computed properties
    isInCommandView: !!selectedCommand,
    placeholder: selectedCommand
      ? `${selectedCommandData?.name}`
      : "Type a command or search...",
  };
}