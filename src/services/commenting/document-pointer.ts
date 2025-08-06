// Universal commenting pointer types following Ink & Switch architecture

// Generic pointer interface (extensible to other document types)
export interface DocumentPointer {
  type: string;                                  // Pointer type identifier
  [key: string]: any;                            // App-specific properties
}

// TipTap-specific pointer implementation
export interface TipTapTextPointer extends DocumentPointer {
  type: 'tiptap-text-range';
  from: number;                                  // Start position
  to: number;                                    // End position
  text: string;                                  // Captured text content
  documentId?: string;                           // Optional document identifier
}

// Item View specific pointer for commenting on structured content
export interface ItemViewPointer extends DocumentPointer {
  type: 'item-view-section';
  itemId: string;                               // Which item is being commented on
  sectionPath: string;                          // Dot-notation path to section (e.g., 'metadata.title')
  viewScope: 'micro' | 'mini' | 'mid' | 'maxi'; // Context: micro, mini, mid, maxi
  interactionMode: 'preview' | 'inspect' | 'edit' | 'transform'; // Mode
  contentType: string;                          // Item content type
}

// Edit history for transparency
export interface CommentEdit {
  timestamp: Date;
  previousContent: string;
  reason?: string;
}

// Universal comment structure following Comment concept
export interface UniversalComment {
  id: string;
  // User who created the comment
  author: string;
  // What the comment is attached to
  pointers: DocumentPointer[];
  content: string;
  timestamp: Date;
  // For threaded replies (null for top-level)
  parentId?: string;
  status: 'draft' | 'published' | 'flagged' | 'deleted' | 'resolved';
  // Previous versions for transparency
  editHistory?: CommentEdit[];
}

export interface CommentThread {
  id: string;                                    // Thread identifier
  rootCommentId: string;                         // Root comment in thread
  pointers: DocumentPointer[];                   // Document references
  participants: string[];                        // Thread participants
  status: 'active' | 'resolved' | 'archived';   // Thread status
}