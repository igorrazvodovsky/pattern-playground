// Universal commenting system exports

// Core universal system
export * from './core/index';

// React hooks
export { useCommenting } from './hooks/use-commenting';
export { useEditorCommenting } from './hooks/use-editor-commenting';

// Legacy exports (to be migrated)
export * from './document-pointer';
export { useCommentStore } from './state/comment-store';
export { UniversalCommentingService } from './universal-commenting-service';
export * from './hooks/use-universal-commenting';
export { useCommentSystem } from './hooks/use-comment-system';
export { TipTapPointerAdapter } from './tiptap-pointer-adapter';
export * from './utils/error-handling';
export { CommentDemoService } from './demo/comment-demo-service';