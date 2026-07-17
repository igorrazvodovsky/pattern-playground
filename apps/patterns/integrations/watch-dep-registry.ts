import { readFileSync, statSync, unwatchFile, watchFile } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

// Dev-only watchdog over Vite's dependency-optimizer registry.
//
// Symptom it names: a long-lived dev server starts failing island hydration with
//   [astro-island] Error hydrating .../demos/data-view/index.ts
//   TypeError: Failed to fetch dynamically imported module
// while the network panel shows 504 (Outdated Optimize Dep) on a handful of deps.
//
// Mechanism: the optimizer registry (node_modules/.vite/deps/_metadata.json)
// collapses mid-session — re-optimizing with a scan that yields nothing, leaving
// only `optimizeDeps.include` plus Astro's built-in defaults. Observed 2026-07-17
// on a ~10h-old server: 69 optimized deps → 21, dropping @iconify/react, nanoid,
// fuse.js and motion/react. Those four are reachable only through the data-view
// barrel, so its island was the first to fail. The browser still holds URLs minted
// by the pre-collapse generation, so every dropped dep 504s. The `optimizeDeps`
// config below is correct and works at cold start; it just does not survive the
// collapse. The trigger is still unknown (same open question as the MDX hot-reload
// degradation) and the recovery is a plain restart.
//
// Rather than chase the trigger, make the failure announce itself: within a single
// server lifetime the registry only ever *grows* (deps are discovered and added),
// so any decrease is anomalous by construction — no threshold to tune. On a drop we
// name the deps that vanished, which is the fact that turns a baffling hydration
// error into a one-line diagnosis.
//
// Polling via watchFile (not watch) is deliberate: Vite writes the metadata by
// atomic rename, which invalidates an fs.watch handle on the file itself.

const POLL_INTERVAL_MS = 2000;

function readOptimizedDeps(metadataPath: string): Set<string> | null {
  try {
    const parsed: unknown = JSON.parse(readFileSync(metadataPath, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null || !('optimized' in parsed)) return null;
    const { optimized } = parsed as { optimized?: unknown };
    if (typeof optimized !== 'object' || optimized === null) return null;
    return new Set(Object.keys(optimized));
  } catch {
    // Mid-write, absent, or malformed — the next poll sees the settled file.
    return null;
  }
}

export default function watchDepRegistry(): Plugin {
  return {
    name: 'pattern-playground:watch-dep-registry',
    apply: 'serve',
    configureServer(server) {
      const metadataPath = join(server.config.cacheDir, 'deps', '_metadata.json');
      const { logger } = server.config;

      // High-water mark, not the previous reading: a collapse followed by lazy
      // re-discovery would otherwise re-baseline and hide the fault.
      let peak = new Set<string>();

      const check = () => {
        const current = readOptimizedDeps(metadataPath);
        if (!current) return;

        const lost = [...peak].filter((dep) => !current.has(dep));
        if (lost.length > 0) {
          logger.warn(
            `\n[dep-registry] Optimizer registry collapsed: ${peak.size} → ${current.size} deps.\n` +
              `[dep-registry] Dropped: ${lost.join(', ')}\n` +
              `[dep-registry] Islands importing these will fail to hydrate with a 504\n` +
              `[dep-registry] (Outdated Optimize Dep). This is a stale dev server, not your code.\n` +
              `[dep-registry] Fix: restart it — \`npx astro dev stop\` then \`npm run dev\`.\n`,
            { timestamp: true },
          );
        }

        for (const dep of current) peak.add(dep);
      };

      // The first optimize lands shortly after listen; watchFile's own initial
      // poll picks it up, and check() re-reads on every subsequent write.
      watchFile(metadataPath, { interval: POLL_INTERVAL_MS }, check);
      if (statSync(metadataPath, { throwIfNoEntry: false })) check();

      server.httpServer?.once('close', () => {
        unwatchFile(metadataPath, check);
        peak = new Set();
      });
    },
  };
}
