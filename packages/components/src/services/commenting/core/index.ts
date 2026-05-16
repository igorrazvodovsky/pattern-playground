export type { CommentPointer, PointerContext } from './comment-pointer';
export { BaseCommentPointer } from './comment-pointer';
export { QuotePointer } from './quote-pointer';
export { EntityPointer } from './entity-pointer';

export type { Comment, CommentThread } from './comment-service';
export { CommentService } from './comment-service';

export type { CommentStorage } from './comment-storage';
export { LocalCommentStorage } from './local-comment-storage';

export { EventEmitter } from './event-emitter';

export { getCommentService, resetCommentService } from './comment-service-instance';