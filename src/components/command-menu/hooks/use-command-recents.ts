import { useState, useMemo, useCallback, useEffect } from 'react';
import type { RecentItem } from '../command-menu-types';

export interface UseCommandRecentsOptions {
  maxRecents?: number;
  persistRecents?: boolean;
  storageKey?: string;
  initialRecents?: RecentItem[];
}

export interface UseCommandRecentsReturn {
  // State
  recentItems: RecentItem[];
  filteredRecentItems: RecentItem[];

  // Actions
  addToRecents: (item: RecentItem) => void;
  removeFromRecents: (itemId: string) => void;
  clearRecents: () => void;

  // Filtering
  filterRecents: (searchInput: string) => RecentItem[];
}

export function useCommandRecents({
  maxRecents = 10,
  persistRecents = false,
  storageKey = 'command-menu-recents',
  initialRecents = [],
}: UseCommandRecentsOptions = {}): UseCommandRecentsReturn {

  // Initialize recent items from localStorage if persistence is enabled
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    if (persistRecents && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as RecentItem[];
          return parsed.slice(0, maxRecents); // Ensure we don't exceed maxRecents
        }
      } catch (error) {
        console.warn('Failed to load recent items from localStorage:', error);
      }
    }
    return initialRecents.slice(0, maxRecents);
  });

  // Persist to localStorage when recents change
  useEffect(() => {
    if (persistRecents && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(recentItems));
      } catch (error) {
        console.warn('Failed to save recent items to localStorage:', error);
      }
    }
  }, [recentItems, persistRecents, storageKey]);

  // Add item to recents
  const addToRecents = useCallback((item: RecentItem) => {
    setRecentItems(prevRecents => {
      // Remove existing item if it exists
      const filteredRecents = prevRecents.filter(recent => recent.id !== item.id);

      // Add new item with current timestamp at the beginning
      const newItem: RecentItem = {
        ...item,
        timestamp: item.timestamp || Date.now(),
      };

      // Keep only maxRecents items
      return [newItem, ...filteredRecents].slice(0, maxRecents);
    });
  }, [maxRecents]);

  // Remove item from recents
  const removeFromRecents = useCallback((itemId: string) => {
    setRecentItems(prevRecents => prevRecents.filter(item => item.id !== itemId));
  }, []);

  // Clear all recent items
  const clearRecents = useCallback(() => {
    setRecentItems([]);
  }, []);

  // Filter recent items based on search input
  const filterRecents = useCallback((searchInput: string): RecentItem[] => {
    if (!searchInput.trim()) return recentItems;

    const processedQuery = searchInput.toLowerCase();
    return recentItems.filter(item => {
      const searchText = item.searchableText || item.name;
      return searchText.toLowerCase().includes(processedQuery);
    });
  }, [recentItems]);

  // Memoized filtered recent items (for performance)
  const filteredRecentItems = useMemo(() =>
    filterRecents(''),
    [filterRecents]
  );

  return {
    // State
    recentItems,
    filteredRecentItems,

    // Actions
    addToRecents,
    removeFromRecents,
    clearRecents,

    // Filtering
    filterRecents,
  };
}