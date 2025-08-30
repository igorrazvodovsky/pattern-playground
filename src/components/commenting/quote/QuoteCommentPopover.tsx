import React, { useEffect, useRef, useState } from 'react';
import { UniversalCommentInterface } from '../universal/UniversalCommentInterface';
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
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  const handleCommentAdded = (content: string) => {
    onCommentAdded?.(content);
    // Don't close immediately - let user see the comment was added
  };

  // Update position when trigger element changes
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

    // Initial positioning
    updatePosition();

    // Update position when window resizes or scrolls
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen, triggerElement]);

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
          onCommentAdded={handleCommentAdded}
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