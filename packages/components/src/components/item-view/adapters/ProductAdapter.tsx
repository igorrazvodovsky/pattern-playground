import React from 'react';
import type { ContentAdapter, ItemViewProps, BaseItem } from '../types';
import type { Product } from '@shared/data/types';

/**
 * Adapter rendering the circular-economy products collection at every scope
 * of the representation ladder: micro (an inline mention), mini (a summary
 * card), mid (the detail panel), maxi (the entity page).
 */

export interface ProductItem extends BaseItem {
  metadata: { product: Product };
}

const getProduct = (item: BaseItem): Product =>
  (item as ProductItem).metadata.product;

const formatPrice = (product: Product) =>
  `$${product.metadata.pricing.msrp.toFixed(2)}`;

const renderMicroView = (product: Product) => (
  <span className="tag">
    <iconify-icon className="icon" icon={product.icon} aria-hidden="true"></iconify-icon>
    {product.name}
  </span>
);

const renderMiniView = (product: Product) => (
  <div className="flow">
    <h4 className="label flex">
      <iconify-icon className="icon" icon={product.icon} aria-hidden="true"></iconify-icon>
      {product.name}
    </h4>
    <div className="badges">
      <span className="badge">{product.metadata.category}</span>
      <span className="badge">{product.metadata.condition}</span>
      <span className="badge">{formatPrice(product)}</span>
    </div>
  </div>
);

const renderMidView = (product: Product) => (
  <div className="flow">
    <header>
      <span className="badge">{product.metadata.availability.status}</span>
    </header>

    <p className="description">{product.description}</p>

    <dl className="details-list">
      <dt>Price</dt>
      <dd>{formatPrice(product)}</dd>
      <dt>Condition</dt>
      <dd>{product.metadata.condition}</dd>
      <dt>Category</dt>
      <dd>
        {product.metadata.category} / {product.metadata.subcategory}
      </dd>
      <dt>Site</dt>
      <dd>{product.metadata.location.site}</dd>
      <dt>Carbon footprint</dt>
      <dd>
        {product.metadata.sustainability.carbonFootprint}{' '}
        {product.metadata.sustainability.unit}
      </dd>
      <dt>Repairability</dt>
      <dd>{product.metadata.lifecycle.repairability}</dd>
    </dl>
  </div>
);

const renderMaxiView = (product: Product) => {
  const { metadata } = product;
  return (
    <div className="flow details-list-group">
      <header className="flow">
        {/* TODO: Dialogue has its own title. The need to have a separate title here depends on how separate the full page view is rendered.  */}
        {/* <h2>
          <iconify-icon className="icon" icon={product.icon} aria-hidden="true"></iconify-icon>{' '}
          {product.name}
        </h2> */}
        <div className="badges">
          <span className="badge">{metadata.availability.status}</span>
          <span className="badge">{metadata.condition}</span>
          <span className="badge">{formatPrice(product)}</span>
        </div>
      </header>

      <p>{product.description}</p>

      <section className="flow">
        <h3>Specifications</h3>
        <dl className="details-list">
          {Object.entries(metadata.specifications).map(([key, value]) => (
            <React.Fragment key={key}>
              <dt>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}</dt>
              <dd>{String(value)}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>

      <section className="flow">
        <h3>Lifecycle</h3>
        <dl className="details-list">
          <dt>Design life</dt>
          <dd>
            {metadata.lifecycle.designLife} {metadata.lifecycle.designLifeUnit}
          </dd>
          <dt>Warranty</dt>
          <dd>{metadata.lifecycle.warrantyPeriod} years</dd>
          <dt>Repairability</dt>
          <dd>{metadata.lifecycle.repairability}</dd>
          <dt>Upgradeability</dt>
          <dd>{metadata.lifecycle.upgradeability}</dd>
        </dl>
      </section>

      <section className="flow">
        <h3>Sustainability</h3>
        <dl className="details-list">
          <dt>Carbon footprint</dt>
          <dd>
            {metadata.sustainability.carbonFootprint} {metadata.sustainability.unit}
          </dd>
          <dt>Recycled content</dt>
          <dd>{metadata.sustainability.recycledContentOverall}%</dd>
          <dt>Recyclability</dt>
          <dd>{metadata.sustainability.recyclabilityScore}%</dd>
          <dt>Certifications</dt>
          <dd>{metadata.sustainability.certifications.join(', ')}</dd>
        </dl>
      </section>

      <section className="flow">
        <h3>Availability</h3>
        <dl className="details-list">
          <dt>Status</dt>
          <dd>{metadata.availability.status}</dd>
          <dt>Lead time</dt>
          <dd>
            {metadata.availability.leadTime} {metadata.availability.leadTimeUnit}
          </dd>
          <dt>Regions</dt>
          <dd>{metadata.availability.regions.join(', ')}</dd>
          <dt>Site</dt>
          <dd>{metadata.location.site}</dd>
          <dt>Listed</dt>
          <dd>{new Date(metadata.listedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
        </dl>
      </section>
    </div>
  );
};

export const productAdapter: ContentAdapter = {
  contentType: 'product',
  supportedScopes: ['micro', 'mini', 'mid', 'maxi'],
  supportsCommenting: false,
  supportsRichContent: false,

  render: (props: ItemViewProps) => {
    const product = getProduct(props.item);

    switch (props.scope) {
      case 'micro':
        return renderMicroView(product);
      case 'mini':
        return renderMiniView(product);
      case 'mid':
        return renderMidView(product);
      case 'maxi':
        return renderMaxiView(product);
      default:
        return renderMiniView(product);
    }
  },
};

export const productToItemObject = (product: Product): ProductItem => ({
  id: product.id,
  label: product.name,
  type: 'product',
  metadata: { product },
});
