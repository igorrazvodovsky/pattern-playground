import React, { useEffect, useRef } from 'react';
import { UniversalCommentInterface } from '../universal/UniversalCommentInterface.js';
import type { QuoteObject } from '../../../services/commenting/quote-service.js';
import { getUserById } from '../../../stories/data/index.js';

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
  const user = getUserById(currentUser);
  const popoverRef = useRef<HTMLDivElement>(null);
  
  const handleCommentAdded = () => {
    onCommentAdded?.();
    // Don't close immediately - let user see the comment was added
  };

  // Handle clicks outside the popover
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as Node;
      
      // Don't close if clicking inside the popover
      if (popoverRef.current && popoverRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on the trigger element
      if (triggerElement && triggerElement.contains(target)) {
        return;
      }
      
      // Close the popover
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
        <UniversalCommentInterface
          entityType="quote"
          entityId={quote.id}
          currentUser={user}
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </div>
    </div>
  );

  // For manual positioning with trigger element, we'll use a portal approach
  // Since PpHoverCard is designed for hover interactions, we'll render directly
  return (
    <div
      ref={popoverRef}
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