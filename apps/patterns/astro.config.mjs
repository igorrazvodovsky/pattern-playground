import { defineConfig } from 'astro/config';
import lit from '@astrojs/lit';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { fileURLToPath } from 'url';
import path from 'path';
import remarkRelStrip from '../../shared/remark-rel-strip.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [lit(), mdx({ remarkPlugins: [remarkRelStrip] }), react()],
  publicDir: path.resolve(__dirname, '../../public'),
  vite: {
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
      // first request — no per-package list to maintain. MDX pages can't be
      // scanned (esbuild doesn't parse them), which is why the globs target
      // the .ts/.tsx sources those pages import instead.
      //
      // If the dev server still logs "new dependencies optimized … reloading",
      // the named dep is reachable only from a file outside these globs — add
      // a glob for that location, or add the dep to `include` below.
      entries: [
        // App islands (AppShell, StackManager, ComponentRef, …)
        path.resolve(__dirname, 'src/components/**/*.tsx'),
        // Pattern demos imported by MDX pages via @pkg/demos/*
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
    ssr: {
      noExternal: ['beautiful-mermaid'],
    },
  },
});
