import React from 'react';
import { CommentComposer } from '../universal/RichCommentComposer.js';
import { useAddComment } from '../../../services/commenting/hooks/use-universal-commenting.js';
import type { QuoteObject } from '../../../services/commenting/quote-service.js';
import type { RichContent } from '../../../stories/data/index.js';

interface QuoteCommentPopoverProps {
  quote: QuoteObject;
  isOpen: boolean;
  triggerElement: HTMLElement | null;
  currentUser: string;
  onClose: () => void;
  onCommentAdded?: () => void;
}

/**
 * Quote-specific comment popover using PpHoverCard
 * Provides a clean, positioned interface for adding comments to quotes
 */
export const QuoteCommentPopover: React.FC<QuoteCommentPopoverProps> = ({
  quote,
  isOpen,
  triggerElement,
  currentUser,
  onClose,
  onCommentAdded
}) => {
  const { submitComment, isSubmitting } = useAddComment();

  const handleSubmit = async (content: RichContent) => {
    try {
      await submitComment('quote', quote.id, content, currentUser);
      onCommentAdded?.();
      onClose();
    } catch (error) {
      console.error('Failed to add comment to quote:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen || !triggerElement) {
    return null;
  }

  const popoverContent = (
    <div className="popover">
      <div className="quote-comment-popover__content">
        <CommentComposer
          currentUser={currentUser}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          placeholder={`Comment on this quote...`}
          autoFocus={true}
        />
      </div>
    </div>
  );

  // For manual positioning with trigger element, we'll use a portal approach
  // Since PpHoverCard is designed for hover interactions, we'll render directly
  return (
    <div
      className="quote-comment-popover-container"
      style={{
        position: 'fixed',
        zIndex: 1000,
        top: triggerElement.getBoundingClientRect().bottom + 8,
        left: triggerElement.getBoundingClientRect().left,
        minWidth: '320px',
        maxWidth: '480px'
      }}
    >
      {popoverContent}
    </div>
  );
};