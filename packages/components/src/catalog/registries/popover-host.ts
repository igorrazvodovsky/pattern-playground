import { useCallback, useContext } from 'react';
import { DemoSettled } from './focus-on-show';

// Where a Popover opens, and whether it takes focus when it does, the same in
// every library.

/**
 * The element a Popover opens beside: the nearest one that hosts it, marked
 * data-popover-host (each registry's Card is), else the element it sits in.
 * The parent alone would be a host's inner wrapper, such as a card's body.
 */
export const popoverHost = (popover: Element | null): Element | null =>
  popover?.parentElement?.closest('[data-popover-host]') ?? popover?.parentElement ?? null;

/**
 * Whether a Popover that opens now moves focus into itself. It does when it
 * opens because of what the actor did, as a control with `focusOnShow` takes
 * focus (focus-on-show.ts): not while the demo first renders or renders again
 * in another library, and not when the actor has moved focus elsewhere on the
 * page.
 */
export const useMayTakeFocus = () => {
  const settled = useContext(DemoSettled);
  return useCallback(
    (popover: Element | null) => {
      if (!settled?.() || !popover) return false;
      const demo = popover.closest<HTMLElement>('[data-registry]');
      const active = document.activeElement;
      return !active || active === document.body || Boolean(demo?.contains(active));
    },
    [settled],
  );
};
