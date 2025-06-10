# Focus and Context Stories - Migration Notes

## Migration from Web Components to React

The FocusAndContext stories have been successfully migrated from web components to React. This migration maintains the rich functionality of the original implementation while adapting to React patterns.

### Key Changes Made

#### 1. Component Architecture

- **Before**: Lit-based web components with HTML templates
- **After**: React functional components with hooks for state management

#### 2. Data Management

- **Created**: `DataService` class for managing production line data
- **Integrated**: Real JSON data from `JuiceProduction.json` (1356 lines of industrial process data)
- **Added**: Async data loading with proper error handling

#### 3. Type Compatibility

- **Fixed**: `childrenIds` → `children` property mapping for backward compatibility
- **Added**: `resolveJsonModule` to TypeScript configuration
- **Ensured**: Type safety with existing schema definitions

#### 4. Interactive Features

- **Navigation**: Click-through navigation between production line components
- **Related Objects**: Dynamic loading of related components with loading states
- **Breadcrumbs**: Contextual navigation showing current location in hierarchy
- **Structure Display**: Hierarchical display of child components

#### 5. React Patterns Used

- `useState` for component state management
- `useEffect` for data initialization and lifecycle management
- Functional components with proper TypeScript typing
- Error boundaries and loading states

### Components Created

1. **Breadcrumbs**: Navigation component showing current location
2. **AttributesSection**: Displays item attributes with badges
3. **StructureSection**: Interactive table of child components
4. **RelatedObjectsSection**: Grid of related components with loading states
5. **MainItemCard**: Primary item display with actions

### Data Features

- **Real Data**: Uses actual orange juice production line data
- **Interactive**: Click any component to navigate and see its details
- **Related Objects**: Shows process flow relationships between components
- **Attributes**: Displays technical specifications (capacity, throughput, etc.)
- **Rules & Constraints**: Shows operational constraints and requirements

### Test Story

A test story (`DataLoadTest`) has been created to verify:

- Data service initialization
- JSON data loading
- Schema compatibility
- Children mapping functionality

### Usage

The story demonstrates the "Focus and Context" pattern by:

- Showing detailed information about a selected item (Focus)
- Maintaining breadcrumb navigation and related objects (Context)
- Allowing seamless navigation while preserving situational awareness

This pattern is particularly useful for complex industrial systems where users need to understand both the specific component they're working with and how it fits into the broader system.
