import { dataViewDemo } from './data-view';

// Grouping inside the data view: the products grouped by how repairable they
// are, with only the representation and grouping controls in the toolbar.

export default dataViewDemo({
  view: {
    representation: { type: 'card', shownAttributes: ['name', 'category'] },
    arrangement: { sortBy: { field: 'name', order: 'asc' }, groupBy: 'lifecycle.repairability', groupLayout: 'sections' },
  },
  controls: { search: false, filter: false, attributes: false, sort: false },
});
