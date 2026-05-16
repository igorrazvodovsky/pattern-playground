import type { Plugin, PluginRegistry as IPluginRegistry, EditorContext, PluginState } from '../../editor/types';

export class PluginRegistry implements IPluginRegistry {
  // Private fields - compatible with ES2020
  private plugins = new Map<string, Plugin>();
  private pluginStates = new Map<string, PluginState>();
  private loadOrder: string[] = [];
  private activeDependencies = new Set<string>();
  private conflictResolvers = new Map<string, (conflicts: string[]) => 'abort' | 'merge' | 'override'>();
  private context: EditorContext;
  
  // Static validation constants
  static readonly REQUIRED_METHODS = ['id', 'name', 'version'] as const;

  constructor(context: EditorContext) {
    this.context = context;
  }

  async register(plugin: Plugin): Promise<void> {
    // Use modern array methods and optional chaining
    const missing = plugin.dependencies?.filter(dep => !this.plugins.has(dep)) ?? [];
    if (missing.length > 0) {
      throw new Error(`Missing dependencies: ${missing.join(', ')}`);
    }

    const conflicts = this.detectConflicts(plugin);
    const hasConflicts = conflicts.length > 0;
    
    if (hasConflicts) {
      console.warn(`[PluginRegistry] Conflicts detected for plugin '${plugin.id}':`, conflicts);
    }

    // Avoid mutation with spread and modern array methods
    const allPlugins = Array.from(this.plugins.values()).concat([plugin]);
    this.loadOrder = this.calculateLoadOrder(allPlugins);
    
    // Set initial state
    this.pluginStates.set(plugin.id, 'loading');

    try {
      // Optional chaining for lifecycle methods
      await plugin.onInstall?.(this.context);
      
      this.plugins.set(plugin.id, plugin);
      
      // Add dependencies to active set
      plugin.dependencies?.forEach(dep => this.activeDependencies.add(dep));

      if (!hasConflicts) {
        plugin.onActivate?.(this.context);
        this.pluginStates.set(plugin.id, 'active');
      } else {
        this.pluginStates.set(plugin.id, 'error');
      }

      this.context.eventBus.emit('plugin:activate', { pluginId: plugin.id });
    } catch (error) {
      this.pluginStates.set(plugin.id, 'error');
      throw error;
    }
  }

  unregister(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return;
    }

    // Set state before cleanup
    this.pluginStates.set(pluginId, 'deactivated');

    // Use optional chaining for lifecycle methods
    plugin.onDeactivate?.();
    plugin.onUninstall?.();

    // Clean up collections
    this.plugins.delete(pluginId);
    this.pluginStates.delete(pluginId);
    this.activeDependencies.delete(pluginId);
    this.loadOrder = this.loadOrder.filter(id => id !== pluginId);

    this.context.eventBus.emit('plugin:deactivate', { pluginId });
  }

  get<T extends Plugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T | undefined;
  }

  getAll(): readonly Plugin[] {
    return Array.from(this.plugins.values());
  }

  has(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  getLoadOrder(): readonly string[] {
    return [...this.loadOrder];
  }
  
  getState(pluginId: string): PluginState | undefined {
    return this.pluginStates.get(pluginId);
  }

  // Private method 
  private getMissingDependencies(plugin: Plugin): string[] {
    // Use optional chaining and nullish coalescing
    return plugin.dependencies?.filter(dep => !this.plugins.has(dep)) ?? [];
  }

  private detectConflicts(plugin: Plugin): string[] {
    const conflicts: string[] = [];

    // Check for duplicate plugin ID
    if (this.plugins.has(plugin.id)) {
      conflicts.push(`Plugin with ID '${plugin.id}' already registered`);
    }

    // Check explicit conflicts using modern optional chaining
    const explicitConflicts = plugin.capabilities?.conflictsWith?.filter(
      conflictId => this.plugins.has(conflictId)
    ) ?? [];
    
    conflicts.push(...explicitConflicts.map(id => `Conflicts with plugin '${id}'`));

    return conflicts;
  }

  private calculateLoadOrder(plugins: Plugin[]): string[] {
    // Use modern Map constructor and better initialization
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize graph nodes
    for (const plugin of plugins) {
      graph.set(plugin.id, new Set());
      inDegree.set(plugin.id, 0);
    }

    // Build dependency graph with modern syntax
    for (const plugin of plugins) {
      plugin.dependencies?.forEach(dep => {
        if (!graph.has(dep)) {
          graph.set(dep, new Set());
          inDegree.set(dep, 0);
        }
        graph.get(dep)!.add(plugin.id);
        inDegree.set(plugin.id, (inDegree.get(plugin.id) ?? 0) + 1);
      });
    }

    // Use modern array methods for queue initialization
    const queue = [...inDegree.entries()]
      .filter(([, degree]) => degree === 0)
      .map(([id]) => id);

    const sorted: string[] = [];

    // Kahn's algorithm with modern syntax
    while (queue.length > 0) {
      const current = queue.shift()!;
      sorted.push(current);

      // Use nullish coalescing for safe iteration
      for (const dependent of graph.get(current) ?? []) {
        const newDegree = (inDegree.get(dependent) ?? 1) - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    return sorted;
  }

  destroy(): void {
    // Use modern iteration and optional chaining
    for (const plugin of this.plugins.values()) {
      plugin.onDestroy?.();
    }
    
    // Clear all collections
    this.plugins.clear();
    this.pluginStates.clear();
    this.activeDependencies.clear();
    this.conflictResolvers.clear();
    this.loadOrder = [];
  }
  
  // Modern utility methods
  getActivePlugins(): readonly Plugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => this.pluginStates.get(plugin.id) === 'active'
    );
  }
  
  getPluginsByCapability(capability: keyof Required<Plugin>['capabilities']): readonly Plugin[] {
    return Array.from(this.plugins.values()).filter(
      plugin => plugin.capabilities?.[capability] === true
    );
  }
  
  hasActiveDependency(pluginId: string): boolean {
    return this.activeDependencies.has(pluginId);
  }
}