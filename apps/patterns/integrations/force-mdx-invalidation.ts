import type { Plugin } from 'vite';
import { isRunnableDevEnvironment } from 'vite';

// Dev-only workaround for MDX content edits going stale mid-session.
//
// Symptom: after 2-3 minutes of uptime, editing a file under src/content/ stops
// changing the rendered page. The glob-loader still logs "Reloaded data from X.mdx"
// and .astro edits still hot-reload in ~1s — only MDX renders freeze.
//
// Root cause (traced 2026-07-17 against astro 7.0.7 / vite 8.1.4 / @astrojs/mdx 7.0.2):
// Astro renders SSR pages through `ssrEnvironment.runner.import(id)` — a Vite
// ModuleRunner that keeps its OWN evaluated-module cache
// (`runner.evaluatedModules`), distinct from the server moduleGraph. Astro's
// loader (node_modules/astro/dist/core/module-loader/vite.js) only ever calls
// `moduleGraph.invalidateModule` on change; nothing evicts the *evaluated*
// module. So on each request `runner.import(pageId)` finds the page node still
// `evaluated=true` and returns the cached render closure, which closed over the
// boot-time MDX exports. Confirmed on the live stale server:
//   - file on disk         → has the edit
//   - Vite transform (/@fs)→ has the edit  (transform pipeline is healthy)
//   - runner-rendered page → does NOT
// Upstream bug class: withastro/astro #16757, #16567.
//
// A first attempt that invalidated only the server moduleGraph did NOT fix it
// (verified: page stayed stale with the plugin firing). This version evicts the
// evaluated module in the runner and walks its importer chain up to the page
// entry, so the next `runner.import` re-evaluates the whole chain. The server
// moduleGraph is invalidated too, so the re-evaluation pulls a fresh transform.

const MAX_WALK = 100; // importer-chain guard

export default function forceMdxInvalidation(): Plugin {
  return {
    name: 'pattern-playground:force-mdx-invalidation',
    apply: 'serve',
    configureServer(server) {
      const onChange = (file: string) => {
        if (!file.endsWith('.mdx')) return;

        const env = server.environments?.ssr;
        if (!env) return;

        let evaluatedCount = 0;
        let graphCount = 0;

        // 1. Server module graph: force a fresh transform on next fetch.
        const graph = env.moduleGraph;
        const graphSeen = new Set<unknown>();
        const walkGraph = (mod: any, depth: number) => {
          if (!mod || graphSeen.has(mod) || depth > MAX_WALK) return;
          graphSeen.add(mod);
          graph.invalidateModule(mod);
          graphCount++;
          for (const importer of mod.importers ?? []) walkGraph(importer, depth + 1);
        };
        for (const mod of graph.getModulesByFile?.(file) ?? []) walkGraph(mod, 0);

        // 2. Runner evaluated modules: evict the cached render closure. This is
        //    the cache Astro never clears — the actual fix. Importers are stored
        //    as ids, so resolve each back to a node before recursing.
        if (isRunnableDevEnvironment(env)) {
          const evaluated = env.runner.evaluatedModules;
          const evalSeen = new Set<string>();
          const walkEval = (node: any, depth: number) => {
            if (!node || evalSeen.has(node.id) || depth > MAX_WALK) return;
            evalSeen.add(node.id);
            evaluated.invalidateModule(node);
            evaluatedCount++;
            for (const importerId of node.importers ?? []) {
              const importer = evaluated.getModuleById(importerId);
              if (importer) walkEval(importer, depth + 1);
            }
          };
          for (const node of evaluated.getModulesByFile(file) ?? []) walkEval(node, 0);
        }

        if (evaluatedCount > 0 || graphCount > 0) {
          server.config.logger.info(
            `[force-mdx] ${file.split('/').pop()}: evicted ${evaluatedCount} evaluated + ${graphCount} graph module(s)`,
            { timestamp: true },
          );
        }
      };

      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
    },
  };
}
