---
title: "Pattern dates"
status: "completed"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-27"
area: "patterns-site"
promoted_to: "apps/patterns/src/content.config.ts, apps/patterns/src/components/PatternDates.astro, apps/patterns/src/lib/pattern-dates.ts, scripts/backfill-pattern-dates.mjs"
superseded_by: ""
---
# Pattern dates

Add two dates to every entry in `apps/patterns/src/content/patterns/`: when the
pattern was added to the library, and when it was last meaningfully changed.

All 118 files carry `added:` and an `updated:` key — 13 with a hand-marked value,
105 blank. The blank is deliberate: revising a page means filling it in rather
than recalling a field name, and an empty `updated` renders no badge. Both badges
read as age. The durable residue is the four files named in `promoted_to`; what
follows is the reasoning and the execution trace.

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
mapping table with the pre-split file's own name alongside the current file's,
for a by-eye check that `Abort.mdx` really is `abort.mdx` and not a same-named
different pattern. Only after the mapping is signed off does a second run insert
`added:` into frontmatter.

Pre-split prose was Storybook MDX and carries no YAML frontmatter, so there is
no `title:` field to compare against: the name lives in the `<h1>` (stripped
later by `c081655a`) and, as a slash path, in `<Meta title>`. The script reports
both, and a row passes if either agrees with the current `title`.

*Gate outcome.* All 26 rows reproduced the table above exactly — same pre-split
paths, same dates. Twenty-three names agreed verbatim. Three differed and were
signed off individually, and the script records them so a re-run cannot silently
widen the exception:

| slug | pre-split | current | why |
| --- | --- | --- | --- |
| agent-opening | Bot opening | Opening (Agent) | the Bot → Agent rename (`1109a5b8`) |
| inquiry-agent | Inquiry (Bot) | Inquiry (Agent) | same rename |
| navigation-overview | Navigation models | Navigation | retitle of the same file under the same basename |

The script also flags any cleanly-traced file whose add commit is itself one of
the seven corpus-wide sweeps — a rename-detection failure the two sentinels
would not catch. None were. (The discriminator is the commit, not the date:
`drag-and-drop` was added on 2026-07-25, the day of the `situation` backfill,
by its own commit.)

Insertion goes after the `title:` line, so the field lands in a predictable
place across all 118 files. `updated:` follows it, written as a bare key with no
value — see below. Both insertions are idempotent, so a re-run after new files
land does the right thing.

*Why the key is written empty rather than left absent.* An absent field is a
field the next author has to remember exists; a blank one is a prompt they fill
in place, at the moment they are already editing the frontmatter. That is the
whole benefit, and it costs nothing: an empty value asserts exactly what an
absent one did.

Copying `added` into it was the other candidate and is rejected. It would state
a last-revision date the repository does not know, and a later "recently
updated" index (open question 1) would silently rank the whole corpus by
add-date while looking like it ranked by revision.

### 2. Schema

Only once all 118 files carry `added:`. In
`apps/patterns/src/content.config.ts`:

```ts
// When the pattern entered the library, and when its argument last moved.
// `added` is backfilled from git first-commit; `updated` is hand-authored —
// mechanical sweeps touch ~every file, so git cannot tell an argument change
// from an <h1> deletion. See plans/active/2026-07-pattern-dates.md.
added: z.coerce.date(),
updated: z.coerce.date().nullish(),
```

`z.coerce.date()` rather than `z.string()` so both unquoted YAML dates
(`added: 2025-10-17`) and quoted strings parse. `added` is required, which is
why it cannot land before step 1. `updated` carries a value on 13 entries (see
the hand-marked list below); when it is empty the badge is *omitted*, never
filled from `added` — an "Updated" badge showing the added date would assert
something false.

*`.nullish()`, not `.optional()`.* An empty YAML value is `null`, and
`z.coerce.date()` coerces `null` to `new Date(null)` — the Unix epoch. Under
`.optional()` all 118 entries would have validated cleanly and rendered
`Last updated 56 years ago`. `.nullish()` wraps the nullable check outside the
coercion, so `null` short-circuits and stays `null`. Verified directly:
`z.coerce.date().optional().parse(null)` returns `1970-01-01T00:00:00.000Z`.

*What the field actually holds is a `Date`, not the source text.* Astro parses
frontmatter with `js-yaml`'s default schema, which includes the YAML 1.1
timestamp type, so an unquoted `added: 2025-10-17` is already a `Date` at UTC
midnight before zod sees it — `z.coerce.date()` passes it through unchanged. A
quoted string reaches the same value by coercion, so the two spellings stay
interchangeable and hand-authoring `updated:` needs no quoting discipline. But
it means step 3 cannot hand `formatDate` the raw string; see below.

### 3. Render

`2b6d6214` ("Add 'figures' as one of the form foundations") landed the
formatting layer this step needs, so nothing here is hand-rolled:

- `shared/format` — `formatDate`, `isoDate` and `formatRelativeTime`. Reachable
  from the patterns app as `@shared/format` (alias in
  `apps/patterns/astro.config.mjs:40`, path in `tsconfig.json:9`).

The UTC-midnight trap is already handled: `date.ts`'s `calendarSafe` detects a
bare `YYYY-MM-DD` *string* and formats it in UTC so the calendar day survives.
Since the frontmatter value arrives as a `Date` (step 2), the guard has to be
given something to key on: `PatternDates.astro` round-trips through
`isoDate(value)` and formats *that*. Skipping the round-trip would render the
previous day anywhere west of Greenwich — including on a build machine, where it
would bake into static output.

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
const asBadge = (value: Date) => {
  const iso = isoDate(value);
  return { iso, text: formatDate(iso, { dateStyle: 'medium' }, 'en-001') };
};
---
<span class="badge">
  Added <time datetime={added.iso} data-relative>{added.text}</time>
</span>
{updated && (
  <span class="badge">
    Last updated <time datetime={updated.iso} data-relative>{updated.text}</time>
  </span>
)}
```

What ships in the HTML is the absolute date, which is correct without JavaScript
and stays correct indefinitely — an absolute date does not age. `data-relative`
marks it for upgrading.

When `updated` is empty the badge is omitted entirely — never filled from
`added`. This is the first slice of open question 2 below: the placeholder case
is the degenerate one, where the two dates are not merely in the same bucket but
the same value. Suppressing a genuinely-close pair is still open, and harder,
because the bucket is only known in the browser.

Invoked inside the `.meta` div in `PatternArticle.astro`, above the `<h1>`.

*The badges carry `data-pagefind-ignore`.* `.meta` sits inside the article's
`data-pagefind-body`, so without it every one of the 118 pages contributes the
token "Added" plus a year: measured, a search for `2025` returned 89 pages and
`Added` returned all 118. With the attribute those fall to 19 and 50 — the
genuine prose occurrences — and content searches are unchanged. A date badge is
chrome *about* the page, not part of what the page says.

*The `title` uses `dateStyle: 'long'` where the body text uses `medium`.* The
body text is the compact fallback that ships in the markup and is replaced by
the relative phrase; the `title` is the value a reader goes looking for once the
visible text has stopped being a date, so it spells the month out.

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

- *Re-run after navigation and injection.* An article reaches the DOM by three
  routes, not the two the mounted-demos idiom deals with: the initial render and
  ClientRouter swaps, panes injected as innerHTML by `StackManager`, and the
  link-preview popover, which fetches the same pane partial through
  `pane-content.ts` and strips only the `<h1>` — so the `.meta` badges survive
  into it. Three call sites for an explicit hook is what tips this to a
  `MutationObserver` on `document.body`: it covers all three, gains no hook site
  as more are added, and is the reason this module diverges from
  `mountDemos`'s shape. Verified against all three.
- *Bucketing past seven days.* `formatRelativeTime` is exported from
  `shared/format` and handles the phrasing; only the ladder — days, weeks,
  months, years, flooring at each step — is local. Using the module is not
  extending it. The ladder is descending and gapless: `0 → today`,
  `1 → yesterday`, `7 → last week`, `31 → last month`, `366 → last year`,
  `850 → 2 years ago`.

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

All of the following ran and passed.

- `npm run build` in `apps/patterns` — schema accepts all 118 files.
- `scripts/extract-graph-data.ts` re-emits `pattern-graph.json` byte-identical
  (117 nodes / 650 edges at this corpus size). The count is not the check; the
  clean `git diff` on `src/data/` is.
- Spot-check a pane render and a full-page render.
- *Check the built HTML's `<time>` text and `datetime` attribute.* Assert the
  emitted markup carries `17 Oct 2025` and `datetime="2025-10-17"`, not
  `Oct 17`. A dropped locale argument fails silently otherwise: the build
  succeeds and ships the wrong order.
- Build once with `LANG` and `LC_ALL` unset, to confirm the output does not move
  with the build environment. If it does, the locale argument is not reaching
  the formatter.
- *Build once under a hostile zone* — `TZ=America/Los_Angeles`. This is the
  separate axis the locale test does not cover, and the one that catches a
  missing `calendarSafe`: `17 Oct 2025` means the guard holds, `16 Oct 2025`
  means it does not.
- *View a page with JavaScript disabled.* The badges must read
  `Added 17 Oct 2025` — the shipped absolute — rather than being empty.
- *Open a related pane from the stack* and confirm its dates read relative too,
  not just pane 0's — and the same for a link-preview popover. This is the
  re-run requirement in caveat 2, and it is the thing most likely to be missed.
- The backfill's own round-trip guard: every file's `title` compared before and
  after, and the inserted `added:` read back. 118 files, one insertion each, no
  deletions.
- *Search the built site for `2025`.* The badges sit inside
  `data-pagefind-body`; see the `data-pagefind-ignore` note in step 3.
- *Render a scratch `updated:` value* and confirm the second badge appears with
  the right text and `datetime`. No entry carries a value, so the branch is
  otherwise untested.
- *Grep the built HTML for `Last updated`.* On the 105 pages with an empty
  `updated`, zero hits — that is what confirms the empty value reaches the
  render as `null` rather than as the epoch, which the `.optional()` trap fails
  silently otherwise. Exactly 13 hits, matching the hand-marked list below.
- *Assert every `updated` is strictly after its `added`.* Checked across the
  corpus; a same-day or earlier value would mean the wrong commit was picked.

Not run: `astro check`. `@astrojs/check` is not installed in this workspace, and
the plan does not treat installing it as in scope. `npm run test` and
`npm run test styles` were run and are uninformative here — both are saturated
by pre-existing findings in `public/storybook`'s built assets; the files this
plan adds were linted directly and are clean.

The `added`/`updated` contract was promoted out of the plan into
`docs/specs/pattern-site.md` (required/optional field lists) and
`.claude/rules/pattern-content.md` (the frontmatter template, plus when to write
an `updated`). Without that, the next entry authored would fail schema
validation with the reason recorded only in a comment.

## Backdating `updated`: attempted, and not recommended

The recommendation held for the *automated* case and still does. The
hand-marked list at the end of this section is the exception it anticipated:
thirteen values, each read one commit at a time, which is a different act from
inferring 118.

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

*Recommendation: do not backfill `updated`.* Leave it empty and let it
accumulate honestly from here — a pattern shows an Updated badge once someone
actually revises it, and no badge means "not revised since it was added", which
is both true and useful. The corpus becomes informative within a few months of
ordinary work. (The *key* is written everywhere; it is the value that stays
blank. See step 1.)

If some visible signal is wanted sooner, the one defensible version is a short
hand-marked list — the patterns whose arguments the author knows moved recently
(the view-system reshape, drag-and-drop, block-editing). A dozen deliberate
judgements beat 118 inferred ones. That is a content decision, not a script.

### The hand-marked list

Thirteen pages, read one commit at a time. Two rules did the discriminating,
and both are worth keeping for the next pass:

*Compare bodies, not diffs.* Frontmatter is stripped from both sides before
comparing, so a relationship migration or a `situation` backfill registers as no
change at all. This is the discriminator attempt 3 reached for and could not
make stick alone.

*Body churn is a filter, not the verdict.* Every candidate was read. Demo
plumbing dominates the churn counts and is not an argument move: `sorting`
(±18), `filtering` (±14) and `notification` (±19) all turned out to be a
`{/* TODO: Storybook demo exists */}` becoming a real `<Demo>`, and
`generated-content` (±120) is the same thing at scale. None are marked.

*Changes inside the authoring episode that minted a page are not updates.*
`purpose-keyed-view`, `coordinated-views` and `problem-curated-view` were minted
on 2026-07-16 and reworked on 07-22, but that is one act of authorship still
settling, not a later revision. `attribute-visibility` and `drag-and-drop`
likewise carry only an `added`.

Also unmarked, deliberately: `70e41f3b` *Add "Consequences" section*, which
lifted body Consequences prose into `situation.resulting` and folded the claims
back into the surrounding paragraphs. The page says the same things in different
places — a re-homing pass, which is what step 1's rule about migrations covers.

| slug | added | updated | the episode |
| --- | --- | --- | --- |
| focus-and-context | 2025-04-08 | 2026-07-23 | contextual navigation rebuilt as the certainty fisheye |
| overview-detail | 2026-01-12 | 2026-07-22 | view-system reshape — layout/content interdependence, the width fallback |
| data-view | 2025-04-11 | 2026-07-22 | view-system reshape |
| item-view | 2025-07-12 | 2026-07-22 | view-system reshape |
| semantic-zoom | 2026-07-08 | 2026-07-22 | view-system reshape — the item-view ladder relation |
| navigation-overview | 2026-03-19 | 2026-07-16 | view-system reshape — continuous space added as a topology |
| keyboard-shortcuts | 2026-06-30 | 2026-07-11 | honest facets, situation-level i18n prose |
| block-based-editor | 2025-06-23 | 2026-07-09 | T6 root composites |
| sections | 2026-04-05 | 2026-07-09 | T6 root composites — lead rewritten |
| status-feedback | 2025-07-07 | 2026-07-07 | feedback cluster reshaped; the lead becomes a framework claim |
| form | 2025-07-08 | 2026-06-22 | Split Form — the lead becomes a compositional claim |
| bounded-choice | 2026-06-12 | 2026-06-22 | Split Form — "Choosing a control" added |
| selection | 2026-04-07 | 2026-06-12 | Split Combobox — lead rewritten, Forces added |

## Open questions

- *Does `updated` want a sibling index?* Once the field exists, a
  "recently updated" listing becomes cheap. Out of scope here; noted so the
  field is not designed in a way that blocks it.
- *Both badges at once.* Now observed rather than predicted. Of the thirteen
  marked pages, eleven read cleanly (`Added last year · Last updated 4 days
  ago`), one is adjacent (`keyboard-shortcuts`: `3 weeks ago` / `2 weeks ago`)
  and one is degenerate: `bounded-choice` reads *`Added last month · Last
  updated last month`*. Its two dates are ten days apart, so they will share a
  bucket from here on as the pair ages together — this does not resolve itself.

  Two things the instance settles. The marking is not the error: `bounded-choice`
  was minted by *Split Combobox* and revised by *Split Form* ten days later, two
  plans over different territories, so the within-episode rule correctly does
  not exclude it. And suppression is cheap if wanted — the shipped HTML carries
  absolute dates, which are never equal, so the duplicate exists only after the
  client upgrade, where both phrases are already in hand. Whether a repeated
  phrase is worse than a badge that vanishes on hydration is the open part.
- *Whether this eventually belongs in the foundation.* Deliberately deferred.
  Figures covers interfaces built with the components and patterns, not the
  documentation layer, so age-as-a-figure has no home there today. If the shape
  recurs, that is the evidence to reopen it on.
