import { Fragment, useState } from 'react';
import type { Product } from '@shared/data/types';
import { components as componentsData, materials as materialsData } from '@shared/data';
import { products } from '../templates/collection-view/data';
import 'iconify-icon';
import '../jsx-types';

// The overview-detail page's nested-pairs demo. The layout demo is a spec
// (demos/specs/overview-detail.json).

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
                  className="stretched-link"
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
                /* The detail governs its own spacing (`.card > .detail` in
                   view-family.css: full width, its own inset, a top border). */
                <article className="detail flow pad" aria-label={`${item.name} — detail`}>
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
