import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Entity-agnostic comment interface aligned with the universal commenting plan
export interface EntityComment {
  id: string;
  entityType: string; // 'quote', 'document', 'task', etc.
  entityId: string;
  content: RichContent | string;
  authorId: string;
  timestamp: Date;
  status: 'active' | 'resolved';
  replyTo?: string | null;
  metadata?: Record<string, unknown>; // For additional data like selection ranges, etc.
}

// Rich content type for comment content
export interface RichContent {
  type: 'rich';
  content: unknown; // TipTap JSON or other rich content format
}

// Entity comment thread for grouping comments by entity
export interface EntityCommentThread {
  entityType: string;
  entityId: string;
  comments: EntityComment[];
  participants: string[];
  status: 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

// Universal commenting state with entity-agnostic approach
interface UniversalCommentingState {
  // Key format: `${entityType}:${entityId}`
  commentsByEntity: Map<string, EntityComment[]>;
  
  // UI state
  activeEntity: { type: string; id: string } | null;
  panelVisible: boolean;
  draftComment?: {
    entityType: string;
    entityId: string;
    content: string;
    tempId: string;
  };
  
  // Local persistence state
  lastSavedTimestamp: number;
  hasUnsavedChanges: boolean;
}

interface CommentActions {
  // Universal entity commenting
  addComment: (entityType: string, entityId: string, comment: Omit<EntityComment, 'id' | 'timestamp'>) => EntityComment;
  getComments: (entityType: string, entityId: string) => EntityComment[];
  resolveComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  setActiveEntity: (entityType: string, entityId: string) => void;
  
  // Draft management
  setDraftComment: (draft?: { entityType: string; entityId: string; content: string; tempId: string }) => void;
  
  // UI state
  togglePanel: () => void;
  
  // Thread-like operations
  getCommentThread: (entityType: string, entityId: string) => EntityCommentThread | null;
  getActiveCommentCount: (entityType: string, entityId: string) => number;
  getResolvedCommentCount: (entityType: string, entityId: string) => number;
  
  // Search and filtering
  searchComments: (query: string, entityType?: string) => EntityComment[];
  getCommentsByAuthor: (authorId: string) => EntityComment[];
  getRecentComments: (limit?: number) => EntityComment[];
  
  // Clear all data
  clearAllData: () => void;
}

// Generate unique IDs
const generateId = (prefix: string): string => 
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

// Create entity key
const createEntityKey = (entityType: string, entityId: string): string => 
  `${entityType}:${entityId}`;

export const useCommentStore = create<UniversalCommentingState & {
  actions: CommentActions;
}>()(
  persist(
    (set, get) => ({
      commentsByEntity: new Map(),
      activeEntity: null,
      panelVisible: false,
      lastSavedTimestamp: 0,
      hasUnsavedChanges: false,
      
      actions: {
        addComment: (entityType, entityId, commentData) => {
          const commentId = generateId('comment');
          const entityKey = createEntityKey(entityType, entityId);
          
          const comment: EntityComment = {
            ...commentData,
            id: commentId,
            entityType,
            entityId,
            timestamp: new Date()
          };

          set(state => {
            const newCommentsByEntity = new Map(state.commentsByEntity);
            const existingComments = newCommentsByEntity.get(entityKey) || [];
            newCommentsByEntity.set(entityKey, [...existingComments, comment]);
            
            return {
              commentsByEntity: newCommentsByEntity,
              hasUnsavedChanges: true
            };
          });

          return comment;
        },
        
        getComments: (entityType, entityId) => {
          const entityKey = createEntityKey(entityType, entityId);
          const state = get();
          const comments = state.commentsByEntity.get(entityKey) || [];
          
          console.log(`CommentStore.getComments - Key: "${entityKey}", Found: ${comments.length} comments`);
          console.log('CommentStore - All entity keys:', Array.from(state.commentsByEntity.keys()));
          if (entityKey.includes('habitats')) {
            console.log('CommentStore - Habitat comments debug:', comments);
          }
          
          return comments;
        },
        
        resolveComment: (commentId) => {
          set(state => {
            const newCommentsByEntity = new Map(state.commentsByEntity);
            
            // Find and update the comment across all entities
            for (const [entityKey, comments] of newCommentsByEntity.entries()) {
              const updatedComments = comments.map(comment => 
                comment.id === commentId 
                  ? { ...comment, status: 'resolved' as const }
                  : comment
              );
              
              if (updatedComments !== comments) {
                newCommentsByEntity.set(entityKey, updatedComments);
                break;
              }
            }
            
            return {
              commentsByEntity: newCommentsByEntity,
              hasUnsavedChanges: true
            };
          });
        },
        
        deleteComment: (commentId) => {
          set(state => {
            const newCommentsByEntity = new Map(state.commentsByEntity);
            
            // Find and remove the comment across all entities
            for (const [entityKey, comments] of newCommentsByEntity.entries()) {
              const filteredComments = comments.filter(comment => comment.id !== commentId);
              
              if (filteredComments.length !== comments.length) {
                newCommentsByEntity.set(entityKey, filteredComments);
                break;
              }
            }
            
            return {
              commentsByEntity: newCommentsByEntity,
              hasUnsavedChanges: true
            };
          });
        },
        
        setActiveEntity: (entityType, entityId) => {
          set({ activeEntity: { type: entityType, id: entityId } });
        },
        
        setDraftComment: (draft) => set({ draftComment: draft }),
        
        togglePanel: () => set(state => ({ panelVisible: !state.panelVisible })),
        
        getCommentThread: (entityType, entityId) => {
          const comments = get().actions.getComments(entityType, entityId);
          if (comments.length === 0) return null;
          
          const participants = Array.from(new Set(comments.map(c => c.authorId)));
          const hasActiveComments = comments.some(c => c.status === 'active');
          const createdAt = comments.reduce((earliest, comment) => 
            comment.timestamp < earliest ? comment.timestamp : earliest, 
            comments[0].timestamp
          );
          const updatedAt = comments.reduce((latest, comment) => 
            comment.timestamp > latest ? comment.timestamp : latest, 
            comments[0].timestamp
          );
          
          return {
            entityType,
            entityId,
            comments,
            participants,
            status: hasActiveComments ? 'active' as const : 'resolved' as const,
            createdAt,
            updatedAt
          };
        },
        
        getActiveCommentCount: (entityType, entityId) => {
          const comments = get().actions.getComments(entityType, entityId);
          return comments.filter(c => c.status === 'active').length;
        },
        
        getResolvedCommentCount: (entityType, entityId) => {
          const comments = get().actions.getComments(entityType, entityId);
          return comments.filter(c => c.status === 'resolved').length;
        },
        
        searchComments: (query, entityType) => {
          const allComments: EntityComment[] = [];
          const lowerQuery = query.toLowerCase();
          
          for (const [entityKey, comments] of get().commentsByEntity.entries()) {
            const [keyEntityType] = entityKey.split(':');
            
            if (entityType && keyEntityType !== entityType) continue;
            
            const matchingComments = comments.filter(comment => {
              const contentStr = typeof comment.content === 'string' 
                ? comment.content 
                : JSON.stringify(comment.content);
              return contentStr.toLowerCase().includes(lowerQuery) ||
                     comment.authorId.toLowerCase().includes(lowerQuery);
            });
            
            allComments.push(...matchingComments);
          }
          
          return allComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        },
        
        getCommentsByAuthor: (authorId) => {
          const allComments: EntityComment[] = [];
          
          for (const comments of get().commentsByEntity.values()) {
            const authorComments = comments.filter(comment => comment.authorId === authorId);
            allComments.push(...authorComments);
          }
          
          return allComments.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        },
        
        getRecentComments: (limit = 10) => {
          const allComments: EntityComment[] = [];
          
          for (const comments of get().commentsByEntity.values()) {
            allComments.push(...comments);
          }
          
          return allComments
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
        },
        
        clearAllData: () => {
          set({
            commentsByEntity: new Map(),
            activeEntity: null,
            draftComment: undefined,
            panelVisible: false,
            lastSavedTimestamp: 0,
            hasUnsavedChanges: false
          });
        }
      }
    }),
    {
      name: 'universal-comment-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        commentsByEntity: Array.from(state.commentsByEntity.entries()),
        lastSavedTimestamp: state.lastSavedTimestamp
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            // Safely convert arrays back to Maps with validation
            const commentsByEntity = Array.isArray(state.commentsByEntity) 
              ? state.commentsByEntity 
              : [];
            
            state.commentsByEntity = new Map(commentsByEntity.map(([key, comments]) => [
              key, 
              Array.isArray(comments) ? comments.map(c => ({
                ...c,
                timestamp: new Date(c.timestamp) // Ensure Date objects are restored
              })) : []
            ]));
          } catch (error) {
            console.error('Failed to rehydrate universal comment store:', error);
            // Reset to empty state on corruption
            state.commentsByEntity = new Map();
            state.lastSavedTimestamp = 0;
            state.hasUnsavedChanges = false;
          }
        }
      }
    }
  )
);