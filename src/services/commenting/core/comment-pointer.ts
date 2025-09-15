// Core pointer abstraction for universal commenting system

export interface PointerContext {
  title: string;
  excerpt?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface CommentPointer {
  readonly id: string;
  readonly type: string;

  serialize(): string;
  equals(other: CommentPointer): boolean;
  getContext(): Promise<PointerContext>;
}

export abstract class BaseCommentPointer implements CommentPointer {
  abstract readonly id: string;
  abstract readonly type: string;
  
  abstract serialize(): string;
  abstract getContext(): Promise<PointerContext>;
  
  equals(other: CommentPointer): boolean {
    return other.type === this.type && other.id === this.id;
  }
}