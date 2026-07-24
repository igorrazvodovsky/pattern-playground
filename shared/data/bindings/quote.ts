import type { EntityBinding } from './types';

/**
 * Quotes (the quotes.json shape). The rich excerpt is behavioural — a
 * registered custom component renders the blockquote and source line —
 * while source and dates stay declarative. The quote action flags
 * (annotate/cite/challenge/pin) are host chrome, not attributes; they never
 * rendered through the adapter and don't bind here.
 */
export const quoteBinding: EntityBinding = {
  entityType: 'quote',
  attributes: [
    { path: 'name', role: 'title', valueType: 'string' },
    { path: 'content', label: 'Quote', role: 'description', valueType: 'custom' },
    { path: 'sourceDocument', label: 'Source', role: 'spec', valueType: 'string' },
    { path: 'createdAt', label: 'Created', role: 'footer', valueType: 'date' },
    { path: 'comments', label: 'Comments', role: 'spec', valueType: 'custom' },
  ],
  scopes: {
    micro: ['name'],
    mini: ['content'],
    mid: ['sourceDocument', 'createdAt', 'comments'],
    maxi: ['content', 'sourceDocument', 'createdAt', 'comments'],
  },
};
