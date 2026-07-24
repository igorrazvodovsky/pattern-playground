import type { EntityBinding } from './types';

/** Projects — fully declarative; nothing bespoke survived the adapter. */
export const projectBinding: EntityBinding = {
  entityType: 'project',
  attributes: [
    { path: 'icon', role: 'thumbnail', valueType: 'image' },
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'description', role: 'description', valueType: 'string' },
    { path: 'status', label: 'Status', role: 'badge', valueType: 'status' },
    { path: 'phase', label: 'Phase', role: 'spec', valueType: 'string' },
    { path: 'updatedAt', label: 'Updated', role: 'footer', valueType: 'date' },
    { path: 'updatedBy', label: 'Updated by', role: 'spec', valueType: 'string' },
  ],
  scopes: {
    micro: ['icon', 'name'],
    mini: ['icon', 'name', 'status', 'phase'],
    mid: ['status', 'description', 'phase', 'updatedAt'],
    maxi: ['status', 'description', 'phase', 'updatedAt', 'updatedBy'],
  },
};
