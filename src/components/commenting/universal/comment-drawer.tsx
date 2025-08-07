import React, { useCallback, useEffect, useRef } from 'react';
import { CommentThread } from './comment-thread.js';
import type { CommentThread as CommentThreadType, UniversalComment } from '../../../services/commenting/document-pointer.js';

interface CommentDrawerProps {
  threads: CommentThreadType[];
  commentsMap: Map<string, UniversalComment[]>;
  currentUser: string;
  isOpen: boolean;
  onAddComment?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
  onClose?: () => void;
  activeThreadId?: string;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  threads,
  commentsMap,
  currentUser,
  isOpen,
  onAddComment,
  onResolveThread,
  onClose,
  activeThreadId
}) => {
  const modalRef = useRef<HTMLElement>(null);

  // Handle drawer open/close
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }
  }, [isOpen]);

  // Handle modal events
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };

    modal.addEventListener('close', handleClose);

    return () => {
      modal.removeEventListener('close', handleClose);
    };
  }, [onClose]);

  return (
    <pp-modal>
      <dialog
        ref={modalRef}
        className="drawer drawer--right"
      >
        <header>
          <h3>Comments</h3>
          <button className="button button--plain" data-close onClick={onClose}>
            <iconify-icon className="icon" icon="ph:x"></iconify-icon>
            <span className="inclusively-hidden">Close</span>
          </button>
        </header>

        <div>
          {threads.length === 0 ? (
            <div>
              <iconify-icon
                icon="ph:chat-circle"
              ></iconify-icon>
              <div>
                <p>No comments yet</p>
                <p>
                  Select text and click "Comment" to start a discussion
                </p>
              </div>
            </div>
          ) : (
            <section className='flow'>
              {threads.map(thread => {
                // Extract context from thread pointers
                const contextInfo = thread.pointers?.[0];
                let contextElement = null;

                if (contextInfo?.type === 'tiptap-text-range') {
                  const textPointer = contextInfo as any;
                  if (textPointer.text) {
                    const truncatedText = textPointer.text.slice(0, 50);
                    contextElement = (
                      <blockquote>
                        {truncatedText}{textPointer.text.length > 50 ? '...' : ''}
                      </blockquote>
                    );
                  }
                } else if (contextInfo?.type === 'item-view-section') {
                  const itemPointer = contextInfo as any;
                  contextElement = (
                    <div>
                      <iconify-icon icon="ph:target"></iconify-icon>
                      {itemPointer.sectionPath} ({itemPointer.viewScope})
                    </div>
                  );
                } else if (contextInfo) {
                  contextElement = (
                    <div>
                      <iconify-icon icon="ph:target"></iconify-icon>
                      {contextInfo.type}
                    </div>
                  );
                }

                return (
                  <div className='flow' key={thread.id} >
                    {contextElement && (
                      <div>
                        {contextElement}
                      </div>
                    )}
                    <CommentThread
                      thread={thread}
                      comments={commentsMap.get(thread.id) || []}
                      currentUser={currentUser}
                      onAddComment={onAddComment}
                      onResolveThread={onResolveThread}
                      showComposer={thread.status !== 'resolved'}
                    />
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </dialog>
    </pp-modal>
  );
};