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
    { path: 'status.label', label: 'Status', role: 'badge', valueType: 'status' },
    { path: 'assignee.name', label: 'Assignee', role: 'spec', valueType: 'string' },
    { path: 'progress', label: 'Progress', role: 'spec', valueType: 'progress' },
    { path: 'createdAt', label: 'Created', role: 'footer', valueType: 'date' },
    { path: 'dueDate', label: 'Due', role: 'spec', valueType: 'date' },
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
