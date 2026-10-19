import { dataViewDemo } from './data-view';

// Sorting inside the data view: a table of a few attributes worth comparing,
// with only the representation and sorting controls in the toolbar.

export default dataViewDemo({
  view: {
    representation: { type: 'table', shownAttributes: ['name', 'pricing.msrp', 'lifecycle.designLife'] },
    arrangement: { sortBy: { field: 'name', order: 'asc' } },
  },
  controls: { search: false, filter: false, attributes: false, group: false },
});
