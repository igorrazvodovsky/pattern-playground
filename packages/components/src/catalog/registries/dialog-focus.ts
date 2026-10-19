import { createContext, useCallback, useContext } from 'react';
import { labelOf } from './focus-handoff';

// Where focus goes when a dialog opened from state closes. The element that
// had focus when it opened, if it is still there; if closing removed it (the
// dialog deleted the row its button sat in), the demo that rendered the
// dialog, so the actor stays in the same place on the page.
//
// A spec can name the control instead (a Dialog's or Drawer's `returnFocus`),
// for a window opened from inside another that is gone by the time it closes.
// The control is looked up by label when the window closes, in the demo that
// rendered the window, which SpecDemo provides: the window itself is portaled
// out of the demo.
//
// A window that closes because another replaced it (Full to Detail) leaves
// focus where it is: the window that opened has taken it.

export interface Opener {
  element: HTMLElement | null;
  demo: HTMLElement | null;
}

export const captureOpener = (): Opener => {
  const active = document.activeElement;
  const element = active instanceof HTMLElement && active !== document.body ? active : null;
  return { element, demo: element?.closest<HTMLElement>('[data-registry]') ?? null };
};

/** Focuses the demo when the opener is gone. Returns false if the opener is still there. */
export const focusDemoIfOpenerGone = ({ element, demo }: Opener): boolean => {
  if (element?.isConnected || !demo?.isConnected) return false;
  demo.focus();
  return true;
};

const windows = 'dialog[open], [role="dialog"], [role="alertdialog"]';

/** Whether focus is in a window that is still open, such as one that replaced the window closing. */
export const focusInOpenWindow = (): boolean => {
  const active = document.activeElement;
  const container = active instanceof HTMLElement ? active.closest(windows) : null;
  if (!container) return false;
  // A closed <dialog> can still be visible while its closing transition runs.
  return container instanceof HTMLDialogElement ? container.open : container.checkVisibility();
};

/** Where focus goes once a window has closed: the named control, else back to the opener or the demo. */
export const settleFocus = (target: HTMLElement | null, opener: Opener | null) => {
  if (focusInOpenWindow()) return;
  if (target) target.focus();
  else if (opener && !focusDemoIfOpenerGone(opener)) opener.element?.focus();
};

/** The root element of the demo being rendered. SpecDemo provides it. */
export const DemoRoot = createContext<{ readonly current: HTMLElement | null } | null>(null);

/** Returns a lookup for the demo's button labelled `label`, or null without a label or a match. */
export const useReturnFocus = (label: string | null | undefined) => {
  const demo = useContext(DemoRoot);
  return useCallback((): HTMLElement | null => {
    if (!label || !demo?.current) return null;
    return [...demo.current.querySelectorAll('button')].find(button => labelOf(button) === label) ?? null;
  }, [label, demo]);
};
