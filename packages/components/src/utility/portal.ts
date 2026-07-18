/**
 * Portal — move a rendered element somewhere else in the document while the code
 * that owns it stays where it logically lives.
 *
 * Some elements belong to one part of the interface but have to appear somewhere
 * else entirely: a menu that mustn't be clipped by its scrolling container, a
 * dialog that has to sit above everything regardless of where it was opened from,
 * a toast emitted deep in a tree that belongs in a global region. This helper
 * captures that reparenting move so the call sites that currently reach for
 * `document.body.appendChild(el)` (toast, modal-service, dropdown) share one
 * mechanism with a clean way back.
 *
 * When NOT to reach for this. For the common "escape clipping / stacking" case —
 * popovers, dropdowns, tooltips anchored to a trigger — prefer the platform's top
 * layer instead: the `popover` attribute or `<dialog>.showModal()` render above
 * everything regardless of DOM position, and CSS anchor positioning lets an
 * element be placed relative to an anchor it isn't a descendant of. Those need no
 * reparenting and keep the accessibility tree intact for free. Reach for a JS
 * portal when you genuinely need the element under a *specific* container (not the
 * top layer), or to bridge a rendered subtree into DOM a framework doesn't own.
 * In React, that bridge is `createPortal` from `react-dom` — use it there rather
 * than this helper.
 *
 * Accessibility caveat: moving an element in the DOM moves it in the accessibility
 * tree too. If the portaled content is still logically owned by a trigger (a
 * listbox for a combobox, say), preserve the relationship with `aria-controls` /
 * `aria-activedescendant` and manage focus deliberately — the visual anchor no
 * longer implies the semantic one.
 *
 * TODO(pattern): there's a pattern-level idea hiding behind this utility that we
 * decided not to name yet — the recurring design situation where an element's
 * *logical ownership* and its *experiential placement* come apart (the decoupling
 * of anchor from container). It's the concern shared across the whole overlay
 * family (modal, popover, tooltip, toast, drag preview), and it may actually be
 * two moves rather than one: "escape the container" (spatial — popover, dropdown)
 * versus "ascend to app level" (scope — modal, toast). Portal-the-mechanism is
 * only its plumbing. If we capture the pattern, this file is the plumbing it
 * points down to, not the pattern itself. See Utilities/Portal in Storybook.
 */

export interface PortalOptions {
  /** Where to mount the element. Defaults to `document.body`. */
  root?: HTMLElement;
  /**
   * Leave a placeholder at the original position so {@link PortalHandle.restore}
   * can put the element back exactly where it was. Defaults to `true`.
   */
  restorable?: boolean;
}

export interface PortalHandle {
  /** The element that was moved. */
  readonly element: HTMLElement;
  /** The root the element was moved into. */
  readonly root: HTMLElement;
  /**
   * Move the element back to its original DOM position. No-op when the portal was
   * created with `restorable: false` or the original site is gone.
   */
  restore(): void;
  /** Remove the element from the DOM entirely and drop the placeholder. */
  destroy(): void;
}

/**
 * Move `element` into `root` (default `document.body`), returning a handle that
 * can restore it to its original position or remove it.
 */
export function portal(element: HTMLElement, options: PortalOptions = {}): PortalHandle {
  const { root = document.body, restorable = true } = options;

  // Mark the original position with a comment node so we can restore into it even
  // if surrounding siblings change while the element is elsewhere.
  const placeholder = restorable && element.parentNode
    ? element.parentNode.insertBefore(document.createComment('portal'), element)
    : null;

  root.appendChild(element);

  return {
    element,
    root,

    restore() {
      if (placeholder?.parentNode) {
        placeholder.parentNode.insertBefore(element, placeholder);
        placeholder.remove();
      }
    },

    destroy() {
      element.remove();
      placeholder?.remove();
    },
  };
}
