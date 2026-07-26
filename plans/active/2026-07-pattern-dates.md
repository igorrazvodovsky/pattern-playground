---
title: "Pattern dates"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-25"
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
| `b587873c` Update links | — | 72 |
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
in step 2.

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

*Missing:*

- The two schema fields.
- The backfill script.
- The render.

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

`apps/patterns/src/components/PatternDates.astro`, following the
`Consequences.astro` shape — takes `entry`, renders nothing of its own layout:

```astro
<span class="badge"><time datetime={iso(added)}>Added {fmt(added)}</time></span>
{updated && <span class="badge"><time datetime={iso(updated)}>Updated {fmt(updated)}</time></span>}
```

Invoked inside the `.meta` div in `PatternArticle.astro`, above the `<h1>`.
`<time datetime>` carries the machine-readable value; the visible text is
formatted for reading.

*Formatting caveat.* Unquoted YAML dates parse as UTC midnight. Derive the
displayed string from `toISOString().slice(0, 10)` and format from those parts,
not from `toLocaleDateString()` on the raw Date — a viewer at a negative UTC
offset would otherwise see the previous day.

Because `PatternArticle.astro` is shared by the full page and the pane partial
(`pages/patterns/[slug]/pane.astro`), the dates appear in both with no extra
work. The pane contract is safe: `lib/pane-content.ts:16-18` selects with
`doc.querySelector('article')` and `article.querySelector('h1')` — both
tag-based, nothing positional — so inserting spans above the `<h1>` inside
`.meta` cannot break the fetch.

### 4. Verification

- `npm run build` in `apps/patterns` — schema accepts all 118 files.
- `scripts/extract-graph-data.ts` still emits its usual node/edge counts
  (110 nodes / 618 edges as of the typed-relationships work).
- Spot-check a pane render and a full-page render.

## Open questions

- *Date format.* `Added 17 Oct 2025` vs `Added 2025-10-17` vs relative
  (`Added 9 months ago`). Relative reads well for `updated` and badly for
  `added`; mixing the two formats in adjacent badges may look accidental.
- *Does `updated` want a sibling index?* Once the field exists, a
  "recently updated" listing becomes cheap. Out of scope here; noted so the
  field is not designed in a way that blocks it.
- *Backdating `updated`.* The backfill deliberately leaves it empty. An
  alternative is a one-time pass where the author hand-marks the dozen or so
  patterns whose arguments genuinely moved recently. Worth doing only if the
  empty state looks wrong in practice.
