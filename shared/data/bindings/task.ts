import type { EntityBinding } from './types';

/**
 * Tasks (the unified Task shape from task-types). Everything declarative the
 * retired TaskAdapter rendered is an entry here; `history` and `comments`
 * are the behavioural residue — rendered by registered custom components
 * (the execution stepper, the comment thread), never generically.
 */
export const taskBinding: EntityBinding = {
  entityType: 'task',
  attributes: [
    { path: 'title', role: 'title', valueType: 'string' },
    { path: 'description', role: 'description', valueType: 'string' },
    { path: 'specification', label: 'Specification', role: 'spec', valueType: 'string' },
    { path: 'status.label', label: 'Status', role: 'badge', valueType: 'status', icon: 'ph:circle-dashed' },
    { path: 'priority.label', label: 'Priority', role: 'badge', valueType: 'status', icon: 'ph:cell-signal-high' },
    { path: 'assignee.name', label: 'Assignee', role: 'spec', valueType: 'string', icon: 'ph:user' },
    // The label names as strings: hydration writes them to `metadata.tags`
    // (task.labels holds the rich objects), and path resolution descends into
    // `metadata` transparently.
    { path: 'tags', label: 'Labels', role: 'tag', valueType: 'string', icon: 'ph:tag', many: true },
    { path: 'progress', label: 'Progress', role: 'spec', valueType: 'progress' },
    { path: 'createdAt', label: 'Created', role: 'footer', valueType: 'date', icon: 'ph:calendar-plus' },
    { path: 'updatedAt', label: 'Updated', role: 'footer', valueType: 'date', icon: 'ph:calendar-check' },
    { path: 'dueDate', label: 'Due', role: 'spec', valueType: 'date', icon: 'ph:calendar' },
    { path: 'history', label: 'History', role: 'spec', valueType: 'custom' },
    { path: 'comments', label: 'Comments', role: 'spec', valueType: 'custom' },
  ],
  scopes: {
    micro: ['title'],
    mini: ['title', 'status.label', 'assignee.name'],
    mid: ['status.label', 'assignee.name', 'history'],
    maxi: [
      'status.label',
      'description',
      'assignee.name',
      'progress',
      'createdAt',
      'history',
      'comments',
    ],
  },
};
