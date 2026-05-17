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
    { name: 'nav-state' }
  )
);
