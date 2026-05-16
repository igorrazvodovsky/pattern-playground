import { CommentService } from './comment-service';
import { LocalCommentStorage } from './local-comment-storage';

// Singleton instance of the comment service
let commentServiceInstance: CommentService | null = null;

export function getCommentService(): CommentService {
  if (!commentServiceInstance) {
    const storage = new LocalCommentStorage('universal-comments-v2');
    commentServiceInstance = new CommentService(storage);
  }
  return commentServiceInstance;
}

// For testing purposes
export function resetCommentService(): void {
  commentServiceInstance = null;
}