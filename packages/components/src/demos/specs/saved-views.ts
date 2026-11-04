import { makeSpec } from '../../templates/collection-view/spec';
import { dataViewDemo } from './data-view';

// One view is stale on purpose: its query names an availability status the
// data does not use, so it matches nothing.

const saved = [
  makeSpec({
    id: 'saved-default',
    label: 'All products',
    representation: {
      type: 'card',
      shownAttributes: ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
    },
    arrangement: { sortBy: { field: 'name', order: 'asc' } },
  }),
  makeSpec({
    id: 'saved-sustainability',
    label: 'Sustainability review',
    representation: {
      type: 'table',
      shownAttributes: [
        'name',
        'category',
        'sustainability.carbonFootprint',
        'sustainability.recyclabilityScore',
        'lifecycle.repairability',
      ],
    },
    arrangement: { sortBy: { field: 'sustainability.carbonFootprint', order: 'desc' } },
  }),
  makeSpec({
    id: 'saved-shortlist',
    label: 'Affordable picks',
    query: [
      { id: 'saved-shortlist-price', path: 'pricing.msrp', operator: 'less than', values: ['500'] },
    ],
    representation: {
      type: 'card',
      shownAttributes: ['name', 'condition', 'pricing.msrp', 'location.site'],
    },
    arrangement: { layout: 'list', sortBy: { field: 'pricing.msrp', order: 'asc' } },
  }),
  makeSpec({
    id: 'saved-pilot-2025',
    label: 'Pilot fleet (2025)',
    query: [
      {
        id: 'saved-pilot-status',
        path: 'availability.status',
        operator: 'is',
        values: ['Pilot Phase'],
      },
    ],
    representation: {
      type: 'card',
      shownAttributes: ['name', 'description', 'availability.status', 'availability.leadTime'],
    },
    arrangement: { sortBy: { field: 'availability.leadTime', order: 'asc' } },
  }),
];

export default dataViewDemo({ view: {}, controls: { views: true }, saved });
