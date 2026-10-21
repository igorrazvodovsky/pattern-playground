import type { EntityBinding } from './types';

/**
 * The parts a product is assembled from. Costs are stored in US dollars.
 * 'childComponents' and 'materials' are ids, read by views that decompose a
 * component rather than shown as attributes.
 */
export const componentBinding: EntityBinding = {
  entityType: 'component',
  attributes: [
    { path: 'icon', role: 'thumbnail', valueType: 'image' },
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'description', role: 'description', valueType: 'string' },
    { path: 'category', role: 'badge', valueType: 'string', icon: 'category' },
    { path: 'hierarchy', label: 'Level', role: 'spec', valueType: 'string' },
    {
      path: 'sustainability.recycledContent',
      label: 'Recycled',
      role: 'spec',
      valueType: 'progress',
    },
    {
      path: 'sustainability.carbonFootprint',
      label: 'Carbon footprint',
      role: 'spec',
      valueType: 'number',
      unit: 'kg CO2e',
    },
    {
      path: 'lifecycle.repairability',
      label: 'Repairability',
      role: 'spec',
      valueType: 'string',
      icon: 'repairability',
    },
    {
      path: 'lifecycle.designLife',
      label: 'Design life',
      role: 'spec',
      valueType: 'number',
      unit: 'years',
    },
    { path: 'specifications', label: 'Specifications', role: 'spec', valueType: 'string' },
    { path: 'supplier', label: 'Supplier', role: 'spec', valueType: 'string' },
    { path: 'cost', label: 'Cost', role: 'spec', valueType: 'currency', currency: 'USD' },
    { path: 'leadTime', label: 'Lead time', role: 'spec', valueType: 'number', unit: 'days' },
  ],
  scopes: {
    micro: ['icon', 'name'],
    mini: ['icon', 'name', 'category', 'sustainability.recycledContent'],
    mid: [
      'description',
      'category',
      'sustainability.carbonFootprint',
      'lifecycle.repairability',
      'lifecycle.designLife',
      'supplier',
      'cost',
    ],
    maxi: [
      'description',
      'category',
      'hierarchy',
      'specifications',
      'sustainability.recycledContent',
      'sustainability.carbonFootprint',
      'lifecycle.repairability',
      'lifecycle.designLife',
      'supplier',
      'cost',
      'leadTime',
    ],
  },
};
