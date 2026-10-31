import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The pattern-list grouping when nothing is persisted, or when a persisted id
// names a grouping that no longer exists.
export const DEFAULT_GROUPING = 'a-z';

// The language the pattern list is narrowed to when nothing is persisted, or
// when a persisted id names a language that no longer exists: none, so the list
// holds every pattern.
export const ALL_PATTERNS = 'all';

type NavState = {
  openGroups: Record<string, boolean>;
  grouping: string;
  setGrouping: (grouping: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  setOpen: (label: string, open: boolean) => void;
  // `fallback` is the state of a group the visitor has not toggled yet.
  isOpen: (label: string, fallback?: boolean) => boolean;
};

export const useNavStore = create<NavState>()(
  persist(
    (set, get) => ({
      openGroups: {},
      grouping: DEFAULT_GROUPING,
      setGrouping: (grouping) => set({ grouping }),
      language: ALL_PATTERNS,
      setLanguage: (language) => set({ language }),
      setOpen: (label, open) =>
        set((state) => ({ openGroups: { ...state.openGroups, [label]: open } })),
      isOpen: (label, fallback = false) => get().openGroups[label] ?? fallback,
    }),
    {
      name: 'nav-state',
      skipHydration: true,
      // A stale payload shallow-merges over the initial state: one without
      // `grouping` or `language` keeps the default, and collapse keys from a dropped group are
      // ignored — no version/migrate needed. partialize keeps the persisted
      // shape to just the serialisable keys.
      partialize: (state) => ({
        openGroups: state.openGroups,
        grouping: state.grouping,
        language: state.language,
      }),
    },
  ),
);

export function useNavHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useNavStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
