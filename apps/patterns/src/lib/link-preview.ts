import { computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import { useStackStore, validSlugs } from './stack-store';
import { getPaneContent } from './pane-content';

const SHOW_DELAY = 350;
const HIDE_DELAY = 250;

let previewEl: HTMLElement | null = null;
let currentAnchor: HTMLAnchorElement | null = null;
let pendingAnchor: HTMLAnchorElement | null = null;
let showTimer: number | undefined;
let hideTimer: number | undefined;
let scrollCleanup: (() => void) | null = null;
let showGeneration = 0;
const prefetchCache = new Map<string, Promise<string>>();

function getPreviewEl(): HTMLElement {
  if (!previewEl || !previewEl.isConnected) {
    previewEl = document.createElement('div');
    previewEl.className = 'link-preview';
    previewEl.id = 'lp-popover';
    previewEl.popover = 'manual';
    previewEl.setAttribute('role', 'tooltip');
    previewEl.addEventListener('mouseenter', cancelHide);
    previewEl.addEventListener('mouseleave', scheduleHide);
    previewEl.addEventListener('focusin', cancelHide);
    previewEl.addEventListener('focusout', scheduleHide);
    previewEl.addEventListener('click', handlePreviewClick, { capture: true });
    document.body.appendChild(previewEl);
  }
  return previewEl;
}

function resolveSlug(anchor: HTMLAnchorElement): string | null {
  // Skip table-of-contents in-page links.
  if (anchor.closest('pp-toc')) return null;
  // Skip search result links so previews don't overlap the results panel.
  if (anchor.closest('.pagefind-ui, pagefind-modal, .pf-result')) return null;
  // Skip anything inside a demo. A demo's links are its own subject matter, not
  // routes into the site — and the ones written `href="#"` resolve to the page
  // the demo is embedded in, so without this a reader hovering a demo gets a
  // preview of the page they are already reading.
  if (anchor.closest('.demo-block')) return null;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return null;
  if (!url.pathname.startsWith('/patterns/')) return null;
  const slug = url.pathname.replace(/^\/patterns\//, '').replace(/\/$/, '');
  return validSlugs.has(slug) ? slug : null;
}

function extractContent(html: string, title: string): string {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;

  const h1 = wrapper.querySelector('h1');
  const heading = h1?.textContent?.trim() ?? title;
  h1?.remove();

  // A hover preview is ephemeral, so it deliberately does not mount demos
  // (unlike stacked panes, see StackManager mountDemos). Drop demo blocks and
  // bare demo mount points (Mermaid diagrams) entirely rather than leave an
  // empty frame in view.
  wrapper.querySelectorAll('.demo-block, [data-demo]').forEach((el) => el.remove());

  return `<strong class="link-preview__title">${heading}</strong><div class="link-preview__body">${wrapper.innerHTML}</div>`;
}

async function fetchContent(slug: string): Promise<string> {
  try {
    const { title, html } = await getPaneContent(slug);
    return extractContent(html, title);
  } catch {
    return '';
  }
}

function prefetch(slug: string): Promise<string> {
  let pending = prefetchCache.get(slug);
  if (!pending) {
    pending = fetchContent(slug);
    prefetchCache.set(slug, pending);
  }
  return pending;
}

async function position(anchor: HTMLAnchorElement) {
  const preview = getPreviewEl();
  const padding = 8;

  preview.style.maxHeight = '';
  const { x, y } = await computePosition(anchor, preview, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(padding),
      flip(),
      shift({ padding }),
      size({
        padding,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${Math.max(0, availableHeight)}px`;
        },
      }),
    ],
  });
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;

  // Chrome can render top-layer popovers inside a scrolled .pane-body with a
  // shifted containing block, so style.top is interpreted with an offset from
  // the viewport. Measure and correct.
  const rect = preview.getBoundingClientRect();
  const dy = rect.top - y;
  const dx = rect.left - x;
  if (Math.abs(dy) > 1 || Math.abs(dx) > 1) {
    preview.style.top = `${y - dy}px`;
    preview.style.left = `${x - dx}px`;
  }
}

function watchScroll(anchor: HTMLAnchorElement) {
  scrollCleanup?.();
  const scrollable = anchor.closest('.pane-body') ?? anchor.closest('.content-inset');
  if (!scrollable) return;
  const handler = () => hide();
  scrollable.addEventListener('scroll', handler, { once: true, passive: true });
  scrollCleanup = () => scrollable.removeEventListener('scroll', handler);
}

async function show(anchor: HTMLAnchorElement, gen: number) {
  const slug = resolveSlug(anchor);
  if (!slug) return;

  const content = await prefetch(slug);
  if (gen !== showGeneration) return;
  if (!content) return;

  pendingAnchor = null;
  currentAnchor = anchor;
  const preview = getPreviewEl();
  preview.innerHTML = content;
  preview.scrollTop = 0;
  preview.style.visibility = 'hidden';
  preview.showPopover();
  await position(anchor);
  preview.style.visibility = '';
  anchor.setAttribute('aria-describedby', 'lp-popover');
  watchScroll(anchor);
}

function hide() {
  clearTimeout(showTimer);
  clearTimeout(hideTimer);
  ++showGeneration;
  scrollCleanup?.();
  scrollCleanup = null;

  pendingAnchor = null;
  currentAnchor?.removeAttribute('aria-describedby');
  currentAnchor = null;

  const el = getPreviewEl();
  try { el.hidePopover(); } catch {}
}

function cancelHide() {
  clearTimeout(hideTimer);
}

function scheduleHide() {
  clearTimeout(hideTimer);
  if (pendingAnchor && !currentAnchor) {
    clearTimeout(showTimer);
    ++showGeneration;
    pendingAnchor = null;
    return;
  }
  hideTimer = window.setTimeout(hide, HIDE_DELAY);
}

function scheduleShow(anchor: HTMLAnchorElement) {
  if (currentAnchor === anchor || pendingAnchor === anchor) { cancelHide(); return; }
  clearTimeout(showTimer);
  cancelHide();
  const slug = resolveSlug(anchor);
  if (slug) prefetch(slug);
  pendingAnchor = anchor;
  const gen = ++showGeneration;
  showTimer = window.setTimeout(() => show(anchor, gen), SHOW_DELAY);
}

function handlePreviewClick(e: Event) {
  const target = e.target as Element;
  const anchor = target.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!anchor) return;

  const slug = resolveSlug(anchor);
  if (!slug) return;

  e.preventDefault();
  e.stopPropagation();

  const originPane = currentAnchor?.closest('[data-pane-index]') as HTMLElement | null;
  const fromIndex = originPane ? parseInt(originPane.dataset.paneIndex ?? '0', 10) : 0;

  hide();

  const hash = new URL(anchor.href, location.href).hash || undefined;
  useStackStore.getState().push(slug, fromIndex, hash);
}

function preloadPageLinks() {
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (a.closest('[data-sidebar]')) continue;
    const slug = resolveSlug(a);
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 100));
  let i = 0;
  function pump() {
    const start = performance.now();
    while (i < slugs.length && performance.now() - start < 5) {
      prefetch(slugs[i++]);
    }
    if (i < slugs.length) idle(pump);
  }
  idle(pump);
}

if (typeof document !== 'undefined') {
  const isTouchDevice = () => matchMedia('(hover: none)').matches;

  document.addEventListener('mouseover', (e) => {
    if (isTouchDevice()) return;
    const target = e.target as Element;
    const anchor = target.closest?.('a[href]') as HTMLAnchorElement | null;

    if (!anchor || !resolveSlug(anchor) || anchor.closest?.('[data-sidebar]')) {
      if ((currentAnchor || pendingAnchor) && !target.closest?.('.link-preview')) {
        scheduleHide();
      }
      return;
    }

    scheduleShow(anchor);
  });

  document.addEventListener('focusin', (e) => {
    const target = e.target as Element;
    if (
      target.tagName === 'A' &&
      resolveSlug(target as HTMLAnchorElement) &&
      !target.closest?.('[data-sidebar]')
    ) {
      scheduleShow(target as HTMLAnchorElement);
    }
  });

  document.addEventListener('focusout', () => {
    if (currentAnchor || pendingAnchor) scheduleHide();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && currentAnchor) {
      e.stopPropagation();
      hide();
    }
  });

  document.addEventListener('astro:page-load', () => preloadPageLinks());
  preloadPageLinks();
}
