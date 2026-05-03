# Relationship vocabulary for the pattern graph

A controlled vocabulary for typed edges in `src/pattern-graph.json`. Each entry defines a relationship that can hold between two patterns. The vocabulary is small by design — it should capture the structural distinctions that matter for navigation and reasoning, not every possible nuance.

Settled specification summary: [docs/specs/graph-relationship-model.md](../specs/graph-relationship-model.md).
This page is the detailed vocabulary record and changelog.

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

The vocabulary is written in the *Pattern Language register* of Christopher Alexander's work: patterns are moves, relationships describe how moves combine, and design proceeds through sequences of decisions each acting on what already exists. The library aspires toward the *Nature of Order register* — structural properties as recursive production rules — but is not there yet. See [design-theory.md](./design-theory.md) for the full trajectory and what progress toward it looks like.

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
- Inverse: none stored. "What instantiates B?" and "what does A instantiate?" are both answered by traversing `instantiates` edges in either direction at query time. This is not the inverse of `enables`.
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

### surveys

*U surveys A*: umbrella page U gathers A into an authored territory of related moves. The umbrella is not the authoritative source for A; it is a higher-altitude reading surface that frames how several moves relate.

- Directionality: directed (umbrella -> move or referenced constituent)
- Inverse: none formal.
- SKOS: no exact equivalent. It is closest to an authored associative or scoped relation.
- MDX source: internal Storybook links on pages tagged `role:umbrella`. Subheadings under `## Related patterns` are editorial groupings; per-link annotations become edge labels, falling back to the subheading text when no annotation exists.
- Example: Assisted task completion *surveys* Autocomplete, Autofill, AI completion, and Next-best action as a spectrum of system-assisted work.
- Why this matters: umbrella pages are authored surveys. `surveys` lets extraction preserve that editorial altitude without forcing umbrella pages through `precedes`, `related`, or `enacts` semantics.

### enacts

*A enacts Q*: pattern A is a move whose effect is legible in the Q dimension — applying A changes the structure in a way that shows up when you read the result through quality Q's lens. This is the bridge between patterns (as moves) and qualities. The relationship does not assert that Q is maximised or always increased; it asserts that Q is the right lens through which to read what this move does.

- Directionality: directed (pattern → quality only — qualities don't enact patterns)
- Inverse: none formal (the inverse "Q is enacted by A" is implicit in graph traversal)
- SKOS: no equivalent. This is the most domain-specific relationship in the vocabulary.
- MDX source: inline references from pattern pages to quality pages, and subcategory headers in qualities pages that group enacting patterns
- Example: Confirmation dialog *enacts* Agency — the pause-before-consequence is a move that strengthens the user's sense of intentional control.
- *Labelling*: a label should name what the move does to the centre such that the effect is legible through Q's lens — not restate the type ("X supports Q") or define the quality. "Creates a moment of intentional pause before acting" is a label; "supports agency" is not.
- Why this matters: under the generative-moves framing, the qualities act as a vocabulary for what a transformation should accomplish. An actor reasoning "what's weak in the current structure that I should strengthen?" needs to know which moves enhance which qualities. Promoting these from prose links to typed edges makes that reasoning possible.

## Edge axis

Each edge type carries an implicit *axis* — the dimension along which the relationship moves. The axis is derived from the type, not stored as a field.

| Axis | Edge types | What it means |
|---|---|---|
| Vertical | `instantiates`, `enables`, `enacts` | Crosses altitudes — taxonomic (genus/species), compositional (part/whole), or pattern → quality |
| Horizontal | `complements`, `tangential`, `alternative` | Same altitude — moves that share a structural role or co-deploy |
| Sequential | `precedes`, `follows`, `recommends` | Generative sequence — one move sets up another, or a tree branch routes to one |
| Territorial | `surveys` | Authored umbrella territory — a higher-altitude page gathers constituent moves |
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
| surveys | — | No exact equivalent (authored umbrella territory) |
| enacts | — | No equivalent (pattern → quality) |

The alignment is useful at two levels. First, it provides a sanity check — if a proposed relationship type has no SKOS equivalent *and* no clear justification for being domain-specific, it may be an unnecessary distinction. Second, if the graph data ever needs to interoperate with external tools or linked data systems, the SKOS mappings provide a bridge without requiring a full ontological commitment.

## Literature support and local extensions

The vocabulary is grounded in HCI pattern-language literature, but it is not a direct import of any one source vocabulary. Older HCI pattern-language work tends to use a smaller set of broad relationships — context/reference, contains/is-contained-by, is-a, association, alternatives, competitors, super-ordinate/sub-ordinate, neighbouring — and often leaves "related patterns" underspecified. This project decomposes those broad terms into distinctions that matter for graph reasoning in this corpus.

Strongly literature-supported mappings:

| This vocabulary | Literature precedent | Local interpretation |
|---|---|---|
| `enables` | aggregation, contains, sub-ordinate, lower-level patterns used to implement/refine a design | Compositional dependency: a mechanism, surface, or building block makes a move possible. |
| `instantiates` | specialization, is-a | Taxonomic application: a concrete move applies or specialises a broader principle, foundation, or pattern. |
| `precedes` | references to lower-level patterns used after the current one, sequence, generative traversal | Generative sequence: one move produces a condition on which another move can act. |
| `alternative` | alternatives for the same problem, competitor relationships | Same-purpose substitution with different trade-offs. Unlike some competitor accounts, this remains suggestion-grade rather than rule-grade exclusion. |
| `related` | generic related-pattern lists, association | Fallback for connections whose structural meaning is not yet clear enough to type more specifically. |

Partly supported but sharpened locally:

| This vocabulary | Literature precedent | Local interpretation |
|---|---|---|
| `complements` | association, co-occurrence in a larger context, same-size surrounding patterns | Stronger than generic relatedness: the moves are often useful together but neither depends on the other. |
| `follows` | inverse view of sequence/reference | Not stored as a separate edge. It is the reverse traversal of `precedes`. |

Project-specific extensions:

| This vocabulary | Why it exists here |
|---|---|
| `enacts` | HCI pattern literature discusses forces, values, consequences, and qualities, but does not usually model a typed pattern → quality edge. This project needs that bridge because qualities are the lenses through which a move's effect is read. `enacts` is therefore a local extension, not a literature-derived relationship name. |
| `recommends` | Pattern-oriented design literature supports context-oriented applicability and guided pattern selection, but the decision-tree extraction shape is local. `recommends` preserves authored decision-tree branches as situational hints rather than converting them into rule-grade conditions. |
| `surveys` | Umbrella pages are authored surveys over a territory of moves, not single-move sources. `surveys` preserves that editorial altitude and keeps umbrella pages from being flattened into generic `related` links. |
| `tangential` | Literature has generic association, neighbouring, and "related" language, but not a stable weak-adjacency type. `tangential` preserves the current author signal where pages explicitly distinguish conceptual adjacency from complementarity, dependency, or substitution. It is intentionally provisional: if future gardening shows it is only a weak form of `related`, or better handled by tags/projections, it can be merged or replaced through the changelog. |

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

`enacts` (pattern → quality), `recommends` (pattern → pattern, with situational hints), and `surveys` (umbrella → constituent) have no inverse — they are asymmetric and unidirectional.

## Edge schema

```typescript
interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;                                            // prose annotation — extracted from MDX `— ` text or authored manually
  extractedFrom?: string;                                    // provenance — header text, 'quality-target', or 'decision-tree:<id>'
  situationalHints?: Array<{ question: string; branch: string }>;  // only for 'recommends'
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
  | 'enacts'
  | 'surveys';

type DirectedEdgeType = 'precedes' | 'follows' | 'enables' | 'instantiates' | 'recommends' | 'enacts' | 'surveys';
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

*When to skip a profile*: minimal primitives (the move's definition exhausts the description), unbounded stances (no discrete move), and umbrella MDX (the page describes a territory, not a move) — see the Phase 0.B probe in the changelog for the reasoning.

## Open questions

1. *Generative profiles as authoring burden*: do the operates-on / produces / enacts fields pull their weight, or do they add an authoring step that won't survive contact with day-to-day pattern writing? The proof-of-concept population (5–10 patterns) is meant to test this before committing to retrofitting.

2. *Should `recommends` edges participate in the force-directed layout?* They represent situational suitability, not structural affinity. Including them adds navigational connections but may distort clustering. A reasonable default: treat them as a separate overlay rather than a layout input.

3. *Granularity of `related`*: thematic subcategories in MDX ("Core collaborative components", "Human-AI collaboration") carry meaning that `related` discards. The current direction is to promote them to lightweight tags (set memberships) rather than minting more edge types — but the tags should not be aggressively normalised, since the library isn't mature enough for a controlled tag vocabulary either.

4. *How much should the actor infer vs. read*: transitive enablement (Form → Combobox → Autocomplete → AI completion), co-grounding (patterns sharing a foundation), and alternative-conflict detection are all derivable from the graph. They could be computed on demand by query functions, or pre-computed and stored. The lighter approach is to compute on demand and let inference stay implicit.

5. *A `tensions-with` edge type between qualities?* Patterns can `enacts` multiple qualities, and a composition can pull in patterns whose enacted qualities are in tension (Agency vs. Speed, Consistency vs. Novelty). The graph currently has no way to express that tension. A quality → quality `tensions-with` edge would let a query surface "these moves enhance qualities the library has noted as in tension — worth a look" without crossing into rule-grade conflict detection. Defer until two or three concrete examples exist; introduce through the changelog rather than speculatively. Until then, `alternative` co-presence in a proposed composition is the available tension signal.

6. *A structural-property layer underneath qualities?* The use qualities are experiential dimensions, not structural properties — but there may eventually be a vocabulary for *structural* properties of interaction  that sits underneath them, in the same way that "the building feels welcoming" sits above "the entrance has levels of scale, strong centres, and thick boundaries."

## Structural invariants

Testable assertions derived from this vocabulary's own definitions. These can be checked against `pattern-graph.json` by a script or by an actor reviewing extraction output.

1. *Valid edge types*: every `type` value on an edge must be a member of `EdgeType` (precedes, follows, enables, instantiates, complements, tangential, alternative, recommends, related, enacts, surveys).
2. *`enacts` targets qualities*: every edge with `type: 'enacts'` must target a node whose ID starts with `qualities-`.
3. *`recommends` carries hints*: every edge with `type: 'recommends'` must have a non-empty `situationalHints` array and an `extractedFrom: 'decision-tree:<treeId>'` string.
4. *No redundant inverses*: if A `precedes` B exists, no separate B `follows` A edge should be stored. `follows` is inferred at query time, not stored as data.
5. *Hint-only fields are scoped*: `situationalHints` appears only on `recommends` edges.
6. *Symmetric edges are consistent*: for undirected types (complements, tangential, alternative, related), if A→B exists then B→A must also exist (or the graph component must treat them as bidirectional).
7. *`surveys` sources are umbrellas*: every edge with `type: 'surveys'` must have a source node with `role: 'umbrella'`.

## Changelog

A running record of why types were added, merged, renamed, or retired, what alternatives were considered, and what was lost in each decision. The vocabulary is provisional — it will keep evolving as the library grows. Making its construction visible is part of treating classification as a living artifact rather than a closed specification (compare Bowker & Star, *Sorting Things Out*: "the only good classification is a living classification").

Each entry: date, change, why, what was considered, what was lost.

### 2026-05-02 — `surveys` edges formalise umbrella territories

Internal Storybook links on `role:umbrella` pages now emit `surveys` edges. Subheadings inside `## Related patterns` become editorial groupings and labels rather than typed-edge headers, so an umbrella page reads as a territory map rather than a single-move dependency list.

Why: the role survey confirmed the umbrella distinction and named survey-shaped pages such as Assisted task completion, Bot, Cognitive forcing functions, Navigation overview, and Status feedback. Pages tagged `role:umbrella` now preserve their umbrella relationship to constituent moves when they link into the corpus.

What was considered: `gathers` and `frames`. `surveys` won because it names the authored, higher-altitude page without implying ownership, containment, or generated completeness.

What's lost: header names such as "Precursors" and "Follow-ups" no longer produce `precedes` edges on umbrella pages. The header remains as an edge label when no per-link annotation exists, preserving the editorial cut without pretending the umbrella is a single move in a generative sequence.

### 2026-05-02 — Role metadata lands on graph nodes

Storybook source pages now emit optional node-level `role` metadata in `src/pattern-graph.json`. Explicit `role:*` tags are authored in MDX or, for story-only docs pages, in CSF `meta.tags`. `src/stories/qualities/` and `src/stories/foundations/` infer `quality` and `foundation` roles from folder position.

Why: the library needs to distinguish implementation mechanisms, generative moves, umbrella surveys, qualities, and foundations without overloading `atomic:*`. Atomic tags remain compositional metadata; role tags describe how a page should be read.

What's lost: unmarked pages no longer signal "not yet classified." The extractor warns on future pages outside qualities/foundations that lack an explicit role.

### 2026-04-30 — "Projection" terminology retired in favour of "umbrella"

Bot, Assisted task completion, and Status feedback were previously called *projections*, borrowing Dorian Taylor's specificity gradient. The framing was a misfit: Dorian's projection runs data → generated document; here MDX is the authoring medium and the graph is the project's projection of MDX. Umbrella pages are *authored surveys at a higher altitude*, not generated views over canonical data.

What was considered: keeping "projection" with a clarifying note. Rejected because the term conflated two senses already in use — the semilattice/multiple-views sense and the umbrella-page sense. The 2026-05-02 `surveys` entry records the structural outcome.

### 2026-04-27 — Phase 3 lands: `recommends` edges from decision trees

Mermaid flowcharts in four decision trees (Deletion, Notification, Navigation overview, Form's "Choosing a control") extract into `recommends` edges. 19 edges total.

Four trees deferred: BarChart (list-shaped, not a flowchart), Overflow (leaves are CSS techniques), Form's "Choosing an input" (compound input families), Localization (descriptive layer assemblies). None of those leaves resolve cleanly to current pattern pages.

What's lost: dimensions the library reasons about — overflow handling, input families, localization layers — that the graph now declines to surface. If pages emerge for those leaves, the curated leaf map is the only place to update.

### 2026-04-26 — Manual labels live in MDX; label queue retired

Manual edge labels migrated from `pattern-graph.json` into source MDX as per-link `— ` annotations. The graph file carries no authored content; every label is freshly derived on each extraction run. MDX is the singular source of truth — editing a label is editing a pattern, reviewing a label change is reviewing an MDX diff.

`pattern-graph.label-queue.json` and the queue-building logic removed after reaching 95/98 coverage. Replaced by ad-hoc `jq` against `src/pattern-graph.json` when a specific check is wanted.

### 2026-04-26 — `gloss` field merged into `label`

`gloss` and `glossSource` removed. Edges carry a single optional `label`. The distinction (extracted-from-MDX vs authored-against-the-edge) didn't earn its keep at the consumer level and was confusing in plans and the merge script.

What's lost: the ability to programmatically distinguish author-written from tool-written labels. Easy to recover with a `labelSource` field if a future consumer needs it.

### 2026-04-25 — Initial vocabulary drafted

Ten types (`precedes`, `follows`, `enables`, `instantiates`, `complements`, `tangential`, `alternative`, `recommends`, `related`, `enacts`) and the generative-profile node-level metadata. Drafted from a sweep of existing `### ` subcategory headers in `## Related patterns` sections across 120 MDX files, plus the suggestion-not-matching and patterns-as-generative-moves framings from `plans/completed/2026-04-typed-edges.md`.

Considered and rejected:

- *Inverse pairs across the board* (e.g., `enables`/`enabled-by`, `instantiates`/`instantiated-by`). Rejected: only `precedes`/`follows` are genuine inverses (the same fact viewed from either side). For directed compositional or taxonomic relationships, reverse traversal is a query concern, not a data concern. Storing inverses doubles the edge count without adding information.
- *Merging `tangential` into `related`*. Rejected: 13 files explicitly use "Tangentially related" as a header, distinct from flat lists. The author signal is real and worth preserving even if SKOS doesn't grade associative strength.
- *A single `composes` relationship covering both `enables` and `instantiates`*. Rejected: compositional ("Button is a part Form uses") and taxonomic ("Autocomplete is a kind of Good defaults application") are different operations. Conflation would lose the genus/species vs. part/whole distinction.

### 2026-04-25 — Three thematic headers promoted to `enables`; direction semantics tightened

`Used by`, `Composed from`, and `Containers` on `actions-coordination-selection` promoted from `related` to `enables`. This surfaced a direction inconsistency: mechanical extraction was emitting page→listed for every building-block header — correct for `Used by` (the page is the building block) but inverted for everything else. Fixed: `Containers and primitives`, `Containers`, `Related primitives`, `Mechanisms`, `Components`, `Conversational primitives`, `Composed from` now invert to listed→page. Every `enables` edge now reads source = building block, target = composite.
