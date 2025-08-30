import { useEffect, useRef } from 'react';
import { useCommentStore } from '../state/comment-store.js';
import { loadSharedDataComments, groupCommentsByEntity } from '../storage/dummy-data-integration';
import { loadCommentsFromLocalStorage, mergeWithSharedData } from '../storage/local-storage-adapter';

// Hook to initialize the universal commenting system
export const useCommentInitialization = () => {
  const initializationRef = useRef(false);
  const commentStore = useCommentStore();

  useEffect(() => {
    // Only initialize once
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    const initializeComments = async () => {
      try {
        console.log('Initializing universal commenting system...');

        // Load shared data comments
        const sharedDataComments = loadSharedDataComments();
        const groupedSharedComments = groupCommentsByEntity(sharedDataComments);
        console.log(`Loaded ${sharedDataComments.length} comments from shared data`);

        // Load local storage comments
        const localComments = loadCommentsFromLocalStorage();
        console.log(`Loaded ${localComments ? Array.from(localComments.values()).reduce((sum, comments) => sum + comments.length, 0) : 0} comments from localStorage`);

        // Merge shared data and local storage comments
        const mergedComments = localComments
          ? mergeWithSharedData(localComments, groupedSharedComments)
          : groupedSharedComments;

        // Update the store with merged data
        const totalCommentsAfterMerge = Array.from(mergedComments.values()).reduce((sum, comments) => sum + comments.length, 0);
        console.log(`Merged ${totalCommentsAfterMerge} total comments into universal store`);
        
        // Debug: Log quote-specific comments
        const quoteKeys = Array.from(mergedComments.keys()).filter(key => key.startsWith('quote:'));
        console.log('Quote comment keys found:', quoteKeys);
        quoteKeys.forEach(key => {
          const comments = mergedComments.get(key) || [];
          console.log(`${key}: ${comments.length} comments`, comments.map(c => c.content));
        });

        // Use setState to update the store directly
        useCommentStore.setState({
          commentsByEntity: mergedComments,
          hasUnsavedChanges: false,
          lastSavedTimestamp: Date.now()
        });

        console.log('Universal commenting system initialized successfully');
      } catch (error) {
        console.error('Failed to initialize universal commenting system:', error);

        // Fallback: ensure store has empty state
        useCommentStore.setState({
          commentsByEntity: new Map(),
          hasUnsavedChanges: false,
          lastSavedTimestamp: 0
        });
      }
    };

    initializeComments();
  }, []);

  return {
    isInitialized: initializationRef.current,
    totalComments: Array.from(commentStore.commentsByEntity.values()).reduce((sum, comments) => sum + comments.length, 0),
    totalEntities: commentStore.commentsByEntity.size
  };
};

// Hook to get initialization status without triggering initialization
export const useCommentInitializationStatus = () => {
  const commentStore = useCommentStore();

  return {
    totalComments: Array.from(commentStore.commentsByEntity.values()).reduce((sum, comments) => sum + comments.length, 0),
    totalEntities: commentStore.commentsByEntity.size,
    lastSavedTimestamp: commentStore.lastSavedTimestamp,
    hasUnsavedChanges: commentStore.hasUnsavedChanges
  };
};