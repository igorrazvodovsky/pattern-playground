import { lazy } from 'react';

// Each registry's MentionEditor brings its own editor engine (Tiptap and
// ProseMirror), so it loads with the first demo that uses it, not with the
// registry every spec demo loads.

export const PpMentionEditor = lazy(() => import('./pp-mention-editor').then(m => ({ default: m.MentionEditor })));
export const ShadcnMentionEditor = lazy(() =>
  import('./shadcn-mention-editor').then(m => ({ default: m.MentionEditor })),
);
