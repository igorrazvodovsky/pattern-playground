# Phase 3: Advanced Composition Patterns

## Overview

Develop advanced composition patterns building on the `CommandMenuWithFeatures` component and extracted hooks from Phases 1-2. Create configuration-driven patterns, plugin architecture, and advanced customization options for complex use cases.

## Goals

- Create declarative configuration patterns for common command menu setups
- Implement a plugin system for extending functionality
- Provide standardized presets for different use cases
- Enable dynamic feature loading and configuration
- Support theming and advanced customization
- Make complex command menus as configurable as simple ones

## Core Concepts

### 1. Configuration-Driven Patterns

Build upon `CommandMenuWithFeatures` with configuration presets and builders.

**Before (Phase 1)**:

```tsx
<CommandMenuWithFeatures
  data={commandData}
  enableAI={true}
  aiConfig={{
    onAIRequest: handleAIRequest,
    debounceMs: 1500,
    minInputLength: 3,
  }}
  showRecents={true}
  enableNavigation={true}
  placeholder="Ask AI or search commands..."
/>
```

**After (Phase 3)**:

```tsx
<CommandMenuComposer
  preset="ai-powered"
  data={commandData}
  config={{
    ai: { provider: "openai", debounceMs: 1000 },
    recents: { maxItems: 15, persistToStorage: true },
  }}
/>
```

### 2. Plugin System

Enable modular feature additions through a plugin architecture.

```typescript
interface CommandMenuPlugin {
  name: string;
  version: string;
  dependencies?: string[];
  hooks: PluginHooks;
  components?: PluginComponents;
  config?: PluginConfig;
}

interface PluginHooks {
  onInit?: (context: CommandMenuContext) => void;
  onSearch?: (query: string, context: CommandMenuContext) => SearchResult[];
  onSelect?: (item: SelectableItem, context: CommandMenuContext) => void;
  onRender?: (context: CommandMenuContext) => React.ReactNode;
}
```

## Components to Create

### 1. `CommandMenuComposer`

A configuration-driven wrapper around `CommandMenuWithFeatures`.

**Location**: `src/components/command-menu/command-menu-composer.tsx`

**Features**:

- Configuration presets for common patterns
- Plugin loading and coordination
- Theme and customization support
- Advanced configuration options

**API Design**:

```typescript
interface CommandMenuComposerProps {
  // Quick setup
  preset?: CommandMenuPreset;
  data: CommandData[];

  // Advanced configuration
  config?: CommandMenuAdvancedConfig;
  plugins?: CommandMenuPlugin[];
  theme?: CommandMenuTheme;

  // Base component props
  onSelect?: (item: any) => void;
  onEscape?: () => boolean | void;
  className?: string;
}

type CommandMenuPreset =
  | "simple-navigation"
  | "ai-powered"
  | "developer-tools"
  | "content-management"
  | "filtering";

interface CommandMenuAdvancedConfig {
  // Enhanced AI configuration
  ai?: {
    provider: "openai" | "anthropic" | "custom";
    apiKey?: string;
    endpoint?: string;
    debounceMs?: number;
    minQueryLength?: number;
    maxSuggestions?: number;
    enableStreaming?: boolean;
  };

  // Enhanced recents configuration
  recents?: {
    maxItems?: number;
    persistToStorage?: boolean;
    storageKey?: string;
    groupByType?: boolean;
    showTimestamps?: boolean;
  };

  // Navigation configuration
  navigation?: {
    enableBreadcrumbs?: boolean;
    maxDepth?: number;
    backButtonText?: string;
    showParentInResults?: boolean;
  };

  // UI configuration
  ui?: {
    size?: "sm" | "md" | "lg";
    variant?: "default" | "minimal" | "compact";
    showIcons?: boolean;
    showShortcuts?: boolean;
    maxHeight?: string;
    width?: string;
  };

  // Behavior configuration
  behavior?: {
    closeOnSelect?: boolean;
    selectOnTab?: boolean;
    enableTypeahead?: boolean;
  };
}
```

**Usage Examples**:

```tsx
// Simple preset usage
<CommandMenuComposer
  preset="ai-powered"
  data={commandData}
  onSelect={handleSelect}
/>

// Advanced configuration
<CommandMenuComposer
  data={commandData}
  config={{
    ai: { provider: "openai", debounceMs: 1000 },
    recents: { maxItems: 15, persistToStorage: true },
    ui: { size: "lg", variant: "compact" },
    navigation: { enableBreadcrumbs: true }
  }}
  plugins={[analyticsPlugin, favoritesPlugin]}
  theme={customTheme}
/>

// Custom themed menu
<CommandMenuComposer
  preset="developer-tools"
  data={commandData}
  theme={{
    colors: { accent: "#007acc" },
    spacing: { padding: "12px" }
  }}
/>
```

### 2. `useCommandMenuBuilder`

A hook for building command menu configurations programmatically.

**Location**: `src/components/command-menu/hooks/use-command-menu-builder.ts`

**Features**:

- Programmatic configuration building
- Runtime feature toggling
- Configuration validation
- Preset management

**API Design**:

```typescript
interface UseCommandMenuBuilderOptions {
  initialPreset?: CommandMenuPreset;
  initialConfig?: Partial<CommandMenuAdvancedConfig>;
  validateConfig?: boolean;
}

interface UseCommandMenuBuilderReturn {
  // Configuration state
  preset: CommandMenuPreset | null;
  config: CommandMenuAdvancedConfig;

  // Preset management
  applyPreset: (preset: CommandMenuPreset) => void;
  resetToPreset: () => void;

  // Configuration builders
  setAIConfig: (config: Partial<AIConfig>) => void;
  setRecentsConfig: (config: Partial<RecentsConfig>) => void;
  setUIConfig: (config: Partial<UIConfig>) => void;

  // Feature toggles
  enableFeature: (feature: CommandMenuFeature) => void;
  disableFeature: (feature: CommandMenuFeature) => void;
  toggleFeature: (feature: CommandMenuFeature) => void;

  // Validation
  validateConfig: () => ConfigValidationResult;
  isValid: boolean;
  errors: string[];

  // Serialization
  exportConfig: () => string;
  importConfig: (config: string) => void;
}

type CommandMenuFeature =
  | "navigation"
  | "recents"
  | "ai"
  | "keyboard-shortcuts"
  | "search-highlighting"
  | "categories"
  | "favorites";
```

### 3. Plugin System Components

#### Built-in Plugins

**`AnalyticsPlugin`**:

```typescript
const analyticsPlugin: CommandMenuPlugin = {
  name: "analytics",
  version: "1.0.0",
  hooks: {
    onSearch: (query, context) => {
      analytics.track("command_menu_search", { query });
    },
    onSelect: (item, context) => {
      analytics.track("command_menu_select", {
        itemId: item.id,
        itemType: context.getItemType(item),
      });
    },
  },
};
```

**`FavoritesPlugin`**:

```typescript
const favoritesPlugin: CommandMenuPlugin = {
  name: "favorites",
  version: "1.0.0",
  hooks: {
    onSelect: (item, context) => {
      if (context.isFavorited(item.id)) {
        context.removeFavorite(item.id);
      } else {
        context.addFavorite(item);
      }
    },
  },
};
```

**`CategoriesPlugin`**:

```typescript
const categoriesPlugin: CommandMenuPlugin = {
  name: "categories",
  version: "1.0.0",
  hooks: {
    onRender: (context) => {
      return <CategoryFilters categories={context.getCategories()} />;
    },
  },
};
```

### 4. Configuration Presets

**Location**: `src/components/command-menu/presets/`

```typescript
// presets/simple-navigation.ts
export const simpleNavigationPreset: CommandMenuAdvancedConfig = {
  navigation: { enableBreadcrumbs: true },
  ui: { size: "md", variant: "default" },
  behavior: { closeOnSelect: true },
};

// presets/ai-powered.ts
export const aiPoweredPreset: CommandMenuAdvancedConfig = {
  ai: { debounceMs: 1000, minQueryLength: 3 },
  recents: { maxItems: 10, persistToStorage: true },
  navigation: { enableBreadcrumbs: true },
  ui: { size: "lg", showIcons: true },
};

// presets/developer-tools.ts
export const developerToolsPreset: CommandMenuAdvancedConfig = {
  recents: { maxItems: 15, persistToStorage: true },
  navigation: { enableBreadcrumbs: true },
  ui: { variant: "compact", showShortcuts: true },
  behavior: { selectOnTab: true },
};

// presets/filtering.ts
export const filteringPreset: CommandMenuAdvancedConfig = {
  ai: { debounceMs: 1500, minQueryLength: 3 },
  recents: { maxItems: 0 }, // Disable recents for filtering
  navigation: { enableBreadcrumbs: false },
  ui: { size: "md", variant: "minimal" },
};
```

## Implementation Strategy

### Phase 3A: Configuration System

1. **Create configuration presets**
2. **Build configuration validation**
3. **Implement preset management**

### Phase 3B: Composer Component

1. **Create `CommandMenuComposer` wrapper**
2. **Integrate preset system**
3. **Add theme support**

### Phase 3C: Plugin Architecture

1. **Design plugin API and lifecycle**
2. **Create plugin manager**
3. **Implement core plugins**

### Phase 3D: Advanced Features

1. **Add configuration builder hook**
2. **Create migration utilities**
3. **Add comprehensive documentation**

## File Structure

```
src/components/command-menu/
├── index.ts (updated exports)
├── command-menu-with-features.tsx (from Phase 1)
├── command-menu-composer.tsx (new)
├── plugin-provider.tsx (new)
├── hooks/
│   ├── use-command-menu-builder.ts (new)
│   ├── use-plugin-manager.ts (new)
│   └── ... (hooks from Phase 2)
├── plugins/
│   ├── index.ts
│   ├── analytics-plugin.ts
│   ├── favorites-plugin.ts
│   ├── categories-plugin.ts
│   └── plugin-types.ts
├── presets/
│   ├── index.ts
│   ├── simple-navigation.ts
│   ├── ai-powered.ts
│   ├── developer-tools.ts
│   └── filtering.ts
├── themes/
│   ├── index.ts
│   ├── default-theme.ts
│   └── theme-types.ts
└── utils/
    ├── config-validator.ts
    └── preset-manager.ts
```

## Advanced Usage Examples

### 1. Dynamic Configuration

```tsx
const DynamicCommandMenu = () => {
  const { preset, config, applyPreset, toggleFeature } = useCommandMenuBuilder({
    initialPreset: "simple-navigation",
  });

  const handleToggleAI = () => {
    toggleFeature("ai");
  };

  return (
    <>
      <div>
        <button onClick={() => applyPreset("ai-powered")}>AI Mode</button>
        <button onClick={() => applyPreset("developer-tools")}>Dev Mode</button>
        <button onClick={handleToggleAI}>Toggle AI</button>
      </div>
      <CommandMenuComposer preset={preset} config={config} data={commandData} />
    </>
  );
};
```

### 2. Plugin Integration

```tsx
const customSearchPlugin: CommandMenuPlugin = {
  name: "fuzzy-search",
  version: "1.0.0",
  dependencies: ["navigation"],
  hooks: {
    onSearch: (query, context) => {
      return fuzzySearch(query, context.getAllItems());
    },
  },
  config: {
    threshold: 0.6,
    includeScore: true,
  },
};

<CommandMenuComposer
  preset="developer-tools"
  data={commandData}
  plugins={[customSearchPlugin, analyticsPlugin]}
/>;
```

### 3. Story Migration

```tsx
// Updated story using composer
export const Basic: Story = {
  render: () => (
    <CommandMenuComposer preset="simple-navigation" data={commandData} />
  ),
};

export const WithAI: Story = {
  render: () => <CommandMenuComposer preset="ai-powered" data={commandData} />,
};

export const Filtering: Story = {
  render: () => <CommandMenuComposer preset="filtering" data={filterData} />,
};
```

## Migration from Previous Phases

### From Phase 1 & 2

```tsx
// Before (Phase 1)
<CommandMenuWithFeatures
  data={data}
  enableAI={true}
  aiConfig={aiConfig}
  showRecents={true}
/>

// After (Phase 3)
<CommandMenuComposer
  preset="ai-powered"
  data={data}
  config={{ ai: aiConfig }}
/>
```

## Testing Strategy

### Configuration Testing

- Test all preset configurations
- Validate configuration combinations
- Test preset switching and validation

### Plugin Testing

- Test plugin loading and lifecycle
- Test plugin dependencies and conflicts
- Test plugin API compatibility

### Integration Testing

- Test complex configurations with multiple plugins
- Test theme applications and customizations
- Test runtime configuration changes

## Success Criteria

1. **Simplicity**: 80% reduction in configuration code for common patterns
2. **Flexibility**: Support 10+ different preset patterns
3. **Performance**: No degradation with plugin system
4. **Extensibility**: Third-party plugins can be developed
5. **Migration**: Smooth upgrade from Phase 1/2

## Dependencies

### On Previous Phases

- Phase 1: Uses `CommandMenuWithFeatures` as base implementation
- Phase 2: Uses extracted hooks for advanced customization

### External Dependencies

- React 18+ (for concurrent features)
- TypeScript (for configuration type safety)
- Existing utility libraries

## Estimated Effort

- **Configuration System**: 2-3 days
- **Composer Component**: 2-3 days
- **Plugin System**: 3-4 days
- **Presets and Themes**: 2 days
- **Testing**: 2-3 days
- **Documentation**: 2 days

**Total**: 13-17 days

## Future Enhancements

1. **Visual Configuration Builder**: GUI for building configurations
2. **Plugin Marketplace**: Repository of community plugins
3. **AI-Generated Configurations**: AI assistance for configuration creation
4. **Performance Analytics**: Built-in performance monitoring
5. **Configuration Sharing**: Import/export configurations between projects
