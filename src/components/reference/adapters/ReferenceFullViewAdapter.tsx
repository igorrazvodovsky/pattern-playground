import React from 'react';
import type { ItemViewProps } from '../../item-view/types';
import type { SelectedReference } from '../types';

export interface ReferenceFullViewAdapterProps extends ItemViewProps<SelectedReference> {}

export const ReferenceFullViewAdapter: React.FC<ReferenceFullViewAdapterProps> = ({ 
  item: reference, 
  onInteraction 
}) => {
  const { type, label, metadata, id } = reference;
  const safeMetadata = metadata || {};

  // Special handling for user references
  if (type === 'user') {
    const { 
      role, 
      email, 
      department, 
      location, 
      joinDate, 
      bio, 
      skills, 
      projects 
    } = safeMetadata as { 
      role?: string; 
      email?: string;
      department?: string;
      location?: string;
      joinDate?: string;
      bio?: string;
      skills?: string[];
      projects?: string[];
    };
    
    const initials = label
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="reference-full-view reference-full-view--user">
        <header className="reference-full-view__header">
          <div className="reference-full-view__user-header">
            <div className="reference-full-view__user-avatar reference-full-view__user-avatar--xl">
              {initials}
            </div>
            <div className="reference-full-view__user-info">
              <h1 className="reference-full-view__user-name">{label}</h1>
              <div className="reference-full-view__user-subtitle">
                {role && <span className="reference-full-view__user-role">{role}</span>}
                {department && <span className="reference-full-view__user-department">• {department}</span>}
              </div>
              <div className="reference-full-view__user-meta">
                <span className="reference-full-view__user-id">#{id}</span>
                {location && <span className="reference-full-view__user-location">📍 {location}</span>}
              </div>
            </div>
          </div>
          
          <div className="reference-full-view__toolbar">
            {onInteraction && (
              <>
                <button
                  className="reference-full-view__action reference-full-view__action--message"
                  onClick={() => onInteraction('edit', reference)}
                  type="button"
                >
                  Send Message
                </button>
                <button
                  className="reference-full-view__action reference-full-view__action--collaborate"
                  onClick={() => onInteraction('transform', reference)}
                  type="button"
                >
                  Collaborate
                </button>
              </>
            )}
          </div>
        </header>

        <main className="reference-full-view__content">
          <div className="reference-full-view__layout">
            <section className="reference-full-view__main">
              {bio && (
                <div className="reference-full-view__section">
                  <h2 className="reference-full-view__section-title">About</h2>
                  <p className="reference-full-view__bio">{bio}</p>
                </div>
              )}

              {email && (
                <div className="reference-full-view__section">
                  <h2 className="reference-full-view__section-title">Contact</h2>
                  <div className="reference-full-view__contact-info">
                    <div className="reference-full-view__contact-item">
                      <strong>Email:</strong> <a href={`mailto:${email}`}>{email}</a>
                    </div>
                    {joinDate && (
                      <div className="reference-full-view__contact-item">
                        <strong>Joined:</strong> {joinDate}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <aside className="reference-full-view__sidebar">
              {skills && skills.length > 0 && (
                <div className="reference-full-view__section">
                  <h3 className="reference-full-view__section-title">Skills</h3>
                  <div className="reference-full-view__tags">
                    {skills.map((skill, index) => (
                      <span key={index} className="reference-full-view__tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {projects && projects.length > 0 && (
                <div className="reference-full-view__section">
                  <h3 className="reference-full-view__section-title">Projects</h3>
                  <ul className="reference-full-view__list">
                    {projects.map((project, index) => (
                      <li key={index} className="reference-full-view__list-item">
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </main>
      </div>
    );
  }

  // Generic handling for other reference types
  return (
    <div className="reference-full-view reference-full-view--generic">
      <header className="reference-full-view__header">
        <div className="reference-full-view__title-section">
          <h1 className="reference-full-view__title">{label}</h1>
          <div className="reference-full-view__subtitle">
            <span className="reference-full-view__type">{type}</span>
            <span className="reference-full-view__id">#{id}</span>
          </div>
        </div>
        
        <div className="reference-full-view__toolbar">
          {onInteraction && (
            <>
              <button
                className="reference-full-view__action reference-full-view__action--edit"
                onClick={() => onInteraction('edit', reference)}
                type="button"
              >
                Edit
              </button>
              <button
                className="reference-full-view__action reference-full-view__action--transform"
                onClick={() => onInteraction('transform', reference)}
                type="button"
              >
                Transform
              </button>
            </>
          )}
        </div>
      </header>

      <main className="reference-full-view__content">
        <section className="reference-full-view__main">
          <h2 className="reference-full-view__section-title">Overview</h2>
          <p className="reference-full-view__description">
            This is a {type} reference with ID {id}.
          </p>
        </section>

        {Object.keys(safeMetadata).length > 0 && (
          <section className="reference-full-view__metadata">
            <h2 className="reference-full-view__section-title">Properties</h2>
            <div className="reference-full-view__property-grid">
              {Object.entries(safeMetadata).map(([key, value]) => (
                <div key={key} className="reference-full-view__property">
                  <dt className="reference-full-view__property-key">{key}</dt>
                  <dd className="reference-full-view__property-value">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </dd>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};