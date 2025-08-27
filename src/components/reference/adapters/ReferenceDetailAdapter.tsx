import React from 'react';
import type { ItemViewProps } from '../../item-view/types';
import type { SelectedReference, UserMetadata } from '../types';
import { isUserReference } from '../types';

export interface ReferenceDetailAdapterProps extends ItemViewProps<SelectedReference> {}

export const ReferenceDetailAdapter: React.FC<ReferenceDetailAdapterProps> = ({
  item: reference,
  onEscalate,
  onInteraction
}) => {
  const { type, label, metadata, id } = reference;
  const safeMetadata = metadata ?? {};
  const description = safeMetadata.description as string | undefined;

  if (isUserReference(reference)) {
    const { role, email, department, location, joinDate } = safeMetadata as UserMetadata;

    const initials = label
      ?.split(' ')
      ?.map(n => n?.at(0) ?? '')
      ?.join('')
      ?.substring(0, 2)
      ?.toUpperCase() ?? 'N/A';

    return (
      <div className="reference-detail reference-detail--user">
        <div className="reference-detail__header">
          <div className="reference-detail__user-header">
            <div className="reference-detail__user-avatar reference-detail__user-avatar--large">
              {initials}
            </div>
            <div className="reference-detail__user-info">
              <h2 className="reference-detail__user-name">{label}</h2>
              {description && <div className="reference-detail__user-description">{description}</div>}
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

  return (
    <div className="flow">
      <div className="reference-detail__header">
        <div className="reference-detail__title-section">
          {description && <div className="reference-detail__description">{description}</div>}
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

        {Object.keys(safeMetadata).filter(key => key !== 'description').length > 0 && (
          <div className="reference-detail__metadata">
            <dl className="reference-detail__metadata-list">
              {Object.entries(safeMetadata).filter(([key]) => key !== 'description').map(([key, value]) => (
                <div key={key} className="reference-detail__metadata-item">
                  <dt className="reference-detail__metadata-key">{key}</dt>
                  <dd className="reference-detail__metadata-value">{String(value ?? 'N/A')}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {/* Placeholder actions section */}
          <pp-list className='borderless'>
            {type === 'document' && (
              <>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:eye"></iconify-icon>
                  View document
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:download-simple"></iconify-icon>
                  Download
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:share-network"></iconify-icon>
                  Share
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:trash"></iconify-icon>
                  Delete
                </pp-list-item>
              </>
            )}
            {type === 'user' && (
              <>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:chat-circle"></iconify-icon>
                  Send message
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:calendar-plus"></iconify-icon>
                  Schedule meeting
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:user-plus"></iconify-icon>
                  Add to team
                </pp-list-item>
              </>
            )}
            {type === 'project' && (
              <>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:folder-open"></iconify-icon>
                  Open project
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:users"></iconify-icon>
                  View team
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:chart-line"></iconify-icon>
                  View progress
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:archive"></iconify-icon>
                  Archive project
                </pp-list-item>
              </>
            )}
            {type === 'quote' && (
              <>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:copy"></iconify-icon>
                  Copy quote
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:link"></iconify-icon>
                  Copy link
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:bookmark-simple"></iconify-icon>
                  Add to collection
                </pp-list-item>
                <pp-list-item>
                  <iconify-icon className="icon" slot="prefix" icon="ph:trash"></iconify-icon>
                  Delete
                </pp-list-item>
              </>
            )}
          </pp-list>
        </div>
      </div>
  );
};