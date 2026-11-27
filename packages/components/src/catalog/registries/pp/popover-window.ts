import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { useBoundProp } from '@json-render/react';
import {
  captureOpener,
  focusDemoIfOpenerGone,
  settleFocus,
  type Opener,
} from '../../behaviour/dialog-focus';
import { popoverHost, useMayTakeFocus } from '../../behaviour/popover-host';

// A catalog Popover on <pp-popup>: its open state is bound to the spec, it
// anchors to its popover host, it takes focus when it opens, and it hands
// focus back however it closes.
export const usePopoverWindow = (open: boolean | null | undefined, binding: string | undefined) => {
  const [shown, setShown] = useBoundProp(open, binding);
  const popup = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<Opener | null>(null);
  const [anchor, setAnchor] = useState<Element | null>(null);
  const mayTakeFocus = useMayTakeFocus();

  useLayoutEffect(() => setAnchor(popoverHost(popup.current)), []);

  // The popup shows a frame after `active` is set.
  useEffect(() => {
    if (!shown) return;
    opener.current = captureOpener();
    if (!mayTakeFocus(popup.current)) return;
    const frame = requestAnimationFrame(() => {
      const target = panel.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      (target ?? panel.current)?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [shown, mayTakeFocus]);

  // The spec closing the panel hides what has focus, so focus goes back
  // as when the actor closes it.
  const wasShown = useRef(shown);
  useLayoutEffect(() => {
    if (wasShown.current && !shown) {
      const active = document.activeElement;
      // Not settleFocus: the panel still counts as an open window here.
      const back = opener.current;
      if (
        back &&
        (!active || active === document.body || panel.current?.contains(active)) &&
        !focusDemoIfOpenerGone(back)
      ) {
        back.element?.focus();
      }
    }
    wasShown.current = shown;
  }, [shown]);

  const onHide = useEffectEvent(() => {
    // Focus goes back only from inside the panel: a click on another
    // control has already moved it where the actor wanted.
    if (panel.current?.contains(document.activeElement)) settleFocus(null, opener.current);
    opener.current = null;
    setShown(false);
  });
  useEffect(() => {
    const el = popup.current;
    if (!el) return;
    const listener = () => onHide();
    el.addEventListener('pp-hide', listener);
    return () => el.removeEventListener('pp-hide', listener);
  }, []);

  return { popup, panel, anchor, open: shown ?? false };
};
