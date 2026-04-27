# Relationship vocabulary for the pattern graph

A controlled vocabulary for typed edges in `src/pattern-graph.json`. Each entry defines a relationship that can hold between two patterns. The vocabulary is small by design — it should capture the structural distinctions that matter for navigation and reasoning, not every possible nuance.

## Epistemic stance

Two framings shape how the vocabulary should be read and used:

1. *Suggestion, not matching.* Edges, tags, and decision-tree conditions are all *suggestion-grade* — they describe what has been useful in similar situations, not predicates to be matched against a query. An actor uses the graph as context for judgement, not as a lookup table.

2. *Patterns as generative moves.* Patterns are not catalogue items to be selected but transformations that produce *centres* (see §"Patterns as generative moves" below). Relationships describe how moves combine, not how options are picked. Design is sequential unfolding, not selection from a menu.

These framings are compatible and reinforcing. The first is an epistemic claim about the data (incomplete, fuzzy, hint-grade). The second is an ontological claim about the operation (design is transformation, not selection). Together they push in two directions: the data should be *looser* and the use should be *transformative*.

## Design principles

1. *Inverse pairs only where they hold*: `precedes` and `follows` are genuine inverses (the same fact viewed from either side). `enables` and `instantiates` are *not* inverses despite the surface similarity — they are distinct directed relationships (compositional vs. taxonomic). Reverse traversal of any directed relationship is handled by graph queries, not by storing inverse edges.
2. *SKOS alignment where natural*: relationships that have clear SKOS equivalents are mapped to them. This makes the vocabulary interoperable without requiring SKOS tooling. Where SKOS has no equivalent, custom predicates are defined.
3. *Directionality is semantic, not syntactic*: directed relationships express asymmetric meaning (A enables B does not mean B enables A). Undirected relationships are symmetric (A complements B = B complements A).

## Patterns as generative moves

The vocabulary is written in the *Pattern Language register* of Christopher Alexander's work: patterns are moves, relationships describe how moves combine, and design proceeds through sequences of decisions each acting on what already exists. The library aspires toward the *Nature of Order register* — structural properties as recursive production rules — but is not there yet. See `docs/design-theory.md` for the full trajectory and what progress toward it looks like.

Two consequences for how the vocabulary should be read now:

- *Edges are hints, not predicates.* The graph data is suggestion-grade. An actor uses an edge as "people have found this useful here" rather than as a rule to be matched.
- *Relationships describe how moves combine, not how options are selected.* `precedes` doesn't mean "users encounter A then B" — it means "applying A produces a centre on which B can subsequently act." `complements` doesn't mean "people use them together" — it means "these moves enhance compatible centres." `alternative` doesn't mean "competing options" — it means "different transformations of the same starting structure."

The relationships defined below should be read in this register throughout.

## Relationships

### precedes / follows

*A precedes B*: applying A produces a centre or condition on which B can subsequently act. The relationship is sequential — A sets up B — but the basis is generative, not merely temporal. A is a move whose result B then operates on.

- Directionality: directed
- Inverse: `follows`
- SKOS: no equivalent (SKOS has no temporal or generative-sequence dimension)
- MDX headers: "Precursors", "Precursor patterns" (listed on B's page, pointing to A) → edge A `precedes` B. "Follow-ups", "Follow-up patterns" (listed on A's page, pointing to B) → edge A `precedes` B.
- Example: Progressive disclosure *precedes* Filtering — applying progressive disclosure produces a narrowed visible set that filtering can then act on.
- Note: some chains form *generative sequences* in the strong Alexander sense (each step creates the conditions for the next). Localization's "linguistic, then cultural, then regional" ordering is an example. These are encoded as ordered chains of `precedes` edges; no separate edge type is needed.

### enables

*A enables B*: A provides a mechanism, surface, or building block that B depends on to function. The relationship is compositional — A is a lower-level construct that B incorporates or requires.

- Directionality: directed
- Inverse: none stored. "What does A enable?" and "what enables B?" are both answered by traversing `enables` edges in either direction at query time. There is no "used by" or "composed of" stored as data.
- Not the inverse of `instantiates`. `enables` is compositional (part/whole); `instantiates` is taxonomic (genus/species). They share a directional sense ("more specific to more general") but encode different relationships.
- SKOS: aligns with `skos:narrower` (from B's perspective, A is a narrower/more specific mechanism) and `skos:broader` (from A's perspective, B is a broader pattern that uses A). The fit is imperfect — SKOS broader/narrower is taxonomic, while enables is compositional. But the directionality is the same: the enabling pattern is more specific, the enabled pattern more general.
- MDX headers: "Containers and primitives", "Related primitives", "Mechanisms", "Components", "Conversational primitives" → edge A `enables` B (where A is the primitive/mechanism listed, B is the page).
- Example: Button *enables* Form — a form cannot function without actionable controls.

### instantiates

*A instantiates B*: A is a concrete application or specialisation of a more abstract principle, foundation, or pattern described by B. The relationship is taxonomic — A is a *kind of* B or A *applies* B.

- Directionality: directed
- Inverse: `enables` (when read from the abstract side — B enables A by providing the principle A applies)
- SKOS: aligns with `skos:broader` — A has broader concept B. This is the cleanest SKOS mapping in the vocabulary.
- MDX headers: "Foundation", "Applied in", "Implements this model" → edge A `instantiates` B (where B is the foundation/model, A is the page that applies it).
- Example: Autocomplete *instantiates* Good defaults — autocomplete is a specific mechanism that applies the principle of providing sensible defaults.

### complements

*A complements B*: A and B work well together and are frequently co-deployed, but neither depends on the other. The relationship is symmetric and non-hierarchical.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: aligns with `skos:related` — associative, non-hierarchical. SKOS does not distinguish complementary from tangential within `related`; this vocabulary does.
- MDX headers: "Complementary", "Complements", "Complementary patterns"
- Example: Filtering *complements* Sorting — both operate on the same collection and are frequently used together, but each functions independently.

### tangential

*A is tangential to B*: A and B share conceptual territory but address different concerns. The connection is worth noting for exploration but does not imply co-deployment or dependency.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: a weaker form of `skos:related`. No direct SKOS equivalent for this weaker degree — SKOS treats all associative links as equally weighted.
- MDX headers: "Tangentially related"
- Example: Localization is *tangential* to Notification — both deal with presenting information to users, but in unrelated dimensions (language adaptation vs. attention management).

### alternative

*A is an alternative to B*: A and B serve the same purpose or occupy the same structural role, but differ in approach, trade-offs, or context of use. Choosing A typically means not choosing B.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: aligns with `skos:closeMatch` (concepts with similar meaning, potentially interchangeable) or `skos:exactMatch` (concepts with identical meaning). In this vocabulary, `alternative` implies similarity of purpose but not identity — closer to `closeMatch`.
- MDX headers: "Alternatives"
- Example: Dialog is an *alternative* to Drawer — both provide a secondary surface for focused interaction, with different trade-offs around context preservation.

### recommends

*A recommends B*: A's decision tree identifies a situation in which B has previously been a useful move. This is the relationship encoded by Mermaid flowchart branches — it carries *situational hints* describing the kind of design situation in which the recommendation has come up.

- Directionality: directed
- Inverse: none (recommendations are asymmetric and non-reciprocal)
- SKOS: no equivalent. This is a situational, domain-specific relationship.
- MDX source: Mermaid flowchart leaf nodes within `## Decision tree` sections
- Situational hints: each recommendation carries the questions and branches that led to it, preserved as raw text rather than canonicalised. The library is not mature enough for a controlled vocabulary of conditions, and structured matching against situations would be brittle. The hints exist as context for an actor to consider — not as predicates to be matched.
- Example: Deletion *recommends* Undo, with the situational hints "Is the deletion reversible? → Yes" and "How quickly can it be recreated? → Seconds". An actor reads this as "when the situation looks like a fast-recoverable reversible deletion, Undo has been a useful move" and applies its own judgement about whether the current situation actually resembles that.
- Note: under the generative-moves framing, a recommendation is not "given context, choose this pattern" but "in situations of this shape, this transformation has been useful." The actor uses it as a lateral suggestion, not a lookup result.

### related

*A is related to B*: a catch-all for connections that exist but don't fit a more specific type. Used for prose cross-references, flat lists without subcategory headers, and thematic groupings where the nature of the relationship is contextual rather than structural.

- Directionality: undirected (default)
- Inverse: self-inverse
- SKOS: `skos:related`
- MDX source: flat "Related patterns" lists, inline prose links, custom thematic subcategories
- Note: this is the *default* type. When a more specific type applies, it should be used instead. Over time, `related` edges are candidates for reclassification as the vocabulary or MDX structure evolves.

### enacts

*A enacts Q*: pattern A is a move whose effect is legible in the Q dimension — applying A changes the structure in a way that shows up when you read the result through quality Q's lens. This is the bridge between patterns (as moves) and qualities. The relationship does not assert that Q is maximised or always increased; it asserts that Q is the right lens through which to read what this move does.

- Directionality: directed (pattern → quality only — qualities don't enact patterns)
- Inverse: none formal (the inverse "Q is enacted by A" is implicit in graph traversal)
- SKOS: no equivalent. This is the most domain-specific relationship in the vocabulary.
- MDX source: inline references from pattern pages to quality pages, and subcategory headers in qualities pages that group enacting patterns
- Example: Confirmation dialog *enacts* Agency — the pause-before-consequence is a move that strengthens the user's sense of intentional control.
- Why this matters: under the generative-moves framing, the qualities act as a vocabulary for what a transformation should accomplish. An actor reasoning "what's weak in the current structure that I should strengthen?" needs to know which moves enhance which qualities. Promoting these from prose links to typed edges makes that reasoning possible.

## Edge axis

Each edge type carries an implicit *axis* — the dimension along which the relationship moves. The axis is derived from the type, not stored as a field.

| Axis | Edge types | What it means |
|---|---|---|
| Vertical | `instantiates`, `enables`, `enacts` | Crosses altitudes — taxonomic (genus/species), compositional (part/whole), or pattern → quality |
| Horizontal | `complements`, `tangential`, `alternative` | Same altitude — moves that share a structural role or co-deploy |
| Sequential | `precedes`, `follows`, `recommends` | Generative sequence — one move sets up another, or a tree branch routes to one |
| Unspecified | `related` | Default catch-all; no axis claim |

The distinction matters for two consumers:

- A query API can expose `edgeAxis(type)` so a caller can ask "what's vertically related to Form?" (its foundations and primitives) separately from "what's horizontally related?" (its alternatives and complements). The axis is computed on demand, not stored.
- A gardening sweep can check axis against altitude. The category folders (`activities/`, `actions/`, `operations/`, `qualities/`) act as a coarse altitude proxy. An `instantiates` edge whose endpoints sit in the same folder is suspicious; a `complements` edge crossing two altitude bands is suspicious. Either is a finding for the changelog, not a failure.

The axis classification is a sanity-check tool, not a taxonomy commitment. A pattern can legitimately complement another at a different altitude; the point is to surface those cases for review rather than silently letting them pass.

## SKOS alignment summary

| Relationship | SKOS equivalent | Fit |
|---|---|---|
| precedes / follows | — | No equivalent (generative sequence) |
| enables | skos:narrower (imperfect) | Compositional, not taxonomic |
| instantiates | skos:broader | Good fit |
| complements | skos:related | Good fit |
| tangential | skos:related (weaker) | Partial — SKOS doesn't grade associative strength |
| alternative | skos:closeMatch | Reasonable fit |
| recommends | — | No equivalent (situational) |
| related | skos:related | Direct mapping |
| enacts | — | No equivalent (pattern → quality) |

The alignment is useful at two levels. First, it provides a sanity check — if a proposed relationship type has no SKOS equivalent *and* no clear justification for being domain-specific, it may be an unnecessary distinction. Second, if the graph data ever needs to interoperate with external tools or linked data systems, the SKOS mappings provide a bridge without requiring a full ontological commitment.

## Inverse pair enforcement

Only `precedes`/`follows` form a true inverse pair. The extraction script should treat these symmetrically:

| If the MDX says... | Extract as... | And infer the inverse... |
|---|---|---|
| B lists A under "Precursors" | A `precedes` B | B `follows` A |
| A lists B under "Follow-ups" | A `precedes` B | B `follows` A |

`enables` and `instantiates` are *not* inverses of each other, despite the surface similarity. They are distinct directed relationships:

- `enables` is compositional ("Button is a building block Form uses")
- `instantiates` is taxonomic ("Autocomplete is a specific application of Good defaults")

Each is extracted from its own set of MDX headers and stored once. Reverse traversal ("what enables Form?", "what instantiates Good defaults?") is handled by graph queries operating on the directed edges, not by storing inverse edges as data.

Symmetric relationships (`complements`, `tangential`, `alternative`, `related`) generate edges in both directions by definition — the extraction script should emit both A→B and B→A, or the graph component should treat them as bidirectional.

`enacts` (pattern → quality) and `recommends` (pattern → pattern, with situational hints) have no inverse — they are asymmetric and unidirectional.

## Edge schema

```typescript
interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;                                            // prose annotation — extracted from MDX `— ` text or authored manually
  extractedFrom?: string;                                    // provenance — header text, 'quality-target', or 'decision-tree:<id>'
  situationalHints?: Array<{ question: string; branch: string }>;  // only for 'recommends'
  sourceTree?: string;                                       // provenance for 'recommends'
}

type EdgeType =
  | 'precedes'
  | 'follows'
  | 'enables'
  | 'instantiates'
  | 'complements'
  | 'tangential'
  | 'alternative'
  | 'recommends'
  | 'related'
  | 'enacts';

type DirectedEdgeType = 'precedes' | 'follows' | 'enables' | 'instantiates' | 'recommends' | 'enacts';
type UndirectedEdgeType = 'complements' | 'tangential' | 'alternative' | 'related';

const inversePairs: Record<string, string> = {
  precedes: 'follows',
  follows: 'precedes',
};
// Note: enables/instantiates are NOT inverses of each other.
// They are distinct directed relationships (compositional vs. taxonomic).
// Reverse traversal is handled by graph queries, not by storing inverse edges.
```

The `situationalHints` field on `recommends` edges preserves the original decision-tree question phrasings rather than canonicalising them into a controlled vocabulary. This is deliberate — see the *recommends* section above for the rationale.

## Generative profiles (node-level metadata)

Beyond edges, each pattern can carry a *generative profile* — a small set of informal phrases describing what the pattern does as a move. This is the most direct way to make the Alexander framing operational: it gives an actor a vocabulary for reasoning about a move's applicability and effect, independently of the relationships it has with other patterns.

A generative profile has three fields:

- *Operates on*: what kind of existing structure or situation the move acts on. "A destructive action." "A partially-specified user intent." "A collection that needs narrowing."
- *Produces*: what new centre or affordance the move creates. "A moment of intentional pause before consequence." "An expanded view of a candidate completion." "A reorderable, filterable view of items."
- *Enacts*: which quality dimensions the move's effect is most legible in — the lenses through which you'd read what this move does to the structure. Informal references, not a controlled vocabulary. Named to match the `enacts` edge type: the field names the qualities through which the move's effect shows up, without asserting direction or magnitude.

These are *informal phrases*, not structured fields. No controlled vocabulary, no normalisation. The point is to give an actor a richer mental model of each pattern as a move, while staying close to how the MDX prose already talks about it.

A generative profile lives in a `*.profile.ts` sidecar next to the pattern's MDX (e.g. `Form.profile.ts` next to `Form.mdx`), exporting a typed `GenerativeProfile` object. The shared interface lives at `src/pattern-profile.ts`. The MDX imports the profile to keep authoring co-located, but does not render it — the data is for tooling, not for the rendered page. Phase 1 extraction reads sidecars directly into `pattern-graph.json` as node-level metadata. Initially this is populated for a small starting set of patterns (the nine from Phase 0.B) as a proof of concept rather than retrofitted across the whole library.

*When to skip a profile*: minimal primitives (the move's definition exhausts the description), unbounded stances (no discrete move), and umbrella/projection MDX (the page describes a territory, not a move) — see the Phase 0.B probe in the changelog for the reasoning.

## Open questions

1. *Generative profiles as authoring burden*: do the operates-on / produces / enacts fields pull their weight, or do they add an authoring step that won't survive contact with day-to-day pattern writing? The proof-of-concept population (5–10 patterns) is meant to test this before committing to retrofitting.

2. *Should `recommends` edges participate in the force-directed layout?* They represent situational suitability, not structural affinity. Including them adds navigational connections but may distort clustering. A reasonable default: treat them as a separate overlay rather than a layout input.

3. *Granularity of `related`*: thematic subcategories in MDX ("Core collaborative components", "Human-AI collaboration") carry meaning that `related` discards. The current direction is to promote them to lightweight tags (set memberships) rather than minting more edge types — but the tags should not be aggressively normalised, since the library isn't mature enough for a controlled tag vocabulary either.

4. *How much should the actor infer vs. read*: transitive enablement (Form → Combobox → Autocomplete → AI completion), co-grounding (patterns sharing a foundation), and alternative-conflict detection are all derivable from the graph. They could be computed on demand by query functions, or pre-computed and stored. The lighter approach is to compute on demand and let inference stay implicit.

5. *A `tensions-with` edge type between qualities?* Patterns can `enacts` multiple qualities, and a composition can pull in patterns whose enacted qualities are in tension (Agency vs. Speed, Consistency vs. Novelty). The graph currently has no way to express that tension. A quality → quality `tensions-with` edge would let a query surface "these moves enhance qualities the library has noted as in tension — worth a look" without crossing into rule-grade conflict detection. Defer until two or three concrete examples exist; introduce through the changelog rather than speculatively. Until then, `alternative` co-presence in a proposed composition is the available tension signal.

6. *MDX role: information origin vs. projection target.* The Phase 0.B adversarial probe surfaced that some MDX files (Bot, Assisted task completion, Status feedback) are not authoritative sources for a single pattern but rather *projections* — views that gather and organise information about a territory of related moves. Umbrellas serve sensemaking by making gaps visible; treating them as origins forces the framework into shapes (single profile, single edge endpoint) that don't fit. Compare Dorian Taylor's [specificity gradient](https://doriantaylor.com/the-specificity-gradient): authoring should happen at the most specific level, with less-specific levels being projections. The library currently treats every MDX file as an origin, which collapses this distinction. Acting on this would require a bigger restructuring than the typed-edges plan covers — distinguishing source-MDX from projection-MDX, and handling them differently in extraction, graph data, and rendering. Flagged for after Phase 4.

7. *A structural-property layer underneath qualities?* Dorian Taylor's information-theoretic reading of Alexander's 15 properties clusters them around three functions: *conveying* information, *compressing* information, and *throttling* information to facilitate uptake. Taylor and Alexander both note that other contexts may need their own sets of properties, distinct from the geometric 15. The library's qualities are experiential dimensions, not structural properties — but there may eventually be a vocabulary for *structural* properties of interaction (how information differentiates, flows, and compresses) that sits underneath them, in the same way that "the building feels welcoming" sits above "the entrance has levels of scale, strong centres, and thick boundaries." Not something to act on now, but a direction the framing might develop if the generative-moves framing proves load-bearing.

## Structural invariants

Testable assertions derived from this vocabulary's own definitions. These can be checked against `pattern-graph.json` by a script or by an actor reviewing extraction output.

1. *Valid edge types*: every `type` value on an edge must be a member of `EdgeType` (precedes, follows, enables, instantiates, complements, tangential, alternative, recommends, related, enacts).
2. *`enacts` targets qualities*: every edge with `type: 'enacts'` must target a node whose ID starts with `qualities-`.
3. *`recommends` carries hints*: every edge with `type: 'recommends'` must have a non-empty `situationalHints` array and a `sourceTree` string.
4. *No redundant inverses*: if A `precedes` B exists, no separate B `follows` A edge should be stored. `follows` is inferred at query time, not stored as data.
5. *Hint-only fields are scoped*: `situationalHints` and `sourceTree` fields appear only on `recommends` edges.
6. *Symmetric edges are consistent*: for undirected types (complements, tangential, alternative, related), if A→B exists then B→A must also exist (or the graph component must treat them as bidirectional).

## Changelog

A running record of why types were added, merged, renamed, or retired, what alternatives were considered, and what was lost in each decision. The vocabulary is provisional — it will keep evolving as the library grows. Making its construction visible is part of treating classification as a living artifact rather than a closed specification (compare Bowker & Star, *Sorting Things Out*: "the only good classification is a living classification").

Each entry: date, change, why, what was considered, what was lost.

### 2026-04-26 — Label queue retired

`pattern-graph.label-queue.json` and the queue-building logic in `scripts/extract-graph-data.ts` removed. The queue had served its purpose — driving the initial labelling sweep across `enacts`, axis-flagged, and thematic edges — and reached 95/98 coverage at close. Standing infrastructure for the remaining 3% (and for future drift) wasn't earning its keep against the broader review the vocabulary needs anyway.

What's lost: a generated coverage report flagging the three reasons that wanted manual labels. What replaces it: ad-hoc `jq` against `src/pattern-graph.json` when a specific check is wanted, plus the structural invariants listed in §"Structural invariants" of this doc as the manual-review checklist. The axis sanity check still runs and prints counts to the extraction log; only the per-edge queue entries are gone.

`scripts/write-labels.ts` is kept — it remains useful for batch label authoring against an arbitrary `{source, target, type, label}` JSON, independent of any queue.

The `thematicHeader` and `inverse` flags on the internal `TypedLink` type are kept; `thematicHeader` is no longer consumed downstream but the cost of leaving it is zero, and re-introducing the queue (or a different consumer of thematic provenance) would need it back.

Closed plans under `plans/2026/april/label-*.md` left as-is for history.

### 2026-04-26 — Enacts label sweep (six batches) and foundation-page restructure

All 98 `enacts` edges now carry a substantive label, up from 65 at the start of the sweep. Per-batch run logs live in [plans/2026/april/label-enacts.md](../plans/2026/april/label-enacts.md); the vocabulary-relevant residue is recorded here.

*Anti-pattern surfaced — labels that restate the type or the quality.* Recurring shape: "X enables/supports/is the capability for Q." These read as definitions of the quality or restatements of `enacts` rather than naming the mechanism by which the move alters the structure. The working rule that emerged: a label should name what the move *does* to the centre such that the effect is legible through Q's lens. Override candidates flagged across the batches included `cognitive-forcing-functions → agency/learnability/temporality`, `settings → privacy/adaptability`, `actions-sensemaking-view → malleability/density/adaptability`, `activities-localization → adaptability`, `activities-onboarding → learnability`, `activities-prompt → agency`, `operations-sections → adaptability`, `operations-good-defaults → agency`, `activities-bot/help → learnability`. Several rewritten in-pass; the rest stand as exemplars of the failure mode.

*Two extractor relaxations* (batch 2): hyphen accepted as label separator after `\)` (` - ` joins ` — ` and ` – `); `*` bullets accepted alongside `-` in the document-wide annotation pass. Both were silently dropping authored labels.

*MDX shape lessons.* Per-link annotations require single-link bullets; parent-bullet-with-sub-bullets and prose-with-link forms had to be restructured in many pages. Several relationships existed only in inline prose and needed an `### Enacted qualities` subsection added before they could carry a label. Two-link bullets (main link + `#anchor`) had to be split or folded.

*Foundation pages — drop generic related-pattern lists, keep `## Enacted qualities`.* Editorial pass on every foundation MDX. Generic `### Complementary` / `### Precursors` / `### Follow-ups` / `### Tangentially related` lists removed; substantive cross-foundation references collapsed into prose. Rationale: the complete list of patterns a foundation relates to is necessarily very long (that is what *foundation* means); listing some raises the question of why those and not others. `## Enacted qualities` is bounded by the qualities vocabulary, so it carries a specific claim. Exception: Modality kept `### Complementary` for its modality-gradient list (a structural claim, not a generic enumeration). Edge counts: related 416 → 392; complements 153 → 147; enacts 88 → 89; total 879 → 854.

One stale edge dropped out of extraction during the sweep: `activities-collaboration → qualities-conversation`. `qualities-conversation` is not a quality node; the edge was queue residue from earlier extraction state.

### 2026-04-25 — Initial vocabulary drafted

Ten types (`precedes`, `follows`, `enables`, `instantiates`, `complements`, `tangential`, `alternative`, `recommends`, `related`, `enacts`) and the generative-profile node-level metadata. Drafted from a sweep of existing `### ` subcategory headers in `## Related patterns` sections across 120 MDX files, plus the suggestion-not-matching and patterns-as-generative-moves framings from `plans/2026/april/typed-edges.md`.

Considered and rejected:

- *Inverse pairs across the board* (e.g., `enables`/`enabled-by`, `instantiates`/`instantiated-by`). Rejected: only `precedes`/`follows` are genuine inverses (the same fact viewed from either side). For directed compositional or taxonomic relationships, reverse traversal is a query concern, not a data concern. Storing inverses doubles the edge count without adding information.
- *Merging `tangential` into `related`*. Rejected: 13 files explicitly use "Tangentially related" as a header, distinct from flat lists. The author signal is real and worth preserving even if SKOS doesn't grade associative strength.
- *A single `composes` relationship covering both `enables` and `instantiates`*. Rejected: compositional ("Button is a part Form uses") and taxonomic ("Autocomplete is a kind of Good defaults application") are different operations. Conflation would lose the genus/species vs. part/whole distinction.

Lost in the drafting: thematic subcategories (~14 unique headers like "Human-AI collaboration") collapse to `related` with the header text retained as a label. Phase 1 promotes these to lightweight tags rather than minting more edge types — a partial recovery, not a full one.

### 2026-04-25 — `recommends` shape validated against the 8 active decision trees

Inventoried the questions and branches across all decision trees ([decision-dimensions.md](./decision-dimensions.md)). The `recommends` shape (raw question/branch text, `extractedFrom: 'decision-tree:<id>'`) holds: most decision-tree questions read naturally as situational hints an actor would weigh, vindicating the choice not to canonicalise them. No revisions. Drift observations (heterogeneity of hint kinds, hybrid leaves, design-state vs. situational questions) recorded in [the gate notes](../plans/2026/april/notes/typed-edges-phase-0-gates.md).

### 2026-04-25 — Generative profiles validated on 9 patterns

Drafted profiles (blind to *Related patterns*) for Form, Select, Checkbox, Autocomplete, Input, Undo, Notification, Toast, Conversation, Onboarding. The frame holds: the three slots produce non-vacuous, differentiating descriptions across data-entry primitives, after-the-fact feedback patterns, and activity-scale patterns. The frame strains on irreducibly minimal primitives (Checkbox), where `operates-on` and `produces` restate each other. No vocabulary revisions. Per-pattern resistance log in [the gate notes](../plans/2026/april/notes/typed-edges-phase-0-gates.md).

### 2026-04-25 — Profile storage: MDX subsection → sidecar TS

Profiles moved from a rendered `## Generative profile` MDX subsection to `*.profile.ts` sidecars imported but not rendered. *Why*: the rendered subsection conflated two audiences (human reader, tooling). Sidecar TS gives tooling a typed importable object; the MDX import keeps authoring co-located. *Considered*: YAML/JSON sidecar (loses type-checking), `export const` in MDX (mixes voices), MDX comment blocks (reads as dead code). *Lost*: framing is no longer visible to page readers — acceptable while the vocabulary is still being tested.

### 2026-04-26 — Manual labels live in MDX, graph is purely derived

Manual labels migrated out of `pattern-graph.json` and into the source MDX as per-link `— ` annotations. The graph file no longer carries any authored content; every label in it is freshly derived on each extraction run. This makes MDX the singular source of truth — editing a label is editing a pattern, reviewing a label change is reviewing an MDX diff, and regeneration is idempotent against the same MDX.

What changed:

- *Migration*: 48 manually authored labels (47 replacing existing extracted text, 1 appended fresh) written into the corresponding bullets via a new `scripts/write-labels.ts`. The previous `scripts/merge-labels.ts` (which wrote into the graph) is removed.
- *Extraction*: prior-graph label preservation removed. Extraction is now stateless against `pattern-graph.json` — it derives everything from MDX on every run.
- *Document-wide annotation pass*: extraction now picks up per-link `— ` annotations on bullet lines anywhere in a document, not only inside `## Related patterns`. A labelled bullet under a topical `### Related patterns` H3 inside a `## Foo` section overrides the header-text fallback that the same edge would otherwise carry from a bullet under `## Related patterns`. This lets editors place labelled links wherever they editorially fit.
- *MDX restructuring*: two pages (foundations-prose, foundations-modality) had multi-link bullets that couldn't carry per-link annotations. Split into one-link-per-bullet form, with the cluster name preserved as an intra-section heading rather than a shared annotation.

Round-trip verified: MDX → extract → graph reproduces the same 137 queue entries with 83 labelled, identical to the pre-migration state.

What this commits the project to:

- Re-types from axis-flagged review become MDX edits (relocate the link to a different `### ` header), not graph annotations. The two pending re-types (step-by-step → form, onboarding → empty-state) are now ordinary editorial tasks against those source pages.
- `enacts` edges that originate from inline prose references need an MDX bullet to carry a label. A `### Enacted qualities` subsection is a natural home; the document-wide pass also accepts labelled bullets elsewhere on the page.
- The label queue becomes a coverage report rather than a staging area. Entries with `hasLabel: true` mean the MDX already says enough; entries without are the work to do.

### 2026-04-26 — `gloss` field merged into `label`

`gloss` and `glossSource` removed from the Edge schema. Edges now carry a single optional `label` slot. Two fields were doing the same job — prose attached to an edge — with a distinction (extracted-from-MDX vs authored-against-the-edge) that didn't earn its keep at the consumer level. The split was confusing in plans, in the queue, and in the merge script; the simplification removes a layer of nomenclature without removing any data.

Migration: 47 edges had both `label` and `gloss` (gloss won, label was discarded); 1 had `gloss` only (became `label`); 239 had `label` only (unchanged). The 48 manually authored entries from the axis-flagged and thematic batches now sit in `label`.

Two consequential changes elsewhere:

- *Extraction now captures per-line annotations under thematic headers.* Previously the `label` on a thematic-`related` edge was the header text (e.g. `"Used by"`); the per-line `— ` annotation was discarded. Now extraction prefers the per-line annotation and falls back to the header text. This recovered ~35 extracted labels on thematic edges that previously needed manual authoring.
- *`scripts/merge-glosses.ts` → `scripts/merge-labels.ts`*. Same logic, writes into `label`. The queue file moves from `pattern-graph.gloss-queue.json` to `pattern-graph.label-queue.json`. Plans renamed `gloss-*.md` → `label-*.md`.

What's lost: the ability to programmatically distinguish "the source author wrote this" from "someone authored this against the edge." Easy to recover with a `labelSource` field if a future consumer needs it; not pre-emptively added.

### 2026-04-25 — Thematic edges glossed (45); two candidates held for future promotion

All 45 remaining thematic edges (after the `Used by` / `Composed from` / `Containers` promotion) now carry a manually authored `gloss`. The labels split across 14 single-source headers; each was treated as a page-specific editorial cut rather than a vocabulary signal.

Promotion-scan decision: hold `Transient-mode patterns` (3) and `Notification as modality gradient` (3), both from `foundations-modality`. They read taxonomically and could earn `instantiates` promotion, but n=1 source is too thin a basis to mint a type. Revisit when a second page reaches for similar headers.

Observations from the authoring pass:

- *foundations-prose* dominates the queue (20 of 45). The page is doing the work of articulating its own scope by clustering patterns into "manifest prose moves", "neighbouring foundations", and "prose-central activities". The clusters are page-specific but coherent — they could plausibly become a *prose annex* in the foundation rather than edge types.
- *activities-collaboration* (8 of 45) cuts the same set of patterns into editorial slices ("communication and awareness", "co-creation", "human-AI collaboration"). The slices are about *what role the linked pattern plays inside collaboration* — adjacent to a future `played-by-role` annotation if that ever earned its weight.
- *Foundations & use qualities* on `nextbest-action` mixes `enacts` candidates (the qualities targets) with `related` candidates (the foundations targets). The mixing inside one header confirms that the target-based `enacts` promotion (Phase 1) was the right place to disambiguate, not the header.
- Per-line annotations under thematic headers are currently lost (only the header text becomes the edge `label`). Captured as a follow-up: extract per-line `— ` annotations under thematic headers too, so the gloss layer doesn't have to re-author what the source MDX already states.

### 2026-04-25 — Axis-flagged edges resolved (1 confirm, 2 re-types proposed)

Outcomes for the three edges flagged by the Phase 1 axis sanity check (recorded under *Observed drift*):

- *step-by-step → wizard (`instantiates`)*: confirmed. Wizard is the canonical instantiation of step-by-step. Same-altitude `instantiates` is genuine — taxonomy doesn't require altitude difference. Drift signal: same-altitude `instantiates` should not auto-flag where the type is correct on its merits.
- *step-by-step → form (`instantiates`)*: re-type proposed → `enables`. Multi-step form *uses* step-by-step navigation; step-by-step is not a kind of form. The source MDX has the link under "Implements this model"; the right header would be a building-block one. Edit pending; current edge stands and the gloss carries the corrected reading.
- *onboarding → empty-state (`complements`)*: re-type proposed → `enables` with inverted direction (empty-state → onboarding). Empty-state is the canvas onboarding paints on; the relationship is compositional, not symmetric. Source MDX has the link under "Complementary"; restructuring pending.

Two re-types are recorded as glosses; the source MDX edits are deferred (small, isolated changes that can ride along with future edits to those pages). The first edge confirms that the axis sanity check's same-altitude `instantiates` heuristic is advisory: it surfaces edges worth a look, not edges that are necessarily wrong.

### 2026-04-25 — Three thematic headers promoted to `enables`; direction semantics tightened

Cluster scan of the Phase 1 gloss queue (56 thematic edges across 17 labels) showed three labels were promotion candidates rather than page-specific tags: `Used by` (6 edges), `Composed from` (2), `Containers` (3). All sit on a single source page (`actions-coordination-selection`), but they encode the same compositional relationship as the existing `Components` / `Mechanisms` / `Related primitives` / `Containers and primitives` / `Conversational primitives` headers — i.e. `enables`.

Adding them surfaced a direction inconsistency in the existing extraction. The vocabulary doc states `enables` runs from building block to composite ("Button is a building block Form uses" → Button enables Form). The mechanical extraction emitted page→listed for every header, which was correct for `Used by` (the page is the building block) but inverted for every other building-block header (the listed pattern is the building block). Fixed: `Containers and primitives`, `Containers`, `Related primitives`, `Mechanisms`, `Components`, `Conversational primitives`, `Composed from` now invert to listed→page; `Used by` stays page→listed. Result: every `enables` edge now reads source = building block, target = composite.

Other thematic labels were judged page-specific and stay as `related` with tags: `Patterns that manifest prose moves` (10), `Activities where prose is central` (5), `Neighbouring foundations` (5), `Assisted input` (4), `Adjacent to` (3), `Transient-mode patterns` (3), `Notification as modality gradient` (3), `Foundations & use qualities` (2), `Communication and awareness` (2), `Collaborative decision-making and co-creation` (2), `Human-AI collaboration` (2), `Lifecycle` (2), `Core collaborative components` (1), `Supporting patterns` (1). These are editorial cuts of a single page's concerns, not a controlled vocabulary trying to emerge.

Open follow-up: `Transient-mode patterns` and `Notification as modality gradient` (both from `foundations-modality`) read taxonomically — candidate `instantiates` promotion, but only n=1 source so deferred.

### 2026-04-25 — Phase 1 extraction landed

Typed-edge extraction implemented in [`scripts/extract-graph-data.ts`](../scripts/extract-graph-data.ts). The mechanical layer maps `### ` headers in `## Related patterns` sections to typed edges via the lookup table in [`plans/2026/april/typed-edges.md`](../plans/2026/april/typed-edges.md), promotes pattern → `qualities-*` edges to `enacts` regardless of where they appeared, and collects thematic-header text as lightweight `tags` on linked nodes. Comment-block links (`{/* ... */}`) are stripped before extraction. Glosses survive regeneration when `(source, target, type)` is unchanged. The qualitative gloss layer emits a queue at `pattern-graph.gloss-queue.json` for external authoring, merged back via [`scripts/merge-glosses.ts`](../scripts/merge-glosses.ts).

Distribution from the first run: 898 edges across 142 nodes, 49 of which carry tags. By type: `related` 460, `complements` 141, `enacts` 88, `precedes` 74, `follows` 58, `enables` 25, `tangential` 22, `alternative` 19, `instantiates` 11.

*Observed drift (axis sanity check)*:

- Same-altitude `instantiates` (2): `actions-navigation/step-by-step → actions-application/wizard`; `actions-navigation/step-by-step → actions-application/form`. Both are within the Actions band. Worth a gloss to confirm whether `instantiates` is the right relationship or whether `enables`/`complements` would read more truly.
- `complements` crossing two altitude bands (1): `activities/onboarding → operations/empty-state`. An activity-scale pattern listing an operation-scale move as complementary is suspicious; likely the relationship is closer to `enables` or a weak `related`.

These three edges entered the gloss queue under `axis-flagged`. No vocabulary revision; the flagged edges are findings, not failures.

### 2026-04-25 — Profile applicability scoped to three strain categories

Adversarial probe on Card, Bot, Mastery, Sections, Status feedback, Assisted task completion (chosen because they look hostile to the generative-profile frame), then reviewer reconciliation. Outcome: profiles should not be retrofitted across the whole library. Three categories where the frame strains for structural reasons and profiles should be skipped: *minimal primitives* (move definition exhausts description), *unbounded stances* (no discrete move), *umbrella/projection patterns* (page describes a territory, not a move; profiles belong on the constituent patterns). A separate zone — *frame holds but profile adds little* (Sections, Status feedback) — is tracked but not exempted. The earlier "pure structural containers" exemption was withdrawn after Card showed the apparent collapse was drafter-sensitive, not structural. Captured in the *When to skip a profile* note in the generative-profiles section above; full reconciliation in [the gate notes](../plans/2026/april/notes/typed-edges-phase-0-gates.md).
