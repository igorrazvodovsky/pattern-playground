import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';

interface StackManagerProps {
  slug: string;
  title: string;
  children: React.ReactNode;
}

interface PaneSpineProps {
  paneTitle: string;
  onFoldedClick: (paneIndex: number) => void;
}

function scrollPaneIntoView(paneEl: HTMLElement) {
  paneEl.scrollIntoView({ inline: 'start', behavior: 'smooth', block: 'nearest' });
}

function PaneSpine({ paneTitle, onFoldedClick }: PaneSpineProps) {
  return (
    <button
      className="pane-spine"
      aria-label={`Scroll ${paneTitle} into view`}
      onClick={(e) => {
        const section = e.currentTarget.closest<HTMLElement>('[data-pane-index]');
        if (!section) return;
        if ('folded' in section.dataset || 'covered' in section.dataset) {
          onFoldedClick(parseInt(section.dataset.paneIndex ?? '0', 10));
        } else {
          scrollPaneIntoView(section);
        }
      }}
    >
      <span aria-hidden="true">{paneTitle}</span>
    </button>
  );
}

export function StackManager({ slug, title, children }: StackManagerProps) {
  const { panes, activeIndex, syncFromURL } = useStackStore();
  const stackRef = useRef<HTMLDivElement>(null);
  const foldAnchorRef = useRef(Number.MAX_SAFE_INTEGER);
  const applyFoldsRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    syncFromURL(slug, title);

    const handlePopstate = () => syncFromURL(slug, title);
    window.addEventListener('popstate', handlePopstate);
    return () => window.removeEventListener('popstate', handlePopstate);
  }, [slug, title, syncFromURL]);

  useEffect(() => {
    if (!stackRef.current || panes.length <= 1) return;
    const sections = stackRef.current.querySelectorAll<HTMLElement>('[data-pane-index]');
    const last = sections[sections.length - 1];
    if (!last) return;
    const h1 = last.querySelector<HTMLElement>('h1');
    if (h1) {
      h1.tabIndex = -1;
      setTimeout(() => h1.focus(), 0);
    }
  }, [panes.length]);

  useEffect(() => {
    const stackEl = stackRef.current;
    if (!stackEl) return;

    foldAnchorRef.current = Number.MAX_SAFE_INTEGER;

    const applyFolds = () => {
      const W = stackEl.clientWidth;
      const N = panes.length;
      if (N === 0) return;

      const spineProbe = document.createElement('div');
      spineProbe.style.cssText = 'position:absolute;visibility:hidden;width:var(--pane-spine-w,1.75rem)';
      stackEl.appendChild(spineProbe);
      const s = spineProbe.getBoundingClientRect().width;
      spineProbe.remove();

      const coveredProbe = document.createElement('div');
      coveredProbe.style.cssText = 'position:absolute;visibility:hidden;width:var(--pane-covered-w,12rem)';
      stackEl.appendChild(coveredProbe);
      const c = coveredProbe.getBoundingClientRect().width;
      coveredProbe.remove();

      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const rawMax = parseFloat(getComputedStyle(stackEl).getPropertyValue('--pane-max-w')) || 48;
      const p = Math.min(rawMax * rem, W);

      let K = p > s ? Math.max(1, Math.floor((W - N * s) / (p - s))) : 1;
      K = Math.min(K, N);
      const remainingForCovered = W - K * p - Math.max(0, N - K - 1) * s;
      const hasCoverSlot = K < N && remainingForCovered >= c;

      const maxAnchor = Math.max(0, N - K);
      foldAnchorRef.current = Math.min(foldAnchorRef.current, maxAnchor);
      const anchor = foldAnchorRef.current;

      const coveredIndex = hasCoverSlot && anchor > 0 ? anchor - 1 : -1;

      stackEl.querySelectorAll<HTMLElement>('[data-pane-index]').forEach((section, i) => {
        if (i >= anchor) {
          delete section.dataset.folded;
          delete section.dataset.covered;
        } else if (i === coveredIndex) {
          delete section.dataset.folded;
          section.dataset.covered = '';
        } else {
          section.dataset.folded = '';
          delete section.dataset.covered;
        }
      });
    };

    applyFoldsRef.current = applyFolds;
    applyFolds();

    const ro = new ResizeObserver(applyFolds);
    ro.observe(stackEl);
    return () => ro.disconnect();
  }, [panes.length]);

  const handleFoldedClick = (paneIndex: number) => {
    foldAnchorRef.current = paneIndex;
    applyFoldsRef.current?.();
  };

  return (
    <div className="stack" ref={stackRef}>
      <section
        className={`pane${activeIndex === 0 ? ' pane--active' : ''}`}
        data-pane-index={0}
        role="region"
        aria-label={`Pattern: ${title}`}
        aria-current={activeIndex === 0 ? 'true' : undefined}
      >
        <div className="pane-body">{children}</div>
        <PaneSpine paneTitle={title} onFoldedClick={handleFoldedClick} />
      </section>

      {/* Panes 1+: fetched and injected as HTML */}
      {panes.slice(1).map((pane, i) => {
        const paneIndex = i + 1;
        const isActive = paneIndex === activeIndex;
        return (
          <section
            key={pane.slug}
            className={`pane${isActive ? ' pane--active' : ''}`}
            data-pane-index={paneIndex}
            role="region"
            aria-label={`Pattern: ${pane.title}`}
            aria-current={isActive ? 'true' : undefined}
          >
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
            <PaneSpine paneTitle={pane.title} onFoldedClick={handleFoldedClick} />
          </section>
        );
      })}
    </div>
  );
}
