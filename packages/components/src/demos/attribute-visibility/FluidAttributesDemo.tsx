import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '@shared/data/types';
import { loadElementAdapter } from '../../utility/dnd';
import {
  getAttributeValue,
  formatAttributeValue,
  getAvailableAttributes,
} from '../../templates/collection-view/AttributeUtils';
import { sortItems } from '../../templates/collection-view/SortingUtils';
import { products } from '../../templates/collection-view/data';
import { EntityCard } from '../../templates/collection-view/renderers';
import { productBinding } from '@shared/data/bindings';
import { attributeLabel } from '../../templates/collection-view/AttributeUtils';
import {
  AttributeSelector,
  SortingControls,
  ProductFilters,
  generateAttributeFilterCategories,
} from '../data-view';
import { applyFilters } from '../../templates/collection-view/FilterOperations';
import {
  ProductFilterOperator,
  type ProductFilter,
} from '../../templates/collection-view/FilterTypes';
import type { AttributePath, SortClause } from '../../templates/collection-view/spec';
import { useFitsWidth } from '../../hooks/use-fits-width';

/**
 * Fluid attributes over an overview–detail pair. The opening state honours
 * the evidence: the overview shows little beyond price — everyone lives
 * under its attribute ceiling. Any attribute in the detail readout can be
 * surfaced into every overview item by dragging its row across; the eye
 * dropdown is the settled form of the same control — it lists what the
 * overview carries, so unchecking one removes it again. Surfaced attributes
 * are then operable: sort by what you surfaced, click a value to filter by
 * it — the observed surface-then-sort and surface-then-filter workflows.
 * Filtering here is [filtering](/patterns/filtering)'s own clause type and
 * matcher, keyed on the attribute path rather than a curated category, so a
 * surfaced attribute is filterable the moment it appears.
 *
 * When the host narrows to a pane, side-by-side stops fitting: the detail
 * moves into a non-modal drawer that a selection opens. Because it doesn't
 * block the page, the overview stays a live drop target — a row can still be
 * dragged from the drawer back onto it.
 */

const OPENING_ATTRIBUTES: AttributePath[] = ['name', 'category', 'pricing.msrp'];

// The count isn't the point — a handful of items is enough to show the ceiling
// lift and keeps the overview from swallowing the page.
const CATALOGUE = products.slice(0, 7);

interface AttributeRowProps {
  attribute: AttributePath;
  value: string;
  locked: boolean;
}

/** A description-list row (label + value) that doubles as a drag source. */
function AttributeRow({ attribute, value, locked }: AttributeRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || locked) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadElementAdapter().then(({ draggable }) => {
      if (cancelled) return;
      cleanup = draggable({
        element,
        getInitialData: () => ({ attribute }),
        onDragStart: () => setDragging(true),
        onDrop: () => setDragging(false),
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [attribute, locked]);

  return (
    <div ref={ref} data-dragging={dragging || undefined}>
      <dt>{attributeLabel(attribute)}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export interface FluidAttributesDemoProps {
  /** Expose the spec's malleability block and let it be toggled off. */
  exposeMalleability?: boolean;
}

export function FluidAttributesDemo({ exposeMalleability = false }: FluidAttributesDemoProps) {
  const [shownAttributes, setShownAttributes] = useState<AttributePath[]>(OPENING_ATTRIBUTES);
  const [selectedId, setSelectedId] = useState<string>(CATALOGUE[0].id);
  const [sortBy, setSortBy] = useState<SortClause | null>(null);
  // The query the actor builds by clicking values — `spec.query`'s own type, so
  // the same clauses and the same matcher the rest of the family filters with.
  const [filters, setFilters] = useState<ProductFilter[]>([]);
  const [locked, setLocked] = useState(false);
  const [dropReady, setDropReady] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const overviewRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const detailDialogRef = useRef<HTMLDialogElement>(null);

  // Mirror the `.odi` collapse breakpoint (@container demo (inline-size < 40rem)):
  // once side-by-side no longer fits, the detail becomes a drawer instead.
  const isNarrow = !useFitsWidth(rootRef, 640); // 40rem at a 16px root

  const availableAttributes = useMemo(() => getAvailableAttributes(products), []);
  const selected = CATALOGUE.find((candidate) => candidate.id === selectedId) ?? CATALOGUE[0];

  // The set the actor curates: everything except the identity/name the cards
  // always keep and the description the detail header already shows. Both the
  // drag rows and the eye dropdown operate over this same set.
  const surfaceable = useMemo(
    () => availableAttributes.filter((attribute) => attribute !== 'name' && attribute !== 'description'),
    [availableAttributes]
  );
  const selectedAttributes = useMemo(() => new Set(shownAttributes), [shownAttributes]);

  // Each surfaceable attribute is a filter category over the values this
  // collection shows, so a clause built by clicking one value can be widened to
  // the others from the chip — the same affordance category filters have.
  const attributeCategories = useMemo(
    () => generateAttributeFilterCategories(CATALOGUE, surfaceable),
    [surfaceable]
  );

  const surface = (attribute: AttributePath) =>
    setShownAttributes((current) =>
      current.includes(attribute) ? current : [...current, attribute]
    );

  // Clicking a value narrows by it. Clicking another value on an attribute
  // already filtered widens that clause to the alternatives rather than
  // replacing it — one filter per attribute, however many clicks.
  const filterByValue = (attribute: AttributePath, value: string) =>
    setFilters((current) => {
      const existing = current.find((filter) => filter.type === attribute);
      if (!existing) {
        return [
          ...current,
          {
            id: attribute,
            type: attribute,
            operator: ProductFilterOperator.EQUALS,
            value: [value],
          },
        ];
      }
      if (existing.value.includes(value)) return current;
      return current.map((filter) =>
        filter === existing
          ? {
              ...filter,
              operator: ProductFilterOperator.IS_ANY_OF,
              value: [...filter.value, value],
            }
          : filter
      );
    });

  const toggle = (attribute: string) => {
    if (locked) return;
    setShownAttributes((current) =>
      current.includes(attribute as AttributePath)
        ? current.filter((candidate) => candidate !== attribute)
        : [...current, attribute as AttributePath]
    );
  };

  useEffect(() => {
    const element = overviewRef.current;
    if (!element || locked) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    loadElementAdapter().then(({ dropTargetForElements }) => {
      if (cancelled) return;
      cleanup = dropTargetForElements({
        element,
        onDragEnter: () => setDropReady(true),
        onDragLeave: () => setDropReady(false),
        onDrop: ({ source }) => {
          setDropReady(false);
          const attribute = source.data.attribute;
          if (typeof attribute === 'string') surface(attribute);
        },
      });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [locked]);

  // Leaving the narrow layout dismisses the drawer — the detail returns to the aside.
  useEffect(() => {
    if (!isNarrow && detailOpen) setDetailOpen(false);
  }, [isNarrow, detailOpen]);

  // Drive the native dialog from React state. It opens non-modal (`show()`, not
  // `showModal()`) so the overview stays live behind it — that's what lets a chip
  // be dragged from the drawer back onto the overview. The dialog is portalled to
  // <body> (below) so the pane's container-type can't trap the fixed panel.
  useEffect(() => {
    const dialog = detailDialogRef.current;
    if (!dialog) return;
    if (detailOpen && !dialog.open) dialog.show();
    else if (!detailOpen && dialog.open) dialog.close();
  }, [detailOpen, isNarrow]);

  // A non-modal dialog doesn't close on Escape on its own; wire it while open.
  useEffect(() => {
    if (!detailOpen) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDetailOpen(false);
    };
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  }, [detailOpen]);

  const selectItem = (target: Product) => {
    setSelectedId(target.id);
    if (isNarrow) setDetailOpen(true);
  };

  const visibleItems = useMemo(() => {
    const items: Product[] = applyFilters(CATALOGUE, filters);
    return sortBy ? sortItems(items, sortBy.field, sortBy.order) : items;
  }, [sortBy, filters]);

  const sortableAttributes = shownAttributes.filter((attribute) => attribute !== 'description');

  const detailList = (
    <dl className="description-list description-list--draggable">
      {surfaceable.map((attribute) => {
        const value = getAttributeValue(selected, attribute);
        if (value === undefined || value === null) return null;
        return (
          <AttributeRow
            key={attribute}
            attribute={attribute}
            value={formatAttributeValue(value, attribute)}
            locked={locked}
          />
        );
      })}
    </dl>
  );

  return (
    <div className="flow" ref={rootRef}>
      <div className="toolbar">
        <SortingControls
          availableFields={sortableAttributes}
          currentField={sortBy?.field ?? 'name'}
          currentOrder={sortBy?.order ?? 'asc'}
          onSortChange={(field, order) => setSortBy({ field: field as AttributePath, order })}
        />

        {!locked && (
          <AttributeSelector
            availableAttributes={surfaceable}
            selectedAttributes={selectedAttributes}
            onAttributeToggle={toggle}
          />
        )}

        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          filterCategories={attributeCategories}
        />

        {exposeMalleability && (
          <button
            type="button"
            className="button button--plain"
            aria-pressed={locked}
            onClick={() => setLocked((current) => !current)}
          >
            {locked ? 'malleability: { content: { disabled: true } }' : 'malleability: on'}
          </button>
        )}
      </div>

      <div className="odi">
        <div
          ref={overviewRef}
          className="view-family__pane"
          data-drop-over={dropReady || undefined}
          aria-label="Overview"
        >
          <section className="cards cards--list">
            {visibleItems.map((item) => (
              <div key={item.id}>
                <EntityCard
                  item={item}
                  binding={productBinding}
                  shownAttributes={shownAttributes}
                  selectedId={selectedId}
                  onItemSelect={selectItem}
                  onAttributeClick={filterByValue}
                />
              </div>
            ))}
          </section>
        </div>

        {!isNarrow && (
          <aside className="view-family__pane layer" aria-label="Detail">
            <h4 className="label">{selected.name}</h4>
            <p className="description">{selected.description}</p>
            {detailList}
          </aside>
        )}
      </div>

      {/* The detail drawer reuses the canonical `dialog.drawer` presentation but is
          driven from React rather than through `modalService` (its rows share
          `shownAttributes` with the overview, which a separate modal root would render
          stale) and is deliberately not wrapped in `pp-modal` (whose trigger wiring
          assumes buttons that open the drawer, not interactive content). Portalled to
          <body> so the pane's container-type can't trap the fixed panel. */}
      {isNarrow &&
        createPortal(
          <dialog
            ref={detailDialogRef}
            className="drawer drawer--right"
            data-modal="false"
            aria-label="Detail"
            onClose={() => setDetailOpen(false)}
          >
            <header>
              <h4 className="label">{selected.name}</h4>
              <button
                type="button"
                className="button button--plain"
                aria-label="Close detail"
                onClick={() => setDetailOpen(false)}
              >
                <iconify-icon icon="ph:x"></iconify-icon>
              </button>
            </header>
            <article>
              <p className="description">{selected.description}</p>
              {detailList}
            </article>
          </dialog>,
          document.body
        )}
    </div>
  );
}

/** The same demo with the malleability block exposed — malleability.mdx's borrow. */
export function FluidAttributesMalleabilityDemo() {
  return <FluidAttributesDemo exposeMalleability />;
}
