---
title: Epistemic status — encoding confidence as a notational dimension
status: completed
kind: exec-spec
created: 2026-07-27
last_reviewed: 2026-07-27
area: content schema, graph extraction, pattern site rendering
promoted_to: docs/specs/pattern-site.md §Epistemic status, docs/specs/graph-relationship-model.md §Epistemic stance, .claude/rules/pattern-content.md, apps/patterns/src/content.config.ts, scripts/check-seed-staleness.mjs
---

# Epistemic status

Encode how well-supported a page is as a first-class dimension of the notation,
readable at a glance, filterable by an agent, and unable to drift into a lie.

## Problem

The library cannot say "don't trust this yet" in the notation — only in prose.
Every page therefore asserts the same authority regardless of how well it is
supported, and stubs present with finished-page authority.
[`docs/language/vision.md`](../../docs/language/vision.md) names this as an
editorial problem. It is a notational one: confidence is a dimension of
meaningful variation in this domain, it is unencoded, and so the notation
misrepresents the corpus on the author's behalf.

Adding a *dimension* after a notation institutionalises is expensive; extending
*granularity within* an established dimension is cheap. This plan therefore
establishes the dimension now with the smallest defensible value set, rather
than designing the full ladder up front.

## Research checkpoint

Ran in the order [`plan-drafting.md`](../../docs/project/plan-drafting.md)
prescribes, though not deliberately. The strawman — a `status` ordinal — came
from the repo's own framing, sitting in the vision doc's `PatternMove` record as
`'seed' | 'observed' | 'settled' | 'deprecated'`. External input arrived after,
as stress-testing:

- *Zhang et al., "How Notations Evolve" (2026)* — §3.1.4 on dimensions of
  meaningful variation, §3.2.4 categorical extension within a channel, §3.2.5
  channel extension into unused ones, §3.3.9 re-encoding across media.
  Reference note pending.
- *Maggie Appleton, "Epistemic Disclosure"* — and her garden's working
  implementation: growth stage, planted date, last tended. Reference note pending.

The strawman did not survive intact, which is the checkpoint working. What
replaced it is below; what was rejected is recorded in *Deliberately not
adopted*.

## Design

Three mechanisms: one authored boolean, one authored set, one derived field.

### 1. `seed` — authored, boolean, absent by default

```yaml
seed: true
```

Means: this page exists to hold a thought; do not read it as a claim. Asserted
by hand, overrides everything else, drives the visual treatment on all three
surfaces.

One value rather than a scale because it is the only distinction the corpus
currently generates. Declaring rungs that nothing occupies is how `domain`,
`tags`, and the `component` role became dormant apparatus — see the
dormant-apparatus paragraph in
[`language/operative-image.md`](../../docs/language/operative-image.md).

### 2. `evidence` — authored, a set of backing kinds

```yaml
evidence: [observed, literature]
```

Or, where the backing is worth naming — mirroring the two-level authoring shape
`relationships:` already uses (bare slugs or `{to, note}` objects):

```yaml
evidence:
  - observed
  - { kind: literature, ref: rhetoric-of-hyperlink }
```

| Value | Means |
|---|---|
| `observed` | Instances seen in real products or practice |
| `literature` | A `references/` entry supports it; `ref` names which |
| `built` | Realised in the component substrate (cf. `realised_by`) |
| `used` | Applied in actual design work, not merely documented |

An absent or empty list is the honest state for most new pages, not an error.

`used` is the highest-value signal in a personal repertoire and the easiest to
forget to record — it is the only kind reporting survival of contact with a real
design problem.

Kinds rather than degrees because the states are not ordinal:
literature-backed-but-never-observed and observed-but-absent-from-the-literature
are both real, and no single rank places them sensibly.
[`pattern-definition.md`](../../docs/language/pattern-definition.md) already
frames backing this way — "repeated observations, specialist review, workshops,
field use, prototype construction" is a list of kinds. The set was written
before the ordinal was proposed.

The set extends without renumbering, which is the cheap kind of change.

### 3. Page completeness — derived, never authored

Computed by the extractor from which fields are populated. Not a frontmatter
field: hand-authoring it creates a value that rots the moment a section is added
and the marker is not bumped. *Deferred — see Phase 3.*

## Consumer contract

`seed` and `evidence` are *filterable*. This is a deliberate carve-out from the
epistemic stance in
[`graph-relationship-model.md`](../../docs/specs/graph-relationship-model.md),
which forbids any pipeline step matching, filtering, or routing on situations or
hints. That rule protects judgements about *design situations*. These fields are
claims about the *artifact's own support* — a different kind of object, and
exactly what a query layer should act on ("show me every move with no
evidence"). The spec must say this explicitly, or the existing stance reads as
forbidding it.

An optional prose disclosure line may accompany either field and is *never*
parsed. The structured data is for an agent; the prose is for a reader, and
carries what the data destroys — why confidence is low, and what would raise it.

## Decisions taken at implementation

Four calls the plan deferred or left inconsistent, settled before Phase 1.

*Role applicability* — `seed` is valid on every role; `evidence` is confined to
`role: pattern` and `role: collection`, enforced by a schema `superRefine` rather
than by authoring discipline. The cost showed up immediately in Phase 5: eighteen
pages have literature backing withheld, including the three the references index
names most explicitly (`prose` → rhetoric-of-hyperlink, `agency` and
`conversation-quality` → Collaboration through agency, Winograd & Flores). Held
anyway, on the plan's own reasoning; recorded in the vocabulary changelog so the
omission is visible if it starts reading as a lie.

*`built` is derived, and refused if authored* — the extractor entails it from
`realised_by`; the schema rejects `evidence: [built]` with a message pointing at
`realised_by`. The realisation claim keeps exactly one home, which is the
property that matters. `EpistemicStatus.astro` repeats the entailment because
the page renders from the content collection and the graph from
`pattern-graph.json` — the derivation is stated twice, the claim once.

*Two surfaces, not three* — the Phase 2 prose said three and the table listed
two. The table was right; the prose is corrected below. Search results and the
nav were considered as a third and dropped: the graph plus the page cover both
misplacement modes (navigating, and reading), and a third encoding is apparatus
before the second has been lived with.

*A `disclosure` field* — the plan kept prose disclosure as an optional
accompaniment without saying where it lives. It is now a frontmatter string,
rendered under the badges, never parsed.

*`literature` widened* — the plan defined it as "a `references/` entry supports
it". Under that reading `semantic-zoom`, which cites Perlin & Fox, Furnas,
Cockburn et al. and five more, would have read as unbacked, because those PDFs
are not filed in `references/`. The kind now means "published sources support
it", with `ref` naming the backing entry where one happens to live in
`references/`. Four refs resolve today; forty-five pages carry bare `literature`.
The stricter reading would have marked four pages in total and left the rest with
an empty list — which, per this plan's own risk section, reads as *absence of
backing was checked*.

## Phases

### Phase 1 — Schema and authoring surface

- Add `seed` (optional boolean) and `evidence` (optional array of string or
  `{kind, ref?}`) to the pattern content collection schema. *Verify the config
  path — Astro 4 uses `src/content/config.ts`, Astro 5 `src/content.config.ts`.*
- Enforce the role applicability decision in the schema.
- Validate `evidence[].kind` against the closed set, and `ref` against filenames
  in `references/`, in the same pass as
  `apps/patterns/integrations/validate-cross-references.ts` — so a dangling
  `ref` fails the build exactly as a dangling `<ComponentRef>` does.

*Done when*: a page can declare both fields; an invalid kind or unresolvable
`ref` fails the site build.

*Landed.* `content.config.ts` carries `seed`, `evidence` and `disclosure`, with a
`superRefine` covering role applicability, the closed kind set, the authored-`built`
refusal, and `ref`-outside-`literature`. `validate-cross-references.ts` gains a
fourth seam resolving `evidence[].ref` against `references/`, case- and
separator-insensitively (so `ref: design-patterns` finds `Design patterns.md`),
with the same Levenshtein suggestion the other seams give. Verified: each of the
four schema refusals and the dangling `ref` fails a build, at the right line.

### Phase 2 — Extraction and rendering

- `scripts/extract-graph-data.ts` emits `seed` and `evidence` as node metadata,
  alongside `realisedBy` and the situation construct.
- Render on two surfaces. The same dimension re-encodes per medium; the graph
  alone is insufficient, because misplaced trust happens while *reading a page*,
  not while navigating.

  | Surface | Encoding |
  |---|---|
  | Pattern page | Labelled badge near the title, plus optional prose disclosure |
  | Graph | Dashed node outline |

- Channel choice is border style. Not colour — taken by role/category, and
  amending a saturated channel is where inconsistencies surface. Not size — size
  reads as *importance*, and a well-evidenced move is not a bigger one; that
  metaphor mismatch is the same failure as a force-directed layout implying
  centrality where it means connectedness.

*Done when*: a seed page is distinguishable from a claimed page on both
surfaces without reading its prose, and `evidence` is present in
`pattern-graph.json`.

*Landed.* `EpistemicStatus.astro` renders a dashed `Seed` badge and one
badge per evidence kind under the title, plus the `disclosure` line; the badge
row carries `data-pagefind-ignore` for the reason `PatternDates` does. In the
graph a seed node is drawn with a dashed stroke (`[data-seed]` in
`pattern-graph.css`) and its accessible name gains `, seed`. Both encodings are
border style, per the channel argument above.

*Known gap*: the extractor drops nodes with no edges, so a wholly unconnected
seed never reaches the graph. Pre-existing behaviour, not introduced here; the
page surface still carries the mark. Recorded in the graph spec.

### Phase 3 — Derived completeness (deferred)

Blocked on the move-record fields (`problem`, `forces`, `consequences`) landing.
Until they exist, a completeness metric measures whether someone filled in the
fields that already exist — a proxy for effort, not for articulation. Revisit
then; it should never become authored.

### Phase 4 — Enforcement

- *Seed staleness lint*: warn on any `seed: true` page not meaningfully modified
  in 18 months. A page that has been a seed that long is either not a seed or
  should not exist.
- *Once Phase 3 lands*: warn where derived completeness is high and `evidence` is
  empty. A well-written page with nothing behind it is the subtle version of the
  problem this plan exists to fix.

*Done when*: `npm run test` surfaces stale seeds. The lint warns; it does not
fail the build.

*Landed (staleness lint only).* `scripts/check-seed-staleness.mjs` runs first in
`npm run test` — first rather than after `eslint`, because the repo carries
pre-existing lint errors and `&&` would have meant the seed check never ran. It
reads last-touched from `git log -1` per file, falling back to frontmatter
`updated ?? added` outside a checkout, and always exits 0.

"Meaningfully modified" is read as *any* commit touching the file. The sharper
measure the *deliberately not adopted* section describes — last change to the
evidence-bearing fields specifically, versus any commit — is deferred with Phase
3, and named as such in the script's header. The second bullet (high completeness
with empty evidence) is blocked on Phase 3 by construction.

### Phase 5 — Backfill

This phase delivers the value; everything before it is apparatus.

- Mark existing stubs `seed: true`.
- Populate `evidence: [literature]` where a `references/` entry already backs a
  page — [`docs/research/references.md`](../../docs/research/references.md) is
  the source.
- `built` where `realised_by` is present. Prefer *deriving* this over authoring
  it: if `realised_by` is populated, `built` is entailed, and deriving removes a
  field that can disagree with itself. Decide during Phase 1.

*Done when*: no page in the corpus is silently a stub.

*Landed.* 55 files changed. Seven pages marked `seed: true` — `a11y`,
`ai-tuning`, `block-based-editor`, `command-menu`, `generated-content`,
`living-document`, `prompt`; each has body sections that are literally `...` or
`TODO`, or an argument that never arrives. Nine carry `observed` on the strength
of named instances in their own prose. Forty-five carry `literature`, four of
them with a resolving `ref`. Fourteen have `built` entailed from `realised_by`.

`command-menu` and `block-based-editor` are seeds that also carry `built` — the
component exists, the page has not been written. That combination is not a
contradiction; it is the corpus telling the truth for the first time.

*Not done, and cannot be from the files*: `used` is populated nowhere. It is the
only kind that reports survival of contact with a real design problem, and no
signal in the repository distinguishes a move applied in design work from one
merely written up. It needs one pass by the author. The plan already names it as
"the highest-value signal in a personal repertoire and the easiest to forget to
record" — this is that, immediately.

The judgement pass covered all 118 pages against a written rubric (a page is a
seed when the body does not make the argument; not when it is merely short, or
carries a `## To-do`, or follows the conversation family's compact template).
The conversation family — `abort`, `closing`, `inquiry-agent`, `inquiry-user`,
`open-request`, `sequence-completion`, `user-opening`, `agent-opening`,
`user-repair`, `extended-telling` — was the main borderline case and was judged
*not* seed: the pages are thin but state their move completely.

## Deliberately not adopted

Recorded per [`plan-drafting.md`](../../docs/project/plan-drafting.md) §3 — these
are choices, not oversights.

- *A maturity ladder* (`seed | observed | settled | deprecated`, the vision doc's
  strawman). `settled` is unreachable in practice: material rests at "worked out"
  and stays. A value most of the corpus holds permanently carries no signal — the
  absorbing state belongs as the *absence* of a mark, not a value. With `settled`
  gone the ladder has two live rungs, and those measure different things
  (is the recurrence real / is the move articulated), which come apart in both
  directions. An ordinal projects both onto one line, which is the complaint this
  project makes about trees.
- *`deprecated`, and a `superseded-by` edge.* Superseded material is reshaped in
  place with a redirect. Currency is not a dimension here.
- *Appleton's `seedling / budding / evergreen`.* Tempting — the garden metaphor
  is already in [`core-beliefs.md`](../../docs/project/core-beliefs.md), and the vocabulary
  arrives with it. Rejected because the gardening ordinal measures *cultivation*,
  not *validation*: a page can be thoroughly evergreen — stable, well-tended,
  untouched for two years because it reads fine — and still be an untested
  hypothesis. For a notes garden that is exactly right; a design pattern carries a
  heavier burden, and these names would let effort read as evidence. That is the
  original failure mode in better clothes.
- *Appleton's three-field split*, however, is adopted: an ordinal-ish marker plus
  separate fields, rather than one value carrying everything.
- *"Last tended" as an authored date.* Her solution to decay, and the right
  instinct — attention, not bytes. Rejected as an authored field because it rots
  like any other. The equivalent here is derived: last change to the
  evidence-bearing fields specifically, versus any commit. Folded into Phase 4.
- *Gwern-style numeric certainty ratings.* False precision for a personal
  repertoire; nothing here is calibrated well enough to earn a number.
- *Alexander-style prose-only disclosure* ("epistemic status: total conjecture").
  Kept as an *optional accompaniment*, not the mechanism — an agent can filter a
  structured field and can do nothing with "more crackpottish than usual." Both
  channels, different jobs.
- *The full HCI validation ladder* from
  [`pattern-definition.md`](../../docs/language/pattern-definition.md) — specialist
  review, workshops, field use. Half is unreachable for a single-author
  repertoire, and unreachable rungs are how dead apparatus accumulates.

## Documentation to update

- [`specs/pattern-site.md`](../../docs/specs/pattern-site.md) — content schema
- [`specs/graph-relationship-model.md`](../../docs/specs/graph-relationship-model.md)
  — node metadata; the filterability carve-out
- [`language/vision.md`](../../docs/language/vision.md) — the `PatternMove`
  record's `status` field is superseded by this design; note that
  `settled`/`deprecated` were dropped and why
- [`language/operative-image.md`](../../docs/language/operative-image.md) — once
  Phase 2 ships
- [`language/relationship-vocabulary.md`](../../docs/language/relationship-vocabulary.md)
  — changelog entry only. These are node facets, not edges; the vocabulary
  records the decision without gaining a relation type.

## Risks

- *Another dormant facet.* The corpus already carries declared-but-unpopulated
  apparatus. Mitigation: Phase 5 is not optional, and the staleness lint keeps
  pressure on the field. Skipping Phase 5 means the plan produced nothing.
- *`evidence` becomes decorative.* A list nobody appends to is worse than no
  list — it implies absence of backing was checked. Mitigation: keep the value
  set small enough to be worth reaching for; derive `built`.
- *`seed` as permanent hedge.* Marking everything a seed restores the original
  problem inverted: uniform low authority instead of uniform high. The staleness
  lint is the counterweight.
