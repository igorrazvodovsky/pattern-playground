import { createContext, useCallback, useContext } from 'react';
import { labelOf } from './focus-handoff';

// A spec's `returnFocus` control is looked up in the demo that rendered the
// window, which SpecDemo provides, because the window is portaled out of it.

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

export const focusInOpenWindow = (): boolean => {
  const active = document.activeElement;
  const container = active instanceof HTMLElement ? active.closest(windows) : null;
  if (!container) return false;
  // A closed <dialog> can still be visible while its closing transition runs.
  return container instanceof HTMLDialogElement ? container.open : container.checkVisibility();
};

export const settleFocus = (target: HTMLElement | null, opener: Opener | null) => {
  if (focusInOpenWindow()) return;
  if (target) target.focus();
  else if (opener && !focusDemoIfOpenerGone(opener)) opener.element?.focus();
};

export const DemoRoot = createContext<{ readonly current: HTMLElement | null } | null>(null);

export const useReturnFocus = (label: string | null | undefined) => {
  const demo = useContext(DemoRoot);
  return useCallback((): HTMLElement | null => {
    if (!label || !demo?.current) return null;
    return [...demo.current.querySelectorAll('button')].find(button => labelOf(button) === label) ?? null;
  }, [label, demo]);
};
