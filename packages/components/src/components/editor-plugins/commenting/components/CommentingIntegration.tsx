import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditorContext } from '../../../editor/EditorProvider';
import { CommentPopover } from '../../../commenting/core/CommentPopover';
import { COMMENTING_PLUGIN_ID, EditorCommentingPlugin, type CommentingPluginConfig, type OpenThread } from '../CommentingPlugin';
import { CommentsPanel } from './CommentsPanel';
import { modalService } from '../../../../services/modal-service';
import { getCommentService } from '../../../../services/commenting/core/comment-service-instance';
import type { VirtualElement } from '../../../popup/popup';

interface CommentingIntegrationProps {
  config: Pick<CommentingPluginConfig, 'currentUser'>;
  children: React.ReactNode;
}

// The commenting interface around an editor: the thread popover beside a
// passage, and the drawer listing every thread. Must render inside
// EditorProvider, with the commenting plugin registered and the Commenting
// extension on the editor.
export const CommentingIntegration: React.FC<CommentingIntegrationProps> = ({
  config,
  children,
}) => {
  const { editor, eventBus, getPlugin } = useEditorContext();
  const getCommentingPlugin = useCallback(() => {
    const plugin = getPlugin(COMMENTING_PLUGIN_ID);
    return plugin instanceof EditorCommentingPlugin ? plugin : null;
  }, [getPlugin]);

  const [openThread, setOpenThread] = useState<OpenThread | null>(null);

  useEffect(() => eventBus.on('commenting:thread-opened', ({ thread }) => {
    setOpenThread(thread);
  }), [eventBus]);

  useEffect(() => eventBus.on('commenting:thread-closed', ({ id }) => {
    setOpenThread(current => current?.id === id ? null : current);
  }), [eventBus]);

  // Clicking a commented or quoted passage reopens its thread. Where marks
  // overlap, the innermost one is the one clicked.
  useEffect(() => {
    const dom = editor.view.dom;
    const handleClick = (event: MouseEvent) => {
      if (!editor.state.selection.empty) return;
      const mark = (event.target as Element | null)?.closest?.('mark[data-comment-id], mark[data-quote-id]');
      const threadId = mark?.getAttribute('data-comment-id');
      const quoteId = mark?.getAttribute('data-quote-id');
      if (threadId) getCommentingPlugin()?.openThread(threadId);
      else if (quoteId) getCommentingPlugin()?.openQuoteThread(quoteId);
    };
    dom.addEventListener('click', handleClick);
    return () => dom.removeEventListener('click', handleClick);
  }, [editor, getCommentingPlugin]);

  // The thread list opens in a non-modal drawer beside the document.
  const drawerId = useRef<string | null>(null);
  useEffect(() => {
    const unsubscribe = eventBus.on('commenting:show-threads', () => {
      const plugin = getCommentingPlugin();
      if (!plugin) return;
      if (drawerId.current) {
        modalService.closeModal(drawerId.current);
        drawerId.current = null;
        return;
      }
      drawerId.current = modalService.openDrawer(
        <CommentsPanel editor={editor} plugin={plugin} currentUser={config.currentUser} />,
        {
          position: 'right',
          title: 'Comments',
          modal: false,
          onClose: () => { drawerId.current = null; },
        }
      );
    });
    return () => {
      unsubscribe();
      if (drawerId.current) modalService.closeModal(drawerId.current);
      drawerId.current = null;
    };
  }, [eventBus, editor, getCommentingPlugin, config.currentUser]);

  // Anchor the popover to the passage: the selection while the thread is
  // pending, the marked text after. Measured on every reposition. If the
  // passage is gone for a moment, the popover stays where it was.
  const anchor = useMemo<VirtualElement | null>(() => {
    if (!openThread) return null;
    const { view } = editor;
    let last = DOMRect.fromRect();
    return {
      contextElement: view.dom,
      getBoundingClientRect: () => {
        const range = getCommentingPlugin()?.rangeOf(openThread);
        if (!range) return last;
        const size = view.state.doc.content.size;
        const start = view.coordsAtPos(Math.min(range.from, size));
        const end = view.coordsAtPos(Math.min(range.to, size), -1);
        const left = Math.min(start.left, end.left);
        last = DOMRect.fromRect({
          x: left,
          y: start.top,
          width: Math.max(start.right, end.right) - left,
          height: end.bottom - start.top,
        });
        return last;
      },
    };
  }, [editor, openThread, getCommentingPlugin]);

  const handleClose = useCallback(() => {
    if (openThread?.pending) {
      getCommentingPlugin()?.discardThread(openThread.id);
    }
    setOpenThread(null);
  }, [openThread, getCommentingPlugin]);

  // Escape hands the keyboard back to the document, with the cursor just
  // after the passage. Read before closing: a discarded thread has no range.
  const rangeOnEscape = useRef<{ from: number; to: number } | null>(null);
  const handleKeyDownCapture = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && openThread) {
      rangeOnEscape.current = getCommentingPlugin()?.rangeOf(openThread) ?? null;
    }
  };
  const returnFocusToDocument = () => {
    const range = rangeOnEscape.current;
    rangeOnEscape.current = null;
    const end = Math.min(range?.to ?? editor.state.selection.to, editor.state.doc.content.size);
    editor.chain().focus().setTextSelection(end).run();
  };

  // The thread has stored the comment; the first one marks the passage. A
  // passage that could not be marked would leave the comment unreachable,
  // so it is removed and the thread closes.
  const handleCommentAdded = async () => {
    if (!openThread?.pending) return;
    if (getCommentingPlugin()?.confirmThread(openThread.id)) {
      setOpenThread({ ...openThread, pending: false });
      return;
    }
    setOpenThread(null);
    await getCommentService().deleteThread(openThread.pointer);
  };

  // Formalising a remark: the passage becomes a quote other places can
  // refer to, its words stay put, and the thread moves with it. If that
  // fails, the passage keeps its thread and the popover stays open on it.
  const handleQuote = async () => {
    if (openThread?.kind !== 'passage' || openThread.pending) return;
    try {
      await getCommentingPlugin()?.quoteThread(openThread.id);
    } catch (error) {
      console.error('Could not turn the passage into a quote:', error);
    }
  };

  const label = openThread?.pending
    ? 'Comment on selection'
    : openThread?.kind === 'quote' ? 'Comments on quote' : 'Comments on passage';

  return (
    <>
      {children}

      {openThread && (
        <div onKeyDownCapture={handleKeyDownCapture}>
          <CommentPopover
            key={openThread.id}
            pointer={openThread.pointer}
            label={label}
            anchor={anchor}
            currentUser={config.currentUser}
            placeholder={openThread.pending ? 'Comment on this passage...' : 'Reply...'}
            actions={openThread.kind === 'passage' && !openThread.pending && (
              <button
                type="button"
                className="button button--small"
                onClick={handleQuote}
                title="Make this passage a quote other documents can refer to. The words stay here."
              >
                <iconify-icon className="icon" icon="ph:quotes"></iconify-icon>
                Turn into quote
              </button>
            )}
            onClose={handleClose}
            onEscape={returnFocusToDocument}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </>
  );
};
