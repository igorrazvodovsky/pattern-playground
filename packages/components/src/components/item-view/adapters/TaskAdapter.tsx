import React from 'react';
import type { ContentAdapter, ItemViewProps, TaskObject } from '../types';
import type { Task } from '../../../stories/data/task-types';
import { formatTimestamp } from '../../../utility/time-utils.js';
import { CommentThread } from '../../commenting/core/CommentThread.js';
import { getUserById } from '../../../stories/data';

const getStatusBadgeClass = (status: Task['status']['value']): string => {
  switch (status) {
    case 'submitted': return 'badge badge--info';
    case 'planning': return 'badge badge--warning';
    case 'executing': return 'badge badge--primary';
    case 'asking': return 'badge badge--caution';
    case 'completed': return 'badge badge--success';
    case 'failed': return 'badge badge--error';
    default: return 'badge';
  }
};

const renderMicroView = (task: Task) => (
  <span className="task-micro">
    <span className={`status-indicator status-${task.status.value}`} />
    {task.specification.substring(0, 50)}{task.specification.length > 50 ? '...' : ''}
  </span>
);

const renderMiniView = (task: Task) => (
  <div className="task-mini">
    <h4>{task.title}</h4>
    <div className="task-meta">
      <span className={getStatusBadgeClass(task.status.value)}>{task.status.label}</span>
      {task.assignee && <span className="assignee">{task.assignee.name}</span>}
    </div>
  </div>
);

const renderMidView = (task: Task) => (
  <div className="task-mid">
    <header>
      <h3>{task.title}</h3>
      <span className={getStatusBadgeClass(task.status.value)}>{task.status.label}</span>
    </header>
    {task.assignee && <div>Assignee: {task.assignee.name}</div>}
    {/* Recent history entries */}
    <div className="recent-history">
      {task.history.slice(-3).map(entry => (
        <div key={entry.id} className="history-entry">
          {entry.action} • {formatTimestamp(entry.timestamp)}
        </div>
      ))}
    </div>
  </div>
);


const renderMaxiView = (task: Task) => {
  const currentUser = getUserById('user-1');

  if (!currentUser) {
    return <div>Unable to load user context</div>;
  }

  return (
    <div className="task-maxi flow">
      <header className="flow">
        <span className={getStatusBadgeClass(task.status.value)}>
          {task.status.label}
        </span>
        <h2>{task.title}</h2>
      </header>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div role="table" className="attribute-list">
        <div role="row">
          <div role="cell" className="attribute-list__label muted">
            <div>Properties</div>
          </div>
          <div role="cell" className="attribute-list__value">
            {/* topics */}
            {/* people */}
            <span>
              <iconify-icon icon="ph:calendar" className="icon" />
              16:24 → Sep 10
            </span>
            {/* more... */}
          </div>
        </div>
        <div role="row">
          <div role="cell" className="attribute-list__label muted">
            <div>Initiatives</div>
          </div>
          <div role="cell" className="attribute-list__value">
            <div className="flex wrap">
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon> Sustainable packaging roadmap
              </span>
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon> EPR
              </span>
            </div>
          </div>
        </div>
        <div role="row">
          <div role="cell" className="attribute-list__label muted">
            <div>Depends on</div>
          </div>
          <div role="cell" className="attribute-list__value">
            <div className="flex wrap">
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon> Segregation practices
              </span>
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon>
                Sorting
              </span>
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon>
                Local regulations
              </span>
            </div>
          </div>
        </div>
        <div role="row">
          <div role="cell" className="attribute-list__label muted">
            <div>Resources</div>
          </div>
          <div role="cell" className="attribute-list__value">
            <div className="flex wrap">
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon> Waste audit
              </span>
              <span className="tag">
                <iconify-icon icon="ph:link"></iconify-icon>
                Policy & Regulatory Guidance
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* {task.assignee && (
        <div>
          <strong>Assignee:</strong> {task.assignee.name}
        </div>
      )} */}

      {/* {task.priority && (
        <div>
          <strong>Priority:</strong> {task.priority.label}
        </div>
      )} */}

      {/* {task.dueDate && (
        <div>
          <strong>Due Date:</strong> {task.dueDate.toLocaleDateString()}
        </div>
      )} */}

      <h3>History</h3>
      <section>
        <ol className="stepper" style={{ '--_circle-size': '2rem' } as React.CSSProperties}>
          {task.history.map((entry) => (
            <li key={entry.id} className="stepper__item">
              <div className="stepper__content">
                <h4>{entry.action}</h4>
                <p>
                  {entry.actor} • {formatTimestamp(entry.timestamp)}
                </p>
                {entry.details && (
                  <p className="muted">{entry.details}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <h3>Comments</h3>
      <section className="task-comments-section">
        <CommentThread
          entityType="task"
          entityId={task.id}
          currentUser={currentUser}
          className="task-comments"
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </section>
    </div>
  );
};

export const taskAdapter: ContentAdapter<'task'> = {
  contentType: 'task',
  supportedScopes: ['micro', 'mini', 'mid', 'maxi'],
  supportsCommenting: true,
  supportsRichContent: false,

  render: (props: ItemViewProps<'task'>) => {
    const taskObject = props.item as TaskObject;
    // Convert TaskObject back to Task for rendering
    const task: Task = {
      id: taskObject.id,
      title: taskObject.metadata?.title || taskObject.specification,
      specification: taskObject.specification,
      description: taskObject.metadata?.description,
      status: {
        id: `status-${taskObject.status}`,
        label: taskObject.status.charAt(0).toUpperCase() + taskObject.status.slice(1),
        value: taskObject.status as Task['status']['value'],
        color: '#orange'
      },
      history: taskObject.history,
      assignee: taskObject.assignee ? { id: 'user-1', name: taskObject.assignee } : undefined,
      progress: taskObject.progress,
      createdAt: taskObject.createdAt,
      metadata: taskObject.metadata
    };

    switch (props.scope) {
      case 'micro':
        return renderMicroView(task);
      case 'mini':
        return renderMiniView(task);
      case 'mid':
        return renderMidView(task);
      case 'maxi':
        return renderMaxiView(task);
      default:
        return renderMiniView(task);
    }
  }
};

// Helper function to convert unified Task to ItemView TaskObject format
export const taskToItemObject = (task: Task) => ({
  id: task.id,
  specification: task.specification,
  status: task.status.value,
  history: task.history,
  assignee: task.assignee?.name,
  progress: task.progress,
  createdAt: task.createdAt,
  metadata: {
    title: task.title,
    description: task.description,
    priority: task.priority?.value,
    tags: task.metadata?.tags || [],
    dueDate: task.dueDate,
    project: task.project?.name,
    ...task.metadata
  }
});