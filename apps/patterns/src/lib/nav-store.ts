import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NavState = {
  openGroups: Record<string, boolean>;
  setOpen: (label: string, open: boolean) => void;
  isOpen: (label: string) => boolean;
};

export const useNavStore = create<NavState>()(
  persist(
    (set, get) => ({
      openGroups: {},
      setOpen: (label, open) =>
        set(state => ({ openGroups: { ...state.openGroups, [label]: open } })),
      isOpen: (label) => get().openGroups[label] ?? false,
    }),
    {
      name: 'nav-state',
      skipHydration: true,
      // A stale payload carrying keys this store no longer defines (a removed
      // projection id, collapse keys from a dropped group) shallow-merges over
      // the initial state and is ignored — no version/migrate needed.
      // partialize keeps the persisted shape to just the serialisable keys.
      partialize: (state) => ({ openGroups: state.openGroups }),
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
