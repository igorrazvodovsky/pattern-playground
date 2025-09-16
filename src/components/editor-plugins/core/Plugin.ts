import type { 
  Plugin as IPlugin, 
  PluginCapabilities, 
  EditorContext, 
  EventBus, 
  SlotRegistry,
  EventPayload,
  PluginState
} from '../../editor/types';
import type { Extension } from '@tiptap/core';

export abstract class BasePlugin implements IPlugin {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  
  dependencies?: string[];
  capabilities?: PluginCapabilities;
  
  // Private fields - ES2020 compatible
  private context?: EditorContext;
  private state: PluginState = 'pending';
  private abortController = new AbortController();
  private eventCleanupFunctions = new Set<() => void>();

  // Static validation constants
  static readonly LIFECYCLE_METHODS = ['onInstall', 'onActivate', 'onDeactivate', 'onUninstall', 'onDestroy'] as const;

  // Getter for context
  protected getContext(): EditorContext | undefined {
    return this.context;
  }

  protected getState(): PluginState {
    return this.state;
  }

  protected get isActive(): boolean {
    return this.state === 'active';
  }

  async onInstall(context: EditorContext): Promise<void> {
    this.context = context;
    this.state = 'loading';
    
    // Use optional chaining for lifecycle hooks
    await this.onPreInstall?.(context);
    this.state = 'active';
  }

  onActivate(context: EditorContext): void {
    this.context = context;
    this.state = 'active';
    
    // Use optional chaining for registration methods
    this.registerUI?.(context.slots);
    this.subscribeToEvents?.(context.eventBus);
    
    // Auto-cleanup on abort signal
    this.abortController.signal.addEventListener('abort', () => {
      this.cleanup();
    }, { once: true });
  }

  onDeactivate(): void {
    this.state = 'deactivated';
    this.cleanup();
  }

  onUninstall(): void {
    this.state = 'deactivated';
    this.cleanup();
  }

  onDestroy(): void {
    this.abortController.abort();
    this.cleanup();
    this.context = undefined;
    this.state = 'pending';
  }

  // Modern cleanup with AbortController
  private cleanup(): void {
    // Clean up all event listeners
    for (const cleanup of this.eventCleanupFunctions) {
      cleanup();
    }
    this.eventCleanupFunctions.clear();
    
    // Custom cleanup hook
    this.onCleanup?.();
  }

  // Optional lifecycle hooks with modern syntax
  protected onPreInstall?(context: EditorContext): Promise<void> | void;
  protected onCleanup?(): void;

  // Abstract methods that can be implemented
  registerUI?(slots: SlotRegistry): void;
  subscribeToEvents?(eventBus: EventBus): void;
  
  getExtensions?(): Extension[] {
    return [];
  }

  configure?(): void {
    // Base implementation - can be overridden
  }

  // Modern utility methods with optional chaining and nullish coalescing
  protected getPlugin<T extends IPlugin>(id: string): T | undefined {
    return this.context?.getPlugin<T>(id);
  }

  protected emit<T extends keyof EventPayload>(
    event: T,
    payload: EventPayload[T]
  ): boolean {
    return this.context?.eventBus.emit(event, payload) ?? false;
  }

  // Modern event subscription with automatic cleanup
  protected on<T extends keyof EventPayload>(
    event: T,
    handler: (payload: EventPayload[T]) => void,
    options?: Parameters<EventBus['on']>[2]
  ): () => void {
    const cleanup = this.context?.eventBus.on(event, handler, {
      ...options,
      signal: this.abortController.signal
    });
    
    if (cleanup) {
      this.eventCleanupFunctions.add(cleanup);
      return () => {
        cleanup();
        this.eventCleanupFunctions.delete(cleanup);
      };
    }
    
    return () => {};
  }

  // Batch event subscription with modern syntax
  protected onMultiple<T extends keyof EventPayload>(
    events: T[],
    handler: (event: T, payload: EventPayload[T]) => void,
    options?: Parameters<EventBus['on']>[2]
  ): () => void {
    const cleanupFunctions = events.map(event => 
      this.on(event, payload => handler(event, payload), options)
    );

    return () => {
      for (const cleanup of cleanupFunctions) {
        cleanup();
      }
    };
  }

  // Modern async plugin loading helper
  protected async loadDependency<T extends IPlugin>(pluginId: string): Promise<T> {
    const plugin = this.getPlugin<T>(pluginId);
    if (plugin) {
      return plugin;
    }

    // Wait for plugin to be loaded
    return new Promise((resolve, reject) => {
      const cleanup = this.on('plugin:activate', ({ pluginId: activatedId }) => {
        if (activatedId === pluginId) {
          const loadedPlugin = this.getPlugin<T>(pluginId);
          if (loadedPlugin) {
            cleanup();
            resolve(loadedPlugin);
          }
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        cleanup();
        reject(new Error(`Plugin dependency '${pluginId}' failed to load within timeout`));
      }, 5000);
    });
  }

  // Modern capability checking with template literal types
  protected hasCapability<K extends keyof Required<PluginCapabilities>>(
    capability: K
  ): boolean {
    return this.capabilities?.[capability] === true;
  }

  // Debug utilities for development
  getDebugInfo(): {
    id: string;
    state: PluginState;
    isActive: boolean;
    hasContext: boolean;
    eventListenerCount: number;
    capabilities: PluginCapabilities | undefined;
    dependencies: string[] | undefined;
  } {
    return {
      id: this.id,
      state: this.state,
      isActive: this.isActive,
      hasContext: !!this.context,
      eventListenerCount: this.eventCleanupFunctions.size,
      capabilities: this.capabilities,
      dependencies: this.dependencies
    };
  }

  // Modern error handling with detailed context  
  protected createError(
    message: string, 
    cause?: Error,
    context?: Record<string, unknown>
  ): Error {
    const error = new Error(`[${this.id}] ${message}`);
    
    // Add plugin context to error for debugging
    (error as Error & { cause?: unknown; pluginContext?: Record<string, unknown> }).cause = cause;
    (error as Error & { cause?: unknown; pluginContext?: Record<string, unknown> }).pluginContext = {
      pluginId: this.id,
      state: this.state,
      isActive: this.isActive,
      ...context
    };
    
    return error;
  }
}