import type { CommentPointer } from './comment-pointer';
import type { CommentStorage } from './comment-storage';
import { EventEmitter } from './event-emitter';

export interface Comment {
  id: string;
  pointer: CommentPointer;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
  parentId?: string;  // For threading
  resolved?: boolean;
}

export interface CommentThread {
  id: string;
  pointer: CommentPointer;
  comments: Comment[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentService extends EventEmitter {
  constructor(
    private storage: CommentStorage
  ) {
    super();
  }
  
  // Core operations
  async createComment(
    pointer: CommentPointer, 
    content: string, 
    authorId: string,
    parentId?: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: this.generateId(),
      pointer,
      content,
      authorId,
      parentId,
      createdAt: new Date(),
      resolved: false
    };
    
    await this.storage.save(comment);
    this.emit('comment:created', comment);
    return comment;
  }
  
  async getComments(pointer: CommentPointer): Promise<Comment[]> {
    return this.storage.findByPointer(pointer);
  }
  
  async getComment(id: string): Promise<Comment | null> {
    return this.storage.findById(id);
  }
  
  async updateComment(id: string, content: string): Promise<Comment | null> {
    const comment = await this.storage.findById(id);
    if (!comment) return null;
    
    const updated = {
      ...comment,
      content,
      updatedAt: new Date()
    };
    
    await this.storage.save(updated);
    this.emit('comment:updated', updated);
    return updated;
  }
  
  async deleteComment(id: string): Promise<boolean> {
    const success = await this.storage.delete(id);
    if (success) {
      this.emit('comment:deleted', { id });
    }
    return success;
  }
  
  // Thread operations
  async getThread(pointer: CommentPointer): Promise<CommentThread | null> {
    const comments = await this.getComments(pointer);
    if (comments.length === 0) return null;
    
    // Sort comments by creation date
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    const resolved = comments.every(c => c.resolved);
    const createdAt = comments[0].createdAt;
    const updatedAt = comments.reduce((latest, c) => 
      (c.updatedAt || c.createdAt) > latest ? (c.updatedAt || c.createdAt) : latest, 
      createdAt
    );
    
    return {
      id: `thread-${pointer.id}`,
      pointer,
      comments,
      resolved,
      createdAt,
      updatedAt
    };
  }
  
  async resolveThread(pointer: CommentPointer): Promise<boolean> {
    const comments = await this.getComments(pointer);
    
    for (const comment of comments) {
      comment.resolved = true;
      comment.updatedAt = new Date();
      await this.storage.save(comment);
    }
    
    this.emit('thread:resolved', { pointer });
    return true;
  }
  
  async unresolveThread(pointer: CommentPointer): Promise<boolean> {
    const comments = await this.getComments(pointer);
    
    for (const comment of comments) {
      comment.resolved = false;
      comment.updatedAt = new Date();
      await this.storage.save(comment);
    }
    
    this.emit('thread:unresolved', { pointer });
    return true;
  }
  
  // Reply operations
  async reply(parentId: string, content: string, authorId: string): Promise<Comment | null> {
    const parent = await this.storage.findById(parentId);
    if (!parent) return null;
    
    return this.createComment(parent.pointer, content, authorId, parentId);
  }
  
  // Batch operations
  async getCommentsByPointers(pointers: CommentPointer[]): Promise<Map<string, Comment[]>> {
    const results = new Map<string, Comment[]>();
    
    for (const pointer of pointers) {
      const comments = await this.getComments(pointer);
      results.set(pointer.serialize(), comments);
    }
    
    return results;
  }
  
  async getThreadsByPointers(pointers: CommentPointer[]): Promise<Map<string, CommentThread | null>> {
    const results = new Map<string, CommentThread | null>();
    
    for (const pointer of pointers) {
      const thread = await this.getThread(pointer);
      results.set(pointer.serialize(), thread);
    }
    
    return results;
  }
  
  // Search operations
  async searchComments(query: string): Promise<Comment[]> {
    return this.storage.search(query);
  }
  
  async getCommentsByAuthor(authorId: string): Promise<Comment[]> {
    return this.storage.findByAuthor(authorId);
  }
  
  async getRecentComments(limit: number = 10): Promise<Comment[]> {
    return this.storage.getRecent(limit);
  }
  
  // Utility methods
  private generateId(): string {
    return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}