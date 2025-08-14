import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { textTransformService } from '../../services/textTransformService';
import { PpToast } from '../../main.ts';
import '../../components/modal/modal.ts';
import { useTipTapQuoteCommenting } from '../../components/commenting/tiptap/use-tiptap-quote-commenting.js';
import { QuoteCommentPopover } from '../../components/commenting/quote/QuoteCommentPopover.js';
import { Reference, createReferenceSuggestion } from '../../components/reference/index.js';
import { referenceCategories } from '../data/index.js';
import type { ReferenceCategory } from '../../components/reference/types.js';

// Convert data structure to match ReferenceCategory interface
const convertToReferenceCategories = (categories: typeof referenceCategories): ReferenceCategory[] => {
  return categories.map(cat => ({
    id: cat.id,
    label: cat.name,
    items: cat.children.map(child => ({
      id: child.id,
      label: child.name,
      type: child.type,
      metadata: child.metadata
    })),
    metadata: {
      icon: cat.icon,
      searchableText: cat.searchableText
    }
  }));
};
import { getDocumentContentText, getDocumentContentRich } from '../data/index.ts';

import {
  TextEditor,
  BUBBLE_MENU_PRESETS,
  createExplainAction,
  createSummarizeAction,
  createCreateTaskAction,
  createHighlightAction,
  type BubbleMenuAction
} from '../../components/text-editor';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;


export const SimpleExample: Story = {
  args: {},
  render: () => {
    return (
      <div className="layer">
        <TextEditor
          content={`<p>Select any text in this editor to see the bubble menu with basic formatting options. Try selecting this sentence!</p>`}
          bubbleMenu={BUBBLE_MENU_PRESETS.basic}
        />
      </div>
    );
  },
};

export const ExplainText: Story = {
  args: {},
  render: () => {
    const documentId = 'doc-climate-change';
    const sectionId = 'ecological-timing';
    const content = getDocumentContentText(documentId, sectionId);

    return (
      <div className="layer">
        <TextEditor
          content={`<p>${content}</p>`}
          bubbleMenu={{
            actions: [createExplainAction()]
          }}
        />
      </div>
    );
  },
};

export const MultipleActions: Story = {
  args: {},
  render: () => {
    const documentId = 'doc-climate-change';
    const sectionId = 'marine-ecosystems';
    const content = getDocumentContentText(documentId, sectionId);

    return (
      <div className="layer">
        <TextEditor
          content={`
            <p>${content} Marine animals that depend on these reefs for food and shelter are left vulnerable. Ocean acidification, another by-product of increased CO₂ levels, is making it harder for shellfish and corals to build their skeletons. The decline of keystone species can cause cascading effects, altering food webs and leading to further biodiversity loss. In short, climate change is a force multiplier for stressors already facing wildlife, accelerating extinction rates and making conservation efforts more urgent and complex.</p>
          `}
          bubbleMenu={{
            actions: [
              createExplainAction(),
              createSummarizeAction(),
              createCreateTaskAction(),
              createHighlightAction()
            ]
          }}
        />
      </div>
    );
  },
};


// Create a separate component for TextLense to properly use hooks
const TextLenseEditor: React.FC = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);

  const documentId = 'doc-climate-change';
  const sectionId = 'habitat-displacement';
  const content = getDocumentContentText(documentId, sectionId);

  const handleZoom = useCallback(async (direction: 'in' | 'out') => {
    if (editor && !isStreaming) {
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to, ' ');

      if (selectedText) {
        setIsStreaming(true);
        let newContent = '';
        const action = direction === 'in' ? 'Expanding' : 'Condensing';
        PpToast.show(`${action} text...`);

        try {
          const service = direction === 'in' ? textTransformService.zoomIn : textTransformService.zoomOut;
          await service(selectedText, 25, {
            onChunk: (content) => {
              newContent += content;
              editor.chain().focus()
                .setTextSelection({ from, to })
                .insertContent(newContent)
                .setTextSelection({ from, to: from + newContent.length })
                .run();
            },
            onComplete: () => setIsStreaming(false),
            onError: (error) => {
              console.error(`Zoom ${direction} error:`, error);
              setIsStreaming(false);
              PpToast.show(`Error ${action.toLowerCase()} text`);
            }
          });
        } catch (error) {
          console.error(`Zoom ${direction} failed:`, error);
          setIsStreaming(false);
          PpToast.show(`Failed to ${action.toLowerCase()} text`);
        }
      }
    }
  }, [editor, isStreaming]);

  const zoomInAction: BubbleMenuAction = {
    id: 'zoom-in',
    label: 'Zoom In',
    icon: 'ph:magnifying-glass-plus',
    tooltip: 'Zoom in - add more detail',
    handler: () => handleZoom('in'),
    isVisible: () => !isStreaming
  };

  const zoomOutAction: BubbleMenuAction = {
    id: 'zoom-out',
    label: 'Zoom Out',
    icon: 'ph:magnifying-glass-minus',
    tooltip: 'Zoom out - condense detail',
    handler: () => handleZoom('out'),
    isVisible: () => !isStreaming
  };

  return (
    <div className="layer">
      <TextEditor
        content={`<p>${content} As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>`}
        onUpdate={(editorInstance) => setEditor(editorInstance)}
        bubbleMenu={{
          actions: [zoomInAction, zoomOutAction],
          shouldShow: ({ state }) => {
            const { from, to } = state.selection;
            return from !== to && !isStreaming;
          }
        }}
      />
    </div>
  );
};

export const TextLense: Story = {
  args: {},
  render: () => <TextLenseEditor />,
};

// Create a separate component to properly use hooks without TextEditor wrapper
const CommentingEditor: React.FC = () => {
  const richContent = getDocumentContentRich('doc-climate-change');

  // Use direct Tiptap useEditor hook (not wrapped in useMemo)  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
      Reference.configure({
        suggestion: createReferenceSuggestion(convertToReferenceCategories(referenceCategories)),
      }),
    ],
    content: richContent || '',
    editorProps: {
      attributes: {
        class: 'rich-editor',
      }
    },
    immediatelyRender: false,
  });

  // Use the commenting hook with the direct editor
  const quoteCommenting = useTipTapQuoteCommenting(editor, {
    documentId: 'doc-climate-change',
    currentUser: 'user-1'
  });

  // Initialize content
  React.useEffect(() => {
    if (editor && richContent && !editor.getHTML().includes('Marine ecosystems')) {
      editor.commands.setContent(richContent);
    }
  }, [editor, richContent]);

  // Handle clicks on existing quote references
  React.useEffect(() => {
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const referenceElement = target.closest('[data-reference-type="quote"]');

      if (referenceElement) {
        const quoteId = referenceElement.getAttribute('data-reference-id');
        if (quoteId) {
          event.preventDefault();
          event.stopImmediatePropagation(); // Stop all other handlers
          quoteCommenting.handleQuoteReferenceClick(quoteId);
        }
      }
    };

    const editorElement = editor.view.dom;
    // Use capture phase to ensure this handler runs before ItemInteraction handlers
    editorElement.addEventListener('click', handleClick, { capture: true });

    return () => {
      editorElement.removeEventListener('click', handleClick, { capture: true });
    };
  }, [editor, quoteCommenting]);

  return (
    <div className="layer">
      <div className="rich-editor-container">
        {editor && (
          <>
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuCommenting"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                return from !== to && !quoteCommenting.uiState.popoverOpen;
              }}
            >
              <div className="bubble-menu inline-flow">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={quoteCommenting.createQuoteWithComment}
                  title="Add comment"
                  disabled={!quoteCommenting.canCreateQuoteComment()}
                >
                  <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
                  Comment
                </button>
              </div>
            </BubbleMenu>

            {/* Quote comment popover using new integrated system */}
            {quoteCommenting.uiState.popoverOpen && quoteCommenting.uiState.commentingQuote && (
              <QuoteCommentPopover
                quote={quoteCommenting.uiState.commentingQuote}
                isOpen={quoteCommenting.uiState.popoverOpen}
                triggerElement={quoteCommenting.uiState.triggerElement}
                currentUser="user-1"
                onClose={quoteCommenting.closePopover}
                onCommentAdded={quoteCommenting.handleCommentAdded}
              />
            )}
          </>
        )}

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export const Commenting: Story = {
  render: () => <CommentingEditor />,
};

