import type { Comment } from './comment-service.js';
import type { CommentPointer } from './comment-pointer.js';

export interface CommentStorage {
  save(comment: Comment): Promise<void>;
  /** Saves several comments as one write, such as a thread moving to another pointer. */
  saveMany(comments: Comment[]): Promise<void>;
  findById(id: string): Promise<Comment | null>;
  findByPointer(pointer: CommentPointer): Promise<Comment[]>;
  findByAuthor(authorId: string): Promise<Comment[]>;
  delete(id: string): Promise<boolean>;
  search(query: string): Promise<Comment[]>;
  getRecent(limit: number): Promise<Comment[]>;
  clear(): Promise<void>;
}