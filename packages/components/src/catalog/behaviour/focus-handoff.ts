import { useCallback, useLayoutEffect, useRef, type RefObject } from 'react';

// When a focused control unmounts, focus would fall to the body and the next
// Tab would start from the top of the page. A button inside a dialog is left
// alone, because the dialog returns focus itself.

export const labelOf = (button: HTMLButtonElement) =>
  button.getAttribute('aria-label') ?? button.textContent.trim();

const findTarget = (
  demo: HTMLElement,
  before: Element[],
  focusNext: string,
): HTMLElement | undefined => {
  const candidates = [...demo.querySelectorAll('button')].filter(
    (button) => labelOf(button) === focusNext && !button.disabled && button.checkVisibility(),
  );
  const anchor = before.find((element) => element.isConnected);
  const follows = (button: HTMLButtonElement) =>
    !anchor || (anchor.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  return candidates.find(follows) ?? candidates.at(-1);
};

// Read when the element goes, so a label that changes while the element stays
// does not count as the element going.
const useLatest = (focusNext: string | null | undefined) => {
  const latest = useRef(focusNext);
  useLayoutEffect(() => {
    latest.current = focusNext;
  });
  return latest;
};

const handOff = (
  lost: Element,
  demo: HTMLElement,
  focusNext: string | null | undefined,
  stillThere: (active: Element) => boolean = () => false,
) => {
  const elements = [...demo.querySelectorAll('*')];
  const before = elements.slice(0, elements.indexOf(lost)).reverse();

  // After the commit, so whatever replaces the element is in place.
  queueMicrotask(() => {
    if (!demo.isConnected) return;
    const active = document.activeElement;
    if (active && active !== document.body && !stillThere(active)) return;
    const target = focusNext ? findTarget(demo, before, focusNext) : undefined;
    (target ?? demo).focus();
  });
};

// `present` re-arms the hand-off for an element that appears after its owner
// mounts.
export const useFocusHandoff = <T extends HTMLElement = HTMLButtonElement>(
  focusNext: string | null | undefined,
  given?: RefObject<T | null>,
  present = true,
) => {
  const own = useRef<T>(null);
  const ref = given ?? own;
  const next = useLatest(focusNext);

  useLayoutEffect(() => {
    const button = ref.current;
    return () => {
      // React runs layout cleanups before it removes the element, so the
      // button is still in place, and still focused if it had focus.
      if (!button || document.activeElement !== button) return;
      if (button.closest('dialog, [role="dialog"], [role="alertdialog"]')) return;
      const demo = button.closest<HTMLElement>('[data-registry]');
      if (demo) handOff(button, demo, next.current);
    };
  }, [next, ref, present]);

  return ref;
};

// A library may portal or hoist a menu's list to <body>, where React's removal
// does not reach it at once, so focus can still be in the list when the
// hand-off runs.
export const useMenuFocusHandoff = (focusNext: string | null | undefined) => {
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const next = useLatest(focusNext);
  // Radix returns focus to the button a task after closing the list, leaving
  // focus on <body> in between. A choice that removes the menu in that gap
  // still took focus with it.
  const justClosed = useRef(false);
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closed = useCallback(() => {
    justClosed.current = true;
    clearTimeout(closing.current);
    closing.current = setTimeout(() => (justClosed.current = false), 500);
  }, []);

  useLayoutEffect(() => {
    const button = trigger.current;
    return () => {
      const active = document.activeElement;
      // Read now: a library may mount the list only while open.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const menuList = list.current;
      const dropped = justClosed.current && (!active || active === document.body);
      if (!button || (!dropped && (!active || (active !== button && !menuList?.contains(active)))))
        return;
      const demo = button.closest<HTMLElement>('[data-registry]');
      if (demo)
        handOff(
          button,
          demo,
          next.current,
          (focused) => focused === button || Boolean(menuList?.contains(focused)),
        );
    };
  }, [next]);

  return { trigger, list, closed };
};

// Portaled parts of the group count as inside it.
export const useGroupFocusHandoff = (focusNext: string | null | undefined, portaled = 0) => {
  const group = useRef<HTMLDivElement>(null);
  const parts = useRef(
    Array.from({ length: portaled }, () => ({ current: null as HTMLDivElement | null })),
  );
  const next = useLatest(focusNext);

  useLayoutEffect(() => {
    const root = group.current;
    return () => {
      // Read now: a library may mount the parts only while open.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const open = parts.current.map((part) => part.current).filter((part) => part !== null);
      const inside = (element: Element) =>
        Boolean(root?.contains(element) || open.some((part) => part.contains(element)));
      const active = document.activeElement;
      if (!root || !active || !inside(active)) return;
      if (root.closest('dialog, [role="dialog"], [role="alertdialog"]')) return;
      const demo = root.closest<HTMLElement>('[data-registry]');
      if (demo) handOff(root, demo, next.current, inside);
    };
  }, [next]);

  return { group, parts: parts.current };
};
