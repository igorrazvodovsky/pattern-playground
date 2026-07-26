---
title: "Pattern dates"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-26"
area: "patterns-site"
promoted_to: ""
superseded_by: ""
---
# Pattern dates

Add two dates to every entry in `apps/patterns/src/content/patterns/`: when the
pattern was added to the library, and when it was last meaningfully changed.

## Design framing

The two dates look symmetric and are not. That asymmetry decides the whole
approach.

*Last-updated is a judgement, not a fact about the filesystem.* The repository's
history is full of mechanical sweeps that touch nearly the entire corpus:

| commit | date | pattern files touched |
| --- | --- | --- |
| `c87c44b7` Flatten pattern file structure | 2026-06-05 | 121 |
| `c081655a` Remove h1 from MDX files | 2026-06-01 | 115 |
| `2cb8ca35` Reorganise the project | 2026-05-16 | 115 |
| `8c8d9c28` Move fun meter to frontmatter | 2026-06-01 | 97 |
| `80252942` Hide fun meters | 2026-05-18 | 97 |
| `b587873c` Update links | 2026-05-18 | 72 |
| `1a32c6e9` Backfill 'situation' | 2026-07-25 | 67 |

A `git log -1`-derived `updated` would stamp roughly every one of the 118
patterns with the date of the most recent sweep. Deleting an `<h1>` is not an
update to the argument; only the author knows which is which. So `updated` is
hand-authored frontmatter, written when the change is made.

*Added is a fact, and git holds it.* A file's first commit cannot be overwritten
by later sweeps, so `git log --follow --diff-filter=A` recovers it. Across the
118 files this yields 62 distinct dates spanning 2025-01-22 to 2026-07-25 —
real signal, worth a backfill rather than hand-typing.

The repository's own initial commit is `8dd783d8` (2025-01-20). The three
earliest patterns — `agency`, `density`, `principles` — first appear two days
later in `221c99f0` / `deeaa6b7`, so they are genuine adds rather than files
truncated at the repo boundary. Nothing in the corpus predates the repo.

*Neither field should be computed at build time.* Once `added` is backfilled into
frontmatter, the site never shells out to git: no 118 subprocesses per build, no
shallow-clone breakage on CI, no coupling between the rendered page and the
clone's history depth.

## The pre-split history problem

`--follow` traces 92 of the 118 files cleanly. The remaining 26 stall at one of
two rename-detection failures:

- `2cb8ca35` *Reorganise the project* (2026-05-16) — created `apps/patterns/`
  and moved pattern prose out of `src/stories/`. 20 files stall here.
- `c87c44b7` *Flatten pattern file structure* (2026-06-05) — 6 files stall here.

Before the split, pattern prose lived alongside its stories as
`src/stories/**/TitleCase.mdx`. Rename detection followed most of them, but for
these 26 the path change plus case change plus frontmatter rewrite pushed the
similarity below git's 50% threshold.

All 26 are recoverable by matching basenames case-insensitively with hyphens
stripped, then reading the first-add date of the pre-split path. Verified:

| slug | stalled at | true date | pre-split path |
| --- | --- | --- | --- |
| abort | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/Abort.mdx` |
| agent-opening | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/AgentOpening.mdx` |
| ai-completion | 2026-05-16 | 2026-03-25 | `src/stories/actions/application/AiCompletion.mdx` |
| ai-tuning | 2026-06-05 | 2025-05-20 | `src/stories/activities/AITuning.mdx` |
| assisted-task-completion | 2026-06-05 | 2026-03-25 | `src/stories/actions/application/AssistedTaskCompletion.mdx` |
| autocomplete | 2026-05-16 | 2026-03-25 | `src/stories/operations/Autocomplete.mdx` |
| closing | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/Closing.mdx` |
| command-menu | 2026-05-16 | 2025-05-23 | `src/stories/actions/seeking/CommandMenu.mdx` |
| data-view | 2026-05-16 | 2025-04-11 | `src/stories/actions/seeking/DataView/DataView.mdx` |
| filtering | 2026-05-16 | 2025-05-21 | `src/stories/actions/seeking/Filtering.mdx` |
| form | 2026-05-16 | 2025-07-08 | `src/stories/actions/application/Form.mdx` |
| fully-connected | 2026-06-05 | 2025-11-27 | `src/stories/actions/navigation/fully-connected.mdx` |
| generated-content | 2026-05-16 | 2025-06-27 | `src/stories/activities/GeneratedContent.mdx` |
| grouping | 2026-05-16 | 2025-04-11 | `src/stories/actions/sense-making/Grouping.mdx` |
| inquiry-agent | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/InquiryAgent.mdx` |
| modality | 2026-05-16 | 2026-04-01 | `src/stories/foundations/Modality.mdx` |
| multilevel-tree | 2026-05-16 | 2025-11-28 | `src/stories/actions/navigation/multilevel-tree.mdx` |
| navigation-overview | 2026-06-05 | 2026-03-19 | `src/stories/actions/navigation/navigation-overview.mdx` |
| next-best-action | 2026-06-05 | 2026-03-25 | `src/stories/actions/application/NextBestAction.mdx` |
| overview-detail | 2026-06-05 | 2026-01-12 | `src/stories/actions/navigation/OverviewDetail.mdx` |
| prompt | 2026-05-16 | 2025-05-20 | `src/stories/activities/Prompt.mdx` |
| sequence-completion | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/SequenceCompletion.mdx` |
| sorting | 2026-05-16 | 2026-03-19 | `src/stories/actions/seeking/Sorting.mdx` |
| step-by-step | 2026-05-16 | 2025-11-29 | `src/stories/actions/navigation/step-by-step.mdx` |
| unavailable-actions | 2026-05-16 | 2025-03-16 | `src/stories/operations/UnavailableActions.mdx` |
| user-opening | 2026-05-16 | 2025-10-17 | `src/stories/operations/conversation/UserOpening.mdx` |

Corrections range from a month to fourteen (`unavailable-actions`:
2026-05-16 → 2025-03-16).

Basename matching is a heuristic, and the project has been bitten by
path-based slug inference before. These 26 rows get eyeballed against the
pre-split file's own `title` before anything is written — see the review gate
in step 1.

## What exists, what's missing

*Exists and reusable:*

- `apps/patterns/src/content.config.ts` — zod schema, no `.strict()` /
  `.catchall()` anywhere in `scripts/` or `apps/patterns/src/`. Zod's default is
  to strip unknown keys, so neither `scripts/extract-graph-data.ts` nor any
  `check-*.mjs` script will reject two new fields.
- `packages/components/src/styles/badge.css` — reaches the patterns app through
  `apps/patterns/src/styles/lib.css` → `@styles/components.css` →
  `@import url(badge.css)`. The `.badge` class is already available. *No new CSS
  is needed.*
- `apps/patterns/src/components/Consequences.astro` — the idiom for a small
  `.astro` that takes `entry` and renders a derived block.
- `apps/patterns/src/components/PatternArticle.astro:29-35` — the `.meta` div,
  the agreed placement. `.meta` itself carries no styling; it is a bare wrapper.
- `shared/format`, landed in `2b6d6214`. Supplies `formatDate`, `isoDate` and
  `formatRelativeTime`, plus the UTC-midnight guard. Used, not extended.
- `apps/patterns/src/lib/` — the documentation site's own client modules
  (`link-preview.ts`, `demo-expander.ts`, `active-path.ts`), imported from
  `Base.astro`'s script block. The idiom the relative-text upgrade follows.

*Missing:*

- The two schema fields.
- The backfill script.
- The render.
- `apps/patterns/src/lib/pattern-dates.ts`, the client module that upgrades the
  rendered dates to relative text (step 3, caveat 2).

## Placement

Dates go in the existing `.meta` div in `PatternArticle.astro`, as `.badge`
elements, alongside the role / activityLevel / mediation badges that are
currently commented out. Those three stay commented out. The date badges are the
only visible occupants of `.meta` besides the `<h1>`.

## Steps

Order matters: `added` is required, so the frontmatter must carry it *before* the
schema demands it. Backfill first, tighten the schema second — the reverse leaves
118 files failing validation across the review gate.

### 1. Backfill script

`scripts/backfill-pattern-dates.mjs`, run once, two-pass:

1. For each `apps/patterns/src/content/patterns/*.mdx`, take
   `git log --follow --diff-filter=A --format=%ad --date=short` and read the
   last line.
2. If that commit is `2cb8ca35` or `c87c44b7`, resolve the pre-split path by
   normalising basenames (lowercase, hyphens stripped) against
   `git ls-tree -r --name-only 2cb8ca35^ | grep '^src/stories/.*\.mdx$'`, and
   take the first-add date of *that* path instead.

*Review gate.* The script's first run writes nothing — it emits the 26-row
mapping table with each pre-split file's `title` frontmatter field alongside the
current file's, for a by-eye check that `Abort.mdx` really is `abort.mdx` and
not a same-named different pattern. Only after the mapping is signed off does a
second run insert `added:` into frontmatter.

Insertion goes after the `title:` line, so the field lands in a predictable
place across all 118 files. `updated:` is *not* written by the script — it stays
absent until a real edit warrants one.

### 2. Schema

Only once all 118 files carry `added:`. In
`apps/patterns/src/content.config.ts`:

```ts
// When the pattern entered the library, and when its argument last moved.
// `added` is backfilled from git first-commit; `updated` is hand-authored —
// mechanical sweeps touch ~every file, so git cannot tell an argument change
// from an <h1> deletion. See plans/active/2026-07-pattern-dates.md.
added: z.coerce.date(),
updated: z.coerce.date().optional(),
```

`z.coerce.date()` rather than `z.string()` so both unquoted YAML dates
(`added: 2025-10-17`) and quoted strings parse. `added` is required, which is
why it cannot land before step 1. `updated` is optional; when absent the badge
is *omitted*, never filled from `added` — an "Updated" badge showing the added
date would assert something false.

### 3. Render

`2b6d6214` ("Add 'figures' as one of the form foundations") landed the
formatting layer this step needs, so nothing here is hand-rolled:

- `shared/format` — `formatDate`, `isoDate` and `formatRelativeTime`. Reachable
  from the patterns app as `@shared/format` (alias in
  `apps/patterns/astro.config.mjs:40`, path in `tsconfig.json:9`).

The UTC-midnight trap is already handled: `date.ts`'s `calendarSafe` detects a
bare `YYYY-MM-DD` *string* and formats it in UTC so the calendar day survives.

#### Both badges read as age, always

`Added 6 months ago`. `Last updated over 2 years ago`. Relative at every
distance, never switching to an absolute date.

`relative-time.ts` sets `RELATIVE_THRESHOLD_DAYS = 7` and argues it as the span
over which "last Tuesday" is still something a reader holds without counting —
past that, the reader is *owed the date*. That is not contradicted here, because
it does not apply here. Figures describes the interfaces built *with* the
components and patterns; these badges are the documentation layer *about* the
library, and a pattern's age is not a value a product interface renders. The
question the badge answers is how settled a pattern is, where the figure is the
point and the exact date is noise.

So this is an exception, not a case the foundation should grow to cover today.
Nothing in `shared/format` or `<pp-timestamp>` changes; the seven-day default
stays right for the timestamps it was written for. If the shape proves out and
recurs, extending the foundation is a later decision made on its own evidence.

*Not `over 2 years ago`.* `Intl` produces `2 years ago`, and prepending an
English qualifier to a formatter's output is precisely what `shared/format`
exists to prevent. `numeric: 'auto'` already yields `2 years ago`, `last year`,
`last month`, `yesterday` — and a floored `2 years ago` already reads as "at
least two". The qualifier was considered and is out.

#### Shape

`apps/patterns/src/components/PatternDates.astro`, following the
`Consequences.astro` shape — takes `entry`, renders nothing of its own layout:

```astro
<span class="badge">
  Added <time datetime={isoDate(added)} data-relative>
    {formatDate(added, { dateStyle: 'medium' }, 'en-001')}
  </time>
</span>
{updated && (
  <span class="badge">
    Last updated <time datetime={isoDate(updated)} data-relative>
      {formatDate(updated, { dateStyle: 'medium' }, 'en-001')}
    </time>
  </span>
)}
```

What ships in the HTML is the absolute date, which is correct without JavaScript
and stays correct indefinitely — an absolute date does not age. `data-relative`
marks it for upgrading.

When `updated` is absent the badge is omitted entirely — never filled from
`added`.

Invoked inside the `.meta` div in `PatternArticle.astro`, above the `<h1>`.

#### Caveat 1: the locale matters less than it looks, but must still be explicit

Once both badges read as age, the visible text is locale-invariant. Verified —
`en-001`, `en-GB`, `en-US` and bare `en` all render `6 months ago` and
`2 years ago` identically. Nothing about the phrasing is at stake.

The explicit tag survives for the fallback child and the `title`/hidden absolute
the element carries, where an actual date is formatted. There it is needed,
because `PatternDates.astro` is a server component and the site is static output
(no `output` or `adapter` in `apps/patterns/astro.config.mjs`), so it runs at
*build* time where there is no reader to ask:

- `documentLocale()` opens with `if (typeof document === 'undefined') return
  undefined` — during SSR the `lang` channel is inert, so `Base.astro`'s `lang`
  has no effect on it whatever it says.
- The runtime floor is then the *build machine*. Verified: Node resolves an
  undefined locale to `en-US` and renders `Oct 17, 2025`, with `LANG`/`LC_ALL`
  unset exactly as on CI.

So passing no locale would bake the build machine's answer into static HTML.
`en-001` — *English (World)*, CLDR's international English — gives `17 Oct 2025`
without asserting the pages are British, and passes `locale.ts`'s own
`CARRIES_REGION` guard.

`en-001` is not a candidate default for `shared/format` — in a product
interface, where the reader's locale is genuinely reachable, the module is right
to defer to it. It is correct here only because build time has no reader to
defer to, and because these badges are documentation chrome rather than an
interface built with the library.

#### Caveat 2: the relative text is a documentation-layer module

Relative text cannot be computed at build time. It is correct only to within the
deploy interval and fails silently and without bound if deploys stop — a page
built a year ago would still claim `6 months ago` forever. So the figure has to
be produced in the browser.

`<pp-timestamp>` would do this, but using it would mean changing it: its
`bucket()` returns `null` past seven days, and `describeTimestamp` mis-renders
calendar dates (below). Both are foundation changes this plan has decided not to
make. The documentation layer upgrades its own dates instead.

`apps/patterns/src/lib/pattern-dates.ts`, in the established idiom of that
directory — `link-preview.ts`, `demo-expander.ts`, `active-path.ts` are all
small client modules imported from `Base.astro`'s script block. It walks
`time[data-relative]`, reads the `datetime` attribute, and replaces the text
with a relative phrase, keeping the absolute in `title`.

Two things it must get right, both already solved problems in this codebase:

- *Re-run after navigation and pane injection.* `Base.astro` re-runs
  `mountDemos` on `astro:page-load`, and `StackManager` injects related panes as
  innerHTML. Dates in those panes need upgrading too, so this follows the same
  pattern rather than running once at load.
- *Bucketing past seven days.* `formatRelativeTime` is exported from
  `shared/format` and handles the phrasing; only the ladder — days, weeks,
  months, years, flooring at each step — is local. Using the module is not
  extending it.

*The date-only bug stays recorded, not fixed.* `describeTimestamp` renders its
absolute branch with `formatDateTime(date, undefined, locale)`, passing an
already-constructed `Date`. `calendarSafe` only triggers on a `YYYY-MM-DD`
*string*, so the UTC guard is skipped, and `formatDateTime` appends a time the
value never carried. Verified: `2025-10-17` renders as `17 Oct 2025, 02:00`.
This plan does not touch it — `PatternDates.astro` calls `formatDate` directly
with the raw string, which keeps the guard. It is noted because `date.ts`
already knows a calendar date is a different kind of value from an instant and
`relative-time.ts` does not, and the next caller of `<pp-timestamp>` with a
date-only value will hit it.

### 4. Verification

- `npm run build` in `apps/patterns` — schema accepts all 118 files.
- `scripts/extract-graph-data.ts` still emits its usual node/edge counts
  (110 nodes / 618 edges as of the typed-relationships work).
- Spot-check a pane render and a full-page render.
- *Check the built HTML's `<time>` text and `datetime` attribute.* Assert the
  emitted markup carries `17 Oct 2025` and `datetime="2025-10-17"`, not
  `Oct 17`. A dropped locale argument fails silently otherwise: the build
  succeeds and ships the wrong order.
- Build once with `LANG` and `LC_ALL` unset, to confirm the output does not move
  with the build environment. If it does, the locale argument is not reaching
  the formatter.
- *View a page with JavaScript disabled.* The badges must read
  `Added 17 Oct 2025` — the shipped absolute — rather than being empty.
- *Open a related pane from the stack* and confirm its dates read relative too,
  not just pane 0's. This is the re-run requirement in caveat 2, and it is the
  thing most likely to be missed.

## Backdating `updated`: attempted, and not recommended

Four heuristics were tried against the real history. The finding is not that
backdating is noisy — it is that it is *uninformative*, and for a reason no
heuristic can fix.

*Attempt 1 — ignore commits that touched many pattern files.* At a threshold of
20 files, 70 of the 118 patterns had no qualifying commit at all: they have only
ever been touched by sweeps. The picks that did resolve were themselves
mechanical (`Move demos`, `Move/reorg components`, `Patter site: add
placeholders`). Commit width does not separate mechanical from substantive.

*Attempt 2 — per-file diff magnitude.* 78 of 118 landed on `1a32c6e9`
"Backfill 'situation'", which added 15–25 lines of frontmatter per file. High
churn, zero argument change. Churn does not separate them either.

*Attempt 3 — body churn, ignoring frontmatter.* The right discriminator in
principle: a frontmatter migration changes no prose. This resolved all 118, but
36 landed on `9a276de4` "Refit the pane stack to Astro's grain" and 23 on
`1109a5b8` "Bot → Agent" — structural and rename sweeps that *do* rewrite prose.

*Attempt 4 — body churn with the 15 known sweep commits hand-excluded.* Still
14 files landed on "Add resizable/surface controls to Demo", 12 on "Organise
conversational primitives", 10 on "Move components around a bit". Every round of
exclusion surfaces another infrastructure commit that happens to touch prose.

The resulting distribution, at its best:

| month | patterns |
| --- | --- |
| 2026-07 | 58 |
| 2026-06 | 45 |
| 2026-05 | 13 |
| 2026-03 | 1 |
| 2026-02 | 1 |

116 of 118 patterns land inside a single three-month window, and the dates come
overwhelmingly from demo plumbing, file moves, and relationship migrations
rather than from anyone rethinking a pattern.

*Why this is not a fixable heuristic problem.* The clustering is real. The
corpus genuinely was swept end-to-end several times between May and July 2026 —
the split, the flatten, the relationship migration, the situation backfill, the
pane refit. A truthful "when did this file last change" answer really is "July
2026" for most of the library. The stated interest is *recentness*, and
recentness computed this way is flat: nearly every badge would read the same
month, which tells a reader nothing and quietly asserts editorial attention that
was actually infrastructure work.

*Recommendation: do not backfill `updated`.* Leave it absent and let it
accumulate honestly from here — a pattern shows an Updated badge once someone
actually revises it, and an absent badge means "not revised since it was added",
which is both true and useful. The corpus becomes informative within a few
months of ordinary work.

If some visible signal is wanted sooner, the one defensible version is a short
hand-marked list — the patterns whose arguments the author knows moved recently
(the view-system reshape, drag-and-drop, block-editing). A dozen deliberate
judgements beat 118 inferred ones. That is a content decision, not a script.

## Open questions

- *Does `updated` want a sibling index?* Once the field exists, a
  "recently updated" listing becomes cheap. Out of scope here; noted so the
  field is not designed in a way that blocks it.
- *Both badges at once.* A pattern added and revised in the same week reads
  `Added 3 days ago · Last updated yesterday`, which is close to saying the same
  thing twice. Possibly the `updated` badge should be suppressed when the two
  land in the same bucket. Worth looking at once it is on screen.
- *Whether this eventually belongs in the foundation.* Deliberately deferred.
  Figures covers interfaces built with the components and patterns, not the
  documentation layer, so age-as-a-figure has no home there today. If the shape
  recurs, that is the evidence to reopen it on.
