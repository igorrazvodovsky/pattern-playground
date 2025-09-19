import { Product } from '../../data/types';

export type ViewMode = 'card' | 'list' | 'table';
export type AttributeSelection = Set<string>;
export type SortOrder = 'asc' | 'desc';
export type SortField = string;

export interface DataViewProps {
  products: Product[];
  defaultView?: ViewMode;
  defaultAttributes?: string[];
}

export interface CardViewProps {
  products: Product[];
  selectedAttributes: AttributeSelection;
}

export interface TableViewProps {
  products: Product[];
  selectedAttributes: AttributeSelection;
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