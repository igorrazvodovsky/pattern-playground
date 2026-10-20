// The one switch for publishing the concept catalogue. While false, the
// catalogue exists only under `astro dev`: lib/site.ts derives
// CONCEPTS_ENABLED from it, and integrations/concepts-dev-only.ts keeps the
// concept files out of production builds. Set it to true to publish.
// Plain module, no `import.meta.env`, so the Astro config can read it too.
export const CONCEPTS_PUBLISHED = false;
