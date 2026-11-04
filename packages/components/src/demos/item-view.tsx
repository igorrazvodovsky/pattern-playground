import { ItemView } from '../components/item-view/ItemView';
import type { ViewScope } from '../components/item-view/types';
import type { Product } from '@shared/data/types';
import { products } from '../templates/collection-view/data';
import '../jsx-types';

/**
 * The same entity — the first product of the canonical collection — at every
 * rung of the representation ladder. Each demo's secondary job is the
 * context trade-off: what the rung gains in detail it gives up in
 * surrounding population, and the other way round.
 */

const canonicalProduct = products[0];

export function ProductItemView({
  scope,
  product = canonicalProduct,
  heading,
}: {
  scope: ViewScope;
  product?: Product;
  heading?: 2 | 3;
}) {
  return (
    <ItemView item={product} contentType="product" scope={scope} mode="preview" heading={heading} />
  );
}

/** Summary scope: quick assessment without leaving the current context. */
export function ItemViewSummaryDemo() {
  return <ProductItemView scope="mini" />;
}
