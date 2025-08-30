import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorCommenting } from '../../../services/commenting/hooks/use-editor-commenting';

interface EditorWithQuoteCommentsProps {
  editor: Editor;
  documentId: string;
  currentUser?: string;
}

/**
 * Example component following the plan architecture.
 * Shows how to integrate editor commenting with React UI.
 */
export const EditorWithQuoteComments: React.FC<EditorWithQuoteCommentsProps> = ({ 
  editor, 
  documentId, 
  currentUser = 'demo-user' 
}: EditorWithQuoteCommentsProps) {
  const { createQuoteComment, activePointer, comments } = useEditorCommenting(editor, {
    documentId,
    currentUser,
    enableQuoteComments: true,
  });
  
  return (
    <>
      <button onClick={createQuoteComment}>Comment on Selection</button>
      {activePointer && (
        <div className="comment-popover">
          <h4>Quote Comments ({comments.length})</h4>
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <strong>{comment.authorId}</strong>: {comment.content}
            </div>
          ))}
        </div>
      )}
    </>
  );
}