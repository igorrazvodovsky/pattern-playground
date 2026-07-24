import React from 'react';
import type { BaseItem, ItemViewProps } from './types';
import { useContentAdapter } from './ContentAdapterRegistry';
import { DefaultFallbackRenderer } from './DefaultFallbackRenderer';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * ItemView - Unified item view component
 * Single component that handles all view scopes with adapter-based rendering
 *
 * Titles at mid/maxi are host-owned: escalation hosts name the view in their
 * modal chrome, so adapters render no heading of their own. A standalone host
 * (a pane, a demo page) opts in with `heading` — the wrapper renders
 * `item.label` once, at the level the host's outline calls for. Mini needs
 * none of this: a summary card is self-identifying.
 */
export const ItemView = <T extends string = string>({
  item,
  contentType,
  scope,
  mode = 'preview',
  heading,
  onEscalate,
  onInteraction,
}: ItemViewProps<T> & { heading?: HeadingLevel }) => {
  const adapter = useContentAdapter(contentType);
  const Heading = heading ? (`h${heading}` as const) : null;
  // Every item carried by an adapter is a `BaseItem` at heart (id + label);
  // the cast mirrors ItemInteraction's, which titles its modals the same way.
  const title = Heading ? <Heading>{(item as unknown as BaseItem).label}</Heading> : null;

  if (!adapter) {
    return (
      <>
        {title}
        <DefaultFallbackRenderer
          item={item}
          contentType={contentType}
          scope={scope}
          mode={mode}
          onEscalate={onEscalate}
          onInteraction={onInteraction}
        />
      </>
    );
  }

  return (
    <div className={Heading ? 'flow' : undefined} data-content-type={contentType} data-scope={scope}>
      {title}
      {adapter.render({
        item,
        contentType,
        scope,
        mode,
        onEscalate,
        onInteraction,
      })}
    </div>
  );
};
