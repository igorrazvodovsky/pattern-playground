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

function renderList(nodes: TocNode[], lead = ''): string {
  const items = nodes
    .map(
      (node) =>
        `<li><a class="toc-link" href="#${escapeHTML(node.id)}">${escapeHTML(node.text)}</a>${
          node.children.length ? renderList(node.children) : ''
        }</li>`
    )
    .join('');
  return `<ul>${lead}${items}</ul>`;
}

/**
 * @summary Builds a table of contents from the headings around it, kept in sync as late content hydrates.
 * @status draft
 * @since 0.0.1
 *
 * @attr nested - Include h2–h6 and nest by level. Otherwise h2 only, flat.
 * @attr level - Override the heading selector (e.g. "h2, h3").
 * @attr heading - Accessible label for the contents navigation.
 * @attr target - CSS selector for the element to scan instead of the closest article.
 * @attr orientation - "vertical" stacks entries and indents nested levels; default is inline/horizontal.
 */

export class PpToc extends HTMLElement {
  private observer: MutationObserver | null = null;
  private rafId = 0;
  private signature = '';

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
  }

  private init() {
    this.addEventListener('click', this.handleClick);
    this.build();
    const target = this.scope();
    if (target instanceof Element) {
      this.observer = new MutationObserver(() => this.schedule());
      this.observer.observe(target, { childList: true, subtree: true });
    }
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
    // Skip headings tucked inside collapsible/dialog widgets
    const selector = `:is(${level}):not(:is(details, dialog) :is(${level}))`;
    const headings = [...target.querySelectorAll<HTMLElement>(selector)].filter(
      (h) => !this.contains(h)
    );

    const entries: TocEntry[] = [];
    for (const h of headings) {
      setTextAsID(h);
      const text = h.textContent?.trim() ?? '';
      if (h.id && text) entries.push({ id: h.id, text, level: parseInt(h.tagName.slice(1), 10) });
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
    this.innerHTML = `<nav class="toc" aria-label="${label}">${renderList(
      buildTree(entries),
    )}</nav>`;
  }

  private handleClick = (event: MouseEvent) => {
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
