# Episode 08: Toolchain — walkthrough

Scope: merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c`; territory is the toolchain trail on `split-project` — Astro 6.4.x bumps, the Astro 7 + Vite 8 upgrade (merged via PR #23 from `astro-7-upgrade`), React-island pre-bundling, ESLint glob repairs, Vite/vitest config consolidation, `.astro/` untracking, dependency alignment. This is an *unplanned episode*, already recorded as a standing finding in the episode map: no plan owned it; every commit here is a reaction. Depth: light.

The episode spans May–July: the workspace reorganisation turned the root `package.json` into a workspace orchestrator, and everything after is the toolchain being brought back into agreement with that shape — a Vite config consolidation (961c7ac), an ESLint glob repair (9488b37), a `.astro/` untrack (44f2e72), a pre-bundling fix for dev hydration failures (33337b7, revised in 5868902), two Astro 6.4.x bumps (a7da331, be9a178), and the Astro 7 + Vite 8 upgrade converging root and app on one Vite major (b16e44f).

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | Converge the workspace on one toolchain | accept (doc fix) |
| 2 | Ride the fix train: upgrade cadence to Astro 7 + Vite 8 | fix |
| 3 | The pre-bundle posture: enumerate, then scan | accept |
| 4 | Repair the quality gate: lint globs and tracked build output | accept |

## Move 1: Converge the workspace on one toolchain

*The move.* The root `package.json` became a delegating orchestrator (`dev`/`storybook`/`build` forward to workspaces; 2cb8ca3). `packages/components` lost its standalone `vite`/`vite build` scripts and `main` field; the Storybook Vitest project moved to a root `vitest.config.ts` (961c7ac). A stray nested `apps/patterns/package-lock.json` was deleted (be9a178). b16e44f then aligned versions: root `vite` 6→8 and `@vitejs/plugin-react` 4→6 so the root toolchain and Astro's bundled Vite land on the same major.

*Answers to.* `docs/specs/workspace-layout.md`: "The repository is a single npm workspace root with one library package and two runnable apps." One lockfile, one Vite, root-level test config is that sentence realised at the tooling layer. The preserved root command surface (`npm run test`, `test-storybook`, `storybook`) matches `docs/quality/testing-strategy.md` §Development commands.

*Backtalk.* The nested lockfile was not inert residue — be9a178 records it was "blocking npm from re-resolving astro within range", i.e. it silently pinned the app below the HMR fixes Move 2 needed. Duplicated toolchain state actively fought the single-workspace commitment until deleted. Smaller echo: `testing-strategy.md` still addresses the backend as `cd server` and the a11y config as `.storybook/preview.ts`, both pre-split paths — the doc layer did not converge with the toolchain.

*Question.* The convergence is now enforced only by vigilance — nothing stops a nested lockfile or a second Vite major from reappearing. Is "one toolchain" a settled commitment that belongs in `workspace-layout.md` alongside the dependency-direction rule, or is it incidental hygiene you're content to re-do?

*Verdict:* accept, with the doc echo fixed — the convergence itself stands as executed, and "one toolchain" stays vigilance rather than gaining a spec line. The stale paths in `testing-strategy.md` are repaired: the backend commands now go through the workspace (`npm run <script> -w apps/server`, verified working) and the a11y config path reads `packages/components/.storybook/preview.ts`.

## Move 2: Ride the fix train: upgrade cadence to Astro 7 + Vite 8

*The move.* Three bumps, each symptom-driven: 6.3.3→6.4.2 moving `@astrojs/mdx` off back-compat shims "slated for removal in Astro 7.0" (a7da331); 6.4.2→6.4.8 to pick up four upstream HMR-invalidation fixes matching the app's exact shape (be9a178); then 6.4.8→7.0.7 with Vite 8, via PR #23. The major carried three adaptations: opting Markdown/MDX back out of Astro 7's native Sätteri pipeline into `unified()` so `remarkRelStrip` keeps running; wrapping bare declarations in `dialog.css` that Lightning CSS rejected; gating sidebar collapsibles on `hydrated` to match server HTML. One regression (View Transition abort under `@astrojs/react` 6) was root-caused and deferred to the shell-island plan rather than blocking the merge.

*Answers to.* No plan owned the cadence itself — *answers to nothing on record* until each commit message constructs its own justification. The Sätteri opt-out, though, answers to `docs/project/core-beliefs.md`: "Cross-references, typed edges, and graph navigation are load-bearing, not decorative" — the `{rel="..."}` annotation syntax is what pins the site to the remark pipeline.

*Backtalk.* The upstream fixes be9a178 names — stale content as a getStaticPaths prop, barrel-import staleness, *monorepo-external SSR modules* — are precisely the shape the split created: an Astro app importing demos and components from outside its own root. The cadence trail is evidence the split moved the site off Astro's happy path, and the tax was paid in dev-loop reliability until upstream caught up. Second finding: the typed-edge commitment now has a toolchain cost — every future Astro major must re-earn the unified-processor escape hatch, or the graph's authoring syntax breaks at prerender (b16e44f records it throwing).

*Backtalk (cadence).* That said, the sequencing was deliberate: 6.4.2 pre-cleared the shim removal that would otherwise have compounded the v7 migration. Reactive triggers, staged execution.

*Question.* The site's dev experience is now hostage to two standing opt-outs (unified processor, monorepo-external imports). Should "we deliberately sit off Astro's defaults, and why" be recorded somewhere durable — `workspace-layout.md` or a spec — so the next upgrade doesn't rediscover it from commit archaeology?

*Verdict:* fix — the cadence itself stands (reactive triggers, staged execution: the shim pre-clear was the right sequencing), and the opt-outs are now on durable record: `docs/specs/pattern-site.md` gains a §Toolchain posture naming both — the unified processor pinned for `remark-rel-strip` (the native Sätteri pipeline runs no remark plugins and throws on the annotation syntax at prerender) and monorepo-external imports as the seam to suspect first when the dev loop misbehaves after an upgrade.

## Move 3: The pre-bundle posture: enumerate, then scan

*The move.* 33337b7 stopped dev hydration failures ("Failed to fetch dynamically imported module") by enumerating ~40 island/demo dependencies in `optimizeDeps.include`, with a comment explicitly rejecting `optimizeDeps.entries` because the eager scan hit a Storybook-only `@utils` alias and silently disabled itself. 5868902 reversed the posture: it defined `@utils` in the app config solely to keep the scan alive, switched to `entries` globs over island, demo, and component sources, and shrank `include` to the six genuinely unscannable entries (elkjs inside beautiful-mermaid, Astro's transition virtual modules).

*Answers to.* Indirectly, `workspace-layout.md` §Shared demos: demos live in `packages/components/src/demos/` and are consumed cross-workspace — the arrangement that makes lazy discovery possible at all. The enumerate→scan revision answers the maintenance burden the first commit itself documented ("when a demo starts importing a new heavy package … add it").

*Backtalk.* This is the sharpest measure of the split's dev-time cost: the app must now teach Vite, up front, about a dependency tree that lives in another workspace, and the config carries a `@utils` alias for code the app never imports — one workspace's alias vocabulary leaking into another purely to appease a scanner. The self-correction within two commits also shows the first posture's failure mode (silent drift as demos gain deps) was real, not hypothetical.

*Question.* The demo import path the spec blesses is "through the package surface (`@pkg/demos/*`)" — yet the fix deepens the app's knowledge of the package's *internal* source layout (globs into `src/components/**`, an internal-only alias). Does the pre-bundle machinery belong on the app side at all, or is it a signal the components package should export a dev-time manifest of what its surface pulls in?

*Verdict:* accept — the arrangement works and the scan posture is self-maintaining; no package-side manifest scoped. The internal-layout knowledge on the app side (globs, the scanner-appeasing `@utils` alias) is tolerated cost, and the seam is now named in `pattern-site.md` §Toolchain posture as the first suspect when the dev loop misbehaves after an upgrade.

## Move 4: Repair the quality gate: lint globs and tracked build output

*The move.* 9488b37 rewrote `eslint.config.js` ignores from root-relative (`dist/**`) to recursive (`**/dist/**`, plus `**/.astro/**` and the vendored `public/storybook/`), and re-scoped file globs so rules again matched sources under `apps/` and `packages/`; a handful of newly surfaced real lint issues were fixed in the same commit. 44f2e72 untracked committed `.astro/` generated output already covered by `.gitignore`.

*Answers to.* `docs/quality/testing-strategy.md` §Quality baseline: "ESLint enforces: no `any`, no `console.log` … " — the repair restores that enforcement to reality.

*Backtalk.* The commit records the gap concretely: 55k+ false errors from linting build output, and — worse — rules "silently disabled … for real source files in apps/ and packages/". Between the reorganisation (2cb8ca3, mid-May) and this fix (mid-June), the quality baseline the doc asserts was fiction for the moved code. The split broke the gate in the quietest possible way: `npm run test` kept passing, on the wrong files.

*Question.* Both failures here were silent (disabled rules, tracked generated output) and were caught by happenstance, not by any check. After a structural move of this size, what tells you the quality gate itself still points at the code — is that a checklist item the next reorganisation plan should carry?

*Verdict:* accept — a once-per-repo-lifetime event: the repo won't be restructured at this scale again, so no standing checklist item is owed. The repair stands as executed; the lesson lives in this record.
