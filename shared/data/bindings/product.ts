import type { EntityBinding } from './types';

/**
 * The circular-economy products collection. Seeded from the retired
 * ProductAdapter's four scope renderings plus the collection-view label
 * curation ('pricing.msrp' → "Price", …), which lives here now;
 * `attributeLabel` in collection-view is a lookup over this binding.
 *
 * 'specifications' resolves to a record; a spec-role attribute with an
 * object value renders one row per key. 'pricing.band' is not a stored
 * attribute — the band a price falls into, computed on read — but its
 * curated label belongs with the rest.
 */
export const productBinding: EntityBinding = {
  entityType: 'product',
  attributes: [
    { path: 'icon', role: 'thumbnail', valueType: 'image' },
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'description', role: 'description', valueType: 'string' },
    { path: 'category', role: 'badge', valueType: 'string', icon: 'ph:tag' },
    { path: 'subcategory', role: 'spec', valueType: 'string' },
    { path: 'condition', role: 'badge', valueType: 'string' },
    { path: 'pricing.msrp', label: 'Price', role: 'key-attribute', valueType: 'currency', icon: 'ph:currency-dollar' },
    { path: 'pricing.band', label: 'Price band', role: 'spec', valueType: 'string' },
    { path: 'pricing.tradeInValue', label: 'Trade-in Value', role: 'spec', valueType: 'currency' },
    { path: 'availability.status', label: 'Availability', role: 'badge', valueType: 'status', icon: 'ph:circle' },
    { path: 'availability.leadTime', label: 'Lead time', role: 'spec', valueType: 'number', unit: 'days' },
    { path: 'availability.regions', label: 'Regions', role: 'spec', valueType: 'string', icon: 'ph:globe', many: true },
    { path: 'availability.channels', label: 'Channels', role: 'spec', valueType: 'string', icon: 'ph:storefront', many: true },
    { path: 'location.site', label: 'Site', role: 'spec', valueType: 'string' },
    { path: 'specifications', label: 'Specifications', role: 'spec', valueType: 'string' },
    { path: 'lifecycle.designLife', label: 'Design life', role: 'spec', valueType: 'number' },
    { path: 'lifecycle.warrantyPeriod', label: 'Warranty', role: 'spec', valueType: 'number', unit: 'years' },
    { path: 'lifecycle.repairability', label: 'Repairability', role: 'spec', valueType: 'string', icon: 'ph:wrench' },
    { path: 'lifecycle.upgradeability', label: 'Upgradeability', role: 'spec', valueType: 'string', icon: 'ph:arrow-up' },
    { path: 'sustainability.carbonFootprint', label: 'Carbon footprint', role: 'spec', valueType: 'number', unit: 'kg CO2e' },
    { path: 'sustainability.recycledContentOverall', label: 'Recycled content', role: 'spec', valueType: 'progress' },
    { path: 'sustainability.recyclabilityScore', label: 'Recyclability', role: 'spec', valueType: 'progress' },
    { path: 'sustainability.certifications', label: 'Certifications', role: 'spec', valueType: 'string', icon: 'ph:certificate', many: true },
    { path: 'listedAt', label: 'Listed', role: 'footer', valueType: 'date' },
  ],
  internalAttributes: {
    lat: 'location.lat',
    lng: 'location.lng',
    locationLabel: 'location.site',
  },
  scopes: {
    micro: ['icon', 'name'],
    mini: ['icon', 'name', 'category', 'condition', 'pricing.msrp'],
    mid: [
      'availability.status',
      'description',
      'pricing.msrp',
      'condition',
      'category',
      'location.site',
      'sustainability.carbonFootprint',
      'lifecycle.repairability',
    ],
    maxi: [
      'availability.status',
      'condition',
      'pricing.msrp',
      'description',
      'specifications',
      'lifecycle.designLife',
      'lifecycle.warrantyPeriod',
      'lifecycle.repairability',
      'lifecycle.upgradeability',
      'sustainability.carbonFootprint',
      'sustainability.recycledContentOverall',
      'sustainability.recyclabilityScore',
      'sustainability.certifications',
      'availability.leadTime',
      'availability.regions',
      'location.site',
      'listedAt',
    ],
  },
};
