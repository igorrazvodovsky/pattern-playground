import { lazy } from 'react';

// The editor engine loads with the first demo that uses it, not with the
// registry every spec demo loads.

export const PpMentionEditor = lazy(() =>
  import('./mention-editor').then((m) => ({ default: m.MentionEditor })),
);
