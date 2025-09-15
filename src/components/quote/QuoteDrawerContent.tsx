import React from 'react';
import { UniversalCommentInterface } from '../commenting/universal/UniversalCommentInterface';
import type { QuoteObject } from '../../services/commenting/quote-service';
import type { User } from '../../stories/data';

interface QuoteDrawerContentProps {
  quote: QuoteObject;
  currentUser: User;
  onClose?: () => void;
}

export const QuoteDrawerContent: React.FC<QuoteDrawerContentProps> = ({
  quote,
  currentUser
}) => {
  return (
    <div className="quote-drawer">
      <section className="quote-drawer__content flow">
        <small className="dimmed">
          From {quote.metadata.sourceDocument}
        </small>
        
        <UniversalCommentInterface
          entityType="quote"
          entityId={quote.id}
          currentUser={currentUser}
          className="quote-comments-drawer"
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </section>
    </div>
  );
};