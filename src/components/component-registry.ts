/**
 * Centralized component registration system for Pattern Playground
 * 
 * This module manages the registration order of web components to ensure
 * proper instantiation for interdependent components. Components with
 * dependencies should be registered after their dependencies.
 * 
 * Based on the bulletproof web component loading patterns from
 * https://gomakethings.com/what-order-do-web-components-instantiate-in/
 */

interface ComponentDefinition {
  tagName: string;
  constructor: CustomElementConstructor;
  options?: ElementDefinitionOptions;
  dependencies?: string[];
}

class ComponentRegistry {
  private registered = new Set<string>();
  private pending = new Map<string, ComponentDefinition>();
  private isReady = false;

  constructor() {
    // Wait for DOM to be ready before starting registration
    if (document.readyState !== 'loading') {
      this.isReady = true;
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        this.isReady = true;
        this.processPendingRegistrations();
      });
    }
  }

  /**
   * Register a component with the registry
   */
  register(definition: ComponentDefinition): void {
    if (this.isReady) {
      this.defineComponent(definition);
    } else {
      this.pending.set(definition.tagName, definition);
    }
  }

  /**
   * Register multiple components in dependency order
   */
  registerAll(definitions: ComponentDefinition[]): void {
    const sorted = this.sortByDependencies(definitions);
    
    if (this.isReady) {
      sorted.forEach(def => this.defineComponent(def));
    } else {
      sorted.forEach(def => this.pending.set(def.tagName, def));
    }
  }

  private defineComponent(definition: ComponentDefinition): void {
    if (this.registered.has(definition.tagName)) {
      console.warn(`Component ${definition.tagName} is already registered`);
      return;
    }

    // Check if dependencies are met
    if (definition.dependencies) {
      const unmetDeps = definition.dependencies.filter(dep => !this.registered.has(dep));
      if (unmetDeps.length > 0) {
        console.warn(`Component ${definition.tagName} has unmet dependencies: ${unmetDeps.join(', ')}`);
      }
    }

    try {
      customElements.define(definition.tagName, definition.constructor, definition.options);
      this.registered.add(definition.tagName);
    } catch (error) {
      console.error(`Failed to register component ${definition.tagName}:`, error);
    }
  }

  private processPendingRegistrations(): void {
    const sorted = this.sortByDependencies(Array.from(this.pending.values()));
    sorted.forEach(def => this.defineComponent(def));
    this.pending.clear();
  }

  private sortByDependencies(definitions: ComponentDefinition[]): ComponentDefinition[] {
    const sorted: ComponentDefinition[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (def: ComponentDefinition) => {
      if (visited.has(def.tagName)) return;
      if (visiting.has(def.tagName)) {
        console.warn(`Circular dependency detected for ${def.tagName}`);
        return;
      }

      visiting.add(def.tagName);

      // Visit dependencies first
      if (def.dependencies) {
        def.dependencies.forEach(depName => {
          const depDef = definitions.find(d => d.tagName === depName);
          if (depDef) {
            visit(depDef);
          }
        });
      }

      visiting.delete(def.tagName);
      visited.add(def.tagName);
      sorted.push(def);
    };

    definitions.forEach(visit);
    return sorted;
  }

  /**
   * Check if a component is registered
   */
  isRegistered(tagName: string): boolean {
    return this.registered.has(tagName);
  }

  /**
   * Wait for specific components to be defined
   */
  async whenDefined(...tagNames: string[]): Promise<void> {
    await Promise.all(tagNames.map(name => customElements.whenDefined(name)));
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();

// Convenience function for simple registration
export function registerComponent(
  tagName: string, 
  constructor: CustomElementConstructor, 
  options?: ElementDefinitionOptions
): void {
  componentRegistry.register({ tagName, constructor, options });
}

// Convenience function for registration with dependencies
export function registerComponentWithDeps(
  tagName: string,
  constructor: CustomElementConstructor,
  dependencies: string[],
  options?: ElementDefinitionOptions
): void {
  componentRegistry.register({ tagName, constructor, dependencies, options });
}