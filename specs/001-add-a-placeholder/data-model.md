# Data Model: Data View Composition

## Core Entities

### Product
Primary entity representing items in the data view.

**Fields**:
```typescript
interface Product {
  id: string;                    // Unique identifier (e.g., "PRD-EBK-001")
  name: string;                   // Product name
  type: string;                   // Entity type (always "product")
  icon: string;                   // Iconify icon identifier
  description: string;            // Product description
  searchableText: string;         // Text for search indexing
  metadata: ProductMetadata;      // Nested product details
}
```

### ProductMetadata
Comprehensive product information structure.

**Fields**:
```typescript
interface ProductMetadata {
  category: string;               // Main category
  subcategory: string;            // Sub-category
  assemblyComponents: string[];   // Component IDs
  keyMaterials: string[];         // Material IDs
  specifications: Record<string, any>;  // Technical specs
  lifecycle: LifecycleInfo;       // Lifecycle details
  sustainability: SustainabilityInfo;   // Environmental data
  circular: CircularInfo;         // Circular economy data
  pricing: PricingInfo;           // Pricing details
  availability: AvailabilityInfo; // Availability status
}
```

### ViewMode
Enumeration for display representations.

**Values**:
```typescript
type ViewMode = 'card' | 'table';
```

### AttributeSelection
Set of selected product attributes for display.

**Structure**:
```typescript
type AttributeSelection = Set<string>;
// Example: new Set(['name', 'category', 'pricing.msrp', 'sustainability.carbonFootprint'])
```

### ToolbarState
State management for toolbar controls.

**Fields**:
```typescript
interface ToolbarState {
  viewMode: ViewMode;                    // Current display mode
  selectedAttributes: AttributeSelection; // Active attribute filters
  isViewDropdownOpen: boolean;           // View selector state
  isAttributeDropdownOpen: boolean;      // Attribute selector state
}
```

## Component Interfaces

### DataViewProps
Props for the main Data View story component.

**Fields**:
```typescript
interface DataViewProps {
  products: Product[];                   // Product data array
  defaultView?: ViewMode;                // Initial view mode
  defaultAttributes?: string[];          // Initial selected attributes
}
```

### CardViewProps
Props for card representation component.

**Fields**:
```typescript
interface CardViewProps {
  products: Product[];                   // Products to display
  selectedAttributes: AttributeSelection; // Attributes to show
  onProductClick?: (product: Product) => void; // Click handler
}
```

### TableViewProps
Props for table representation component.

**Fields**:
```typescript
interface TableViewProps {
  products: Product[];                   // Products to display
  selectedAttributes: AttributeSelection; // Columns to show
  onSort?: (attribute: string) => void;  // Sort handler
  onProductClick?: (product: Product) => void; // Row click handler
}
```

### ViewSwitcherProps
Props for view mode dropdown component.

**Fields**:
```typescript
interface ViewSwitcherProps {
  currentView: ViewMode;                 // Active view
  onViewChange: (view: ViewMode) => void; // Change handler
  disabled?: boolean;                    // Disable state
}
```

### AttributeSelectorProps
Props for attribute selection dropdown.

**Fields**:
```typescript
interface AttributeSelectorProps {
  availableAttributes: string[];         // All possible attributes
  selectedAttributes: AttributeSelection; // Currently selected
  onAttributeToggle: (attribute: string) => void; // Toggle handler
  disabled?: boolean;                    // Disable state
}
```

## State Transitions

### View Mode Transitions
```
card → table: Preserve selected attributes, re-render in table format
table → card: Preserve selected attributes, re-render in card format
```

### Attribute Selection Transitions
```
add attribute: Add to selection set, trigger re-render
remove attribute: Remove from selection set, trigger re-render
clear all: Empty selection set, show default attributes
```

## Validation Rules

### Product Validation
- `id` must be unique across all products
- `name` must be non-empty string
- `icon` must be valid iconify identifier
- `metadata` must contain required top-level keys

### Attribute Selection Validation
- Cannot have empty attribute selection (minimum 1 attribute)
- Attribute paths must exist in product structure
- Nested attributes use dot notation (e.g., "pricing.msrp")

### View Mode Validation
- Must be one of defined ViewMode values
- Default view must be valid ViewMode
- View changes must preserve attribute selection

## Data Relationships

### Product → Attributes
- One product has many attributes (1:N)
- Attributes are derived from product object structure
- Nested objects create hierarchical attributes

### View → Products
- One view displays many products (1:N)
- All products shown in each view mode
- Display format changes, data remains constant

### Toolbar → View State
- Toolbar controls map 1:1 with view state
- Each control modifies specific state property
- State changes trigger view updates

## Default Values

### Initial State
```typescript
const defaultState: ToolbarState = {
  viewMode: 'card',
  selectedAttributes: new Set([
    'name',
    'description',
    'category',
    'pricing.msrp'
  ]),
  isViewDropdownOpen: false,
  isAttributeDropdownOpen: false
};
```

### Fallback Display
- If attribute missing: Show "-" or "N/A"
- If no attributes selected: Show default set
- If no products: Show empty state message

## Performance Considerations

### Data Limits
- Maximum 100 products for optimal performance
- Maximum 20 attributes selected simultaneously
- Nested attribute depth limited to 3 levels

### Update Frequency
- View switches: Immediate (<100ms)
- Attribute toggles: Immediate (<50ms)
- Data refreshes: Not applicable (static data)