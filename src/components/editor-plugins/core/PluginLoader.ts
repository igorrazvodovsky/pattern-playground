// Modern plugin loader with dynamic imports
import type { Plugin } from '../../editor/types';

// Plugin loading utilities with modern JavaScript features
export class PluginLoader {
  // Private fields - ES2020 compatible
  private loadedModules = new Map<string, { plugin: Plugin; module: any }>();
  private loadingPromises = new Map<string, Promise<Plugin>>();
  private failedPlugins = new Set<string>();
  
  // Static configuration
  static readonly PLUGIN_TIMEOUT = 10000; // 10 seconds
  static readonly RETRY_ATTEMPTS = 3;

  // Modern dynamic plugin loading with top-level await support
  async loadPlugin(pluginId: string): Promise<Plugin> {
    // Check if already loading
    const existingPromise = this.loadingPromises.get(pluginId);
    if (existingPromise) {
      return existingPromise;
    }

    // Check if already loaded
    const existingModule = this.loadedModules.get(pluginId);
    if (existingModule) {
      return existingModule.plugin;
    }

    // Check if previously failed
    if (this.failedPlugins.has(pluginId)) {
      throw new Error(`Plugin '${pluginId}' previously failed to load`);
    }

    // Create loading promise
    const loadingPromise = this.loadPluginInternal(pluginId);
    this.loadingPromises.set(pluginId, loadingPromise);

    try {
      const plugin = await loadingPromise;
      this.loadingPromises.delete(pluginId);
      return plugin;
    } catch (error) {
      this.loadingPromises.delete(pluginId);
      this.failedPlugins.add(pluginId);
      throw error;
    }
  }

  // Internal loading method with retry logic
  private async loadPluginInternal(pluginId: string, attempt = 1): Promise<Plugin> {
    try {
      // Use AbortController for timeout
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), PluginLoader.PLUGIN_TIMEOUT);

      // Dynamic import with timeout
      const modulePromise = this.importPluginModule(pluginId);
      
      const module = await Promise.race([
        modulePromise,
        new Promise<never>((_, reject) => {
          abortController.signal.addEventListener('abort', () => {
            reject(new Error(`Plugin '${pluginId}' loading timed out after ${PluginLoader.PLUGIN_TIMEOUT}ms`));
          });
        })
      ]);

      clearTimeout(timeoutId);

      // Extract plugin from module
      const plugin = this.extractPluginFromModule(module, pluginId);
      
      // Store loaded module for future reference
      this.loadedModules.set(pluginId, { plugin, module });
      
      return plugin;
    } catch (error) {
      if (attempt < PluginLoader.RETRY_ATTEMPTS) {
        console.warn(`Plugin '${pluginId}' load attempt ${attempt} failed, retrying...`, error);
        return this.loadPluginInternal(pluginId, attempt + 1);
      }
      throw error;
    }
  }

  // Modern dynamic import patterns
  private async importPluginModule(pluginId: string): Promise<any> {
    // Try different plugin path patterns
    const patterns = [
      `../${pluginId}/${pluginId.charAt(0).toUpperCase() + pluginId.slice(1)}Plugin`,
      `../${pluginId}/index`,
      `../${pluginId}`
    ];

    for (const pattern of patterns) {
      try {
        return await import(pattern);
      } catch (error) {
        // Continue to next pattern
        continue;
      }
    }

    throw new Error(`No valid module found for plugin '${pluginId}'`);
  }

  // Extract plugin instance from module with modern type checking
  private extractPluginFromModule(module: any, pluginId: string): Plugin {
    // Use modern object destructuring and type guards
    const { 
      default: defaultExport,
      Plugin: PluginClass,
      createPlugin,
      ...namedExports 
    } = module;

    // Try different plugin extraction patterns
    const candidates = [
      defaultExport,
      PluginClass,
      createPlugin?.(),
      namedExports[`${pluginId}Plugin`],
      namedExports[pluginId]
    ].filter(Boolean);

    for (const candidate of candidates) {
      if (this.isValidPlugin(candidate)) {
        return candidate;
      }
    }

    throw new Error(`Module for '${pluginId}' does not export a valid plugin`);
  }

  // Modern type guard with optional chaining
  private isValidPlugin(candidate: any): candidate is Plugin {
    return (
      candidate &&
      typeof candidate === 'object' &&
      typeof candidate.id === 'string' &&
      typeof candidate.name === 'string' &&
      typeof candidate.version === 'string'
    );
  }

  // Batch plugin loading with parallel execution
  async loadPlugins(pluginIds: readonly string[]): Promise<Plugin[]> {
    // Use Promise.allSettled for resilient loading
    const results = await Promise.allSettled(
      pluginIds.map(id => this.loadPlugin(id))
    );

    const plugins: Plugin[] = [];
    const errors: Array<{ pluginId: string; error: any }> = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        plugins.push(result.value);
      } else {
        errors.push({
          pluginId: pluginIds[index],
          error: result.reason
        });
      }
    });

    // Log errors but don't fail the entire batch
    if (errors.length > 0) {
      console.error('Some plugins failed to load:', errors);
    }

    return plugins;
  }

  // Modern plugin dependency resolution with topological sort
  async loadPluginsWithDependencies(pluginIds: string[]): Promise<Plugin[]> {
    // First, load all plugin modules to analyze dependencies
    const pluginPromises = pluginIds.map(async id => {
      try {
        const plugin = await this.loadPlugin(id);
        return { id, plugin, dependencies: plugin.dependencies ?? [] };
      } catch (error) {
        console.error(`Failed to load plugin '${id}' for dependency analysis:`, error);
        return null;
      }
    });

    const pluginData = (await Promise.all(pluginPromises)).filter(Boolean) as Array<{
      id: string;
      plugin: Plugin;
      dependencies: readonly string[];
    }>;

    // Topological sort for dependency order
    const sorted = this.#topologicalSort(pluginData);
    
    // Return plugins in dependency order
    return sorted.map(({ plugin }) => plugin);
  }

  // Modern topological sort with better error handling
  private topologicalSort<T extends { id: string; dependencies: string[] | undefined }>(
    items: T[]
  ): T[] {
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();
    const itemMap = new Map<string, T>();

    // Initialize
    for (const item of items) {
      graph.set(item.id, new Set());
      inDegree.set(item.id, 0);
      itemMap.set(item.id, item);
    }

    // Build dependency graph
    for (const item of items) {
      const deps = item.dependencies ?? [];
      deps.forEach(dep => {
        if (graph.has(dep)) {
          graph.get(dep)!.add(item.id);
          inDegree.set(item.id, (inDegree.get(item.id) ?? 0) + 1);
        }
      });
    }

    // Kahn's algorithm with modern array methods
    const queue = [...inDegree.entries()]
      .filter(([_, degree]) => degree === 0)
      .map(([id]) => id);

    const sorted: T[] = [];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentItem = itemMap.get(currentId)!;
      sorted.push(currentItem);

      for (const dependentId of graph.get(currentId) ?? []) {
        const newDegree = (inDegree.get(dependentId) ?? 1) - 1;
        inDegree.set(dependentId, newDegree);
        if (newDegree === 0) {
          queue.push(dependentId);
        }
      }
    }

    // Check for cycles
    if (sorted.length !== items.length) {
      const remaining = items.filter(item => !sorted.includes(item));
      throw new Error(
        `Circular dependency detected among plugins: ${remaining.map(r => r.id).join(', ')}`
      );
    }

    return sorted;
  }

  // Utility methods with modern features
  getLoadedPluginIds(): readonly string[] {
    return Array.from(this.loadedModules.keys());
  }

  getFailedPluginIds(): readonly string[] {
    return Array.from(this.failedPlugins);
  }

  isPluginLoaded(pluginId: string): boolean {
    return this.loadedModules.has(pluginId);
  }

  clearCache(): void {
    this.loadedModules.clear();
    this.loadingPromises.clear();
    this.failedPlugins.clear();
  }

  // Debug utilities
  getLoadingStats() {
    return {
      loaded: this.loadedModules.size,
      loading: this.loadingPromises.size,
      failed: this.failedPlugins.size,
      totalRequested: this.loadedModules.size + this.failedPlugins.size
    };
  }
}

// Top-level await example for plugin loading
export const pluginLoader = new PluginLoader();

// Example of using top-level await to pre-load essential plugins
if (typeof window !== 'undefined') {
  // Browser environment - load plugins asynchronously
  (async () => {
    const essentialPlugins = ['formatting', 'commenting'];
    try {
      await pluginLoader.loadPlugins(essentialPlugins);
      console.log('Essential plugins loaded successfully');
    } catch (error) {
      console.error('Failed to load essential plugins:', error);
    }
  })();
}

// Modern plugin factory with better typing
export function createPluginFactory<TConfig = unknown>(
  baseConfig: Partial<Plugin>
) {
  return (config: TConfig): Plugin => ({
    id: `custom-${Date.now()}`,
    name: 'Custom Plugin',
    version: '1.0.0',
    ...baseConfig,
    configure(pluginConfig: unknown) {
      // Modern configuration merging with optional chaining
      baseConfig.configure?.(pluginConfig);
    }
  });
}

// Export for external usage
export type { Plugin } from '../../editor/types';