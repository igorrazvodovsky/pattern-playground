import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Product } from '@shared/data/types';
import componentsData from '@shared/data/components.json' with { type: 'json' };
import materialsData from '@shared/data/materials.json' with { type: 'json' };
import { ItemView } from '../components/item-view/ItemView';
import { ContentAdapterProvider } from '../components/item-view/ContentAdapterRegistry';
import { productAdapter, productToItemObject } from '../components/item-view/adapters';
import { products } from '../templates/collection-view/data';
import { ProductCard, ProductDetail } from '../templates/collection-view/renderers';
import type { AttributePath } from '../templates/collection-view/spec';
import '../components/dropdown/dropdown.ts';
import '../components/list/list.ts';
import '../components/list-item/list-item.ts';
import 'iconify-icon';
import '../jsx-types';

/**
 * One spec pair — a compressed overview and a full detail — run through the
 * four layout values of the detail invocation: in place, side by side,
 * popover, and new page. The layout switcher is the demo's argument: the
 * pattern is the coupled pair, and simultaneity is one value of one
 * dimension. The new-page case is the list-page → item-page roundtrip with
 * the place kept on return.
 *
 * Two things the demo argues by behaving rather than by saying:
 *
 * Where the switcher lives. It isn't a toolbar outside both views — it is a
 * corner control on the detail itself, so the layout is re-chosen from the
 * thing being laid out. Same affordance as the comment popover's "open in
 * drawer", and the reason a detail is always showing: it hosts its own
 * control.
 *
 * That the layout dimension is not free. Side by side needs width the demo's
 * host may not have — embedded in a pane it never has it. Rather than let the
 * label lie (the `.odi` grid silently collapses to one column below 40rem),
 * the option reports itself unavailable and the detail falls back to in
 * place, which needs no width at all.
 */

const OVERVIEW_ATTRIBUTES: AttributePath[] = ['name', 'category', 'pricing.msrp'];

/** What the detail carries when it has a view to itself — the `mid` readout. */
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
 * In place, the detail is the only thing standing between the row and itself:
 * it opens directly beneath attributes the row is still showing, so the name,
 * category and price would be printed twice a line apart. The other layouts
 * separate the two views spatially and the repetition reads as orientation
 * rather than noise, so they keep the full readout.
 *
 * The subtraction is a set operation rather than a rule about titles because
 * the overview's attribute set is not fixed — surface another attribute into
 * the rows (see attribute visibility) and the detail should give up that one
 * too, without anybody editing a list of exceptions.
 */
const IN_PLACE_ATTRIBUTES = DETAIL_ATTRIBUTES.filter(
  (attribute) => !OVERVIEW_ATTRIBUTES.includes(attribute)
);

type DetailLayout = 'inline' | 'side-by-side' | 'popover' | 'new-page';

const LAYOUTS: { value: DetailLayout; label: string; icon: string }[] = [
  { value: 'inline', label: 'In place', icon: 'ph:rows' },
  { value: 'side-by-side', label: 'Side by side', icon: 'ph:columns' },
  { value: 'popover', label: 'Popover', icon: 'ph:chat-teardrop' },
  { value: 'new-page', label: 'New page', icon: 'ph:arrow-square-out' },
];

// 40rem at a 16px root — the width `.odi` gives up its second column at.
const SIDE_BY_SIDE_MIN = 640;

interface DetailToolbarProps {
  /** The layout in force, not the one last asked for — the tick reports what
      the actor is looking at. */
  layout: DetailLayout;
  roomForSideBySide: boolean;
  onChange: (layout: DetailLayout) => void;
}

/** The corner control every detail carries, whichever host it is showing in. */
function DetailToolbar({ layout, roomForSideBySide, onChange }: DetailToolbarProps) {
  return (
    <div className="detail__toolbar">
      <pp-dropdown placement="bottom-end" hoist>
        <button
          type="button"
          className="button button--plain"
          is="pp-button"
          slot="trigger"
          title="View settings"
        >
          <iconify-icon className="icon" icon="ph:sliders-horizontal"></iconify-icon>
          <span className="visually-hidden">View settings</span>
        </button>
        <pp-list>
          {LAYOUTS.map(({ value, label, icon }) => {
            const unavailable = value === 'side-by-side' && !roomForSideBySide;
            return (
              <pp-list-item
                key={value}
                type="checkbox"
                checked={layout === value}
                disabled={unavailable || undefined}
                onClick={() => !unavailable && onChange(value)}
              >
                <iconify-icon slot="prefix" className="icon" icon={icon}></iconify-icon>
                {label}
              </pp-list-item>
            );
          })}
        </pp-list>
      </pp-dropdown>
    </div>
  );
}

export function OverviewDetailDemo() {
  // In place is the value that needs no width, so it is the one the demo can
  // always honour. Side by side is a choice the actor makes when there's room.
  const [layout, setLayout] = useState<DetailLayout>('inline');
  const [selectedId, setSelectedId] = useState<string>(products[0].id);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [pageOpen, setPageOpen] = useState(false);
  const [roomForSideBySide, setRoomForSideBySide] = useState(true);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLElement>(null);

  // A container query can restyle the pair but can't reparent it: side by side
  // and in place are different trees (a sibling column vs. a child of the
  // card). So the same breakpoint is measured here and drives the fallback.
  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = (width: number) => setRoomForSideBySide(width >= SIDE_BY_SIDE_MIN);
    measure(element.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) measure(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The chosen layout is what the actor asked for; the effective one is what
  // the host can carry. Side by side is the only value with a width cost.
  const effective: DetailLayout =
    layout === 'side-by-side' && !roomForSideBySide ? 'inline' : layout;

  const index = products.findIndex((candidate) => candidate.id === selectedId);
  const selected = products[index] ?? products[0];

  const step = (delta: number) => {
    const next = products[(index + delta + products.length) % products.length];
    setSelectedId(next.id);
  };

  const pick = (id: string) => {
    // Picking a row always shows its detail; closing belongs to the popup's
    // light dismiss. Toggling here instead would race it — the platform
    // dismisses on `pointerdown`, before this row's `click` ever runs, so a
    // toggle reads state the dismissal has already changed and the popover
    // lands shut on the row the actor just picked.
    if (effective === 'popover') setPopoverOpen(true);
    if (effective === 'new-page') setPageOpen(true);
    setSelectedId(id);
  };

  const switchLayout = (value: DetailLayout) => {
    setLayout(value);
    setPopoverOpen(false);
    setPageOpen(false);
  };

  const toolbar = (
    <DetailToolbar
      layout={effective}
      roomForSideBySide={roomForSideBySide}
      onChange={switchLayout}
    />
  );

  // `light-dismiss` lets the platform close the popup; the demo follows it back
  // into its own state rather than tracking outside clicks itself.
  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    const onHide = () => setPopoverOpen(false);
    popup.addEventListener('pp-hide', onHide);
    return () => popup.removeEventListener('pp-hide', onHide);
  }, []);

  if (effective === 'new-page' && pageOpen) {
    return (
      <ContentAdapterProvider adapters={[productAdapter]}>
        <div className="flow" ref={rootRef}>
          <button
            type="button"
            className="button button--plain"
            onClick={() => setPageOpen(false)}
          >
            ← Back to the collection
          </button>
          <div className="detail">
            {toolbar}
            <ItemView
              item={productToItemObject(selected)}
              contentType="product"
              scope="maxi"
              mode="preview"
            />
          </div>
        </div>
      </ContentAdapterProvider>
    );
  }

  const overview = (
    <section className="cards cards--list" aria-label="Overview">
      {products.map((item) => {
        const current = item.id === selectedId;
        return (
          <div
            key={item.id}
            /* The current row is the popover's anchor; only one is open at a
               time, so a single element reference covers the whole list. */
            ref={effective === 'popover' && current ? setPopoverAnchor : undefined}
          >
            <ProductCard
              item={item}
              shownAttributes={OVERVIEW_ATTRIBUTES}
              selectedId={selectedId}
              onItemSelect={(target) => pick(target.id)}
            >
              {/* In place: the card grows to carry the full readout, so the
                  current item never leaves the row it was picked from. */}
              {effective === 'inline' && current && (
                /* An `article`, not a `div`: the card's blanket child-padding
                   rule exempts nested articles, so the detail governs its own. */
                <article className="detail flow" aria-label="Detail">
                  {toolbar}
                  {/* Rendered from an attribute set rather than through
                      `ItemView`, which lays out a fixed `mid` readout: only
                      here does the detail need to be the complement of what
                      its overview is already carrying. */}
                  <ProductDetail item={item} shownAttributes={IN_PLACE_ATTRIBUTES} />
                </article>
              )}
            </ProductCard>
          </div>
        );
      })}
    </section>
  );

  return (
    <ContentAdapterProvider adapters={[productAdapter]}>
      <div className="flow" ref={rootRef}>
        {effective === 'side-by-side' ? (
          <div className="odi">
            {overview}
            <aside className="view-family__pane layer detail flow" aria-label="Detail">
              {toolbar}
              <div className="flex">
                <button
                  type="button"
                  className="button button--plain"
                  aria-label="Previous item"
                  onClick={() => step(-1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="button button--plain"
                  aria-label="Next item"
                  onClick={() => step(1)}
                >
                  ›
                </button>
              </div>
              <ItemView
                item={productToItemObject(selected)}
                contentType="product"
                scope="mid"
                mode="preview"
              />
            </aside>
          </div>
        ) : (
          overview
        )}

        {/* The popover detail. `top-layer` is what makes it work inside a pane:
            the popup goes to the browser's top layer, so it is neither clipped
            by the scrolling pane nor out-painted by the rows it overlaps.
            `light-dismiss` hands outside-click and Escape to the platform. */}
        <pp-popup
          ref={popupRef}
          anchor={popoverAnchor ?? undefined}
          active={effective === 'popover' && popoverOpen}
          placement="bottom-start"
          distance={8}
          flip
          shift
          top-layer=""
          light-dismiss=""
        >
          {/* `.popover` is the catalogue's panel skin — border, shadow,
              background, padding. `pp-popup` only positions. */}
          <div className="popover detail flow" role="dialog" aria-label={`${selected.name} — detail`}>
            {toolbar}
            <ItemView
              item={productToItemObject(selected)}
              contentType="product"
              scope="mid"
              mode="preview"
            />
          </div>
        </pp-popup>
      </div>
    </ContentAdapterProvider>
  );
}

/**
 * The composition dimension, in its recursive form: the pattern nests inside
 * its own detail views. A product's detail carries an overview of the
 * components it is assembled from; open one and that component's detail
 * carries two more overviews — its sub-assemblies and its materials — each of
 * which opens a detail of its own. Three collections, one shape, repeated.
 *
 * Why this rather than several overviews sharing one detail (list + map +
 * detail): both are composition, but only this one is legible in a column.
 * Side-by-side overviews need width the pattern pages don't have, and the
 * moment they stack, the shared detail stops reading as shared. Nesting reads
 * downward, which is the direction a narrow pane already gives away for free.
 *
 * What keeps it a pair rather than an outline is that the two rungs differ in
 * kind: the compressed form is a name plus two badges, the full form a
 * described readout. Every level shows both, so the compression is visible as
 * compression rather than as a collapsed node.
 */

interface AssemblyMetadata {
  assemblyComponents?: string[];
}

interface ComponentEntity {
  id: string;
  name: string;
  icon: string;
  description: string;
  metadata: {
    category: string;
    childComponents: string[];
    materials: string[];
    lifecycle: { designLife: number; designLifeUnit: string; repairability: string };
    sustainability: { carbonFootprint: number; unit: string; recycledContent: number };
    supplier: string;
    cost: number;
    leadTime: number;
  };
}

interface MaterialEntity {
  id: string;
  name: string;
  icon: string;
  description: string;
  metadata: {
    category: string;
    recycledContent: number;
    carbonFootprint: number;
    unit: string;
    recyclability: string;
    certification: string[];
    supplier: string;
    cost: number;
    costUnit: string;
  };
}

const assemblyComponents = componentsData as unknown as ComponentEntity[];
const assemblyMaterials = materialsData as unknown as MaterialEntity[];

/** An entity at any rung: enough to render the compressed form. */
interface Entity {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Readout {
  label: string;
  value: string;
}

/** An overview nested inside a detail — the recursive edge. */
interface Nested {
  label: string;
  tier: Tier;
  items: Entity[];
}

/**
 * A rung of the recursion. `badges` is the compressed form the overview
 * renders, `rows` the full form its detail expands into, and `nested` the
 * overviews that detail hosts in turn — the pattern applied to itself.
 */
interface Tier {
  badges: (item: Entity) => Readout[];
  rows: (item: Entity) => Readout[];
  nested: (item: Entity) => Nested[];
}

const componentById = (id: string) =>
  assemblyComponents.find((candidate) => candidate.id === id);
const materialById = (id: string) =>
  assemblyMaterials.find((candidate) => candidate.id === id);

/** Some references in the data point at entities the collection doesn't carry;
    a dangling id is dropped rather than rendered as an empty rung. */
const resolve = <T,>(ids: string[], lookup: (id: string) => T | undefined): T[] =>
  ids.map(lookup).filter((entity): entity is T => entity !== undefined);

const assemblyOf = (product: Product): ComponentEntity[] =>
  resolve(
    (product.metadata as typeof product.metadata & AssemblyMetadata)
      .assemblyComponents ?? [],
    componentById
  );

const materialTier: Tier = {
  badges: (item) => {
    const material = item as MaterialEntity;
    return [
      { label: 'Category', value: material.metadata.category },
      { label: 'Recycled', value: `${material.metadata.recycledContent}%` },
    ];
  },
  rows: (item) => {
    const { metadata } = item as MaterialEntity;
    return [
      { label: 'Carbon footprint', value: `${metadata.carbonFootprint} ${metadata.unit}` },
      { label: 'Recyclability', value: metadata.recyclability },
      { label: 'Certification', value: metadata.certification.join(', ') },
      { label: 'Supplier', value: metadata.supplier },
      { label: 'Cost', value: `${metadata.cost} ${metadata.costUnit}` },
    ];
  },
  // Materials are where the recursion bottoms out: nothing is made of them.
  nested: () => [],
};

const componentTier: Tier = {
  badges: (item) => {
    const component = item as ComponentEntity;
    return [
      { label: 'Category', value: component.metadata.category },
      { label: 'Recycled', value: `${component.metadata.sustainability.recycledContent}%` },
    ];
  },
  rows: (item) => {
    const { metadata } = item as ComponentEntity;
    return [
      {
        label: 'Carbon footprint',
        value: `${metadata.sustainability.carbonFootprint} ${metadata.sustainability.unit}`,
      },
      { label: 'Repairability', value: metadata.lifecycle.repairability },
      {
        label: 'Design life',
        value: `${metadata.lifecycle.designLife} ${metadata.lifecycle.designLifeUnit}`,
      },
      { label: 'Supplier', value: metadata.supplier },
      { label: 'Cost', value: `$${metadata.cost.toFixed(2)}` },
    ];
  },
  // Two nested overviews rather than one: a component's detail decomposes both
  // downward into sub-assemblies and sideways into what it is made of.
  nested: (item) => {
    const { metadata } = item as ComponentEntity;
    const children = resolve(metadata.childComponents, componentById);
    const materials = resolve(metadata.materials, materialById);
    return [
      ...(children.length > 0
        ? [{ label: 'Assembled from', tier: componentTier, items: children }]
        : []),
      ...(materials.length > 0
        ? [{ label: 'Made of', tier: materialTier, items: materials }]
        : []),
    ];
  },
};

const productTier: Tier = {
  badges: (item) => {
    const product = item as Product;
    return [
      { label: 'Category', value: product.metadata.category },
      { label: 'Price', value: `$${product.metadata.pricing.msrp.toFixed(2)}` },
    ];
  },
  rows: (item) => {
    const { metadata } = item as Product;
    return [
      { label: 'Condition', value: metadata.condition },
      { label: 'Site', value: metadata.location.site },
      {
        label: 'Carbon footprint',
        value: `${metadata.sustainability.carbonFootprint} ${metadata.sustainability.unit}`,
      },
      { label: 'Repairability', value: metadata.lifecycle.repairability },
    ];
  },
  nested: (item) => {
    const parts = assemblyOf(item as Product);
    return parts.length > 0
      ? [{ label: 'Assembled from', tier: componentTier, items: parts }]
      : [];
  },
};

/**
 * The collection the demo opens on: products whose assembly resolves, so every
 * row the reader can pick has a nesting to show, and only the first three of
 * those. The argument here is depth rather than population — a longer outer
 * list would push the nested rungs below the fold without adding to it.
 */
const assembledProducts = products
  .filter((product) => assemblyOf(product).length > 0)
  .slice(0, 3);

interface PairProps {
  tier: Tier;
  items: Entity[];
  /** What this overview is of — the group label its host detail gave it. */
  label: string;
  /** Opening one row at the outermost rung shows the nesting without a click. */
  initialOpenId?: string;
}

/**
 * One overview-detail pair, which renders a pair per nested overview its own
 * detail declares. The current item is state held per pair — each rung keeps
 * its own place, which is what lets a reader hold a path open through several
 * levels at once.
 */
function OverviewDetailPair({ tier, items, label, initialOpenId }: PairProps) {
  const [openId, setOpenId] = useState<string | null>(initialOpenId ?? null);

  return (
    <section className="cards cards--list" aria-label={label}>
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div key={item.id}>
            <article className="card" data-selected={open || undefined}>
              <h4 className="label">
                <iconify-icon className="icon" icon={item.icon} aria-hidden="true"></iconify-icon>{' '}
                <button
                  type="button"
                  className="card__hit"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  {item.name}
                </button>
              </h4>
              <div className="card__attributes badges">
                {tier.badges(item).map(({ label, value }) => (
                  <span key={label} className="badge">
                    <span className="badge__label">{label}</span>
                    {value}
                  </span>
                ))}
              </div>
              {open && (
                /* An `article`, not a `div`: the card's blanket child-padding
                   rule exempts nested articles, so the detail governs its own. */
                <article className="detail flow" aria-label={`${item.name} — detail`}>
                  <p className="description">{item.description}</p>
                  <dl className="description-list">
                    {/* Fragments, not wrappers: `.description-list` is a
                        two-column grid over its direct dt/dd children. */}
                    {tier.rows(item).map(({ label, value }) => (
                      <Fragment key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </Fragment>
                    ))}
                  </dl>
                  {tier.nested(item).map((nested) => (
                    <div key={nested.label} className="flow">
                      <p className="overview-label">{nested.label}</p>
                      <OverviewDetailPair
                        tier={nested.tier}
                        items={nested.items}
                        label={nested.label}
                      />
                    </div>
                  ))}
                </article>
              )}
            </article>
          </div>
        );
      })}
    </section>
  );
}

export function NestedPairsDemo() {
  return (
    <OverviewDetailPair
      tier={productTier}
      items={assembledProducts}
      label="Products"
      initialOpenId={assembledProducts[0]?.id}
    />
  );
}
