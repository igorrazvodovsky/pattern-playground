import type { CommentStorage } from './comment-storage';
import type { Comment } from './comment-service';
import type { CommentPointer } from './comment-pointer';

// JSON keeps a pointer's fields but not its methods. A restored pointer
// serialises to the key it was stored under, so it can be found, moved and
// deleted like one made in this session.
function restorePointer(key: string, stored: CommentPointer): CommentPointer {
  return {
    ...stored,
    serialize: () => key,
    equals: (other) => other.serialize() === key,
    getContext: async () => ({ title: stored.type }),
  };
}

export class LocalCommentStorage implements CommentStorage {
  private comments: Map<string, Comment> = new Map();
  private pointerIndex: Map<string, Set<string>> = new Map();

  constructor(private readonly storageKey: string = 'universal-comments') {
    this.loadFromLocalStorage();
  }

  async save(comment: Comment): Promise<void> {
    this.index(comment);
    this.persistToLocalStorage();
  }

  async saveMany(comments: Comment[]): Promise<void> {
    for (const comment of comments) this.index(comment);
    this.persistToLocalStorage();
  }

  // A comment saved under a new pointer leaves its old pointer's index.
  private index(comment: Comment): void {
    const previous = this.comments.get(comment.id);
    const pointerKey = comment.pointer.serialize();
    if (previous) this.unindexPointer(previous.pointer.serialize(), comment.id);

    this.comments.set(comment.id, comment);

    if (!this.pointerIndex.has(pointerKey)) {
      this.pointerIndex.set(pointerKey, new Set());
    }
    this.pointerIndex.get(pointerKey)!.add(comment.id);
  }

  private unindexPointer(pointerKey: string, id: string): void {
    const ids = this.pointerIndex.get(pointerKey);
    ids?.delete(id);
    if (ids?.size === 0) this.pointerIndex.delete(pointerKey);
  }

  // Removes a comment from memory without writing; callers persist once.
  private remove(id: string): boolean {
    const comment = this.comments.get(id);
    if (!comment) return false;
    this.comments.delete(id);
    this.unindexPointer(comment.pointer.serialize(), id);
    return true;
  }

  async findById(id: string): Promise<Comment | null> {
    return this.comments.get(id) || null;
  }

  async findByPointer(pointer: CommentPointer): Promise<Comment[]> {
    const commentIds = this.pointerIndex.get(pointer.serialize()) ?? [];
    return [...commentIds].flatMap(id => this.comments.get(id) ?? []);
  }

  async delete(id: string): Promise<boolean> {
    if (!this.remove(id)) return false;
    this.persistToLocalStorage();
    return true;
  }

  async deleteMany(ids: string[]): Promise<void> {
    for (const id of ids) this.remove(id);
    this.persistToLocalStorage();
  }

  async getRecent(limit: number): Promise<Comment[]> {
    return [...this.comments.values()]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async clear(): Promise<void> {
    this.comments.clear();
    this.pointerIndex.clear();
    this.persistToLocalStorage();
  }

  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);

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

      if (data.pointerIndex) {
        for (const [key, ids] of Object.entries(data.pointerIndex)) {
          this.pointerIndex.set(key, new Set(ids as string[]));
          for (const id of ids as string[]) {
            const comment = this.comments.get(id);
            if (comment) comment.pointer = restorePointer(key, comment.pointer);
          }
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
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist comments to localStorage:', error);
    }
  }
}
