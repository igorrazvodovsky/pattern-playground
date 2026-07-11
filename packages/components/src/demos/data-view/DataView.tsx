import React, { useState, useMemo } from 'react';
import productsData from '@shared/data/products.json' with { type: 'json' };
import { Product } from '@shared/data/types';
import { ViewMode, AttributeSelection, SortField, SortOrder, DataViewControls } from './types';
import { getAvailableAttributes } from './AttributeUtils';
import { sortProducts } from './SortingUtils';
import { ViewSwitcher } from './ViewSwitcher';
import { AttributeSelector } from './AttributeSelector';
import { SortingControls } from './SortingControls';
import { GroupingControls } from './GroupingControls';
import { SearchControls } from './SearchControls';
import { FilterControls } from './FilterControls';
import ProductFilters from './ProductFilters';
import { useProductSearch } from './useProductSearch';
import { useProductFiltering } from './useProductFiltering';
import { ProductFilter } from './FilterTypes';
import { EmptyState } from './EmptyState';
import { DataViewRenderer } from './DataViewRenderer';
import { GROUPABLE_ATTRIBUTES } from './constants';

const ALL_CONTROLS: Required<DataViewControls> = {
  viewSwitcher: true,
  search: true,
  filter: true,
  attributes: true,
  sort: true,
  group: true,
};

export interface DataViewDemoProps {
  products?: Product[];
  defaultView?: ViewMode;
  defaultAttributes?: string[];
  defaultFilters?: ProductFilter[];
  defaultGrouping?: string | null;
  /** Which toolbar controls to render; omitted keys default to visible. */
  controls?: DataViewControls;
}

export const DataView: React.FC<DataViewDemoProps> = ({
  products = productsData as unknown as Product[],
  defaultView = 'card',
  defaultAttributes = ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
  defaultFilters = [],
  defaultGrouping = null,
  controls = {}
}) => {
  const show = { ...ALL_CONTROLS, ...controls };
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeSelection>(
    new Set(defaultAttributes)
  );
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<ProductFilter[]>(defaultFilters);
  const [grouping, setGrouping] = useState<string | null>(defaultGrouping);

  const availableAttributes = useMemo(() => getAvailableAttributes(products), [products]);

  const handleAttributeToggle = (attribute: string) => {
    setSelectedAttributes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(attribute)) {
        newSet.delete(attribute);
      } else {
        newSet.add(attribute);
      }
      return newSet;
    });
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const searchedProducts = useProductSearch(products, searchQuery);
  const { filteredProducts, filterCategories } = useProductFiltering(searchedProducts, filters);

  const sortedProducts = useMemo(() =>
    sortProducts(filteredProducts, sortField, sortOrder),
    [filteredProducts, sortField, sortOrder]
  );

  // Early return for no attributes selected - this is a configuration issue
  if (selectedAttributes.size === 0) {
    return (
      <div>
        <EmptyState
          icon="ph:list"
          title="Select attributes to view"
          message="Choose which product details you'd like to see from the attributes dropdown."
        />
      </div>
    );
  }

  // Determine if we have no data at all vs no results from search/filter
  const hasNoData = products.length === 0;
  const hasNoResults = !hasNoData && sortedProducts.length === 0;

  // No data at all - hide toolbar
  if (hasNoData) {
    return (
      <div>
        <EmptyState
          icon="ph:database"
          title="No products available"
          message="Check your data source - no products have been loaded."
        />
      </div>
    );
  }

  return (
    <div className="flow">
      <div className="flex">
        {show.viewSwitcher && (
          <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
        )}
        {show.search && (
          <SearchControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
        {show.filter && (
          <FilterControls
            filters={filters}
            setFilters={setFilters}
            filterCategories={filterCategories}
          />
        )}
        {show.attributes && (
          <AttributeSelector
            availableAttributes={availableAttributes}
            selectedAttributes={selectedAttributes}
            onAttributeToggle={handleAttributeToggle}
          />
        )}
        {show.sort && (
          <SortingControls
            availableFields={availableAttributes}
            currentField={sortField}
            currentOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        )}
        {show.group && (
          <GroupingControls
            availableAttributes={GROUPABLE_ATTRIBUTES}
            currentGrouping={grouping}
            onGroupingChange={setGrouping}
          />
        )}
      </div>

      {show.filter && filters.length > 0 && (
        <ProductFilters
          filters={filters}
          setFilters={setFilters}
          filterCategories={filterCategories}
        />
      )}

      {hasNoResults ? (
        <EmptyState
          icon="ph:magnifying-glass"
          title="No results found"
          message={
            searchQuery && filters.length > 0
              ? `No products match "${searchQuery}" with current filters. Try adjusting your search or filters.`
              : searchQuery
              ? `No products match "${searchQuery}". Try adjusting your search terms.`
              : filters.length > 0
              ? 'No products match your current filters. Try adjusting your criteria.'
              : 'No products found.'
          }
        />
      ) : (
        <DataViewRenderer
          viewMode={viewMode}
          products={sortedProducts}
          selectedAttributes={selectedAttributes}
          groupBy={grouping}
        />
      )}
    </div>
  );
};
