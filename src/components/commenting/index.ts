// Commenting UI components exports

// Context and providers
export { CommentSystemProvider, useCommentSystemContext } from './CommentSystemProvider.js';

// Universal components
export { CommentThread, CommentPopover, CommentDrawer } from './universal/index.js';
export { CommentThreadRenderer } from './universal/CommentThreadRenderer.js';

// Hooks
export { useCommentUI } from './hooks/index.js';

// TipTap integration
export { CommentMark } from './tiptap/comment-mark.js';
export { useTipTapCommentingIntegration } from './tiptap/use-tiptap-commenting.js';