import { setTextAsID } from '../../utility/heading-id.ts';

const DEFAULT_LEVELS = 'h2, h3, h4, h5, h6';

// Headings left alone: demo islands; headings that already hold a link or
// control, which a link cannot wrap; headings pp-sections turns into tab or
// disclosure triggers; headings inside a summary, which is itself a control;
// and any subtree opted out with data-anchor-ignore.
const EXCLUDED = '.demo-block, pp-sections, summary, [data-anchor-ignore]';

/**
 * @summary Turns each heading's text into a link to its own section, so an actor can copy or share a link that lands on it.
 * @status draft
 * @since 0.0.1
 *
 * @attr levels - Selector for the headings to enhance. Default "h2, h3, h4, h5, h6".
 * @attr scope - Selector for an ancestor to enhance instead of this element's own content,
 *   resolved with `closest()`. With no matching ancestor, nothing is enhanced.
 * @attr placement - "start" hangs the mark in the margin before the heading text; default is after it.
 *   Not Kelp's boolean `before`: that name is a DOM method, which React would overwrite as a property.
 *
 * Rung 2: the element renders nothing itself. In each heading it moves the
 * existing child nodes into one `<a class="heading-anchor">`, so node identity
 * survives and the heading's text, and its textContent, are unchanged. A heading
 * without an id gets one from its text. Headings that arrive later (island
 * hydration) are picked up by a mutation observer.
 */
export class PpHeadingAnchors extends HTMLElement {
  private observer: MutationObserver | null = null;
  private rafId = 0;
  private watched: Element | null = null;

  connectedCallback() {
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', this.init, { once: true });
  }

  disconnectedCallback() {
    document.removeEventListener('DOMContentLoaded', this.init);
    this.teardown();
  }

  private init = () => {
    // A reconnect while the document is loading can queue init twice, and an
    // element removed before DOMContentLoaded must not start at all.
    this.teardown();
    if (!this.isConnected) return;
    const root = this.root();
    if (!root) return;
    this.enhance(root);
    this.watched = root;
    root.addEventListener('click', this.keepSelection);
    this.observer = new MutationObserver(() => this.schedule());
    this.observer.observe(root, { childList: true, subtree: true });
  };

  private teardown() {
    this.observer?.disconnect();
    this.observer = null;
    this.watched?.removeEventListener('click', this.keepSelection);
    this.watched = null;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
  }

  // Releasing a drag-selection inside the link still clicks it. Following the
  // link then would scroll away from the text the actor is about to copy.
  private keepSelection = (event: Event) => {
    const link = (event.target as Element).closest?.('a.heading-anchor');
    if (link && hasSelectionWithin(link)) event.preventDefault();
  };

  private root(): Element | null {
    const scope = this.getAttribute('scope');
    return scope ? this.closest(scope) : this;
  }

  // Coalesce bursts of mutations into one pass. The pass's own wrapping
  // mutates the subtree too, but finds nothing left to do and stops there.
  private schedule() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      const root = this.root();
      if (root) this.enhance(root);
    });
  }

  private enhance(root: Element) {
    const levels = this.getAttribute('levels') || DEFAULT_LEVELS;
    const selector = `:is(${levels}):not(:is(${EXCLUDED}) *, ${EXCLUDED})`;
    for (const heading of root.querySelectorAll<HTMLElement>(selector)) {
      if (
        heading.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
      )
        continue;
      if (!heading.textContent?.trim()) continue;
      setTextAsID(heading);
      if (heading.id) this.wrap(heading);
    }
  }

  private wrap(heading: HTMLElement) {
    const link = document.createElement('a');
    // A class rather than a selector on this element: with `scope` set, the
    // headings are not inside it.
    link.className =
      this.getAttribute('placement') === 'start'
        ? 'heading-anchor heading-anchor--start'
        : 'heading-anchor';
    link.href = `#${heading.id}`;
    // A link would otherwise start a drag, not a text selection, when the
    // actor drags across the heading to copy part of it.
    link.draggable = false;
    link.append(...heading.childNodes);
    heading.append(link);
  }
}

/** True when the actor has a non-empty text selection that starts or ends inside `el`. */
export function hasSelectionWithin(el: Element): boolean {
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed) return false;
  return [selection.anchorNode, selection.focusNode].some((node) => !!node && el.contains(node));
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-heading-anchors': PpHeadingAnchors;
  }
}
