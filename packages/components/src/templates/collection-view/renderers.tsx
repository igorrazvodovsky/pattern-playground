import React, { useEffect, useMemo, useRef } from 'react';
import type { Product } from '@shared/data/types';
import type { MapComponent, MapSelectDetail } from '../../components/map/map.js';
import type { ScatterPlot } from '../../components/charts/scatter-plot.js';
import {
  getAttributeValue,
  formatAttributeValue,
  isIdentityAttribute,
  attributeLabel,
} from './AttributeUtils';
import type { AttributePath, ViewSpec, RepresentationType } from './spec';
import { groupItems } from './spec';
import { toMapLocations, toPlotPoints } from './data';

/**
 * Renderers mapping representation.type to a building block from the
 * catalogue. Each composes the block (.card, .board, pp-table, pp-map,
 * pp-scatter-plot) rather than implementing it; what this module adds is the
 * spec plumbing and the coupling hooks (focus is transient, selection is
 * staked) that every consumer of the template shares.
 */

export interface ItemCoupling {
  selectedId?: string | null;
  onItemSelect?: (item: Product) => void;
  focusedId?: string | null;
  onItemFocus?: (item: Product | null) => void;
}

export interface RendererProps extends ItemCoupling {
  items: Product[];
  spec: ViewSpec;
}

interface ProductCardProps extends ItemCoupling {
  item: Product;
  shownAttributes: AttributePath[];
  /** Makes attribute badges buttons — e.g. click a value to filter by it. */
  onAttributeClick?: (attribute: AttributePath, value: string, item: Product) => void;
  /** Per-card controls, placed opposite the heading in the card's top corner. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function ProductCard({
  item,
  shownAttributes,
  selectedId,
  onItemSelect,
  focusedId,
  onItemFocus,
  onAttributeClick,
  actions,
  children,
}: ProductCardProps) {
  const badges = shownAttributes.filter(
    (attribute) => !isIdentityAttribute(attribute) && attribute !== 'icon'
  );
  const selected = selectedId === item.id;
  const name = shownAttributes.includes('name') ? item.name : null;
  const icon = shownAttributes.includes('icon') ? (
    <iconify-icon className="icon" icon={item.icon} title={item.name} aria-label={item.name}></iconify-icon>
  ) : null;

  const heading =
    name !== null || icon !== null ? (
      <h4 className="label flex">
        {icon}
        {name !== null &&
          (onItemSelect ? (
            <button
              type="button"
              className="stretched-link"
              aria-pressed={selected}
              onClick={() => onItemSelect(item)}
            >
              {name}
            </button>
          ) : (
            name
          ))}
      </h4>
    ) : null;

  const hasBody = shownAttributes.includes('description') || badges.length > 0;
  const body = hasBody && (
    <>
      {shownAttributes.includes('description') && (
        <p className="description">{item.description}</p>
      )}
      {badges.length > 0 && (
        <div className="card__attributes badges">
          {badges.map((attribute) => {
            const value = formatAttributeValue(getAttributeValue(item, attribute), attribute);
            return onAttributeClick ? (
              <button
                key={attribute}
                type="button"
                className="badge"
                onClick={() => onAttributeClick(attribute, value, item)}
              >
                <span className="badge__label">{attributeLabel(attribute)}</span>
                {value}
              </button>
            ) : (
              <span key={attribute} className="badge">
                <span className="badge__label">{attributeLabel(attribute)}</span>
                {value}
              </span>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <article
      className="card"
      data-selected={selected || undefined}
      data-focused={focusedId === item.id || undefined}
      onMouseEnter={onItemFocus ? () => onItemFocus(item) : undefined}
      onMouseLeave={onItemFocus ? () => onItemFocus(null) : undefined}
    >
      {/* Spacing comes from composition: the header zone pads itself; loose body
          content sits in a padded, flowed wrapper. Actions ride in a header row
          so they sit opposite the heading; without them the heading leads the
          body wrapper. */}
      {actions ? (
        <div className="card__header">
          {heading}
          {actions}
        </div>
      ) : null}
      {(!actions || hasBody) && (
        <div className="flow pad">
          {!actions && heading}
          {body}
        </div>
      )}
      {children}
    </article>
  );
}

interface ProductDetailProps {
  item: Product;
  shownAttributes: AttributePath[];
  children?: React.ReactNode;
}

/**
 * The detail counterpart of `ProductCard`, reading the same `shownAttributes`
 * contract: identity attributes take their dedicated slots (name a heading,
 * description a paragraph), everything else becomes a description-list row.
 *
 * The card compresses a chosen subset and this expands one; because both are
 * driven by an attribute list rather than a fixed layout, a pair of views can
 * be composed by set arithmetic — which is what makes a detail that omits what
 * its overview already carries a filter rather than a special case.
 */
export function ProductDetail({ item, shownAttributes, children }: ProductDetailProps) {
  const rows = shownAttributes.filter((attribute) => !isIdentityAttribute(attribute));

  return (
    <>
      {shownAttributes.includes('name') && (
        <h4 className="label flex">
          <iconify-icon className="icon" icon={item.icon} aria-hidden="true"></iconify-icon>
          {item.name}
        </h4>
      )}
      {shownAttributes.includes('description') && (
        <p className="description">{item.description}</p>
      )}
      {rows.length > 0 && (
        <dl className="description-list">
          {rows.map((attribute) => (
            <React.Fragment key={attribute}>
              <dt>{attributeLabel(attribute)}</dt>
              <dd>{formatAttributeValue(getAttributeValue(item, attribute), attribute)}</dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {children}
    </>
  );
}

export function CardRenderer(props: RendererProps) {
  const { items, spec } = props;
  return (
    <ul className="cards layout-grid">
      {items.map((item) => (
        <li key={item.id}>
          <ProductCard
            item={item}
            shownAttributes={spec.representation.shownAttributes}
            selectedId={props.selectedId}
            onItemSelect={props.onItemSelect}
            focusedId={props.focusedId}
            onItemFocus={props.onItemFocus}
          />
        </li>
      ))}
    </ul>
  );
}

export function ListRenderer(props: RendererProps) {
  const { items, spec } = props;
  return (
    <section className="cards cards--list">
      {items.map((item) => (
        <div key={item.id}>
          <ProductCard
            item={item}
            shownAttributes={spec.representation.shownAttributes}
            selectedId={props.selectedId}
            onItemSelect={props.onItemSelect}
            focusedId={props.focusedId}
            onItemFocus={props.onItemFocus}
          />
        </div>
      ))}
    </section>
  );
}

export function TableRenderer(props: RendererProps) {
  const { items, spec, selectedId, onItemSelect, focusedId, onItemFocus } = props;
  const shown = spec.representation.shownAttributes;
  const identityColumns = shown.filter((attribute) => isIdentityAttribute(attribute));
  const metadataColumns = shown.filter((attribute) => !isIdentityAttribute(attribute));
  const columns = [...identityColumns, ...metadataColumns];
  const numericClass = (column: string) =>
    column.includes('msrp') || column.includes('leadTime') ? 'pp-table-align-right' : '';

  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} className={numericClass(column)}>
                {attributeLabel(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              data-selected={selectedId === item.id || undefined}
              data-focused={focusedId === item.id || undefined}
              onMouseEnter={onItemFocus ? () => onItemFocus(item) : undefined}
              onMouseLeave={onItemFocus ? () => onItemFocus(null) : undefined}
            >
              {columns.map((column, index) => {
                const content = formatAttributeValue(
                  getAttributeValue(item, column),
                  column
                );
                return (
                  <td key={column} className={numericClass(column)}>
                    {index === 0 && onItemSelect ? (
                      <button
                        type="button"
                        className="button button--plain"
                        aria-pressed={selectedId === item.id}
                        onClick={() => onItemSelect(item)}
                      >
                        {content}
                      </button>
                    ) : (
                      content
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  );
}

export function MapRenderer(props: RendererProps) {
  const { items, selectedId, onItemSelect } = props;
  const ref = useRef<MapComponent | null>(null);
  const locations = useMemo(() => toMapLocations(items), [items]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.locations = locations;
    el.selectedId = selectedId ?? undefined;
  }, [locations, selectedId]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onItemSelect) return;
    const handleSelect = (event: Event) => {
      const detail = (event as CustomEvent<MapSelectDetail>).detail;
      if (detail.source !== 'marker') return;
      const item = items.find((candidate) => candidate.id === detail.location.id);
      if (item) onItemSelect(item);
    };
    el.addEventListener('pp-map-select', handleSelect);
    return () => el.removeEventListener('pp-map-select', handleSelect);
  }, [items, onItemSelect]);

  return (
    <div className="view-family__map">
      <pp-map ref={ref} />
    </div>
  );
}

const DEFAULT_PLOT_AXES: [AttributePath, AttributePath] = [
  'pricing.msrp',
  'sustainability.carbonFootprint',
];

/** First two shown attributes that are numeric in the data become the axes. */
export function pickPlotAxes(
  items: Product[],
  spec: ViewSpec
): [AttributePath, AttributePath] {
  const sample = items[0];
  if (!sample) return DEFAULT_PLOT_AXES;
  const numeric = spec.representation.shownAttributes.filter(
    (attribute) => typeof getAttributeValue(sample, attribute) === 'number'
  );
  if (numeric.length < 2) return DEFAULT_PLOT_AXES;
  return [numeric[0], numeric[1]];
}

export function PlotRenderer(props: RendererProps) {
  const { items, spec, onItemSelect, onItemFocus } = props;
  const ref = useRef<ScatterPlot | null>(null);
  const [xPath, yPath] = pickPlotAxes(items, spec);
  const points = useMemo(
    () => toPlotPoints(items, xPath, yPath),
    [items, xPath, yPath]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.data = {
      data: points,
      xAxisLabel: attributeLabel(xPath),
      yAxisLabel: attributeLabel(yPath),
    };
    el.showAxes = true;
  }, [points, xPath, yPath]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resolve = (event: Event) => {
      const point = (event as CustomEvent<{ data: { id?: string } }>).detail?.data;
      return point?.id
        ? items.find((candidate) => candidate.id === point.id)
        : undefined;
    };
    const handleClick = (event: Event) => {
      const item = resolve(event);
      if (item && onItemSelect) onItemSelect(item);
    };
    const handleHover = (event: Event) => {
      const item = resolve(event);
      if (item && onItemFocus) onItemFocus(item);
    };
    const handleHoverEnd = () => onItemFocus?.(null);
    el.addEventListener('pp-point-click', handleClick);
    el.addEventListener('pp-point-hover', handleHover);
    el.addEventListener('pp-point-hover-end', handleHoverEnd);
    return () => {
      el.removeEventListener('pp-point-click', handleClick);
      el.removeEventListener('pp-point-hover', handleHover);
      el.removeEventListener('pp-point-hover-end', handleHoverEnd);
    };
  }, [items, onItemSelect, onItemFocus]);

  return <pp-scatter-plot ref={ref} />;
}

export const REPRESENTATIONS: Record<RepresentationType, React.FC<RendererProps>> = {
  card: CardRenderer,
  list: ListRenderer,
  table: TableRenderer,
  map: MapRenderer,
  plot: PlotRenderer,
};

interface BoardLanesProps extends ItemCoupling {
  groups: Map<string, Product[]>;
  spec: ViewSpec;
  /** Pre-seeded lane labels so empty lanes stay visible as write destinations. */
  laneLabels?: string[];
  /** Modifier on the board block — `.board--sections` rotates lanes to sections. */
  className?: string;
  renderItem?: (item: Product, lane: string) => React.ReactNode;
  /**
   * Renders the lane's `.board__column` element itself, given its contents —
   * the hook a writable board uses to make the lane a drop target without
   * re-implementing the shared markup. The contents lead with the `<summary>`,
   * so whatever this returns has to be a `<details>`.
   */
  renderLane?: (lane: string, content: React.ReactNode) => React.ReactNode;
}

export function BoardLanes({
  groups,
  spec,
  laneLabels,
  className,
  renderItem,
  renderLane,
  ...coupling
}: BoardLanesProps) {
  const labels = laneLabels ?? [...groups.keys()];
  return (
    <div className={className ? `board ${className}` : 'board'}>
      {labels.map((label) => {
        const laneItems = groups.get(label) ?? [];
        const content = (
          <>
            {/* Text and a count only: `<summary>` is button-like, so any
                interactive descendant is flattened out of the accessibility
                tree — a per-lane control would have to sit beside it, not
                inside it. */}
            <summary>
              {label} <span className="badge">{laneItems.length}</span>
            </summary>
            <ul className="cards">
              {laneItems.map((item) => (
                <li key={item.id}>
                  {renderItem ? (
                    renderItem(item, label)
                  ) : (
                    <ProductCard
                      item={item}
                      shownAttributes={spec.representation.shownAttributes}
                      {...coupling}
                    />
                  )}
                </li>
              ))}
            </ul>
          </>
        );
        return renderLane ? (
          <React.Fragment key={label}>{renderLane(label, content)}</React.Fragment>
        ) : (
          <details className="board__column" key={label} open>
            {content}
          </details>
        );
      })}
    </div>
  );
}

/**
 * Renders a (model, spec) pair: the arrangement decides the layout shell,
 * the representation decides the block each item becomes. Grouping applies
 * to item-shaped representations; map and plot render their population
 * whole.
 */
export function ViewSpecRenderer(props: RendererProps) {
  const { items, spec } = props;
  const { groupBy, groupLayout } = spec.arrangement;
  const type = spec.representation.type;
  const Renderer = REPRESENTATIONS[type];

  if (!groupBy || type === 'map' || type === 'plot') {
    return <Renderer {...props} />;
  }

  const groups = groupItems(items, groupBy);

  if (groupLayout === 'lanes') {
    return (
      <BoardLanes
        groups={groups}
        spec={spec}
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
