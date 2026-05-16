import React, { useEffect, useRef } from 'react';
import { useStackStore } from '../lib/stack-store';

interface StackManagerProps {
  slug: string;
  title: string;
  children: React.ReactNode;
}

export function StackManager({ slug, title, children }: StackManagerProps) {
  const { panes, activeIndex, syncFromURL } = useStackStore();
  const stackRef = useRef<HTMLDivElement>(null);

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
    last.scrollIntoView({ inline: 'end', behavior: 'smooth', block: 'nearest' });
    const h1 = last.querySelector<HTMLElement>('h1');
    if (h1) {
      h1.tabIndex = -1;
      setTimeout(() => h1.focus(), 0);
    }
  }, [panes.length]);

  return (
    <div className="stack" ref={stackRef}>
      <section
        className={`pane${activeIndex === 0 ? ' pane--active' : ''}`}
        data-pane-index={0}
        role="region"
        aria-label={`Pattern: ${title}`}
        aria-current={activeIndex === 0 ? 'true' : undefined}
      >
        {children}
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
          </section>
        );
      })}
    </div>
  );
}
