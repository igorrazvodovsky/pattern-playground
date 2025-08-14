import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import React, { useCallback, useState } from 'react';
import { textTransformService } from '../../services/textTransformService';
import { PpToast } from '../../main.ts';
import '../../components/modal/modal.ts';
import { ReferenceMark } from '../../components/reference/index.js';
import { useTipTapQuoteCommenting } from '../../components/commenting/tiptap/use-tiptap-quote-commenting.js';
import { QuoteCommentPopover } from '../../components/commenting/quote/QuoteCommentPopover.js';
import { CommentMark } from '../../components/commenting/index.js';
import { getDocumentContentText, getDocumentContentRich } from '../shared-data/index.ts';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Simple editor hook for BubbleMenu
const useSimpleEditor = (content: string, includeReferenceMark = false, includeCommentMark = false) => {
  const extensions = [
    StarterKit,
    Highlight,
  ];

  if (includeReferenceMark) {
    extensions.push(ReferenceMark);
  }

  if (includeCommentMark) {
    extensions.push(CommentMark);
  }

  const editor = useEditor({
    extensions,
    content,
    editorProps: {
      attributes: {
        class: 'rich-editor',
      }
    }
  });

  return editor;
};

export const ExplainText: Story = {
  args: {},
  render: () => {
    // Use climate change document content for realistic text that can be linked to comments
    const documentId = 'doc-climate-change';
    const sectionId = 'ecological-timing';
    const content = getDocumentContentText(documentId, sectionId);

    const editor = useSimpleEditor(`<p>${content}</p>`);

    const handleExplain = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Explaining: "${selectedText}"\n\nThis would trigger an AI explanation with full context.`);
        }
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuExplain"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty;
              }}
            >
              <div className="bubble-menu">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleExplain}
                  title="Explain this"
                >
                  <iconify-icon className="icon" icon="ph:question"></iconify-icon>
                  Explain this
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};

export const MultipleActions: Story = {
  args: {},
  render: () => {
    // Use marine ecosystems section from climate change document
    const documentId = 'doc-climate-change';
    const sectionId = 'marine-ecosystems';
    const content = getDocumentContentText(documentId, sectionId);

    const editor = useSimpleEditor(`
      <p>${content} Marine animals that depend on these reefs for food and shelter are left vulnerable. Ocean acidification, another by-product of increased CO₂ levels, is making it harder for shellfish and corals to build their skeletons. The decline of keystone species can cause cascading effects, altering food webs and leading to further biodiversity loss. In short, climate change is a force multiplier for stressors already facing wildlife, accelerating extinction rates and making conservation efforts more urgent and complex.</p>
    `);

    const handleExplain = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Explaining: "${selectedText}"`);
        }
      }
    }, [editor]);

    const handleSummarize = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Summarizing: "${selectedText}"`);
        }
      }
    }, [editor]);

    const handleHighlight = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    }, [editor]);

    const handleCreateTask = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        if (selectedText) {
          alert(`Creating task from: "${selectedText}"`);
        }
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuMultiple"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty;
              }}
            >
              <div className="bubble-menu inline-flow">
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleExplain}
                  title="Explain this"
                >
                  <iconify-icon className="icon" icon="ph:question"></iconify-icon>
                  <span className="inclusively-hidden">Explain</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleSummarize}
                  title="Summarize this text"
                >
                  <iconify-icon className="icon" icon="ph:list-dashes"></iconify-icon>
                  <span className="inclusively-hidden">Summarize</span>
                </button>
                <button
                  className="button button--small button--plain"
                  is="pp-button"
                  onClick={handleCreateTask}
                  title="Create task from this text"
                >
                  <iconify-icon className="icon" icon="ph:plus-circle"></iconify-icon>
                  <span className="inclusively-hidden">Create task</span>
                </button>
                <button
                  className={`button button--small button--plain ${editor?.isActive('highlight') ? 'button--active' : ''}`}
                  is="pp-button"
                  onClick={handleHighlight}
                  title="Highlight text"
                >
                  <iconify-icon className="icon" icon="ph:highlighter"></iconify-icon>
                  <span className="inclusively-hidden">Highlight</span>
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};


export const TextLense: Story = {
  args: {},
  render: () => {
    const [isStreaming, setIsStreaming] = useState(false);

    // Use habitat displacement section from climate change document
    const documentId = 'doc-climate-change';
    const sectionId = 'habitat-displacement';
    const content = getDocumentContentText(documentId, sectionId);

    const editor = useSimpleEditor(`<p>${content} As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>`);

    const handleZoom = useCallback(async (direction: 'in' | 'out') => {
      if (editor && !isStreaming) {
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');

        if (selectedText) {
          setIsStreaming(true);
          let newContent = '';

          // Show toast notification
          const action = direction === 'in' ? 'Expanding' : 'Condensing';
          PpToast.show(`${action} text...`);

          try {
            if (direction === 'in') {
              await textTransformService.zoomIn(selectedText, 25, {
                onChunk: (content) => {
                  newContent += content;
                  // Replace selected text progressively
                  editor.chain().focus()
                    .setTextSelection({ from, to })
                    .insertContent(newContent)
                    .setTextSelection({ from, to: from + newContent.length })
                    .run();
                },
                onComplete: () => {
                  setIsStreaming(false);
                },
                onError: (error) => {
                  console.error(`Zoom ${direction} error:`, error);
                  setIsStreaming(false);
                  PpToast.show(`Error ${action.toLowerCase()} text`);
                }
              });
            } else {
              await textTransformService.zoomOut(selectedText, 25, {
                onChunk: (content) => {
                  newContent += content;
                  // Replace selected text progressively
                  editor.chain().focus()
                    .setTextSelection({ from, to })
                    .insertContent(newContent)
                    .setTextSelection({ from, to: from + newContent.length })
                    .run();
                },
                onComplete: () => {
                  setIsStreaming(false);
                },
                onError: (error) => {
                  console.error(`Zoom ${direction} error:`, error);
                  setIsStreaming(false);
                  PpToast.show(`Error ${action.toLowerCase()} text`);
                }
              });
            }
          } catch (error) {
            console.error(`Zoom ${direction} failed:`, error);
            setIsStreaming(false);
            PpToast.show(`Failed to ${action.toLowerCase()} text`);
          }
        }
      }
    }, [editor, isStreaming]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <BubbleMenu
              editor={editor}
              pluginKey="bubbleMenuTextLense"
              shouldShow={({ state }) => {
                const { from, to } = state.selection;
                const isEmpty = from === to;
                return !isEmpty && !isStreaming;
              }}
            >
              <div className="bubble-menu inline-flow">
                <button
                  className={`button button--small button--plain ${isStreaming ? 'button--loading' : ''}`}
                  is="pp-button"
                  onClick={() => handleZoom('in')}
                  disabled={isStreaming}
                  title="Zoom in - add more detail"
                >
                  <iconify-icon className="icon" icon="ph:magnifying-glass-plus"></iconify-icon>
                  <span className="inclusively-hidden">Zoom In</span>
                </button>
                <button
                  className={`button button--small button--plain ${isStreaming ? 'button--loading' : ''}`}
                  is="pp-button"
                  onClick={() => handleZoom('out')}
                  disabled={isStreaming}
                  title="Zoom out - condense detail"
                >
                  <iconify-icon className="icon" icon="ph:magnifying-glass-minus"></iconify-icon>
                  <span className="inclusively-hidden">Zoom Out</span>
                </button>
              </div>
            </BubbleMenu>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
};

export const Commenting: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Clean quote commenting workflow using universal commenting system. Select text → Click "Comment" → Popover opens → Enter rich comment → Submit. Uses integrated hooks and universal comment storage with persistent quotes.'
      }
    }
  },
  render: () => {
    const richContent = getDocumentContentRich('doc-climate-change');
    const editor = useSimpleEditor('', true); // Enable ReferenceMark extension

    // Use the new integrated quote commenting system
    const quoteCommenting = useTipTapQuoteCommenting(editor, {
      documentId: 'doc-climate-change',
      currentUser: 'user-1'
    });

    // Initialize content and existing quotes
    React.useEffect(() => {
      if (editor && richContent) {
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
            event.stopPropagation();
            quoteCommenting.handleQuoteReferenceClick(quoteId);
          }
        }
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener('click', handleClick);

      return () => {
        editorElement.removeEventListener('click', handleClick);
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
  },
};

export const UniversalCommenting: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Clean quote commenting workflow using universal commenting system. Select text → Click "Comment" → Popover opens → Enter rich comment → Submit. Uses new integrated hooks and universal comment storage.'
      }
    }
  },
  render: () => {
    const richContent = getDocumentContentRich('doc-climate-change');
    const editor = useSimpleEditor('', true); // Enable ReferenceMark extension

    // Use the new integrated quote commenting system
    const quoteCommenting = useTipTapQuoteCommenting(editor, {
      documentId: 'doc-climate-change',
      currentUser: 'user-1'
    });

    // Initialize content and existing quotes
    React.useEffect(() => {
      if (editor && richContent) {
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
            event.stopPropagation();
            quoteCommenting.handleQuoteReferenceClick(quoteId);
          }
        }
      };

      const editorElement = editor.view.dom;
      editorElement.addEventListener('click', handleClick);

      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }, [editor, quoteCommenting]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <>
              <BubbleMenu
                editor={editor}
                pluginKey="bubbleMenuUniversalCommenting"
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
  },
};

