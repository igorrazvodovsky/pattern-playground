import type { ReactNode } from 'react';

interface PatternRefProps {
  slug: string;
  hash?: string;
  children: ReactNode;
}

declare const process: { env: Record<string, string | undefined> } | undefined;

const importMetaEnv =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};

const patternSiteUrl =
  importMetaEnv.STORYBOOK_PATTERN_SITE_URL ??
  (typeof process !== 'undefined' ? process.env.STORYBOOK_PATTERN_SITE_URL : undefined) ??
  'http://localhost:4321';

export function PatternRef({ slug, hash, children }: PatternRefProps) {
  const path = slug.startsWith('/') ? slug : `/patterns/${slug.replace(/^\//, '')}`;
  const href = hash ? `${patternSiteUrl}${path}#${hash.replace(/^#/, '')}` : `${patternSiteUrl}${path}`;
  return <a href={href}>{children}</a>;
}
