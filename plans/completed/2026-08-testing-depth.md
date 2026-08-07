---
title: "Component testing depth"
status: "completed"
kind: "exec-spec"
created: "2026-08-07"
last_reviewed: "2026-08-07"
area: "quality"
promoted_to: "docs/quality/testing-strategy.md, plans/tech-debt-tracker.md"
superseded_by: ""
---

# Component testing depth

## Situation

The component library's test architecture is current: stories run as tests
through `@storybook/addon-vitest` in real headless Chromium, and
`@storybook/addon-a11y` at `test: 'error'` fails the run on any axe violation.
What's missing is depth, not architecture:

- Play functions perform interactions (click a tab, open the dialog) but assert
  nothing about the outcome. A component that swallows the click still passes.
- Keyboard and focus behaviour — arrow-key roving, Escape, focus trap, focus
  return — is untested, and axe cannot see it. For the components this library
  actually has (tabs, dialog, drawer, popover, command menu, toasts), that is
  the hard part.
- Framework-agnostic logic (services, type guards, the graph-extraction
  script) has no unit tests; the only Vitest project is the browser-based
  Storybook one.
- Nothing runs automatically. The a11y error floor and the story tests only
  bite when someone runs them by hand.
- No visual regression coverage; manual verification against running Storybook
  is the documented practice.

This is a single-author research garden, not a shipped product. The plan
weights effort accordingly: outcome assertions and keyboard coverage are worth
real time because they encode how the components are supposed to behave;
enterprise apparatus (snapshot review services, browser matrices) is not.

## Phase 0 — get the suite green

Done 2026-08-07: `test-storybook` passes clean (55 files, 190 tests, no
unhandled errors).

The 30 failures were 64 `color-contrast` violations plus one
`aria-prohibited-attr`; the other ARIA rule names in the original inventory
turned out to be selector text inside the contrast reports, not separate
violations. The contrast failures reduced to a handful of root causes, fixed
at the level they belonged to:

- Colour system: `--c-bodyDimmed` raised from alpha 0.7 to 0.78 — the rung
  where dimmed text still clears 4.5:1 on every surface up to neutral-200.
  `--c-placeholder` stays below the floor by design and is now documented as
  placeholder-prompt-only; its visible-text uses (stat unit, template field,
  chart muted text) moved to `--c-bodyDimmed`. The referenced-but-undefined
  `--c-text-muted` was replaced with `--c-bodyDimmed` (kbd, semantic-zoom,
  dynamic-hyperlinks).
- `.muted`/`.dimmed` switched from `opacity: 0.6` (3.6:1 on body text, and it
  compounds down the subtree) to `color: var(--c-bodyDimmed)`.
- Accent-as-text: tabs (hover/focus/active), sections tab bars, and reference
  mentions used `--c-accent` (accent-500, 3.3:1) as a text colour; all moved
  to `--c-body-accent`, the token that exists for exactly this. Non-text
  accent uses (indicator bar, borders) stay at 500.
- Solid fills: primary and danger buttons moved from -500 fills to
  `--c-accent-700` / `--c-danger-700-boosted`, extending the rule badge.css
  already codified ("solid fills come from 700"). Badge label alpha rose
  0.6 → 0.8 so labels clear 4.5:1 on solid fills; the sidebar group label mix
  rose 70% → 80%; the tab subtitle dropped its extra opacity.
- The Tag `Disabled` story carries a per-story `color-contrast` rule
  exception with an inline justification: disabled controls are exempt under
  WCAG 1.4.3, but the dimmed tag is a span wrapping a disabled button, which
  axe cannot recognise as inactive.
- The `aria-prohibited-attr` failure was the collection-view card renderer
  putting `aria-label` on a role-less `iconify-icon` whose name sits in the
  adjacent text; it is now `aria-hidden`, matching the table renderer.
- The Leaflet teardown flake (`_leaflet_pos` undefined) came from programmatic
  view-fitting animating a zoom the story could unmount mid-transition;
  `fitView` now passes `animate: false`.

Visual consequences to eyeball in Storybook: dimmed/muted text is darker,
primary and danger buttons are notably darker, active tab and section labels
are darker, badge labels stronger. Dark scheme inherits all of it through the
ladder rewiring; primary buttons there flip to dark-on-light fills via the
existing `--l-threshold` mechanism, as badges already did.

## Phase 1 — assertions in existing play functions

Done 2026-08-07. Every `play` function now ends in at least one assertion, and
`test-storybook` stays green (55 files, 190 tests).

The `play` sites are nine files, not the twelve the first inventory listed:
`Checkbox`, `CommandMenu` (×2), `Dialog`, `Drawer` (×3), `Popover`,
`RadioButton`, `Switch`, `Tabs`, `Toast`. Badge, PriorityPlus, Portal and
`foundations/figures-samples` matched a `grep` for `play:` on inline
`display:` styles.

What each one pins:

- Tabs: clicked tab reaches `aria-selected="true"`, and exactly one panel is
  left in the accessibility tree — the one whose `name` matches the tab's
  `panel`.
- Dialog and Drawer: the surface reaches the `open` state, carries the
  position or size class it was asked for, and holds its footer control.
  NonModal additionally pins `data-modal="false"` and that the trigger behind
  it stays reachable, which is the whole point of that story.
- Popover: the panel is visible and matches `:popover-open`.
- Command menu: the option count drops after typing and `Create…` survives —
  which also pins the fuzzy match, since "new" reaches that command through
  its `searchableText`, not its label.
- Switch, Checkbox, RadioButton: checked state asserted *between* the clicks,
  not only after — the two-click plays previously ended where they started.
- Toast: the alert carrying this story's message becomes visible.

Three grains the sweep had to respect, worth carrying into Phase 2:

- Assert structure, never rendered faker text. Roles, counts, `aria-*`,
  `checked` — the strings are regenerated per run.
- Anything downstream of an Elena `updated()` or a CSS entry animation needs
  `waitFor`. Toasts fade in, so they sit in the document at opacity 0 before
  they are visible; modals open a frame after the click.
- The modal service mounts on `document.body`, so assertions scope by title.
  The dialogs carry no accessible name (see the tracker entry), so the title
  heading is the only handle. Phase 2 added the teardown these surfaces were
  missing between stories.

## Phase 2 — keyboard and focus coverage

Judgment work, one component per sitting; each sitting decided what the
correct behaviour *is* before pinning it. These sittings did double duty: the
Elena migration rewrote the internals of exactly these components, and
keyboard and focus handling is what an internals rewrite silently changes.

Done 2026-08-07. Five sittings, six new stories, all named for what they pin
so the coverage shows in the sidebar: `Keyboard operation` on Dialog, Drawer
(twice — modal and side peek), Switch, Checkbox and RadioButton;
`Keyboard navigation` on Tabs and Command menu; `Manual activation` on Tabs.
Suite is at 200 tests.

1. *Dialog and Drawer* — opens from the keyboard, focus follows the surface in,
   Tab cannot leave a modal one, Escape closes, focus returns to the trigger.
   The side peek gets its own story for the half that differs: focus starts
   inside but tabbing walks out into the page it sits beside, because that
   page is still live. That difference is the whole reason the option exists.
2. *Tabs* — arrows move focus and, under the default `auto` activation, the
   selection with it; Home and End reach the ends; the walk wraps.
   `activation="manual"` gets its own story, because splitting focus from
   selection is a real choice, not a variant.
3. *Command menu* — arrowing moves the active option while the input keeps
   focus; Enter on a command opens its context rather than running anything;
   Escape steps back out of the context before it dismisses the menu.
4. *Popover* — Enter on the invoker opens and closes it, focus never leaves
   the invoker. Escape and outside-click dismissal are *not* asserted: both
   are the browser's close-watcher, driven by trusted input, and the synthetic
   events a play function dispatches do not reach it. The story says so, so
   the gap is legible rather than looking like missing coverage.
5. *Form controls* — Space toggles switch and checkbox; a disabled checkbox is
   skipped rather than focused; a radio group is one tab stop with arrows
   moving and selecting between the alternatives, wrapping both ways.

Two gaps surfaced, both fixed rather than asserted around:

- *Focus never returned to the trigger.* `PPModal` recorded the trigger only
  in `handleTriggerClick` — the path where a button inside the `pp-modal`
  opens it. Every service-opened surface is opened programmatically from a
  button in the page, so the field stayed null and closing dropped focus to
  the document. `openModal` now falls back to whatever held focus at the
  moment of opening, and `closeModal` clears the field after restoring so a
  reopened surface never returns to a stale element.
- *Leaked surfaces made later stories untestable.* The service tears a surface
  down only on dismissal, so a story that opened a dialog left it in the top
  layer, and every story after it in the file had an inert canvas — focus and
  clicks stopped landing. This was invisible while play functions only
  clicked things that were already there. `.storybook/preview.ts` now calls
  `modalService.closeAll()` in `beforeEach`.

One gap left as a tracker entry rather than a fix: `pp-tab` sets
`tabindex="0"` on every tab, so a twenty-tab strip is twenty tab stops where
the WAI-ARIA tabs pattern says one. Changing it reshapes the component's focus
model and contradicts its own documented contract, which is the author's call,
not a test's.

## Phase 3 — unit project for framework-agnostic logic

Done 2026-08-07 for the first three targets. `packages/components/vitest.config.ts`
now carries a `unit` project (node environment, `src/**/*.test.ts`) beside the
`storybook` browser one, and the gate runs both: 58 files, 251 tests.

Two pieces of plumbing had to be fixed before a test could run at all.

*The gate was scoped to one project.* The claim that new projects would join
automatically was wrong: root `test` called `test-storybook`, which is
`vitest --project=storybook`, so a `unit` project would have been invisible.
The scripts now separate the two jobs — components gets `test` (`vitest --run`,
every project) alongside the scoped `test-storybook` and a new `test-unit`, and
root `test` calls the workspace's `test`.

While there: `npm run test-storybook -- --run` never delivered `--run` to
Vitest. The flag crossed two `npm run` layers and npm consumed it as its own
config — `npm run test-storybook -- --help` prints npm's help, not Vitest's.
One-shot behaviour was coming from Vitest's non-TTY default, not the flag. The
`--run` now sits in the leaf script where it reaches the binary.

*`@shared` resolved only inside Storybook.* The alias lives in
`.storybook/main.ts`, which the unit project has no reason to load, so anything
importing `@shared/*` — a large share of the interesting targets — failed to
resolve. Both aliases (`@shared`, `@utils`) moved to `resolve.alias` at the top
of `vitest.config.ts`, where `extends: true` hands them to both projects.
`@utils` points at the repository's `utils/`, not `src/utility`; the alias
mirrors Storybook's resolution rather than guessing at it.

Three targets covered, chosen where the code makes a judgement rather than a
calculation:

- `charts/base/chart-types.ts` — the six data guards. Each is the acceptance
  check its own chart component runs before deciding it has something to draw,
  so what is pinned is the shape it takes and the shape it refuses. They are
  deliberately not a discriminated union: line and area both key on `series`,
  bar and scatter both on `data`, and only scatter inspects point shape.
- `services/timeline-grouping-service.ts` — `resolveGrouping` is where a
  model's answer meets the records it claims to describe, so the tests are one
  per repair: a boundary naming no record, a boundary running backwards or
  repeating, a first episode pulled back to the start, two adjacent phases
  given the same name, and the refusal to return a grouping of fewer than two
  levels.
- `templates/collection-view/spec.ts` — `applySpecPatch`, where three
  behaviours look alike in the type and are not: representation and arrangement
  merge, query replaces whole, detail and malleability are cleared by an
  explicit `null`. Plus `makeSpec`'s role-written defaults and
  `isAxisMalleable`'s absent-means-malleable reading.

Writing the timeline tests turned up behaviour worth stating: an episode
covering a single record disappears into that record's leaf, which carries no
title, because a stretch made of one thing is that thing. That is
`collapseSingletons` working as documented, and it now has a test that says so
by name.

Two targets the original list named are deliberately not covered.

*`scripts/extract-graph-data.ts` is dropped from this phase.* It is not
testable as it stands: nothing is exported, everything from line 710 down runs
at module scope, and importing it writes `pattern-graph.json` into the working
tree. Covering its parsers would mean extracting them into importable modules
and leaving the script a thin driver — a restructuring of the graph pipeline,
not an addition of tests. The script runs on every `extract-graph`, and a
malformed edge surfaces in the site build, so the cost of leaving it is
visible rather than silent.

*The unit project stays scoped to `packages/components/src`.* `shared/format`
is the strongest target outside it — `calendarSafe`'s date-only guard is what
stops a stored `1952-09-26` reading as the 25th for a reader west of UTC — but
reaching it means pointing the project's root at the repository, and the
config stays narrow instead. Where `shared/` gets tested is a question for
whenever it is asked, not a gap this plan carries.

In-scope targets left, no decision needed: the comment service and its pointer
types, `utility/hierarchical-search.ts`, and `collection-view`'s
`runSpec`/`groupItems` once the binding fixtures are worth building.

Two things the sitting exposed that are not test work:

- *Nothing in the gate typechecks.* It is lint → Stylelint → Vitest, and
  esbuild strips annotations without checking them, so a test fixture can
  declare a type it does not match and still pass. The first `spec.test.ts`
  fixture did exactly that — `{ field, operator, value }` where
  `AttributeFilter` is `{ id, path, operator, values }` — and was caught by
  reading the type, not by the run. Fixed, and `tsc --noEmit` over the package
  now reports nothing in the test files. Whether `tsc --noEmit` should join the
  gate is a separate decision; it would surface pre-existing noise elsewhere
  in the package first.
- *`applySpecPatch` clears its optional keys two different ways.* `detail` and
  `malleability` are removed with `delete`, so `'detail' in spec` is false
  after clearing; `label` is assigned `undefined`, so `'label' in spec` stays
  true. `makeSpec` uses the `in` check as its absence test, so the two
  disagree about what "absent" means. The tests document what the code does
  today rather than papering over it.

## Phase 3.5 — Stylelint joins the gate

Done 2026-08-07, found while running the full gate for the first time.
`lint:styles` failed with 1480 errors, so the story tests never ran under
`npm run test`. Not new breakage: the script had been named `"test styles"` —
a name `npm run` reaches only when quoted — so the config had never been
matched against the corpus. `npm run test` now passes end to end.

Most of the 1480 was the stock config disagreeing with settled convention. The
config was tuned to what the corpus actually holds rather than the corpus
rewritten to the config:

- `selector-class-pattern` (571) — the convention is BEM in kebab-case, now
  written as a pattern with a message that states it. Five files style tldraw
  and ProseMirror, whose class names this project does not own
  (`.NodeShape_executing`, `.ProseMirror-focused`); they take an override
  widening the pattern rather than an exemption from it.
- `custom-property-pattern` (280) — kebab-case with camelCase segments
  allowed and an optional `_` prefix for component-local tokens, which is what
  `--c-bodyDimmed` and `--_crumb-padding` already are.
- `no-descending-specificity` (74) — off. Ordering here is deliberate.
- `selector-pseudo-class-no-unknown` — `:target-current` allowlisted; it is
  real CSS that Stylelint does not know yet.
- ~230 formatting and notation rules — `--fix`, no judgment involved.

The 44 that were the project's own rules biting turned out to be worth the
run. Colour work: `rgb`/`hsl` shadows and greys converted to OKLCH, dead hex
fallbacks dropped from `var(--c-neutral-N, #666)` (the tokens are always
loaded, so the fallbacks were never reached), and four graph category colours
pulled inside sRGB — chroma only, so hue separation across the AT-level and
mediation schemes is unchanged.

Seven were genuine bugs the rule set had been unable to report:

- `@media (prefers-contrast: high)` in charts.css never matched anything; the
  value is `more`. Verified under emulation: with contrast forced to `more`,
  `(prefers-contrast: high)` is false and `(prefers-contrast: more)` is true.
  The chart border and focus widths behind it were dead and are now live —
  worth an eyeball in high-contrast mode, since nobody has seen them apply.
- `border-color: gray-text` in tag.css — the system colour is `graytext`, and
  the sibling declarations three lines down already spell it correctly.
- `grid-template-areas: subgrid` in messages.css — invalid; only
  `grid-template-rows`/`-columns` take `subgrid`, which the line above does.
- `leading-trim: both` on every button — renamed to `text-box-trim` before it
  shipped anywhere. Verified rather than assumed: in the test browser
  `CSS.supports('leading-trim', 'both')` is false and
  `CSS.supports('text-box-trim', 'trim-both')` is true, so the declaration was
  dropped at parse and buttons render identically without it. Removed rather
  than replaced with the working property, which would trim leading on every
  button — a visual change this sweep has no business making.
- `--globalLineHeight` declared twice in variables.css; the `calc()` and its
  two private inputs were dead behind a later `150%`.
- Four duplicated selectors (`.pane`, `a.badge`, `button:not(:first-child)`,
  `.template-field__error`) merged. All were same-specificity pairs, so the
  merge is behaviour-preserving.
- `@keyframes fadeIn` in tiptap.css renamed to `rise-in`. Keyframe names are
  global and toast.css already defines a `fade-in`; the two were one rename
  away from colliding.

## Phase 4 — where the gate runs

`npm run test` is the full gate — lint, Stylelint, and a one-shot run of both
Vitest projects — and passes end to end as of 2026-08-07.

Decided 2026-08-07: no CI. `origin` is
`github.com/igorrazvodovsky/pattern-playground` and a workflow was available,
but the gate stays a local pre-merge habit: run `npm run test` before merging
any branch into main, anchored to the move-review skill's pre-merge moment.

A single-author garden merges on the author's own machine, where the gate is
one command and the result is read immediately. CI would mostly re-run, minutes
later and in another window, a thing already known — and a red build nobody is
waiting on decays into a badge. Revisit if the library gains a second regular
contributor, which is the same trigger the visual-regression decision below
carries.

If it is revisited, the shape is a workflow on push/PR that runs `npm ci`,
`npx playwright install chromium`, then `npm run test`. The Chromium install is
the only step beyond a plain install.

## Visual regression — decision, default no

Snapshot review is a maintenance tax that a single-author garden mostly pays
without collecting. The documented practice (verify against running
Storybook, dark mode and the pane/phone viewports by hand) stands. Revisit
if either trigger fires:

- a CSS regression ships to the pattern site that a snapshot would have
  caught, or
- the library gains a second regular contributor.

Lightweight path when revisited: per-story `viewport`/`globals` parameters
plus Vitest snapshot support before any external service.

## Validation

- `npm run test` passes end to end from a clean install. Met 2026-08-07.
- `npm run test` runs *both* Vitest projects, not just `storybook` — the
  failure the plan originally got wrong. The file and test counts include the
  `unit` project's files; 58 files and 251 tests as of 2026-08-07.
- Every `play` function contains at least one assertion. Grep on
  `play: async`, not `play:` — the loose pattern matches inline `display:`
  styles and reports four story files that have no play function at all:
  `grep -rl "play: async" src/stories` ⊆ `grep -rl "expect(" src/stories`.
- Keyboard sittings each leave a story whose name says what it pins
  (e.g. `KeyboardNavigation`), so coverage is visible in the Storybook
  sidebar rather than only in code.

## Out of scope

- Multi-browser matrices (Firefox/WebKit instances) — Chromium-only is fine
  at this scale.
- Coverage thresholds — coverage tooling is installed but numbers-as-gates
  invite gaming; assertions and sittings are the measure.
- Server (`apps/server`) testing — separate concern, separate plan if wanted.
