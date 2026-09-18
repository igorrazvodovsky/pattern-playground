import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';
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
  const { panes, activeIndex, syncFromURL } = useStackStore();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const prevPanesRef = useRef<typeof panes>([]);

  // The hidden anchor (display:none, so inert to flex) is the island's stable
  // handle back to the .stack it lives in.
  const getStack = () =>
    anchorRef.current?.closest<HTMLElement>('.stack') ?? null;

  useEffect(() => {
    syncFromURL(slug, title, path);
    const handlePopstate = () => syncFromURL(slug, title, path);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [slug, title, path, syncFromURL]);

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
    panes.slice(1).forEach((pane, i) => {
      if (!pane.hash || pane.status !== 'ready') return;
      if (prevPanesRef.current[i + 1]?.status === 'ready') return;
      const paneEl = stackEl?.querySelector<HTMLElement>(`[data-pane-index="${i + 1}"]`);
      const paneBody = paneEl?.querySelector<HTMLElement>('.pane-body');
      const target = paneEl?.querySelector<HTMLElement>(pane.hash);
      if (!paneBody || !target) return;
      // Not scrollIntoView: it also scrolls .stack horizontally and fights the
      // smooth scroll from scrollToPane; 'instant' avoids competing with it.
      const top = target.getBoundingClientRect().top - paneBody.getBoundingClientRect().top + paneBody.scrollTop;
      paneBody.scrollTo({ top, behavior: 'instant' });
    });
    prevPanesRef.current = panes;
  }, [panes]);

  return (
    <>
      <span ref={anchorRef} hidden data-stack-anchor=""></span>
      {panes.slice(1).map((pane, i) => {
        const paneIndex = i + 1;
        const isActive = paneIndex === activeIndex;
        return (
          <section
            key={pane.slug}
            className={`pane${isActive ? ' pane--active' : ''}`}
            data-pane-index={paneIndex}
            style={{ '--pane-i': paneIndex } as React.CSSProperties}
            role="region"
            aria-label={`Pattern: ${pane.title}`}
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
                  <p>Failed to load pattern.</p>
                </article>
              )}
              {pane.status === 'ready' && (
                <article className="pane-article" dangerouslySetInnerHTML={{ __html: pane.html }} />
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
