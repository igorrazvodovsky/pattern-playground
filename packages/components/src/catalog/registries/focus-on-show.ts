import { createContext, useContext, useLayoutEffect, type RefObject } from 'react';

// Focus for a control that appears because of what the actor did, such as the
// Back button of a view they just opened, or the card they opened it from when
// they return. focus-handoff.ts covers part of this: it moves focus on when a
// focused button disappears. But a press does not always focus the button
// (Safari does not focus a clicked button), so the view that replaces it has to
// take focus itself.
//
// A control takes focus only when it appears after the demo has rendered: not
// on page load, and not when a library switch renders the demo again. It also
// leaves focus alone when the actor has moved it elsewhere on the page, so it
// takes focus only from the body or from inside the demo.

/** Whether the demo's current render has settled. SpecDemo provides it. */
export const DemoSettled = createContext<(() => boolean) | null>(null);

export const useFocusOnShow = (ref: RefObject<HTMLElement | null>, focusOnShow: boolean | null | undefined) => {
  const settled = useContext(DemoSettled);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!focusOnShow || !element || !settled?.()) return;
    const demo = element.closest<HTMLElement>('[data-registry]');
    const active = document.activeElement;
    if (active && active !== document.body && !demo?.contains(active)) return;
    element.focus();
    // Mount only: a control that is already shown keeps what focus does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
