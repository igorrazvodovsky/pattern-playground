import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import React, { useCallback, useState } from 'react';
import { textTransformService } from '../../services/textTransformService';
import { PpToast, PpButton, PpPopup } from '../../main.ts';
import '../../components/modal/modal.ts';
import { CommentMark, useCommentUI, CommentPopover, CommentDrawer } from '../../components/commenting/index.js';
import { comments, users, getUserById, getCommentsByEntity, getCommentsByThreadId, getDocumentContentText, getDocumentContentRich, documentContent } from '../shared-data/index.ts';
import type { Comment } from '../shared-data/index.ts';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

// Simple editor hook for BubbleMenu
const useSimpleEditor = (content: string, includeCommentMark = false) => {
  const extensions = [
    StarterKit,
    Highlight,
  ];

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

export const Commenting: Story = {
  args: {},
  render: () => {
    const [hideBubbleMenu, setHideBubbleMenu] = useState(false);

    // Use rich content from climate change document which demonstrates quote object potential
    const richContent = getDocumentContentRich('doc-climate-change');
    
    const editor = useSimpleEditor('', true); // Enable CommentMark extension
    
    // Set content from rich content structure when editor is ready
    React.useEffect(() => {
      if (editor && richContent) {
        editor.commands.setContent(richContent);
      }
    }, [editor, richContent]);

    // Initialize comment UI system - this will be replaced by quote object system
    const commentUI = useCommentUI(editor, {
      documentId: 'bubble-menu-demo-climate-change',
      editorId: 'bubble-menu-ui-demo', 
      currentUser: 'user-1' // Current system - will become quote object creator
    });

    // Initialize comment threads after editor content is set
    React.useEffect(() => {
      if (editor && commentUI.service && commentUI.pointerAdapter && editor.state.doc.textContent.length > 0) {
        // Use a timeout to ensure the rich content is fully loaded
        const timer = setTimeout(() => {
          const existingThreads = new Map();
          
          // Get sample comment content - in quote object system, these would be quotes with comments
          const documentComments = getCommentsByEntity('document', 'doc-climate-change').slice(0, 3) as Comment[];
          
          // DEMO: Create comment threads on highlighted text
          // TODO: Replace with quote object system where:
          // 1. Text selections become persistent quote objects
          // 2. Quote objects integrate with item-view system
          // 3. Comments are attached to quote objects via universal commenting
          const commentRanges = [
            { 
              text: 'reshaping ecosystems', 
              threadKey: 'demo-thread-1', 
              resolved: false,
              // These comments would be attached to a quote object in the new system
              comments: [
                {
                  content: documentComments[0]?.content || "The ecosystem impact assessment needs more specific metrics on biodiversity loss. Can we quantify the species displacement rates?",
                  author: documentComments[0]?.authorId || 'user-5'
                },
                {
                  content: documentComments[1]?.content || "Good point. I'll coordinate with the biodiversity team to get those displacement metrics from our latest field studies.",
                  author: documentComments[1]?.authorId || 'user-1'
                }
              ]
            },
            { 
              text: 'habitats shrink or disappear', 
              threadKey: 'demo-thread-2', 
              resolved: true,
              // This would be a resolved quote object with comments in the new system
              comments: [
                {
                  content: documentComments[2]?.content || "This section aligns well with our water conservation project findings. Should we cross-reference the data?",
                  author: documentComments[2]?.authorId || 'user-8'
                }
              ]
            }
          ];

          commentRanges.forEach(({ text, threadKey, resolved, comments }) => {
            const content = editor.state.doc.textContent;
            const startIndex = content.indexOf(text);

            if (startIndex !== -1) {
              // Find the actual document positions
              let currentTextPos = 0;
              let actualStart = -1;
              let actualEnd = -1;

              editor.state.doc.descendants((node, pos) => {
                if (node.isText) {
                  const nodeText = node.textContent;
                  const nodeStart = currentTextPos;
                  const nodeEnd = currentTextPos + nodeText.length;

                  if (actualStart === -1 && startIndex >= nodeStart && startIndex < nodeEnd) {
                    actualStart = pos + (startIndex - nodeStart);
                  }

                  if (actualEnd === -1 && (startIndex + text.length) > nodeStart && (startIndex + text.length) <= nodeEnd) {
                    actualEnd = pos + ((startIndex + text.length) - nodeStart);
                  }

                  currentTextPos += nodeText.length;
                }
              });

              if (actualStart !== -1 && actualEnd !== -1 && actualEnd > actualStart) {
                try {
                  // Create pointer and thread
                  const pointer = commentUI.pointerAdapter.createPointerForRange(actualStart, actualEnd);
                  const thread = commentUI.service.createThread(pointer);

                  // Apply comment mark to highlight the text
                  editor.chain()
                    .setTextSelection({ from: actualStart, to: actualEnd })
                    .setMark('comment', { commentId: thread.id, resolved })
                    .run();

                  // Add comments to thread
                  comments.forEach(comment => {
                    commentUI.service.addComment(thread.id, comment.content, comment.author);
                  });

                  // Resolve thread if needed
                  if (resolved) {
                    commentUI.service.resolveThread(thread.id, 'system');
                  }

                  existingThreads.set(threadKey, { thread, isResolved: resolved, pointer });
                  console.log(`Created thread for "${text}" at positions ${actualStart}-${actualEnd}`);
                } catch (error) {
                  console.error(`Failed to create thread for "${text}":`, error);
                }
              }
            }
          });

          console.log(`Initialized ${existingThreads.size} comment threads`);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [editor, commentUI.service, commentUI.pointerAdapter, richContent]);

    const handleComment = useCallback(() => {
      if (commentUI.canCreateComment) {
        const thread = commentUI.createCommentThread();
        if (thread) {
          // Hide bubble menu temporarily
          setHideBubbleMenu(true);
          setTimeout(() => {
            setHideBubbleMenu(false);
            editor?.commands.setTextSelection(0);
          }, 100);
        }
      } else {
        PpToast.show('Please select text to comment on');
      }
    }, [commentUI, editor]);

    const handleHighlight = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleHighlight().run();
      }
    }, [editor]);

    return (
      <div className="layer">
        <div className="rich-editor-container">
          {editor && (
            <>
              <BubbleMenu
                editor={editor}
                pluginKey="bubbleMenuCommentUI"
                shouldShow={({ state }) => {
                  const { from, to } = state.selection;
                  const isEmpty = from === to;
                  // Hide bubble menu when comment popover is open or temporarily hidden
                  return !isEmpty && !commentUI.uiState.popoverOpen && !hideBubbleMenu;
                }}
              >
                <div className="bubble-menu inline-flow">
                  <button
                    className={`button button--small button--plain ${!commentUI.canCreateComment ? 'button--disabled' : ''}`}
                    is="pp-button"
                    onClick={handleComment}
                    disabled={!commentUI.canCreateComment}
                    title={commentUI.canCreateComment ? "Add comment" : "Select text to comment"}
                  >
                    <iconify-icon className="icon" icon="ph:chat-circle"></iconify-icon>
                    Comment
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

              {/* Comment Popover */}
              {commentUI.uiState.popoverOpen && commentUI.uiState.popoverThread && (
                <CommentPopover
                  thread={commentUI.uiState.popoverThread}
                  comments={commentUI.commentsMap.get(commentUI.uiState.popoverThread.id) || []}
                  currentUser="user-1"
                  isOpen={commentUI.uiState.popoverOpen}
                  triggerElement={commentUI.uiState.popoverTriggerElement}
                  onAddComment={commentUI.handleAddComment}
                  onResolveThread={commentUI.handleResolveThread}
                  onClose={commentUI.closePopover}
                  onSwitchToDrawer={() => {
                    commentUI.closePopover();
                    commentUI.openDrawer();
                  }}
                />
              )}

              {/* Comment Drawer */}
              <CommentDrawer
                threads={commentUI.editorThreads}
                commentsMap={commentUI.commentsMap}
                currentUser="user-1"
                isOpen={commentUI.uiState.drawerOpen}
                activeThreadId={commentUI.activeThreadId}
                onAddComment={commentUI.handleAddComment}
                onResolveThread={commentUI.handleResolveThread}
                onClose={commentUI.closeDrawer}
              />
            </>
          )}

          <div onClick={commentUI.handleCommentClick}>
            <EditorContent editor={editor} />
          </div>
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
