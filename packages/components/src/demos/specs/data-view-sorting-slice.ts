import { dataViewDemo } from './data-view';

export default dataViewDemo({
  view: {
    representation: { type: 'table', shownAttributes: ['name', 'pricing.msrp', 'lifecycle.designLife'] },
    arrangement: { sortBy: { field: 'name', order: 'asc' } },
  },
  controls: { search: false, filter: false, attributes: false, group: false },
});
