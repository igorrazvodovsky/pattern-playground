import React from 'react';
import type { ItemViewProps } from '../../item-view/types';
import type { SelectedReference } from '../types';

export interface ReferenceDetailAdapterProps extends ItemViewProps<SelectedReference> {}

export const ReferenceDetailAdapter: React.FC<ReferenceDetailAdapterProps> = ({ 
  item: reference, 
  onEscalate,
  onInteraction 
}) => {
  const { type, label, metadata, id } = reference;
  const safeMetadata = metadata || {};

  // Special handling for user references
  if (type === 'user') {
    const { role, email, department, location, joinDate } = safeMetadata as { 
      role?: string; 
      email?: string;
      department?: string;
      location?: string;
      joinDate?: string;
    };
    
    const initials = label
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="reference-detail reference-detail--user">
        <div className="reference-detail__header">
          <div className="reference-detail__user-header">
            <div className="reference-detail__user-avatar reference-detail__user-avatar--large">
              {initials}
            </div>
            <div className="reference-detail__user-info">
              <h2 className="reference-detail__user-name">{label}</h2>
              {role && <div className="reference-detail__user-role">{role}</div>}
              {department && <div className="reference-detail__user-department">{department}</div>}
            </div>
          </div>
          <div className="reference-detail__actions">
            {onEscalate && (
              <button
                className="reference-detail__action reference-detail__action--expand"
                onClick={() => onEscalate('maxi')}
                type="button"
                title="View full profile"
              >
                ↗
              </button>
            )}
            {onInteraction && (
              <button
                className="reference-detail__action reference-detail__action--message"
                onClick={() => onInteraction('edit', reference)}
                type="button"
                title="Send message"
              >
                💬
              </button>
            )}
          </div>
        </div>

        <div className="reference-detail__content">
          {email && (
            <div className="reference-detail__contact-item">
              <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
            </div>
          )}
          {location && (
            <div className="reference-detail__contact-item">
              <strong>Location:</strong> {location}
            </div>
          )}
          {joinDate && (
            <div className="reference-detail__contact-item">
              <strong>Joined:</strong> {joinDate}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generic handling for other reference types
  return (
    <div className="reference-detail reference-detail--generic">
      <div className="reference-detail__header">
        <div className="reference-detail__title-section">
          <h2 className="reference-detail__title">{label}</h2>
          <div className="reference-detail__type">{type}</div>
        </div>
        <div className="reference-detail__actions">
          {onEscalate && (
            <button
              className="reference-detail__action reference-detail__action--expand"
              onClick={() => onEscalate('maxi')}
              type="button"
              title="Open full view"
            >
              ↗
            </button>
          )}
          {onInteraction && (
            <button
              className="reference-detail__action reference-detail__action--edit"
              onClick={() => onInteraction('edit', reference)}
              type="button"
              title="Edit reference"
            >
              ✎
            </button>
          )}
        </div>
      </div>
      
      <div className="reference-detail__content">
        <div className="reference-detail__id">
          <strong>ID:</strong> {id}
        </div>
        
        {Object.keys(safeMetadata).length > 0 && (
          <div className="reference-detail__metadata">
            <h3 className="reference-detail__section-title">Properties</h3>
            <dl className="reference-detail__metadata-list">
              {Object.entries(safeMetadata).map(([key, value]) => (
                <div key={key} className="reference-detail__metadata-item">
                  <dt className="reference-detail__metadata-key">{key}</dt>
                  <dd className="reference-detail__metadata-value">{String(value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
};