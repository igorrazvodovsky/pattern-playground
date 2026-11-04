import { dataViewDemo } from './data-view';

export default dataViewDemo({
  view: {
    representation: { type: 'card', shownAttributes: ['name', 'category'] },
    arrangement: {
      sortBy: { field: 'name', order: 'asc' },
      groupBy: 'lifecycle.repairability',
      groupLayout: 'sections',
    },
  },
  controls: { search: false, filter: false, attributes: false, sort: false },
});
