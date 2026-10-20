import type React from 'react';
import type { BoundEntity } from '@shared/data/bindings';
import type { RepresentationType } from '../spec';
import { groupItems } from '../spec';
import { BoardLanes } from './board-lanes';
import { CardRenderer } from './card';
import { MapRenderer } from './map';
import { PlotRenderer } from './plot';
import type { RendererProps } from './shared';
import { TableRenderer } from './table';

/**
 * Renderers mapping representation.type to a building block from the
 * catalogue. Each composes the block (.card, .board, pp-table, pp-map,
 * pp-scatter-plot) rather than implementing it; what this module adds is the
 * spec plumbing and the coupling hooks (focus is transient, selection is
 * staked) that every consumer of the template shares.
 *
 * Nothing here mentions an entity type: items are bound entities, and the
 * binding says which attribute is the heading, which the icon, which a badge.
 * Identity slots resolve by role; everything else lands generically.
 */

export type { ItemCoupling, RendererProps } from './shared';
export { EntityCard } from './entity-card';
export { EntityDetail } from './entity-detail';
export { BoardLanes, CardRenderer, MapRenderer, PlotRenderer, TableRenderer };
export { pickPlotAxes } from './plot';

export const REPRESENTATIONS: Record<
  RepresentationType,
  (props: RendererProps) => React.JSX.Element
> = {
  card: CardRenderer,
  table: TableRenderer,
  map: MapRenderer,
  plot: PlotRenderer,
};

/**
 * Renders a (model, spec, binding) triple: the arrangement decides the layout
 * shell, the representation decides the block each item becomes, and the
 * binding says what each attribute is. Grouping applies to item-shaped
 * representations; map and plot render their population whole.
 */
export function ViewSpecRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding } = props;
  const { groupBy, groupLayout } = spec.arrangement;
  const type = spec.representation.type;
  // Sound: a renderer only hands back items it was given, so the registry's
  // BoundEntity-typed entry serves any T. (Two-step cast: the coupling
  // callbacks make the two signatures formally non-overlapping.)
  const Renderer = REPRESENTATIONS[type] as unknown as (
    props: RendererProps<T>,
  ) => React.JSX.Element;

  if (!groupBy || type === 'map' || type === 'plot') {
    return <Renderer {...props} />;
  }

  const groups = groupItems(items, groupBy, binding);

  if (groupLayout === 'lanes') {
    return (
      <BoardLanes
        groups={groups}
        spec={spec}
        binding={binding}
        selectedId={props.selectedId}
        onItemSelect={props.onItemSelect}
        focusedId={props.focusedId}
        onItemFocus={props.onItemFocus}
      />
    );
  }

  return (
    <div className="flow">
      {[...groups.entries()].map(([label, groupedItems]) => (
        <details key={label} className="layer borderless" open>
          <summary>
            {label} <span className="badge">{groupedItems.length}</span>
          </summary>
          <Renderer {...props} items={groupedItems} />
        </details>
      ))}
    </div>
  );
}
