import React, { useEffect, useRef } from 'react';
import { CommentThread } from './comment-thread';
import type { Comment, CommentThread as CommentThreadType } from '../../../services/commenting/core/comment-service';

interface CommentPopoverProps {
  thread: CommentThreadType;
  comments: Comment[];
  currentUser: string;
  onAddComment?: (threadId: string, content: string) => void;
  onResolveThread?: (threadId: string) => void;
  onClose?: () => void;
  onSwitchToDrawer?: () => void;
  isOpen?: boolean;
  triggerElement?: HTMLElement | null;
}

export const CommentPopover: React.FC<CommentPopoverProps> = ({
  thread,
  comments,
  currentUser,
  onAddComment,
  onResolveThread,
  onClose,
  onSwitchToDrawer,
  isOpen = false,
  triggerElement
}) => {
  const popupRef = useRef<HTMLElement & { active: boolean; anchor: Element | null; contains: (node: Node) => boolean }>(null);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;

    popup.active = isOpen;
    popup.anchor = triggerElement;
  }, [isOpen, triggerElement]);

  // Handle close events
  useEffect(() => {
    const popup = popupRef.current;
    if (!popup || !onClose) return;


    // Listen for clicks outside or escape key via document events
    const handleDocumentClick = (e: MouseEvent) => {
      if (popup && !popup.contains(e.target as Node) && !triggerElement?.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleDocumentKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleDocumentKeydown);
    }

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleDocumentKeydown);
    };
  }, [isOpen, onClose, triggerElement]);

  return (
    <pp-popup
      ref={popupRef}
    >
      <div className="popover">
        <div className='popover__toolbar'>
          <button
            className="button button--plain"
            onClick={onSwitchToDrawer}
            title="Open in drawer"
          >
            <iconify-icon className="icon" icon="ph:sidebar-simple"></iconify-icon>
            <span className="inclusively-hidden">Open in drawer</span>
          </button>
        </div>
        <CommentThread
          thread={thread}
          comments={comments}
          currentUser={currentUser}
          onAddComment={onAddComment}
          onResolveThread={onResolveThread}
        />
      </div>
    </pp-popup>
  );
};