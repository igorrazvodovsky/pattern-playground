import { Product } from '@shared/data/types';
import type { AttributeFilter } from '@shared/data/bindings';
import type { SortField, SortOrder } from '../../templates/collection-view/SortingUtils';

export type ViewMode = 'card' | 'list' | 'table';
export type AttributeSelection = Set<string>;
export type { SortField, SortOrder } from '../../templates/collection-view/SortingUtils';

export interface DataViewProps {
  products: Product[];
  defaultView?: ViewMode;
  defaultAttributes?: string[];
  defaultFilters?: AttributeFilter[];
}

export interface DataViewControls {
  viewSwitcher?: boolean;
  search?: boolean;
  filter?: boolean;
  attributes?: boolean;
  sort?: boolean;
  group?: boolean;
}

export interface GroupingControlsProps {
  availableAttributes: string[];
  currentGrouping: string | null;
  onGroupingChange: (attribute: string | null) => void;
}

export interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export interface AttributeSelectorProps {
  availableAttributes: string[];
  selectedAttributes: AttributeSelection;
  onAttributeToggle: (attribute: string) => void;
}

export interface SortingControlsProps {
  availableFields: string[];
  currentField: SortField;
  currentOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

export interface SearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}