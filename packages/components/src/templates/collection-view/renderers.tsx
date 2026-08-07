import React, { useEffect, useMemo, useRef } from 'react';
import type { AttributeBinding, BoundEntity, EntityBinding } from '@shared/data/bindings';
import {
  getValueAtPath,
  resolveAttributeSelection,
  isNumericValueType,
  IDENTITY_ROLES,
} from '@shared/data/bindings';
import type { MapComponent, MapSelectDetail } from '../../components/map/map.js';
import type { ScatterPlot } from '../../components/charts/scatter-plot.js';
import {
  getAttributeValue,
  formatAttributeValue,
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
 *
 * Nothing here mentions an entity type: items are bound entities, and the
 * binding says which attribute is the heading, which the icon, which a badge.
 * Identity slots resolve by role; everything else lands generically.
 */

export interface ItemCoupling<T extends BoundEntity = BoundEntity> {
  selectedId?: string | null;
  onItemSelect?: (item: T) => void;
  focusedId?: string | null;
  onItemFocus?: (item: T | null) => void;
}

export interface RendererProps<T extends BoundEntity = BoundEntity>
  extends ItemCoupling<T> {
  items: T[];
  spec: ViewSpec;
  binding: EntityBinding;
}

const firstOfRole = (
  attributes: AttributeBinding[],
  role: AttributeBinding['role']
): AttributeBinding | undefined =>
  attributes.find((attribute) => attribute.role === role);

const isIdentity = (attribute: AttributeBinding): boolean =>
  IDENTITY_ROLES.includes(attribute.role);

interface EntityCardProps<T extends BoundEntity = BoundEntity>
  extends ItemCoupling<T> {
  item: T;
  binding: EntityBinding;
  shownAttributes: AttributePath[];
  /** Makes attribute badges buttons — e.g. click a value to filter by it. */
  onAttributeClick?: (attribute: AttributePath, value: string, item: T) => void;
  /** Per-card controls, placed opposite the heading in the card's top corner. */
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function EntityCard<T extends BoundEntity>({
  item,
  binding,
  shownAttributes,
  selectedId,
  onItemSelect,
  focusedId,
  onItemFocus,
  onAttributeClick,
  actions,
  children,
}: EntityCardProps<T>) {
  const resolved = resolveAttributeSelection(binding, shownAttributes);
  const badges = resolved.filter((attribute) => !isIdentity(attribute));
  const selected = selectedId === item.id;

  const titleAttribute = firstOfRole(resolved, 'title');
  const titleValue = titleAttribute ? getValueAtPath(item, titleAttribute.path) : null;
  const name = titleValue != null ? String(titleValue) : null;

  const thumbnailAttribute = firstOfRole(resolved, 'thumbnail');
  const thumbnailValue = thumbnailAttribute
    ? getValueAtPath(item, thumbnailAttribute.path)
    : null;
  const icon =
    typeof thumbnailValue === 'string' && thumbnailValue !== '' ? (
      <iconify-icon
        className="icon"
        icon={thumbnailValue}
        title={name ?? undefined}
        aria-label={name ?? undefined}
      ></iconify-icon>
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

  const descriptionAttribute = firstOfRole(resolved, 'description');
  const descriptionValue = descriptionAttribute
    ? getValueAtPath(item, descriptionAttribute.path)
    : null;

  const hasBody = descriptionValue != null || badges.length > 0;
  const body = hasBody && (
    <>
      {descriptionValue != null && (
        <p className="description">{String(descriptionValue)}</p>
      )}
      {badges.length > 0 && (
        <div className="card__attributes badges">
          {badges.map((attribute) => {
            const value = formatAttributeValue(
              getAttributeValue(item, attribute.path),
              attribute.path,
              binding
            );
            return onAttributeClick ? (
              <button
                key={attribute.path}
                type="button"
                className="badge"
                onClick={() => onAttributeClick(attribute.path, value, item)}
              >
                <span className="badge__label">{attributeLabel(attribute.path, binding)}</span>
                {value}
              </button>
            ) : (
              <span key={attribute.path} className="badge">
                <span className="badge__label">{attributeLabel(attribute.path, binding)}</span>
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

interface EntityDetailProps {
  item: BoundEntity;
  binding: EntityBinding;
  shownAttributes: AttributePath[];
  children?: React.ReactNode;
}

/**
 * The detail counterpart of `EntityCard`, reading the same `shownAttributes`
 * contract: identity attributes take their dedicated slots (title a heading,
 * description a paragraph), everything else becomes a description-list row.
 *
 * The card compresses a chosen subset and this expands one; because both are
 * driven by an attribute list rather than a fixed layout, a pair of views can
 * be composed by set arithmetic — which is what makes a detail that omits what
 * its overview already carries a filter rather than a special case.
 */
export function EntityDetail({ item, binding, shownAttributes, children }: EntityDetailProps) {
  const resolved = resolveAttributeSelection(binding, shownAttributes);
  const rows = resolved.filter((attribute) => !isIdentity(attribute));

  const titleAttribute = firstOfRole(resolved, 'title');
  const titleValue = titleAttribute ? getValueAtPath(item, titleAttribute.path) : null;
  // The heading's icon comes from the binding's thumbnail attribute whether
  // or not the selection names it — a detail identifies its item.
  const thumbnailAttribute = firstOfRole(binding.attributes, 'thumbnail');
  const thumbnailValue = thumbnailAttribute
    ? getValueAtPath(item, thumbnailAttribute.path)
    : null;

  const descriptionAttribute = firstOfRole(resolved, 'description');
  const descriptionValue = descriptionAttribute
    ? getValueAtPath(item, descriptionAttribute.path)
    : null;

  return (
    <>
      {titleValue != null && (
        <h4 className="label flex">
          {typeof thumbnailValue === 'string' && thumbnailValue !== '' && (
            <iconify-icon
              className="icon"
              icon={thumbnailValue}
              aria-hidden="true"
            ></iconify-icon>
          )}
          {String(titleValue)}
        </h4>
      )}
      {descriptionValue != null && (
        <p className="description">{String(descriptionValue)}</p>
      )}
      {rows.length > 0 && (
        <dl className="description-list">
          {rows.map((attribute) => (
            <React.Fragment key={attribute.path}>
              <dt>{attributeLabel(attribute.path, binding)}</dt>
              <dd>
                {formatAttributeValue(
                  getAttributeValue(item, attribute.path),
                  attribute.path,
                  binding
                )}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      )}
      {children}
    </>
  );
}

/** The full readout a detail carries when it has a view to itself — the
    binding's `mid` rung plus the title, as an attribute set. */
function detailAttributes(binding: EntityBinding): AttributePath[] {
  const titlePaths = binding.attributes
    .filter((attribute) => attribute.role === 'title')
    .map((attribute) => attribute.path);
  return [...titlePaths, ...binding.scopes.mid].filter(
    (path, index, all) => all.indexOf(path) === index
  );
}

interface InPlaceDetailProps {
  item: BoundEntity;
  binding: EntityBinding;
  /** What the host row is already showing — subtracted from the readout. */
  overviewAttributes: AttributePath[];
  /** Anything the detail carries besides the readout, e.g. a corner toolbar. */
  children?: React.ReactNode;
}

/**
 * The detail opened inside the row it was picked from. In place, the detail
 * is the only thing standing between the row and itself: it opens directly
 * beneath attributes the row is still showing, so its readout is the full set
 * minus whatever the overview already carries. The subtraction is a set
 * operation rather than a rule about titles because the overview's attribute
 * set is not fixed — surface another attribute into the rows and the detail
 * gives that one up too, without anybody editing a list of exceptions. The
 * other layouts separate the two views spatially, the repetition reads as
 * orientation rather than noise, and they keep the full readout.
 *
 * Spacing is the detail's own (`.card > .detail` in view-family.css: full
 * width, its own inset, a top border).
 */
export function InPlaceDetail({ item, binding, overviewAttributes, children }: InPlaceDetailProps) {
  const overviewPaths = new Set(
    resolveAttributeSelection(binding, overviewAttributes).map(
      (attribute) => attribute.path
    )
  );
  const shownAttributes = detailAttributes(binding).filter(
    (path) => !overviewPaths.has(path)
  );
  return (
    <article className="detail flow" aria-label="Detail">
      {children}
      <EntityDetail item={item} binding={binding} shownAttributes={shownAttributes} />
    </article>
  );
}

/** Cards in the arrangement's geometry: a grid by default, a single column
    when `arrangement.layout` is 'list'. One block, two population shapes. */
export function CardRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding } = props;
  const card = (item: T) => (
    <EntityCard
      item={item}
      binding={binding}
      shownAttributes={spec.representation.shownAttributes}
      selectedId={props.selectedId}
      onItemSelect={props.onItemSelect}
      focusedId={props.focusedId}
      onItemFocus={props.onItemFocus}
    />
  );

  if (spec.arrangement.layout === 'list') {
    return (
      <section className="cards cards--list">
        {items.map((item) => (
          <div key={item.id}>{card(item)}</div>
        ))}
      </section>
    );
  }
  return (
    <ul className="cards layout-grid">
      {items.map((item) => (
        <li key={item.id}>{card(item)}</li>
      ))}
    </ul>
  );
}

export function TableRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding, selectedId, onItemSelect, focusedId, onItemFocus } = props;
  const resolved = resolveAttributeSelection(binding, spec.representation.shownAttributes);
  const identityColumns = resolved.filter((attribute) => isIdentity(attribute));
  const metadataColumns = resolved.filter((attribute) => !isIdentity(attribute));
  const columns = [...identityColumns, ...metadataColumns];
  const numericClass = (column: AttributeBinding) =>
    isNumericValueType(column.valueType) ? 'pp-table-align-right' : '';

  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.path} className={numericClass(column)}>
                {attributeLabel(column.path, binding)}
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
                  getAttributeValue(item, column.path),
                  column.path,
                  binding
                );
                return (
                  <td key={column.path} className={numericClass(column)}>
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

export function MapRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, binding, selectedId, onItemSelect } = props;
  const ref = useRef<MapComponent | null>(null);
  const locations = useMemo(() => toMapLocations(items, binding), [items, binding]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.locations = locations;
    el['selected-id'] = selectedId ?? '';
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

/** First two shown attributes that are numeric in the data become the axes;
    the fallback pair is the binding's first two numeric attributes. */
export function pickPlotAxes(
  items: BoundEntity[],
  spec: ViewSpec,
  binding: EntityBinding
): [AttributePath, AttributePath] | null {
  const bindingNumeric = binding.attributes
    .filter((attribute) => isNumericValueType(attribute.valueType))
    .map((attribute) => attribute.path);
  const fallback: [AttributePath, AttributePath] | null =
    bindingNumeric.length >= 2 ? [bindingNumeric[0], bindingNumeric[1]] : null;

  const sample = items[0];
  if (!sample) return fallback;
  const numeric = resolveAttributeSelection(binding, spec.representation.shownAttributes)
    .map((attribute) => attribute.path)
    .filter((path) => typeof getAttributeValue(sample, path) === 'number');
  if (numeric.length < 2) return fallback;
  return [numeric[0], numeric[1]];
}

export function PlotRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding, onItemSelect, onItemFocus } = props;
  const ref = useRef<ScatterPlot | null>(null);
  const axes = pickPlotAxes(items, spec, binding);
  const xPath = axes?.[0];
  const yPath = axes?.[1];
  const points = useMemo(
    () => (xPath && yPath ? toPlotPoints(items, binding, xPath, yPath) : []),
    [items, binding, xPath, yPath]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !xPath || !yPath) return;
    el.data = {
      data: points,
      xAxisLabel: attributeLabel(xPath, binding),
      yAxisLabel: attributeLabel(yPath, binding),
    };
    el['show-axes'] = true;
  }, [points, xPath, yPath, binding]);

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

export const REPRESENTATIONS: Record<
  RepresentationType,
  (props: RendererProps) => React.JSX.Element
> = {
  card: CardRenderer,
  table: TableRenderer,
  map: MapRenderer,
  plot: PlotRenderer,
};

interface BoardLanesProps<T extends BoundEntity = BoundEntity> extends ItemCoupling<T> {
  groups: Map<string, T[]>;
  spec: ViewSpec;
  binding: EntityBinding;
  /** Pre-seeded lane labels so empty lanes stay visible as write destinations. */
  laneLabels?: string[];
  /** Modifier on the board block — `.board--sections` rotates lanes to sections. */
  className?: string;
  renderItem?: (item: T, lane: string) => React.ReactNode;
  /**
   * Renders the lane's `.board__column` element itself, given its contents —
   * the hook a writable board uses to make the lane a drop target without
   * re-implementing the shared markup. The contents lead with the `<summary>`,
   * so whatever this returns has to be a `<details>`.
   */
  renderLane?: (lane: string, content: React.ReactNode) => React.ReactNode;
}

export function BoardLanes<T extends BoundEntity>({
  groups,
  spec,
  binding,
  laneLabels,
  className,
  renderItem,
  renderLane,
  ...coupling
}: BoardLanesProps<T>) {
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
                    <EntityCard
                      item={item}
                      binding={binding}
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
    props: RendererProps<T>
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
