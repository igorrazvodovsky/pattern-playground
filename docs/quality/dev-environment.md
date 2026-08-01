# Dev environment gotchas

Operational failure modes of the toolchain and their triage recipes. The common
thread: Astro 7's `astro dev` daemonizes and survives terminal close, so dev
servers quietly live for days, and long-lived servers drift. Before debugging
any hot-reload or hydration weirdness, run `astro dev status` and check the
uptime; the recovery for the first two faults below is a plain restart —
restart-until-healthy, not restart-per-edit.

## MDX hot reload goes stale (per-server, binary)

A given dev server either invalidates MDX renders or never does, for its whole
life — it is not progressive degradation, and server age does not predict
health (a 38-second-old server has been stale; cold restarts are usually
healthy). On a stale server, `.astro` edits still go live and the glob loader
still logs "Reloaded data from X.mdx"; only the compiled MDX module's SSR
render stays frozen at boot-time output.

Ruled out as causes (2026-07-17): uptime, edit method, prior render state,
cold-start races, stale `.astro/content-modules.mjs`. Touching
`astro.config.mjs` does not restore a stale server. The `markdown.processor`
instance in `astro.config.mjs` remains an untested suspect. The trigger is
unknown; restart until the server comes up healthy, then it stays healthy.

To gather evidence next time it happens: run `astro dev --background` so
`astro dev logs` is readable, edit a probe line (e.g. the `/patterns/undo`
lead), `curl` the page, and capture what fires in the log beyond the
glob-loader line.

## Island hydration errors: the dep-optimizer registry is wrong

`[astro-island] Error hydrating … Failed to fetch dynamically imported module`
(dynamic imports 504 with `Outdated Optimize Dep`) means Vite's dependency
registry is out of sync with the browser. Two distinct causes, one symptom:

- *Mid-session collapse*: `apps/patterns/node_modules/.vite/deps/_metadata.json`
  shrinks to just `optimizeDeps.include` + Astro's defaults (~21 entries; a
  healthy server has ~69). Triage:
  `python3 -c "import json;print(len(json.load(open('apps/patterns/node_modules/.vite/deps/_metadata.json'))['optimized']))"` —
  well under ~69 means degraded; restart.
- *Failed startup scan*: if the scan fails, Vite logs one red
  `Failed to run dependency scan` line, skips pre-bundling, and still prints
  `ready` with pages serving 200; deps are then discovered lazily and the hash
  churns. Grep the log for that line before trusting a restart. One observed
  trigger: a dependency declared and locked but never installed.

Vite only runs the scan when the dep cache is invalid, so a clean-looking boot
proves nothing about whether the `optimizeDeps.entries` globs still resolve.
After deleting source files, clear `node_modules/.vite` (repo root,
`apps/patterns`, `packages/components`) before trusting or diagnosing a
dev-server failure. `watch-dep-registry.ts` reports both cases and says which
one fired. Demos with wide React barrels (`demos/data-view/index.ts`) fail
loudest, but every island degrades the same way.

## Storybook in a git worktree: story-index flap

With a worktree whose `node_modules` is symlinked to the main checkout,
`node_modules/.cache/storybook` is shared, so a stale index from a main-repo
run keeps clobbering the worktree's fresh scan — new stories appear in
`/index.json`, then vanish, with no error logged. Before verifying new
components in a symlinked worktree:
`rm -rf packages/components/node_modules/.cache/storybook`, restart, and wait
for `/index.json` to stabilise at the expected count.

Prefer a per-worktree `npm install` over symlinking — it removes the shared
cache structurally. Deps that are new on the branch can still cause late-
discovery re-optimisation flaps; priming them in `optimizeDeps.include` in
`.storybook/main.ts` `viteFinal` is the durable fix.

Related React 19 note from the same episode: `declare global { namespace JSX }`
is silently ignored — custom-element JSX typing must use `declare module
'react'` augmentation (consolidated in `src/jsx-types.ts`).

## Deployed Storybook link: trailing slash required

`PUBLIC_STORYBOOK_URL` (consumed as the nav link in
`apps/patterns/src/components/Nav.tsx`) must end in a trailing slash on
Render: `https://pattern-playground.onrender.com/storybook/`. Without it,
`/storybook` answers with a redirect that gets cached stale at the CDN edge,
and browsers then hold Storybook's non-content-hashed shell files
(`index.html`, `sb-manager/*.js`, `iframe.html`) from an old deploy — the
symptom is the deployed Storybook showing a long-gone taxonomy with 404ing
stories while the origin's `/storybook/index.json` is current. The canonical
`/storybook/` serves the shell directly and bypasses the redirect.

## test-storybook: addon-vitest not resolvable from the repo root

`npm run test-storybook` fails at startup with `Cannot find package
'@storybook/addon-vitest'` when npm has nested the `@storybook/*` packages
under `packages/components/node_modules` instead of hoisting them (the
`@storybook/addon-mcp` peer chain causes this). Vitest bundles the root
`vitest.config.ts` into root `node_modules/.vite-temp`, and from there the
nested package doesn't resolve. Current bridge: a symlink at
`node_modules/@storybook/addon-vitest` pointing into the workspace copy —
note `npm install` may remove it. Durable fix still owed: add
`@storybook/addon-vitest` as a root devDependency, or move the vitest
config into the components workspace.
