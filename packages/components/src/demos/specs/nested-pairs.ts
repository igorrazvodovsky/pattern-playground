import type { Spec } from '@json-render/core';
import { components, materials, products } from '@shared/data';
import type { ComponentView, MaterialView, ProductView } from '@shared/data/world-views';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { toggleHandler } from './toggle';
import spec from './nested-pairs.json' with { type: 'json' };

// The composition dimension, in its recursive form: the pattern nests inside
// its own detail views. A product's detail carries an overview of the
// components it is assembled from; open one and that component's detail
// carries two more overviews, its sub-assemblies and its materials, each of
// which opens a detail of its own. Three collections, one shape, repeated.
//
// Why this rather than several overviews sharing one detail (list + map +
// detail): both are composition, but only this one is legible in a column.
// Side-by-side overviews need width the pattern pages don't have, and once
// they stack, the shared detail stops reading as shared. Nesting reads
// downward, which is the direction a narrow pane already gives.
//
// What keeps it a pair rather than an outline is that the two rungs differ in
// kind: the compressed form is a name plus two badges, the full form a
// described readout. Every level shows both, so the compression is visible as
// compression rather than as a collapsed node.
//
// The spec is one pair that renders itself again inside its own detail, so the
// whole tree is built here, every rung with its compressed and full forms.
// The data runs three levels deep and has no cycles. Each item carries `open`,
// and `toggle` (./toggle.ts) keeps one item open per pair: each rung keeps its
// own place, which is what lets the actor hold a path open through several
// levels. The icon tells the three kinds of item apart.

// The data types component sustainability as an open record; these are the
// fields it holds.
interface ComponentSustainability {
  carbonFootprint: number;
  unit: string;
  recycledContent: number;
}

interface Readout {
  label: string;
  value: string;
}

/** One item at any rung, as the spec shows it. */
interface Node {
  id: string;
  name: string;
  /** What kind of item it is, by its catalog icon. */
  icon: 'product' | 'part' | 'material';
  /** The compressed form the overview shows. */
  badges: Readout[];
  /** The full form its detail expands into. */
  description: string;
  rows: Readout[];
  /** The overviews that detail hosts in turn: the pattern applied to itself. */
  nested: { label: string; items: Node[] }[];
  open: boolean;
}

const componentById = (id: string) => components.find((candidate) => candidate.id === id);
const materialById = (id: string) => materials.find((candidate) => candidate.id === id);

/** Some references in the data point at entities the collection doesn't carry;
    a dangling id is dropped rather than rendered as an empty rung. */
const resolve = <T,>(ids: string[], lookup: (id: string) => T | undefined): T[] =>
  ids.map(lookup).filter((entity): entity is T => entity !== undefined);

const assemblyOf = (product: ProductView) => resolve(product.metadata.assemblyComponents, componentById);

/** A nested overview, left out when there is nothing in it. */
const overview = (label: string, items: Node[]) => (items.length > 0 ? [{ label, items }] : []);

const materialNode = (material: MaterialView): Node => {
  const { metadata } = material;
  return {
    id: material.id,
    name: material.name,
    icon: 'material',
    badges: [
      { label: 'Category', value: metadata.category },
      { label: 'Recycled', value: `${metadata.recycledContent}%` },
    ],
    description: material.description,
    rows: [
      { label: 'Carbon footprint', value: `${metadata.carbonFootprint} ${metadata.unit}` },
      { label: 'Recyclability', value: metadata.recyclability },
      { label: 'Certification', value: metadata.certification.join(', ') },
      { label: 'Supplier', value: metadata.supplier },
      { label: 'Cost', value: `${metadata.cost} ${metadata.costUnit}` },
    ],
    // Materials are where the recursion bottoms out: nothing is made of them.
    nested: [],
    open: false,
  };
};

const componentNode = (component: ComponentView): Node => {
  const { metadata } = component;
  const sustainability = metadata.sustainability as unknown as ComponentSustainability;
  return {
    id: component.id,
    name: component.name,
    icon: 'part',
    badges: [
      { label: 'Category', value: metadata.category },
      { label: 'Recycled', value: `${sustainability.recycledContent}%` },
    ],
    description: component.description,
    rows: [
      {
        label: 'Carbon footprint',
        value: `${sustainability.carbonFootprint} ${sustainability.unit}`,
      },
      { label: 'Repairability', value: metadata.lifecycle.repairability },
      {
        label: 'Design life',
        value: `${metadata.lifecycle.designLife} ${metadata.lifecycle.designLifeUnit}`,
      },
      { label: 'Supplier', value: metadata.supplier },
      { label: 'Cost', value: `$${metadata.cost.toFixed(2)}` },
    ],
    // Two nested overviews rather than one: a component's detail decomposes
    // both downward into sub-assemblies and sideways into what it is made of.
    nested: [
      ...overview('Assembled from', resolve(metadata.childComponents, componentById).map(componentNode)),
      ...overview('Made of', resolve(metadata.materials, materialById).map(materialNode)),
    ],
    open: false,
  };
};

const productNode = (product: ProductView): Node => {
  const { metadata } = product;
  return {
    id: product.id,
    name: product.name,
    icon: 'product',
    badges: [
      { label: 'Category', value: metadata.category },
      { label: 'Price', value: `$${metadata.pricing.msrp.toFixed(2)}` },
    ],
    description: product.description,
    rows: [
      { label: 'Condition', value: metadata.condition },
      { label: 'Site', value: metadata.location.site },
      {
        label: 'Carbon footprint',
        value: `${metadata.sustainability.carbonFootprint} ${metadata.sustainability.unit}`,
      },
      { label: 'Repairability', value: metadata.lifecycle.repairability },
    ],
    nested: overview('Assembled from', assemblyOf(product).map(componentNode)),
    open: false,
  };
};

// The collection the demo opens on: products whose assembly resolves, so every
// card the actor can pick has a nesting to show, and only the first three of
// those. The argument here is depth rather than population: a longer outer
// list would push the nested rungs below the fold without adding to it. The
// first is open, so the nesting shows without a click.
const assembled = products
  .filter((product) => assemblyOf(product).length > 0)
  .slice(0, 3)
  .map(productNode);
if (assembled[0]) assembled[0].open = true;

export default {
  spec: spec as Spec,
  setup: {
    initialState: { products: assembled },
    handlers: toggleHandler,
  } satisfies SpecSetup,
};
