import { useCallback, useContext } from 'react';
import { DemoSettled } from './focus-on-show';

// The nearest data-popover-host (each registry's Card and Item are) rather
// than the parent, which would be a host's inner wrapper, such as a card's body.
export const popoverHost = (popover: Element | null): Element | null =>
  popover?.parentElement?.closest('[data-popover-host]') ?? popover?.parentElement ?? null;

// Takes focus on the same terms as `focusOnShow` (focus-on-show.ts).
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
