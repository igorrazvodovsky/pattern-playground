import type { EntityBinding } from './types';

/**
 * The generic reference shape (`{ id, label, type, metadata }`) that inline
 * mentions fall back to when the referenced entity's own type has no
 * binding. The named entries cover the user-shaped metadata the reference
 * views curated; 'metadata' is the one custom residue — a registered
 * component renders whatever metadata the named entries didn't claim, so a
 * material or service reference still shows its attributes.
 */
export const referenceBinding: EntityBinding = {
  entityType: 'reference',
  attributes: [
    { path: 'label', role: 'title', valueType: 'string' },
    { path: 'type', label: 'Type', role: 'subtitle', valueType: 'string' },
    { path: 'description', role: 'description', valueType: 'string' },
    { path: 'bio', label: 'About', role: 'description', valueType: 'string' },
    { path: 'role', label: 'Role', role: 'spec', valueType: 'string' },
    { path: 'email', label: 'Email', role: 'spec', valueType: 'link' },
    { path: 'department', label: 'Department', role: 'spec', valueType: 'string' },
    { path: 'location', label: 'Location', role: 'spec', valueType: 'string' },
    { path: 'joinDate', label: 'Joined', role: 'spec', valueType: 'string' },
    { path: 'skills', label: 'Skills', role: 'tag', valueType: 'string' },
    { path: 'metadata', label: 'Properties', role: 'spec', valueType: 'custom' },
  ],
  scopes: {
    micro: ['label'],
    mini: ['label', 'type', 'description'],
    mid: ['description', 'role', 'email', 'department', 'location', 'joinDate', 'metadata'],
    maxi: [
      'description',
      'bio',
      'role',
      'email',
      'department',
      'location',
      'joinDate',
      'skills',
      'metadata',
    ],
  },
};
