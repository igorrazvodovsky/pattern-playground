import React from 'react';
import type { ItemViewProps } from '../../item-view/types';
import type { SelectedReference, UserMetadata, QuoteMetadata } from '../types';
import { isUserReference, isQuoteReference } from '../types';

export interface ReferencePreviewAdapterProps extends ItemViewProps<SelectedReference> {}

export const ReferencePreviewAdapter: React.FC<ReferencePreviewAdapterProps> = ({
  item: reference,
  onEscalate
}) => {
  const { type, label, metadata } = reference;
  const safeMetadata = metadata ?? {};

  if (isQuoteReference(reference)) {
    const { sourceDocument, createdAt, selectedText, plainText } = safeMetadata as QuoteMetadata;
    const displayText = plainText || selectedText || label;
    const truncatedText = displayText.length > 100 
      ? `${displayText.substring(0, 100)}...` 
      : displayText;

    return (
      <div className="reference-preview reference-preview--quote">
        <div className="reference-preview__quote-header">
          <iconify-icon icon="ph:quotes" className="reference-preview__quote-icon" />
          <div className="reference-preview__quote-content">
            <blockquote className="reference-preview__quote-text">
              "{truncatedText}"
            </blockquote>
            <div className="reference-preview__quote-meta">
              <span className="reference-preview__quote-source">
                from {sourceDocument || 'document'}
              </span>
              {createdAt && (
                <span className="reference-preview__quote-date">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        {onEscalate && (
          <div className="reference-preview__actions">
            <button
              className="reference-preview__action"
              onClick={() => onEscalate('mid')}
              type="button"
            >
              View quote
            </button>
          </div>
        )}
      </div>
    );
  }

  if (isUserReference(reference)) {
    const { role, email } = safeMetadata as UserMetadata;
    const initials = label
      ?.split(' ')
      ?.map(n => n?.at(0) ?? '')
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase() ?? 'N/A';

    return (
      <div className="reference-preview reference-preview--user">
        <div className="reference-preview__user-header">
          <div>
            {initials}
          </div>
          <div>
            <h4>{label}</h4>
            {role && <div>{role}</div>}
            {email && <div>{email}</div>}
          </div>
        </div>
        {onEscalate && (
          <div className="reference-preview__actions">
            <button
              className="reference-preview__action"
              onClick={() => onEscalate('mid')}
              type="button"
            >
              View profile
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="reference-preview reference-preview--generic">
      <div className="reference-preview__header">
        <div className="reference-preview__title-section">
          <h4 className="reference-preview__title">{label}</h4>
          <div className="reference-preview__type">{type}</div>
        </div>
      </div>

      {Object.keys(safeMetadata).length > 0 && (
        <div className="reference-preview__metadata">
          {Object.entries(safeMetadata).slice(0, 3).map(([key, value]) => (
            <div key={key} className="reference-preview__metadata-item">
              <span className="reference-preview__metadata-key">{key}:</span>
              <span className="reference-preview__metadata-value">{String(value ?? 'N/A')}</span>
            </div>
          ))}
        </div>
      )}

      {onEscalate && (
        <div className="reference-preview__actions">
          <button
            className="reference-preview__action"
            onClick={() => onEscalate('mid')}
            type="button"
          >
            View details
          </button>
        </div>
      )}
    </div>
  );
};