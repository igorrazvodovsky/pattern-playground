import React, { useMemo } from 'react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import type { BubbleMenuConfig } from '../types';

interface BubbleMenuProps {
  editor: Editor;
  config: BubbleMenuConfig;
  pluginKey?: string;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  config,
  pluginKey = 'bubbleMenu',
}) => {
  const { actions, shouldShow, className = '' } = config;

  const defaultShouldShow = useMemo(() => ({ state }: { state: any }) => {
    const { from, to } = state.selection;
    const isEmpty = from === to;
    return !isEmpty;
  }, []);

  const filteredActions = useMemo(() => 
    actions.filter(action => {
      if (action.isVisible) {
        return action.isVisible(editor);
      }
      return true;
    }), 
    [actions, editor]
  );

  // Don't render if no actions are available
  if (!editor || filteredActions.length === 0) {
    return null;
  }

  return (
    <TiptapBubbleMenu
      editor={editor}
      pluginKey={pluginKey}
      shouldShow={shouldShow || defaultShouldShow}
      tippyOptions={{
        duration: 100,
        placement: 'top',
      }}
    >
      <div className={`bubble-menu inline-flow ${className}`}>
        {filteredActions.map((action) => {
          const isActive = action.isActive ? action.isActive(editor) : false;
          
          return (
            <button
              key={action.id}
              className={`button button--small button--plain ${isActive ? 'button--active' : ''}`}
              is="pp-button"
              onClick={() => action.handler(editor)}
              title={action.tooltip || action.label}
              disabled={!editor.can()}
            >
              <iconify-icon className="icon" icon={action.icon}></iconify-icon>
              {action.label && (
                <span className="inclusively-hidden">{action.label}</span>
              )}
            </button>
          );
        })}
      </div>
    </TiptapBubbleMenu>
  );
};

// Predefined action sets for common use cases
export const createExplainAction = (onExplain?: (text: string) => void) => ({
  id: 'explain',
  label: 'Explain this',
  icon: 'ph:question',
  tooltip: 'Explain this',
  handler: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      if (onExplain) {
        onExplain(selectedText);
      } else {
        alert(`Explaining: "${selectedText}"\n\nThis would trigger an AI explanation with full context.`);
      }
    }
  },
});

export const createSummarizeAction = (onSummarize?: (text: string) => void) => ({
  id: 'summarize',
  label: 'Summarize',
  icon: 'ph:list-dashes',
  tooltip: 'Summarize this text',
  handler: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      if (onSummarize) {
        onSummarize(selectedText);
      } else {
        alert(`Summarizing: "${selectedText}"`);
      }
    }
  },
});

export const createHighlightAction = () => ({
  id: 'highlight',
  label: 'Highlight',
  icon: 'ph:highlighter',
  tooltip: 'Highlight text',
  handler: (editor: Editor) => {
    editor.chain().focus().toggleHighlight().run();
  },
  isActive: (editor: Editor) => editor.isActive('highlight'),
});

export const createCommentAction = (onComment?: () => void) => ({
  id: 'comment',
  label: 'Comment',
  icon: 'ph:chat-circle',
  tooltip: 'Add comment',
  handler: () => {
    if (onComment) {
      onComment();
    }
  },
});

export const createCreateTaskAction = (onCreateTask?: (text: string) => void) => ({
  id: 'create-task',
  label: 'Create task',
  icon: 'ph:plus-circle',
  tooltip: 'Create task from this text',
  handler: (editor: Editor) => {
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (selectedText) {
      if (onCreateTask) {
        onCreateTask(selectedText);
      } else {
        alert(`Creating task from: "${selectedText}"`);
      }
    }
  },
});

// Text formatting actions
export const createBoldAction = () => ({
  id: 'bold',
  label: 'Bold',
  icon: 'ph:text-b',
  tooltip: 'Bold',
  handler: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  isActive: (editor: Editor) => editor.isActive('bold'),
});

export const createItalicAction = () => ({
  id: 'italic',
  label: 'Italic',
  icon: 'ph:text-italic',
  tooltip: 'Italic',
  handler: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  isActive: (editor: Editor) => editor.isActive('italic'),
});

export const createStrikeAction = () => ({
  id: 'strike',
  label: 'Strike',
  icon: 'ph:text-strikethrough',
  tooltip: 'Strikethrough',
  handler: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
  isActive: (editor: Editor) => editor.isActive('strike'),
});

// Predefined bubble menu configurations
export const BUBBLE_MENU_PRESETS = {
  basic: {
    actions: [
      createBoldAction(),
      createItalicAction(),
      createStrikeAction(),
    ],
  },
  
  withHighlight: {
    actions: [
      createBoldAction(),
      createItalicAction(),
      createStrikeAction(),
      createHighlightAction(),
    ],
  },
  
  aiAssisted: (callbacks?: {
    onExplain?: (text: string) => void;
    onSummarize?: (text: string) => void;
  }) => ({
    actions: [
      createExplainAction(callbacks?.onExplain),
      createSummarizeAction(callbacks?.onSummarize),
      createHighlightAction(),
    ],
  }),
  
  collaborative: (callbacks?: {
    onComment?: () => void;
    onCreateTask?: (text: string) => void;
  }) => ({
    actions: [
      createCommentAction(callbacks?.onComment),
      createCreateTaskAction(callbacks?.onCreateTask),
      createHighlightAction(),
    ],
  }),
};