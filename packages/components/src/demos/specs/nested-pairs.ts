import type { Spec } from '@json-render/core';
import { components, materials, products } from '@shared/data';
import type { ComponentView, MaterialView, ProductView } from '@shared/data/world-views';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { toggleHandler } from './shared/toggle';
import spec from './nested-pairs.json' with { type: 'json' };

// Nesting rather than several overviews sharing one detail, because only
// nesting stays legible in a narrow column. The spec is one pair that renders
// itself again inside its own detail, so the whole tree is built here.

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

interface Node {
  id: string;
  name: string;
  icon: 'product' | 'part' | 'material';
  badges: Readout[];
  description: string;
  rows: Readout[];
  nested: { label: string; items: Node[] }[];
  open: boolean;
}

const componentById = (id: string) => components.find((candidate) => candidate.id === id);
const materialById = (id: string) => materials.find((candidate) => candidate.id === id);

// Some references point at entities the collection doesn't carry; a dangling
// id is dropped rather than rendered as an empty rung.
const resolve = <T,>(ids: string[], lookup: (id: string) => T | undefined): T[] =>
  ids.map(lookup).filter((entity): entity is T => entity !== undefined);

const assemblyOf = (product: ProductView) => resolve(product.metadata.assemblyComponents, componentById);

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

// Only three: a longer outer list would push the nested rungs below the fold.
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
