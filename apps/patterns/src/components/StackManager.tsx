import React, { memo, useEffect, useRef } from 'react';
import { findOpenPane, singlePaneQuery, stackablePath, useStackStore, type Pane } from '../lib/stack-store';
import { addDescribedBy, removeDescribedBy } from '../lib/describedby';
import { panePath, paneKindOf } from '../lib/pane-path';
import { mountDemos } from '../lib/demo-registry';

interface StackManagerProps {
  slug: string;
  title: string;
  path?: string;
}

// Read from the custom property: a .pane-spine is display:none until its pane
// collapses, so it cannot be measured.
function getSpineWidth(stackEl: HTMLElement): number {
  const raw = getComputedStyle(stackEl).getPropertyValue('--pane-spine-w').trim();
  const value = parseFloat(raw);
  if (!value) return 28;
  if (raw.endsWith('rem')) {
    const root = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    return value * root;
  }
  return value; // assume px
}

// Geometry is pure-CSS sticky; this only reflects what is painted, for the
// stylesheet to key off: data-collapsed when no more than a spine's worth of
// the pane shows, data-overlapping when the pane actually overlays its
// predecessor (never for panes merely side by side).
function updateStackClasses(stackEl: HTMLElement) {
  const panes = [...stackEl.querySelectorAll<HTMLElement>('[data-pane-index]')];
  if (!panes.length) return;
  const spineW = getSpineWidth(stackEl);
  const stack = stackEl.getBoundingClientRect();
  const rects = panes.map((p) => p.getBoundingClientRect());

  panes.forEach((pane, i) => {
    const r = rects[i];
    // A later pane covers this one; the viewport clips both edges.
    const coveredRight = i + 1 < rects.length ? rects[i + 1].left : stack.right;
    const visible = Math.min(r.right, stack.right, coveredRight) - Math.max(r.left, stack.left);
    const collapsed = visible <= spineW + 4;
    // 1px slack so a side-by-side border seam does not count as overlap.
    const overlapping = i > 0 && r.left < rects[i - 1].right - 1;
    pane.toggleAttribute('data-collapsed', collapsed);
    pane.toggleAttribute('data-overlapping', overlapping);
  });
}

// Natural (un-stuck) left offset of a pane, summed from preceding pane widths.
// offsetLeft can't be used: for a sticky pane it reports the *shifted* position.
function naturalLeft(sections: HTMLElement[], paneIndex: number): number {
  let acc = 0;
  for (let i = 0; i < paneIndex && i < sections.length; i++) acc += sections[i].offsetWidth;
  return acc;
}

function scrollToPane(stackEl: HTMLElement, paneIndex: number) {
  const sections = [...stackEl.querySelectorAll<HTMLElement>('[data-pane-index]')];
  if (!sections.length) return;
  const spineW = getSpineWidth(stackEl);
  const max = stackEl.scrollWidth - stackEl.clientWidth;
  const target = naturalLeft(sections, paneIndex) - paneIndex * spineW;
  stackEl.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: 'smooth' });
}

// The element a pane's `#fragment` names. The fragment comes from the URL, so
// it may be percent-encoded, start with a digit, or be malformed.
function findAnchor(paneEl: HTMLElement | null | undefined, hash: string): HTMLElement | null {
  try {
    return paneEl?.querySelector<HTMLElement>(`#${CSS.escape(decodeURIComponent(hash.slice(1)))}`) ?? null;
  } catch {
    return null;
  }
}

// Not scrollIntoView: it also scrolls .stack horizontally and fights the
// smooth scroll from scrollToPane. The target's scroll-margin is honoured as
// scrollIntoView would.
function scrollBodyTo(paneBody: HTMLElement, target: HTMLElement, behavior: ScrollBehavior) {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const top = target.getBoundingClientRect().top - paneBody.getBoundingClientRect().top + paneBody.scrollTop - margin;
  paneBody.scrollTo({ top, behavior });
}

// One description shared by every marked link (see markOpenLinks).
const OPEN_DESC_ID = 'stack-open-desc';

// The open pane a link in pane `own` would go to, or -1 when following it
// would open something new. A link to its own pane is not counted: it stays
// where it is.
function openTargetIndex(anchor: HTMLAnchorElement, panes: Pane[], own: number): number {
  if (anchor.getAttribute('href')?.startsWith('#')) return -1;
  if (anchor.closest('.demo-block, pp-toc')) return -1;
  const path = stackablePath(new URL(anchor.href, location.href));
  if (!path) return -1;
  const index = findOpenPane(panes, path, own);
  return index === own ? -1 : index;
}

// Mark links whose page is already open, so the actor can tell before
// clicking that the link moves the view rather than opens something.
// data-in-stack carries the direction; data-in-stack-pane the target, for the
// hover highlight. In the single-pane layout every link is a plain
// navigation, so nothing is marked.
function markOpenLinks(stackEl: HTMLElement, panes: Pane[]) {
  const singlePane = singlePaneQuery?.matches ?? false;
  for (const anchor of stackEl.querySelectorAll<HTMLAnchorElement>('[data-pane-index] a[href]')) {
    const own = parseInt(anchor.closest<HTMLElement>('[data-pane-index]')?.dataset.paneIndex ?? '0', 10);
    const target = singlePane ? -1 : openTargetIndex(anchor, panes, own);
    if (target === -1) {
      if (!anchor.hasAttribute('data-in-stack')) continue;
      anchor.removeAttribute('data-in-stack');
      anchor.removeAttribute('data-in-stack-pane');
      removeDescribedBy(anchor, OPEN_DESC_ID);
    } else {
      anchor.dataset.inStack = target < own ? 'left' : 'right';
      anchor.dataset.inStackPane = String(target);
      addDescribedBy(anchor, OPEN_DESC_ID);
    }
  }
}

// React 19 compares the dangerouslySetInnerHTML object by identity, so an
// unmemoised article would have its HTML rewritten on every StackManager
// render, wiping mounted demos, link marks, and anything else scripts added.
const PaneArticle = memo(function PaneArticle({ html }: { html: string }) {
  return <article className="pane-article" dangerouslySetInnerHTML={{ __html: html }} />;
});

// Markup twin of the static pane-0 spine in Base.astro. No click handler: every
// spine is served by the one delegated listener on the stack below.
function PaneSpine({ paneTitle }: { paneTitle: string }) {
  return (
    <button className="pane-spine" aria-label={`Scroll ${paneTitle} into view`}>
      <span aria-hidden="true">{paneTitle}</span>
    </button>
  );
}

// Renders panes 1+ as a sibling island inside the static .stack that Base.astro
// renders along with pane 0 (<astro-island> is display:contents, so the sections
// take part in the stack's flex geometry directly). Pane 0's stack-dependent
// state is reflected onto the static DOM by attribute.
export function StackManager({ slug, title, path }: StackManagerProps) {
  const { panes, activeIndex, reveal, syncFromURL } = useStackStore();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const prevPanesRef = useRef<typeof panes>([]);
  // The store outlives a soft navigation, so the first render after one still
  // holds the previous page's panes and its last reveal. Effects that act on
  // them skip until they belong to this page.
  const initialRevealRef = useRef(useStackStore.getState().reveal);

  // The hidden anchor (display:none, so inert to flex) is the island's stable
  // handle back to the .stack it lives in.
  const getStack = () =>
    anchorRef.current?.closest<HTMLElement>('.stack') ?? null;

  const path0 = path ?? panePath('pattern', slug);

  useEffect(() => {
    syncFromURL(path0, title);
    const handlePopstate = () => syncFromURL(path0, title);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [path0, title, syncFromURL]);

  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl) return;
    stackEl.style.setProperty('--pane-n', String(Math.max(panes.length, 1)));
    const pane0 = stackEl.querySelector<HTMLElement>('[data-pane-index="0"]');
    if (!pane0) return;
    const active = activeIndex === 0;
    pane0.classList.toggle('pane--active', active);
    if (active) pane0.setAttribute('aria-current', 'true');
    else pane0.removeAttribute('aria-current');
  }, [panes.length, activeIndex]);

  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl) return;
    const onClick = (event: MouseEvent) => {
      const spine = (event.target as Element).closest?.('.pane-spine');
      if (!spine) return;
      const section = spine.closest<HTMLElement>('[data-pane-index]');
      if (!section) return;
      scrollToPane(stackEl, parseInt(section.dataset.paneIndex ?? '0', 10));
    };
    stackEl.addEventListener('click', onClick);
    return () => stackEl.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl || panes.length <= 1) return;
    scrollToPane(stackEl, panes.length - 1);
  }, [panes.length]);

  // Going to an open pane: bring it into view, then its anchor if the link
  // named one. Runs after the render that made it active, so in the
  // single-pane layout the pane is already displayed when its body scrolls.
  // Focus follows, as it does for a pushed pane: the link that was clicked
  // may now sit under another pane, or be hidden in the single-pane layout.
  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl || !reveal || reveal === initialRevealRef.current) return;
    scrollToPane(stackEl, reveal.index);
    const paneEl = stackEl.querySelector<HTMLElement>(`[data-pane-index="${reveal.index}"]`);
    const paneBody = paneEl?.querySelector<HTMLElement>('.pane-body');
    const target = reveal.hash ? findAnchor(paneEl, reveal.hash) : null;
    if (paneBody && target) scrollBodyTo(paneBody, target, 'smooth');
    const focusEl = target ?? paneEl?.querySelector<HTMLElement>('h1');
    if (!focusEl) return;
    if (!focusEl.matches('a[href], button, input, select, textarea, [tabindex]')) focusEl.tabIndex = -1;
    // preventScroll: a focus scroll would cancel the smooth scrolls above.
    focusEl.focus({ preventScroll: true });
  }, [reveal]);

  useEffect(() => {
    const stackEl = getStack();
    if (stackEl) markOpenLinks(stackEl, panes);
  }, [panes]);

  // Crossing the single-pane breakpoint turns the marks on or off.
  useEffect(() => {
    const onChange = () => {
      const stackEl = getStack();
      if (stackEl) markOpenLinks(stackEl, useStackStore.getState().panes);
    };
    singlePaneQuery?.addEventListener('change', onChange);
    return () => singlePaneQuery?.removeEventListener('change', onChange);
  }, []);

  // Hovering or focusing a marked link points out the pane it goes to.
  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl) return;
    const clear = () => {
      for (const el of stackEl.querySelectorAll('[data-link-target]')) el.removeAttribute('data-link-target');
    };
    const onEnter = (event: Event) => {
      const anchor = (event.target as Element).closest?.<HTMLAnchorElement>('a[data-in-stack]');
      if (!anchor) return;
      clear();
      stackEl.querySelector(`[data-pane-index="${anchor.dataset.inStackPane}"]`)?.setAttribute('data-link-target', '');
    };
    const onLeave = (event: Event) => {
      if ((event.target as Element).closest?.('a[data-in-stack]')) clear();
    };
    stackEl.addEventListener('mouseover', onEnter);
    stackEl.addEventListener('focusin', onEnter);
    stackEl.addEventListener('mouseout', onLeave);
    stackEl.addEventListener('focusout', onLeave);
    return () => {
      stackEl.removeEventListener('mouseover', onEnter);
      stackEl.removeEventListener('focusin', onEnter);
      stackEl.removeEventListener('mouseout', onLeave);
      stackEl.removeEventListener('focusout', onLeave);
    };
  }, []);

  // Focus the pushed pane's h1 on its ready transition, not on pane count: at
  // push time the pane is a loading placeholder with no h1.
  useEffect(() => {
    if (panes.length <= 1) return;
    const lastIndex = panes.length - 1;
    const last = panes[lastIndex];
    if (last.status !== 'ready') return;
    if (prevPanesRef.current[lastIndex]?.status === 'ready') return;
    // h1.focus() would cancel the hash-scroll effect's scroll to the anchor.
    if (last.hash) return;
    const h1 = getStack()?.querySelector<HTMLElement>(`[data-pane-index="${lastIndex}"] h1`);
    if (h1) {
      h1.tabIndex = -1;
      setTimeout(() => h1.focus(), 0);
    }
  }, [panes]);

  useEffect(() => {
    const stackEl = getStack();
    if (!stackEl) return;
    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        updateStackClasses(stackEl);
      });
    };
    updateStackClasses(stackEl);
    stackEl.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    // Catches width changes that fire no scroll or resize event: a demo
    // expanding its host pane, or settling its size after mounting.
    const ro = new ResizeObserver(schedule);
    for (const pane of stackEl.querySelectorAll('[data-pane-index]')) ro.observe(pane);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      stackEl.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [panes]);

  useEffect(() => {
    panes.slice(1).forEach((pane, i) => {
      if (pane.status !== 'ready') return;
      if (prevPanesRef.current[i + 1]?.status === 'ready') return;
      const article = getStack()?.querySelector<HTMLElement>(
        `[data-pane-index="${i + 1}"] .pane-body > article`,
      );
      if (article) mountDemos(article);
    });
  }, [panes]);

  useEffect(() => {
    const stackEl = getStack();
    if (panes[0]?.path !== path0) return;
    // Pane 0 included: the browser's own fragment scroll does not survive a
    // reload once other panes are stacked beside it.
    panes.forEach((pane, i) => {
      if (!pane.hash || pane.status !== 'ready') return;
      if (prevPanesRef.current[i]?.status === 'ready') return;
      const paneEl = stackEl?.querySelector<HTMLElement>(`[data-pane-index="${i}"]`);
      const paneBody = paneEl?.querySelector<HTMLElement>('.pane-body');
      const target = findAnchor(paneEl, pane.hash);
      if (!paneBody || !target) return;
      // 'instant' avoids competing with the smooth scroll from scrollToPane.
      scrollBodyTo(paneBody, target, 'instant');
    });
    prevPanesRef.current = panes;
  }, [panes, path0]);

  return (
    <>
      <span ref={anchorRef} hidden data-stack-anchor=""></span>
      <span id={OPEN_DESC_ID} hidden>Already open</span>
      {panes.slice(1).map((pane, i) => {
        const paneIndex = i + 1;
        const isActive = paneIndex === activeIndex;
        const kind = paneKindOf(pane.path) === 'sequence' ? 'Sequence' : 'Pattern';
        return (
          <section
            // Index as well as path: a shared URL can list the same page twice.
            key={`${paneIndex}:${pane.path}`}
            className={`pane${isActive ? ' pane--active' : ''}`}
            data-pane-index={paneIndex}
            style={{ '--pane-i': paneIndex } as React.CSSProperties}
            role="region"
            aria-label={`${kind}: ${pane.title}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <PaneSpine paneTitle={pane.title} />
            <div className="pane-body">
              {pane.status === 'loading' && (
                <article className="pane-loading" aria-busy="true">
                  <p>Loading…</p>
                </article>
              )}
              {pane.status === 'error' && (
                <article className="pane-error">
                  <p>Failed to load {kind.toLowerCase()}.</p>
                </article>
              )}
              {pane.status === 'ready' && (
                <PaneArticle html={pane.html} />
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
