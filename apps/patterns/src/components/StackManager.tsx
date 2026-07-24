import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';
import { mountDemos } from '../lib/demo-registry';

interface StackManagerProps {
  slug: string;
  title: string;
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

// Markup twin of the static pane-0 spine in Base.astro. No click handler of its
// own — spine clicks (this one and the static one) are handled by one delegated
// listener on the stack.
function PaneSpine({ paneTitle }: { paneTitle: string }) {
  return (
    <button className="pane-spine" aria-label={`Scroll ${paneTitle} into view`}>
      <span aria-hidden="true">{paneTitle}</span>
    </button>
  );
}

// Renders panes 1+ as a sibling island inside the static .stack (Base.astro
// renders pane 0 and the stack element itself; <astro-island> is
// display:contents, so the sections participate in the stack's flex geometry
// directly). Pane 0's stack-dependent state — active flag, --pane-n — is
// reflected onto the static DOM by attribute, like data-collapsed already is.
export function StackManager({ slug, title }: StackManagerProps) {
  const { panes, activeIndex, syncFromURL } = useStackStore();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const prevPanesRef = useRef<typeof panes>([]);

  // The island's rendered children live inside the .stack; the hidden anchor
  // (display:none, so inert to flex) is a stable handle back to it. Set during
  // commit, so it is available to every effect below from the first run.
  const getStack = () =>
    anchorRef.current?.closest<HTMLElement>('.stack') ?? null;

  useEffect(() => {
    syncFromURL(slug, title);
    const handlePopstate = () => syncFromURL(slug, title);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [slug, title, syncFromURL]);

  // Reflect stack state onto the static pane 0 and the stack element.
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

  // One delegated click listener serves every spine, the static pane-0 one
  // included.
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

  // Land keyboard focus on the pushed pane's h1 once its content is in the
  // DOM. Keyed on the ready transition, not on pane count: at push time the
  // pane is a loading placeholder with no h1 to focus.
  useEffect(() => {
    if (panes.length <= 1) return;
    const lastIndex = panes.length - 1;
    const last = panes[lastIndex];
    if (last.status !== 'ready') return;
    if (prevPanesRef.current[lastIndex]?.status === 'ready') return;
    // Skip focus when the pane has a hash target: the hash-scroll effect will
    // scroll to the anchor, and h1.focus() would cancel that scroll.
    if (last.hash) return;
    const h1 = getStack()?.querySelector<HTMLElement>(`[data-pane-index="${lastIndex}"] h1`);
    if (h1) {
      h1.tabIndex = -1;
      setTimeout(() => h1.focus(), 0);
    }
  }, [panes]);

  // Reflect the painted overlap geometry into data-collapsed / data-overlapping
  // on every scroll (rAF-throttled) and resize. Re-runs when panes change so a
  // newly pushed or removed pane is classified immediately. A ResizeObserver on
  // the panes catches width changes that fire no scroll/resize event — a demo
  // expanding its host pane (lib/demo-expander.ts), or a demo settling its size
  // after mounting — and is bound to this instance's live elements.
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
    const ro = new ResizeObserver(schedule);
    for (const pane of stackEl.querySelectorAll('[data-pane-index]')) ro.observe(pane);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      stackEl.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [panes]);

  // Mount demo widgets in injected panes once the pane's html has been
  // committed to the DOM. Runs for each pane that just turned ready;
  // mountDemos self-guards against reruns (data-demo-mounted).
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
                <article dangerouslySetInnerHTML={{ __html: pane.html }} />
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
