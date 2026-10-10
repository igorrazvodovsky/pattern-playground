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

export interface CommentEvents {
  'comment:created': Comment;
  'comment:updated': Comment;
  'comment:deleted': { id: string; pointer: CommentPointer };
  'thread:deleted': { pointer: CommentPointer; ids: string[] };
  'thread:resolved': { pointer: CommentPointer };
  'thread:unresolved': { pointer: CommentPointer };
  'thread:reanchored': { from: CommentPointer; to: CommentPointer; comments: Comment[] };
  'comments:cleared': Record<string, never>;
}

// The pointers each change touches; null when it touches every pointer.
const AFFECTED: { [K in keyof CommentEvents]: (data: CommentEvents[K]) => CommentPointer[] | null } = {
  'comment:created': comment => [comment.pointer],
  'comment:updated': comment => [comment.pointer],
  'comment:deleted': ({ pointer }) => [pointer],
  'thread:deleted': ({ pointer }) => [pointer],
  'thread:resolved': ({ pointer }) => [pointer],
  'thread:unresolved': ({ pointer }) => [pointer],
  'thread:reanchored': ({ from, to }) => [from, to],
  'comments:cleared': () => null,
};

export class CommentService extends EventEmitter<CommentEvents> {
  constructor(
    private storage: CommentStorage
  ) {
    super();
  }

  /**
   * Runs `handler` after a change to the comments on `pointer`, or to any
   * comment when no pointer is given. Returns an unsubscribe function.
   */
  onChange(handler: () => void, pointer?: CommentPointer): () => void {
    const events = Object.keys(AFFECTED) as Array<keyof CommentEvents>;
    const unsubscribers = events.map(event => this.on(event, (data: CommentEvents[typeof event]) => {
      const affected = (AFFECTED[event] as (data: CommentEvents[typeof event]) => CommentPointer[] | null)(data);
      if (!pointer || !affected || affected.some(each => each.equals(pointer))) handler();
    }));
    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }

  async createComment(
    pointer: CommentPointer,
    content: string,
    authorId: string,
    parentId?: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: `comment-${crypto.randomUUID()}`,
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

  /** A pointer's comments, oldest first. */
  async getComments(pointer: CommentPointer): Promise<Comment[]> {
    const comments = await this.storage.findByPointer(pointer);
    return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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
    const comment = await this.storage.findById(id);
    if (!comment || !(await this.storage.delete(id))) return false;
    this.emit('comment:deleted', { id, pointer: comment.pointer });
    return true;
  }

  /** Deletes every comment on a pointer in one storage write. */
  async deleteThread(pointer: CommentPointer): Promise<string[]> {
    const ids = (await this.storage.findByPointer(pointer)).map(comment => comment.id);
    if (ids.length > 0) {
      await this.storage.deleteMany(ids);
      this.emit('thread:deleted', { pointer, ids });
    }
    return ids;
  }

  async getThread(pointer: CommentPointer): Promise<CommentThread | null> {
    const comments = await this.getComments(pointer);
    if (comments.length === 0) return null;

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
    await this.setResolved(pointer, true);
    this.emit('thread:resolved', { pointer });
    return true;
  }

  async unresolveThread(pointer: CommentPointer): Promise<boolean> {
    await this.setResolved(pointer, false);
    this.emit('thread:unresolved', { pointer });
    return true;
  }

  private async setResolved(pointer: CommentPointer, resolved: boolean): Promise<void> {
    const updatedAt = new Date();
    const comments = (await this.storage.findByPointer(pointer)).map(comment => ({ ...comment, resolved, updatedAt }));
    await this.storage.saveMany(comments);
  }

  /**
   * Moves a whole thread to another pointer, for when the thing commented on
   * changes form, such as a commented passage turned into a quote.
   */
  async reanchor(from: CommentPointer, to: CommentPointer): Promise<Comment[]> {
    const moved = (await this.getComments(from)).map(comment => ({ ...comment, pointer: to }));
    if (moved.length > 0) {
      await this.storage.saveMany(moved);
      this.emit('thread:reanchored', { from, to, comments: moved });
    }
    return moved;
  }

  async reply(parentId: string, content: string, authorId: string): Promise<Comment | null> {
    const parent = await this.storage.findById(parentId);
    if (!parent) return null;

    return this.createComment(parent.pointer, content, authorId, parentId);
  }

  /** Comments for each pointer, keyed by `pointer.serialize()`, so a surface can tell which of its pointers have any. */
  async getCommentsByPointers(pointers: CommentPointer[]): Promise<Map<string, Comment[]>> {
    const results = new Map<string, Comment[]>();

    for (const pointer of pointers) {
      const comments = await this.getComments(pointer);
      results.set(pointer.serialize(), comments);
    }

    return results;
  }

  /** The newest comments across every pointer, newest first. */
  async getRecentComments(limit: number = 10): Promise<Comment[]> {
    return this.storage.getRecent(limit);
  }

  async clearAll(): Promise<void> {
    await this.storage.clear();
    this.emit('comments:cleared', {});
  }
}
