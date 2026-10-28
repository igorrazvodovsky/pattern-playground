# Pattern site specification

The pattern site runs on Astro at `apps/patterns/`. It is the primary authoring
and navigation surface for the pattern language — patterns, qualities,
foundations, and collections. Components live in Storybook; patterns live here.

## Content collection schema

Patterns are defined in `apps/patterns/src/content.config.ts` using Astro
content collections with zod-validated frontmatter. The frontmatter template —
which fields to write into a file — is in the authoring rule,
[`.claude/rules/pattern-content.md`](../../.claude/rules/pattern-content.md);
what follows is what the fields mean.

Four fields are required: `title` (sentence case, short), `added` (the day the
entry joined the library), `updated` (the day the argument last moved; empty
until it does), and `role` — the kind of thing the entry is, defined in
[pattern-role-model.md](./pattern-role-model.md).

`role:component` is valid in the schema but rarely used — component language
entries are the exception, not the rule. Most components live only in Storybook.

Everything else is optional and mutually independent: the classification facets
(`activityLevel`, `scope`, `lifecycle`, `group`, `domain` — see below), `mediation` (how
many actors the move sits between), `description` (the graph node tooltip and
site meta), `tags`, the
epistemic fields below, the `relationships`, `realised_by`, `situation`, and
`decision-trees` constructs that feed the graph, and `acts_on`, the concept
reference ([patterns-and-concepts.md](../language/patterns-and-concepts.md)).

### Epistemic status

How well-supported an entry is, encoded rather than left to prose. Three
mechanisms, deliberately separate:

- `seed` (boolean, any role) — the page exists to hold a thought; do not read it
  as a claim. One value rather than a maturity ladder: it is the only
  distinction the corpus currently generates, and declaring rungs nothing
  occupies is how `domain`, `tags`, and the `component` role became dormant.
- `evidence` (array, `role: pattern` and `role: collection` only) — the *kinds*
  of backing, not a degree. Entries are a bare kind or `{kind}`, mirroring
  the two-level shape `relationships:` already uses.

  | Kind | Means |
  |---|---|
  | `observed` | Instances seen in real products or practice |
  | `literature` | Published sources support it; the sources are named in the page's prose |
  | `built` | Realised in the component substrate — *derived* from `realised_by`, never authored |
  | `used` | Applied in actual design work, not merely documented |

  Kinds rather than degrees because the states are not ordinal:
  literature-backed-but-never-observed and observed-but-absent-from-the-literature
  are both real, and no single rank places them sensibly. An absent or empty
  list is the expected state for a new page, not an error.
- `disclosure` (string) — the prose channel: why confidence is low, what would
  raise it. Never parsed. The structured fields are for an agent; this field
  holds the reasoning that the structured fields cannot express.

`evidence` is refused on `role: quality` and `role: foundation` by the schema: a
quality is a diagnostic lens and a foundation a frame, so "what backs this"
means something weaker there. `seed` carries no such restriction — any page can
be a placeholder. The schema also refuses an authored `built`. The `ref` field that once
named a `references/` entry was dropped on 2026-09-21 when the sources moved
to the vault; a `literature` entry names its sources in prose.

Both fields are *filterable* — see the carve-out in
[graph-relationship-model.md](./graph-relationship-model.md) §Epistemic stance.
Rendered as badges under the title (`EpistemicStatus.astro`), as a dashed
underline on a seed's title (`ArticleShell.astro`, the library's provisional-name
mark from `certainty.css`) and as a dashed node outline in the graph. Border
style is the channel; colour is taken by role and category, and size would read
as importance, which a well-evidenced move is not. The title mark is the one
that reaches a reader who reads only the title and the two bold paragraphs; it
derives from `seed` alone, since `disclosure` is prose for a reader who reads
on, and no rung between seed and established is declared.

Origin: [2026-07-epistemic-disclosure.md](../../plans/completed/2026-07-epistemic-disclosure.md).

## File layout

The content directory is _flat_: every entry lives directly under
`apps/patterns/src/content/patterns/`, with no classification subfolders.

```
apps/patterns/src/content/patterns/
├── undo.mdx
├── constrained-selection.mdx
├── notification.mdx
├── conversation.mdx              # the activity pattern
├── conversation-quality.mdx      # the quality of the same name
└── …
```

The filename stem _is_ the entry's identity: its slug, its route
(`/patterns/<stem>`), its graph node ID, and the target of inter-page links —
all the same string. The collection loader's `generateId`
(`content.config.ts`) makes the stem authoritative independent of on-disk
location, so files could later be regrouped into folders for authoring
convenience without changing any slug.

Stems are globally unique. When a pattern and a quality/foundation share a name,
the pattern keeps the bare stem and the other takes a role suffix
(`conversation-quality.mdx`, `collaboration-foundation.mdx`).

A flat tree is deliberate, see "Classification facets" below and
[`docs/language/semilattice.md`](../language/semilattice.md).

## Inter-page link format

An entry's address is `/patterns/<stem>` and nothing else: one flat slug, no
Activity-Theory path segments, no Storybook URL format. Multi-segment routes and
Storybook-style pattern links surviving in the corpus are tech debt to be
cleaned up on edit. (Storybook URLs remain correct for links to _component_
pages, which still live in Storybook.)

The link syntax and the on-edit cleanup policy are in the authoring rule,
[`.claude/rules/pattern-content.md`](../../.claude/rules/pattern-content.md).
Every intra-site link is checked against the content stems at build time by
`validate-cross-references.ts`.

## Classification facets

An entry is classified by independent frontmatter _facets_, none of which is
privileged by the filesystem (the content directory is flat). Each facet is a
lens; navigation and the graph are _projections_ over them.

The sidebar reads `role` and the scale facets. Foundations and qualities get their own groups, and the authored sequences sit above the pattern list. The other facets project elsewhere — `activityLevel` colours the graph on the home page, `group` and `domain` reach the graph data through `scripts/extract-graph-data.ts`. The remaining `role:collection` entries are slated for dissolution (see [relationship-vocabulary.md](../language/relationship-vocabulary.md) §Retirement).

- `activityLevel` (`operation | action | activity`) — Activity Theory altitude:
  the altitude of the human activity the entry addresses. A
  _pattern-site-only_ classification.
- `scope` (`role: pattern` only) — a scale facet: how far in the interface the centre the pattern makes reaches, where it is shown or where its work and its rules apply. A value is one level (`scope: view`). Seeds take values like other patterns. The levels:
  - `element` — a single control or mark (field, button, cursor, badge).
  - `part` — a section of a view with its own job, which keeps its kind when
    moved to another view (inspector, toolbar, card, comment thread).
  - `view` — what one surface shows at once, arranged for one activity (editor,
    canvas, inbox, conversation).
  - `area` — a region of an application that follows its own rules (settings,
    an admin area, a project or workspace, one module of a suite).
  - `application` — an application or site whose structure, areas and the
    routes between them one maker designs (main navigation, application-wide
    search).
  - `ecosystem` — no single maker; it forms piecemeal from many applications,
    platforms and conventions (continuity across devices, share sheet, clipboard).

  A centre with no drawn surface still takes a level: where its work lands or
  where its rule applies. Where a centre is shown in one place and applies over
  a larger one, it takes the larger (a version-history panel is `view`). Where
  the forms a page describes reach several levels, the pattern takes the
  highest (searching, local or global, is `application`). A
  centre that is a structure takes the level of what contains it, while a centre
  between peers takes the level of the peers (a settings hub is `area`; a wizard
  between views is `view`). Patterns that are alternatives at one choice in a sequence
  make the same kind of centre, so none of them takes a level below the
  region the choice is made over; read the level from that region, not from the
  content an example navigates (the navigation topologies are each the movement
  rule of a region, so they take at least `area`, while a wizard, one sequence
  of views, stays `view`). The region sets a lowest level, not a shared one:
  an alternative whose forms reach higher keeps the higher level (overview and
  detail can sit on separate pages, so it is `area`, while the other ways of
  sharing the screen between overview and detail, chosen for each surface, are
  `view`). Pilot
  values and the research behind the ladder:
  [2026-10-pattern-facets.md](../../plans/active/2026-10-pattern-facets.md).
- `lifecycle` — a stage in the Seek–Use–Share family (e.g. `seeking`,
  `coordination`, `evaluation`). Free-form; not derived from `activityLevel`.
- `group` — a slash-delimited path recording a structural grouping verbatim
  (e.g. `conversation/sequence-management`); it makes no semantic claim. The
  navigation reads it only for the two families that nest in the sidebar
  (`navigation`, `conversation`); the graph data carries all of it. A
  transitional scaffold carried over from the pre-flatten folder tree, slated
  for retirement.
- `domain` — the domain corpus an entry belongs to (e.g. `data-visualization`).

## Stacked-notes navigation

Following a pattern or sequence link inside a pane does not replace the page — it pushes the target into a horizontal stack of panes, to the right of the pane the link sits in. Sidebar links still replace the stack.
As the stack grows wider than the viewport, panes collapse into thin vertical _spines_ on both rails: earlier panes tuck under the left edge as you scroll right, later panes stay pinned at the right edge until you scroll back to them.
No pane leaves the viewport entirely: every pane stays reachable as a spine on one rail or the other. State lives in the URL via `stackedNotes` query params — including a pane's section anchor (`slug#fragment`, percent-encoded) — so a stacked view is shareable and survives reload down to anchor positions. The section anchor is part of the pane's address. Pattern panes are encoded by bare slug, sequence panes by a `seq:` prefix (`stackedNotes=seq:<id>`) and concept panes by a `concept:` prefix, so the kinds cannot collide (a concept and a pattern often share a stem). Pane 0 is the page itself, so its anchor is the URL's own fragment; in-pane section links (the table of contents, footnotes) are routed through the stack so they record the anchor on their own pane rather than on that fragment. A pane's identity is its path (`/patterns/<slug>`, `/sequences/<id>` or `/concepts/<id>`); the helpers live in `apps/patterns/src/lib/pane-path.ts`.

A link to a page that is already open does not open a copy. It scrolls the stack to that pane, scrolls the pane to the link's anchor if it has one, and moves focus there; the panes to its right stay open, and the actor reaches them again by scrolling. If the page is open twice, the nearest pane to the left of the link wins, then the nearest to the right. Going to an open pane adds no history entry; when the link names an anchor, it rewrites the current entry's URL to record it.

Links inside panes whose page is already open are marked with `data-in-stack` (`left` or `right`, toward the open pane), which gives the link a subtle background tint. Each carries `aria-describedby` pointing at one shared "Already open" description. Hovering or focusing a marked link gives the pane it goes to the same tint, and the link preview is suppressed for it. Links to their own pane, table-of-contents links, and links inside demos are never marked.

In the single-pane layout (≤768px) nothing stacks, as on notes.andymatuschak.org on a phone: a link inside a pane is a plain navigation with its own history entry, Back walks the pages read, and no link is marked. A stacked URL opened at that width shows its last pane.

The _geometry_ is mostly CSS `position: sticky`. A
small rAF-throttled scroll handler in `StackManager.tsx` only reflects what is already painted onto two cosmetic state attributes which marks a note when it overlays another:

- `data-collapsed` — set while only a spine's worth of the pane is visible
  (pinned to a rail and clipped or covered). The spine label is revealed _only_
  then; an expanded pane shows no spine. (The spine is a `<button>`, so the
  components-layer button reset outranks any layered rule — its visibility rules
  therefore live outside `@layer`, where they beat every layer.)
- `data-overlapping` — set while the pane actually overlays its predecessor. The
  front-to-back depth shadow is cast _only_ then, never when panes merely sit
  side by side.

- Each pane sticks to a per-pane _left_ inset (its slot in the left rail) and a
  _negative right_ inset of roughly spine-width-minus-pane-width. The negative
  inset is what makes this work: it lets a pane flow normally and simply be _clipped_ at the
  viewport edge until only a spine's worth would remain, and only _then_ pins it
  as a right-rail spine. A _positive_ right inset — the obvious-looking choice —
  pins a pane the instant it overflows, which slides a still-mostly-visible pane
  on top of the previous one. The stack depends on that asymmetry
  (flow-then-pin, not pin-on-overflow).
- `z-index` increases with pane order, so later panes always lay over earlier
  ones — earlier panes tuck _under_ on the left, later panes sit _over_ on the
  right, giving the stack its consistent front-to-back order.
- One spine element per pane serves both rails: it is the pane's leading edge, so
  it reads as a left-rail spine when covered by the next pane and as a right-rail
  spine when only that leading edge remains visible.

The exact geometry is in `apps/patterns/src/styles/stack.css`; the overlap/collapse detection, scroll-into-view, and URL-sync logic live in `apps/patterns/src/components/StackManager.tsx` and
`apps/patterns/src/lib/stack-store.ts`.

A behavioural invariant to preserve: at the leftmost scroll position the first panes are fully visible and later panes are progressively clipped then spined — a partly-visible pane is _never_ overlapped by the next one.

## Situations

A pattern's two situations live in its frontmatter `situation:` block as
prose: `initiating` renders as the page's opening paragraph and `resulting`
as its connections passage, and the extractor emits them as node metadata
and derives each edge sentence from the sentence that links its target. The
earlier clause-list form of `resulting` (with `sets-up:` emitting `precedes`)
is honoured on pages not yet shaped and renders as a generated Consequences
section. On a shaped page the renderer adds visually hidden *Problem*,
*Solution* and *Connections* headings so the table of contents reaches
the unheaded parts. The folded index beneath the passage lists one line per
connection, grouped by type, with its note or edge sentence beside it. The page shape is in the authoring contract,
`.claude/rules/pattern-content.md` §Document structure; the construct in
[relationship-vocabulary.md](../language/relationship-vocabulary.md) §Situations.

## Sequences

The sequence collection — what a sequence is, the file format and field meanings, the authoring bar, rendering, and validation — has its own spec: [sequences.md](sequences.md). Two points that bind this spec: sequence files live beside the patterns collection in `apps/patterns/src/content/sequences/`
with the same filename-stem identity rule, and a sequence page is a pane-0 case that is not a pattern (§Stacked-notes navigation).

## Concepts

The concept catalogue — what a concept is against a pattern and a component, the entry shape, the `acts_on` reference and the world-side `concept` field — is in [patterns-and-concepts.md](../language/patterns-and-concepts.md). Concept files live in `apps/patterns/src/content/concepts/` with the same filename-stem identity rule, render at `/concepts/<id>` with an index at `/concepts`, and stack as panes like sequences. The concept pages are the site's second corner: `Base.astro` takes `corner="concepts"`, which swaps the sidebar for the catalogue's own (`Nav.tsx`), persisted under its own key so crossing corners replaces the island.

The catalogue is not published yet. While `CONCEPTS_PUBLISHED` in `apps/patterns/src/lib/concepts-published.ts` is false, a production build emits no concept pages, no sidebar link to them, no concept panes and no "Acts on" line on pattern pages, and `integrations/concepts-dev-only.ts` keeps the concept files out of the client bundle. Setting it to true publishes everything; the gate's plugin and checks can then be removed at leisure.

## Project languages

A project language is a list of design patterns chosen from the library for one project ([conceptual-glossary.md](../language/conceptual-glossary.md) §Project language). The entries so far are starters: one per typical artifact shape or medium (block-based editor, mobile web), and one per collaboration posture (conversation-first, delegated agent). Origin and open questions: [2026-10-project-languages.md](../../plans/active/2026-10-project-languages.md).

- *Files.* `apps/patterns/src/content/languages/<id>.mdx`, with the same filename-stem identity rule as the other collections. Frontmatter holds `title`, `added`, `updated`, `description` (one sentence about the artifact shape) `patterns`, the member slugs in order, largest first, and optionally `gaps`, the patterns the shape needs that the library does not have yet (a `name` and a one-sentence `note` each). The body is the lead: what the shape is, what holds across its patterns, and what the starter leaves out on purpose. It does not list the patterns.
- *Members.* `role: pattern` entries only. Foundations and qualities are shared by every language and are not members. The build fails on a slug that resolves to no pattern or to another role, and on a gap whose name is already a pattern's title, which then belongs in `patterns` (`integrations/validate-cross-references.ts`).
- *Page.* Served at `/languages/<id>`, with the pane partial at `/languages/<id>/pane/`, both rendered by `LanguageArticle.astro`. The page shows the lead, the patterns in the authored order with their descriptions, the gaps, and the sequences that invoke any of them (as a rule, a constituent or a choice's tree) in reading order. It stacks like a sequence, with a `lang:` prefix in `stackedNotes`.
- *Sidebar.* The first row of the Patterns branch names the active language and grouping and opens a menu that picks the language as well as the grouping: *All* (the default) or one language, then A–Z or a facet. Choosing a language narrows the pattern list, in every grouping, to its members; a family branch keeps its overview while any member remains. Nothing else in the sidebar narrows. The trigger names the language and any grouping other than A–Z, the choice persists in the nav store, and the menu links to the active language's page.

## Figures

A prescription figure is a drawing of the relations a pattern imposes,
placed with the instruction (see the authoring rule for placement). It is
the one illustration that holds for every realisation, so it shows no
interface: no screens, panels, buttons or toasts. A demo shows a realisation.
Decision trees stay in Mermaid through `<Diagram>`. Not every pattern needs a
figure; one that actors already know from use, such as a wizard, gets none.

### Files

Each figure lives in `apps/patterns/src/figures/<slug>/`:

- `<slug>.tldr`: the tldraw source, plain JSON.
- `<slug>.tldraw`: optional, a hand edit saved from the tldraw desktop app.
  When present it is the source, and the clean step regenerates the `.tldr`
  from it.
- `<slug>.svg`: what the page serves, written by the clean step.

`npx tsx scripts/clean-figure.ts <export.svg> <slug>` turns a tldraw SVG
export into the served file:

- Strokes and fills become `currentColor` or theme tokens, so the figure
  follows the colour mode. A pure white fill becomes the page background and
  hides what lies behind it. Grey highlight maps to a tint of the ink, yellow
  highlight to `--c-background-warning-strong`, green ink to
  `--c-body-success`, grey ink to a mix of ink and background. An unmapped
  colour fails the step, and so does a pattern fill.
- Joins are pointed. Horizontal and vertical lines take square ends;
  diagonals, curves, dashes and highlights take flat ends.
- Ids are prefixed with the slug, since the pane stack shows several pages
  at once.

`<Figure>` (`apps/patterns/src/components/Figure.astro`) inlines the SVG at
the column's width, hidden from assistive tech, with an optional caption.

### Drawing

- As few marks as the relation needs; a mark stays only if removing it loses
  part of the relation. No words in the drawing, one parameter at most.
- Only what holds for every realisation. A constraint some realisations have
  (a time limit, a fixed number of steps) stays out.
- One stroke weight, 3.5 units, drawn `solid` or `dashed`, never tldraw's
  `draw` style. A change of weight, dash or colour carries a meaning. The time
  line, with any ticks across it, is the one thinner line.
- Figures are drawn about 700 units wide. The SVG scales to the column, so
  strokes show at the same weight only when drawings share a width.
- As little height as the relation allows. Equal margins inside a sheet,
  equal gaps between rows and between objects.

## Toolchain posture

The site deliberately sits off two Astro defaults:

- *Unified processor, not the native Markdown pipeline.* Typed-edge authoring
  uses `{rel="…"}` annotations stripped at build time by the `remark-rel-strip`
  plugin, so `astro.config.ts` pins `markdown.processor` to
  `unified({ remarkPlugins: [remarkRelStrip] })` (MDX inherits it).
- *Monorepo-external imports.* Islands and demos import from
  `packages/components/` — outside the app root. This is off Astro/Vite's
  happy path: it is why the dev server needs the `optimizeDeps` pre-bundling
  arrangement in `astro.config.ts`, and it is the shape historically implicated
  in dev-loop staleness bugs (HMR invalidation, SSR module caching). When the
  dev loop misbehaves after an upgrade, suspect this seam first.

## Document structure

Section order, headings, component embeds, and writing style for pattern MDX are
the authoring rule's job — see
[`.claude/rules/pattern-content.md`](../../.claude/rules/pattern-content.md),
which auto-applies to `apps/patterns/src/content/`.
