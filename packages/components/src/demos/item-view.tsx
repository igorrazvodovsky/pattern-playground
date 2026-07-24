import { useState } from 'react';
import { ItemView } from '../components/item-view/ItemView';
import { ItemInteraction } from '../components/item-view/ItemInteraction';
import type { ViewScope } from '../components/item-view/types';
import type { Product } from '@shared/data/types';
import { products } from '../templates/collection-view/data';
import { ViewSpecRenderer } from '../templates/collection-view/renderers';
import { productBinding } from '@shared/data/bindings';
import { makeSpec } from '../templates/collection-view/spec';
import '../jsx-types';

/**
 * The same entity — the first product of the canonical collection — at every
 * rung of the representation ladder. Each demo's secondary job is the
 * context trade-off: what the rung gains in detail it gives up in
 * surrounding population, and the other way round.
 */

const canonicalProduct = products[0];

function ProductItemView({
  scope,
  product = canonicalProduct,
  heading,
}: {
  scope: ViewScope;
  product?: Product;
  heading?: 2 | 3;
}) {
  return (
    <ItemView
      item={product}
      contentType="product"
      scope={scope}
      mode="preview"
      heading={heading}
    />
  );
}

/** Full working surface: the entity page, every attribute group open. The
    demo is the page, so it asks the wrapper for the title the page owns. */
export function ItemViewFullDemo() {
  return <ProductItemView scope="maxi" heading={2} />;
}

/** Summary scope: quick assessment without leaving the current context. */
export function ItemViewSummaryDemo() {
  return <ProductItemView scope="mini" />;
}

/** Summary rung in context: the item as a row among its peers. */
export function ItemViewRowDemo() {
  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Condition</th>
            <th className="pp-table-align-right">Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.metadata.category}</td>
              <td>{product.metadata.condition}</td>
              <td className="pp-table-align-right">
                ${product.metadata.pricing.msrp.toFixed(2)}
              </td>
              <td>
                <span className="badge">{product.metadata.availability.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  );
}

const glyphSpec = makeSpec({
  id: 'item-view-glyph',
  representation: { type: 'map', rung: 'glyph', shownAttributes: ['name'] },
});

/**
 * Glyph rung: the entity as a located dot among the population. A glyph is
 * only legible inside a population, so the population renderer draws it —
 * not the item view.
 */
export function ItemViewGlyphDemo() {
  const [selectedId, setSelectedId] = useState<string | null>(canonicalProduct.id);
  return (
    <ViewSpecRenderer
      items={products}
      spec={glyphSpec}
      binding={productBinding}
      selectedId={selectedId}
      onItemSelect={(item) => setSelectedId(item.id)}
    />
  );
}

/**
 * One entity walked up and down the ladder from a single inline reference,
 * driven by `ItemInteraction`. The trigger is styled as a reference — the same
 * inline chrome the reference component renders (`.reference-mention`), rather
 * than a `micro` item view, whose product form is a `.tag`. Hovering it opens
 * the summary in a popover; from there the view-settings control on every rung
 * moves the reader to the detail drawer or the full record and back down again.
 *
 * The escalation mechanism itself lives in `ItemInteraction`, shared with the
 * reference component: this demo is only the entity, the prose it sits in, and
 * the reference chrome.
 */
export function ItemViewTransitionsDemo() {
  return (
    <p>
      The refurbishment log flags the{' '}
      <ItemInteraction
        item={canonicalProduct}
        contentType="product"
        className="reference-mention reference"
      >
        {canonicalProduct.name}
      </ItemInteraction>{' '}
      for a battery-module swap before the autumn fleet handover.
    </p>
  );
}
