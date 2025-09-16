import React, { useEffect, useRef, useState } from 'react';
import { CommentThread } from '../core/CommentThread';
import type { QuoteObject } from '../../../services/commenting/core/quote-pointer';
import { getUserById } from '../../../stories/data/index';

interface QuoteCommentPopoverProps {
  quote: QuoteObject;
  isOpen: boolean;
  triggerElement: HTMLElement | null;
  currentUser: string;
  onClose: () => void;
  onCommentAdded?: (content: string) => void;
}

export const QuoteCommentPopover: React.FC<QuoteCommentPopoverProps> = ({
  quote,
  isOpen,
  triggerElement,
  currentUser,
  onClose,
  onCommentAdded
}) => {
  const user = getUserById(currentUser);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const handleCommentAdded = (content: string) => {
    onCommentAdded?.(content);
    // Don't close immediately - let user see the comment was added
  };

  useEffect(() => {
    if (!isOpen || !triggerElement) {
      return;
    }

    const updatePosition = () => {
      const rect = triggerElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, triggerElement]);

  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (popoverRef.current && popoverRef.current.contains(target)) {
        return;
      }

      if (triggerElement && triggerElement.contains(target)) {
        return;
      }

      onClose();
    };

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Add event listeners with a small delay to avoid immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleEscapeKey);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, triggerElement]);

  if (!isOpen || !triggerElement) {
    return null;
  }

  if (!user) {
    return null;
  }

  const popoverContent = (
    <div className="popover">
      <div className="quote-comment-popover__content">
        <CommentThread
          entityType="quote"
          entityId={quote.id}
          currentUser={user}
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
          onCommentAdded={handleCommentAdded}
        />
      </div>
    </div>
  );

  return (
    <div
      ref={popoverRef}
      className="quote-comment-popover-container"
      style={{
        position: 'fixed',
        zIndex: 1000,
        top: position.top,
        left: position.left,
        minWidth: '320px',
        maxWidth: '480px'
      }}
    >
      {popoverContent}
    </div>
  );
};