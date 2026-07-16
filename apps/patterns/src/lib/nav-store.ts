import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// The default projection when nothing is persisted, or when a stale payload
// predates the `projection` key (the default shallow merge restores it).
export const DEFAULT_PROJECTION = 'a-z';

type NavState = {
  openGroups: Record<string, boolean>;
  projection: string;
  setProjection: (projection: string) => void;
  setOpen: (label: string, open: boolean) => void;
  isOpen: (label: string) => boolean;
};

export const useNavStore = create<NavState>()(
  persist(
    (set, get) => ({
      openGroups: {},
      projection: DEFAULT_PROJECTION,
      setProjection: (projection) => set({ projection }),
      setOpen: (label, open) =>
        set(state => ({ openGroups: { ...state.openGroups, [label]: open } })),
      isOpen: (label) => get().openGroups[label] ?? false,
    }),
    {
      name: 'nav-state',
      skipHydration: true,
      // A stale localStorage payload without `projection` shallow-merges over the
      // initial state, so the default is restored cleanly — no version/migrate
      // needed. partialize keeps the persisted shape to just the serialisable keys.
      partialize: (state) => ({ openGroups: state.openGroups, projection: state.projection }),
    }
  )
);

export function useNavHydration() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    useNavStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}
