# Phase 1: Enhance Command Menu Component

## Overview

Enhance the existing command menu components in `src/components/command-menu/` to provide a comprehensive, configurable component that includes all common patterns like hierarchical navigation, AI integration, and recent items management.

## Goals

- Consolidate all command menu features into a single, full-featured component
- Provide consistent functionality across all command menu usages
- Simplify the API for stories and real applications
- Maintain backward compatibility with existing low-level components
- Leverage existing AI components and hierarchical search utilities
- A comprehensive command menu component that combines all functionality currently demonstrated in stories.

**Features**:

- Hierarchical navigation (extracted from current stories)
- AI integration (using existing `AICommandEmpty` and `useAICommand`)
- Recent items management with filtering
- Configurable behavior through props
- Built-in search filtering and escape key handling
- Support for keyboard shortcuts display

**API Design**:

```typescript
interface CommandMenuProps {
  // Core data
  data: CommandData[];
  recentItems?: RecentItem[];

  // Behavior configuration
  onSelect?: (item: CommandItem | RecentItem | AICommandItem) => void;
  onEscape?: () => boolean | void;

  // AI configuration (optional)
  aiConfig?: {
    onAIRequest: (prompt: string) => Promise<AICommandResult>;
    debounceMs?: number;
    minInputLength?: number;
    availableFilters?: string[];
    availableValues?: Record<string, string[]>;
  };

  // Feature toggles
  showRecents?: boolean;
  enableNavigation?: boolean;
  enableAI?: boolean;

  // UI customization
  placeholder?: string;
  emptyMessage?: string;
  className?: string;

  // AI messages customization
  aiMessages?: {
    emptyStateMessage?: string;
    noResultsMessage?: string;
    aiProcessingMessage?: string;
    aiErrorPrefix?: string;
  };
}

interface CommandData {
  id: string;
  name: string;
  icon?: string;
  shortcut?: string[];
  children?: CommandChildData[];
  searchableText?: string;
}

interface CommandChildData {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
}

interface RecentItem {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  timestamp?: number;
}
```

**Usage Examples**:

```tsx
// Basic navigation menu (current story functionality)
<CommandMenu
  data={commandData}
  recentItems={recentItems}
  placeholder="Type a command or search..."
  onSelect={(item) => console.log("Selected:", item)}
/>

// AI-powered menu
<CommandMenu
  data={commandData}
  enableAI={true}
  aiConfig={{
    onAIRequest: handleAIRequest,
    debounceMs: 1500,
    minInputLength: 3,
  }}
  placeholder="Ask AI or search commands..."
/>

// Filtering context (no recents)
<CommandMenu
  data={filterOptions}
  showRecents={false}
  enableAI={true}
  aiConfig={filterAIConfig}
  onSelect={applyFilter}
  placeholder="Filter..."
/>

// Simple menu (minimal features)
<CommandMenu
  data={simpleCommands}
  showRecents={false}
  enableAI={false}
  placeholder="Search commands..."
/>
```

## Implementation Requirements

### File Structure

```
src/components/command-menu/
├── index.ts (update exports)
├── command.tsx (existing)
├── ai-command-empty.tsx (existing)
├── ai-command-types.ts (existing)
├── command-menu.tsx (new)
├── command-menu-types.ts (new - shared types)
└── hooks/
    ├── use-ai-command.ts (existing)
    └── use-command-navigation.ts (new - extracted from stories)
```

### 1. Extract Navigation Logic from Stories

Move the hierarchical navigation logic from `src/stories/compositions/CommandMenu/CommandMenu.tsx` into a reusable hook:

```typescript
// src/components/command-menu/hooks/use-command-navigation.ts
export function useCommandNavigation(data: CommandData[], searchInput: string) {
  // Extract state management and filtering logic from current story
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    if (selectedCommand) {
      // Child navigation logic
    } else {
      // Global search logic using existing hierarchical search utilities
    }
  }, [searchInput, selectedCommand, data]);

  return {
    selectedCommand,
    setSelectedCommand,
    filteredResults,
    handleEscape: () => {
      /* navigation back logic */
    },
  };
}
```

### 2. Create Comprehensive Component

Build `CommandMenu` that combines:

- Extracted navigation logic
- Existing AI components (`AICommandEmpty`, `useAICommand`)
- Recent items filtering and management
- Configurable feature toggles

### 3. Update Exports

```typescript
// src/components/command-menu/index.ts
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandItemPrefix,
  CommandItemSuffix,
} from "./command";

export { AICommandEmpty } from "./ai-command-empty";
export { useAICommand } from "./hooks/use-ai-command";
export { useCommandNavigation } from "./hooks/use-command-navigation";

// New comprehensive component
export { CommandMenu } from "./command-menu";

export type {
  AIState,
  AICommandResult,
  AICommandItem,
  AICommandEmptyProps,
} from "./ai-command-types";

export type {
  CommandMenuProps,
  CommandData,
  CommandChildData,
  RecentItem,
} from "./command-menu-types";
```

## Migration Guide

### For Stories

Update existing stories to use the new comprehensive component:

```tsx
// src/stories/compositions/CommandMenu/CommandMenu.stories.tsx
import { CommandMenu } from "../../../components/command-menu";

// Move commandData and recentItems to story file
const commandData: CommandData[] = [
  /* ... */
];
const recentItems: RecentItem[] = [
  /* ... */
];

export const Basic: Story = {
  render: () => (
    <CommandMenu
      data={commandData}
      recentItems={recentItems}
      enableNavigation={true}
      showRecents={true}
    />
  ),
};

export const WithAI: Story = {
  render: () => (
    <CommandMenu
      data={commandData}
      recentItems={recentItems}
      enableAI={true}
      aiConfig={{
        onAIRequest: mockAIRequest,
        debounceMs: 1000,
      }}
    />
  ),
};
```

### For Filtering Story

Simplify the filtering story implementation:

```tsx
// src/stories/compositions/Filtering/Filtering.tsx
import { CommandMenu } from "../../../components/command-menu";

export function FilteringDemo({ initialFilters = [] }) {
  // Keep filter management logic
  const [filters, setFilters] = useState(initialFilters);

  // Simplify command menu usage
  return (
    <div className="flex">
      <Filters filters={filters} setFilters={setFilters} />
      {/* ... other filter UI */}

      <pp-dropdown ref={dropdownRef}>
        <CommandMenu
          data={filterCommandData}
          enableAI={true}
          showRecents={false}
          aiConfig={{
            onAIRequest: handleAIFilterRequest,
            availableFilters: Object.values(FilterType),
            availableValues,
          }}
          onSelect={handleFilterApply}
          placeholder="Filter..."
        />
      </pp-dropdown>
    </div>
  );
}
```

### Breaking Changes

- None expected for existing low-level component usage
- Stories will need minor updates to import and use new component
- Current command menu usage in stories becomes much simpler

## Testing Requirements

### Unit Tests

- Test navigation state management with different data structures
- Test AI integration flows and error handling
- Test recent items filtering and management
- Test feature toggle combinations
- Test keyboard interactions and escape handling

### Integration Tests

- Test with real command data from stories
- Test AI service integration with filtering
- Test performance with large datasets
- Test accessibility and keyboard navigation

### Story Updates

- Update existing stories to use new component
- Create new stories showing different feature combinations
- Add performance and accessibility testing stories

## Success Criteria

1. **Code Reduction**: 70%+ reduction in story implementation complexity
2. **Consistency**: All command menus have access to same feature set
3. **Performance**: No degradation from current story implementations
4. **Usability**: Simpler API for both stories and real applications
5. **Compatibility**: Existing low-level components continue to work
6. **Features**: All current story functionality preserved and enhanced

## Dependencies

### Internal

- Existing command menu base components (`command.tsx`)
- Existing AI components (`ai-command-empty.tsx`, `useAICommand`)
- Hierarchical search utilities from `src/utils/`
- Filter service and adapters (for filtering story integration)

### External

- No new external dependencies required
- Uses existing React, CMDK, and utility libraries

## Next Steps

1. **Extract navigation hook** from current story implementation
2. **Create shared types** for consistent interfaces
3. **Implement comprehensive component** combining all features
4. **Update stories** to use new component
5. **Add comprehensive tests** for all feature combinations
6. **Update documentation** with new usage patterns

## Estimated Effort

- **Hook Extraction**: 1 day
- **Component Development**: 2-3 days
- **Story Migration**: 1 day
- **Testing**: 1-2 days
- **Documentation**: 1 day

**Total**: 6-8 days
