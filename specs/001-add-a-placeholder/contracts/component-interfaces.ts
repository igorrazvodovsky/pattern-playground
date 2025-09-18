/**
 * Component Interfaces for Data View Composition
 *
 * This file defines the contracts for all components in the Data View story.
 * These interfaces ensure type safety and clear component boundaries.
 */

// ============================================================================
// Core Data Types
// ============================================================================

export interface Product {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: ProductMetadata;
}

export interface ProductMetadata {
  category: string;
  subcategory: string;
  assemblyComponents: string[];
  keyMaterials: string[];
  specifications: Record<string, any>;
  lifecycle: {
    designLife: number | string;
    designLifeUnit: string;
    warrantyPeriod: number;
    expectedMileage?: number;
    expectedCycles?: number;
    expectedUsage?: string;
    mileageUnit?: string;
    maintenanceInterval: number | string;
    repairability: string;
    upgradeability: string;
    endOfLifeOptions: string[];
  };
  sustainability: {
    carbonFootprint: number;
    unit: string;
    recycledContentOverall: number;
    recyclabilityScore: number;
    carbonPayback?: number;
    carbonPaybackUnit?: string;
    carbonSequestration?: number;
    waterFootprint?: number;
    waterFootprintUnit?: string;
    compostTime?: number;
    compostTimeUnit?: string;
    lca: string;
    certifications: string[];
  };
  circular: {
    designForDisassembly: boolean;
    modularDesign: boolean;
    standardFasteners: boolean;
    materialPassport: string;
    takeBackProgram: boolean;
    refurbishmentPartner: string | null;
  };
  pricing: {
    msrp: number;
    currency: string;
    leaseOptions: boolean;
    subscriptionModel: boolean;
    tradeInValue: number;
  };
  availability: {
    status: string;
    leadTime: number;
    leadTimeUnit: string;
    regions: string[];
    channels: string[];
  };
}

// ============================================================================
// View State Types
// ============================================================================

export type ViewMode = 'card' | 'table';

export type AttributeSelection = Set<string>;

export interface ToolbarState {
  viewMode: ViewMode;
  selectedAttributes: AttributeSelection;
  isViewDropdownOpen: boolean;
  isAttributeDropdownOpen: boolean;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

/**
 * Main Data View story component props
 */
export interface DataViewProps {
  products: Product[];
  defaultView?: ViewMode;
  defaultAttributes?: string[];
}

/**
 * Card view representation props
 */
export interface CardViewProps {
  products: Product[];
  selectedAttributes: AttributeSelection;
  onProductClick?: (product: Product) => void;
}

/**
 * Table view representation props
 */
export interface TableViewProps {
  products: Product[];
  selectedAttributes: AttributeSelection;
  onSort?: (attribute: string) => void;
  onProductClick?: (product: Product) => void;
}

/**
 * View mode switcher dropdown props
 */
export interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  disabled?: boolean;
}

/**
 * Attribute selection dropdown props
 */
export interface AttributeSelectorProps {
  availableAttributes: string[];
  selectedAttributes: AttributeSelection;
  onAttributeToggle: (attribute: string) => void;
  disabled?: boolean;
}

/**
 * Toolbar container props
 */
export interface ToolbarProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  availableAttributes: string[];
  selectedAttributes: AttributeSelection;
  onAttributeToggle: (attribute: string) => void;
}

// ============================================================================
// Event Types
// ============================================================================

export interface ViewChangeEvent {
  previousView: ViewMode;
  newView: ViewMode;
  timestamp: number;
}

export interface AttributeToggleEvent {
  attribute: string;
  action: 'add' | 'remove';
  currentSelection: string[];
  timestamp: number;
}

export interface ProductClickEvent {
  product: Product;
  viewMode: ViewMode;
  timestamp: number;
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Attribute descriptor for display
 */
export interface AttributeDescriptor {
  path: string;           // Dot-notation path (e.g., "pricing.msrp")
  label: string;          // Display label
  category: string;       // Grouping category
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  sortable: boolean;
  filterable: boolean;
}

/**
 * View configuration
 */
export interface ViewConfig {
  mode: ViewMode;
  defaultAttributes: string[];
  layout?: 'grid' | 'list' | 'auto';
  itemsPerRow?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_ATTRIBUTES = [
  'name',
  'description',
  'metadata.category',
  'metadata.pricing.msrp'
];

export const VIEW_MODES: ViewMode[] = ['card', 'table'];

export const ATTRIBUTE_CATEGORIES = {
  basic: ['name', 'description', 'type'],
  classification: ['metadata.category', 'metadata.subcategory'],
  specifications: ['metadata.specifications'],
  lifecycle: ['metadata.lifecycle'],
  sustainability: ['metadata.sustainability'],
  pricing: ['metadata.pricing'],
  availability: ['metadata.availability']
};

// ============================================================================
// Validation Functions
// ============================================================================

export function isValidViewMode(mode: any): mode is ViewMode {
  return VIEW_MODES.includes(mode);
}

export function isValidProduct(obj: any): obj is Product {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.metadata === 'object'
  );
}

export function validateAttributePath(path: string, product: Product): boolean {
  const parts = path.split('.');
  let current: any = product;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return false;
    }
  }

  return true;
}