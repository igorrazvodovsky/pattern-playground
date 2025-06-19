# Phase 2: Extract Common Hooks

## Overview

Extract reusable hooks from the `CommandMenu` component created in Phase 1 to create a modular, composable architecture. This provides granular control and enables custom command menu implementations when the comprehensive component isn't sufficient.

## Goals

- Break down the monolithic `CommandMenu` into composable hooks
- Enable custom command menu implementations using individual hooks
- Simplify testing by isolating business logic
- Support advanced customization scenarios beyond the main component
- Make the component architecture more modular and maintainable

## Hooks to Extract

### 1. `useCommandNavigation`

Manages hierarchical navigation state and logic (extracted from Phase 1).

**Location**: `src/components/command-menu/hooks/use-command-navigation.ts`

**Responsibilities**:

- Track current navigation level (parent/child)
- Handle navigation state transitions
- Manage search input filtering for current level
- Handle escape key navigation back
- Filter data based on current navigation context

**API Design**:

```typescript
interface UseCommandNavigationOptions {
  data: CommandData[];
  initialSearchInput?: string;
  onNavigate?: (level: NavigationLevel) => void;
}

interface NavigationLevel {
  type: "root" | "child";
  parentId?: string;
  parentName?: string;
}

interface UseCommandNavigationReturn {
  // State
  selectedCommand: string | null;
  searchInput: string;
  currentLevel: NavigationLevel;
  filteredResults: NavigationResults;

  // Actions
  setSearchInput: (input: string) => void;
  navigateToCommand: (commandId: string) => void;
  navigateBack: () => void;
  handleEscape: () => boolean;

  // Derived state
  placeholder: string;
  isInChildView: boolean;
}

interface NavigationResults {
  parents: CommandData[];
  children: Array<{ parent: CommandData; child: CommandChildData }>;
}
```

**Usage Example**:

```tsx
const {
  searchInput,
  setSearchInput,
  selectedCommand,
  filteredResults,
  navigateToCommand,
  handleEscape,
  placeholder,
  isInChildView,
} = useCommandNavigation({
  data: commandData,
  onNavigate: (level) => console.log("Navigated to:", level),
});
```

### 2. `useCommandRecents`

Manages recent items state, persistence, and filtering.

**Location**: `src/components/command-menu/hooks/use-command-recents.ts`

**Responsibilities**:

- Track recently selected items
- Persist recent items to localStorage (optional)
- Filter recent items based on search input
- Limit recent items count
- Handle recent item selection and updating

**API Design**:

```typescript
interface UseCommandRecentsOptions {
  maxRecents?: number;
  persistRecents?: boolean;
  storageKey?: string;
  initialRecents?: RecentItem[];
}

interface UseCommandRecentsReturn {
  // State
  recentItems: RecentItem[];
  filteredRecentItems: RecentItem[];

  // Actions
  addToRecents: (item: RecentItem) => void;
  removeFromRecents: (itemId: string) => void;
  clearRecents: () => void;

  // Filtering
  filterRecents: (searchInput: string) => RecentItem[];
}

interface RecentItem {
  id: string;
  name: string;
  icon?: string;
  searchableText?: string;
  timestamp: number;
  type?: "command" | "item" | "filter";
}
```

**Usage Example**:

```tsx
const { recentItems, filteredRecentItems, addToRecents, filterRecents } =
  useCommandRecents({
    maxRecents: 10,
    persistRecents: true,
    storageKey: "command-menu-recents",
  });

// Filter recents based on search input
const searchFilteredRecents = filterRecents(searchInput);
```

### 3. `useCommandKeyboard`

Handles keyboard shortcuts and navigation.

**Location**: `src/components/command-menu/hooks/use-command-keyboard.ts`

**Responsibilities**:

- Register and handle keyboard shortcuts
- Manage focus and navigation
- Handle special keys (escape, enter, arrows)
- Support command shortcuts display

**API Design**:

```typescript
interface UseCommandKeyboardOptions {
  shortcuts?: CommandShortcut[];
  onEscape?: () => boolean | void;
  onEnter?: (selectedItem: string) => void;
  navigationEnabled?: boolean;
}

interface CommandShortcut {
  keys: string[];
  commandId: string;
  description?: string;
}

interface UseCommandKeyboardReturn {
  // Event handlers
  handleKeyDown: (e: React.KeyboardEvent) => void;

  // Shortcut utilities
  getShortcutForCommand: (commandId: string) => string[] | undefined;
  formatShortcut: (keys: string[]) => React.ReactNode;

  // Focus management
  focusInput: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}
```

**Usage Example**:

```tsx
const { handleKeyDown, getShortcutForCommand, formatShortcut, inputRef } =
  useCommandKeyboard({
    shortcuts: [
      { keys: ["⌘", "S"], commandId: "search" },
      { keys: ["⌘", "N"], commandId: "create" },
    ],
    onEscape: handleEscape,
  });
```

### 4. `useCommandSelection`

Manages item selection and execution.

**Location**: `src/components/command-menu/hooks/use-command-selection.ts`

**Responsibilities**:

- Handle item selection logic
- Execute selected commands
- Manage selection state
- Handle different item types (commands, recents, AI results)

**API Design**:

```typescript
interface UseCommandSelectionOptions {
  onSelect?: (item: SelectableItem) => void;
  onCommandSelect?: (command: CommandData) => void;
  onRecentSelect?: (recent: RecentItem) => void;
  onAIResultSelect?: (result: AICommandResult) => void;
  closeOnSelect?: boolean;
}

type SelectableItem = CommandData | RecentItem | AICommandItem;

interface UseCommandSelectionReturn {
  // Actions
  selectItem: (item: SelectableItem) => void;
  selectCommand: (commandId: string, data: CommandData[]) => void;
  selectRecent: (recentId: string, recents: RecentItem[]) => void;

  // State
  selectedItemId: string | null;

  // Utilities
  getItemType: (item: SelectableItem) => "command" | "recent" | "ai";
}
```

### 5. `useCommandComposition`

Combines multiple command menu hooks for complex scenarios.

**Location**: `src/components/command-menu/hooks/use-command-composition.ts`

**Responsibilities**:

- Coordinate between navigation, recents, and AI hooks
- Handle cross-cutting concerns
- Provide unified state management
- Simplify complex hook combinations

**API Design**:

```typescript
interface UseCommandCompositionOptions {
  data: CommandData[];
  enableNavigation?: boolean;
  enableRecents?: boolean;
  enableAI?: boolean;
  aiConfig?: AIConfig;
  recentsConfig?: UseCommandRecentsOptions;
  keyboardConfig?: UseCommandKeyboardOptions;
}

interface UseCommandCompositionReturn {
  // Combined state from all hooks
  searchInput: string;
  setSearchInput: (input: string) => void;

  // Navigation (if enabled)
  navigation?: UseCommandNavigationReturn;

  // Recents (if enabled)
  recents?: UseCommandRecentsReturn;

  // AI (if enabled)
  ai?: ReturnType<typeof useAICommand>;

  // Keyboard
  keyboard: UseCommandKeyboardReturn;

  // Selection
  selection: UseCommandSelectionReturn;

  // Unified results
  results: UnifiedResults;
}

interface UnifiedResults {
  commands: CommandData[];
  children: Array<{ parent: CommandData; child: CommandChildData }>;
  recents: RecentItem[];
  aiSuggestions: AICommandItem[];
  isEmpty: boolean;
}
```

## Implementation Requirements

### 1. Extract Navigation Logic from Phase 1

- Move hierarchical search logic from `CommandMenu` to `useCommandNavigation`
- Implement state management for parent/child navigation
- Handle escape key logic
- Support dynamic placeholder updates

### 2. Create Recents Management

- Extract recent items logic from `CommandMenu`
- Implement localStorage persistence logic
- Add recent items filtering and limiting
- Handle different item types in recents

### 3. Implement Keyboard Handling

- Extract keyboard shortcut logic from existing implementations
- Add focus management utilities
- Implement navigation key handling
- Support customizable shortcuts

### 4. Create Selection Management

- Centralize item selection logic from `CommandMenu`
- Handle different selection scenarios
- Add execution and callback handling
- Support multi-type selections

### 5. Build Composition Hook

- Combine all hooks intelligently
- Handle feature flags and conditional logic
- Provide unified API for complex scenarios
- Optimize performance with proper memoization

## File Structure Updates

```
src/components/command-menu/hooks/
├── index.ts (exports)
├── use-ai-command.ts (existing)
├── use-command-navigation.ts (extracted from Phase 1)
├── use-command-recents.ts (new)
├── use-command-keyboard.ts (new)
├── use-command-selection.ts (new)
└── use-command-composition.ts (new)
```

## Testing Strategy

### Unit Tests for Each Hook

```typescript
// Example test structure
describe("useCommandNavigation", () => {
  test("should handle parent navigation");
  test("should handle child navigation");
  test("should filter results correctly");
  test("should handle escape navigation");
  test("should update placeholder dynamically");
});

describe("useCommandRecents", () => {
  test("should add items to recents");
  test("should persist to localStorage");
  test("should limit recent items count");
  test("should filter recents by search");
});
```

### Integration Tests

- Test hook combinations in `useCommandComposition`
- Test real-world scenarios with multiple features
- Performance testing with large datasets

## Migration Path

### Phase 2A: Extract Basic Hooks

1. `useCommandNavigation` - Extract from `CommandMenu`
2. `useCommandRecents` - Extract recent items logic
3. `useCommandKeyboard` - Extract keyboard handling

### Phase 2B: Advanced Hooks

1. `useCommandSelection` - Extract selection logic
2. `useCommandComposition` - Create unified composition hook

### Phase 2C: Refactor Main Component

1. Refactor `CommandMenu` to use extracted hooks
2. Ensure no functionality is lost
3. Add new customization examples

## Benefits

### For Developers

- **Composability**: Mix and match features as needed
- **Testing**: Easier to test isolated logic
- **Reusability**: Use hooks in completely custom implementations
- **Flexibility**: Build command menus with specific features only

### For the Main Component

- **Cleaner Code**: Logic separated from presentation
- **Better Performance**: Optimized memoization in hooks
- **Easier Maintenance**: Clear responsibility boundaries
- **Enhanced Customization**: Hooks can be overridden or extended

## Example Usage Scenarios

### Simple Navigation Menu

```tsx
const SimpleCommandMenu = ({ data }) => {
  const navigation = useCommandNavigation({ data });
  const keyboard = useCommandKeyboard({ onEscape: navigation.handleEscape });

  return (
    <Command onKeyDown={keyboard.handleKeyDown}>
      <CommandInput
        value={navigation.searchInput}
        onValueChange={navigation.setSearchInput}
        placeholder={navigation.placeholder}
        ref={keyboard.inputRef}
      />
      {/* Render filtered results */}
    </Command>
  );
};
```

### Full-Featured Menu

```tsx
const AdvancedCommandMenu = ({ data, aiConfig }) => {
  const { navigation, recents, ai, keyboard, selection, results } =
    useCommandComposition({
      data,
      enableNavigation: true,
      enableRecents: true,
      enableAI: true,
      aiConfig,
    });

  return (
    <Command onKeyDown={keyboard.handleKeyDown}>
      {/* Simplified rendering with unified results */}
    </Command>
  );
};
```

### Refactored Main Component

```tsx
// CommandMenu using extracted hooks
export function CommandMenu(props: CommandMenuProps) {
  const composition = useCommandComposition({
    data: props.data,
    enableNavigation: props.enableNavigation ?? true,
    enableRecents: props.showRecents ?? true,
    enableAI: props.enableAI ?? !!props.aiConfig,
    aiConfig: props.aiConfig,
  });

  return (
    <Command onKeyDown={composition.keyboard.handleKeyDown}>
      {/* Render using composition results */}
    </Command>
  );
}
```

## Success Criteria

1. **Hook Reusability**: Hooks can be used independently or combined
2. **Performance**: No regression in command menu performance
3. **Code Quality**: Better separation of concerns and testability
4. **Compatibility**: `CommandMenu` maintains same API
5. **Flexibility**: Enable custom command menu implementations

## Dependencies

### On Phase 1

- Requires completion of `CommandMenu` component
- Uses types and interfaces established in Phase 1

### External Dependencies

- React hooks (useState, useEffect, useMemo, useCallback)
- lodash (for debouncing and utilities)
- Existing AI and search utilities

## Estimated Effort

- **Hook Extraction**: 2-3 days
- **Testing**: 2-3 days
- **Component Refactoring**: 1-2 days
- **Documentation**: 1-2 days

**Total**: 6-10 days
