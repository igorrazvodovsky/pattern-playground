import type { CommentStorage } from './comment-storage';
import type { Comment } from './comment-service';
import type { CommentPointer } from './comment-pointer';

export class LocalCommentStorage implements CommentStorage {
  private comments: Map<string, Comment> = new Map();
  private pointerIndex: Map<string, Set<string>> = new Map(); // pointer.serialize() -> comment ids
  private authorIndex: Map<string, Set<string>> = new Map(); // authorId -> comment ids
  
  constructor(private readonly storageKey: string = 'universal-comments') {
    this.loadFromLocalStorage();
  }
  
  async save(comment: Comment): Promise<void> {
    this.comments.set(comment.id, comment);
    
    // Update pointer index
    const pointerKey = comment.pointer.serialize();
    if (!this.pointerIndex.has(pointerKey)) {
      this.pointerIndex.set(pointerKey, new Set());
    }
    this.pointerIndex.get(pointerKey)!.add(comment.id);
    
    // Update author index
    if (!this.authorIndex.has(comment.authorId)) {
      this.authorIndex.set(comment.authorId, new Set());
    }
    this.authorIndex.get(comment.authorId)!.add(comment.id);
    
    this.persistToLocalStorage();
  }
  
  async findById(id: string): Promise<Comment | null> {
    return this.comments.get(id) || null;
  }
  
  async findByPointer(pointer: CommentPointer): Promise<Comment[]> {
    const pointerKey = pointer.serialize();
    const commentIds = this.pointerIndex.get(pointerKey);
    
    if (!commentIds) return [];
    
    const comments: Comment[] = [];
    for (const id of commentIds) {
      const comment = this.comments.get(id);
      if (comment) {
        comments.push(comment);
      }
    }
    
    return comments;
  }
  
  async findByAuthor(authorId: string): Promise<Comment[]> {
    const commentIds = this.authorIndex.get(authorId);
    
    if (!commentIds) return [];
    
    const comments: Comment[] = [];
    for (const id of commentIds) {
      const comment = this.comments.get(id);
      if (comment) {
        comments.push(comment);
      }
    }
    
    return comments;
  }
  
  async delete(id: string): Promise<boolean> {
    const comment = this.comments.get(id);
    if (!comment) return false;
    
    // Remove from main storage
    this.comments.delete(id);
    
    // Remove from pointer index
    const pointerKey = comment.pointer.serialize();
    const pointerIds = this.pointerIndex.get(pointerKey);
    if (pointerIds) {
      pointerIds.delete(id);
      if (pointerIds.size === 0) {
        this.pointerIndex.delete(pointerKey);
      }
    }
    
    // Remove from author index
    const authorIds = this.authorIndex.get(comment.authorId);
    if (authorIds) {
      authorIds.delete(id);
      if (authorIds.size === 0) {
        this.authorIndex.delete(comment.authorId);
      }
    }
    
    this.persistToLocalStorage();
    return true;
  }
  
  async search(query: string): Promise<Comment[]> {
    const lowerQuery = query.toLowerCase();
    const results: Comment[] = [];
    
    for (const comment of this.comments.values()) {
      if (comment.content.toLowerCase().includes(lowerQuery)) {
        results.push(comment);
      }
    }
    
    return results;
  }
  
  async getRecent(limit: number): Promise<Comment[]> {
    const allComments = Array.from(this.comments.values());
    
    // Sort by creation date (newest first)
    allComments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allComments.slice(0, limit);
  }
  
  async clear(): Promise<void> {
    this.comments.clear();
    this.pointerIndex.clear();
    this.authorIndex.clear();
    this.persistToLocalStorage();
  }
  
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // Restore comments with Date objects
      if (data.comments) {
        for (const [id, comment] of Object.entries(data.comments)) {
          const restoredComment = comment as Comment;
          restoredComment.createdAt = new Date(restoredComment.createdAt);
          if (restoredComment.updatedAt) {
            restoredComment.updatedAt = new Date(restoredComment.updatedAt);
          }
          this.comments.set(id, restoredComment);
        }
      }
      
      // Restore pointer index
      if (data.pointerIndex) {
        for (const [key, ids] of Object.entries(data.pointerIndex)) {
          this.pointerIndex.set(key, new Set(ids as string[]));
        }
      }
      
      // Restore author index
      if (data.authorIndex) {
        for (const [key, ids] of Object.entries(data.authorIndex)) {
          this.authorIndex.set(key, new Set(ids as string[]));
        }
      }
    } catch (error) {
      console.error('Failed to load comments from localStorage:', error);
    }
  }
  
  private persistToLocalStorage(): void {
    try {
      const data = {
        comments: Object.fromEntries(this.comments),
        pointerIndex: Object.fromEntries(
          Array.from(this.pointerIndex.entries()).map(([key, ids]) => [key, Array.from(ids)])
        ),
        authorIndex: Object.fromEntries(
          Array.from(this.authorIndex.entries()).map(([key, ids]) => [key, Array.from(ids)])
        )
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist comments to localStorage:', error);
    }
  }
}