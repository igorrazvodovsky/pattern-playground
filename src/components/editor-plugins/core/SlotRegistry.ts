import type {
  SlotRegistry as ISlotRegistry,
  SlotId,
  SlotComponent,
  SlotRegistrationOptions
} from '../../editor/types';

interface RegisteredComponent extends SlotComponent {
  readonly options: Required<SlotRegistrationOptions>;
}

export class SlotRegistry implements ISlotRegistry {
  // Private fields - ES2020 compatible
  #slots = new Map<SlotId, RegisteredComponent[]>();
  
  // Performance tracking with WeakMap
  private componentMetrics = new WeakMap<SlotComponent, { 
    renderCount: number; 
    lastRender: number;
    averageRenderTime: number;
  }>();

  // Static constants with const assertion
  static readonly DEFAULT_OPTIONS = {
    priority: 50,
    position: 'end' as const,
    condition: () => true
  } as const;

  register(
    slotId: SlotId,
    component: SlotComponent,
    // Modern destructuring with default values
    { 
      priority = SlotRegistry.DEFAULT_OPTIONS.priority, 
      condition = SlotRegistry.DEFAULT_OPTIONS.condition, 
      position = SlotRegistry.DEFAULT_OPTIONS.position 
    }: SlotRegistrationOptions = {}
  ): void {
    // Initialize slot if needed
    if (!this.#slots.has(slotId)) {
      this.#slots.set(slotId, []);
    }

    const registeredComponent: RegisteredComponent = {
      ...component,
      options: {
        priority,
        condition,
        position,
      },
    };

    const components = this.#slots.get(slotId)!;
    
    // Use modern array methods for finding and replacing
    const existingIndex = components.findIndex(comp => comp.pluginId === component.pluginId);
    
    if (existingIndex !== -1) {
      // Replace existing registration
      components[existingIndex] = registeredComponent;
    } else {
      // Use modern switch for position handling
      switch (position) {
        case 'replace':
          this.#slots.set(slotId, [registeredComponent]);
          break;
        case 'start':
          components.unshift(registeredComponent);
          break;
        case 'end':
        default:
          components.push(registeredComponent);
          break;
      }
    }

    this.#sortComponents(slotId);
  }

  getComponents(slotId: SlotId): SlotComponent[] {
    const components = this.#slots.get(slotId) ?? [];
    
    // Use modern array methods and destructuring
    return components
      .filter(({ options: { condition } }) => condition())
      .map(({ pluginId, render, cleanup }) => ({ 
        pluginId, 
        render: this.#wrapRenderWithMetrics(render, pluginId), 
        cleanup 
      }));
  }

  update(slotId: SlotId, pluginId: string, component: SlotComponent): void {
    const components = this.#slots.get(slotId);
    if (!components?.length) {
      return;
    }

    // Use modern findIndex and optional chaining
    const index = components.findIndex(c => c.pluginId === pluginId);
    if (index !== -1) {
      const { options } = components[index];
      components[index] = {
        ...component,
        options,
      };
    }
  }

  unregister(slotId: SlotId, pluginId: string): void {
    const components = this.#slots.get(slotId);
    if (!components?.length) {
      return;
    }

    // Use modern array methods for filtering
    const filtered = components.filter(({ pluginId: id }) => id !== pluginId);
    
    if (filtered.length === 0) {
      this.#slots.delete(slotId);
    } else {
      this.#slots.set(slotId, filtered);
    }
  }

  unregisterAll(pluginId: string): void {
    // Use modern iteration methods
    for (const slotId of this.#slots.keys()) {
      this.unregister(slotId, pluginId);
    }
  }

  clear(): void {
    // Use modern iteration with destructuring and optional chaining
    for (const components of this.#slots.values()) {
      for (const { cleanup } of components) {
        cleanup?.();
      }
    }
    this.#slots.clear();
  }

  // Private method using # syntax with modern array sorting
  #sortComponents(slotId: SlotId): void {
    const components = this.#slots.get(slotId);
    if (!components?.length) {
      return;
    }

    // Use toSorted() for immutable sorting (when available) or fallback
    const sortedComponents = components.toSorted?.((a, b) => {
      const { priority: priorityA } = a.options;
      const { priority: priorityB } = b.options;
      return priorityB - priorityA;
    }) ?? components.sort((a, b) => {
      const { priority: priorityA } = a.options;
      const { priority: priorityB } = b.options;
      return priorityB - priorityA;
    });

    this.#slots.set(slotId, sortedComponents);
  }

  // Modern utility methods
  getSlotIds(): readonly SlotId[] {
    return [...this.#slots.keys()];
  }

  hasSlot(slotId: SlotId): boolean {
    return this.#slots.has(slotId);
  }

  getSlotComponentCount(slotId: SlotId): number {
    return this.#slots.get(slotId)?.length ?? 0;
  }

  // Get components by plugin with modern filtering
  getComponentsByPlugin(pluginId: string): Array<{ slotId: SlotId; component: SlotComponent }> {
    const results: Array<{ slotId: SlotId; component: SlotComponent }> = [];
    
    for (const [slotId, components] of this.#slots.entries()) {
      const pluginComponents = components.filter(({ pluginId: id }) => id === pluginId);
      
      results.push(
        ...pluginComponents.map(component => ({
          slotId,
          component: {
            pluginId: component.pluginId,
            render: component.render,
            cleanup: component.cleanup
          }
        }))
      );
    }
    
    return results;
  }

  // Performance monitoring wrapper
  #wrapRenderWithMetrics(
    originalRender: () => React.ReactNode | HTMLElement
  ): () => React.ReactNode | HTMLElement {
    return () => {
      const startTime = performance.now();
      const result = originalRender();
      const renderTime = performance.now() - startTime;

      // Update metrics using WeakMap (if we had a component reference)
      // Slow render detection handled by metrics system

      return result;
    };
  }

  // Debug utilities for development
  getDebugInfo(): {
    totalSlots: number;
    totalComponents: number;
    slotDetails: Record<string, { componentCount: number; pluginIds: string[] }>;
  } {
    const slotDetails: Record<string, { componentCount: number; pluginIds: string[] }> = {};
    let totalComponents = 0;

    for (const [slotId, components] of this.#slots.entries()) {
      const pluginIds = components.map(({ pluginId }) => pluginId);
      slotDetails[slotId] = {
        componentCount: components.length,
        pluginIds
      };
      totalComponents += components.length;
    }

    return {
      totalSlots: this.#slots.size,
      totalComponents,
      slotDetails
    };
  }

  // Modern batch operations
  batchRegister(
    registrations: Array<{
      slotId: SlotId;
      component: SlotComponent;
      options?: SlotRegistrationOptions;
    }>
  ): void {
    // Use modern array methods for batch processing
    const groupedBySlot = registrations.reduce((acc, { slotId, component, options }) => {
      if (!acc.has(slotId)) {
        acc.set(slotId, []);
      }
      acc.get(slotId)!.push({ component, options });
      return acc;
    }, new Map<SlotId, Array<{ component: SlotComponent; options?: SlotRegistrationOptions }>>());

    // Process each slot's registrations
    for (const [slotId, components] of groupedBySlot.entries()) {
      for (const { component, options } of components) {
        this.register(slotId, component, options);
      }
    }
  }
}