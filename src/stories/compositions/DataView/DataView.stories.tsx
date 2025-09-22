import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useState, useMemo } from "react";
import productsData from '../../data/products.json' with { type: 'json' };
import { Product } from '../../data/types';
import { DataViewProps, ViewMode, AttributeSelection, SortField, SortOrder } from './types';
import { getAvailableAttributes } from './AttributeUtils';
import { sortProducts } from './SortingUtils';
import { ViewSwitcher } from './ViewSwitcher';
import { AttributeSelector } from './AttributeSelector';
import { SortingControls } from './SortingControls';
import { SearchControls } from './SearchControls';
import { FilterControls } from './FilterControls';
import ProductFilters from './ProductFilters';
import { useProductSearch } from './useProductSearch';
import { useProductFiltering } from './useProductFiltering';
import { ProductFilter, ProductFilterType, ProductFilterOperator } from './FilterTypes';
import { EmptyState } from './EmptyState';
import { DataViewRenderer } from './DataViewRenderer';

const DataViewComponent: React.FC<DataViewProps> = ({
  products,
  defaultView = 'card',
  defaultAttributes = ['category', 'pricing.msrp', 'availability.status'],
  defaultFilters = []
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeSelection>(
    new Set(defaultAttributes)
  );
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<ProductFilter[]>(defaultFilters);

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
        <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
        <SearchControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <FilterControls
          filters={filters}
          setFilters={setFilters}
          filterCategories={filterCategories}
        />
        <AttributeSelector
          availableAttributes={availableAttributes}
          selectedAttributes={selectedAttributes}
          onAttributeToggle={handleAttributeToggle}
        />
        <SortingControls
          availableFields={availableAttributes}
          currentField={sortField}
          currentOrder={sortOrder}
          onSortChange={handleSortChange}
        />
      </div>

      {filters.length > 0 && (
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
        />
      )}
    </div>
  );
};

const meta = {
  title: "Compositions/Data view",
  component: DataViewComponent,
  argTypes: {
    defaultView: {
      control: { type: 'select' },
      options: ['card', 'list', 'table'],
    },
    defaultAttributes: {
      control: { type: 'object' },
    },
    defaultFilters: {
      control: { type: 'object' },
    },
  },
} satisfies Meta<typeof DataViewComponent>;

export default meta;
type Story = StoryObj<typeof DataViewComponent>;

export const DataView: Story = {
  args: {
    products: productsData as unknown as Product[],
    defaultView: 'card',
    defaultAttributes: ['category', 'pricing.msrp', 'availability.status'],
    defaultFilters: [],
  },
};

export const DataViewWithFilters: Story = {
  args: {
    products: productsData as unknown as Product[],
    defaultView: 'list',
    defaultAttributes: ['category', 'pricing.msrp', 'availability.status', 'metadata.lifecycle.repairability'],
    defaultFilters: [
      {
        id: 'filter-1',
        type: ProductFilterType.CATEGORY,
        operator: ProductFilterOperator.IS,
        value: ['transportation']
      }
    ],
  },
};