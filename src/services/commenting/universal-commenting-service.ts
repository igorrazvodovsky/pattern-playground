import type {
  EntityComment,
  EntityCommentThread,
  RichContent
} from './state/comment-store.js';
import { useCommentStore } from './state/comment-store.js';

// Type for the Zustand store state and actions
type CommentStoreState = ReturnType<typeof useCommentStore>;

// Universal commenting service with entity-agnostic approach
export class UniversalCommentingService {
  private getState: () => CommentStoreState;

  constructor(getState: () => CommentStoreState) {
    this.getState = getState;
  }

  // Core operations
  addComment(entityType: string, entityId: string, content: RichContent | string, authorId: string): EntityComment {
    return this.getState().actions.addComment(entityType, entityId, {
      content,
      authorId,
      status: 'active'
    });
  }

  getCommentsForEntity(entityType: string, entityId: string): EntityComment[] {
    return this.getState().actions.getComments(entityType, entityId);
  }

  resolveComment(commentId: string): void {
    this.getState().actions.resolveComment(commentId);
  }

  deleteComment(commentId: string): boolean {
    try {
      this.getState().actions.deleteComment(commentId);
      return true;
    } catch {
      return false;
    }
  }

  // Thread-like operations (comments grouped by entity)
  getCommentThread(entityType: string, entityId: string): EntityCommentThread | null {
    return this.getState().actions.getCommentThread(entityType, entityId);
  }

  getActiveCommentCount(entityType: string, entityId: string): number {
    return this.getState().actions.getActiveCommentCount(entityType, entityId);
  }

  getResolvedCommentCount(entityType: string, entityId: string): number {
    return this.getState().actions.getResolvedCommentCount(entityType, entityId);
  }

  // Search and filtering
  searchComments(query: string, entityType?: string): EntityComment[] {
    return this.getState().actions.searchComments(query, entityType);
  }

  getCommentsByAuthor(authorId: string): EntityComment[] {
    return this.getState().actions.getCommentsByAuthor(authorId);
  }

  getRecentComments(limit?: number): EntityComment[] {
    return this.getState().actions.getRecentComments(limit);
  }

  // Additional utility methods
  hasCommentsForEntity(entityType: string, entityId: string): boolean {
    return this.getCommentsForEntity(entityType, entityId).length > 0;
  }

  getCommentsByStatus(entityType: string, entityId: string, status: 'active' | 'resolved'): EntityComment[] {
    return this.getCommentsForEntity(entityType, entityId).filter(comment => comment.status === status);
  }

  // Get all entity types that have comments
  getEntityTypesWithComments(): string[] {
    const state = this.getState();
    const entityTypes = new Set<string>();
    
    for (const [entityKey] of state.commentsByEntity) {
      const [entityType] = entityKey.split(':');
      entityTypes.add(entityType);
    }
    
    return Array.from(entityTypes);
  }

  // Get all entities of a specific type that have comments
  getEntitiesWithComments(entityType: string): string[] {
    const state = this.getState();
    const entityIds = new Set<string>();
    
    for (const [entityKey] of state.commentsByEntity) {
      const [keyEntityType, entityId] = entityKey.split(':');
      if (keyEntityType === entityType) {
        entityIds.add(entityId);
      }
    }
    
    return Array.from(entityIds);
  }

  // Get statistics about comments
  getCommentStats() {
    const state = this.getState();
    let totalComments = 0;
    let activeComments = 0;
    let resolvedComments = 0;
    const entityTypes = new Set<string>();
    const authors = new Set<string>();

    for (const [entityKey, comments] of state.commentsByEntity) {
      const [entityType] = entityKey.split(':');
      entityTypes.add(entityType);
      
      for (const comment of comments) {
        totalComments++;
        authors.add(comment.authorId);
        
        if (comment.status === 'active') {
          activeComments++;
        } else if (comment.status === 'resolved') {
          resolvedComments++;
        }
      }
    }

    return {
      totalComments,
      activeComments,
      resolvedComments,
      totalEntityTypes: entityTypes.size,
      totalEntities: state.commentsByEntity.size,
      totalAuthors: authors.size
    };
  }
}