// The concept content files, by path, for the stack's id check. Its own module
// so that, while the catalogue is unpublished, a production build can swap it
// for an empty one (integrations/concepts-dev-only.ts).
export const conceptFiles: Record<string, unknown> = import.meta.glob(
  '/src/content/concepts/**/*.{md,mdx}',
);
