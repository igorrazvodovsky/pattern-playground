import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';

interface StackManagerProps {
  slug: string;
  title: string;
  children: React.ReactNode;
}

function getSpineWidth(stackEl: HTMLElement): number {
  const spine = stackEl.querySelector<HTMLElement>('.pane-spine');
  return spine?.getBoundingClientRect().width ?? 28;
}

function scrollToPane(stackEl: HTMLElement, paneIndex: number) {
  const section = stackEl.querySelector<HTMLElement>(`[data-pane-index="${paneIndex}"]`);
  if (!section) return;
  const spineW = getSpineWidth(stackEl);
  stackEl.scrollTo({
    left: section.offsetLeft - paneIndex * spineW,
    behavior: 'smooth',
  });
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
      setTimeout(() => h1.focus(), 0);
    }
  }, [panes.length]);

  useEffect(() => {
    panes.slice(1).forEach((pane, i) => {
      if (!pane.hash || pane.status !== 'ready') return;
      if (prevPanesRef.current[i + 1]?.status === 'ready') return;
      const paneEl = stackRef.current?.querySelector<HTMLElement>(`[data-pane-index="${i + 1}"]`);
      paneEl?.querySelector(pane.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    prevPanesRef.current = panes;
  }, [panes]);

  return (
    <div className="stack" ref={stackRef}>
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
