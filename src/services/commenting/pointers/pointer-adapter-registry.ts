import { AbstractPointerAdapter } from './abstract-pointer-adapter.js';
import type { DocumentPointer } from '../document-pointer.js';
import { CommentErrorType, createCommentError } from '../utils/error-handling.js';

/**
 * Registry for managing different pointer adapter types
 * Supports multiple pointer types and adapter instances
 */
export class PointerAdapterRegistry {
  private static instance: PointerAdapterRegistry;
  private adapters = new Map<string, AbstractPointerAdapter<any>>();
  private adapterFactories = new Map<string, () => AbstractPointerAdapter<any>>();

  private constructor() {}

  static getInstance(): PointerAdapterRegistry {
    if (!PointerAdapterRegistry.instance) {
      PointerAdapterRegistry.instance = new PointerAdapterRegistry();
    }
    return PointerAdapterRegistry.instance;
  }

  /**
   * Register a pointer adapter for a specific pointer type
   */
  register<T extends DocumentPointer>(
    pointerType: string,
    adapter: AbstractPointerAdapter<T>
  ): void {
    if (this.adapters.has(pointerType)) {
      console.warn(`Overriding existing adapter for pointer type: ${pointerType}`);
    }
    
    this.adapters.set(pointerType, adapter);
  }

  /**
   * Register a factory function for creating adapters on demand
   * Useful for adapters that need to be created with specific parameters
   */
  registerFactory<T extends DocumentPointer>(
    pointerType: string,
    factory: () => AbstractPointerAdapter<T>
  ): void {
    if (this.adapterFactories.has(pointerType)) {
      console.warn(`Overriding existing adapter factory for pointer type: ${pointerType}`);
    }
    
    this.adapterFactories.set(pointerType, factory);
  }

  /**
   * Get an adapter for a specific pointer type
   */
  getAdapter<T extends DocumentPointer>(
    pointerType: string
  ): AbstractPointerAdapter<T> | undefined {
    // First try to get a registered adapter instance
    let adapter = this.adapters.get(pointerType);
    
    // If no instance exists, try to create one from a factory
    if (!adapter && this.adapterFactories.has(pointerType)) {
      const factory = this.adapterFactories.get(pointerType)!;
      adapter = factory();
      this.adapters.set(pointerType, adapter);
    }
    
    return adapter as AbstractPointerAdapter<T> | undefined;
  }

  /**
   * Get an adapter and throw an error if not found
   */
  getRequiredAdapter<T extends DocumentPointer>(
    pointerType: string
  ): AbstractPointerAdapter<T> {
    const adapter = this.getAdapter<T>(pointerType);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter registered for pointer type: ${pointerType}`,
        { 
          pointerType, 
          availableTypes: this.getRegisteredTypes() 
        }
      );
    }
    
    return adapter;
  }

  /**
   * Check if an adapter is registered for a pointer type
   */
  hasAdapter(pointerType: string): boolean {
    return this.adapters.has(pointerType) || this.adapterFactories.has(pointerType);
  }

  /**
   * Unregister an adapter for a pointer type
   */
  unregister(pointerType: string): void {
    this.adapters.delete(pointerType);
    this.adapterFactories.delete(pointerType);
  }

  /**
   * Get all registered pointer types
   */
  getRegisteredTypes(): string[] {
    const adapterTypes = Array.from(this.adapters.keys());
    const factoryTypes = Array.from(this.adapterFactories.keys());
    return Array.from(new Set([...adapterTypes, ...factoryTypes]));
  }

  /**
   * Clear all registered adapters and factories
   */
  clear(): void {
    this.adapters.clear();
    this.adapterFactories.clear();
  }

  /**
   * Validate a pointer using its appropriate adapter
   */
  validatePointer(pointer: DocumentPointer): boolean {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to validate pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer }
      );
    }
    
    return adapter.validatePointer(pointer);
  }

  /**
   * Serialize a pointer using its appropriate adapter
   */
  serializePointer(pointer: DocumentPointer): Record<string, any> {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to serialize pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer }
      );
    }
    
    return adapter.serializePointer(pointer);
  }

  /**
   * Deserialize pointer data using the appropriate adapter
   */
  deserializePointer(pointerType: string, data: Record<string, any>): DocumentPointer {
    const adapter = this.getAdapter(pointerType);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to deserialize pointer type: ${pointerType}`,
        { pointerType, data }
      );
    }
    
    return adapter.deserializePointer(data);
  }

  /**
   * Highlight a pointer using its appropriate adapter
   */
  highlightPointer(pointer: DocumentPointer, threadId: string): void {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to highlight pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer, threadId }
      );
    }
    
    adapter.highlightPointer(pointer, threadId);
  }

  /**
   * Unhighlight a pointer using its appropriate adapter
   */
  unhighlightPointer(pointer: DocumentPointer): void {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to unhighlight pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer }
      );
    }
    
    adapter.unhighlightPointer(pointer);
  }

  /**
   * Focus at a pointer using its appropriate adapter
   */
  focusAtPointer(pointer: DocumentPointer): void {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to focus pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer }
      );
    }
    
    adapter.focusAtPointer(pointer);
  }

  /**
   * Get content at a pointer using its appropriate adapter
   */
  getContentAtPointer(pointer: DocumentPointer): string | null {
    const adapter = this.getAdapter(pointer.type);
    
    if (!adapter) {
      throw createCommentError(
        CommentErrorType.SERVICE_UNAVAILABLE,
        `No adapter available to get content for pointer type: ${pointer.type}`,
        { pointerType: pointer.type, pointer }
      );
    }
    
    return adapter.getContentAtPointer(pointer);
  }
}

/**
 * Convenience function to get the global registry instance
 */
export const getPointerAdapterRegistry = (): PointerAdapterRegistry => {
  return PointerAdapterRegistry.getInstance();
};