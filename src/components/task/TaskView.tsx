import React from 'react';
import { Task, TaskViewProps } from './types';
import { formatTimestamp } from './time-utils.js';

const getStatusBadgeClass = (status: Task['status']): string => {
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

export const TaskView: React.FC<TaskViewProps> = ({ task }) => {
  return (
    <div className="task-view">
      <header>
        <h2>{task.specification}</h2>
        <span className={getStatusBadgeClass(task.status)}>
          {task.status}
        </span>
      </header>

      {task.assignee && (
        <div>
          <strong>Assignee:</strong> {task.assignee}
        </div>
      )}

      {task.progress !== undefined && (
        <div>
          <progress value={task.progress} max={100}>{task.progress}%</progress>
          <span>{task.progress}%</span>
        </div>
      )}

      <section>
        <h3>Execution History</h3>
        <ol className="stepper">
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
    </div>
  );
};