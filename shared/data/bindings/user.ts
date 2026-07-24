import type { EntityBinding } from './types';

/** Users (the users.json shape): a person as an entity in their own right. */
export const userBinding: EntityBinding = {
  entityType: 'user',
  attributes: [
    { path: 'icon', role: 'thumbnail', valueType: 'image' },
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'description', role: 'subtitle', valueType: 'string' },
    { path: 'role', label: 'Role', role: 'spec', valueType: 'string' },
    { path: 'email', label: 'Email', role: 'spec', valueType: 'link' },
    { path: 'timezone', label: 'Timezone', role: 'spec', valueType: 'string' },
    { path: 'lastActiveAt', label: 'Last active', role: 'footer', valueType: 'date' },
  ],
  scopes: {
    micro: ['icon', 'name'],
    mini: ['icon', 'name', 'description'],
    mid: ['description', 'role', 'email', 'timezone'],
    maxi: ['description', 'role', 'email', 'timezone', 'lastActiveAt'],
  },
};
