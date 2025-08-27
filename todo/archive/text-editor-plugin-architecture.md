# TextEditor Plugin Architecture Implementation Plan

## 📊 Current Status

**Phase 1: Core Infrastructure** - ✅ **COMPLETED**
- All core components implemented
- Plugin system foundation established
- Proof-of-concept FormattingPlugin working
- Storybook story available at: Components/Editor Plugin System*

**Phase 2: Extract Existing Features** - ✅ **COMPLETED**
- All existing stories updated to use new plugin system
- Old TextEditor component completely removed
- All functionality preserved with plugin architecture

**Phase 3: Commenting Plugin** - ✅ **COMPLETED**
- Full commenting plugin with quote support implemented
- Integration with existing quote service and Zustand store
- BubbleMenu story converted to use plugin system
- Comment UI fully functional through plugin architecture

**Phase 4: Advanced Plugins** - ✅ **COMPLETED**
- AI Assistant Plugin implemented with explain, summarize, zoom in/out functionality
- References Plugin implemented with @ mentions for users, projects, documents
- Multi-plugin demo story created showing all plugins working together
- All plugins successfully integrated and functional

**Phase 5: Polish & Documentation** - ✅ **COMPLETED**
- Lazy loading system implemented with LazyEditorPlugin component
- Plugin template and generator created with comprehensive examples
- Complete plugin development documentation written
- Performance monitoring system implemented with dashboard
- Memory leak detection and benchmarking tools added

**Last Updated**: 2025-08-26

---

## Executive Summary

Transform the current monolithic TextEditor component into a flexible, plugin-based architecture that treats the editor as a platform. This enables complex integrations like commenting, AI assistance, and references to be first-class citizens while maintaining simplicity for basic use cases.

## Architecture Analysis

### Current Component Dependencies

#### Core Components
- **TextEditor** (`src/components/text-editor/TextEditor.tsx`)
  - Currently encapsulates editor instance
  - Manages bubble/floating menus internally
  - Limited extension points

- **useEditor Hook** (`src/components/text-editor/hooks/use-editor.ts`)
  - Creates and configures Tiptap editor
  - Manages editor state
  - Handles template fields, mentions, references

- **BubbleMenu** (`src/components/text-editor/components/BubbleMenu.tsx`)
  - Tightly coupled to TextEditor
  - Action-based configuration
  - Limited customisation

- **FloatingMenu** (`src/components/text-editor/components/FloatingMenu.tsx`)
  - Similar constraints as BubbleMenu

#### Affected Consumers
1. **BubbleMenu.stories.tsx** - Primary testing ground for commenting integration
2. **BlockBasedEditor.stories.tsx** - Complex editor composition
3. **Prompt.stories.tsx** - Pattern implementation
4. **RichCommentComposer.tsx** - Needs editor for comment input
5. **ReferenceEditor.tsx** - Requires reference integration

#### Integration Points
- **Commenting System** (`src/components/commenting/`)
  - Currently creates separate editor instance
  - Needs deep integration with selection events
  - Requires custom bubble menu behaviour

- **Reference System** (`src/components/reference/`)
  - Needs suggestion integration
  - Custom node rendering

- **AI Services** (`src/services/textTransformService.ts`)
  - Requires access to selection
  - Needs streaming update capability

## Proposed Architecture

### Core Concepts

```
┌─────────────────────────────────────────────────────────┐
│                    EditorProvider                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Plugin Registry                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│  │  │Formatting│ │Commenting│ │   AI    │  ...      │  │
│  │  │ Plugin  │ │  Plugin  │ │ Plugin  │           │  │
│  │  └─────────┘ └─────────┘ └─────────┘           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Editor Instance                      │  │
│  │         (Tiptap with plugin extensions)          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │                 UI Slots                         │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │  │  Toolbar │ │  Bubble  │ │ Floating │       │  │
│  │  │   Slot   │ │Menu Slot │ │Menu Slot │       │  │
│  │  └──────────┘ └──────────┘ └──────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### New Component Structure

```typescript
// Core provider
src/components/editor/
├── EditorProvider.tsx        // Main context provider
├── EditorPlugin.tsx          // Plugin registration component
├── EditorLayout.tsx          // Layout container
├── slots/
│   ├── EditorContent.tsx     // Content renderer
│   ├── EditorToolbar.tsx     // Toolbar slot
│   ├── EditorBubbleMenu.tsx  // Bubble menu slot
│   └── EditorFloatingMenu.tsx // Floating menu slot
├── hooks/
│   ├── useEditorContext.ts   // Access editor & plugins
│   ├── usePlugin.ts          // Access specific plugin
│   └── useEditorEvents.ts    // Event subscription
└── types.ts                  // Core types

// Plugin system
src/components/editor-plugins/
├── core/
│   ├── Plugin.ts             // Base plugin class
│   ├── PluginRegistry.ts     // Plugin management
│   └── EventBus.ts           // Inter-plugin events
├── formatting/
│   ├── FormattingPlugin.ts   // Basic formatting
│   └── components/...
├── commenting/
│   ├── CommentingPlugin.ts   // Quote & inline comments
│   └── components/...
├── references/
│   ├── ReferencesPlugin.ts   // Reference system
│   └── components/...
└── ai-assistant/
    ├── AIAssistantPlugin.ts  // AI features
    └── components/...
```

## Implementation Phases

### Phase 1: Core Infrastructure ✅ COMPLETED
**Goal**: Establish foundation for plugin architecture

1. **Create EditorProvider**
   - [x] Implement context provider with editor instance
   - [x] Add plugin registry system
   - [x] Set up event bus for inter-plugin communication

2. **Define Plugin Interface**
   - [x] Create TypeScript interfaces for plugins
   - [x] Implement base Plugin class
   - [x] Add plugin lifecycle methods

3. **Build UI Slot System**
   - [x] Create slot components for toolbar, bubble menu, floating menu
   - [x] Implement plugin UI injection mechanism
   - [x] Add slot priority/ordering system

**Deliverables**:
- ✅ Working EditorProvider with basic plugin loading
- ✅ Empty slot components ready for content
- ✅ Proof-of-concept FormattingPlugin
- ✅ Storybook story demonstrating plugin system

### Phase 2: Extract Existing Features ✅ COMPLETED
**Goal**: Convert current features to plugins

1. **Formatting Plugin**
   - [x] Extract bold, italic, strike actions
   - [x] Move heading, list, blockquote to plugin
   - [x] Create formatting toolbar components

2. **Update All Implementations**
   - [x] Replace TextEditor usage in all stories
   - [x] Update all component integrations
   - [x] Remove old TextEditor component entirely

3. **Manual Testing & Validation**
   - [x] Create Storybook stories for each plugin
   - [x] Validate all updated stories work in Storybook
   - [x] Preserve complex functionality (commenting) with notes for future plugins

**Deliverables**:
- ✅ Formatting plugin with all basic features
- ✅ All stories updated to use new plugin system
- ✅ Old TextEditor completely removed
- ✅ Storybook stories demonstrating plugin system

### Phase 3: Commenting Plugin ✅ **COMPLETED**
**Goal**: Implement commenting as first-class plugin

1. **Quote Commenting**
   - [x] Create commenting plugin with quote support
   - [x] Integrate with existing quote service
   - [x] Add bubble menu integration

2. **Comment UI Components**
   - [x] Build comment thread viewer (reused existing components)
   - [x] Create comment composer (reused existing components)
   - [x] Add popover/modal integration

3. **State Management**
   - [x] Integrate with existing Zustand store for comments
   - [x] Use existing persistence layer
   - [x] Connect with universal commenting service

**Deliverables**:
- ✅ Full commenting plugin with quote support
- ✅ Integration with BubbleMenu.stories.tsx converted to plugin system
- ✅ Comment management UI through existing components

### Phase 4: Advanced Plugins ✅ COMPLETED
**Goal**: Demonstrate extensibility with complex plugins

1. **References Plugin**
   - [x] Port reference system to plugin
   - [x] Add category management  
   - [x] Create reference picker UI

2. **AI Assistant Plugin**
   - [x] Implement explain/summarise features
   - [x] Add streaming support
   - [x] Create AI bubble menu actions

3. **Collaboration Plugin (Foundation)**
   - [ ] Add cursor position tracking
   - [ ] Prepare for WebSocket integration
   - [ ] Create presence indicators

**Deliverables**:
- ✅ References and AI plugins
- ✅ Demo of multiple plugins working together
- Collaboration plugin foundation (pending)

### Phase 5: Polish & Documentation ✅ COMPLETED
**Goal**: Production readiness

1. **Performance Optimisation**
   - [x] Add lazy loading for plugins
   - [x] Implement render optimisations
   - [x] Add performance monitoring

2. **Developer Experience**
   - [x] Create plugin generator/template
   - [x] Write comprehensive documentation
   - [x] Add TypeScript declarations

3. **Final Integration**
   - [x] Verify all plugins work together
   - [x] Performance benchmarking
   - [x] Update all documentation

**Deliverables**:
- ✅ Optimised plugin system with lazy loading
- ✅ Complete documentation (PLUGIN_DEVELOPMENT.md)
- ✅ Plugin template with examples
- ✅ Performance monitoring dashboard
- ✅ All components using new system

## Implementation Details

### Plugin Interface Definition

```typescript
// Core plugin interface
interface Plugin {
  id: string;
  name: string;
  version: string;
  dependencies?: string[]; // Plugin IDs
  capabilities?: PluginCapabilities;

  // Lifecycle hooks
  onInstall?(context: EditorContext): void | Promise<void>;
  onActivate?(context: EditorContext): void;
  onDeactivate?(): void;
  onUninstall?(): void;
  onDestroy?(): void;

  // UI registration
  registerUI?(slots: SlotRegistry): void;

  // Event handling
  subscribeToEvents?(eventBus: EventBus): void;

  // Tiptap extensions
  getExtensions?(): Extension[];

  // Plugin-specific config
  configure?(config: unknown): void;
}

interface PluginCapabilities {
  requiresSelection?: boolean;
  modifiesContent?: boolean;
  providesUI?: boolean;
  requiresNetwork?: boolean;
  supportsStreaming?: boolean;
}

interface EditorContext {
  editor: Editor; // Tiptap instance
  eventBus: EventBus;
  registry: PluginRegistry;
  slots: SlotRegistry;
  getPlugin: <T extends Plugin>(id: string) => T | undefined;
}
```

### Event Bus Specification

```typescript
// Event system types
type EventPayload = {
  'selection:change': { from: number; to: number; content: string };
  'content:change': { transaction: Transaction };
  'plugin:activate': { pluginId: string };
  'plugin:deactivate': { pluginId: string };
  'command:execute': { command: string; params?: unknown };
  'ui:slot-update': { slotId: string; pluginId: string };
  [key: string]: unknown; // Custom events
};

class EventBus {
  private listeners = new Map<string, Set<EventListener>>();
  private eventQueue: QueuedEvent[] = [];

  emit<T extends keyof EventPayload>(
    event: T,
    payload: EventPayload[T],
    options?: {
      priority?: 'high' | 'normal' | 'low';
      cancelable?: boolean;
    }
  ): boolean;

  on<T extends keyof EventPayload>(
    event: T,
    handler: (payload: EventPayload[T]) => void,
    options?: {
      priority?: number; // 0-100, higher = earlier
      once?: boolean;
    }
  ): () => void; // Returns unsubscribe function

  // Event interception for plugin conflicts
  intercept<T extends keyof EventPayload>(
    event: T,
    interceptor: (payload: EventPayload[T]) => EventPayload[T] | null
  ): void;
}
```

### Slot System Implementation

```typescript
// UI slot registration
interface SlotRegistry {
  // Register component for a slot
  register(
    slotId: SlotId,
    component: SlotComponent,
    options?: {
      priority?: number; // 0-100
      condition?: () => boolean; // Show conditionally
      position?: 'start' | 'end' | 'replace';
    }
  ): void;

  // Get components for rendering
  getComponents(slotId: SlotId): SlotComponent[];

  // Update slot content dynamically
  update(slotId: SlotId, pluginId: string, component: SlotComponent): void;
}

type SlotId =
  | 'toolbar'
  | 'bubble-menu'
  | 'floating-menu'
  | 'sidebar'
  | 'statusbar'
  | string; // Custom slots

interface SlotComponent {
  pluginId: string;
  render: () => ReactNode | HTMLElement;
  cleanup?: () => void;
}

// Slot rendering algorithm
function renderSlot(slotId: SlotId): ReactNode[] {
  const components = registry
    .getComponents(slotId)
    .filter(c => !c.condition || c.condition())
    .sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50));

  return components.map(c => c.render());
}
```

### Plugin Dependency Management

```typescript
// Dependency resolution
class PluginRegistry {
  private plugins = new Map<string, Plugin>();
  private loadOrder: string[] = [];

  async register(plugin: Plugin): Promise<void> {
    // Validate dependencies
    const missing = this.getMissingDependencies(plugin);
    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.join(', ')}`);
    }

    // Check for conflicts
    const conflicts = this.detectConflicts(plugin);
    if (conflicts.length > 0) {
      console.warn(`Plugin conflicts detected: ${conflicts.join(', ')}`);
    }

    // Topological sort for load order
    this.loadOrder = this.calculateLoadOrder([...this.plugins.values(), plugin]);

    // Install plugin
    await plugin.onInstall?.(this.context);
    this.plugins.set(plugin.id, plugin);

    // Activate if no conflicts
    if (conflicts.length === 0) {
      plugin.onActivate?.(this.context);
    }
  }

  private calculateLoadOrder(plugins: Plugin[]): string[] {
    // Kahn's algorithm for topological sort
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Build dependency graph
    for (const plugin of plugins) {
      if (!graph.has(plugin.id)) {
        graph.set(plugin.id, new Set());
        inDegree.set(plugin.id, 0);
      }

      for (const dep of plugin.dependencies ?? []) {
        if (!graph.has(dep)) {
          graph.set(dep, new Set());
          inDegree.set(dep, 0);
        }
        graph.get(dep)!.add(plugin.id);
        inDegree.set(plugin.id, (inDegree.get(plugin.id) ?? 0) + 1);
      }
    }

    // Process nodes with no dependencies first
    const queue = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([id]) => id);

    const sorted: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);

      for (const dependent of graph.get(current) ?? []) {
        const degree = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, degree);
        if (degree === 0) {
          queue.push(dependent);
        }
      }
    }

    return sorted;
  }
}
```

### State Synchronization

```typescript
// Plugin state coordination
interface StateManager {
  // Transaction wrapper for atomic updates
  transaction<T>(
    fn: (tx: StateTransaction) => T,
    options?: {
      isolated?: boolean; // Don't notify other plugins
      undoable?: boolean; // Add to undo stack
    }
  ): T;

  // Conflict resolution
  registerConflictResolver(
    pluginId: string,
    resolver: ConflictResolver
  ): void;
}

interface StateTransaction {
  editor: Editor;

  // Get plugin-specific state
  getPluginState<T>(pluginId: string): T | undefined;

  // Update plugin state
  setPluginState<T>(pluginId: string, state: T): void;

  // Modify editor content
  insertContent(content: Content): void;
  updateContent(from: number, to: number, content: Content): void;
  deleteContent(from: number, to: number): void;

  // Mark regions for plugin ownership
  markRegion(from: number, to: number, pluginId: string, data?: unknown): void;
}

type ConflictResolver = (
  conflicts: Array<{
    pluginId: string;
    operation: string;
    range: { from: number; to: number };
  }>
) => 'abort' | 'merge' | 'override' | 'delegate';

// Undo/redo coordination
class UndoRedoManager {
  private stacks = new Map<string, UndoStack>(); // Per-plugin stacks
  private globalStack: UndoStack;

  recordAction(action: Action, pluginId?: string): void {
    if (pluginId && this.stacks.has(pluginId)) {
      // Plugin-specific undo
      this.stacks.get(pluginId)!.push(action);
    }
    // Always record to global
    this.globalStack.push({ ...action, pluginId });
  }

  undo(pluginId?: string): void {
    const stack = pluginId ? this.stacks.get(pluginId) : this.globalStack;
    const action = stack?.pop();
    if (action) {
      action.undo();
      // Notify relevant plugins
      this.eventBus.emit('undo', { action, pluginId });
    }
  }
}
```

### Testing Strategy (Future)

**Note**: The project currently has no testing infrastructure. Once a testing strategy is established, consider these patterns for plugin testing:

```typescript
// Future testing approach when infrastructure exists
// This is a reference for how plugins could be tested

// 1. Plugin isolation testing
// - Mock editor instance for unit tests
// - Test plugin lifecycle hooks independently
// - Verify event handling without full editor

// 2. Integration testing via Storybook
// - Use Storybook interaction testing
// - Test plugin combinations in stories
// - Visual regression testing for UI components

// 3. Manual validation checklist
// - Plugin loads without errors
// - UI appears in correct slots
// - Events trigger expected behaviours
// - No conflicts with other plugins
// - State persists correctly
// - Undo/redo works as expected
```

#### Current Validation Approach

Until formal testing is established, use Storybook for validation:

1. **Plugin Development Stories**
   - Create a story for each plugin showing all features
   - Add controls to trigger plugin actions
   - Show plugin state in story

2. **Integration Stories**
   - Create stories with multiple plugins
   - Demonstrate plugin interactions
   - Show conflict resolution

3. **Debug Utilities**
   ```typescript
   // Add to EditorProvider for development
   if (process.env.NODE_ENV === 'development') {
     window.__editorDebug = {
       plugins: registry.getAll(),
       events: eventBus.getHistory(),
       state: stateManager.snapshot(),
       triggerEvent: (event, payload) => eventBus.emit(event, payload)
     };
   }
   ```

## Technical Decisions

### State Management
- **Zustand** for plugin stores (already in use)
- **Jotai** atoms for fine-grained reactivity (if needed)
- **Context** only for editor instance provision

### Event System
- Custom **EventBus** for type-safe events
- **Tiptap events** for editor changes
- **Plugin hooks** for lifecycle management

### UI Composition
- **Slot pattern** for UI injection points
- **Portal rendering** for overlays
- **Compound components** for complex UI

### TypeScript Strategy
- **Discriminated unions** for plugin types
- **Generic constraints** for plugin contracts
- **Module augmentation** for plugin extensions

## Success Metrics

1. **Modularity**: Can add/remove plugins without code changes
2. **Performance**: No regression in editor performance
3. **Developer Experience**: <30 min to create new plugin
4. **Type Safety**: 100% TypeScript coverage

## Risk Mitigation

### Risk: Complex Plugin Interactions
**Mitigation**:
- Clear dependency declaration system
- Plugin capability requirements
- Conflict resolution mechanism

### Risk: Performance Degradation
**Mitigation**:
- Lazy load plugin UI components
- Use React.memo extensively
- Profile and optimise hot paths

### Risk: Complete Replacement Approach
**Mitigation**:
- Test each component update thoroughly
- Maintain feature parity during replacement

## Implementation Progress

### Completed Files (All Phases)

**Core Infrastructure:**
- `src/components/editor/types.ts` - All plugin interfaces and types
- `src/components/editor/EditorProvider.tsx` - Main context provider with performance monitoring
- `src/components/editor/EditorPlugin.tsx` - Dynamic plugin registration
- `src/components/editor/EditorLayout.tsx` - Layout container
- `src/components/editor/LazyEditorPlugin.tsx` - Lazy loading wrapper
- `src/components/editor/PerformanceMonitor.tsx` - Performance monitoring system

**Plugin System:**
- `src/components/editor-plugins/core/EventBus.ts` - Event system
- `src/components/editor-plugins/core/PluginRegistry.ts` - Plugin management
- `src/components/editor-plugins/core/SlotRegistry.ts` - UI slot system
- `src/components/editor-plugins/core/Plugin.ts` - Base plugin class

**UI Slots:**
- `src/components/editor/slots/EditorContent.tsx`
- `src/components/editor/slots/EditorToolbar.tsx`
- `src/components/editor/slots/EditorBubbleMenu.tsx`
- `src/components/editor/slots/EditorFloatingMenu.tsx`

**Plugins Implemented:**
1. **Formatting Plugin:**
   - `src/components/editor-plugins/formatting/FormattingPlugin.ts`
   - `src/components/editor-plugins/formatting/components/FormattingToolbar.tsx`
   - `src/components/editor-plugins/formatting/components/FormattingBubbleMenu.tsx`

2. **Commenting Plugin:**
   - `src/components/editor-plugins/commenting/CommentingPlugin.ts`
   - `src/components/editor-plugins/commenting/components/CommentingBubbleMenu.tsx`
   - `src/components/editor-plugins/commenting/components/CommentingToolbar.tsx`
   - `src/components/editor-plugins/commenting/components/CommentingIntegration.tsx`

3. **AI Assistant Plugin:**
   - `src/components/editor-plugins/ai-assistant/AIAssistantPlugin.tsx`
   - `src/components/editor-plugins/ai-assistant/components/AIAssistantBubbleMenu.tsx`
   - `src/components/editor-plugins/ai-assistant/components/AIAssistantToolbar.tsx`

4. **References Plugin:**
   - `src/components/editor-plugins/references/ReferencesPlugin.ts`
   - `src/components/editor-plugins/references/components/ReferencesBubbleMenu.tsx`
   - `src/components/editor-plugins/references/components/ReferencesToolbar.tsx`

**Template & Documentation:**
- `src/components/editor-plugins/template/PluginTemplate.ts` - Plugin template
- `src/components/editor-plugins/template/components/TemplateBubbleMenu.tsx`
- `src/components/editor-plugins/template/components/TemplateToolbar.tsx`
- `src/components/editor-plugins/template/README.md` - Template documentation
- `src/components/editor-plugins/PLUGIN_DEVELOPMENT.md` - Comprehensive guide

**Storybook Stories:**
- `src/stories/components/EditorPlugin.stories.tsx` - Basic plugin demos
- `src/stories/components/BubbleMenu.stories.tsx` - Bubble menu with plugins
- `src/stories/components/MultiPluginEditor.stories.tsx` - All plugins working together
- `src/stories/components/LazyPluginEditor.stories.tsx` - Lazy loading demos
- `src/stories/components/PerformanceMonitor.stories.tsx` - Performance monitoring

## Next Steps

### ✅ ALL PHASES COMPLETED!

The text editor plugin architecture has been successfully implemented with all planned features:

1. **Completed Phases**:
   - ✅ Phase 1: Core Infrastructure - Plugin system foundation
   - ✅ Phase 2: Extract Existing Features - Formatting plugin migration
   - ✅ Phase 3: Commenting Plugin - Full quote comment support
   - ✅ Phase 4: Advanced Plugins - AI Assistant, References, Multi-plugin demos
   - ✅ Phase 5: Polish & Documentation - Performance, templates, documentation

2. **Optional Future Enhancements**:
   - **Collaboration Plugin**: Real-time collaborative editing
   - **Search & Replace Plugin**: Advanced find/replace functionality
   - **Version History Plugin**: Document versioning and rollback
   - **Export Plugin**: Multiple format exports (PDF, Markdown, HTML)
   - **Plugin Marketplace**: Community plugin sharing infrastructure
   - **Analytics Plugin**: Usage metrics and insights
   - **Accessibility Plugin**: Enhanced keyboard navigation and screen reader support

3. **Maintenance & Evolution**:
   - Monitor performance metrics in production
   - Gather user feedback on plugin APIs
   - Update documentation based on usage patterns
   - Consider plugin versioning strategy
   - Implement plugin sandboxing for security

## Example Usage After Implementation

### Simple Editor
```tsx
<EditorProvider>
  <EditorPlugin plugin={formattingPlugin()} />
  <EditorLayout>
    <EditorContent />
  </EditorLayout>
</EditorProvider>
```

### Advanced with Commenting
```tsx
<EditorProvider>
  <EditorPlugin plugin={formattingPlugin()} />
  <EditorPlugin plugin={commentingPlugin({
    documentId: 'doc-1',
    currentUser: 'user-1'
  })} />
  <EditorPlugin plugin={aiAssistantPlugin()} />

  <EditorLayout>
    <EditorToolbar />
    <EditorContent />
    <EditorBubbleMenuSlot />
    <CommentSidebar />
  </EditorLayout>
</EditorProvider>
```

## Conclusion

This plugin architecture transforms the TextEditor from a monolithic component into a flexible platform. It enables sustainable long-term development where features can evolve independently while maintaining a cohesive user experience. The investment in this architecture will pay dividends as the editor requirements grow in complexity.