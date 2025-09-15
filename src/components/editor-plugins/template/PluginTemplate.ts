import { BasePlugin } from '../core/Plugin';
import type { PluginCapabilities, EditorContext } from '../../editor/types';
import type { Extension } from '@tiptap/core';

/**
 * PLUGIN TEMPLATE
 * 
 * This is a template for creating new editor plugins.
 * Follow these steps to create your own plugin:
 * 
 * 1. Copy this file and rename it to YourPluginName.ts
 * 2. Update the class name, id, and name properties
 * 3. Define your plugin's configuration interface
 * 4. Implement the required methods
 * 5. Export a factory function for easy usage
 * 
 * @example
 * ```typescript
 * import { yourPlugin } from './YourPlugin';
 * 
 * <EditorPlugin plugin={yourPlugin({ 
 *   // your config here
 * })} />
 * ```
 */

// Step 1: Define your plugin's configuration interface
export interface TemplatePluginOptions {
  // Add your plugin-specific configuration options here
  enabled?: boolean;
  customOption?: string;
  // Example options:
  // apiEndpoint?: string;
  // maxRetries?: number;
  // theme?: 'light' | 'dark';
}

// Step 2: Create your plugin class extending BasePlugin
export class TemplatePlugin extends BasePlugin {
  // Step 3: Define plugin metadata
  public readonly id = 'template-plugin'; // Unique identifier
  public readonly name = 'Template Plugin'; // Human-readable name
  public readonly version = '1.0.0'; // Semantic version
  
  // Step 4: Define plugin capabilities
  public readonly capabilities: PluginCapabilities = {
    requiresSelection: false, // Does the plugin need text selection?
    modifiesContent: false,   // Does the plugin modify editor content?
    providesUI: true,          // Does the plugin provide UI components?
    requiresNetwork: false,    // Does the plugin make network requests?
    supportsStreaming: false,  // Does the plugin support streaming updates?
  };

  // Step 5: Store your plugin configuration
  private options: TemplatePluginOptions;

  constructor(options: TemplatePluginOptions = {}) {
    super();
    
    // Set default options
    this.options = {
      enabled: true,
      customOption: 'default value',
      ...options,
    };
  }

  // Step 6: Lifecycle hooks (all optional)
  
  /**
   * Called when the plugin is installed
   * Use this for one-time setup
   */
  onInstall(context: EditorContext): void {
    super.onInstall(context);
    
    // Example: Initialize plugin resources
    console.log(`${this.name} installed`);
    
    // Example: Set up initial state
    // this.initializeState();
  }

  /**
   * Called when the plugin is activated
   * Use this for activating features
   */
  onActivate(context: EditorContext): void {
    super.onActivate(context);
    
    // Register UI components
    this.registerUI(context.slots);
    
    // Example: Start listening to editor events
    // this.startListening();
  }

  /**
   * Called when the plugin is deactivated
   * Use this for cleanup
   */
  onDeactivate(): void {
    super.onDeactivate();
    
    // Example: Stop listening to events
    // this.stopListening();
  }

  /**
   * Called when the plugin is destroyed
   * Use this for final cleanup
   */
  onDestroy(): void {
    super.onDestroy();
    
    // Example: Clean up resources
    // this.cleanup();
  }

  // Step 7: Register UI components
  registerUI(): void {
    // Example: Register a bubble menu item
    /*
    slots.register('bubble-menu', {
      pluginId: this.id,
      render: () => (
        <YourBubbleMenuComponent 
          options={this.options}
          onAction={this.handleAction.bind(this)}
        />
      ),
      priority: 50, // Lower numbers = higher priority
      condition: () => {
        // Return true when this UI should be shown
        return this.isActive && this.options.enabled;
      },
    });
    */

    // Example: Register a toolbar button
    /*
    slots.register('toolbar', {
      pluginId: this.id,
      render: () => (
        <YourToolbarButton 
          options={this.options}
          onClick={this.handleClick.bind(this)}
        />
      ),
      priority: 50,
    });
    */

    // Available slots:
    // - 'toolbar': Main editor toolbar
    // - 'bubble-menu': Floating menu for text selection
    // - 'floating-menu': Menu for empty lines
    // - 'sidebar': Side panel (if implemented)
    // - 'statusbar': Bottom status bar (if implemented)
  }

  // Step 8: Subscribe to editor events
  subscribeToEvents(): void {
    // Example: Listen to selection changes
    /*
    eventBus.on('selection:change', ({ from, to, content }) => {
      console.log('Selection changed:', { from, to, content });
      
      // Emit custom events for other plugins
      eventBus.emit('template-plugin:selection-updated', { 
        hasSelection: from !== to 
      });
    });
    */

    // Example: Listen to content changes
    /*
    eventBus.on('content:change', ({ transaction }) => {
      console.log('Content changed');
    });
    */

    // Common events to subscribe to:
    // - 'selection:change': Text selection changed
    // - 'content:change': Document content changed
    // - 'plugin:activate': A plugin was activated
    // - 'plugin:deactivate': A plugin was deactivated
    // - 'command:execute': An editor command was executed
  }

  // Step 9: Provide Tiptap extensions (if needed)
  getExtensions(): Extension[] {
    const extensions: Extension[] = [];
    
    // Example: Add a custom node or mark
    /*
    import { Node } from '@tiptap/core';
    
    const CustomNode = Node.create({
      name: 'customNode',
      // ... node configuration
    });
    
    extensions.push(CustomNode);
    */
    
    return extensions;
  }

  // Step 10: Add your custom plugin methods
  
  /**
   * Example custom method
   */
  private handleAction(action: string, data?: any): void {
    if (!this.context?.editor) return;
    
    switch (action) {
      case 'example-action':
        // Perform your action
        console.log('Executing example action with data:', data);
        
        // Example: Modify editor content
        // this.context.editor.commands.insertContent('Hello World');
        
        // Example: Emit an event
        // this.emit('template-plugin:action-completed', { action, data });
        
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  }

  // Public API methods for other components to use
  
  /**
   * Example public method
   */
  public doSomething(): void {
    if (!this.options.enabled) {
      console.warn(`${this.name} is disabled`);
      return;
    }
    
    this.handleAction('example-action', { timestamp: Date.now() });
  }

  /**
   * Example getter for plugin state
   */
  public getState(): any {
    return {
      enabled: this.options.enabled,
      customOption: this.options.customOption,
      // Add more state as needed
    };
  }
}

// Step 11: Export a factory function for easy usage
export function templatePlugin(options?: TemplatePluginOptions): TemplatePlugin {
  return new TemplatePlugin(options);
}

/**
 * NEXT STEPS:
 * 
 * 1. Copy this file and rename it (e.g., SpellCheckPlugin.ts)
 * 2. Update all "template" references to your plugin name
 * 3. Define your configuration interface
 * 4. Implement your plugin logic
 * 5. Create UI components if needed (in ./components/)
 * 6. Add your plugin to the main exports (in ../index.ts)
 * 7. Create a Storybook story to demonstrate your plugin
 * 
 * TIPS:
 * 
 * - Keep your plugin focused on a single responsibility
 * - Use TypeScript for better type safety
 * - Emit events for other plugins to listen to
 * - Document your public API methods
 * - Add error handling for edge cases
 * - Consider performance implications
 * - Write a comprehensive README for your plugin
 */