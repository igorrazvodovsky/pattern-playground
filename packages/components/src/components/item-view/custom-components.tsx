import React from 'react';
import type { CustomAttributeProps, CustomComponents } from './types';
import { getValueAtPath, getUserById } from '@shared/data';
import type { TaskHistoryEntry } from '@shared/data/task-types';
import { isoDateTime } from '@shared/format';
import '../../jsx-types';
import { CommentThread } from '../commenting/core/CommentThread.js';

/**
 * The default custom-component registry: the behavioural residue the
 * bindings can't describe. Meridian's own reproductions all needed custom
 * components; the goal was never zero custom code — it is that everything
 * *declarative* stops being code. Each component owns its section markup.
 */

/** Task execution history: recent entries at mid, the full stepper at maxi. */
const TaskHistory: React.FC<CustomAttributeProps> = ({ item, attribute, scope }) => {
  const history = getValueAtPath(item, attribute.path) as TaskHistoryEntry[] | undefined;
  if (!history || history.length === 0) return null;

  if (scope !== 'maxi') {
    return (
      <div className="recent-history">
        {history.slice(-3).map((entry) => (
          <div key={entry.id} className="history-entry">
            {entry.action} • <pp-timestamp value={isoDateTime(entry.timestamp)}></pp-timestamp>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="flow">
      <h3>History</h3>
      <ol className="stepper" style={{ '--_circle-size': '2rem' } as React.CSSProperties}>
        {history.map((entry) => (
          <li key={entry.id} className="stepper__item">
            <div className="stepper__content">
              <h4>{entry.action}</h4>
              <p>
                {entry.actor} • <pp-timestamp value={isoDateTime(entry.timestamp)}></pp-timestamp>
              </p>
              {entry.details && <p className="muted">{entry.details}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};

/** The comment thread for any commentable entity type. */
const EntityComments: React.FC<CustomAttributeProps> = ({ item, entityType, scope }) => {
  const currentUser = getUserById('user-1');
  if (!currentUser) return null;

  return (
    <section className="flow">
      {scope === 'maxi' && <h3>Comments</h3>}
      <CommentThread
        entityType={entityType}
        entityId={item.id}
        currentUser={currentUser}
        showHeader={false}
        allowNewComments={true}
        maxHeight={scope === 'maxi' ? '400px' : '300px'}
      />
    </section>
  );
};

/** The quoted excerpt with its source line. */
const QuoteContent: React.FC<CustomAttributeProps> = ({ item, attribute }) => {
  const content = getValueAtPath(item, attribute.path) as
    | { plainText?: string }
    | undefined;
  const source = getValueAtPath(item, 'sourceDocument');
  if (!content?.plainText) return null;

  return (
    <div className="flow">
      <blockquote className="callout layer">{content.plainText}</blockquote>
      {source != null && <small className="dimmed">From {String(source)}</small>}
    </div>
  );
};

/** Leftover reference metadata: whatever the binding's named entries didn't
    claim, so a material or service reference still shows its attributes. */
const ReferenceMetadata: React.FC<CustomAttributeProps> = ({ item }) => {
  const metadata = (item as { metadata?: Record<string, unknown> }).metadata;
  if (!metadata) return null;

  const claimed = new Set([
    'description',
    'bio',
    'role',
    'email',
    'department',
    'location',
    'joinDate',
    'skills',
  ]);
  const entries = Object.entries(metadata).filter(
    ([key, value]) => !claimed.has(key) && value != null
  );
  if (entries.length === 0) return null;

  return (
    <div role="table" className="attribute-list">
      {entries.map(([key, value]) => (
        <div role="row" key={key}>
          <div role="cell" className="attribute-list__label muted">
            <div>{key}</div>
          </div>
          <div role="cell" className="attribute-list__value">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        </div>
      ))}
    </div>
  );
};

export const defaultCustomComponents: CustomComponents = {
  'task.history': TaskHistory,
  'task.comments': EntityComments,
  'quote.content': QuoteContent,
  'quote.comments': EntityComments,
  'reference.metadata': ReferenceMetadata,
};
