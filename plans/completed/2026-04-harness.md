---
title: "Harness refactor for pattern-plgrnd"
status: "active"
kind: "exec-spec"
created: "2026-04"
last_reviewed: "2026-05-01"
area: "harness"
promoted_to: "docs/specs/agent-harness.md"
superseded_by: ""
---
# Harness refactor for pattern-plgrnd

## Context

The project's agent-facing instruction surface has drifted out of sync with reality and is split across three near-duplicate files. Concretely:

- `CLAUDE.md` (115 lines), `AGENTS.md` (115 lines), and `GEMINI.md` (59 lines) all describe the project, but each is partly stale. `AGENTS.md` references `.Codex/rules/` (broken — should be `.claude/rules/`). All three describe the *old* Atomic Design Storybook taxonomy (`primitives → components → compositions → patterns`). The actual `src/stories/` tree has been migrating to Activity Theory categories (`operations/actions/activities/qualities/concepts/foundations`) since the March 2026 reorg plan.
- The *only* place the project's design philosophy ("garden", research-first, human-AI collaboration focus) currently lives is `GEMINI.md` — and its content there is itself stale.
- The notes in `references/`, plus the plan files in `plans/`, are not indexed and not linked from any agent instructions. An agent reading the current control layer cannot discover them without grepping.
- `.claude/rules/` already does the right thing structurally (7 small, path-activated rule files) but its guidance is *advisory only* — none of it is enforced by ESLint or Stylelint, even when it could be (e.g., "no `any`", "no inline styles", centralised `customElements.define()`).
- No `ARCHITECTURE.md`. No `docs/`. No tech-debt tracker. No drift detection between the three instruction files.

The user wants the *control layer* (durable agent-facing artifacts) repaired in line with harness-engineering principles from the OpenAI and Anthropic notes: a thin "map, not manual" entry point pointing to a structured knowledge base, with mechanical enforcement of the rules that matter. The user is *not* trying to enable multi-hour autonomous coding loops, but is open to short, scheduled doc-gardening automations that keep the control layer fresh without adding daily friction. The investment is in clearer guidance and self-maintaining structure, not in autonomous code production.

## User decisions (already made)

1. *Active tools*: Claude Code + Codex. → `AGENTS.md` becomes canonical (Codex reads it natively), `CLAUDE.md` becomes a 1-line stub, `GEMINI.md` is deleted (after extracting its philosophy).
2. *Knowledge base location*: new top-level `docs/` directory.
3. *Mechanical enforcement*: aggressive — promote all five candidate ESLint rules to error in the same refactor and fix violations as part of the work.

## Proposed structure after the refactor

```
pattern-plgrnd/
├── AGENTS.md                              # canonical, ~80 lines, table of contents only
├── CLAUDE.md                              # 1-line stub: "See ./AGENTS.md"
├── ARCHITECTURE.md                        # NEW ~120 lines, root-level domain map
├── README.md                              # unchanged (public-facing)
│
├── docs/                                  # NEW: curated agent-facing knowledge base
│   ├── design-docs/
│   │   └── core-beliefs.md                # NEW: extracted from GEMINI.md + activity-theory-reorg.md
│   │
│   ├── specs/
│   │   ├── storybook-taxonomy.md          # NEW: current AT tree + dual-projection note
│   │   ├── relationship-vocabulary.md     # from typed-edges plan: edge types + changelog
│   │   └── decision-dimensions.md         # from typed-edges plan: what trees reason about
│   │
│   ├── quality/
│   │   ├── testing-strategy.md            # NEW: extracted from CLAUDE.md
│   │   ├── code-review.md                 # NEW: extracted from CLAUDE.md
│   │   └── commenting-style.md            # NEW: extracted from CLAUDE.md
│   │
│   └── references/
│       ├── README.md
│   │   └── ...
│
├── plans/                                 # mostly unchanged, additive only
│   ├── index.md                           # NEW: active / recent / archived plans
│   ├── tech-debt-tracker.md               # NEW: durable known-issues list
│   └── ...                                # year/month structure preserved
│
├── references/                            # unchanged
├── .claude/rules/                         # unchanged — already path-activated
├── .claude/skills/                        # unchanged
│
├── eslint.config.js                       # EDITED: 5 rules promoted to error
│
├── scripts/
│   └── check-agents-stub.mjs              # NEW ~25 lines: drift detection
│
└── .github/workflows/
    └── docs-integrity.yml                 # NEW: runs stub check + offline link check
```

## Files to create

*Phase 1 (truth repair):*
1. `AGENTS.md` (rewritten as canonical thin map, ~80 lines)
2. `ARCHITECTURE.md` (new, root-level)
3. `docs/project/core-beliefs.md`
4. `docs/project/storybook-taxonomy.md`
5. `docs/quality/testing-strategy.md`
6. `docs/quality/code-review.md`
7. `docs/quality/commenting-style.md`
8. `docs/research/references.md`
9. `plans/index.md`
10. `plans/tech-debt-tracker.md`

*Phase 2 (mechanical enforcement):*
12. `scripts/check-agents-stub.mjs`
13. `.github/workflows/docs-integrity.yml`

*Phase 3 (doc gardening — recommended starter set: 14, 15, 20, 21, plus a hook entry in 16):*
14. `.github/workflows/doc-garden.yml` — weekly stale-doc PR agent
15. `scripts/check-taxonomy-sync.mjs` — taxonomy sync check (called from `docs-integrity.yml`)
16. `.claude/settings.json` — add `PostToolUse` hook entry for the reference-index seeder (currently has empty `hooks` object)
17. `scripts/reference-index-prompt.mjs` — small script invoked by the hook in (16)
20. `.github/workflows/classification-health.yml` — monthly classification-drift PR; reports to vocabulary changelog
21. `scripts/check-classification-health.mjs` — scans pattern-graph.json for drift signals

*Phase 3 (optional):*
18. `.github/workflows/plans-sweep.yml` — monthly plans staleness sweeper
19. `.github/workflows/tech-debt-sweep.yml` — weekly tech-debt accumulator

## Files to edit

- `CLAUDE.md` → reduce to a 1-line stub: `# CLAUDE.md\n\nSee AGENTS.md. Canonical guidance lives in AGENTS.md.`
- `eslint.config.js` → add the five promoted rules (see *Mechanical enforcement* below)

## Files to delete

- `GEMINI.md` (after its philosophy content has been extracted into `docs/project/core-beliefs.md`)

## Canonical AGENTS.md content (target)

A table of contents, *not* an instruction manual. Target ~80 lines. Structure:

```markdown
# AGENTS.md — pattern-plgrnd

A design research project first, code repository second. A "garden" for cultivating
interaction design patterns, with a focus on human↔AI collaboration. Full framing
in docs/project/core-beliefs.md.

## Read first
- docs/project/core-beliefs.md           — project philosophy, voice, scope
- ARCHITECTURE.md                            — domain layering and directory map
- docs/project/storybook-taxonomy.md   — where stories live (Activity Theory)

## Rules that auto-activate by file path
.claude/rules/ — do not read eagerly; each attaches via path match:
- web-components.md   → src/components/**/*.ts
- styling.md          → src/styles/**/*.css
- documentation.md    → src/stories/**/*.{mdx,stories.tsx}
- mock-data.md        → src/stories/**/*.{tsx,json}
- typescript.md       → all *.ts, *.tsx
- server.md           → server/**/*.ts
- state-management.md → all *.ts, *.tsx

## Common commands
- npm run test               # ESLint
- npm run test styles        # Stylelint
- npm run storybook          # Storybook on :6006
- cd server && npm run dev   # Express backend
Full list and conventions: docs/quality/testing-strategy.md

## Plans and tech debt
- plans/index.md              — active, recent, and archived plans
- plans/tech-debt-tracker.md  — known rough edges

## Research inputs (read on demand, not eagerly)
- docs/research/references.md   — index of references/

## Provisional classifications
Works in progress, not settled. Treat as the current frame, not the right frame.
- docs/language/relationship-vocabulary.md  — edge type vocabulary + changelog
- docs/language/decision-dimensions.md      — what patterns reason about (and what they don't)

## Quality gates
- docs/quality/testing-strategy.md
- docs/quality/code-review.md
- docs/quality/commenting-style.md

## When in doubt
Ask the user. This project is research-driven; many decisions are aesthetic
or philosophical and do not have a "correct" technical answer.
```

The agent never has to *re-derive* anything that's currently scattered. Every named topic is one hop away.

## Critical content extractions

### `docs/project/core-beliefs.md`
Source material — extract and merge:
- `GEMINI.md` lines 4–7, 28–43 (garden framing, knowledge architecture, current research focus)
- `plans/completed/2026-03-activity-theory-reorg.md` lines 1–17 (the dual-projection rationale, the "thinking-tool" framing, the semilattice argument)
- `README.md` lines 3–11 (the "personal design repertoire" framing and AT mention)
- `references/semilattice.md` — two distilled commitments: (1) typological vs topological classification (Bowker & Star) as the deeper rationale for "no single tree is right"; (2) the graph as a primary navigational surface, not a secondary annotation on the tree. Keep to a sentence or two each; point back to `references/semilattice.md` for the full argument.

The merged file should state, in the user's voice: research-first; relational over static; multiple projections (no single tree is right); current focus on AI-collaboration patterns; aesthetic/philosophical decisions sit with the human, not the agent.

### `docs/project/storybook-taxonomy.md`
Source material — extract from `plans/completed/2026-03-activity-theory-reorg.md` (lines 19–80) and verify against the actual `src/stories/` directory listing. The doc must:
- Document the current state of `src/stories/` (operations, actions, activities, qualities, concepts, foundations, data-visualization, data — and the legacy folders components/, compositions/, patterns/, hooks/ marked as "migrating → target Activities/Actions").
- Include the dual-projection rule from `references/semilattice.md`: AT is the default sidebar projection, Atomic stays as queryable metadata.
- Be the *canonical* answer to "where does a new pattern go?"

### `ARCHITECTURE.md`
New file at root. Content:
- Tech stack split (frontend: TS + Vite + Lit + React + Tldraw + Tiptap; backend: Express + OpenAI)
- Top-level directory map with one-line annotations for each `src/` subdirectory
- The Atomic-vs-Activity-Theory dual-projection note (because `src/components/` is still organised compositionally while `src/stories/` is now organised experientially — this tension is currently invisible in any doc)
- Pointer to `docs/project/storybook-taxonomy.md` for the story tree

### `docs/quality/*.md`
Move (don't copy) the corresponding sections from the current `CLAUDE.md`:
- `testing-strategy.md` ← lines 50–62 (Development commands) + 92–94 (Testing and quality)
- `code-review.md` ← lines 102–109 (Code review workflow)
- `commenting-style.md` ← lines 96–100 (Code comments)

`docs/research/references.md`
For each file in `references/` one line with a short abstract. The file is seeded once and grown organically as the user engages with each source. *No autogeneration script* — hand-maintained per the "less autonomy" preference.

### `plans/index.md`
For each tracked plan file: one line grouped by lifecycle. Current groups:
active, completed, paused, superseded, and archived. The lifecycle folder
answers the plan's present role; the filename preserves chronology.

Hand-maintained. The agent reads it to know what's in flight.

### `plans/tech-debt-tracker.md`
Empty-ish template with one-line items linking to plans or issues. Seed by grepping `plans/` for "TODO" / "tech debt" / "FIXME" mentions in active plans.

## Mechanical enforcement (eslint.config.js edits)

Add five rules to the existing flat config in `eslint.config.js`. The current config (read at line 11–42) already uses `tseslint.configs.recommended`, `lit.configs['flat/recommended']`, react-hooks, react-refresh, and storybook recommended. The additions:

1. *Promote `no-explicit-any` to error*. Add to the `**/*.{ts,tsx}` block:
   ```js
   '@typescript-eslint/no-explicit-any': 'error',
   ```

2. *Promote `no-console` to error with allowed exceptions*. Add to the `**/*.{js,mjs,cjs,ts,jsx,tsx}` block:
   ```js
   'no-console': ['error', { allow: ['warn', 'error'] }],
   ```

3. *Forbid inline `style` prop in React components*. Add a new override block for `src/**/*.tsx`:
   ```js
   {
     files: ["src/**/*.tsx"],
     rules: {
       'react/forbid-component-props': ['error', {
         forbid: [{
           propName: 'style',
           message: 'Use CSS classes, not inline styles. See .claude/rules/styling.md',
         }],
       }],
     },
   }
   ```
   This requires adding `eslint-plugin-react` to devDependencies if not already present (current devDeps only have react-hooks and react-refresh).

4. *Forbid stray `customElements.define()` outside the registry*. Add to a new override block for `src/components/**/*.ts`, with `register-all.ts` and `component-registry.ts` excepted via `ignores`:
   ```js
   {
     files: ["src/components/**/*.ts"],
     ignores: ["src/components/register-all.ts", "src/components/component-registry.ts"],
     rules: {
       'no-restricted-syntax': ['error', {
         selector: "CallExpression[callee.object.name='customElements'][callee.property.name='define']",
         message: 'Register components via src/components/register-all.ts. See .claude/rules/web-components.md',
       }],
     },
   }
   ```

5. *Forbid ARIA selectors as JS hooks*. Add to the same `src/**/*.{ts,tsx}` rules:
   ```js
   'no-restricted-syntax': ['error', {
     selector: "CallExpression[callee.property.name=/^(querySelector|querySelectorAll|closest|matches)$/] > Literal[value=/^\\[(role|aria-)/]",
     message: 'Use data-* attributes as JS hooks, not role/aria-*. See .claude/rules/web-components.md',
   }],
   ```
   Note: rule 4 and rule 5 both use `no-restricted-syntax` — they need to be combined into a single array of selectors when applied to overlapping file globs.

After adding all five rules, run `npm run test` once. Fix any real violations that surface. If the count is unmanageable, capture the violations in `plans/tech-debt-tracker.md` and stage problem rules with `// eslint-disable-next-line` + a tracker reference rather than reverting the rule. The aggressive promotion was the user's choice; staying aggressive means accepting the cleanup as part of the refactor's scope.

## Drift-detection script

`scripts/check-agents-stub.mjs` — ~25 lines of Node, no dependencies. Verifies:

```js
// Pseudocode:
// 1. AGENTS.md exists and is < 150 lines (map, not manual)
// 2. CLAUDE.md matches exactly the expected stub string
// 3. All relative links in AGENTS.md resolve to files that exist
// process.exit(1) on any failure
```

Wire into a new `.github/workflows/docs-integrity.yml`:
- Triggers: `push`, `pull_request`
- Steps: checkout → `node scripts/check-agents-stub.mjs` → `npx --yes lychee --offline AGENTS.md ARCHITECTURE.md docs/`
- *No schedule, no cron* — explicitly not a background agent.

`lychee` runs in offline mode (no network), so it only checks internal link integrity. The `--yes` flag pulls it on demand without committing it to package.json.

## Phased execution

### Phase 1 — truth repair
1. Extract `GEMINI.md` philosophy + `activity-theory-reorg.md` framing + `README.md` framing into `docs/project/core-beliefs.md`.
2. Build `docs/project/storybook-taxonomy.md` from the current `src/stories/` directory listing and the AT reorg plan.
3. Build `ARCHITECTURE.md` at root.
4. Split `CLAUDE.md` body into `docs/quality/{testing-strategy,code-review,commenting-style}.md`.
5. Write the new canonical `AGENTS.md` (~80 lines, structure above).
6. Reduce `CLAUDE.md` to a 1-line stub.
7. Delete `GEMINI.md`.
8. Build `docs/research/references.md` from a directory listing of `references/`.
9. Build `plans/index.md` and `plans/tech-debt-tracker.md`.

After Phase 1, run the verification checks below. If they pass, the project's control layer is no longer lying to agents.

### Phase 2 — mechanical enforcement
1. Add `eslint-plugin-react` to root devDependencies if needed (only required for rule 3 above).
2. Edit `eslint.config.js` with the five rules.
3. Run `npm run test`. Fix or stage violations.
4. Add `scripts/check-agents-stub.mjs`.
5. Add `.github/workflows/docs-integrity.yml`.
6. Push, verify CI runs green.

### Phase 3 — doc-gardening automation
Five small, *scheduled* automations that keep the control layer self-maintaining. None run as long-horizon loops; each runs on cron or on a tool event, opens a small PR or surfaces a one-line prompt, and is reviewed by the user in under a minute. The user picks which subset to install (recommended starter set marked).

1. *Weekly stale-doc PR agent* (recommended). New `.github/workflows/doc-garden.yml`, scheduled `0 9 * * 0` (Sunday morning). Uses the existing `anthropics/claude-code-action` (already in `claude.yml`) with a tightly-scoped prompt:
   > Walk `AGENTS.md`, `ARCHITECTURE.md`, and `docs/`. For each claim about file paths, rule names, taxonomy categories, or directory structure, verify it against the current repo state. For each drift you find, open a single fix-up PR with the minimal correction. Do not refactor, restructure, or add new content. If everything is current, exit silently.

   Output: zero PRs (clean) or 1-N tiny diffs. Each PR is reviewable in seconds. The agent is *bounded* by the prompt to fix-only, no expansion.

2. *Storybook taxonomy sync check* (recommended). Extend `docs-integrity.yml` (already added in Phase 2) with one extra step: a Node script `scripts/check-taxonomy-sync.mjs` (~30 lines) that lists `src/stories/*/` and verifies every directory is named in `docs/project/storybook-taxonomy.md`. Fails the workflow if a top-level story folder is missing from the doc, or if the doc names a folder that no longer exists. This is the *single most important* drift to catch — the original sin of the current state was the taxonomy doc lying about the story tree.

3. *Plans staleness sweeper* (optional, scheduled monthly). New `.github/workflows/plans-sweep.yml`, scheduled `0 9 1 * *` (first of each month). Claude walks `plans/active/`, `plans/paused/`, `plans/completed/`, and `plans/superseded/` for files untouched in 90+ days, checks recent commits for evidence of completion or abandonment, and opens a PR moving stale entries to the appropriate lifecycle folder or `plans/archive/` with one-line tombstones in `plans/index.md`. Conservative: if uncertain, leaves the plan in place and tags it `status: review-needed` in the index.

4. *Tech-debt accumulator* (optional, weekly). Companion to (1). Greps the codebase for new `TODO`/`FIXME`/`HACK` comments since the last run (using a stored marker file in `.github/`), and opens a PR adding any new ones to `plans/tech-debt-tracker.md` with file:line links. Most projects find this becomes noise within a few weeks; install only if signal-to-noise stays high.

5. *Classification health sweeper* (recommended, monthly). New `.github/workflows/classification-health.yml`, scheduled `0 9 15 * *` (mid-month, off-cycle from the other sweeps). Runs `scripts/check-classification-health.mjs`, which inspects `src/pattern-graph.json` for drift signals: edge types with fewer than N edges (underused), thematic-header `label` values repeating across many files (candidates for promotion to a typed edge), tags used only once (noise) vs. many times (candidates for structuring), and patterns with a high density of `related` edges (the extractor may have flattened a distinction). Output: a PR appending findings to the changelog in `docs/language/relationship-vocabulary.md` under an *Observed drift* subheading. Does not propose vocabulary changes — the user decides whether drift is signal or noise. Pairs with the `extractedFrom` provenance field and the vocabulary changelog introduced by `plans/completed/2026-04-typed-edges.md`.

*Recommended starter set*: items 1, 2, 5. Items 3 and 4 are narrower and can wait until the starter set proves its weight.

*Cost discipline*: every workflow that calls Claude is bounded by a fix-only or report-only prompt, runs at most weekly, and outputs PRs that the user merges manually. No auto-merge. No retry loops. No background context accumulation. The user remains in the loop on every action that touches the repo.

## Verification

Run all six checks after the refactor. The first three are the *truth-repair* checks; the last three are the *enforcement* checks.

1. *Story-placement test*. Start a fresh Claude Code session with no prior context. Paste: *"I want to add a new Storybook story for a pattern called `SmartSuggestion` that takes user input and proactively offers AI completions. Where in the tree should it live?"* Healthy: the agent reads `CLAUDE.md` → `AGENTS.md` → `docs/project/storybook-taxonomy.md` and answers correctly with `src/stories/activities/` or similar AT-grounded location. Unhealthy: the agent suggests `src/stories/components/` or `src/stories/patterns/` (the *old* names from the stale instruction files).

2. *Rule-lookup test*. Paste: *"What's the styling convention in this project?"* Healthy: the agent arrives at `.claude/rules/styling.md` in one hop via `AGENTS.md`. Unhealthy: the agent re-derives the rules by reading CSS files.

3. *Philosophy test*. Paste: *"What is this project about?"* Healthy: the agent quotes the "research-first / garden / human-AI collaboration" framing from `docs/project/core-beliefs.md`. Unhealthy: the agent calls it a "design system" or a "component library".

4. *Drift detection*. Manually edit `CLAUDE.md` to add a stray sentence. Push the branch. CI (`docs-integrity.yml`) should fail on `check-agents-stub.mjs`. Revert.

5. *Lint enforcement*. Add `const x: any = 1;` to a file. Run `npm run test`. ESLint should error. Remove. Repeat for `console.log` in a non-server file.

6. *Link integrity*. Manually break a relative link in `AGENTS.md`. Run `npx --yes lychee --offline AGENTS.md`. It should fail. Revert.

If all six pass, the refactor has done its job: the control layer tells the truth, mechanically.

## Critical files (paths)

Files most load-bearing for executing this plan:

- `AGENTS.md` — becomes the canonical map
- `CLAUDE.md` — becomes a stub
- `GEMINI.md` — deleted after content extraction
- `eslint.config.js` — Phase 2 enforcement
- `plans/completed/2026-03-activity-theory-reorg.md` — source for `docs/project/storybook-taxonomy.md`
- `semilattice.md` — source for the dual-projection rationale
- `/src/stories/` — verify current directory listing matches what `storybook-taxonomy.md` claims

## Explicitly out of scope

- Multi-hour autonomous coding loops (Phase 3 automations are bounded fix-only / report-only runs, not open-ended agency)
- `plans/active/` + `plans/completed/` restructure (year/month stays)
- Custom ESLint plugin for `pp-` prefix (disproportionate cost; covered by code review)
- Any changes to `src/stories/`, `src/components/`, or component code beyond what falls out of fixing real lint violations
- The Activity Theory reorganisation itself — that work continues in `plans/completed/2026-03-activity-theory-reorg.md`; this refactor only documents the *current* state of the migration accurately
