export type { CommentPointer, PointerContext } from './comment-pointer';
export { BaseCommentPointer } from './comment-pointer';
export { TextRangePointer } from './text-range-pointer';
export { EntityPointer } from './entity-pointer';

export type { Comment, CommentThread, CommentEvents } from './comment-service';
export { CommentService } from './comment-service';

export type { CommentStorage } from './comment-storage';
export { LocalCommentStorage } from './local-comment-storage';

export { getCommentService, resetCommentService } from './comment-service-instance';