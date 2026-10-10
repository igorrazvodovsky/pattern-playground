import type { Comment } from './comment-service';
import type { CommentPointer } from './comment-pointer';

export interface CommentStorage {
  save(comment: Comment): Promise<void>;
  /** Saves several comments as one write, such as a thread moving to another pointer. */
  saveMany(comments: Comment[]): Promise<void>;
  findById(id: string): Promise<Comment | null>;
  findByPointer(pointer: CommentPointer): Promise<Comment[]>;
  delete(id: string): Promise<boolean>;
  /** Deletes several comments as one write, such as a whole thread. */
  deleteMany(ids: string[]): Promise<void>;
  getRecent(limit: number): Promise<Comment[]>;
  clear(): Promise<void>;
}
