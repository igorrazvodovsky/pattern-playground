# Editor Plugin Development Guide

## Overview

The editor plugin system provides a flexible, extensible architecture for adding functionality to the text editor. Plugins are self-contained modules that can modify content, provide UI components, handle events, and communicate with other plugins.

## Table of Contents

1. [Architecture](#architecture)
2. [Creating a Plugin](#creating-a-plugin)
3. [Plugin Lifecycle](#plugin-lifecycle)
4. [UI Integration](#ui-integration)
5. [Event System](#event-system)
6. [Tiptap Extensions](#tiptap-extensions)
7. [Performance](#performance)
8. [Best Practices](#best-practices)
9. [API Reference](#api-reference)

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                    EditorProvider                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Plugin Registry                      │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐           │  │
│  │  │Plugin A │ │Plugin B │ │Plugin C │  ...      │  │
│  │  └─────────┘ └─────────┘ └─────────┘           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Event Bus                           │  │
│  │  Facilitates inter-plugin communication          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              UI Slot System                      │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐       │  │
│  │  │ Toolbar  │ │  Bubble  │ │ Floating │       │  │
│  │  │   Slot   │ │Menu Slot │ │Menu Slot │       │  │
│  │  └──────────┘ └──────────┘ └──────────┘       │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Plugin Structure

```typescript
interface Plugin {
  id: string;                    // Unique identifier
  name: string;                  // Human-readable name
  version: string;              // Semantic version
  dependencies?: string[];       // Other plugin IDs
  capabilities?: PluginCapabilities;
  
  // Lifecycle hooks
  onInstall?(context: EditorContext): void | Promise<void>;
  onActivate?(context: EditorContext): void;
  onDeactivate?(): void;
  onDestroy?(): void;
  
  // UI & Events
  registerUI?(slots: SlotRegistry): void;
  subscribeToEvents?(eventBus: EventBus): void;
  
  // Tiptap extensions
  getExtensions?(): Extension[];
}
```

## Creating a Plugin

### Step 1: Define Your Plugin Class

```typescript
import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities } from '../../editor/types';

export class MyPlugin extends BasePlugin {
  public readonly id = 'my-plugin';
  public readonly name = 'My Plugin';
  public readonly version = '1.0.0';
  
  public readonly capabilities: PluginCapabilities = {
    requiresSelection: false,
    modifiesContent: true,
    providesUI: true,
    requiresNetwork: false,
    supportsStreaming: false,
  };

  constructor(private options: MyPluginOptions) {
    super();
  }
}
```

### Step 2: Implement Lifecycle Hooks

```typescript
onInstall(context: EditorContext): void {
  super.onInstall(context);
  // One-time setup
  this.setupResources();
}

onActivate(context: EditorContext): void {
  super.onActivate(context);
  // Activate features
  this.startListening();
  this.registerUI(context.slots);
}

onDeactivate(): void {
  super.onDeactivate();
  // Clean up active features
  this.stopListening();
}

onDestroy(): void {
  super.onDestroy();
  // Final cleanup
  this.releaseResources();
}
```

### Step 3: Create Factory Function

```typescript
export function myPlugin(options?: MyPluginOptions): MyPlugin {
  return new MyPlugin(options || {});
}
```

### Step 4: Use in Editor

```tsx
<EditorProvider>
  <EditorPlugin plugin={myPlugin({ 
    // options
  })} />
  <EditorLayout>
    <EditorContent />
  </EditorLayout>
</EditorProvider>
```

## Plugin Lifecycle

### Installation Flow

```
User adds plugin → onInstall() → Plugin registered → onActivate() → Plugin active
```

### Deactivation Flow

```
Plugin deactivated → onDeactivate() → Plugin inactive → onDestroy() → Plugin removed
```

### State Transitions

- **Installed**: Plugin is registered but not active
- **Active**: Plugin is running and features are available
- **Inactive**: Plugin is installed but temporarily disabled
- **Destroyed**: Plugin is removed and resources released

## UI Integration

### Available Slots

1. **Toolbar** - Main editor toolbar
2. **Bubble Menu** - Appears on text selection
3. **Floating Menu** - Appears on empty lines
4. **Sidebar** - Side panel (if implemented)
5. **Statusbar** - Bottom status bar (if implemented)

### Registering UI Components

```typescript
registerUI(slots: SlotRegistry): void {
  // Bubble menu with condition
  slots.register('bubble-menu', {
    pluginId: this.id,
    render: () => <MyBubbleMenu />,
    priority: 50, // Lower = higher priority
    condition: () => this.hasValidSelection(),
  });

  // Toolbar button
  slots.register('toolbar', {
    pluginId: this.id,
    render: () => <MyToolbarButton />,
    priority: 50,
  });
}
```

### UI Component Example

```tsx
const MyBubbleMenu: React.FC = () => {
  const { editor } = useEditorContext();
  
  const handleAction = () => {
    editor.commands.myCustomCommand();
  };

  return (
    <button onClick={handleAction}>
      My Action
    </button>
  );
};
```

## Event System

### Subscribing to Events

```typescript
subscribeToEvents(eventBus: EventBus): void {
  // Listen to selection changes
  eventBus.on('selection:change', ({ from, to, content }) => {
    this.handleSelectionChange(from, to, content);
  });

  // Listen to content changes
  eventBus.on('content:change', ({ transaction }) => {
    this.handleContentChange(transaction);
  });
}
```

### Emitting Events

```typescript
// Emit custom events for other plugins
this.emit('my-plugin:data-ready', { 
  data: processedData 
});

// Emit command execution
this.emit('command:execute', {
  command: 'myCommand',
  params: { /* ... */ }
});
```

### Standard Events

- `selection:change` - Text selection changed
- `content:change` - Document content changed  
- `plugin:activate` - Plugin activated
- `plugin:deactivate` - Plugin deactivated
- `command:execute` - Editor command executed
- `ui:slot-update` - UI slot content updated

## Tiptap Extensions

### Adding Custom Extensions

```typescript
import { Node, Mark, Extension } from '@tiptap/core';

getExtensions(): Extension[] {
  const CustomNode = Node.create({
    name: 'customNode',
    group: 'block',
    content: 'inline*',
    
    addAttributes() {
      return {
        id: { default: null },
      };
    },
    
    parseHTML() {
      return [{ tag: 'div[data-custom]' }];
    },
    
    renderHTML({ HTMLAttributes }) {
      return ['div', { 'data-custom': '', ...HTMLAttributes }, 0];
    },
  });

  return [CustomNode];
}
```

### Adding Commands

```typescript
const CustomExtension = Extension.create({
  name: 'customExtension',
  
  addCommands() {
    return {
      myCommand: (params) => ({ commands }) => {
        // Command implementation
        return commands.insertContent('Hello');
      },
    };
  },
});
```

## Performance

### Lazy Loading

Use the `LazyEditorPlugin` component for on-demand loading:

```tsx
import { LazyEditorPlugin, createPluginLoader } from '../editor/LazyEditorPlugin';

<LazyEditorPlugin
  loader={createPluginLoader(() => 
    import('./my-plugin').then(m => ({
      myPlugin: m.myPlugin
    }))
  )}
  fallback={<div>Loading...</div>}
/>
```

### Performance Tips

1. **Defer Heavy Operations**
   ```typescript
   requestIdleCallback(() => {
     this.performHeavyOperation();
   });
   ```

2. **Use Memoization**
   ```typescript
   private memoizedResult = new Map();
   
   getResult(input: string) {
     if (!this.memoizedResult.has(input)) {
       this.memoizedResult.set(input, this.calculate(input));
     }
     return this.memoizedResult.get(input);
   }
   ```

3. **Debounce Event Handlers**
   ```typescript
   private handleChange = debounce((content) => {
     this.processContent(content);
   }, 300);
   ```

## Best Practices

### 1. Single Responsibility

Each plugin should focus on one specific feature:

```typescript
// Good: Focused plugin
class SpellCheckPlugin { /* spell checking only */ }

// Bad: Kitchen sink plugin  
class SuperPlugin { /* spell check + formatting + AI + ... */ }
```

### 2. Error Handling

Always handle errors gracefully:

```typescript
async performAction() {
  try {
    await this.riskyOperation();
  } catch (error) {
    console.error(`${this.name} error:`, error);
    this.emit('plugin:error', { 
      plugin: this.id, 
      error 
    });
    // Graceful fallback
    this.useDefaultBehavior();
  }
}
```

### 3. Resource Cleanup

Clean up resources to prevent memory leaks:

```typescript
private cleanup: (() => void)[] = [];

onActivate() {
  const interval = setInterval(() => {
    this.poll();
  }, 1000);
  
  this.cleanup.push(() => clearInterval(interval));
}

onDeactivate() {
  this.cleanup.forEach(fn => fn());
  this.cleanup = [];
}
```

### 4. Type Safety

Use TypeScript generics and type guards:

```typescript
// Type-safe event emitter
emit<T extends keyof PluginEvents>(
  event: T, 
  payload: PluginEvents[T]
): void {
  this.eventBus.emit(event, payload);
}

// Type guard
function isValidConfig(config: unknown): config is MyConfig {
  return typeof config === 'object' && 
         config !== null &&
         'apiKey' in config;
}
```

### 5. Documentation

Document your plugin thoroughly:

```typescript
/**
 * Spell check plugin for the editor.
 * 
 * @example
 * ```tsx
 * <EditorPlugin plugin={spellCheckPlugin({
 *   language: 'en-US',
 *   customDictionary: ['typescript', 'tiptap']
 * })} />
 * ```
 * 
 * @emits spell-check:error When spell check fails
 * @emits spell-check:suggestion When suggestions are available
 */
export class SpellCheckPlugin extends BasePlugin {
  // ...
}
```

## API Reference

### EditorContext

```typescript
interface EditorContext {
  editor: Editor;           // Tiptap editor instance
  eventBus: EventBus;      // Event system
  registry: PluginRegistry; // Plugin registry
  slots: SlotRegistry;     // UI slots
  getPlugin: <T extends Plugin>(id: string) => T | undefined;
}
```

### PluginCapabilities

```typescript
interface PluginCapabilities {
  requiresSelection?: boolean;  // Needs text selection
  modifiesContent?: boolean;    // Changes content
  providesUI?: boolean;         // Has UI components
  requiresNetwork?: boolean;    // Makes network requests
  supportsStreaming?: boolean;  // Supports streaming
}
```

### EventBus

```typescript
class EventBus {
  emit<T>(event: string, payload: T): boolean;
  on<T>(event: string, handler: (payload: T) => void): () => void;
  once<T>(event: string, handler: (payload: T) => void): () => void;
  off(event: string, handler?: Function): void;
}
```

### SlotRegistry

```typescript
interface SlotRegistry {
  register(
    slotId: string,
    component: SlotComponent,
    options?: SlotOptions
  ): void;
  
  unregister(slotId: string, pluginId: string): void;
  getComponents(slotId: string): SlotComponent[];
}

interface SlotOptions {
  priority?: number;
  condition?: () => boolean;
  position?: 'start' | 'end' | 'replace';
}
```

## Examples

### Complete Plugin Example

See the [template plugin](./template/) for a complete example with:
- Full plugin implementation
- UI components
- Event handling
- Documentation

### Existing Plugins

Study these production plugins for reference:
- [Formatting Plugin](./formatting/) - Basic text formatting
- [AI Assistant Plugin](./ai-assistant/) - AI-powered text transformation
- [Commenting Plugin](./commenting/) - Quote commenting system
- [References Plugin](./references/) - @ mentions and references

## Troubleshooting

### Common Issues

1. **Plugin not loading**
   - Check console for errors
   - Verify plugin is registered
   - Ensure dependencies are met

2. **UI not appearing**
   - Check slot registration
   - Verify condition returns true
   - Check priority conflicts

3. **Events not firing**
   - Verify event names
   - Check subscription timing
   - Ensure eventBus is available

4. **Memory leaks**
   - Check cleanup in lifecycle hooks
   - Remove event listeners
   - Clear timers and intervals

## Support

For help with plugin development:
1. Check the [template plugin](./template/)
2. Review existing plugins for patterns
3. Consult the TypeScript definitions
4. Create an issue for bugs or questions