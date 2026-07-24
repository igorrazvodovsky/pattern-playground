import { readFileSync, statSync, unwatchFile, watchFile } from 'node:fs';
import { join } from 'node:path';
import type { Logger, Plugin } from 'vite';

// Dev-only watchdog over Vite's dependency-optimizer registry. It covers two ways
// the registry ends up wrong, both surfacing as the same hydration failure.
//
// === One: the registry collapses mid-session ===
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
//
// === Two: the registry is never built, because the startup scan failed ===
//
// The high-water mark above only fires on a *decrease*. When the scan fails at
// boot there is no peak to fall from: Vite logs one red line, skips pre-bundling
// outright, still prints `ready`, and serves pages 200. Every dep is then
// discovered lazily on first import, and each discovery re-optimizes and mints a
// fresh `?v=` hash — so a ClientRouter navigation that is mid-fetch on an island
// module ends up holding a URL from the dead generation, 504s with (Outdated
// Optimize Dep), and reports the identical [astro-island] hydration error. Same
// symptom, opposite cause, and the collapse watchdog is silent for it.
//
// Observed 2026-07-24: `@atlaskit/pragmatic-drag-and-drop` was declared and in the
// lockfile but absent from node_modules, so the scan aborted on the unresolved
// import in utility/dnd.ts. Behind it, a second failure: the scan then aborted on
// four source files an in-flight refactor had deleted, which no source still
// imported. Clearing `node_modules/.vite` resolved it; how the deleted paths
// reached a fresh process's entry list was never isolated, so treat the stale
// cache as the observed cure rather than a confirmed mechanism.
//
// Note what this can and cannot see: Vite runs the scan only when the dep cache
// is invalid — a cold cache, a changed config, a changed lockfile. Boot on a valid
// cache and no scan runs at all, so silence here is not evidence the entries globs
// still resolve. A start that looks clean can be sitting on a cache built before a
// refactor deleted the files those globs used to match.
//
// So intercept the failure where Vite raises it. The per-environment logger
// delegates to this same `config.logger` object at call time, so patching `error`
// in configureServer catches the scan failure whichever environment raises it,
// and lands before the optimizer initializes on listen. Matching Vite's message
// text is the cost of that precision; if Vite rewords it this check goes quiet,
// which is why it only ever *adds* a diagnosis and never swallows the original.

const POLL_INTERVAL_MS = 2000;

const SCAN_FAILURE = /failed to run dependency scan/i;

// Symbol.for, not a fresh Symbol: an in-session restart can load this module
// again, and both copies must recognise the same marker on a reused logger.
const ORIGINAL_ERROR: unique symbol = Symbol.for('pattern-playground:dep-registry:original-error');

type WrappedError = Logger['error'] & { [ORIGINAL_ERROR]?: Logger['error'] };

// picocolors wraps the message in SGR codes, and Vite appends the whole stack.
// Keep the frames Vite's own reporting puts first — the unresolved package or
// unloadable file — and drop the `at …` trace, which is always inside Vite.
function describeCause(raw: string): string {
  const plain = raw
    .replace(/\u001B\[[0-9;]*m/g, '')
    .replace(/^\(!\)\s*Failed to run dependency scan\.\s*Skipping dependency pre-bundling\.\s*/i, '');
  const lines: string[] = [];
  for (const line of plain.split('\n')) {
    if (/^\s+at\s/.test(line)) break;
    if (line.trim()) lines.push(line.trim());
  }
  return lines.length > 0 ? lines.join('\n') : plain.trim();
}

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

      // A failed scan drags the registry down with it — every dep carried over
      // from a previous cache generation drops out at once. Reporting that as a
      // collapse would be a false diagnosis: it prescribes a restart, which on
      // its own fixes nothing while the scan is still broken. Once the scan has
      // failed, the message above has already said what to do, so stay quiet and
      // just keep tracking the peak.
      let scanFailed = false;

      const check = () => {
        const current = readOptimizedDeps(metadataPath);
        if (!current) return;

        const lost = [...peak].filter((dep) => !current.has(dep));
        if (lost.length > 0 && !scanFailed) {
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

      // Astro recreates the Vite server in-session on a config change, and the new
      // `configureServer` can run before the old server's `close` fires. Left naive
      // that disarms this check during the exact window it is needed, since a config
      // change is also what invalidates the dep cache and makes the scan re-run: the
      // late `close` would restore the previous wrapper over ours, and if the logger
      // object is reused across the restart the wrappers would chain and double-report.
      // So always install over the *original* function, kept on the logger under a
      // symbol, and only unwrap on close if the installed function is still ours.
      const installed = logger.error as WrappedError;
      const passThroughError = installed[ORIGINAL_ERROR] ?? installed.bind(logger);
      const reportScanFailure: WrappedError = (msg, opts) => {
        passThroughError(msg, opts);
        if (typeof msg !== 'string' || !SCAN_FAILURE.test(msg)) return;
        scanFailed = true;
        logger.warn(
          `\n[dep-registry] Dependency pre-bundling was SKIPPED — the startup scan failed.\n` +
            `[dep-registry] Deps are now discovered lazily, so each discovery re-optimizes and\n` +
            `[dep-registry] changes the dep hash. An island fetched across that change 504s\n` +
            `[dep-registry] (Outdated Optimize Dep) and reports [astro-island] Error hydrating …\n` +
            `[dep-registry] Failed to fetch dynamically imported module. Expect it on navigation.\n` +
            `[dep-registry] Cause:\n` +
            describeCause(msg)
              .split('\n')
              .map((line) => `[dep-registry]   ${line}`)
              .join('\n') +
            `\n[dep-registry] Fix: an unresolved package means it is declared but not installed —\n` +
            `[dep-registry]      run \`npm install\`. A source file that no longer exists means the\n` +
            `[dep-registry]      optimizer cache outlived a refactor — stop the server and delete\n` +
            `[dep-registry]      node_modules/.vite at the repo root, apps/patterns and\n` +
            `[dep-registry]      packages/components, then start it again.\n`,
          { timestamp: true },
        );
      };
      reportScanFailure[ORIGINAL_ERROR] = passThroughError;
      logger.error = reportScanFailure;

      server.httpServer?.once('close', () => {
        unwatchFile(metadataPath, check);
        if (logger.error === reportScanFailure) logger.error = passThroughError;
        peak = new Set();
      });
    },
  };
}
