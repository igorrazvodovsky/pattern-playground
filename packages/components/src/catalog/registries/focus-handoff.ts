import { useLayoutEffect, useRef } from 'react';

// Where focus goes when a Button unmounts while it has focus. A press can hide
// the button it came from (an arm swap, a deleted row, a Reset that hides
// itself), and so can a timer (an armed pair reverting). Left alone, focus
// falls to the body and the next Tab starts from the top of the page.
//
// The spec names the target by label (the Button's `focusNext`): focus goes to
// the first button with that label after where the lost one was, else the last
// one before it. With no name or no match, it goes to the demo root, as it does
// for a dialog whose opener is gone (dialog-focus.ts). A button inside a dialog
// is left alone, because the dialog returns focus itself.

export const labelOf = (button: HTMLButtonElement) => button.getAttribute('aria-label') ?? button.textContent.trim();

const findTarget = (demo: HTMLElement, before: Element[], focusNext: string): HTMLElement | undefined => {
  const candidates = [...demo.querySelectorAll('button')].filter(
    button => labelOf(button) === focusNext && !button.disabled && button.checkVisibility(),
  );
  // The nearest element that stood before the lost button and is still there
  // marks where it was.
  const anchor = before.find(element => element.isConnected);
  const follows = (button: HTMLButtonElement) =>
    !anchor || (anchor.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  return candidates.find(follows) ?? candidates.at(-1);
};

/** Returns the ref for a Button's element. */
export const useFocusHandoff = (focusNext: string | null | undefined) => {
  const ref = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const button = ref.current;
    return () => {
      // React runs layout cleanups before it removes the element, so the
      // button is still in place, and still focused if it had focus.
      if (!button || document.activeElement !== button) return;
      if (button.closest('dialog, [role="dialog"], [role="alertdialog"]')) return;
      const demo = button.closest<HTMLElement>('[data-registry]');
      if (!demo) return;
      const elements = [...demo.querySelectorAll('*')];
      const before = elements.slice(0, elements.indexOf(button)).reverse();

      // After the commit: whatever replaces the button is in place by then.
      queueMicrotask(() => {
        if (!demo.isConnected) return;
        if (document.activeElement && document.activeElement !== document.body) return;
        const target = focusNext ? findTarget(demo, before, focusNext) : undefined;
        (target ?? demo).focus();
      });
    };
  }, [focusNext]);

  return ref;
};
