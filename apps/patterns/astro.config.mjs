import { defineConfig } from 'astro/config';
import lit from '@astrojs/lit';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'url';
import path from 'path';
import remarkRelStrip from '../../shared/remark-rel-strip.ts';
import validateCrossReferences from './integrations/validate-cross-references.ts';
import watchDepRegistry from './integrations/watch-dep-registry.ts';
import forceMdxInvalidation from './integrations/force-mdx-invalidation.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [lit(), mdx(), react(), validateCrossReferences()],
  publicDir: path.resolve(__dirname, '../../public'),
  redirects: {
    '/patterns/dashboard': '/patterns/purpose-keyed-view',
  },
  // Astro 7 defaults Markdown/MDX to the native Sätteri pipeline, which does
  // not run remark plugins. Switch both .md and .mdx back to the unified
  // remark/rehype processor so `remarkRelStrip` keeps stripping the
  // `{rel="..."}` link annotations the typed-relationship graph authors in.
  // MDX inherits the remark plugins configured here.
  markdown: {
    processor: unified({ remarkPlugins: [remarkRelStrip] }),
  },
  vite: {
    // Dev-only watchdog that reports when the optimizeDeps registry configured
    // below collapses mid-session — the failure mode the comment there describes.
    // Dev-only: force SSR invalidation of MDX renders, which Astro stops doing
    // after some minutes of uptime (see the plugin's comment for the evidence).
    plugins: [watchDepRegistry(), forceMdxInvalidation()],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, '../../packages/components/src/components'),
        '@styles': path.resolve(__dirname, '../../packages/components/src/styles'),
        '@pkg': path.resolve(__dirname, '../../packages/components/src'),
        '@shared': path.resolve(__dirname, '../../shared'),
        // Only referenced by a couple of services under packages/components,
        // but without it the optimizeDeps.entries scan below fails on the
        // unresolved import and silently disables pre-bundling.
        '@utils': path.resolve(__dirname, '../../utils'),
      },
    },
    optimizeDeps: {
      // Front-load dependency pre-bundling so Vite never discovers a dep lazily
      // mid-session. A lazy discovery forces "optimized dependencies changed →
      // reloading", which bumps the dep browserHash; any client:load island the
      // browser is mid-fetch on during a ClientRouter (View Transitions) swap
      // then points at a stale /node_modules/.vite/deps/*?v=<oldhash> URL that
      // 504s, surfacing as:
      //   [astro-island] Error hydrating … TypeError: Failed to fetch
      //   dynamically imported module … #astro-retry=…
      //
      // `entries` makes the startup scan crawl every island and demo source
      // file, so any bare import reachable from them is pre-bundled before the
      // first request — no per-package list to maintain. Demos are reached at
      // runtime through lib/demo-registry.ts dynamic imports (loaded from a
      // .astro layout script the scanner can't parse), which is why the globs
      // list the demo sources directly.
      //
      // If the dev server still logs "new dependencies optimized … reloading",
      // the named dep is reachable only from a file outside these globs — add
      // a glob for that location, or add the dep to `include` below.
      entries: [
        // App islands (Nav, StackManager, …) and lib modules they import,
        // including the demo registry's dynamic imports
        path.resolve(__dirname, 'src/components/**/*.tsx'),
        // Pattern demos, mounted client-side via lib/demo-registry.ts
        path.resolve(__dirname, '../../packages/components/src/demos/**/*.{ts,tsx}'),
        // Lit component library (register-all.ts) + shared React components
        // (MermaidDiagram, PatternGraph) imported via @components/*
        path.resolve(__dirname, '../../packages/components/src/components/**/*.{ts,tsx}'),
      ],
      include: [
        // Not discoverable by the entries scan: the scanner does not crawl
        // into node_modules, and elkjs is imported inside beautiful-mermaid.
        'beautiful-mermaid',
        'elkjs/lib/elk.bundled.js',
        // Astro's ClientRouter (View Transitions) virtual modules live behind
        // the .astro layout, which the scanner also can't parse. Discovered
        // on the first client-side navigation otherwise, causing one reload.
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-types.js',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-swap-functions.js',
      ],
    },
  },
});
