import { getCommentService } from '../core/comment-service-instance';
import { EntityPointer } from '../core/entity-pointer';

// Seed threads on quotes, documents and tasks.
const MOCK_THREADS = [
  {
    entityType: 'quote',
    entityId: 'quote-reshaping-ecosystems',
    comments: [
      {
        content: 'This quote perfectly captures the urgency of climate action. The pace of change is unprecedented.',
        authorId: 'user-1',
        timestamp: '2024-01-16T10:00:00Z'
      },
      {
        content: 'We should reference this in our biodiversity impact assessment. The ecosystem displacement data supports this.',
        authorId: 'user-5',
        timestamp: '2024-01-16T11:30:00Z'
      }
    ]
  },
  {
    entityType: 'quote',
    entityId: 'quote-habitat-displacement',
    comments: [
      {
        content: 'The Arctic species migration patterns are particularly concerning. We\'re seeing unprecedented northward movement.',
        authorId: 'user-3',
        timestamp: '2024-01-17T09:15:00Z'
      }
    ]
  },
  {
    entityType: 'quote',
    entityId: 'quote-coral-reef-crisis',
    comments: [
      {
        content: 'The Great Barrier Reef has already lost 50% of its coral cover. This needs immediate attention in our marine conservation strategy.',
        authorId: 'user-2',
        timestamp: '2024-01-18T14:20:00Z'
      },
      {
        content: 'We should coordinate with the marine biology team on restoration efforts. Temperature monitoring is critical.',
        authorId: 'user-4',
        timestamp: '2024-01-18T15:45:00Z'
      }
    ]
  },
  {
    entityType: 'document',
    entityId: 'doc-climate-change',
    comments: [
      {
        content: 'This document needs to incorporate the latest IPCC findings from 2024.',
        authorId: 'user-1',
        timestamp: '2024-01-15T08:00:00Z'
      }
    ]
  },
  {
    entityType: 'task',
    entityId: 'task-1',
    comments: [
      {
        content: 'Let\'s prioritize the carbon emissions data collection first.',
        authorId: 'user-2',
        timestamp: '2024-01-19T10:00:00Z'
      }
    ]
  }
];

/**
 * Initialize mock comments in the comment service
 * This function checks if comments already exist to avoid duplicates
 */
export async function initializeMockComments(): Promise<void> {
  const commentService = getCommentService();
  
  // Check if we already have comments (to avoid re-initializing)
  const storageKey = 'mock-comments-initialized';
  if (localStorage.getItem(storageKey) === 'true') {
    return;
  }
  
  try {
    for (const thread of MOCK_THREADS) {
      const pointer = new EntityPointer(thread.entityType, thread.entityId);
      for (const comment of thread.comments) {
        await commentService.createComment(pointer, comment.content, comment.authorId);
      }
    }

    // Mark as initialized
    localStorage.setItem(storageKey, 'true');
  } catch (error) {
    console.error('Failed to initialize mock comments:', error);
  }
}

/**
 * Clear all mock comments and reset initialization flag
 * Useful for testing or resetting demo data
 */
export function clearMockComments(): void {
  const commentService = getCommentService();
  commentService.clearAll();
  localStorage.removeItem('mock-comments-initialized');
}