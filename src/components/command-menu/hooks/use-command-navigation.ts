import { useState, useMemo, useRef } from 'react';
import {
  searchHierarchy,
  searchWithinParent,
  type SearchableParent,
  type SearchableItem
} from '../../../utils/hierarchical-search';
import type { CommandData, RecentItem } from '../command-menu-types';

// Extend the generic interfaces for command-specific usage
interface CommandOption extends SearchableParent {
  shortcut?: string[];
  children?: CommandChildOption[];
}

interface CommandChildOption extends SearchableItem {
  // Command-specific properties can be added here
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

  // Convert CommandData to CommandOption for compatibility with search utilities
  const commandData: CommandOption[] = useMemo(() =>
    data.map(cmd => ({
      ...cmd,
      children: cmd.children?.map(child => ({ ...child }))
    })), [data]
  );

  // Get the currently selected command's data
  const selectedCommandData = useMemo(() =>
    commandData.find(cmd => cmd.id === selectedCommand),
    [selectedCommand, commandData]
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
  }, [searchInput, selectedCommand, selectedCommandData, commandData]);

  // Filter recent items based on search input
  const filteredRecentItems = useMemo(() => {
    if (!searchInput.trim()) return recentItems;

    const processedQuery = searchInput.toLowerCase();
    return recentItems.filter(item => {
      const searchText = item.searchableText || item.name;
      return searchText.toLowerCase().includes(processedQuery);
    });
  }, [searchInput, recentItems]);

  const handleCommandSelect = (commandId: string) => {
    const command = commandData.find(cmd => cmd.id === commandId);
    if (command?.children) {
      setSelectedCommand(commandId);
      setSearchInput("");
      inputRef.current?.focus();
    } else {
      // Execute command and reset state
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