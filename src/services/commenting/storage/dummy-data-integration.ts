import type { EntityComment } from '../state/comment-store.js';
import commentsData from '../../../stories/data/comments.json' with { type: 'json' };

// Load existing comments from shared-data - data is already in EntityComment format
export function loadSharedDataComments(): EntityComment[] {
  try {
    // Transform timestamp strings to Date objects
    return commentsData.map(comment => ({
      ...comment,
      timestamp: new Date(comment.timestamp)
    }));
  } catch (error) {
    console.error('Failed to load shared data comments:', error);
    return [];
  }
}

// Group shared data comments by entity for easy integration
export function groupCommentsByEntity(comments: EntityComment[]): Map<string, EntityComment[]> {
  const grouped = new Map<string, EntityComment[]>();

  for (const comment of comments) {
    const entityKey = `${comment.entityType}:${comment.entityId}`;
    const existingComments = grouped.get(entityKey) || [];
    existingComments.push(comment);
    grouped.set(entityKey, existingComments);
  }

  // Sort comments by timestamp within each entity group
  for (const [entityKey, comments] of grouped.entries()) {
    comments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    grouped.set(entityKey, comments);
  }

  return grouped;
}

// Integration function to merge shared data comments into the universal store
export function integrateSharedDataComments() {
  const sharedComments = loadSharedDataComments();
  const groupedComments = groupCommentsByEntity(sharedComments);

  // Import store here to avoid circular dependencies
  import('../state/comment-store.js').then(({ useCommentStore }) => {
    const state = useCommentStore.getState();

    // Merge with existing comments in store
    const newCommentsByEntity = new Map(state.commentsByEntity);

    for (const [entityKey, comments] of groupedComments.entries()) {
      const existingComments = newCommentsByEntity.get(entityKey) || [];

      // Filter out comments that already exist (by ID)
      const existingIds = new Set(existingComments.map(c => c.id));
      const newComments = comments.filter(c => !existingIds.has(c.id));

      if (newComments.length > 0) {
        newCommentsByEntity.set(entityKey, [...existingComments, ...newComments]);
      }
    }

    // Update the store with merged data
    useCommentStore.setState({
      commentsByEntity: newCommentsByEntity,
      hasUnsavedChanges: false, // This is initial data, not a user change
      lastSavedTimestamp: Date.now()
    });

    console.log(`Integrated ${sharedComments.length} comments from shared data into universal comment store`);
  });
}

// Get comment statistics from shared data
export function getSharedDataStats() {
  const comments = loadSharedDataComments();
  const entityTypes = new Set<string>();
  const entities = new Set<string>();
  let activeComments = 0;
  let resolvedComments = 0;

  for (const comment of comments) {
    entityTypes.add(comment.entityType);
    entities.add(`${comment.entityType}:${comment.entityId}`);

    if (comment.status === 'active') {
      activeComments++;
    } else if (comment.status === 'resolved') {
      resolvedComments++;
    }
  }

  return {
    totalComments: comments.length,
    activeComments,
    resolvedComments,
    entityTypes: Array.from(entityTypes),
    totalEntities: entities.size
  };
}