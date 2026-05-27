import { computePosition, flip, offset, shift, size } from '@floating-ui/dom';
import { useStackStore, validSlugs } from './stack-store';

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

  return `<strong class="link-preview__title">${heading}</strong><div class="link-preview__body">${wrapper.innerHTML}</div>`;
}

async function fetchContent(slug: string): Promise<string> {
  const storeCache = useStackStore.getState().cache;
  const cached = storeCache.get(slug);
  if (cached?.html) return extractContent(cached.html, cached.title);

  const res = await fetch(`/patterns/${slug}/`);
  if (!res.ok) return '';

  const text = await res.text();
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const tmpl = doc.querySelector('template[data-astro-template]') as HTMLTemplateElement | null;
  const root: ParentNode = tmpl ? tmpl.content : doc;
  const article = root.querySelector('article');
  if (!article) return '';

  const title = article.querySelector('h1')?.textContent?.trim() ?? slug;
  const html = article.innerHTML;

  storeCache.set(slug, { slug, title, html, status: 'ready' });
  return extractContent(html, title);
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
  const { x, y } = await computePosition(anchor, preview, {
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableHeight, elements }) {
          elements.floating.style.maxHeight = `${availableHeight}px`;
        },
      }),
    ],
  });
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;
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
  preview.style.top = '-9999px';
  preview.style.left = '0px';
  preview.showPopover();
  await position(anchor);
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
  for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    if (a.closest('[data-sidebar]')) continue;
    const slug = resolveSlug(a);
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      prefetch(slug);
    }
  }
}

if (typeof document !== 'undefined') {
  const isTouchDevice = () => matchMedia('(hover: none)').matches;

  document.addEventListener('mouseover', (e) => {
    if (isTouchDevice()) return;
    const target = e.target as Element;
    const anchor = target.closest?.('a[href]') as HTMLAnchorElement | null;

    if (!anchor || !resolveSlug(anchor) || anchor.closest?.('[data-sidebar]')) {
      if (currentAnchor && !target.closest?.('.link-preview')) {
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
    if (currentAnchor) scheduleHide();
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
