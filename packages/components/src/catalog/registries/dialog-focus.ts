// Where focus goes when a dialog opened from state closes. The element that
// had focus when it opened, if it is still there; if closing removed it (the
// dialog deleted the row its button sat in), the demo that rendered the
// dialog, so the actor stays in the same place on the page.

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
