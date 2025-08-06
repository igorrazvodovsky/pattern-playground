// Universal commenting system exports

// Core types
export * from './document-pointer.js';

// State management
export { useCommentStore } from './state/comment-store.js';

// Universal service
export { UniversalCommentingService } from './universal-commenting-service.js';

// React hooks
export * from './hooks/use-universal-commenting.js';

// TipTap adapter
export { TipTapPointerAdapter } from './tiptap-pointer-adapter.js';