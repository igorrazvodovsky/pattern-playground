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
      // We cannot use optimizeDeps.entries (glob-crawl the island/demo source)
      // here: the eager scan follows transitive imports into dev-only component
      // code that resolves a Storybook-only `@utils` alias not defined in this
      // app, which fails the whole scan and silently disables pre-bundling.
      // So we enumerate explicitly — this only pre-bundles what is listed and
      // never crawls unrelated source.
      //
      // Maintenance: when a demo/island starts importing a new heavy package
      // (or a new sub-path of one already here), add it. The symptom of a
      // missing entry is a "new dependencies optimized … reloading" line in the
      // dev server log on first visit to the page that uses it — add whatever
      // it names. Sub-paths (e.g. @base-ui/react/dialog, @tiptap/extension-bold)
      // are optimized as separate entries and must each be listed.
      include: [
        'beautiful-mermaid',
        'elkjs/lib/elk.bundled.js',
        // Astro's ClientRouter (View Transitions) virtual modules. Discovered
        // on the first client-side navigation otherwise, causing one reload.
        'astro/virtual-modules/transitions-router.js',
        'astro/virtual-modules/transitions-types.js',
        'astro/virtual-modules/transitions-events.js',
        'astro/virtual-modules/transitions-swap-functions.js',
        // React island core
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'zustand',
        'zustand/middleware',
        '@iconify/react',
        'clsx',
        '@floating-ui/dom',
        'composed-offset-position',
        // Base UI primitives used by the sidebar + demos
        '@base-ui/react/collapsible',
        '@base-ui/react/dialog',
        '@base-ui/react/preview-card',
        '@base-ui/react/tooltip',
        '@base-ui/react/use-render',
        // Command menu
        'cmdk',
        'fuse.js',
        // Tiptap (editor demos) — starter-kit re-exports each extension as a
        // separately-optimized dep, so they are listed individually.
        '@tiptap/core',
        '@tiptap/react',
        '@tiptap/react/menus',
        '@tiptap/starter-kit',
        '@tiptap/suggestion',
        '@tiptap/pm/model',
        '@tiptap/pm/state',
        '@tiptap/pm/view',
        '@tiptap/extension-blockquote',
        '@tiptap/extension-bold',
        '@tiptap/extension-bullet-list',
        '@tiptap/extension-heading',
        '@tiptap/extension-highlight',
        '@tiptap/extension-italic',
        '@tiptap/extension-list-item',
        '@tiptap/extension-mention',
        '@tiptap/extension-ordered-list',
        '@tiptap/extension-strike',
        // d3 (data-visualisation demos)
        'd3-array',
        'd3-axis',
        'd3-ease',
        'd3-force',
        'd3-format',
        'd3-hierarchy',
        'd3-scale',
        'd3-selection',
        'd3-shape',
        'd3-time-format',
        'd3-transition',
        // Lit web components
        'lit',
        'lit/decorators.js',
        'lit/directives/class-map.js',
        'lit/directives/if-defined.js',
        'lit/directives/live.js',
        'lit/directives/repeat.js',
        'iconify-icon',
      ],
    },
    ssr: {
      noExternal: ['beautiful-mermaid'],
    },
  },
});
