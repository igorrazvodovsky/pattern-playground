import { setTextAsID } from '../../utility/heading-id.ts';

function escapeHTML(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

interface TocNode extends TocEntry {
  children: TocNode[];
}

// Fold the flat, source-order list of headings into a tree by comparing levels:
// a heading deeper than the one before it becomes that heading's child.
function buildTree(entries: TocEntry[]): TocNode[] {
  const root: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const entry of entries) {
    const node: TocNode = { ...entry, children: [] };
    while (stack.length && stack[stack.length - 1].level >= entry.level) stack.pop();
    (stack[stack.length - 1]?.children ?? root).push(node);
    stack.push(node);
  }
  return root;
}

function renderList(nodes: TocNode[]): string {
  const items = nodes
    .map(
      (node) =>
        `<li><a class="toc-link" href="#${escapeHTML(node.id)}">${escapeHTML(node.text)}</a>${
          node.children.length ? renderList(node.children) : ''
        }</li>`
    )
    .join('');
  return `<ul>${items}</ul>`;
}

// The nearest ancestor that scrolls vertically; null means the document does.
function scrollParent(el: Element): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
}

// How long a pointer must rest on the contents bar before it expands. A
// pointer crossing the bar on its way to something else passes in less.
const EXPAND_DELAY_MS = 120;

/**
 * @summary Builds a table of contents from the headings around it, kept in sync as late content hydrates.
 * @status draft
 * @since 0.0.1
 *
 * @attr nested - Include h2–h6 and nest by level. Otherwise h2 only, flat.
 * @attr level - Override the heading selector (e.g. "h2, h3").
 * @attr heading - Accessible label for the contents navigation.
 * @attr target - CSS selector for the element to scan instead of the closest article.
 *   Headings inside an element carrying `data-toc-ignore` are skipped.
 * @attr orientation - "vertical" stacks entries and indents nested levels; default is inline/horizontal.
 * @attr variant - "bar": a one-line sticky bar with the scope's h1 as its title and each section
 *   as a dot, the current section labelled. It sets `data-expanded` once a mouse has rested
 *   on it, which shows every label, and `data-revealed` as described under `reveal-after`.
 * @attr reveal-after - Bar variant: CSS selector, resolved inside the scope, for the element the
 *   bar waits on. The bar is revealed once that element has scrolled out of view, so it can stay
 *   out of the way while the full contents are on screen; it stays hidden while the element has
 *   no box. Without it, the bar is always revealed.
 */

export class PpToc extends HTMLElement {
  private observer: MutationObserver | null = null;
  private rafId = 0;
  private signature = '';
  private headings: HTMLElement[] = [];
  private links: HTMLAnchorElement[] = [];
  // Re-resolved on every track(), so a scroller whose overflow is set after
  // connect, or a layout that moves scrolling elsewhere, is still followed.
  private scroller: HTMLElement | null = null;
  private trackId = 0;
  private current = -1;
  private expandId = 0;

  connectedCallback() {
    if (document.readyState !== 'loading') {
      this.init();
      return;
    }
    document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = null;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('pointerup', this.settle);
    this.removeEventListener('pointerenter', this.hoverIn);
    this.removeEventListener('pointerleave', this.hoverOut);
    this.collapse();
    this.stopTracking();
  }

  private init() {
    this.addEventListener('click', this.handleClick);
    this.build();
    const target = this.scope();
    if (target instanceof Element) {
      this.observer = new MutationObserver(() => this.schedule());
      this.observer.observe(target, { childList: true, subtree: true });
    }
    if (this.isBar) this.startTracking();
  }

  private get isBar(): boolean {
    return this.getAttribute('variant') === 'bar';
  }

  private get nested(): boolean {
    return this.hasAttribute('nested');
  }

  private get levelSelector(): string {
    return this.getAttribute('level') || (this.nested ? 'h2, h3, h4, h5, h6' : 'h2');
  }

  private scope(): ParentNode {
    const sel = this.getAttribute('target');
    if (sel) return document.querySelector(sel) ?? document;
    return this.closest('article') ?? document;
  }

  // Coalesce bursts of mutations (island hydration fires many) into one rebuild.
  private schedule() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.build();
    });
  }

  private build() {
    const target = this.scope();
    const level = this.levelSelector;
    // Skip headings tucked inside collapsible/dialog widgets, demo islands, or
    // any subtree opted out with data-toc-ignore
    const selector = `:is(${level}):not(:is(details, dialog, .demo-block, [data-toc-ignore]) :is(${level}))`;
    const headings = [...target.querySelectorAll<HTMLElement>(selector)].filter(
      (h) => !this.contains(h)
    );

    const entries: TocEntry[] = [];
    this.headings = [];
    for (const h of headings) {
      setTextAsID(h);
      const text = h.textContent?.trim() ?? '';
      if (!h.id || !text) continue;
      entries.push({ id: h.id, text, level: parseInt(h.tagName.slice(1), 10) });
      this.headings.push(h);
    }

    // Re-render only when the set of headings actually changed. This also breaks
    // the observer feedback loop: rendering our own <a>s mutates the watched
    // subtree, but it adds no headings, so the signature is stable and we bail.
    const sig = entries.map((e) => `${e.level}:${e.id}`).join('|');
    if (sig === this.signature) return;
    this.signature = sig;
    this.render(entries);
  }

  private render(entries: TocEntry[]) {
    if (!entries.length) {
      this.innerHTML = '';
      this.toggleAttribute('hidden', true);
      return;
    }
    this.toggleAttribute('hidden', false);
    const title = this.getAttribute('heading');
    const label = title ? escapeHTML(title) : 'Table of contents';
    if (!this.isBar) {
      this.innerHTML = `<nav class="toc" aria-label="${label}">${renderList(buildTree(entries))}</nav>`;
      return;
    }
    const name = this.titleHeading()?.textContent?.trim();
    const titleButton = name
      ? `<button type="button" class="toc-title" data-toc-top title="Back to top">${escapeHTML(name)}</button>`
      : '';
    this.innerHTML = `<nav class="toc" aria-label="${label}">${titleButton}${renderList(buildTree(entries))}</nav>`;
    this.links = [...this.querySelectorAll<HTMLAnchorElement>('nav a[href]')];
    this.current = -1;
    this.track();
  }

  // Bar variant: follow the scroll position of whatever scrolls this element.
  // Scroll events do not bubble, so one capturing listener on the document
  // hears every scroller without having to know in advance which it is.
  private startTracking() {
    this.addEventListener('pointerup', this.settle);
    this.addEventListener('pointerenter', this.hoverIn);
    this.addEventListener('pointerleave', this.hoverOut);
    document.addEventListener('scroll', this.onScroll, { capture: true, passive: true });
    window.addEventListener('resize', this.scheduleTrack);
    this.track();
  }

  private stopTracking() {
    document.removeEventListener('scroll', this.onScroll, { capture: true });
    window.removeEventListener('resize', this.scheduleTrack);
    if (this.trackId) cancelAnimationFrame(this.trackId);
    this.trackId = 0;
  }

  // Choosing a section collapses the hover-expanded bar, so it does not cover
  // the heading it just scrolled to; it expands again once the pointer has
  // left and come back. On pointerup rather than click, because a host may
  // stop the click; not on pointerdown, which would move the link from under
  // the pointer before the click lands.
  private settle = (event: PointerEvent) => {
    if ((event.target as Element).closest('a[href]')) this.toggleAttribute('data-settled', true);
  };

  // Bar variant, mouse only: expand once the pointer has rested here, so
  // crossing the bar does not open it over the text. Touch and pen are left
  // out because a tap would leave the bar open.
  private hoverIn = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    clearTimeout(this.expandId);
    this.expandId = window.setTimeout(() => this.toggleAttribute('data-expanded', true), EXPAND_DELAY_MS);
  };

  private hoverOut = () => {
    this.collapse();
    this.removeAttribute('data-settled');
  };

  private collapse() {
    clearTimeout(this.expandId);
    this.expandId = 0;
    this.removeAttribute('data-expanded');
  }

  // Only scrolling that can move this element matters: the document's, or an
  // ancestor's. Other panes scrolling are ignored.
  private onScroll = (event: Event) => {
    const source = event.target;
    if (source === document || (source instanceof Node && source.contains(this))) this.scheduleTrack();
  };

  private scheduleTrack = () => {
    if (this.trackId) return;
    this.trackId = requestAnimationFrame(() => {
      this.trackId = 0;
      this.track();
    });
  };

  // Reveal the bar once the reveal-after element has left the top of the
  // scrollport, and mark the section being read: the last one whose heading
  // has passed the top quarter, or the last one outright at the end.
  private track() {
    const root = (this.scroller = scrollParent(this));
    const top = root ? root.getBoundingClientRect().top + root.clientTop : 0;
    const height = root ? root.clientHeight : window.innerHeight;

    const revealed = this.passedRevealTarget(top);
    this.toggleAttribute('data-revealed', revealed);
    if (!revealed) this.collapse();

    const scrolled = root ?? document.scrollingElement;
    const atEnd = !!scrolled && scrolled.scrollTop + scrolled.clientHeight >= scrolled.scrollHeight - 2;
    const line = atEnd ? top + height : top + height / 4;
    let current = -1;
    this.headings.forEach((h, i) => {
      if (h.getBoundingClientRect().top <= line) current = i;
    });
    if (current === this.current) return;
    this.links[this.current]?.removeAttribute('aria-current');
    this.links[current]?.setAttribute('aria-current', 'location');
    this.current = current;
  }

  private passedRevealTarget(top: number): boolean {
    const sel = this.getAttribute('reveal-after');
    if (!sel) return true;
    const target = this.scope().querySelector(sel);
    // A target with no box (hidden, display: none) has no position to pass.
    if (!target || !target.getClientRects().length) return false;
    return target.getBoundingClientRect().bottom <= top;
  }

  // The scope's own title, not one inside this element.
  private titleHeading(): HTMLElement | undefined {
    return [...this.scope().querySelectorAll<HTMLElement>('h1')].find((h) => !this.contains(h));
  }

  private handleClick = (event: MouseEvent) => {
    if ((event.target as Element).closest('[data-toc-top]')) {
      (this.scroller ?? window).scrollTo({ top: 0, behavior: 'smooth' });
      // The bar hides at the top; focus goes to the title it stood in for.
      const h1 = this.titleHeading();
      if (h1) {
        if (!h1.hasAttribute('tabindex')) h1.tabIndex = -1;
        h1.focus({ preventScroll: true });
      }
      return;
    }
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a.toc-link');
    if (!anchor || !this.contains(anchor)) return;
    const id = anchor.getAttribute('href')?.slice(1);
    if (!id) return;
    const scope = this.scope();
    const target =
      (scope.querySelector?.(`#${CSS.escape(id)}`) as HTMLElement | null) ??
      document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.replaceState(history.state, '', `#${id}`);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'pp-toc': PpToc;
  }
}
