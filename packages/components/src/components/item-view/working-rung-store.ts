import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * The reader's preferred working rung — the view a *click* on an inline
 * reference opens, as opposed to the summary a *hover* opens.
 *
 * The summary (mini) is deliberately not a candidate here: it lives in the
 * hover modality and answers "what is this?", so it is a glance, never a place
 * to work. Clicking says "I want to work with this item", and the only rungs
 * that means are Detail (mid, a drawer) and Full (maxi, a dialog). Because only
 * those two are ever written, hovering references — which opens summaries all
 * day — can never disturb the preference.
 *
 * One value, shared across every reference: a reader forms a single habit
 * ("I'm a Detail person"), not one per content type. Detail until they show
 * otherwise by opening Full.
 */
export type WorkingRung = 'mid' | 'maxi';

interface WorkingRungState {
  preferred: WorkingRung;
  setPreferred: (rung: WorkingRung) => void;
}

export const useWorkingRungStore = create<WorkingRungState>()(
  persist(
    (set) => ({
      preferred: 'mid',
      setPreferred: (rung) => set({ preferred: rung }),
    }),
    {
      name: 'pp-preferred-working-rung',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
