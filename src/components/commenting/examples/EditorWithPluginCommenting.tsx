import React from 'react';
import type { Editor } from '@tiptap/react';
import { useEditorCommenting } from '../tiptap/useEditorCommenting.js';
import { CommentPopover } from '../universal/comment-popover.js';

interface EditorWithPluginCommentingProps {
  editor: Editor;
  documentId: string;
  currentUser: string;
}

/**
 * Example component showing the new plugin-based commenting architecture
 * This demonstrates clean separation between editor capabilities and comment system
 */
export const EditorWithPluginCommenting: React.FC<EditorWithPluginCommentingProps> = ({
  editor,
  documentId,
  currentUser
}) => {
  const {
    // Universal commenting system
    comments,
    createComment,
    
    // Editor-specific capabilities
    createQuoteComment,
    navigateToQuote,
    insertReference,
    capabilities,
    
    // Current state
    activePointer,
    activeQuote,
    clearActiveComment
  } = useEditorCommenting(editor, { documentId, currentUser });

  return (
    <div className="editor-commenting-interface">
      {/* Editor toolbar with comment capabilities */}
      <div className="editor-toolbar">
        <button
          onClick={createQuoteComment}
          disabled={!capabilities.canCreateQuote}
          title="Create quote from selection"
          className="toolbar-button"
        >
          💬 Quote & Comment
        </button>
        
        <button
          onClick={() => insertReference({ 
            id: 'example-task-1', 
            type: 'task', 
            label: 'Example Task' 
          })}
          disabled={!capabilities.canInsertReference}
          title="Insert reference"
          className="toolbar-button"
        >
          @ Reference
        </button>
      </div>

      {/* Active comment interface */}
      {activePointer && (
        <CommentPopover
          pointer={activePointer}
          comments={comments}
          onAddComment={createComment}
          onClose={clearActiveComment}
          currentUser={currentUser}
          className="editor-comment-popover"
        />
      )}

      {/* Quote navigation */}
      {activeQuote && (
        <div className="quote-actions">
          <button
            onClick={() => navigateToQuote(activeQuote)}
            className="secondary-button"
          >
            📍 Go to Source
          </button>
        </div>
      )}

      {/* Debug info */}
      <div className="debug-info" style={{ fontSize: '0.8em', opacity: 0.7, marginTop: '1em' }}>
        <details>
          <summary>Plugin State</summary>
          <pre>{JSON.stringify({
            capabilities,
            activePointer: activePointer?.serialize(),
            activeQuote: activeQuote?.id,
            commentCount: comments.length
          }, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

/**
 * Example showing how to use the plugin for task management workflows
 */
export const TaskEditorExample: React.FC<{
  editor: Editor;
  currentUser: string;
}> = ({ editor, currentUser }) => {
  const { insertReference } = useEditorCommenting(editor, {
    documentId: 'task-document-1',
    currentUser
  });

  const handleInsertTaskReference = () => {
    insertReference({
      id: 'task-123',
      type: 'task',
      label: 'Review Design System'
    });
  };

  return (
    <div>
      <h3>Task Management Integration</h3>
      <p>Insert references to tasks directly in your documents:</p>
      <button onClick={handleInsertTaskReference} className="primary-button">
        📋 Insert Task Reference
      </button>
    </div>
  );
};