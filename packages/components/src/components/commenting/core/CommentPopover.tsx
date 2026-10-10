import React, { useEffect, useRef } from 'react';
import { CommentThread } from './CommentThread';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';
import type { VirtualElement } from '../../popup/popup';
import { getUserById } from '@shared/data';
import '../../../jsx-types';

interface CommentPopoverProps {
  pointer: CommentPointer;
  /** What is being commented on, for the dialog's accessible name. */
  label: string;
  /** The commented content, or the selection before the first comment. */
  anchor: Element | VirtualElement | null;
  currentUser: string;
  placeholder?: string;
  /** Commands about the commented thing, shown below the thread. */
  actions?: React.ReactNode;
  onClose: () => void;
  /** Runs after `onClose` when the actor leaves with Escape. */
  onEscape?: () => void;
  onCommentAdded?: (content: string) => void;
}

// A thread floated beside what it is about. `light-dismiss` hands
// outside-click and Escape to the platform; the owner follows through `pp-hide`.
export const CommentPopover: React.FC<CommentPopoverProps> = ({
  pointer,
  label,
  anchor,
  currentUser,
  placeholder,
  actions,
  onClose,
  onEscape,
  onCommentAdded
}) => {
  const user = getUserById(currentUser);
  const popupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const popup = popupRef.current;
    if (!popup) return;
    popup.addEventListener('pp-hide', onClose);
    return () => popup.removeEventListener('pp-hide', onClose);
  }, [onClose]);

  if (!user || !anchor) {
    return null;
  }

  return (
    <pp-popup
      ref={popupRef}
      anchor={anchor}
      active={true}
      placement="bottom-start"
      distance={8}
      flip
      shift
      top-layer={true}
      light-dismiss={true}
    >
      {/* ProseMirror marks Escape as handled, so the platform never sees it
          while the composer has focus; catch it on the way out instead. */}
      <div
        className="popover"
        role="dialog"
        aria-label={label}
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          // Escape closes the innermost layer only. Drawers listen for it on
          // the document, and the thread list may be open in one.
          event.stopPropagation();
          onClose();
          onEscape?.();
        }}
      >
        <CommentThread
          pointer={pointer}
          currentUser={user}
          allowNewComments={true}
          placeholder={placeholder}
          onCommentAdded={onCommentAdded}
        />
        {actions && <div className="toolbar">{actions}</div>}
      </div>
    </pp-popup>
  );
};
