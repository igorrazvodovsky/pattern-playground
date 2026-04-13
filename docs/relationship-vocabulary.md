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
  label?: string;                                            // annotation from MDX
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

A generative profile lives in the MDX file, ideally as a small subsection near the top of the pattern page (after the fun meter and definition). It's extracted into `pattern-graph.json` as node-level metadata. Initially this can be populated for a small starting set of patterns (5–10) as a proof of concept rather than retrofitted across the whole library.

## Open questions

1. *Generative profiles as authoring burden*: do the operates-on / produces / enacts fields pull their weight, or do they add an authoring step that won't survive contact with day-to-day pattern writing? The proof-of-concept population (5–10 patterns) is meant to test this before committing to retrofitting.

2. *Should `recommends` edges participate in the force-directed layout?* They represent situational suitability, not structural affinity. Including them adds navigational connections but may distort clustering. A reasonable default: treat them as a separate overlay rather than a layout input.

3. *Granularity of `related`*: thematic subcategories in MDX ("Core collaborative components", "Human-AI collaboration") carry meaning that `related` discards. The current direction is to promote them to lightweight tags (set memberships) rather than minting more edge types — but the tags should not be aggressively normalised, since the library isn't mature enough for a controlled tag vocabulary either.

4. *How much should the actor infer vs. read*: transitive enablement (Form → Combobox → Autocomplete → AI completion), co-grounding (patterns sharing a foundation), and alternative-conflict detection are all derivable from the graph. They could be computed on demand by query functions, or pre-computed and stored. The lighter approach is to compute on demand and let inference stay implicit.

5. *A structural-property layer underneath qualities?* Dorian Taylor's information-theoretic reading of Alexander's 15 properties clusters them around three functions: *conveying* information, *compressing* information, and *throttling* information to facilitate uptake. Taylor and Alexander both note that other contexts may need their own sets of properties, distinct from the geometric 15. The library's qualities are experiential dimensions, not structural properties — but there may eventually be a vocabulary for *structural* properties of interaction (how information differentiates, flows, and compresses) that sits underneath them, in the same way that "the building feels welcoming" sits above "the entrance has levels of scale, strong centres, and thick boundaries." Not something to act on now, but a direction the framing might develop if the generative-moves framing proves load-bearing.

## Structural invariants

Testable assertions derived from this vocabulary's own definitions. These can be checked against `pattern-graph.json` by a script or by an actor reviewing extraction output.

1. *Valid edge types*: every `type` value on an edge must be a member of `EdgeType` (precedes, follows, enables, instantiates, complements, tangential, alternative, recommends, related, enacts).
2. *`enacts` targets qualities*: every edge with `type: 'enacts'` must target a node whose ID starts with `qualities-`.
3. *`recommends` carries hints*: every edge with `type: 'recommends'` must have a non-empty `situationalHints` array and a `sourceTree` string.
4. *No redundant inverses*: if A `precedes` B exists, no separate B `follows` A edge should be stored. `follows` is inferred at query time, not stored as data.
5. *Hint-only fields are scoped*: `situationalHints` and `sourceTree` fields appear only on `recommends` edges.
6. *Symmetric edges are consistent*: for undirected types (complements, tangential, alternative, related), if A→B exists then B→A must also exist (or the graph component must treat them as bidirectional).
