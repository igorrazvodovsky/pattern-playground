import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';

interface StackManagerProps {
  slug: string;
  title: string;
  children: React.ReactNode;
}

// Spine width in px, read from the --pane-spine-w custom property. We can't
// measure a .pane-spine element: it is display:none until its pane collapses.
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

// Toggle the cosmetic state attributes the stylesheet keys off, matching the
// reference (notes.andymatuschak.org) which marks a note when it overlays
// another. Geometry stays pure-CSS sticky; this only reflects what is painted:
//   data-collapsed   — only a spine's worth of the pane shows (pinned to a rail
//                      and clipped/covered) → reveal its spine label.
//   data-overlapping — the pane actually overlays its predecessor → cast the
//                      depth shadow. Never set when panes merely sit side by side.
function updateStackClasses(stackEl: HTMLElement) {
  const panes = [...stackEl.querySelectorAll<HTMLElement>('[data-pane-index]')];
  if (!panes.length) return;
  const spineW = getSpineWidth(stackEl);
  const stack = stackEl.getBoundingClientRect();
  const rects = panes.map((p) => p.getBoundingClientRect());

  panes.forEach((pane, i) => {
    const r = rects[i];
    // A later pane (higher z-index) covers this one; the viewport clips both edges.
    const coveredRight = i + 1 < rects.length ? rects[i + 1].left : stack.right;
    const visible = Math.min(r.right, stack.right, coveredRight) - Math.max(r.left, stack.left);
    const collapsed = visible <= spineW + 4;
    // This pane overlays its predecessor when their boxes intersect horizontally
    // (1px slack so a plain side-by-side border seam doesn't count as overlap).
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

// Scroll a pane to its expanded spot, just right of the left rail.
function scrollToPane(stackEl: HTMLElement, paneIndex: number) {
  const sections = [...stackEl.querySelectorAll<HTMLElement>('[data-pane-index]')];
  if (!sections.length) return;
  const spineW = getSpineWidth(stackEl);
  const max = stackEl.scrollWidth - stackEl.clientWidth;
  const target = naturalLeft(sections, paneIndex) - paneIndex * spineW;
  stackEl.scrollTo({ left: Math.max(0, Math.min(max, target)), behavior: 'smooth' });
}

function PaneSpine({ paneTitle }: { paneTitle: string }) {
  return (
    <button
      className="pane-spine"
      aria-label={`Scroll ${paneTitle} into view`}
      onClick={(e) => {
        const section = e.currentTarget.closest<HTMLElement>('[data-pane-index]');
        if (!section) return;
        const stack = section.parentElement;
        if (!stack) return;
        const paneIndex = parseInt(section.dataset.paneIndex ?? '0', 10);
        scrollToPane(stack, paneIndex);
      }}
    >
      <span aria-hidden="true">{paneTitle}</span>
    </button>
  );
}

export function StackManager({ slug, title, children }: StackManagerProps) {
  const { panes, activeIndex, syncFromURL } = useStackStore();
  const stackRef = useRef<HTMLDivElement>(null);
  const prevPanesRef = useRef<typeof panes>([]);

  useEffect(() => {
    syncFromURL(slug, title);
    const handlePopstate = () => syncFromURL(slug, title);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [slug, title, syncFromURL]);

  useEffect(() => {
    if (!stackRef.current || panes.length <= 1) return;
    scrollToPane(stackRef.current, panes.length - 1);
    const sections = stackRef.current.querySelectorAll<HTMLElement>('[data-pane-index]');
    const last = sections[sections.length - 1];
    if (!last) return;
    const h1 = last.querySelector<HTMLElement>('h1');
    if (h1) {
      h1.tabIndex = -1;
      // Skip focus when the pane has a hash target: the hash-scroll effect will
      // scroll to the anchor, and h1.focus() would cancel that smooth scroll.
      if (!panes[panes.length - 1]?.hash) {
        setTimeout(() => h1.focus(), 0);
      }
    }
  }, [panes.length]);

  // Reflect the painted overlap geometry into data-collapsed / data-overlapping
  // on every scroll (rAF-throttled) and resize. Re-runs when panes change so a
  // newly pushed or removed pane is classified immediately.
  useEffect(() => {
    const stackEl = stackRef.current;
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
    return () => {
      if (raf) cancelAnimationFrame(raf);
      stackEl.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [panes]);

  useEffect(() => {
    panes.slice(1).forEach((pane, i) => {
      if (!pane.hash || pane.status !== 'ready') return;
      if (prevPanesRef.current[i + 1]?.status === 'ready') return;
      const paneEl = stackRef.current?.querySelector<HTMLElement>(`[data-pane-index="${i + 1}"]`);
      const paneBody = paneEl?.querySelector<HTMLElement>('.pane-body');
      const target = paneEl?.querySelector<HTMLElement>(pane.hash);
      if (!paneBody || !target) return;
      // scrollIntoView also scrolls .stack horizontally, fighting the concurrent
      // horizontal scroll from scrollToPane and ending up back at 0. Direct
      // .pane-body scroll avoids .stack entirely; 'instant' avoids competing
      // with the horizontal smooth animation already in progress.
      const top = target.getBoundingClientRect().top - paneBody.getBoundingClientRect().top + paneBody.scrollTop;
      paneBody.scrollTo({ top, behavior: 'instant' });
    });
    prevPanesRef.current = panes;
  }, [panes]);

  return (
    <div
      className="stack"
      ref={stackRef}
      style={{ '--pane-n': panes.length } as React.CSSProperties}
    >
      <section
        className={`pane${activeIndex === 0 ? ' pane--active' : ''}`}
        data-pane-index={0}
        style={{ '--pane-i': 0 } as React.CSSProperties}
        role="region"
        aria-label={`Pattern: ${title}`}
        aria-current={activeIndex === 0 ? 'true' : undefined}
      >
        {panes.length > 1 && <PaneSpine paneTitle={title} />}
        <div className="pane-body">{children}</div>
      </section>

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
                <article dangerouslySetInnerHTML={{ __html: pane.html }} />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
