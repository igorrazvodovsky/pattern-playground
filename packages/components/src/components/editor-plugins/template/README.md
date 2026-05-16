# Editor Plugin Template

This template provides a starting point for creating custom editor plugins. Follow this guide to create your own plugin quickly and efficiently.

## Quick Start

### 1. Copy the Template

```bash
# Copy the template directory
cp -r src/components/editor-plugins/template src/components/editor-plugins/your-plugin-name

# Rename files
cd src/components/editor-plugins/your-plugin-name
mv PluginTemplate.ts YourPluginName.ts
mv components/TemplateBubbleMenu.tsx components/YourBubbleMenu.tsx
mv components/TemplateToolbar.tsx components/YourToolbar.tsx
```

### 2. Update the Plugin Code

Replace all instances of "template" with your plugin name:
- Class names: `TemplatePlugin` → `YourPlugin`
- IDs: `template-plugin` → `your-plugin`
- Interfaces: `TemplatePluginOptions` → `YourPluginOptions`

### 3. Define Your Configuration

```typescript
export interface YourPluginOptions {
  // Your configuration options
  apiKey?: string;
  enabled?: boolean;
  theme?: 'light' | 'dark';
  maxItems?: number;
}
```

### 4. Implement Core Functionality

Update the plugin methods to implement your functionality:

```typescript
export class YourPlugin extends BasePlugin {
  // Your implementation
  
  private async performAction(data: any): Promise<void> {
    // Your plugin logic here
  }
}
```

## Plugin Architecture

### Lifecycle Methods

- **`onInstall()`**: Called once when plugin is first registered
- **`onActivate()`**: Called when plugin becomes active
- **`onDeactivate()`**: Called when plugin becomes inactive
- **`onDestroy()`**: Called when plugin is removed

### UI Registration

Plugins can register UI components in various slots:

```typescript
registerUI(slots: SlotRegistry): void {
  // Bubble menu (appears on text selection)
  slots.register('bubble-menu', {
    pluginId: this.id,
    render: () => <YourBubbleMenu />,
    priority: 50,
    condition: () => this.hasSelection(),
  });

  // Toolbar (always visible)
  slots.register('toolbar', {
    pluginId: this.id,
    render: () => <YourToolbar />,
    priority: 50,
  });
}
```

### Event System

Subscribe to editor events:

```typescript
subscribeToEvents(eventBus: EventBus): void {
  // Listen to events
  eventBus.on('selection:change', ({ from, to, content }) => {
    // React to selection changes
  });

  // Emit custom events
  eventBus.emit('your-plugin:event', { data });
}
```

## Common Plugin Patterns

### 1. Text Transformation Plugin

```typescript
export class TextTransformPlugin extends BasePlugin {
  capabilities = {
    requiresSelection: true,
    modifiesContent: true,
    providesUI: true,
  };

  transformText(text: string): string {
    // Transform logic
    return text.toUpperCase();
  }

  applyTransformation(): void {
    const { from, to } = this.context.editor.state.selection;
    const text = this.context.editor.state.doc.textBetween(from, to);
    const transformed = this.transformText(text);
    
    this.context.editor.commands.insertContentAt(
      { from, to },
      transformed
    );
  }
}
```

### 2. API Integration Plugin

```typescript
export class APIPlugin extends BasePlugin {
  capabilities = {
    requiresNetwork: true,
    supportsStreaming: true,
  };

  private async fetchData(): Promise<void> {
    try {
      const response = await fetch(this.options.apiEndpoint);
      const data = await response.json();
      
      // Process and use data
      this.processAPIResponse(data);
    } catch (error) {
      this.emit('api-plugin:error', { error });
    }
  }
}
```

### 3. Annotation Plugin

```typescript
export class AnnotationPlugin extends BasePlugin {
  getExtensions(): Extension[] {
    return [
      Mark.create({
        name: 'annotation',
        addAttributes() {
          return {
            id: { default: null },
            comment: { default: null },
          };
        },
      }),
    ];
  }

  createAnnotation(comment: string): void {
    const id = `annotation-${Date.now()}`;
    this.context.editor.commands.setMark('annotation', { 
      id, 
      comment 
    });
  }
}
```

## Testing Your Plugin

### 1. Create a Storybook Story

```typescript
// src/stories/components/YourPlugin.stories.tsx
import { EditorProvider } from '../../components/editor/EditorProvider';
import { EditorPlugin } from '../../components/editor/EditorPlugin';
import { yourPlugin } from '../../components/editor-plugins/your-plugin';

export const Default = () => (
  <EditorProvider>
    <EditorPlugin plugin={yourPlugin({
      // Your config
    })} />
    {/* Editor layout */}
  </EditorProvider>
);
```

### 2. Manual Testing Checklist

- [ ] Plugin loads without errors
- [ ] UI components render correctly
- [ ] Events are handled properly
- [ ] Content modifications work as expected
- [ ] Plugin cleanup on unmount
- [ ] No memory leaks
- [ ] Performance is acceptable

## Best Practices

### Do's
- ✅ Keep plugins focused on a single responsibility
- ✅ Use TypeScript for type safety
- ✅ Handle errors gracefully
- ✅ Clean up resources in lifecycle methods
- ✅ Emit events for plugin communication
- ✅ Document public APIs
- ✅ Consider performance implications
- ✅ Add loading states for async operations

### Don'ts
- ❌ Don't modify global state directly
- ❌ Don't assume other plugins are present
- ❌ Don't forget to unsubscribe from events
- ❌ Don't block the main thread
- ❌ Don't store sensitive data in plugin state

## Plugin Capabilities

Set capabilities to declare what your plugin needs:

```typescript
capabilities = {
  requiresSelection: false,  // Needs text selection
  modifiesContent: false,    // Changes editor content
  providesUI: true,          // Has UI components
  requiresNetwork: false,    // Makes network requests
  supportsStreaming: false,  // Supports streaming updates
};
```

## Advanced Topics

### Inter-Plugin Communication

```typescript
// Plugin A emits an event
this.emit('pluginA:data-ready', { data });

// Plugin B listens to Plugin A
eventBus.on('pluginA:data-ready', ({ data }) => {
  this.processDataFromPluginA(data);
});
```

### Lazy Loading

```typescript
// Use dynamic imports for heavy dependencies
private async loadHeavyLibrary() {
  const { default: HeavyLib } = await import('heavy-library');
  this.heavyLib = new HeavyLib();
}
```

### State Persistence

```typescript
// Save plugin state
localStorage.setItem(`plugin-${this.id}`, JSON.stringify(this.state));

// Restore plugin state
const saved = localStorage.getItem(`plugin-${this.id}`);
if (saved) {
  this.state = JSON.parse(saved);
}
```

## Troubleshooting

### Plugin Not Loading
- Check console for errors
- Verify plugin is registered with EditorPlugin
- Ensure dependencies are installed

### UI Not Appearing
- Check slot registration priority
- Verify condition function returns true
- Ensure render function returns valid JSX

### Events Not Firing
- Verify event names match exactly
- Check event subscription timing
- Ensure eventBus is available

## Support

For questions or issues:
1. Check existing plugins for examples
2. Review the base Plugin class documentation
3. Create an issue in the repository