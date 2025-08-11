// Universal commenting system exports

// Core types
export * from './document-pointer.js';

// State management
export { useCommentStore } from './state/comment-store.js';

// Universal service
export { UniversalCommentingService } from './universal-commenting-service.js';

// React hooks
export * from './hooks/use-universal-commenting.js';
export { useCommentSystem } from './hooks/use-comment-system.js';

// Pointer system
export { AbstractPointerAdapter } from './pointers/abstract-pointer-adapter.js';
export { PointerAdapterRegistry, getPointerAdapterRegistry } from './pointers/pointer-adapter-registry.js';
export { TipTapPointerAdapter } from './tiptap-pointer-adapter.js';

// Error handling
export * from './utils/error-handling.js';

// Demo utilities
export { CommentDemoService } from './demo/comment-demo-service.js';