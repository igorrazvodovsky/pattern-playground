import { createContext, useContext, useLayoutEffect, type RefObject } from 'react';

// Safari does not focus a clicked button, so focus-handoff.ts never sees it
// leave, and the view that replaces it has to take focus itself. Only a
// control that appears after the demo has rendered takes focus, and only from
// the body or from inside the demo.

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
