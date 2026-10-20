import { useEffect, useRef, type FocusEvent, type KeyboardEvent } from 'react';
import { previewTiming } from '../catalog';

// A reference's preview: shown after a pause when the pointer or focus arrives
// on the reference, and kept while the pointer crosses into the preview. The
// reference and the preview share the open state, so leaving either only
// schedules a close that arriving on the other cancels. Pressing the reference
// cancels a pending open, since the press opens a fuller view instead. While
// that view shows (`expanded`), arriving on the reference does nothing, and so
// does focus coming back to it as the view closes: the actor has just left the
// item, not arrived on it.
//
// The preview is portaled out of the reference's place in the page, so the
// keyboard is wired here: Tab from the reference moves into the open preview,
// Shift+Tab from its first control moves back, and Tab from its last control
// or Escape closes it and returns focus to the reference.
//
// The timers write through `setShown` only while the reference is on the page:
// a demo's root is not unmounted when its pane goes.

const focusable = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const usePreview = (shown: boolean, setShown: (shown: boolean) => void, expanded: boolean) => {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;
  // When the fuller view last closed. A window hands focus back after its
  // state has changed, so `expanded` is already false by then.
  const closedAt = useRef(-Infinity);
  const wasExpanded = useRef(expanded);
  useEffect(() => {
    if (wasExpanded.current && !expanded) closedAt.current = performance.now();
    wasExpanded.current = expanded;
  }, [expanded]);
  // Set while focus is moved back to the reference from the preview.
  const returning = useRef(false);

  const clear = () => {
    window.clearTimeout(timer.current);
    timer.current = undefined;
  };
  const later = (next: boolean, delay: number) => {
    clear();
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      if (!triggerRef.current?.isConnected) return;
      if (next && expandedRef.current) return;
      setShown(next);
    }, delay);
  };
  useEffect(() => clear, []);

  const show = () => {
    if (returning.current || expandedRef.current) return;
    if (performance.now() - closedAt.current < previewTiming.open) return;
    later(true, previewTiming.open);
  };
  const hide = () => later(false, previewTiming.close);
  const returnToTrigger = () => {
    returning.current = true;
    triggerRef.current?.focus();
    returning.current = false;
  };
  const close = () => {
    clear();
    setShown(false);
    if (contentRef.current?.contains(document.activeElement)) returnToTrigger();
  };
  const controls = () => [...(contentRef.current?.querySelectorAll<HTMLElement>(focusable) ?? [])];

  // Focus moving between the reference and its preview is not leaving.
  const blur = (event: FocusEvent) => {
    const to = event.relatedTarget as Node | null;
    if (to && (triggerRef.current?.contains(to) || contentRef.current?.contains(to))) return;
    hide();
  };
  // Escape closes the preview and goes no further, so a dialog or pane around
  // the reference stays open. With the preview closed, it goes on as usual.
  const triggerKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && shown) {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key !== 'Tab' || event.shiftKey || !shown) return;
    const [first] = controls();
    if (!first) return;
    event.preventDefault();
    clear();
    first.focus();
  };
  const contentKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
    if (event.key !== 'Tab') return;
    const all = controls();
    if (event.shiftKey && document.activeElement === all[0]) {
      event.preventDefault();
      returnToTrigger();
    } else if (!event.shiftKey && document.activeElement === all.at(-1)) {
      event.preventDefault();
      close();
    }
  };

  return {
    triggerRef,
    contentRef,
    trigger: { onPointerEnter: show, onPointerLeave: hide, onFocus: show, onBlur: blur, onKeyDown: triggerKey },
    content: { onPointerEnter: clear, onPointerLeave: hide, onBlur: blur, onKeyDown: contentKey },
    /** Closes the preview, returning focus to the reference if it was inside. */
    close,
  };
};
