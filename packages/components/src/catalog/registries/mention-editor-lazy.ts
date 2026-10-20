import { lazy } from 'react';

// Each editor engine (Tiptap, ProseMirror) loads with the first demo that
// uses it, not with the registry every spec demo loads.

export const PpMentionEditor = lazy(() => import('./pp-mention-editor').then(m => ({ default: m.MentionEditor })));
export const ShadcnMentionEditor = lazy(() =>
  import('./shadcn-mention-editor').then(m => ({ default: m.MentionEditor })),
);
