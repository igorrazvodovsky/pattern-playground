import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import React, { useCallback, useState } from 'react';
import { textTransformService } from '../../services/textTransformService';
import { PpToast, PpButton, PpPopup } from '../../main.ts';
import '../../components/modal/modal.ts';
import { CommentMark, useCommentUI, CommentPopover, CommentDrawer } from '../../components/commenting/index.js';
import { comments, users, getUserById, getCommentsByEntity, getCommentsByThreadId } from '../shared-data/index.ts';

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
    const editor = useSimpleEditor(`
      <p>Changes in temperature and precipitation are also throwing off the rhythms of nature. Many species rely on environmental cues for breeding, migration, and feeding. When spring arrives earlier, some birds migrate before their food sources are abundant. If insects hatch too early or too late for birds to feed their chicks, or if flowers bloom before pollinators are active, the entire chain can fall apart. These mismatches can ripple through ecosystems, weakening the interdependence that many species rely on to survive.</p>
    `);

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
    const editor = useSimpleEditor(`
      <p>Warming oceans are particularly devastating. <mark>Coral reefs, which are biodiversity hotspots, are bleaching and dying due to heat stress.</mark> Marine animals that depend on these reefs for food and shelter are left vulnerable. Ocean acidification, another by-product of increased CO₂ levels, is making it harder for shellfish and corals to build their skeletons. The decline of keystone species can cause cascading effects, altering food webs and leading to further biodiversity loss. In short, climate change is a force multiplier for stressors already facing wildlife, accelerating extinction rates and making conservation efforts more urgent and complex.</p>
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

    const editor = useSimpleEditor(`
      <p>Climate change is <mark data-comment-id="thread-1">reshaping ecosystems</mark> at a pace that many species can't keep up with. As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>
      <p>Species adapted to cold environments—like polar bears, snow leopards, and certain alpine plants—are seeing their <mark data-comment-id="thread-2" data-resolved="true">habitats shrink or disappear</mark> entirely. Some animals are migrating to higher altitudes or latitudes, but these shifts aren't always possible or fast enough, especially for species with limited mobility or specialised diets.</p>
    `, true); // Enable CommentMark extension

    // Initialize comment UI system with mock data
    const commentUI = useCommentUI(editor, {
      documentId: 'climate-change-ui-demo',
      editorId: 'bubble-menu-ui-demo',
      currentUser: 'user-1' // Elena Petrova from shared user data
    });

    // Load initial comments when editor is ready
    React.useEffect(() => {
      if (editor && commentUI.service && commentUI.pointerAdapter) {
        const existingThreads = new Map();

        // Find the commented text by content matching since TipTap parses HTML spans as regular elements
        const commentRanges = [
          { text: 'reshaping ecosystems', threadId: 'thread-1', resolved: false },
          { text: 'habitats shrink or disappear', threadId: 'thread-2', resolved: true }
        ];

        commentRanges.forEach(({ text, threadId, resolved }) => {
          const content = editor.state.doc.textContent;
          const startIndex = content.indexOf(text);

          if (startIndex !== -1) {
            // Find the actual document positions by walking through the document
            let currentTextPos = 0;
            let actualStart = -1;
            let actualEnd = -1;

            editor.state.doc.descendants((node, pos) => {
              if (node.isText) {
                const nodeText = node.textContent;
                const nodeStart = currentTextPos;
                const nodeEnd = currentTextPos + nodeText.length;

                // Check if our target text starts within this text node
                if (actualStart === -1 && startIndex >= nodeStart && startIndex < nodeEnd) {
                  actualStart = pos + (startIndex - nodeStart);
                }

                // Check if our target text ends within this text node
                if (actualEnd === -1 && (startIndex + text.length) > nodeStart && (startIndex + text.length) <= nodeEnd) {
                  actualEnd = pos + ((startIndex + text.length) - nodeStart);
                }

                currentTextPos += nodeText.length;
              }
            });

            if (actualStart !== -1 && actualEnd !== -1 && actualEnd > actualStart) {
              // Create pointer and thread
              const pointer = commentUI.pointerAdapter.createPointerForRange(actualStart, actualEnd);
              const thread = commentUI.service.createThread(pointer);

              // Apply comment mark to highlight the text
              editor.chain()
                .setTextSelection({ from: actualStart, to: actualEnd })
                .setMark('comment', { commentId: thread.id, resolved })
                .run();

              existingThreads.set(threadId, { thread, isResolved: resolved, pointer });
              console.log(`Created thread for "${text}" at positions ${actualStart}-${actualEnd}`);
            } else {
              console.warn(`Could not find positions for text: "${text}"`);
            }
          } else {
            console.warn(`Could not find text: "${text}" in document`);
          }
        });

        // Use shared comment data for demo - filtering comments for document entity
        const documentComments = getCommentsByEntity('document', 'doc-2').slice(0, 3); // Use first 3 comments
        const mockComments = documentComments.map((comment, index) => {
          const author = getUserById(comment.authorId);
          return {
            threadKey: index < 2 ? 'thread-1' : 'thread-2', // Group first two in thread-1, last in thread-2
            content: comment.content,
            author: comment.authorId, // Keep the user ID for consistency
            timestamp: comment.timestamp
          };
        });

        // Add comments to the actual thread IDs
        mockComments.forEach(comment => {
          const threadData = existingThreads.get(comment.threadKey);
          if (threadData) {
            commentUI.service.addComment(threadData.thread.id, comment.content, comment.author);

            // Resolve thread if marked as resolved
            if (threadData.isResolved) {
              commentUI.service.resolveThread(threadData.thread.id, 'system');
            }
          }
        });

        console.log(`Initialized ${existingThreads.size} comment threads`);
      }
    }, [editor, commentUI.service, commentUI.pointerAdapter]);

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

    const editor = useSimpleEditor(`
      <p>Climate change is reshaping ecosystems at a pace that many species can't keep up with. As temperatures rise, animals and plants are being pushed out of their natural habitats.</p>
    `);

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
