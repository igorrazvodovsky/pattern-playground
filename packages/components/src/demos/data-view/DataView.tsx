import React, { useMemo, useState } from 'react';
import productsData from '@shared/data/products.json' with { type: 'json' };
import { Product } from '@shared/data/types';
import { ViewMode, DataViewControls } from './types';
import { getAvailableAttributes } from '../../templates/collection-view/AttributeUtils';
import { sortProducts } from '../../templates/collection-view/SortingUtils';
import { ViewSwitcher } from './ViewSwitcher';
import { AttributeSelector } from './AttributeSelector';
import { SortingControls } from './SortingControls';
import { GroupingControls } from './GroupingControls';
import { SearchControls } from './SearchControls';
import { FilterControls } from './FilterControls';
import ProductFilters from './ProductFilters';
import { useProductSearch } from './useProductSearch';
import { useProductFiltering } from './useProductFiltering';
import { ProductFilter } from '../../templates/collection-view/FilterTypes';
import { EmptyState } from './EmptyState';
import { DataViewRenderer } from './DataViewRenderer';
import { GROUPABLE_ATTRIBUTES } from './constants';
import {
  ViewSpec,
  ViewSpecPatch,
  MalleabilityBlock,
  applySpecPatch,
  isAxisMalleable,
  makeSpec,
} from '../../templates/collection-view/spec';

export interface DataViewDemoProps {
  products?: Product[];
  defaultView?: ViewMode;
  defaultAttributes?: string[];
  defaultFilters?: ProductFilter[];
  defaultGrouping?: string | null;
  /** Which toolbar controls to render; omitted keys default to visible. */
  controls?: DataViewControls;
  /** Rendered at the head of the toolbar — for controls that swap the whole spec. */
  toolbarLeading?: React.ReactNode;
  /** Controlled framing: pass with onSpecChange to own the spec outside. */
  spec?: ViewSpec;
  onSpecChange?: (spec: ViewSpec) => void;
}

/**
 * The toolbar is a spec editor: filter edits the query, the switcher edits
 * the representation, sort/group edit the arrangement, and the attribute
 * selector edits the shown attributes. The `controls` prop is designer-side
 * disabling of that malleability — it re-expresses as the spec's
 * malleability block, so an enforced framing is still a framing.
 */
export function controlsToMalleability(controls: DataViewControls): MalleabilityBlock | undefined {
  const block: MalleabilityBlock = {};
  if (controls.filter === false) block.query = { disabled: true };
  if (controls.viewSwitcher === false) block.representation = { disabled: true };
  if (controls.attributes === false) block.content = { disabled: true };
  if (controls.sort === false && controls.group === false) block.arrangement = { disabled: true };
  return Object.keys(block).length > 0 ? block : undefined;
}

export const DataView: React.FC<DataViewDemoProps> = ({
  products = productsData as unknown as Product[],
  defaultView = 'card',
  defaultAttributes = ['name', 'description', 'category', 'pricing.msrp', 'availability.status'],
  defaultFilters = [],
  defaultGrouping = null,
  controls = {},
  toolbarLeading,
  spec: controlledSpec,
  onSpecChange,
}) => {
  const initialSpec = useMemo(
    () =>
      makeSpec({
        id: 'data-view-demo',
        query: defaultFilters,
        representation: { type: defaultView, shownAttributes: defaultAttributes },
        arrangement: {
          sortBy: { field: 'name', order: 'asc' },
          ...(defaultGrouping ? { groupBy: defaultGrouping, groupLayout: 'sections' } : {}),
        },
        malleability: controlsToMalleability(controls),
      }),
    // The defaults describe the embed, fixed at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [ownSpec, setOwnSpec] = useState<ViewSpec>(initialSpec);
  const spec = controlledSpec ?? ownSpec;
  const patchSpec = (patch: ViewSpecPatch) => {
    const next = applySpecPatch(spec, patch);
    if (onSpecChange) onSpecChange(next);
    if (!controlledSpec) setOwnSpec(next);
  };

  // Filter controls speak setState; route both forms through the spec patch.
  const setFilters: React.Dispatch<React.SetStateAction<ProductFilter[]>> = (action) => {
    const next =
      typeof action === 'function'
        ? (action as (prev: ProductFilter[]) => ProductFilter[])(spec.query)
        : action;
    patchSpec({ query: next });
  };

  const [searchQuery, setSearchQuery] = useState<string>('');

  const show = {
    viewSwitcher: controls.viewSwitcher !== false && isAxisMalleable(spec, 'representation'),
    search: controls.search !== false && isAxisMalleable(spec, 'query'),
    filter: controls.filter !== false && isAxisMalleable(spec, 'query'),
    attributes: controls.attributes !== false && isAxisMalleable(spec, 'content'),
    sort: controls.sort !== false && isAxisMalleable(spec, 'arrangement'),
    group: controls.group !== false && isAxisMalleable(spec, 'arrangement'),
  };

  const selectedAttributes = useMemo(
    () => new Set(spec.representation.shownAttributes),
    [spec.representation.shownAttributes]
  );
  const availableAttributes = useMemo(() => getAvailableAttributes(products), [products]);

  const handleAttributeToggle = (attribute: string) => {
    const shown = spec.representation.shownAttributes;
    patchSpec({
      representation: {
        shownAttributes: shown.includes(attribute)
          ? shown.filter((candidate) => candidate !== attribute)
          : [...shown, attribute],
      },
    });
  };

  const searchedProducts = useProductSearch(products, searchQuery);
  const { filteredProducts, filterCategories } = useProductFiltering(searchedProducts, spec.query);

  const sortBy = spec.arrangement.sortBy;
  const sortedProducts = useMemo(
    () => (sortBy ? sortProducts(filteredProducts, sortBy.field, sortBy.order) : filteredProducts),
    [filteredProducts, sortBy]
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
      <div className="toolbar">
        {toolbarLeading}
        {show.viewSwitcher && (
          <ViewSwitcher
            currentView={spec.representation.type as ViewMode}
            onViewChange={(view) => patchSpec({ representation: { type: view } })}
          />
        )}
        {show.search && (
          <SearchControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
        {show.filter && (
          <FilterControls
            filters={spec.query}
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
            currentField={sortBy?.field ?? 'name'}
            currentOrder={sortBy?.order ?? 'asc'}
            onSortChange={(field, order) =>
              patchSpec({ arrangement: { sortBy: { field, order } } })
            }
          />
        )}
        {show.group && (
          <GroupingControls
            availableAttributes={GROUPABLE_ATTRIBUTES}
            currentGrouping={spec.arrangement.groupBy ?? null}
            onGroupingChange={(attribute) =>
              patchSpec({
                arrangement: {
                  groupBy: attribute ?? undefined,
                  groupLayout: attribute ? spec.arrangement.groupLayout ?? 'sections' : undefined,
                },
              })
            }
          />
        )}
      </div>

      {show.filter && spec.query.length > 0 && (
        <ProductFilters
          filters={spec.query}
          setFilters={setFilters}
          filterCategories={filterCategories}
        />
      )}

      {hasNoResults ? (
        <EmptyState
          icon="ph:magnifying-glass"
          title="No results found"
          message={
            searchQuery && spec.query.length > 0
              ? `No products match "${searchQuery}" with current filters. Try adjusting your search or filters.`
              : searchQuery
              ? `No products match "${searchQuery}". Try adjusting your search terms.`
              : spec.query.length > 0
              ? 'No products match your current filters. Try adjusting your criteria.'
              : 'No products found.'
          }
        />
      ) : (
        <div>
          <DataViewRenderer
            viewMode={spec.representation.type as ViewMode}
            products={sortedProducts}
            selectedAttributes={selectedAttributes}
            groupBy={spec.arrangement.groupBy ?? null}
          />
        </div>
      )}
    </div>
  );
};
