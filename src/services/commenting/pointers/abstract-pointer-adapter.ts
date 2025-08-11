import type { DocumentPointer } from '../document-pointer.js';
import { CommentErrorType, createCommentError } from '../utils/error-handling.js';

/**
 * Abstract base class for pointer adapters
 * Defines the interface for creating, validating, and manipulating document pointers
 */
export abstract class AbstractPointerAdapter<T extends DocumentPointer> {
  protected readonly documentId: string;
  protected readonly instanceId?: string;

  constructor(documentId: string, instanceId?: string) {
    this.documentId = documentId;
    this.instanceId = instanceId;
  }

  // Abstract methods that must be implemented by concrete adapters

  /**
   * Validate that a pointer is still valid in the current document state
   */
  abstract validatePointer(pointer: T): boolean;

  /**
   * Create a pointer based on current selection/context
   * Returns null if no valid selection exists
   */
  abstract createPointer(): T | null;

  /**
   * Create a pointer for a specific range/location
   */
  abstract createPointerForRange(...args: any[]): T;

  /**
   * Highlight/mark the content referenced by the pointer
   */
  abstract highlightPointer(pointer: T, threadId: string): void;

  /**
   * Remove highlighting from the content referenced by the pointer
   */
  abstract unhighlightPointer(pointer: T): void;

  /**
   * Focus or scroll to the content referenced by the pointer
   */
  abstract focusAtPointer(pointer: T): void;

  /**
   * Get the text content referenced by the pointer
   */
  abstract getContentAtPointer(pointer: T): string | null;

  // Common utility methods with default implementations

  /**
   * Check if there's a valid selection for creating a new pointer
   */
  hasValidSelection(): boolean {
    return this.createPointer() !== null;
  }

  /**
   * Get the current selection information
   * Returns null if no valid selection exists
   */
  getCurrentSelection(): any | null {
    return null; // Override in concrete implementations if needed
  }

  /**
   * Check for overlapping content with existing pointers
   */
  hasOverlappingComments(...args: any[]): boolean {
    return false; // Override in concrete implementations if needed
  }

  /**
   * Serialize pointer for storage
   */
  serializePointer(pointer: T): Record<string, any> {
    return {
      type: pointer.type,
      documentId: pointer.documentId,
      timestamp: pointer.timestamp,
      ...pointer
    };
  }

  /**
   * Deserialize pointer from storage
   */
  abstract deserializePointer(data: Record<string, any>): T;

  /**
   * Get metadata about the pointer's context
   */
  getPointerMetadata(pointer: T): Record<string, any> {
    return {
      documentId: this.documentId,
      instanceId: this.instanceId,
      pointerType: pointer.type,
      isValid: this.validatePointer(pointer)
    };
  }

  /**
   * Compare two pointers for equality
   */
  pointersEqual(pointer1: T, pointer2: T): boolean {
    return (
      pointer1.type === pointer2.type &&
      pointer1.documentId === pointer2.documentId &&
      JSON.stringify(this.serializePointer(pointer1)) === 
      JSON.stringify(this.serializePointer(pointer2))
    );
  }

  /**
   * Validate pointer structure and throw appropriate errors
   */
  protected validatePointerStructure(pointer: T): void {
    if (!pointer) {
      throw createCommentError(
        CommentErrorType.INVALID_POINTER,
        'Pointer is null or undefined',
        { pointer }
      );
    }

    if (!pointer.type) {
      throw createCommentError(
        CommentErrorType.INVALID_POINTER,
        'Pointer must have a type',
        { pointer }
      );
    }

    if (!pointer.documentId) {
      throw createCommentError(
        CommentErrorType.INVALID_POINTER,
        'Pointer must have a document ID',
        { pointer }
      );
    }

    if (pointer.documentId !== this.documentId) {
      throw createCommentError(
        CommentErrorType.INVALID_POINTER,
        'Pointer document ID does not match adapter document ID',
        { 
          pointerDocumentId: pointer.documentId,
          adapterDocumentId: this.documentId,
          pointer 
        }
      );
    }
  }

  /**
   * Handle pointer validation errors consistently
   */
  protected handleValidationError(pointer: T, reason: string): void {
    throw createCommentError(
      CommentErrorType.INVALID_POINTER,
      `Pointer validation failed: ${reason}`,
      { 
        pointer,
        reason,
        documentId: this.documentId,
        instanceId: this.instanceId
      }
    );
  }

  /**
   * Handle selection errors consistently
   */
  protected handleSelectionError(reason: string, context?: Record<string, any>): void {
    throw createCommentError(
      CommentErrorType.INVALID_SELECTION,
      `Selection is invalid: ${reason}`,
      { 
        reason,
        documentId: this.documentId,
        instanceId: this.instanceId,
        ...context
      }
    );
  }
}