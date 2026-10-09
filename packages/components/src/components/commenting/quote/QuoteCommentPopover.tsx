import React, { useEffect, useRef } from 'react';
import { CommentThread } from '../core/CommentThread';
import type { QuoteObject } from '../../../services/commenting/quote-service';
import type { VirtualElement } from '../../popup/popup';
import { getUserById } from '@shared/data';
import '../../../jsx-types';

interface QuoteCommentPopoverProps {
  quote: QuoteObject;
  /** The quoted text: its reference once inserted, or the selection before. */
  anchor: Element | VirtualElement | null;
  currentUser: string;
  onClose: () => void;
  /** Runs after `onClose` when the actor leaves with Escape. */
  onEscape?: () => void;
  onCommentAdded?: (content: string) => void;
}

// The thread for a quote being commented on, floated beside the quoted text.
// `light-dismiss` hands outside-click and Escape to the platform; the owner
// follows through `pp-hide`.
export const QuoteCommentPopover: React.FC<QuoteCommentPopoverProps> = ({
  quote,
  anchor,
  currentUser,
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
        aria-label="Comment on quote"
        onKeyDown={(event) => {
          if (event.key !== 'Escape') return;
          onClose();
          onEscape?.();
        }}
      >
        <CommentThread
          entityType="quote"
          entityId={quote.id}
          currentUser={user}
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
          onCommentAdded={onCommentAdded}
        />
      </div>
    </pp-popup>
  );
};
