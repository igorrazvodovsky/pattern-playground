import React, { createContext, useContext, useMemo } from 'react';
import type { Editor } from '@tiptap/react';
import { useCommentSystem } from '../../services/commenting/hooks/use-comment-system.js';
import type { CommentThread, UniversalComment } from '../../services/commenting/document-pointer.js';
import { UniversalCommentingService } from '../../services/commenting/universal-commenting-service.js';

interface CommentSystemConfig {
  documentId: string;
  editorId?: string;
  currentUser: string;
  context: 'tiptap' | 'item-view' | 'general';
}

interface CommentSystemContextValue {
  // Core service
  service: UniversalCommentingService;
  
  // State
  threads: CommentThread[];
  activeThread: CommentThread | undefined;
  activeThreadComments: UniversalComment[];
  activeThreadId?: string;
  panelVisible: boolean;
  hasUnsavedChanges: boolean;
  draftComment?: {
    pointer: any;
    content: string;
    tempId: string;
  };
  lastSavedTimestamp: number;
  uiState: {
    popoverOpen: boolean;
    drawerOpen: boolean;
    popoverThread: CommentThread | null;
    popoverTriggerElement: HTMLElement | null;
  };
  commentsMap: Map<string, UniversalComment[]>;
  
  // Actions
  actions: {
    createThread: (pointer: any) => CommentThread;
    addComment: (threadId: string, content: string, author: string) => UniversalComment;
    resolveThread: (threadId: string, resolvedBy: string) => void;
    setActiveThread: (id?: string) => void;
    setDraftComment: (draft?: { pointer: any; content: string; tempId: string }) => void;
    togglePanel: () => void;
    clearAllData: () => void;
  };
  createCommentThread: () => CommentThread | null;
  addCommentToThread: (threadId: string, content: string) => UniversalComment;
  resolveThreadAction: (threadId: string) => void;
  handleCommentClick: (event: MouseEvent) => void;
  
  // UI controls
  closePopover: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  
  // Context-specific features
  pointerAdapter: any;
  hasOverlappingComments: () => boolean;
  getThreadAtPosition: (pos: number) => CommentThread | null;
  cleanupInvalidPointers: () => void;
  canCreateComment: boolean;
  
  // Stats
  stats: {
    totalThreads: number;
    activeThreads: number;
    resolvedThreads: number;
    totalComments: number;
  };
}

const CommentSystemContext = createContext<CommentSystemContextValue | null>(null);

export const useCommentSystemContext = () => {
  const context = useContext(CommentSystemContext);
  if (!context) {
    throw new Error('useCommentSystemContext must be used within a CommentSystemProvider');
  }
  return context;
};

interface CommentSystemProviderProps {
  children: React.ReactNode;
  editor: Editor | null;
  config: CommentSystemConfig;
}

export const CommentSystemProvider: React.FC<CommentSystemProviderProps> = ({ 
  children, 
  editor, 
  config 
}) => {
  const commentSystem = useCommentSystem(editor, config);

  const contextValue = useMemo<CommentSystemContextValue>(() => ({
    // Core service
    service: commentSystem.service,
    
    // State
    threads: commentSystem.threads,
    activeThread: commentSystem.activeThread,
    activeThreadComments: commentSystem.activeThreadComments,
    activeThreadId: commentSystem.activeThreadId,
    panelVisible: commentSystem.panelVisible,
    hasUnsavedChanges: commentSystem.hasUnsavedChanges,
    draftComment: commentSystem.draftComment,
    lastSavedTimestamp: commentSystem.lastSavedTimestamp,
    uiState: commentSystem.uiState,
    commentsMap: commentSystem.commentsMap,
    
    // Actions
    actions: commentSystem.actions,
    createCommentThread: commentSystem.createCommentThread,
    addCommentToThread: commentSystem.addCommentToThread,
    resolveThreadAction: commentSystem.resolveThread,
    handleCommentClick: commentSystem.handleCommentClick,
    
    // UI controls
    closePopover: commentSystem.closePopover,
    openDrawer: commentSystem.openDrawer,
    closeDrawer: commentSystem.closeDrawer,
    toggleDrawer: commentSystem.toggleDrawer,
    
    // Context-specific features
    pointerAdapter: commentSystem.pointerAdapter,
    hasOverlappingComments: commentSystem.hasOverlappingComments,
    getThreadAtPosition: commentSystem.getThreadAtPosition,
    cleanupInvalidPointers: commentSystem.cleanupInvalidPointers,
    canCreateComment: commentSystem.canCreateComment,
    
    // Stats
    stats: commentSystem.stats,
  }), [commentSystem]);

  return (
    <CommentSystemContext.Provider value={contextValue}>
      {children}
    </CommentSystemContext.Provider>
  );
};