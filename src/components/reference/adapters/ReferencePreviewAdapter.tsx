import React from 'react';
import type { ItemViewProps } from '../../item-view/types';
import type { SelectedReference } from '../types';

export interface ReferencePreviewAdapterProps extends ItemViewProps<SelectedReference> {}

export const ReferencePreviewAdapter: React.FC<ReferencePreviewAdapterProps> = ({
  item: reference,
  onEscalate,
  onInteraction
}) => {
  const { type, label, metadata } = reference;
  const safeMetadata = metadata || {};

  // Special handling for user references
  if (type === 'user') {
    const { role, email } = safeMetadata as { role?: string; email?: string };
    const initials = label
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

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

  // Generic handling for other reference types
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
              <span className="reference-preview__metadata-value">{String(value)}</span>
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