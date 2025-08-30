// Core universal commenting system exports

// Pointer system
export type { CommentPointer, PointerContext } from './comment-pointer';
export { BaseCommentPointer } from './comment-pointer';
export { QuotePointer } from './quote-pointer';
export { EntityPointer } from './entity-pointer';

// Comment service
export type { Comment, CommentThread } from './comment-service';
export { CommentService } from './comment-service';

// Storage
export type { CommentStorage } from './comment-storage';
export { LocalCommentStorage } from './local-comment-storage';

// Event system
export { EventEmitter } from './event-emitter';

// Singleton instance
export { getCommentService, resetCommentService } from './comment-service-instance';