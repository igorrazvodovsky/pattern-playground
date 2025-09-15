import { useState, useMemo, useCallback, useEffect } from 'react';
import type { RecentItem } from '../command-menu-types';

export interface UseCommandRecentsOptions {
  maxRecents?: number;
  persistRecents?: boolean;
  storageKey?: string;
  initialRecents?: RecentItem[];
  enabled?: boolean;
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
  enabled = true,
}: UseCommandRecentsOptions = {}): UseCommandRecentsReturn {

  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    if (!enabled) return [];

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

  useEffect(() => {
    if (enabled && persistRecents && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(recentItems));
      } catch (error) {
        console.warn('Failed to save recent items to localStorage:', error);
      }
    }
  }, [recentItems, persistRecents, storageKey, enabled]);

  const addToRecents = useCallback((item: RecentItem) => {
    if (!enabled) return;

    setRecentItems(prevRecents => {
      const filteredRecents = prevRecents.filter(recent => recent.id !== item.id);

      const newItem: RecentItem = {
        ...item,
        timestamp: item.timestamp ?? Date.now(),
      };

      return [newItem, ...filteredRecents]
        .toSorted((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
        .slice(0, maxRecents);
    });
  }, [maxRecents, enabled]);

  const removeFromRecents = useCallback((itemId: string) => {
    setRecentItems(prevRecents => prevRecents.filter(item => item.id !== itemId));
  }, []);

  const clearRecents = useCallback(() => {
    setRecentItems([]);
  }, []);

  const filterRecents = useCallback((searchInput: string): RecentItem[] => {
    return searchInput.trim() 
      ? recentItems.filter(item => {
          const searchText = item.searchableText ?? item.name;
          return searchText.toLowerCase().includes(searchInput.toLowerCase());
        })
      : recentItems;
  }, [recentItems]);

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