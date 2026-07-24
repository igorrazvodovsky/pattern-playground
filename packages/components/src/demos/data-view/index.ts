// Main components
export { DataView, controlsToMalleability } from './DataView';
export { EmptyState } from './EmptyState';

// Spec-driven demos
export { SavedViewsDemo } from './SavedViewsDemo';
export { WritableBoardDemo } from './WritableBoardDemo';

// Configured slices for pattern-page embeds
export {
  DataViewDemo,
  DataViewGroupingSlice,
  DataViewFilteringSlice,
  DataViewSortingSlice,
} from './slices';

// Control components
export { ViewSwitcher } from './ViewSwitcher';
export { AttributeSelector } from './AttributeSelector';
export { SortingControls } from './SortingControls';
export { GroupingControls } from './GroupingControls';
export { SearchControls } from './SearchControls';
export { FilterControls } from './FilterControls';
export { default as ProductFilters } from './ProductFilters';

// Types
export * from './types';

// Filter system
export * from '../../templates/collection-view/FilterTypes';
export * from '../../templates/collection-view/FilterOperations';
export * from './FilterCategories';

// Utilities
export * from '../../templates/collection-view/AttributeUtils';
export * from '../../templates/collection-view/SortingUtils';

// Hooks
export { useProductSearch } from './useProductSearch';
export { useProductFiltering } from './useProductFiltering';
export { useFilterState } from './hooks/useFilterState';
export { useDropdownState } from './hooks/useDropdownState';

// Constants
export * from './constants';

// AI adapter
export { generateProductFilterSuggestions } from './aiFilterAdapter';