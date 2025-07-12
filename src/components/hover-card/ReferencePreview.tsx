import React from 'react';
import type { SelectedReference } from '../reference-picker/reference-picker-types';

export interface ReferencePreviewProps {
  reference: SelectedReference;
}

export const ReferencePreview: React.FC<ReferencePreviewProps> = ({ reference }) => {
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
      <div className="hover-card__user-preview">
        <div className="hover-card__user-avatar">
          {initials}
        </div>
        <div className="hover-card__user-info">
          <h4 className="hover-card__user-name">{label}</h4>
          {role && <div className="hover-card__user-role">{role}</div>}
          {email && <div className="hover-card__user-email">{email}</div>}
        </div>
      </div>
    );
  }

  // Generic handling for other reference types
  return (
    <div className="hover-card__reference-preview">
      <div className="hover-card__reference-header">
        <div>
          <h4 className="hover-card__reference-title">{label}</h4>
          <div className="hover-card__reference-type">{type}</div>
        </div>
      </div>
      {Object.keys(safeMetadata).length > 0 && (
        <div className="hover-card__reference-meta">
          {Object.entries(safeMetadata).map(([key, value]) => (
            <div key={key}>
              {key}: {String(value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};