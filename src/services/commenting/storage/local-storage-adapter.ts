import type { EntityComment } from '../state/comment-store.js';

const STORAGE_KEY = 'universal-comments';
const STORAGE_VERSION = '1.0';

// Storage format for local storage
interface CommentStorage {
  version: string;
  timestamp: number;
  commentsByEntity: [string, EntityComment[]][];
}

// Serialize comment data for localStorage
export function serializeComments(commentsByEntity: Map<string, EntityComment[]>): string {
  const storage: CommentStorage = {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    commentsByEntity: Array.from(commentsByEntity.entries())
  };
  
  return JSON.stringify(storage, (key, value) => {
    // Convert Date objects to ISO strings for serialization
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  });
}

// Deserialize comment data from localStorage
export function deserializeComments(serialized: string): Map<string, EntityComment[]> | null {
  try {
    const parsed = JSON.parse(serialized) as CommentStorage;
    
    // Version check for future compatibility
    if (parsed.version !== STORAGE_VERSION) {
      console.warn(`Comment storage version mismatch. Expected ${STORAGE_VERSION}, got ${parsed.version}`);
      return null;
    }
    
    // Restore Date objects and validate data
    const commentsByEntity = new Map<string, EntityComment[]>();
    
    for (const [entityKey, comments] of parsed.commentsByEntity) {
      if (typeof entityKey !== 'string' || !Array.isArray(comments)) {
        console.warn('Invalid comment data structure, skipping entity:', entityKey);
        continue;
      }
      
      const validComments = comments
        .filter(comment => isValidComment(comment))
        .map(comment => ({
          ...comment,
          timestamp: new Date(comment.timestamp)
        }));
      
      if (validComments.length > 0) {
        commentsByEntity.set(entityKey, validComments);
      }
    }
    
    return commentsByEntity;
  } catch (error) {
    console.error('Failed to deserialize comments from localStorage:', error);
    return null;
  }
}

// Validate comment structure
function isValidComment(comment: any): comment is EntityComment {
  return (
    typeof comment === 'object' &&
    typeof comment.id === 'string' &&
    typeof comment.entityType === 'string' &&
    typeof comment.entityId === 'string' &&
    typeof comment.authorId === 'string' &&
    (typeof comment.content === 'string' || (typeof comment.content === 'object' && comment.content?.type === 'rich')) &&
    (comment.status === 'active' || comment.status === 'resolved') &&
    (comment.timestamp instanceof Date || typeof comment.timestamp === 'string')
  );
}

// Save comments to localStorage
export function saveCommentsToLocalStorage(commentsByEntity: Map<string, EntityComment[]>): boolean {
  try {
    const serialized = serializeComments(commentsByEntity);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    console.error('Failed to save comments to localStorage:', error);
    
    // Handle quota exceeded error
    if (error instanceof DOMException && error.code === 22) {
      console.warn('localStorage quota exceeded. Attempting cleanup...');
      return performCleanupAndRetry(commentsByEntity);
    }
    
    return false;
  }
}

// Load comments from localStorage
export function loadCommentsFromLocalStorage(): Map<string, EntityComment[]> | null {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    if (!serialized) {
      return null; // No data in localStorage
    }
    
    return deserializeComments(serialized);
  } catch (error) {
    console.error('Failed to load comments from localStorage:', error);
    return null;
  }
}

// Clean up old comments and retry saving
function performCleanupAndRetry(commentsByEntity: Map<string, EntityComment[]>): boolean {
  try {
    // Keep only the most recent 100 comments per entity to manage storage size
    const cleanedComments = new Map<string, EntityComment[]>();
    
    for (const [entityKey, comments] of commentsByEntity.entries()) {
      const sortedComments = [...comments].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      cleanedComments.set(entityKey, sortedComments.slice(0, 100));
    }
    
    const serialized = serializeComments(cleanedComments);
    localStorage.setItem(STORAGE_KEY, serialized);
    
    console.log('Successfully saved comments after cleanup');
    return true;
  } catch (error) {
    console.error('Failed to save comments even after cleanup:', error);
    return false;
  }
}

// Clear all comment data from localStorage
export function clearCommentsFromLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear comments from localStorage:', error);
  }
}

// Get storage usage information
export function getStorageInfo(): { hasData: boolean; size: number; timestamp?: number } {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    
    if (!serialized) {
      return { hasData: false, size: 0 };
    }
    
    const parsed = JSON.parse(serialized) as CommentStorage;
    
    return {
      hasData: true,
      size: new Blob([serialized]).size,
      timestamp: parsed.timestamp
    };
  } catch (error) {
    console.error('Failed to get storage info:', error);
    return { hasData: false, size: 0 };
  }
}

// Merge comments from localStorage with shared data
export function mergeWithSharedData(
  localComments: Map<string, EntityComment[]>,
  sharedComments: Map<string, EntityComment[]>
): Map<string, EntityComment[]> {
  const merged = new Map<string, EntityComment[]>();
  
  // Start with shared data as the base
  for (const [entityKey, comments] of sharedComments.entries()) {
    merged.set(entityKey, [...comments]);
  }
  
  // Add local comments, avoiding duplicates
  for (const [entityKey, localEntityComments] of localComments.entries()) {
    const existingComments = merged.get(entityKey) || [];
    const existingIds = new Set(existingComments.map(c => c.id));
    
    const newComments = localEntityComments.filter(c => !existingIds.has(c.id));
    
    if (newComments.length > 0) {
      const allComments = [...existingComments, ...newComments];
      // Sort by timestamp
      allComments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      merged.set(entityKey, allComments);
    }
  }
  
  return merged;
}