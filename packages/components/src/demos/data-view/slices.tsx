import { DataView } from './DataView';
import { ProductFilterType, ProductFilterOperator } from '../../templates/collection-view/FilterTypes';

/**
 * Configured slices of the DataView composition. Collection-level moves
 * (grouping, filtering, sorting) are demonstrated inside the host that
 * makes them runnable, with unrelated toolbar affordances hidden so the
 * foregrounded move stays legible. Pattern pages embed these by name.
 */

export function DataViewDemo() {
  return <DataView defaultView="table" />;
}

export function DataViewGroupingSlice() {
  return (
    <DataView
      defaultGrouping="lifecycle.repairability"
      defaultAttributes={['name', 'category']}
      controls={{ search: false, filter: false, attributes: false, sort: false }}
    />
  );
}

export function DataViewFilteringSlice() {
  return (
    <DataView
      defaultView="table"
      defaultAttributes={['name', 'category', 'pricing.msrp', 'availability.status']}
      defaultFilters={[
        {
          id: 'filter-1',
          type: ProductFilterType.CATEGORY,
          operator: ProductFilterOperator.IS_NOT,
          value: ['Packaging'],
        },
      ]}
      controls={{ search: false, attributes: false, sort: false, group: false }}
    />
  );
}

export function DataViewSortingSlice() {
  return (
    <DataView
      defaultView="table"
      defaultAttributes={['name', 'pricing.msrp', 'lifecycle.designLife']}
      controls={{ search: false, filter: false, attributes: false, group: false }}
    />
  );
}
