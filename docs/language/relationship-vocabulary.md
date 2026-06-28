# Relationship vocabulary for the pattern graph

A controlled vocabulary for typed edges in `apps/patterns/src/data/pattern-graph.json`. Each entry defines a relationship that can hold between two patterns. The vocabulary is small by design — it should capture the structural distinctions that matter for navigation and reasoning, not every possible nuance.

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
- Inverse: `follows` (authoring alias — see alias table below)
- SKOS: no equivalent (SKOS has no temporal or generative-sequence dimension)
- Authoring: `rel="precedes"` on the earlier move's page, or `rel="follows"` on the later move's page. Both store as `A precedes B`. In frontmatter: `relationships: { precedes: [B] }` on A's page, or `follows: [A]` on B's page.
- Example: Progressive disclosure *precedes* Filtering — applying progressive disclosure produces a narrowed visible set that filtering can then act on.
- Note: some chains form *generative sequences* in the strong Alexander sense (each step creates the conditions for the next). Localization's "linguistic, then cultural, then regional" ordering is an example. These are encoded as ordered chains of `precedes` edges; no separate edge type is needed.

### enables

*A enables B*: A provides a mechanism, surface, or building block that B depends on to function. The relationship is compositional — A is a lower-level construct that B incorporates or requires.

- Directionality: directed
- Inverse: none stored. "What does A enable?" and "what enables B?" are both answered by traversing `enables` edges in either direction at query time. There is no "used by" or "composed of" stored as data.
- Not the inverse of `instantiates`. `enables` is compositional (part/whole); `instantiates` is taxonomic (genus/species). They share a directional sense ("more specific to more general") but encode different relationships.
- SKOS: aligns with `skos:narrower` (from B's perspective, A is a narrower/more specific mechanism) and `skos:broader` (from A's perspective, B is a broader pattern that uses A). The fit is imperfect — SKOS broader/narrower is taxonomic, while enables is compositional. But the directionality is the same: the enabling pattern is more specific, the enabled pattern more general.
- Authoring: `rel="enables"` on the part's page (A enables B), or `rel="composed-of"` on the whole's page (P is composed of target, stored as target enables P). In frontmatter: `relationships: { enables: [B] }` on A's page, or `composed-of: [A]` on B's page.
- This is the *component–integral* (part/whole) relation, and it holds at any altitude: a mechanism enables a move (Button → Form) *and* a constituent move enables the composite move that incorporates it (Bounded choice → Form). The endpoints' roles tell the two apart; no separate `composed-of` edge is stored.
- Example: Button *enables* Form — a form cannot function without actionable controls. Bounded choice *enables* Form — the form is composed of the constrained-field move.

### instantiates

*A instantiates B*: A is a concrete application or specialisation of a more abstract principle, foundation, or pattern described by B. The relationship is taxonomic — A is a *kind of* B or A *applies* B.

- Directionality: directed
- Inverse: none stored. "What instantiates B?" and "what does A instantiate?" are both answered by traversing `instantiates` edges in either direction at query time. This is not the inverse of `enables`.
- SKOS: aligns with `skos:broader` — A has broader concept B. This is the cleanest SKOS mapping in the vocabulary.
- Authoring: `rel="instantiates"` on the specialisation's page, or `rel="instances"`/`rel="variants"` on the genus's page. In frontmatter: `relationships: { instantiates: [B] }` on A's page.
- Example: Autocomplete *instantiates* Good defaults — autocomplete is a specific mechanism that applies the principle of providing sensible defaults.

### complements

*A complements B*: A and B work well together and are frequently co-deployed, but neither depends on the other. The relationship is symmetric and non-hierarchical.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: aligns with `skos:related` — associative, non-hierarchical. SKOS does not distinguish complementary from tangential within `related`; this vocabulary does.
- Authoring: `rel="complements"` on either page. In frontmatter: `relationships: { complements: [B] }` on either page (or both — deduped on extraction).
- Example: Filtering *complements* Sorting — both operate on the same collection and are frequently used together, but each functions independently.

### tangential

*A is tangential to B*: A and B share conceptual territory but address different concerns. The connection is worth noting for exploration but does not imply co-deployment or dependency.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: a weaker form of `skos:related`. No direct SKOS equivalent for this weaker degree — SKOS treats all associative links as equally weighted.
- Authoring: `rel="tangential"` on either page. In frontmatter: `relationships: { tangential: [B] }`.
- Example: Localization is *tangential* to Notification — both deal with presenting information to users, but in unrelated dimensions (language adaptation vs. attention management).

### alternative

*A is an alternative to B*: A and B serve the same purpose or occupy the same structural role, but differ in approach, trade-offs, or context of use. Choosing A typically means not choosing B.

- Directionality: undirected (symmetric)
- Inverse: self-inverse
- SKOS: aligns with `skos:closeMatch` (concepts with similar meaning, potentially interchangeable) or `skos:exactMatch` (concepts with identical meaning). In this vocabulary, `alternative` implies similarity of purpose but not identity — closer to `closeMatch`.
- Authoring: `rel="alternative"` on either page. In frontmatter: `relationships: { alternative: [B] }`.
- Example: Dialog is an *alternative* to Drawer — both provide a secondary surface for focused interaction, with different trade-offs around context preservation.

### recommends

*A recommends B*: A's decision tree identifies a situation in which B has previously been a useful move. This is the relationship encoded by Mermaid flowchart branches — it carries *situational hints* describing the kind of design situation in which the recommendation has come up.

- Directionality: directed
- Inverse: none (recommendations are asymmetric and non-reciprocal)
- SKOS: no equivalent. This is a situational, domain-specific relationship.
- Authoring: *not an authorable rel* — comes only from decision trees. Do not write `rel="recommends"` on inline links or in frontmatter.
- MDX source: Mermaid flowchart leaf nodes within `## Decision tree` sections
- Situational hints: each recommendation carries the questions and branches that led to it, preserved as raw text rather than canonicalised. The library is not mature enough for a controlled vocabulary of conditions, and structured matching against situations would be brittle. The hints exist as context for an actor to consider — not as predicates to be matched.
- Example: Deletion *recommends* Undo, with the situational hints "Is the deletion reversible? → Yes" and "How quickly can it be recreated? → Seconds". An actor reads this as "when the situation looks like a fast-recoverable reversible deletion, Undo has been a useful move" and applies its own judgement about whether the current situation actually resembles that.
- Note: under the generative-moves framing, a recommendation is not "given context, choose this pattern" but "in situations of this shape, this transformation has been useful." The actor uses it as a lateral suggestion, not a lookup result.

### related

*A is related to B*: a catch-all for connections that exist but don't fit a more specific type. Used for prose cross-references, flat lists without subcategory headers, and thematic groupings where the nature of the relationship is contextual rather than structural.

- Directionality: undirected (default)
- Inverse: self-inverse
- SKOS: `skos:related`
- Authoring: implicit fallback for an untyped `relationships:` frontmatter entry — list a slug without a `rel=` key: `relationships: { related: [B] }`. Untyped *inline links* are decorative and never produce edges.
- Note: this is the *default* type. When a more specific type applies, it should be used instead. Over time, `related` edges are candidates for reclassification as the vocabulary or MDX structure evolves.

### surveys

*C surveys A*: collection page C gathers member A for orientation. C is not the authoritative source for A; it lists what belongs to a grouping. This is the *member–collection* relation (Winston et al. 1987) — A is *filed under* C, not a part of it (`enables`) and not a kind of it (`instantiates`).

- Directionality: directed (collection -> member)
- Inverse: none formal.
- SKOS: `skos:member` — collection membership. SKOS `Collection`s group members *without* placing them in the broader/narrower hierarchy, which is exactly the semantics here: a collection never sits on an `enables`/`instantiates` path. (Earlier records said "no exact equivalent"; that was wrong.)
- Authoring: automatic for untyped body links on `role:collection` pages. Can also be declared explicitly with `relationships: { surveys: [B] }` on the collection page.
- Example: Navigation overview *surveys* the navigation models it gathers; Operations *surveys* its constituent operation patterns.
- Why this matters: collection pages are authored surveys. `surveys` preserves that membership altitude without forcing collection pages through `precedes`, `related`, or `enacts` semantics — and keeps member-collection grouping distinct from a composite *pattern*'s part-whole (`enables`) and genus-species (`instantiates`) relations.

### The three part-whole relations (and why they don't compose)

`surveys`, `enables`, and `instantiates` cover three distinct ways a "bigger" entry relates to "smaller" ones — the member-collection, component-integral, and genus-species relations of Winston et al.'s 1987 meronymy taxonomy:

| Relation | Edge | A whole/general… | Example |
|---|---|---|---|
| component–integral (part/whole) | `enables` | …is *made up of* its parts | Bounded choice `enables` Form |
| genus–species (kind) | `instantiates` | …is *specialised into* variants | Autocomplete `instantiates` Assisted task completion |
| member–collection (grouping) | `surveys` | …merely *gathers* members for browsing | Operations `surveys` its operation patterns |

These are different relations and are **not transitive across types**: do not traverse `surveys` → `enables` → `instantiates` as a single path. A composite *move* (Form) is a `pattern` that uses `enables`/`instantiates` to reach its constituents; only a `collection` page uses `surveys`. Misfiling a composite move as a collection (the retired `umbrella` conflation) collapsed component-integral parts into membership and broke this distinction.

### enacts

*A enacts Q*: pattern A is a move whose effect is legible in the Q dimension — applying A changes the structure in a way that shows up when you read the result through quality Q's lens. This is the bridge between patterns (as moves) and qualities. The relationship does not assert that Q is maximised or always increased; it asserts that Q is the right lens through which to read what this move does.

- Directionality: directed (pattern → quality only — qualities don't enact patterns)
- Inverse: none formal (the inverse "Q is enacted by A" is implicit in graph traversal)
- SKOS: no equivalent. This is the most domain-specific relationship in the vocabulary.
- Authoring: automatic for untyped body links from non-quality pages to quality pages. Can also be declared explicitly with `rel="enacts"` inline or `relationships: { enacts: [quality-slug] }` in frontmatter.
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
| Territorial | `surveys` | Collection membership — a `role:collection` page gathers its members |
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
| surveys | skos:member | Collection membership (member–collection) |
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
| `surveys` | Collection pages are authored surveys over a grouping of members, not single-move sources. `surveys` maps to `skos:member` and keeps collection pages from being flattened into generic `related` links — and keeps member-collection grouping distinct from the component-integral (`enables`) and genus-species (`instantiates`) relations a composite *pattern* uses. |
| `tangential` | Literature has generic association, neighbouring, and "related" language, but not a stable weak-adjacency type. `tangential` preserves the current author signal where pages explicitly distinguish conceptual adjacency from complementarity, dependency, or substitution. It is intentionally provisional: if future gardening shows it is only a weak form of `related`, or better handled by tags/projections, it can be merged or replaced through the changelog. |

## Authoring model

Edges come from three explicit sources plus three structural auto-typings:

### Explicit authoring channels

1. *Frontmatter `relationships:`* — declare typed edges for any pattern this page relates to:
   ```yaml
   relationships:
     precedes: [wizard, step-by-step]
     complements:
       - to: bounded-choice
         note: "the constrained-field move"
       - sections
     composed-of: [data-entry]
   ```
   Bare strings or `{to, note}` objects. The optional `note` becomes the edge label.

2. *Inline `rel=` on links* — for narrated edges in body prose:
   ```mdx
   …each field is [bounded choice](/patterns/bounded-choice){rel="composed-of"}…
   ```
   The `{rel="type"}` annotation is stripped by the `remark-rel-strip` plugin before rendering.

3. *`<PatternRef>` and `<ComponentRef>` component props*:
   ```mdx
   <PatternRef slug="wizard" rel="precedes">Wizard</PatternRef>
   ```

Untyped prose links are decorative — they never produce edges (invariant I1).

### Authoring aliases and direction normalization

Direction is fixed by the relation name (invariant I2), not an author field. Aliases let the author pick the word that fits their sentence:

| `rel=` on page P | Stored edge | Canonical type |
|---|---|---|
| `precedes` | P → target | precedes |
| `follows` | target → P | precedes |
| `enables` | P → target | enables |
| `composed-of` | target → P | enables |
| `instantiates` | P → target | instantiates |
| `instances` / `variants` | target → P | instantiates |
| `complements` | P ↔ target | complements |
| `tangential` | P ↔ target | tangential |
| `alternative` | P ↔ target | alternative |
| `enacts` | P → target (quality) | enacts |
| `surveys` | P (collection) → target | surveys |
| `related` | P ↔ target | related |

`recommends` is not in this table — it is never an authored rel.

### Structural auto-typings (invariant I7)

Three auto-typings apply without explicit authoring:

1. Untyped body links on `role:collection` pages → `surveys`
2. Untyped body links from non-quality pages to quality pages → `enacts`
3. Decision-tree leaf nodes → `recommends`

Only these three forms of auto-typing exist. Everything else requires an explicit `rel`.

### No redundant inverses

Inverse edges are *not* stored for directed types. "What does A enable?" and "what enables B?" are both answered by traversing `enables` edges in either direction at query time. `follows` is an authoring alias, not a stored edge type — if A `precedes` B is stored, no separate B `follows` A edge should exist.

Symmetric relationships (`complements`, `tangential`, `alternative`, `related`) may be declared on either page; the extractor deduplicates by `(source, target, type)` key.

A directed edge is a one-way *claim* (`A precedes B`) but a two-way *path*: the graph is traversed in both directions — an actor on B walks back to its precedents for context. So a directed edge carries an optional second note for the reverse reading. The forward author sets the outgoing `label` (`A` declares `precedes: {to: B, note}`); the target may add an incoming note by authoring the *inverse alias* (`B` declares `follows: {to: A, note}`, or `composed-of`/`instances` for enables/instantiates). This adds a note slot to the one edge — it does *not* create a second stored edge, so the no-redundant-inverses rule holds. The renderer shows the outgoing note when the edge is read forward and the incoming note when read in reverse, each falling back to the other when only one is authored. Author an incoming note only when the reverse reading needs different words; a single note serves both directions otherwise. (`enacts` needs none — quality pages render nothing, so there is no reverse reader.)

`enacts` (pattern → quality), `recommends` (pattern → pattern, with situational hints), and `surveys` (collection → member) have no inverse — they are asymmetric and unidirectional.

### When an edge resists typing, look for a mediator

If a direct edge between two patterns won't take a clean type — you find yourself stamping the same gloss onto `precedes` *and* `instantiates` *and* `complements`, or arguing each in turn — that is usually a signal that the relationship is *mediated*, not direct. The patterns connect through a third pattern, and the direct edge is compressing a two-hop path into one mistyped link.

The move is to decompose. Read the note: if it names several things ("the bot reveals capability, intent, and reasoning incrementally"), each clause is often a separate pattern that already sits between the two (here `onboarding`, `transparent-reasoning`). If those intermediate patterns exist and already link to both endpoints, drop the direct edge — the graph routes the relationship correctly without it. If the mediator is genuinely missing, that is a gap to author, not an edge to force a type onto. A pattern language draws the line through the named intermediate; so should the graph.

## Edge schema

```typescript
interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;                                            // outgoing prose annotation — shown when the edge is read forward (on the source page)
  incomingNote?: string;                                     // optional note authored from the target side (via follows/composed-of/instances) — shown when the edge is read in reverse (on the target page)
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

A generative profile lives in a `*.profile.ts` sidecar next to the pattern's MDX (e.g. `Form.profile.ts` next to `Form.mdx`), exporting a typed `GenerativeProfile` object. The shared interface lives at `apps/patterns/src/content/pattern-profile.ts`. The MDX imports the profile to keep authoring co-located, but does not render it — the data is for tooling, not for the rendered page. Phase 1 extraction reads sidecars directly into `pattern-graph.json` as node-level metadata. Initially this is populated for a small starting set of patterns (the nine from Phase 0.B) as a proof of concept rather than retrofitted across the whole library.

*When to skip a profile*: minimal primitives (the move's definition exhausts the description), unbounded stances (no discrete move), and collection MDX (the page describes a grouping of members, not a move) — see the Phase 0.B probe in the changelog for the reasoning. Composite-move pages (`role: pattern`, `atomic: composition`) *do* describe a move and should carry a profile.

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
7. *`surveys` sources are collections*: every edge with `type: 'surveys'` must have a source node with `role: 'collection'` (or the deprecated `role: 'umbrella'` alias).

## Changelog

A running record of why types were added, merged, renamed, or retired, what alternatives were considered, and what was lost in each decision. The vocabulary is provisional — it will keep evolving as the library grows. Making its construction visible is part of treating classification as a living artifact rather than a closed specification (compare Bowker & Star, *Sorting Things Out*: "the only good classification is a living classification").

Each entry: date, change, why, what was considered, what was lost.

### 2026-06-25 — Per-direction notes on directed edges (incoming note)

Extends the symmetric per-direction notes (2026-06-24) to directed edges. A directed edge now carries an optional `incomingNote` alongside its outgoing `label`: the forward author sets `label` (`A precedes B`), the target sets the incoming note via an inverse alias (`B follows A`). `extractGraphData`'s `addEdge` was changed from skip-on-duplicate to *merge* — it fills an empty note slot rather than dropping the second author's note — and inverse-alias notes route to `incomingNote`. The renderer shows the outgoing note read forward, the incoming note read in reverse, each falling back to the other.

Why: directionality is a claim about the relationship, not a constraint on movement. The graph is walked in both directions (an actor designing with it reads a pattern's precedents for context), so a note must serve whichever end the reader arrives from. A single note often reads correctly from only one end — e.g. `onboarding precedes mastery` stored "initial phase before the actor develops efficiency", which describes onboarding and reads as a non-sequitur on onboarding's own page.

Side effect (improvement): the merge recovered 8 pre-existing edges that were authored from both ends (a forward type plus an inverse alias) where the old skip silently dropped one note. All now render both glosses, each on its proper side.

What was considered: requiring the incoming note (rejected — most edges read fine both ways with one note; follow the "only when distinct" rule). What was lost: nothing.

### 2026-06-25 — Multi-type pair cleanup (contradictory re-typing + redundant `related` drop)

Migration to frontmatter often stamped one prose gloss onto two or three edge types between the same pair, leaving 65 pairs carrying more than one type. Resolved in two passes:

- Contradictory (15 pairs carrying a symmetric *and* a directed type, or two directed types): re-typed to one per pair by meaning. Examples: `data-view enables selection` (dropped the duplicate `precedes`); `wizard instantiates step-by-step` (the stored `step-by-step instantiates wizard` contradicted its own note — corrected via the `instances` alias, which inverts); `bot ↔ progressive-disclosure` dropped entirely as mediated (see the mediator guidance above — it routes through `onboarding` and `transparent-reasoning`). Two pairs kept both glosses as per-direction symmetric notes (`activity-log ↔ collaboration`, `command-menu ↔ collaboration`).
- Redundant `related` (38 pairs): the extractor dedup now drops `related` when a stronger type exists between the pair in *either* direction (was same-direction only). Stronger = any type except `recommends`, which is decision-tree routing rather than an association claim and so does not subsume `related`. Of the 38: 36 coexisted with an authored type; 2 were bare member-side links coexisting only with `surveys` collection membership (no notes lost). Where a dropped `related` carried a distinct gloss and the survivor was symmetric, the gloss was folded into that symmetric type as a per-direction note (11 pairs) rather than dropped; the rest were duplicates or directed-survivor glosses with no slot.

Result: 65 → 12 multi-type pairs, of which 10 are benign (`surveys`/`recommends` legitimately coexisting with an authored type). Two residual symmetric-vs-symmetric mismatches remain (`annotation ↔ link-preview`, `bounded-choice ↔ autocomplete`) — a milder category, not yet resolved.

Why: direction and type are claims (I2), so a pair asserting `precedes` and `complements` at once asserts two incompatible things. Side effect: dropping `learnability tangential localization` also closed one of the purist-stance quality leaks noted on 2026-06-23.

What was lost: a handful of directed-survivor `related` glosses (the target-side view of a directed edge) — directed edges hold one note, which already renders on both endpoints.

### 2026-06-24 — Per-direction notes on symmetric edges

A symmetric edge (`complements`, `tangential`, `alternative`, `related`) is one relationship seen from two vantages. Both endpoints may now author it, each with its own note; `RelatedPatterns.astro` renders the *near-side* note — the one authored by the page being viewed — falling back to the other side when only one is authored. First use: `bot ⇄ collaboration` reads "frames the AI as a collaborator with its own modes" on collaboration's page and "bots participate as collaborative agents…" on bot's.

Why: a link between two patterns is described twice in a pattern language, once in each pattern's voice (cf. *A Pattern Language*'s up/down cross-references; the annotated-backlink convention in wiki/Zettelkasten tools, where the value is the *context at the point of linking*). The graph layer was previously forcing a single voice, and the dedup kept whichever record it iterated first — not reliably the local one.

No storage change: the extractor already keeps both directed records (`source|target|type` keys differ by direction); the fix is display-only. Considered and rejected as over-engineering: reifying edges / RDF-star quoted triples (the nesting-order complexity isn't worth it for one optional note), and Topic-Maps-style named roles. Constraint borrowed from the backlink literature: per-direction notes earn their place only when *authored and distinct* — never auto-filled, never duplicated across both sides.

### 2026-06-24 — Re-typing migration-flattened `precedes` edges (collaboration cluster)

The pre-migration `## Related patterns` lists grouped neighbours under prose headings like `### Precursors`, which the old heading-text extractor flattened to `precedes`. On `collaboration` this lumped three heterogeneous relations into one type. Re-typed by meaning:

- `collaboration-foundation precedes collaboration` → `collaboration instantiates collaboration-foundation`. The pattern is a concrete application of the foundational concept (skos:broader); `precedes` mis-stated a taxonomic relation as a sequential one. First `instantiates` edge to target a `foundation` — the type's definition already names foundations as valid targets. Note reworded off "enacts" ("the foundation this activity realises") to avoid colliding with the `enacts` type name.
- `bot precedes collaboration` → `bot complements collaboration`. Bots participating as collaborative agents is co-deployment, not precedence.
- Mutual `collaboration ⇄ conversation` precedence (each side authored a `precedes` to the other) collapsed to a single `conversation complements collaboration`. `enables` was considered and rejected: collaboration does not *depend* on conversation (async collaboration via shared artefacts is real), and both sit at the `activity` altitude — symmetric `complements` is truer than a compositional `enables`.

Why: direction and type are fixed by the relation name (I2), so a wrong type is a wrong claim. These notes survived migration via the reverse-edge author, so nothing rendered was missing — only the types were wrong and `conversation` double-rendered (Precedes + Preceded by).

What was lost: `collaboration`'s own gloss on `bot` ("frames the AI as a collaborator with its own modes") — one edge holds one note, and the source-side (`bot`) gloss is canonical.

Known follow-up (not done): other files likely carry the same `Precursors`-heading→`precedes` mistyping. A corpus sweep of `precedes` edges for ones that should be `instantiates`/`complements` is a separate pass.

### 2026-06-23 — Quality pages carry no pattern list (purist stance)

`RelatedPatterns.astro` now renders nothing on `role: quality` pages (guarded by `nodes[slug]?.role === 'quality'`). A quality is a diagnostic lens — "which property is weak here?" — not a catalogue of its instances. Enumerating every pattern legible through a quality's lens trends toward *all of them* and carries near-zero signal; the length of such a list is the symptom of a category error, not a sizing problem. The bridge from move to quality lives entirely on the pattern side via `enacts`, explored through the graph, never rendered as a quality-page section.

To match the data to the stance, the quality-authored `related:` frontmatter was cut to quality→quality targets only. Of the 52 quality→pattern `related` edges removed: 28 already had a pattern→quality `enacts` counterpart (pure duplicates); 18 were migrated to `enacts` authored on the pattern/foundation side with Q-lens labels (e.g. `undo enacts temporality` — "lets the actor reverse an action after the fact"); 6 were dropped as not genuinely enacts-shaped (`progressive-disclosure→formality`, `interaction→malleability`, `data→malleability`, `collaboration-foundation→temporality`, `suggestion→temporality`, `command-menu→temporality`). The 25 quality↔quality `related` edges are kept as latent graph data — they relate properties to each other and render nowhere under the purist stance, awaiting a deliberate quality-relationship treatment (cf. Open Question #5, `tensions-with`).

Why: see the *enacts* section and Open Question #6. This is the Nature-of-Order reading — properties don't reference their instances — made operational in the renderer, consistent with how `agency.mdx`'s "Appropriate reliance" already treats qualities as diagnostics ("strengthen whichever contributing quality is weakest").

What was considered: a curated "characteristic moves" list per quality (rejected as still a list, and `enacts` is pattern→quality only so a quality cannot author it); capping the incoming `enacts` list (needs a curation signal that doesn't exist yet).

What's lost / staged: two non-`related` quality→non-quality edges remain and still leak a quality onto a foundation page — `privacy enables collaboration-foundation` and `learnability tangential localization`. Left in place pending a decision on whether the purist cut extends past `related` to all quality-authored outbound edges.

### 2026-06-23 — Purist stance is one-directional (pattern-side quality prose stays)

Clarifies the entry above. The no-catalogue rule applies only to the quality→pattern direction. A pattern may still narrate a quality at length in its body — annotation's `## Temporal dimension` section being the sharpest case (the only quality used as a *linked heading*; `transparent-reasoning`, `bot`, `collaboration` carry quality-themed sections too). That prose *is* the move→quality bridge told from the pattern side, which is where it belongs.

Consequence: such a pattern surfaces the quality twice — once as in-context narration, once as the generated `enacts` line in `RelatedPatterns`. This redundancy is accepted. The two serve different jobs (reading vs. graph-navigation), so the renderer does *not* suppress an outgoing `enacts` whose target is also linked from body prose.

What was considered: suppressing the generated line when a body section already covers the target (rejected — adds renderer heuristics and couples the generated block to prose structure); dropping the prose sections as the same category error in reverse (rejected — loses genuinely rich content like annotation's lifecycle/rhythm/history).

What's lost: nothing removed. Open follow-up — pre-existing `enacts` notes were never audited against the Q-lens label convention; some are "supports-Q"-shaped (annotation's `learnability` note, "annotations provide the context needed for learning"). A note audit is warranted but separate.

### 2026-06-23 — Typed relationships: explicit authoring replaces heading-text inference

Replaced `HEADER_TYPE_MAP` / `INVERSE_DIRECTION_HEADERS` heading-text inference with three explicit authoring channels: frontmatter `relationships:`, inline `{rel="type"}` on links, and `<PatternRef>`/`<ComponentRef>` component props. Direction is fixed by the relation name via an alias table (e.g. `follows` normalises to `precedes` with inverted direction). Three structural auto-typings are kept — decision-tree → `recommends`, quality-target → `enacts`, collection-page untyped links → `surveys`. All 818 existing edges were migrated to `relationships:` frontmatter via `scripts/migrate-relationships.ts`.

Why: heading-text inference coupled four interacting mechanisms (header text, inverse-direction sets, role-based defaults, quality-promotion). Prose edits silently mutated the graph. Authored-not-inferred satisfies Shipman's formality trap criterion — opt-in (I1) and predictable (direction fixed by name, not author intent).

What was considered: keeping heading extraction as a compatibility layer alongside explicit authoring. Rejected — dual-mode would have perpetuated the silent mutation problem. Migration script provides the transition; the old `## Related patterns` sections remain in MDX as prose pending Phase D removal.

What's lost: thematic tag collection from `### ` subcategory headers (e.g. "Core collaborative components" → node tag). Acceptable: tags were a side-effect of the header model, not a first-class feature.

### 2026-06-22 — `umbrella` role split into `pattern` + `collection`; `surveys` = `skos:member`

The `umbrella` role conflated three relations under one `surveys` edge. Grounded in Winston/Chaffin/Herrmann's (1987) meronymy taxonomy and W3C SKOS (`Concept` vs `Collection`), they are now separated: *component–integral* parts use `enables` (a composite move's constituents — "Composed from" / "Constituent moves" headers), *genus–species* variants use `instantiates`, and only *member–collection* grouping uses `surveys`, now mapped to `skos:member`. Composite moves (Form, Block-based editor) and general moves with variants (Assisted task completion, Cognitive forcing functions) become `role: pattern` — they *are* sources for their move; genuine surveys (Qualities, Navigation overview, the AT strata) become `role: collection`.

Why: a composite move is the authoritative source for its own move, so defining `umbrella` as "not the source for one move" was false for half its members (the Form contradiction). Scale is relational, not a node type — it already lives in `activityLevel` and edges.

What was considered: adding a new `composed-of` edge (rejected — `enables` already carries component-integral composition at any altitude, and the vocabulary explicitly stores no "composed of"); renaming `surveys`. Kept `surveys`; re-tied its default trigger from `role:umbrella` to `role:collection`.

What's lost / staged: bucket-B pages' child links currently fall back to `related` until each variant page is given an `instantiates`-producing header (deferred). `umbrella` remains a deprecated extractor alias. Full reasoning: `research/umbrella-role-scale/`.

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
