---
title: "Component manifest: research gate findings"
status: "completed"
kind: "research-note"
created: "2026-07-07"
last_reviewed: "2026-07-07"
area: "architecture, pattern-site, storybook"
promoted_to: ""
superseded_by: ""
depends_on: "plans/active/2026-07-workspace-split-closure.md (workstream 2 gate; informs open questions 1 and 5 and workstream 4 step 2)"
---
# Component manifest: research gate findings

Research gate for the closure plan's workstream 2 strawman: generate
`custom-elements.json` with `@custom-elements-manifest/analyzer`, add a thin
project wrapper, resolve `<ComponentRef>` against it at build time. The gate
question was "what would I be wrong about?". Answer: most of it.

## Verdict

*The strawman fails the gate in its current form.* Storybook's own
`index.json` — already built, already carrying the tag taxonomy, already
covering every addressable docs entry — is the resolution authority the
strawman wanted the CEM-plus-wrapper stack to be. The revised workstream 2 is
one small build-time check: validate every `<ComponentRef id>` against
`index.json`, fail the site build on an unknown id. CEM generation is parked
as a contingent enhancement, not a step on the critical path.

Empirical support: cross-validating today's content against a fresh
`index.json` immediately caught two genuinely broken references (five usages)
of exactly the classes T1 and T2 met by grep — a rename casualty and a
never-existed docs id.

## Method

- Scratch runs of `npx @custom-elements-manifest/analyzer --litelement`
  (v1.x, 2026-07-07) against copies of representative sources and against the
  full `packages/components/src/components/` tree. Scratch space only; no
  config or deps committed.
- Cross-validation of all `<ComponentRef>` ids in `apps/patterns/src/content/`
  against both built `index.json` copies (`packages/components/storybook-static/`
  fresh from 2026-07-07, `apps/patterns/public/storybook/` from 2026-07-02).
- Source survey: `register-all.ts` / `component-registry.ts`, decorator usage,
  the `is="pp-button"` spread, React subsystems, the site's actual import
  surface from the package, `.storybook/main.ts`, root `package.json`.
- Web checks on Storybook 10's CEM path and on what adjacent design systems
  ship (sources at the end).

## Gate question 1 — would CEM parse this codebase?

Partially, and it misses the one thing resolution needs.

*What works.* With `--litelement`, Lit classes come out well: `@property`
declarations become attributes with correct reflected names
(`stay-open-on-select`), emitted events are detected (`pp-show`,
`pp-after-hide`, `pp-select` on dropdown), JSDoc `@summary` is carried
through. The stage-3-style decorators parse fine — the analyzer uses its own
TypeScript and does not care which decorator proposal the build targets.

*What fails — tag association, everywhere.* The full-tree run marks 26
classes as custom elements and produces *zero* `tagName` values. The codebase
registers exclusively through `componentRegistry.registerAll([...])`
(`register-all.ts`); there is not a single `@customElement` decorator or
statically visible `customElements.define('tag', Class)` in component source
— the define inside `component-registry.ts` has dynamic arguments and yields
one nameless `custom-element-definition` export. A manifest without tag names
cannot resolve anything; every downstream CEM consumer keys on `tagName`.
Fixable with a small custom analyzer plugin (parse the `registerAll` literal,
or harvest the `declare global { interface HTMLElementTagNameMap }` blocks
that each component already carries) — but that plugin *is* project-specific
manifest infrastructure, which is what the strawman claimed to avoid.

*Other misses.* `PpButton` — the customised built-in (`extends
HTMLButtonElement`, registered with `{ extends: 'button' }`) — is not
recognised as a custom element at all; customised built-ins sit outside CEM's
model. It is the only one, but `is="pp-button"` appears 79 times across both
surfaces, and `primitives-button--docs` is a referenced catalogue entry.
`BarChart` (indirect superclass chain through `ChartComponent`) is missed;
the abstract `D3Component` base is a false positive. Plain-`HTMLElement`
components (toast, modal, table, sections, toc, avatar, h) land as classes
but expose no attributes — only the 19 Lit files yield rich metadata.

*Coverage against the catalogue — the decisive number.* The component
catalogue has 40 docs entries (19 primitives, 17 components, 4 operations;
plus 3 data-viz). Only ~14 of the 40 are backed by registered `pp-*`
elements. The rest are CSS-class-only entries (badge, tag, card, callout,
counter, keyboard-key…), native-HTML documentation (dialog, details,
textarea, checkbox, radio), or React subsystems (item-view, combobox/filter,
command-menu, sidebar, bubble-menu, block-based-editor). Of the 39 distinct
`ComponentRef` ids used in site content (165 usages), roughly a quarter
target CEM-visible elements; the rest — including the heaviest,
`actions-coordination-messaging--docs` at 14 usages — CEM can never see. The
"thin wrapper" would therefore carry ~three-quarters of the resolution
surface: the economics of the strawman inverted.

## Gate question 2 — one artifact, two surfaces?

No, not through any supported path. The Storybook is `@storybook/react-vite`
10.4 (`.storybook/main.ts`), not the web-components framework.
`setCustomElementsManifest` is `@storybook/web-components` machinery — its
docgen turns the manifest into ArgTypes tables for that framework only. In a
react-vite Storybook none of it loads; Storybook 10 additionally reworked the
API (manual `extractArgTypes` wiring) and has open bugs in the area. Nor is
there a consumer waiting: `reactDocgen` is deliberately disabled and the
catalogue's docs are hand-authored MDX, not generated props tables. The
one-artifact premise does not survive; a CEM would feed IDE tooling at most,
not either publishing surface.

## Gate question 3 — is index.json the simpler authority?

Yes, and it is already in place.

- *It exists on both surfaces.* `build-storybook` emits it, and the root
  `build` script copies the whole Storybook into
  `apps/patterns/public/storybook/` *before* the site build — the ordering a
  build-time validator needs is already the ordering the pipeline has.
- *It covers everything addressable.* 239 entries in the fresh build, 68 of
  them docs pages — including the pattern-roled, CSS-only, native-HTML and
  React-backed entries that CEM can never represent. If a docs id is not in
  `index.json`, the link is broken, whatever kind of page it points at. This
  is the definition of the resolution authority.
- *It already carries the wrapper's payload.* Entries hold `title` and the
  full tag taxonomy (`role:component`, `activity-level:*`, `atomic:*`,
  `lifecycle:*`, `mediation:*`). The strawman's "role/tag metadata" wrapper
  duty is a no-op.
- *It catches the real failure classes.* Validation of all 165 usages found:
  `actions-application-button--docs` (1 usage; Button's real id is
  `primitives-button--docs` — a section-rename casualty, T2's
  one-hyphen class) and `actions-evaluation-semantic-zoom--docs` (4 usages;
  SemanticZoom is stories-only with `!autodocs`, so the docs id never
  existed — T1's stale-prose class). Both await T4, which owes the semantic
  zoom site entry anyway.
- *Freshness is the one real caveat.* The site's public copy was five days
  stale and still lacked `components-item-view--docs` and
  `components-morphing-controls--docs`, which the 2026-07-07 rebuild
  resolves. A validator must read
  `packages/components/storybook-static/index.json` (fresh by build order),
  falling back to the public copy with a warning when running the site build
  standalone.

The demos index — the wrapper's remaining duty — needs no manifest either:
site pages import `@pkg/demos/*` as source modules, so a broken demo
reference already fails the site build through Vite resolution.

## Adjacent systems, for calibration

Shoelace/Web Awesome and Carbon ship `custom-elements.json` plus derived
artifacts (`vscode.html-custom-data.json`, `web-types.json`) because their
consumers are *external*: IDE completion for users, typed wrappers, docs
generation from source. This repo's consumers are its own two surfaces, both
already served. The manifest's flagship use cases do not exist here; adopting
the format would be cargo weight until one appears.

## Consequences

- *Workstream 2, revised*: a build-time `ComponentRef` validator against
  `index.json` (plus, symmetrically cheap: validate `PatternRef` slugs in
  Storybook MDX against the site's content collection). CEM generation is
  contingent — revive only when a concrete consumer appears (IDE custom-data,
  generated wrappers), and budget for the tag-mapping plugin and the
  customised-built-in blind spot when doing so.
- *Open question 1 (React manifest scope)*: dissolved. Under `index.json`
  authority, React-backed entries are docs entries like any other; no wrapper
  entries, no second manifest.
- *Open question 5 (components `exports`)*: the research made the de-facto
  public surface legible without a manifest. The site consumes exactly:
  `@components/register-all.ts` (side-effect element registration),
  `@components/MermaidDiagram`, `@components/PatternGraph`,
  `@components/sidebar`, and `@pkg/demos/*` (16 modules). `main.ts`'s 17
  exported classes are not imported by anything outside the package. An
  honest `exports` field, when written, is those five entry shapes — but the
  plan's stance stands: aliases remain until enforcement is wanted.
- *Workstream 4 step 1, small bonus*: `react-to-webcomponent` (root
  dependency) has zero usages in any workspace source — droppable, not
  movable.
- *Spec follow-up (not this note's edit)*: `graph-relationship-model.md` says
  component references resolve against "the component manifest". When the
  validator lands, re-point that phrase at Storybook's `index.json` as the
  named resolution dataset.

## Sources

- [Storybook issue #33038 — setCustomElementsManifest with web components & vite broken](https://github.com/storybookjs/storybook/issues/33038)
- [Storybook docs — web-components-vite framework](https://storybook.js.org/docs/get-started/frameworks/web-components-vite)
- [Stencil/Storybook argTypes from JSDoc (Storybook 10 extractArgTypes change)](https://michael-kuehnel.de/web%20components/2025/11/05/stencil-storybook-argtypes-from-jsdoc-comments.html)
- [Shoelace usage — shipped custom-data / web-types](https://shoelace.style/getting-started/usage)
- [custom-elements-manifest format](https://github.com/webcomponents/custom-elements-manifest)
