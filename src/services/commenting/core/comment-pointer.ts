// Core pointer abstraction for universal commenting system

export interface PointerContext {
  title: string;        // What is being commented on
  excerpt?: string;     // Preview of the content
  location?: string;    // Where in the document/app
  metadata?: Record<string, unknown>;
}

export interface CommentPointer {
  // Unique identifier for this pointer
  readonly id: string;
  
  // Type discrimination for pointer handling
  readonly type: string;
  
  // Serialize for storage/transmission
  serialize(): string;
  
  // Check equality with another pointer
  equals(other: CommentPointer): boolean;
  
  // Get human-readable context for this pointer
  getContext(): Promise<PointerContext>;
}

// Base implementation for common pointer functionality
export abstract class BaseCommentPointer implements CommentPointer {
  abstract readonly id: string;
  abstract readonly type: string;
  
  abstract serialize(): string;
  abstract getContext(): Promise<PointerContext>;
  
  equals(other: CommentPointer): boolean {
    return other.type === this.type && other.id === this.id;
  }
}