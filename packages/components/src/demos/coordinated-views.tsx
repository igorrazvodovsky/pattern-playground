import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ItemView } from '../components/item-view/ItemView';
import { ContentAdapterProvider } from '../components/item-view/ContentAdapterRegistry';
import { productAdapter, productToItemObject } from '../components/item-view/adapters';
import type { ScatterPlot } from '../components/charts/scatter-plot.js';
import type { Product } from '@shared/data/types';
import { products, toPlotPoints } from '../templates/collection-view/data';
import {
  ProductCard,
  ProductDetail,
  MapRenderer,
  attributeLabel,
} from '../templates/collection-view/renderers';
import type { AttributePath } from '../templates/collection-view/spec';
import { makeSpec } from '../templates/collection-view/spec';
import '../jsx-types';

/**
 * Several projections of one model, coupled so designation propagates.
 * Hover moves focus — a transient highlight everywhere the item appears.
 * Click stakes a selection — marked in every view until released.
 *
 * What the coupling needs from the layout is co-visibility: propagation is
 * only legible if both populations are on screen when the actor designates
 * something. Three panes side by side give that for free; stacked in a column
 * they take it away, because clicking a row scrolls the map it lit off the
 * top. So the narrow layout is not the wide one reflowed.
 *
 * Narrow, the map keeps a short strip above the list — both populations still
 * in view, the pin lighting directly above the row that lit it — and the
 * detail gives up its pane, opening in place inside the row it was picked
 * from. Detail is the one that can afford to go: it shows a single item, so
 * "propagation to the detail" is only ever "the detail updates", where
 * list↔map is two populations marking each other. This is Baldonado's fourth
 * guideline taken literally: space is spent on the coupling that needs it.
 */

const LIST_ATTRIBUTES: AttributePath[] = ['name', 'category', 'pricing.msrp'];

const DETAIL_ATTRIBUTES: AttributePath[] = [
  'name',
  'description',
  'availability.status',
  'pricing.msrp',
  'condition',
  'category',
  'location.site',
  'sustainability.carbonFootprint',
  'lifecycle.repairability',
];

/**
 * What the detail carries when it opens inside the row it was picked from.
 * Given a pane of its own the detail repeats the row's name and price and the
 * repetition reads as orientation; touching the row it reads as noise. So the
 * in-place readout is the full set minus whatever the row is already showing.
 */
const IN_PLACE_ATTRIBUTES = DETAIL_ATTRIBUTES.filter(
  (attribute) => !LIST_ATTRIBUTES.includes(attribute)
);

/**
 * The trio runs on a slice rather than the whole collection. Stacked, the list
 * has to stay short enough that the map above it is still on screen when the
 * bottom row is picked — otherwise the pin lights where nobody is looking, and
 * the demo stops demonstrating the one thing it is for. `pp-map` won't go
 * below 20rem, so the list is what gives: five rows keeps the last one inside
 * a laptop viewport.
 */
const trioProducts = products.slice(0, 5);

const trioMapSpec = makeSpec({
  id: 'linked-trio-map',
  representation: { type: 'map', rung: 'glyph', shownAttributes: ['name'] },
});

// 40rem at a 16px root — where three panes stop fitting side by side.
const TRIO_PANES_MIN = 640;

export function LinkedTrioDemo() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(trioProducts[0].id);
  const [roomForPanes, setRoomForPanes] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  // A container query can restyle the trio but can't reparent it: the detail
  // is a sibling pane in one layout and a child of the picked row in the
  // other. So the breakpoint is measured here and drives both.
  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = (width: number) => setRoomForPanes(width >= TRIO_PANES_MIN);
    measure(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const selected = trioProducts.find((candidate) => candidate.id === selectedId);

  const toggleSelect = (item: Product) =>
    setSelectedId((current) => (current === item.id ? null : item.id));

  const emptyDetail = (
    <p className="muted">
      Click an item in any view to stake a selection; hover for a transient
      highlight.
    </p>
  );

  /* The pane detail: a view of its own, so `ItemView`'s fixed `mid` readout
     is what it wants. */
  const paneDetail = selected ? (
    <ItemView
      item={productToItemObject(selected)}
      contentType="product"
      scope="mid"
      mode="preview"
    />
  ) : (
    emptyDetail
  );

  const list = (
    <section className="cards cards--list" aria-label="List">
      {trioProducts.map((item) => (
        <div key={item.id}>
          <ProductCard
            item={item}
            shownAttributes={LIST_ATTRIBUTES}
            selectedId={selectedId}
            onItemSelect={toggleSelect}
            focusedId={focusedId}
            onItemFocus={(target) => setFocusedId(target?.id ?? null)}
          >
            {/* The detail governs its own spacing (`.card > .detail` in
                view-family.css: full width, its own inset, a top border). */}
            {!roomForPanes && item.id === selectedId && (
              <article className="detail flow" aria-label="Detail">
                {/* Rendered from an attribute set rather than through
                    `ItemView`: only here does the detail need to be the
                    complement of what the row is already carrying. */}
                <ProductDetail item={item} shownAttributes={IN_PLACE_ATTRIBUTES} />
              </article>
            )}
          </ProductCard>
        </div>
      ))}
    </section>
  );

  const map = (
    <MapRenderer
      items={trioProducts}
      spec={trioMapSpec}
      selectedId={selectedId}
      onItemSelect={toggleSelect}
    />
  );

  return (
    <ContentAdapterProvider adapters={[productAdapter]}>
      <div className="flow" ref={rootRef}>
        {roomForPanes ? (
          <div className="view-family__panes">
            <div className="view-family__pane">{list}</div>
            {/* A `section`, not a `div`: an `aria-label` only names an
                element that has a role to name. */}
            <section className="view-family__pane" aria-label="Map">
              {map}
            </section>
            <aside className="view-family__pane layer flow" aria-label="Detail">
              {paneDetail}
            </aside>
          </div>
        ) : (
          /* Map above list, not beside it: the strip is short enough that the
             row and the pin it lights stay in view together. */
          <div className="view-family__trio-stack">
            <section aria-label="Map">{map}</section>
            {list}
            {!selected && emptyDetail}
          </div>
        )}
      </div>
    </ContentAdapterProvider>
  );
}

/**
 * Cross-filtering, product-first: a price brush over the plot (price ×
 * carbon footprint) prunes the list; points outside the brushed range stay
 * in the plot but drop back to grey, so the framing stays visible.
 */

const X_PATH = 'pricing.msrp';
const Y_PATH = 'sustainability.carbonFootprint';

export function CrossFilteringDemo() {
  const chartRef = useRef<ScatterPlot | null>(null);
  const [range, setRange] = useState<[number, number]>([0, 4000]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [min, max] = range;

  const inRange = useMemo(
    () =>
      products.filter((item) => {
        const price = item.metadata.pricing.msrp;
        return price >= min && price <= max;
      }),
    [min, max]
  );

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const points = toPlotPoints(products, X_PATH, Y_PATH).map((point) =>
      point.x >= min && point.x <= max
        ? point
        : { ...point, color: 'var(--c-neutral-300)' }
    );
    el.data = {
      data: points,
      xAxisLabel: `${attributeLabel(X_PATH)} ($)`,
      yAxisLabel: `${attributeLabel(Y_PATH)} (kg CO2e)`,
    };
  }, [min, max]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const handleClick = (event: Event) => {
      const point = (event as CustomEvent<{ data: { id?: string } }>).detail?.data;
      if (point?.id) {
        setSelectedId((current) => (current === point.id ? null : point.id ?? null));
      }
    };
    el.addEventListener('pp-point-click', handleClick);
    return () => el.removeEventListener('pp-point-click', handleClick);
  }, []);

  return (
    <div className="flow">
      <div className="toolbar">
        <label className="flex">
          From $
          <input
            type="range"
            min={0}
            max={4000}
            step={50}
            value={min}
            onChange={(event) =>
              setRange([Math.min(Number(event.target.value), max), max])
            }
          />
          <span>{min}</span>
        </label>
        <label className="flex">
          To $
          <input
            type="range"
            min={0}
            max={4000}
            step={50}
            value={max}
            onChange={(event) =>
              setRange([min, Math.max(Number(event.target.value), min)])
            }
          />
          <span>{max}</span>
        </label>
        <span className="muted" aria-live="polite">
          {inRange.length} of {products.length} in the brushed range
        </span>
      </div>

      <div className="view-family__panes">
        <pp-scatter-plot ref={chartRef} />
        <div className="view-family__pane" aria-label="List">
          <section className="cards cards--list">
            {inRange.map((item) => (
              <div key={item.id}>
                <ProductCard
                  item={item}
                  shownAttributes={LIST_ATTRIBUTES}
                  selectedId={selectedId}
                  onItemSelect={(target) =>
                    setSelectedId((current) => (current === target.id ? null : target.id))
                  }
                />
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
