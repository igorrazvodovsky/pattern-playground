// Universal commenting system exports

// Core universal system
export * from './core/index';

// React hooks - the only two hooks needed
export { useCommenting } from './hooks/use-commenting';
export { useEditorCommenting } from './hooks/use-editor-commenting';

// Quote service (still needed for quote creation)
export { getQuoteService, type QuoteObject } from './quote-service';

// State management
export { useCommentStore } from './state/comment-store';

// Utilities
export * from './utils/error-handling';

// Mock data initialization (for development/demo)
export { initializeMockComments, clearMockComments } from './mock-data/initialize-mock-comments';