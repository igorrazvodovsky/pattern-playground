import type { Spec } from '@json-render/core';
import { components, materials, products } from '@shared/data';
import { componentBinding, materialBinding, productBinding } from '@shared/data/bindings';
import type { ComponentView, MaterialView, ProductView } from '@shared/data/world-views';
import type { SpecSetup } from '../../catalog/SpecDemo';
import { cardAttributes } from './shared/product-view';
import { toggle, toggleHandler } from './shared/toggle';
import spec from './nested-pairs.json' with { type: 'json' };

// Nesting rather than several overviews sharing one detail, because only
// nesting stays legible in a narrow column. The spec is one pair that renders
// itself again inside its own detail, so the whole tree is built here.

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
const resolve = <T>(ids: string[], lookup: (id: string) => T | undefined): T[] =>
  ids.map(lookup).filter((entity): entity is T => entity !== undefined);

const assemblyOf = (product: ProductView) =>
  resolve(product.metadata.assemblyComponents, componentById);

// Each tier shows its own figures, read through its binding.
const materialBadges = cardAttributes(['category', 'recycledContent'], materialBinding);
const materialRows = cardAttributes(
  ['carbonFootprint', 'recyclability', 'certification', 'supplier', 'cost'],
  materialBinding,
);
const componentBadges = cardAttributes(
  ['category', 'sustainability.recycledContent'],
  componentBinding,
);
const componentRows = cardAttributes(
  [
    'sustainability.carbonFootprint',
    'lifecycle.repairability',
    'lifecycle.designLife',
    'supplier',
    'cost',
  ],
  componentBinding,
);
const productBadges = cardAttributes(['category', 'pricing.msrp'], productBinding);
const productRows = cardAttributes(
  ['condition', 'location.site', 'sustainability.carbonFootprint', 'lifecycle.repairability'],
  productBinding,
);

const overview = (label: string, items: Node[]) => (items.length > 0 ? [{ label, items }] : []);

const materialNode = (material: MaterialView): Node => ({
  id: material.id,
  name: material.name,
  icon: 'material',
  badges: materialBadges(material),
  description: material.description,
  rows: materialRows(material),
  nested: [],
  open: false,
});

const componentNode = (component: ComponentView): Node => ({
  id: component.id,
  name: component.name,
  icon: 'part',
  badges: componentBadges(component),
  description: component.description,
  rows: componentRows(component),
  // Two nested overviews rather than one: a component's detail decomposes
  // both downward into sub-assemblies and sideways into what it is made of.
  nested: [
    ...overview(
      'Assembled from',
      resolve(component.metadata.childComponents, componentById).map(componentNode),
    ),
    ...overview('Made of', resolve(component.metadata.materials, materialById).map(materialNode)),
  ],
  open: false,
});

const productNode = (product: ProductView): Node => ({
  id: product.id,
  name: product.name,
  icon: 'product',
  badges: productBadges(product),
  description: product.description,
  rows: productRows(product),
  nested: overview('Assembled from', assemblyOf(product).map(componentNode)),
  open: false,
});

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
    actions: { toggle },
    handlers: toggleHandler,
  } satisfies SpecSetup,
};
