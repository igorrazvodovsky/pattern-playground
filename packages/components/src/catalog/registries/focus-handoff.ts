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

// Hands focus on from `lost`, which is about to be removed: to the button
// labelled `focusNext`, else to the demo root. Focus that has not yet left
// what is going (`stillThere`) counts as lost too.
const handOff = (
  lost: Element,
  demo: HTMLElement,
  focusNext: string | null | undefined,
  stillThere: (active: Element) => boolean = () => false,
) => {
  const elements = [...demo.querySelectorAll('*')];
  const before = elements.slice(0, elements.indexOf(lost)).reverse();

  // After the commit: whatever replaces the element is in place by then.
  queueMicrotask(() => {
    if (!demo.isConnected) return;
    const active = document.activeElement;
    if (active && active !== document.body && !stillThere(active)) return;
    const target = focusNext ? findTarget(demo, before, focusNext) : undefined;
    (target ?? demo).focus();
  });
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
      if (demo) handOff(button, demo, focusNext);
    };
  }, [focusNext]);

  return ref;
};

/**
 * The same for a Menu: a choice can remove the menu it was made in, with
 * focus on the menu's button or in its list, which a library may portal out
 * of the demo, or hoist to <body> where React's removal does not reach it
 * at once, so focus can still be in the list when the hand-off runs. Returns
 * the refs for the button and the list. A menu inside a popover hands off
 * too, since the choice can remove the popover with it.
 */
export const useMenuFocusHandoff = (focusNext: string | null | undefined) => {
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const button = trigger.current;
    return () => {
      const active = document.activeElement;
      // The list's current one: a library may mount it only while open, and
      // it is still in place when the menu's own cleanup runs.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const menuList = list.current;
      if (!button || !active || (active !== button && !menuList?.contains(active))) return;
      const demo = button.closest<HTMLElement>('[data-registry]');
      if (demo) handOff(button, demo, focusNext, focused => focused === button || Boolean(menuList?.contains(focused)));
    };
  }, [focusNext]);

  return { trigger, list };
};

/**
 * The same for a group of controls that goes as one, such as a filter chip
 * whose condition is removed: from its remove button, or from inside one of
 * its lists, which a library may portal out of the group. Returns the ref for
 * the group and one for each portaled part, which the hand-off also counts as
 * inside the group.
 */
export const useGroupFocusHandoff = (focusNext: string | null | undefined, portaled = 0) => {
  const group = useRef<HTMLDivElement>(null);
  const parts = useRef(Array.from({ length: portaled }, () => ({ current: null as HTMLDivElement | null })));

  useLayoutEffect(() => {
    const root = group.current;
    return () => {
      // The parts' current elements: a library may mount them only while
      // open, and they are still in place when the group's own cleanup runs.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const open = parts.current.map(part => part.current).filter(part => part !== null);
      const inside = (element: Element) => Boolean(root?.contains(element) || open.some(part => part.contains(element)));
      const active = document.activeElement;
      if (!root || !active || !inside(active)) return;
      if (root.closest('dialog, [role="dialog"], [role="alertdialog"]')) return;
      const demo = root.closest<HTMLElement>('[data-registry]');
      if (demo) handOff(root, demo, focusNext, inside);
    };
  }, [focusNext]);

  return { group, parts: parts.current };
};
