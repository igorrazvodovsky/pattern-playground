# Relationship vocabulary for the pattern graph

A controlled vocabulary for typed edges in `apps/patterns/src/data/pattern-graph.json`. Each entry defines a relationship that can hold between two patterns. The vocabulary is small by design — it should capture the structural distinctions that matter for navigation and reasoning, not every possible nuance.

Settled specification summary: [docs/specs/graph-relationship-model.md](../specs/graph-relationship-model.md).
This page is the detailed vocabulary record and changelog.

## Epistemic stance

Two framings shape how the vocabulary should be read and used:

1. *Suggestion, not matching.* Edges, tags, and decision-tree conditions are all *suggestion-grade* — they describe what has been useful in similar situations, not predicates to be matched against a query. An actor uses the graph as context for judgement, not as a lookup table.

2. *Patterns as generative moves.* Patterns are not catalogue items to be selected but transformations that produce *centres* (see §"Patterns as generative moves" below). Relationships describe how patterns combine, not how options are picked. Design is sequential unfolding, not selection from a menu.

These framings are compatible and reinforcing. The first is an epistemic claim about the data (incomplete, fuzzy, hint-grade). The second is an ontological claim about the operation (design is transformation, not selection). Together they push in two directions: the data should be *looser* and the use should be *transformative*.

The first framing is enforced by a *consumer contract*: no pipeline step — extractor, query function, renderer, or agent tooling — may match, filter, or route on a condition or situation. Situations and hints render as prose for an actor's judgement; the moment a query filters by one, the library has minted rules. What makes a condition rule-grade is not that it is typed, structured, or stored — it is that a machine evaluates it. Structure is therefore allowed (a situation clause has a shape, a hint has a question and a branch); evaluation is the drift. Where [references/report-pattern-language-formats.md](../../references/report-pattern-language-formats.md) recommends machine-readable, queryable postconditions, this stance governs — see the 2026-07-10 situations changelog entry for the research behind that call.

## Design principles

1. *Inverse pairs only where they hold*: `precedes` and `follows` are genuine inverses (the same fact viewed from either side). `enables` and `instantiates` are *not* inverses despite the surface similarity — they are distinct directed relationships (compositional vs. taxonomic). Reverse traversal of any directed relationship is handled by graph queries, not by storing inverse edges.
2. *SKOS alignment where natural*: relationships that have clear SKOS equivalents are mapped to them. This makes the vocabulary interoperable without requiring SKOS tooling. Where SKOS has no equivalent, custom predicates are defined.
3. *Directionality is semantic, not syntactic*: directed relationships express asymmetric meaning (A enables B does not mean B enables A). Undirected relationships are symmetric (A complements B = B complements A).

## Patterns as generative moves

The vocabulary is written in the *Pattern Language register* of Christopher Alexander's work: patterns are moves, relationships describe how moves combine, and design proceeds through sequences of decisions each acting on what already exists. The library aspires toward the *Nature of Order register* — structural properties as recursive production rules — but is not there yet. See [design-theory.md](./design-theory.md) for the full trajectory and what progress toward it looks like.

Two consequences for how the vocabulary should be read now:

- *Edges are hints, not predicates.* The graph data is suggestion-grade. An actor uses an edge as "people have found this useful here" rather than as a rule to be matched.
- *Relationships describe how patterns combine, not how options are selected.* `precedes` doesn't mean "users encounter A then B" — it means "applying A produces a centre on which B can subsequently act." `complements` doesn't mean "people use them together" — it means "these patterns enhance compatible centres." `alternative` doesn't mean "competing options" — it means "different transformations of the same starting structure."

The relationships defined below should be read in this register throughout.

## Relationships

### precedes / follows

*A precedes B*: applying A produces a centre or condition on which B can subsequently act. The relationship is sequential — A sets up B — but the basis is generative, not merely temporal. A is a move whose result B then operates on.

- Directionality: directed
- Inverse: `follows` (authoring alias — see alias table below)
- SKOS: no equivalent (SKOS has no temporal or generative-sequence dimension)
- Authoring: `rel="precedes"` on the earlier pattern's page, or `rel="follows"` on the later pattern's page. Both store as `A precedes B`. In frontmatter: `relationships: { precedes: [B] }` on A's page, or `follows: [A]` on B's page.
- Example: Progressive disclosure *precedes* Filtering — applying progressive disclosure produces a narrowed visible set that filtering can then act on.
- Note: some chains form *generative sequences* in the strong Alexander sense (each step creates the conditions for the next). Localization's "linguistic, then cultural, then regional" ordering is an example. These are encoded as ordered chains of `precedes` edges; no separate edge type is needed.
- Note: a foundation may source `precedes` when it acts as substrate — see the foundation tiebreaker note under `instantiates`.
- *Register*: `precedes` speaks in the *designer's* register — the traversal of patterns, where a situation is the history of moves already applied (situation calculus, the pattern-form canon, and Alexander's unfolding all define it this way). The actor's runtime sequence is the *evidence* for the design-time claim, and on most edges the two coincide. Where they diverge — B *replaces* A under a condition rather than acting on A's product ("hub and spoke takes over when items exceed screen capacity") — the plain generative claim is false as stated and true only through the join: *A's resulting context under a condition is B's initiating situation*. Register divergence is a detector, not a dilemma: such an edge is a compressed conditional join, and wants decomposing through the situation constructs (see §Situations) rather than re-typing.

### enables

*A enables B*: A provides a lower-level move, surface, or substrate that B incorporates or builds on. The relationship is compositional — A is a constituent woven into B's realisation — and it holds *within the language*: both endpoints are entries in the graph. B need not strictly depend on A: optional assists and interchangeable constituents count, so long as A is part of how B is realised where it appears (Winston et al.'s component–integral relation does not require necessity, and the corpus has never used it that way). What `enables` does *not* cover: a component implementing a pattern — components are not entries in the language, and the pattern→component relation is a cross-dataset reference, not an edge (see §Component realisation).

- Directionality: directed
- Inverse: none stored. "What does A enable?" and "what enables B?" are both answered by traversing `enables` edges in either direction at query time. There is no "used by" or "composed of" stored as data.
- Not the inverse of `instantiates`. `enables` is compositional (part/whole); `instantiates` is taxonomic (genus/species). They share a directional sense ("more specific to more general") but encode different relationships.
- SKOS: aligns with `skos:narrower` (from B's perspective, A is a narrower/more specific mechanism) and `skos:broader` (from A's perspective, B is a broader pattern that uses A). The fit is imperfect — SKOS broader/narrower is taxonomic, while enables is compositional. But the directionality is the same: the enabling pattern is more specific, the enabled pattern more general.
- Authoring: `rel="enables"` on the part's page (A enables B), or `rel="composed-of"` on the whole's page (P is composed of target, stored as target enables P). In frontmatter: `relationships: { enables: [B] }` on A's page, or `composed-of: [A]` on B's page.
- This is the *component–integral* (part/whole) relation, and it holds at any altitude within the language: a constituent pattern enables the composite pattern that incorporates it (Bounded choice → Form), and a primitive enables the exchange built from it (Open request → Conversation). No separate `composed-of` edge is stored.
- A foundation can source `enables` as *material* — the stuff a pattern's surface is made of (Prose enables Dynamic hyperlinks: the link text *is* the prose). This is the constitution/stuff-of end of the definition's "surface, or substrate" wording, and it is one arm of the foundation reading guide (see the tiebreaker note under `instantiates`). Not to be confused with `serves`, which runs the other way — pattern toward foundation-as-frame.
- Example: Bounded choice *enables* Form — the form is composed of the constrained-field pattern. Autocomplete *enables* Data entry — an optional assist the pattern incorporates where present (the soft end of the same relation).

### instantiates

*A instantiates B*: A is a concrete application or specialisation of a more abstract principle, foundation, or pattern described by B. The relationship is taxonomic — A is a *kind of* B or A *applies* B.

- Directionality: directed
- Inverse: none stored. "What instantiates B?" and "what does A instantiate?" are both answered by traversing `instantiates` edges in either direction at query time. This is not the inverse of `enables`.
- SKOS: aligns with `skos:broader` — A has broader concept B. This is the cleanest SKOS mapping in the vocabulary.
- Authoring: `rel="instantiates"` on the specialisation's page, or `rel="instances"`/`rel="variants"` on the genus's page. In frontmatter: `relationships: { instantiates: [B] }` on A's page.
- Example: Command menu *instantiates* Searching — the broader seeking pattern applied to a command vocabulary.
- Note — foundations are legible from four directions, and the tiebreaker is what the foundation is doing in the claim. Concept applied wholesale by the pattern → the pattern `instantiates` it (Bot instantiates Delegation; Collaboration instantiates Collaboration foundation). Substrate whose application produces structure later patterns act on → the foundation sources `precedes` (Information architecture precedes Searching). Material a pattern's surface is made of → the foundation sources `enables` (Prose enables Dynamic hyperlinks — the definition's "surface, or substrate" wording). Frame with a named station the pattern covers → the pattern `serves` it (Activity log serves Delegation). Anything a note can't place on one of the four arms stays `related` — honest unclaimed adjacency, not a failure.

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

*A recommends B*: A's decision tree identifies a situation in which B has previously been a useful pattern. This is the relationship encoded by Mermaid flowchart branches — it carries *situational hints* describing the kind of design situation in which the recommendation has come up.

- Directionality: directed
- Inverse: none (recommendations are asymmetric and non-reciprocal)
- SKOS: no equivalent. This is a situational, domain-specific relationship.
- Authoring: *not an authorable rel* — comes only from decision trees. Do not write `rel="recommends"` on inline links or in frontmatter. The tree itself is authored as a Mermaid flowchart in a `## Decision tree` section plus a `decision-trees:` frontmatter block mapping leaf labels to pattern slugs (see the authoring model).
- MDX source: Mermaid flowchart leaf nodes within `## Decision tree` sections
- The decision tree is the *authorable home* of the judgement; its `recommends` edges are renderings of its rows. Two edges of the same type between the same pair (Notification emits two `recommends` to Transient feedback) are not an anomaly — they are two rows of one decision, distinguishable by their hints, and read together they are one judgement. Never author condition text on the edge to "clarify" such a pair; edit the tree.
- Situational hints: each recommendation carries the questions and branches that led to it, preserved as raw text rather than canonicalised. The *dimension* (the question) is controlled per tree — a stable authored question local to that judgement — while the *value* (the branch) stays in the author's words. There is no corpus-wide condition vocabulary, and none should be pre-legislated: convergence between trees' dimensions is observed post hoc and normalised through the changelog. The hints exist as context for an actor to consider — not as predicates to be matched (see the consumer contract in the epistemic stance).
- Example: Deletion *recommends* Undo, with the situational hints "Is the deletion reversible? → Yes" and "How quickly can it be recreated? → Seconds". An actor reads this as "when the situation looks like a fast-recoverable reversible deletion, Undo has been a useful pattern" and applies its own judgement about whether the current situation actually resembles that.
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
- Authoring: `relationships: { surveys: [B] }` on the collection page.
- Example: Navigation overview *surveys* the navigation models it gathers; Operations *surveys* its constituent operation patterns.
- Why this matters: collection pages are authored surveys. `surveys` preserves that membership altitude without forcing collection pages through `precedes`, `related`, or `enacts` semantics — and keeps member-collection grouping distinct from a composite *pattern*'s part-whole (`enables`) and genus-species (`instantiates`) relations.

### The three part-whole relations (and why they don't compose)

`surveys`, `enables`, and `instantiates` cover three distinct ways a "bigger" entry relates to "smaller" ones — the member-collection, component-integral, and genus-species relations of Winston et al.'s 1987 meronymy taxonomy:

| Relation | Edge | A whole/general… | Example |
|---|---|---|---|
| component–integral (part/whole) | `enables` | …is *made up of* its parts | Bounded choice `enables` Form |
| genus–species (kind) | `instantiates` | …is *specialised into* variants | Autocomplete `instantiates` Assisted task completion |
| member–collection (grouping) | `surveys` | …merely *gathers* members for browsing | Operations `surveys` its operation patterns |

These are different relations and are **not transitive across types**: do not traverse `surveys` → `enables` → `instantiates` as a single path. A composite *pattern* (Form) is a `pattern` that uses `enables`/`instantiates` to reach its constituents; only a `collection` page uses `surveys`. Misfiling a composite pattern as a collection (the retired `umbrella` conflation) collapsed component-integral parts into membership and broke this distinction.

### hosts

*A hosts B*: A is the surface on which B's trigger or entry point is surfaced — the group-by control lives in the toolbar, autocomplete lives in form fields, onboarding builds on the empty state's canvas. The claim is *locative*, not compositional: B is *in* A the way wine is in a cooler, not the way a handle is part of a cup. Winston, Chaffin & Herrmann (1987) — the same source the three part–whole relations stand on — explicitly exclude spatial inclusion from meronymy, which is why every attempt to absorb hosting into `enables` mis-stated the authored claim and lost part of it.

- Directionality: directed (host → hosted pattern)
- Inverse: none stored — reverse traversal at query time, like the other directed types.
- SKOS: no equivalent. SKOS has no locative dimension; the nearest, `skos:related`, would discard exactly the distinction this type preserves.
- Authoring: `rel="hosts"` on the host surface's page, or `rel="hosted-by"` on the pattern's page (stored inverted). In frontmatter: `relationships: { hosts: [B] }` on the host, or `hosted-by: [A]` on the hosted pattern.
- Example: Form *hosts* Autocomplete — the form field is where the completion surface appears; the same pair could not carry this claim as `complements` ("where it most commonly lives" is not co-deployment) or `enables` (autocomplete is not a part the form is made of).
- Not `enables`: hosting asserts nothing about composition or dependency. A pattern can be hosted by a surface it is no part of (onboarding on the empty state) and can compose into wholes that don't host it (autocomplete enables data-entry, which has no surface at all).
- Not `precedes`: the host does not produce a centre the hosted pattern acts on; it merely locates the trigger. Where a note on a `precedes`/`enables` edge reads "container", "canvas", or "where it lives", the edge is usually a hosting claim wearing the wrong type — the note-verb advisory flags these.
- Relation to the situation constructs: a hosting fact *can* be narrated inside a resulting-context clause ("the composition leaves a toolbar where the grouping trigger lives"), but the standing locative relation between two patterns belongs on this edge type. One home per fact: don't author both.

### serves

*A serves B*: pattern A is a move whose role is articulated within foundation B's frame — A covers a named station of B's anatomy (a touchpoint of delegation's lifecycle, a step of assistance's cognitive cycle, a position on modality's gradient). The claim is *participation*, not parthood: A is not a part B is made of (`enables`), not a kind or application of B (`instantiates`), and B produces nothing A acts on (`precedes`). B's frame is where A's job is located.

- Directionality: directed (pattern → foundation only)
- Inverse: none stored — and no inverse authoring alias: the pattern side carries the edge. A foundation cannot enumerate its dependents (the set is open-ended, and foundation-side lists trend toward catalogues — the accretion the qualities decision already corrected on that layer); the pattern's author is the one who knows which frame articulates the pattern. If foundation-side voicing ever proves necessary, an alias is a changelog decision.
- SKOS: no equivalent. Nearest formal kin: the *participation* relation — in the part–whole family but not parthood (Keet & Artale 2008, extending the same Winston et al. taxonomy the part–whole relations here stand on; `participates_in` is a core relation in the OBO Relation Ontology) — and role-playing in Descriptions & Situations (Gangemi & Mika 2003), where a description defines roles that entities play. Research gate: `research/pattern-foundation-serves/`.
- Authoring: `rel="serves"` inline or `relationships: { serves: [foundation-slug] }` in frontmatter, on the pattern's page.
- Example: Activity log *serves* Delegation — the supervisory record for delegation's monitoring touchpoints. Notification *serves* Delegation — the communication channel for a background agent.
- *Labelling*: a note should name the station the pattern covers, in the author's words ("the supervisory record for delegation's *monitoring* touchpoints"), not restate the type ("relates to delegation"). Anatomy is controlled per foundation — the foundation's own authored structure (lifecycle, gradient, cycle), referenced from the note. There is no corpus-wide station vocabulary and none should be pre-legislated (the decision-tree dimension rule, applied to foundations); stations stay prose, rendered for judgement and never matched on, per the consumer contract.
- Claims-vs-citations line (the ambient media): claim `serves` only when the foundation's frame does articulatory work for the pattern's role. Every page has text, so touching prose in the trivial sense is a citation, not a claim — the same line `realised_by` draws.
- Not `instantiates`: Bot applies delegation wholesale (a delegated agent is what a bot *is*); Activity log covers one station of delegation's frame. Application vs. participation is the boundary to police — on the overlap watch under §Retirement.
- Not `enables`: material claims — a foundation as the stuff a pattern's surface is made of (Prose → Dynamic hyperlinks) — are *constitution*, a different Winston/Keet relation, and stay on `enables`' substrate arm, foundation-side. One type for both would re-merge what the pattern canon never unpicked (Alexander's "helps to complete", Noble's *uses*, and van Welie's aggregation all fold station-serving and composition into one upward link).
- Why this matters: with stations named pattern-side, a foundation acts as a *completion frame* — entering it from one pattern shows which stations are claimed and which have no pattern yet — and co-grounding (patterns sharing a foundation) becomes a typed lateral-suggestion channel instead of fishing in `related`. These are the generative services the residual `related` pile could not provide.

### enacts

*A enacts Q*: pattern A is a move whose effect is legible in the Q dimension — applying A changes the structure in a way that shows up when you read the result through quality Q's lens. This is the bridge between patterns (as patterns) and qualities. The relationship does not assert that Q is maximised or always increased; it asserts that Q is the right lens through which to read what this pattern does.

- Directionality: directed (pattern → quality only — qualities don't enact patterns)
- Inverse: none formal (the inverse "Q is enacted by A" is implicit in graph traversal)
- SKOS: no equivalent. This is the most domain-specific relationship in the vocabulary.
- Authoring: `rel="enacts"` inline or `relationships: { enacts: [quality-slug] }` in frontmatter. 
- Example: Confirmation dialog *enacts* Agency — the pause-before-consequence is a move that strengthens the user's sense of intentional control.
- *Labelling*: a label should name what the pattern does to the centre such that the effect is legible through Q's lens — not restate the type ("X supports Q") or define the quality. "Creates a moment of intentional pause before acting" is a label; "supports agency" is not.
- Why this matters: under the generative-moves framing, the qualities act as a vocabulary for what a transformation should accomplish. An actor reasoning "what's weak in the current structure that I should strengthen?" needs to know which patterns enhance which qualities. Promoting these from prose links to typed edges makes that reasoning possible.

## Edge axis

Each edge type carries an implicit *axis* — the dimension along which the relationship moves. The axis is derived from the type, not stored as a field.

| Axis | Edge types | What it means |
|---|---|---|
| Vertical | `instantiates`, `enables`, `enacts`, `serves` | Crosses altitudes — taxonomic (genus/species), compositional (part/whole), pattern → quality, or pattern → foundation |
| Horizontal | `complements`, `tangential`, `alternative` | Same altitude — patterns that share a structural role or co-deploy |
| Sequential | `precedes`, `follows`, `recommends` | Generative sequence — one pattern sets up another, or a tree branch routes to one |
| Territorial | `surveys` | Collection membership — a `role:collection` page gathers its members |
| Locative | `hosts` | Spatial inclusion — where a pattern's trigger or surface lives |
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
| hosts | — | No equivalent (spatial inclusion — non-meronymic per Winston et al.) |
| enacts | — | No equivalent (pattern → quality) |
| serves | — | No equivalent (participation/role-in-frame; nearest formal kin: RO `participates_in`, D&S role-playing) |

The alignment is useful at two levels. First, it provides a sanity check — if a proposed relationship type has no SKOS equivalent *and* no clear justification for being domain-specific, it may be an unnecessary distinction. Second, if the graph data ever needs to interoperate with external tools or linked data systems, the SKOS mappings provide a bridge without requiring a full ontological commitment.

A third reading: the specialised types behave as *subproperties* of `skos:related` in the `rdfs:subPropertyOf` sense — every specific claim entails generic relatedness, which is why the extractor's dedup drops a `related` edge when a stronger type exists between the pair (hand-rolled subsumption). The entailment runs specific → generic only. A generic edge plus endpoint roles never reconstructs the specific claim — the type records that an author asserted something, the endpoint roles only record what kinds of things exist — which is why the quality-target auto-typing channel was retired (2026-07-11) and why no future channel should mint a type from a target's role.

## Literature support and local extensions

The vocabulary is grounded in HCI pattern-language literature, but it is not a direct import of any one source vocabulary. Older HCI pattern-language work tends to use a smaller set of broad relationships — context/reference, contains/is-contained-by, is-a, association, alternatives, competitors, super-ordinate/sub-ordinate, neighbouring — and often leaves "related patterns" underspecified. This project decomposes those broad terms into distinctions that matter for graph reasoning in this corpus.

Strongly literature-supported mappings:

| This vocabulary | Literature precedent | Local interpretation |
|---|---|---|
| `enables` | aggregation, contains, sub-ordinate, lower-level patterns used to implement/refine a design | Compositional incorporation: a component, surface, or building block the pattern draws on where present. |
| `instantiates` | specialization, is-a | Taxonomic application: a concrete pattern applies or specialises a broader principle, foundation, or pattern. |
| `precedes` | references to lower-level patterns used after the current one, sequence, generative traversal | Generative sequence: one pattern produces a condition on which another pattern can act. |
| `alternative` | alternatives for the same problem, competitor relationships | Same-purpose substitution with different trade-offs. Unlike some competitor accounts, this remains suggestion-grade rather than rule-grade exclusion. |
| `related` | generic related-pattern lists, association | Fallback for connections whose structural meaning is not yet clear enough to type more specifically. |

Partly supported but sharpened locally:

| This vocabulary | Literature precedent | Local interpretation |
|---|---|---|
| `complements` | association, co-occurrence in a larger context, same-size surrounding patterns | Stronger than generic relatedness: the patterns are often useful together but neither depends on the other. |
| `follows` | inverse view of sequence/reference | Not stored as a separate edge. It is the reverse traversal of `precedes`. |

Project-specific extensions:

| This vocabulary | Why it exists here |
|---|---|
| `enacts` | HCI pattern literature discusses forces, values, consequences, and qualities, but does not usually model a typed pattern → quality edge. This project needs that bridge because qualities are the lenses through which a pattern's effect is read. `enacts` is therefore a local extension, not a literature-derived relationship name. |
| `recommends` | Pattern-oriented design literature supports context-oriented applicability and guided pattern selection, but the decision-tree extraction shape is local. `recommends` preserves authored decision-tree branches as situational hints rather than converting them into rule-grade conditions. |
| `surveys` | Collection pages are authored surveys over a grouping of members, not single-pattern sources. `surveys` maps to `skos:member` and keeps collection pages from being flattened into generic `related` links — and keeps member-collection grouping distinct from the component-integral (`enables`) and genus-species (`instantiates`) relations a composite *pattern* uses. |
| `tangential` | Literature has generic association, neighbouring, and "related" language, but not a stable weak-adjacency type. `tangential` preserves the current author signal where pages explicitly distinguish conceptual adjacency from complementarity, dependency, or substitution. It is intentionally provisional: if future gardening shows it is only a weak form of `related`, or better handled by tags/projections, it can be merged or replaced through the changelog. |
| `hosts` | Pattern literature rarely models where a pattern's *trigger* is surfaced, and the meronymy canon the part–whole relations rest on explicitly excludes spatial inclusion. The corpus kept authoring the claim anyway — "container", "canvas", "where it lives" notes riding on `enables` and `complements` edges — and each shunt lost part of it. `hosts` gives the locative family its own name. |
| `serves` | The pattern canon never decomposes its generic upward link — Alexander's "helps to complete", Noble's *uses*, van Welie's aggregation all merge station-serving with composition. The ontology canon splits exactly here: participation (Keet & Artale 2008; RO `participates_in`) and description-defined roles (Gangemi & Mika's D&S) sit in the part–whole family but outside parthood. `serves` names that relation at the pattern–foundation boundary; the corpus was already authoring it as station-naming notes on `related` and `complements` edges (the delegation cluster). Research gate: `research/pattern-foundation-serves/`. |

## Authoring model

Edges come from three explicit sources and two judgement homes that emit edges — nothing else; untyped body links are citations and produce no edge:

### Explicit authoring channels

1. *Frontmatter `relationships:`* — declare typed edges for any pattern this page relates to:
   ```yaml
   relationships:
     precedes: [wizard, step-by-step]
     complements:
       - to: bounded-choice
         note: "the constrained-field pattern"
       - sections
     composed-of: [data-entry]
   ```
   Bare strings or `{to, note}` objects. The optional `note` becomes the edge label.

2. *Inline `rel=` on links* — for narrated edges in body prose:
   ```mdx
   …each field is [bounded choice](/patterns/bounded-choice){rel="composed-of"}…
   ```
   The `{rel="type"}` annotation is stripped by the `remark-rel-strip` plugin before rendering.

3. *`<PatternRef>` component props*:
   ```mdx
   <PatternRef slug="wizard" rel="precedes">Wizard</PatternRef>
   ```
   `<ComponentRef>` carries no `rel` — a component reference is a cross-dataset pointer, not an edge (see §Component realisation); the extractor warns if one is authored.

Untyped prose links are decorative — they never produce edges (invariant I1).

### Judgement homes that emit edges

Two node-side constructs hold situational judgements, and each *emits* the edges that render it — the edge is never a second place to author the judgement:

4. *Resulting-context clauses* — a `situation.resulting` clause with a `sets-up:` list emits a `precedes` edge to each named pattern, carrying the clause as the edge's derived `situation` text (see §Situations):
   ```yaml
   situation:
     resulting:
       - clause: >-
           Fields hold sensible starting values — which holds only while a
           static guess suffices; once the actor starts typing their own value,
           completion has to happen in flight.
         sets-up: [autocomplete]
   ```
   Don't also declare the same pair under `relationships: { precedes: … }` — the extractor merges the duplicate and warns.

5. *Decision trees* — a Mermaid flowchart in a `## Decision tree` section plus a `decision-trees:` frontmatter block emits `recommends` edges, carrying the tree's question/branch rows as `situationalHints`:
   ```yaml
   decision-trees:
     - id: deletion
       leaves:
         "No confirmation (with undo)": undo
         "Inline confirmation": inline-confirmation
   ```
   `chart-index` (0-based) selects among multiple `<MermaidDiagram>` blocks; leaves not in the map are skipped and reported.

### Authoring aliases and direction normalization

Direction is fixed by the relation name (invariant I2), not an author field. Aliases let the author pick the word that fits their sentence — which means the *authoring side* and the *claim's direction* are independent by design: a page authoring `composed-of: [X]` stores an edge whose source is X, not itself. The declaring page is not necessarily the claim's subject; aliases exist to decouple the two, so either endpoint can own the authoring of one stored claim:

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
| `serves` | P → target (foundation) | serves |
| `surveys` | P (collection) → target | surveys |
| `hosts` | P → target | hosts |
| `hosted-by` | target → P | hosts |
| `related` | P ↔ target | related |

`recommends` is not in this table — it is never an authored rel.

### No structural auto-typing (invariant I7)

No edge is minted from an untyped body link. A prose link is a citation; every edge is either explicitly
authored (`relationships:`, inline `rel=`, `<PatternRef rel>`) or emitted by
a judgement home (a resulting-context clause with `sets-up:` → `precedes`; a
decision tree → `recommends`). `surveys` and `enacts` are ordinary authored
types like any other.

### No redundant inverses

Inverse edges are *not* stored for directed types. "What does A enable?" and "what enables B?" are both answered by traversing `enables` edges in either direction at query time. `follows` is an authoring alias, not a stored edge type — if A `precedes` B is stored, no separate B `follows` A edge should exist.

Symmetric relationships (`complements`, `tangential`, `alternative`, `related`) may be declared on either page; the extractor deduplicates by `(source, target, type)` key.

A directed edge is a one-way *claim* (`A precedes B`) but a two-way *path*: the graph is traversed in both directions — an actor on B walks back to its precedents for context. So a directed edge carries an optional second note for the reverse reading. The forward author sets the outgoing `label` (`A` declares `precedes: {to: B, note}`); the target may add an incoming note by authoring the *inverse alias* (`B` declares `follows: {to: A, note}`, or `composed-of`/`instances` for enables/instantiates). This adds a note slot to the one edge — it does *not* create a second stored edge, so the no-redundant-inverses rule holds. The renderer shows the outgoing note when the edge is read forward and the incoming note when read in reverse, each falling back to the other when only one is authored. Author an incoming note only when the reverse reading needs different words; a single note serves both directions otherwise. (`enacts` needs none — quality pages render nothing, so there is no reverse reader.)

`enacts` (pattern → quality), `serves` (pattern → foundation), `recommends` (pattern → pattern, with situational hints), and `surveys` (collection → member) have no inverse — they are asymmetric and unidirectional.

*Voice the note for both pages.* A single-noted directed edge renders its one note on both endpoints' pages, in each case after the *other* endpoint's name — so a subjectless note binds to whichever endpoint the reader is not on. Write notes that either name their subject ("annotation supplies the mechanism for attaching help") or gloss the relation itself; when only one side's wording can work, author the reverse note via the inverse alias instead. The extractor's voicing advisory flags single-noted directed edges that name neither endpoint.

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
  extractedFrom?: string;                                    // provenance — 'frontmatter:<rel>', 'situation:resulting', 'quality-target', or 'decision-tree:<id>'
  situation?: string;                                        // DERIVED, never authored edge-side — the resulting-context clause this edge renders (only via 'situation:resulting')
  situationalHints?: Array<{ question: string; branch: string }>;  // only for 'recommends' — the tree rows this edge renders
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
  | 'surveys'
  | 'hosts'
  | 'serves';

type DirectedEdgeType = 'precedes' | 'follows' | 'enables' | 'instantiates' | 'recommends' | 'enacts' | 'surveys' | 'hosts' | 'serves';
type UndirectedEdgeType = 'complements' | 'tangential' | 'alternative' | 'related';

const inversePairs: Record<string, string> = {
  precedes: 'follows',
  follows: 'precedes',
};
// Note: enables/instantiates are NOT inverses of each other.
// They are distinct directed relationships (compositional vs. taxonomic).
// Reverse traversal is handled by graph queries, not by storing inverse edges.
```

`situation` and `situationalHints` are the two derived condition renderings, and they are parallel: each is the edge-side *showing* of a judgement whose authorable home is elsewhere (a node's resulting-context clause; a decision tree's rows). Neither is ever authored on the edge, and per the consumer contract neither may be matched, filtered, or routed on. `situationalHints` preserves the original question phrasings rather than canonicalising them — see the *recommends* section above.

## Situations (node-level constructs)

Beyond edges, each pattern can carry its two *situations* — the design situation in which the pattern applies, and the one it leaves behind. This is where the pattern-form canon puts both: context "described via a 'situation'… sometimes in terms of the patterns that have already been applied" (Meszaros & Doble), a node-side `resulting-context` component with no condition slot on links anywhere in the lineage (PLML), and Alexander's unfolding, where each step's condition is the wholeness the preceding steps produced. The node is where a situation is *said*; an edge is only where the join between two situations *shows*.

```yaml
situation:
  initiating: >-
    Prose — the situation this pattern applies in, told as the history of moves
    already applied (or ruled out).
  resulting:
    - Bare prose clause — something that holds after the pattern is applied.
    - clause: >-
        A clause that sets up a next pattern. Voice it to name its subject —
        it renders on both endpoints' pages.
      sets-up: [next-pattern]
```

- *Initiating situation* (`situation.initiating`): what the design already looks like when this pattern is worth reaching for — including, where that is the real content, which alternatives have been ruled out (Disabled state's initiating situation is "the component can't be hidden and can't stay live with an explanation"; arriving there *is* the last-resort claim). Plain prose, no machinery.
- *Resulting context* (`situation.resulting`): a list of clauses describing what holds after the pattern is applied, including the new problems it opens. A clause may carry `sets-up:` — the patterns for which this clause is the initiating situation. Each such clause *emits* a `precedes` edge and rides on it as the derived `situation` text.

Three rules govern the construct:

1. *One authorable home per judgement.* A situational judgement lives in exactly one place: a node's situation block, or the decision tree that owns it. Edge-side condition text is always a rendering of that home. The pre-correction state — the same judgement smeared across an edge note, a tree hint, and a `related` gloss — is what this construct exists to end (the deletion→undo bundle was the worked case).
2. *The condition is authored on the source side.* A conditional join reads "A's resulting context, under a condition, is B's initiating situation"; the clause lives in A's `resulting`, because A's author knows what A leaves behind. B's `initiating` is plain prose that reconciles from its own end — it carries no `sets-up` mirror.
3. *No corpus-wide condition vocabulary.* Clauses are prose; trees control their own dimensions as authored questions; values stay in the author's words. Convergence between judgements is observed post hoc and normalised through the changelog, never pre-legislated.

A conditional `precedes` is therefore not a special edge type. "Hub and spoke takes over when items exceed screen capacity" decomposes into flat navigation's resulting clause ("holds while everything fits one surface…") setting up hub-and-spoke; the edge renders the clause. The escalation ladders read the same way: good defaults' resulting context enumerates where a static guess stops sufficing, and each rung's edge shows the clause for its handoff. When a `precedes` edge reads differently in the designer and runtime registers, that divergence is the signal to decompose it this way (see the register note under `precedes`).

That `sets-up` emits only `precedes` is current scope, not a claim that resulting-context joins are inherently sequential: the corpus's clause-shaped judgements have so far all been sequential, and conditional *choice* already has a home — a decision tree leaf is "in this situation, reach for A rather than B". If a resulting clause ever genuinely opens a choice rather than a sequence, that is a vocabulary change to take through the changelog, not a stretch of `sets-up`.

Extraction emits `situation` as node metadata in `pattern-graph.json`.

Rendering: `resulting` clauses render as the page's "Consequences" section (`Consequences.astro`), the way `RelatedPatterns.astro` renders edges — the section is never authored in the body. `initiating` does not render; the lead narrates it in prose. A clause with `sets-up` additionally shows as its derived edge's note in the Related list — the same judgement rendered for two jobs (statement, then link context), not a second home. Per the consumer contract both renders are prose for an actor's judgement; nothing matches on them.

*When to skip*: minimal primitives (the definition exhausts it), unbounded stances (no discrete move), and collection pages (a grouping, not a pattern). Write `resulting` clauses when the pattern genuinely opens onto next patterns or new problems; a pattern whose edges are all associative doesn't need one.

A fourth arm, and the only one that skips half a block: *the judgement is already a decision tree's*. Rule 1 gives a situational judgement two possible homes, and where a tree names a pattern by suitability condition, the initiating situation is that tree — writing it node-side is the tree restated, which is the smearing the construct exists to end. The navigation models are the worked case: navigation-overview's tree picks among them by depth, item count and cross-section traffic, so all six carry `resulting` only, each with a comment saying where the other half lives. Resulting context is never tree-owned — a tree says which pattern to reach for, never what applying one leaves behind — so this arm removes one field, not the block.

Two authoring notes from the backfill sitting:

- *`alternative` on a pair blocks `sets-up`.* Two patterns typed `alternative` are different transformations of the same starting structure; `precedes` says one produces what the other acts on. Both at once is a contradiction, so a resulting clause that wants to escalate to an `alternative` sibling states the condition in its own words and emits no edge. This is why the navigation models set up nothing in their own family — escalation among alternatives is the tree's judgement. `complements` and `related` do not block: there the clause is the authorable home and the edge note was only ever a rendering, so the note comes off the entry when the clause takes the judgement over.
- *Minimal primitives are not skips in a sequential family.* Every conversation-family page is `atomic: primitive`, and all thirteen carry blocks: where patterns compose into an encounter, the initiating situation is which stage the encounter has reached, which is pattern-history rather than a restatement of the definition.

## Component realisation (cross-dataset)

*A is realised by C*: pattern A names an interaction move; component C implements it. This relationship deliberately has no edge type. The pattern graph is language-only — so a realisation claim points outside the graph, at Storybook's build-output `index.json`. It is a *cross-dataset reference* with one authorable home: frontmatter `realised_by`, a list of Storybook docs ids.

```yaml
realised_by: [actions-application-form--docs]
```

- *Claim vs citation*: `realised_by` is the claim; `<ComponentRef>` in body prose is a citation, claim-free. A page may cite components it is not realised by (form cites messaging as an embedding context), and a mention's presence implies nothing — which is why the mapping is authored, never scraped from prose. Never a `rel=` on a `<ComponentRef>` and never a component id in `relationships:` — components are not graph nodes, so such an edge could never resolve; the extractor warns on both forms.
- *Validation*: the build-time cross-reference validator (`apps/patterns/integrations/validate-cross-references.ts`) resolves every `realised_by` id and every `<ComponentRef id>` against `index.json` and fails the site build on a dangling reference. Realisation gets the same gate as a typed edge, in the dataset it actually points at.
- *Projection*: the extractor emits `realised_by` as node metadata (`realisedBy`) in `pattern-graph.json` — machine-legible for graph consumers, still not an edge. This is the reachability patterns-and-components.md promises: the component catalogue stays reachable from the language data without components re-entering the graph. Note what it is and is not — a lookup from a pattern to material already built, never a rule for making material that does not exist yet (see patterns-and-components.md §"The missing layer").
- *Rendering*: `RelatedPatterns.astro` deliberately renders nothing for realisation. On the page the relation reads in prose, where the context of *how* the component realises the pattern lives. Filtering's reference to the kept command-menu component doc is the worked citation instance: the actor building a filter is making filtering's pattern; what recurs is the command-menu *component* — a reference, not a realisation claim.
- *The name*: read pattern-side, *realised by* — the pattern points at its components. The correspondence is many-to-many and stays loose: a pattern page illustrates its move with whichever components fit, and one component serves many patterns. `realised_by` marks the crisp subset the pattern actually claims as its material; everything looser stays citation.

Coverage is deliberately partial until the backfill sitting runs (plans/active/2026-07-realised-by-backfill.md): form is the type specimen; the ~50 pages with ComponentRef mentions each owe a judgement call — realisation or citation — not a mechanical sweep.

## Open questions

1. ~~*Situations as authoring burden*~~ — answered 2026-07-25 by the backfill sitting, and reframed in answering: situations *are* written unprompted, but they land as edge notes rather than in the block, because a note is the nearest surface when no block exists. See the changelog entry for the evidence (22 judgements recovered from notes) and the two practices it recommends — a thin block on every new page, and a periodic sweep of noted directed edges. What stays open is narrower and belongs to the next sweep: whether pages that now *have* blocks accrete clauses into them, or whether the note reflex survives the block.

2. *Should `recommends` edges participate in the force-directed layout?* They represent situational suitability, not structural affinity. Including them adds navigational connections but may distort clustering. A reasonable default: treat them as a separate overlay rather than a layout input.

3. *Granularity of `related`*: thematic subcategories in MDX ("Core collaborative components", "Human-AI collaboration") carry meaning that `related` discards. The current direction is to promote them to lightweight tags (set memberships) rather than minting more edge types — but the tags should not be aggressively normalised, since the library isn't mature enough for a controlled tag vocabulary either.

4. *How much should the actor infer vs. read*: transitive enablement (Form → Combobox → Autocomplete → AI completion), co-grounding (patterns sharing a foundation), and alternative-conflict detection are all derivable from the graph. They could be computed on demand by query functions, or pre-computed and stored. The lighter approach is to compute on demand and let inference stay implicit.

5. *A `tensions-with` edge type between qualities?* Patterns can `enacts` multiple qualities, and a composition can pull in patterns whose enacted qualities are in tension (Agency vs. Speed, Consistency vs. Novelty). The graph currently has no way to express that tension. A quality → quality `tensions-with` edge would let a query surface "these patterns enhance qualities the library has noted as in tension — worth a look" without crossing into rule-grade conflict detection. Defer until two or three concrete examples exist; introduce through the changelog rather than speculatively. Until then, `alternative` co-presence in a proposed composition is the available tension signal. Whatever treatment lands should decide *support* alongside tension: `learnability related agency` ("competence facilitates agency", re-typed 2026-07-10 from a mis-authored `instantiates`) is a first supports-shaped specimen in the latent quality↔quality `related` set, and minting `tensions-with` alone would leave its mirror untypeable. Prior art filed for this treatment: the interdependence matrix of Alexander's fifteen properties (*The Phenomenon of Life*, p. 238) types exactly one relation between same-layer lenses — directed dependence-for-understanding, no tension relation at all — and reads dense interdependence as signal of a deeper layer rather than a modelling failure (see the addendum in `research/pattern-foundation-serves/2026-07-12.md`; the properties map to this project's qualities, not its foundations).

6. *A structural-property layer underneath qualities?* The use qualities are experiential dimensions, not structural properties — but there may eventually be a vocabulary for *structural* properties of interaction  that sits underneath them, in the same way that "the building feels welcoming" sits above "the entrance has levels of scale, strong centres, and thick boundaries."

7. An open boundary question rides with the future query layer: the consumer contract forbids matching, filtering, or routing on conditions and situations, but does not yet say where traversal ends and evaluation begins. The intended consumption is generative — a user-needs statement given to an agent that reads situations as prose context and proposes a chain of patterns — which stays on the judgement side of the contract. The line should be drawn in the vocabulary doc's epistemic stance
before the first query function is written.

8. ~~*Pattern–foundation edge treatment*~~ — resolved 2026-07-12: `serves` minted as the pattern → foundation participation edge, and the foundation tiebreaker grew to four arms (see the `serves` section and the changelog entry). The related-residue audit's foundation-target rows are unblocked with the four-arm guide as their rule.

## Structural invariants

Testable assertions derived from this vocabulary's own definitions. These can be checked against `pattern-graph.json` by a script or by an actor reviewing extraction output.

1. *Valid edge types*: every `type` value on an edge must be a member of `EdgeType` (precedes, follows, enables, instantiates, complements, tangential, alternative, recommends, related, enacts, surveys, hosts, serves).
2. *`enacts` targets qualities*: every edge with `type: 'enacts'` must target a node whose ID starts with `qualities-`.
3. *`recommends` carries hints*: every edge with `type: 'recommends'` must have a non-empty `situationalHints` array and an `extractedFrom: 'decision-tree:<treeId>'` string.
4. *No redundant inverses*: if A `precedes` B exists, no separate B `follows` A edge should be stored. `follows` is inferred at query time, not stored as data.
5. *Hint-only fields are scoped*: `situationalHints` appears only on `recommends` edges.
6. *Symmetric edges are consistent*: for undirected types (complements, tangential, alternative, related), if A→B exists then B→A must also exist (or the graph component must treat them as bidirectional).
7. *`surveys` sources are collections*: every edge with `type: 'surveys'` must have a source node with `role: 'collection'` (or the deprecated `role: 'umbrella'` alias).
8. *`situation` is derived*: every edge with a `situation` field has `extractedFrom: 'situation:resulting'` and `type: 'precedes'` — the field is emitted from the source node's resulting-context clause, never authored edge-side.
9. *No consumer evaluates a condition*: no pipeline step matches, filters, or routes on `situation` or `situationalHints` (the consumer contract). Not machine-checkable from the data alone; holds by review of consumers.
10. *`serves` targets foundations*: every edge with `type: 'serves'` must target a node with `role: 'foundation'` and source a non-foundation, non-quality node.

## Retirement (the exit path)

The vocabulary has entry gates — the SKOS sanity check, the changelog's what-was-considered discipline — but a type also needs a way *out*. The risk being policed is overlap, not number: there is no type-count budget, and a rarely-used type that says something nothing else says (the enacts-shaped bridges) earns its place at any count. A type retires when its distinctions stop being ones authors reach for or readers use.

Standing signals:

- *Per-type counts* in the extractor's summary line, advisory register — a type whose count only ever falls, or whose uses turn out on audit to be one other type in disguise, is a retirement candidate.
- *`related`'s share of all edges* is the health dial, read as a prompt rather than a failure metric: `related` is the honest home for unclaimed adjacency and stays legitimate at any share; the dial marks where to hunt for conversion opportunities (baseline 25% at 2026-07-10; the extractor prints the current share). The tell is sweep yield, not level — if sweeps into `related` keep converting edges to types, meaning is hiding there; if they keep coming back empty, the residue is honest.
- *A retirement question closes every gardening sweep*: "did this sweep lean on every type it touched, and is any type only ever the thing being swept away?"
- *Named overlap watch — `enables`/`complements`*: the incorporation softening (changelog 2026-07-10) left `enables`' soft end one author-judgement away from `complements` — "woven into how B is realised" versus "co-deployed beside B". If sweeps keep re-typing across that line in both directions, or optional assists turn up authored interchangeably under either type, the boundary is the retirement question to ask.
- *Named overlap watch — `instantiates`/`serves`*: application vs. participation (Bot *applies* delegation wholesale; Activity log *covers one station* of it). If foundation-target edges keep migrating across that line in both directions, or authors reach for the two interchangeably, the four-arm reading guide isn't cutting where authors cut.

`tangential` is the first standing candidate, per its own entry in the extensions table. `surveys` carries a retirement *ambition* rather than a signal: the four AT collection pages were deleted in favour of facet projections (2026-07-11), leaving two collections — data-visualization (the domain-corpus home) and navigation-overview — and the direction is to dissolve those too. If the last collection page dissolves, `surveys` retires with the `collection` role. Retirements land through the changelog like everything else — with what was considered and what is lost.

## Changelog

A running record of why types were added, merged, renamed, or retired, what alternatives were considered, and what was lost in each decision. The vocabulary is provisional — it will keep evolving as the library grows. Making its construction visible is part of treating classification as a living artifact rather than a closed specification (compare Bowker & Star, *Sorting Things Out*: "the only good classification is a living classification").

Each entry: date, change, why, what was considered, what was lost.

Entries are condensed to what still bears on future decisions; the full records are in this file's git history.

### 2026-07-27 — epistemic status: `seed` and `evidence` as node facets

How well-supported a page is became a first-class dimension of the notation: `seed` (boolean, any role) marks a page as a held thought rather than a claim, `evidence` (array of kinds, `role: pattern` and `role: collection` only) names what backs a pattern, and an optional `disclosure` line carries the prose reason.

### 2026-07-25 — Resulting clauses render as the page's Consequences section; authored sections retired

The absorption entry below rested on a mechanism fact — situations never render on a pattern page, so the prose `## Consequences` section was the clauses' reader-facing render. The backfill then filled 90 pages with resulting clauses while (correctly, under the provisional call) authoring no prose sections, which left the fact carrying an absurdity: on all but seven pages the "reader-facing render" didn't exist, and 182 of 219 clauses — every one without `sets-up` — reached no reader at all. The fix inverts the component instead of hand-writing ~85 prose sections: `Consequences.astro` renders `situation.resulting` at the page foot before Related patterns, the same never-authored-always-rendered rule the Related list already follows. One judgement, one authored home, machine render — the hand-narration alternative was rejected as a second corpus-wide pass whose product drifts (the seven specimens had already drifted to near-verbatim restatement).

The seven authored sections converted in the same sitting, and the conversion exercised the whole residue taxonomy: restatements deleted; advice moved to body prose (coordinated views' parsimony guidance into its Solution, where Baldonado's guidelines live); field observation was already sitting beside its reference (attribute visibility's 8.33% finding). Two pages carried judgements that existed only in prose — purpose-keyed view's maintenance-duty bullet, coordinated views' per-view cost — which entered the block as clauses; that the double-carrying pages held block-less judgements is the same note-reflex finding as open question 1, one surface over.

What was lost: the author's freedom to place Consequences mid-page (the render slot is fixed at the foot) and to phrase the section's prose independently of the clauses — accepted, since independent phrasing is exactly the drift the one-home rule exists to prevent. A `sets-up` clause now renders twice on its source page (Consequences statement, Precedes note) — accepted as two jobs of one judgement; watch it if it reads as noise.

### 2026-07-25 — Situation backfill: `consequences` absorbed, two skip arms added, open question 1 answered

The corpus filled in one pass: 91 of 94 `role: pattern` entries now carry a situation block, the other three carrying recorded skip verdicts (plans/completed/2026-07-situation-backfill.md holds the per-page roster). `precedes` 68 → 79, `related` −2, `complements` −4, `tangential` −1; related share 22.4% → 22.0%.

*Guard gap, recorded not fixed*: the extractor's duplicate-pair warning covers only `precedes` declared in `relationships:` alongside a `sets-up` emission. Converting a judgement out of `complements`/`related`/`tangential` is unguarded, and two pairs slipped through the whole pass — both with the surviving duplicate on the *target* page, where the converting author isn't looking. A cross-type advisory is the follow-up (advisory register, not warning: `recommends` and `surveys` co-presence on a `sets-up` pair are both legitimate — see the plan's close-out for the two that are).

*`consequences` does not survive as a distinct field.* It is absorbed into `situation.resulting`, and the vision doc's unrealised-field list loses it. The mechanism decided it rather than a judgement about the prose: `situation.initiating` and `situation.resulting` never render on a pattern page — they are node metadata, and the only place a clause reaches a reader is as an edge's derived label. So the prose `## Consequences` section already *is* the reader-facing render of the resulting clauses, and the frontmatter block is the machine-legible one: one judgement, two renders, rule 1's shape. A third carrier for the same judgement is the scatter the construct exists to prevent. The six double-carrying view-system pages showed the two saying the same thing at different lengths (data-view's clauses are its bullets almost verbatim).

The residue is real, small, and wants no field: prose Consequences also carries *advice* (coordinated views' "couple only where coupling demonstrably helps") and *field observation* (attribute visibility's "the ceiling is the norm, not the exception"). Neither is a state that holds after the pattern. Advice belongs in prose where a reader can act on it; observation belongs beside the reference it came from. The fill confirmed the boundary by pressing on it — clauses drifting toward advice or anti-pattern turned up twice and were rewritten as states, which is the discipline the absorption asks for.

*Open question 1 answered, and reframed.* Situations do get written unprompted — they just don't land in the block. The pass found 22 conditional `precedes`/`follows`/`complements` notes carrying situational judgements that had been authored edge-side all along, one of them (annotation's) smeared across three edges as three hedged renderings of a single claim about shared marks. So the honest answer is not "authors don't write situations" but "the block only catches them when it is already there": a page with a block accretes clauses; a page without one sends the judgement to an edge note, because a note is the nearest available surface. Two consequences for practice — a block on a new page is cheap insurance even when thin, and the recurring maintenance is a periodic sweep of *noted* directed edges, which is what this pass was. Twice the same mis-homing appeared independently (explanation and transparent-reasoning both had their over-reliance exposure authored on cognitive-forcing-functions' page rather than their own), which is the sweep-yield tell rather than two coincidences.

*Skip taxonomy grew two arms* (both in the body, §Situations): the decision-tree arm, which removes only `initiating`; and the *framework page* under unbounded stances — action-consequences and status-feedback are dimensions plus a ladder that route to other patterns, and status-feedback says so about itself. Framework pages stay `sets-up` targets, which is the right asymmetry: a target reconciles from its own end or not at all, and these have no own end.

What was considered: keeping `consequences` as the prose-authored field with `situation.resulting` as its projection (rejected — it inverts which carrier is authoritative, and the field would have no consumer the section doesn't already serve); a `residue`-shaped field for advice and observation (rejected — pre-legislating a vocabulary for two shapes that read fine as prose). What was lost: the resulting-context judgement is now authored in frontmatter and read in prose, so the two can drift, and only an audit notices — the same exposure the `enacts` notes carry. Held, not taken: three `complements`/`related` conversion opportunities from batch 2, authored before the `alternative`-only rule was narrowed (multilevel-tree/searching, filtering/agent, progressive-disclosure/good-defaults) — re-typing calls for a future sweep, and the health dial's nearest live leads.

### 2026-07-25 — Enacts-note audit: all 118 labels judged against the Q-lens convention

All noted `enacts` edges audited in one sitting: 29 reworded across 16 pages, 87 kept, 2 held deliberately — progressive-disclosure → density and workspace → privacy, whose verbs brush the supports-Q shape but whose component clauses name the pattern; rewording would be churn. The corpus's real failure shapes (what the next audit should look for) were not supports-Q verb phrasings but *topic lists*, *dimension-namings* that scope the quality instead of naming the pattern's effect, *deictic residue* that only reads inside its page, and *meta preambles* restating the bridge itself.

No third advisory wired, recorded here in its place: verb tells would have fired zero times even before the audit, and the actual failure shapes are not regex-detectable at the precision bias the note-verb advisory's history demands (a topic list is indistinguishable by pattern from a legitimate terse label). `enacts` notes remain protected by the convention's example pair and by audit. What was lost: several notes' author-shorthand compression, and any standing mechanical tell — drift in future `enacts` notes only surfaces at the next audit.

### 2026-07-18 — `surveys` narrowed to members only; the collection's conceptual neighbourhood rides on `related`

Surfaced by the related-residue audit's bare-edge pass. Navigation overview — the only page sourcing `surveys` — held seven edges to non-members alongside its nine navigation models: three noted (information-architecture, interaction, agency — orientation commentary about what the models manifest and imply) and four bare (malleability, deep-linking, searching, command-menu). The question: may a collection survey its conceptual neighbourhood, or only its members?

Decision: members only. `surveys` is the member–collection relation (`skos:member`), and its value is preserving membership altitude as a distinct claim; stretching it to neighbourhood commentary drifts it back toward the generic upward link the type was minted to escape. Fuzziness is welcome *within* the member axis (hybrid-patterns is a fuzzy navigation model) but not across kinds — a quality or a seeking pattern is not a fuzzy member of a collection of navigation models.

The sweep: the three noted edges re-typed to `related`, notes kept verbatim. The four bare edges removed — searching's connection survives as its noted `precedes` (sets-up clause) toward the collection; deep-linking and command-menu are already noted `complements` on the individual models; malleability's topology-switching claim lives on overview-detail's `enacts`.

What was considered: allowing noted non-member surveys as "orientation edges" (rejected: the notes are real claims, but the type would then carry two relations — membership and commentary — undoing the Winston et al. separation the three part–whole relations rest on); minting a separate orientation type (rejected: three edges on one page is no basis for a type; `related` holds them without loss). What was lost: nothing structural — the commentary keeps its notes on `related`; only the implication that the collection page is *authoritative* about those three neighbours, which `surveys` never actually granted.

### 2026-07-12 — `serves` minted: pattern → foundation participation; foundation reading guide grows to four arms

Resolves open question 8 through the research gate (`research/pattern-foundation-serves/`). The residual pattern–foundation adjacency in `related`/`complements` was one recurring authored shape — a pattern at a named *station* of a foundation's anatomy — fitting none of the existing types. Definition, formal grounding, and the four-arm reading guide live in the body (§serves, §instantiates). Sweep: 11 `serves` + 2 `enables` (the prose material arm) authored out of `related` (−8), `complements` (−4), `precedes` (−1); `related` share 24.0% against the 25.3% baseline. The SKOS subproperty reading was added in the same pass, and the `instantiates`/`serves` overlap watch opened.

Held, still pending: interaction's nine navigation-model `related` rows are suitability conditions — filed as a decision-tree candidate on interaction's page; foundation↔foundation pairs join the latent quality↔quality set awaiting their own treatment (the prose pairs are `enables`-material candidates when it comes).

What was considered (rejections that stay binding): declaring the residue honest `related` (the notes kept making the same claim — the sweep-yield tell); stretching `enables` to cover participation (participation is not parthood in the very taxonomy the part–whole relations stand on; shunts into existing types lose part of the claim — the `hosts` history); neutral names `draws-on`/`grounded-in` (fail the strip-the-range test: remove the foundation-only restriction and nothing remains — the signature of a pseudo-type); reifying stations as first-class anchors, D&S-style (pre-legislates an anchor vocabulary; recorded as the road not taken in the research note in case a future query layer needs it); a foundation-side `served-by` alias (deferred — a changelog decision if a claim ever needs foundation-side voicing). What was lost: station-level queries read prose, never match; a foundation-side insight about a pattern must be authored on the pattern's page or wait.

### 2026-07-11 — Structural auto-typing retired: untyped body links are citations

The quality-target and collection auto-typing channels retired; I7 now reads: no edge from an untyped body link — explicit channels and judgement homes are the only sources. The corpus had already voted (2 of 116 `enacts` edges from the channel, both fresh-page traps; the collection channel had zero uses). Predictability doesn't make minting deliberate, and a passing or negative mention would still mint a claim — the same claims-vs-citations line as `realised_by`. The entailment argument (see the SKOS subproperty reading) stands against ever minting a type from a target's role. What was lost: quality coverage no longer accrues free from prose — a new page must declare its `enacts` or the quality goes unclaimed until a sweep notices.

### 2026-07-11 — `realised_by` minted as the realisation claim's home; prose ComponentRefs demote to citations

Frontmatter `realised_by:` (Storybook docs ids) is the single authorable home; the extractor emits `realisedBy` node metadata; the cross-reference validator gates every id at build. Prose `<ComponentRef>` is a citation, claim-free — only an authored field can tell realisation from citation, which is why scraping the mapping from ComponentRef occurrences was rejected. What was lost: the claim no longer lives beside the prose telling of *how* the component realises the pattern.

*Backfill* (2026-07-12): 112 ComponentRef mentions across 49 pages sorted — 15 pages carry claims (24 ids), 36 citation-only. The reusable rules: within a `## Related components` list a member is a claim only when it *is this pattern's component*, and a debatable member stays citation; quality pages are *enacted*, not realised; collection pages survey; a foundation gradient exhibits its components. Multi-realiser claims are crisp when the page is structured around the set (notification, bounded-choice). Component-doc `<PatternRef>` back-links were swept as a detector and corroborated the pass; formalising them as a rendered channel stays out of scope. Four components left orphan deliberately: avatar, list, range, textarea — range→bounded-choice and textarea→data-entry are the nearest patterns, both unclaimed (bounded-choice is framed around discrete sets; Input's family reads as a build-on primitive).

### 2026-07-10 — Realisation leaves the edge vocabulary; `enables` narrowed to within-graph composition; hosting sweep

`enables` now means pattern composition within the language only; a component implementing a pattern is a cross-dataset reference (§Component realisation). The flagship Button → Form example was unauthorable (Button is not an entry in the language) and was replaced with in-graph pairs. Mechanical guards added: the extractor warns on `rel=` on `<ComponentRef>` (a channel that always drops is a trap) and on relationship targets that name no pattern — the first run surfaced four component-aimed dangles, migrated to prose citations. Hosting sweep: `hosts` 4 → 7 (form hosts good-defaults, data-entry, validation); held — conversation and inline-interface as data-entry's other hosting surfaces stay `related` plus prose until those pages own the claim. What was considered: minting component nodes (rejected — re-imports the dataset the workspace split removed); a `realised-by:` frontmatter channel (rejected here for lack of a consumer; reversed 2026-07-11 once the machine consumer was weighed).

### 2026-07-10 — Situations land: node-side constructs, `hosts` minted, judgement homes emit their edges

The situation-construct decision and hosting resolution (research gate: research/situation-constructs/2026-07-10.md — the entry the epistemic stance's consumer contract points at). Constructs, rules, and the `hosts` definition live in the body (§Situations, §hosts). Landed together: the two judgement homes (node situations, decision trees) emit their edges and edges never carry authorable condition text; decision-tree leaf maps moved from the extractor's hardcoded constant into `decision-trees:` frontmatter; the `.profile.ts` sidecar experiment (eleven pattern-side, six component-side, plus `pattern-profile.ts`) migrated into frontmatter and was deleted — keeping both would re-create the two-homes problem inside the node. The Retirement section was added, and state-disabled's initiating situation was written as the negative-space specimen: a last-resort claim is an initiating situation told as pattern-history, no new vocabulary needed.

Notable decompositions: the deletion→undo bundle (one judgement previously smeared across three carriers) and the assistance escalation ladder — which also settled the Autocomplete/Good-defaults gap: the pair's relation is sequence-under-condition, not taxonomy, and the doc's `instantiates` example became Command menu → Searching.

Three repairs from the precedes sweep's reflection: `enables` softened to "incorporates or builds on" (aligning text with settled practice — Winston's component–integral relation doesn't require necessity); the foundation tiebreaker written down (later grown to four arms); the note-verb advisory added — precision-biased tells for notes whose phrasing claims a different type than the stored one, with deliberate holds kept as standing advisory lines (the line *is* the record that the hold is deliberate).

What was considered (all rejected, all binding): condition fields authorable on edges (the scatter failure every discipline that tried it documented); a corpus-wide controlled dimension vocabulary; `sets-up` clauses that merely annotate separately-authored edges; expressing hosting as resulting clauses only; an initiating-side `follows-from` mirror of `sets-up` (one authorable end keeps one home per judgement). What was lost: the strict-dependency reading of `enables` is no longer readable off the type — if that distinction ever earns its keep it is a note convention, not a new edge type.

### 2026-07-10 — Precedes sweep: all 93 edges audited against the generative-sequence definition

24 edges asserted sequence where the real relation was taxonomic (the `Precursors`-heading signature — "the broader X" notes), compositional ("container"/"enabler" notes), horizontal, or mediated (four dropped; their two-hop paths already existed). 69 kept, including the foundation substrate chains. Durable lessons: a note's phrasing is the tell for the true type; mediated pairs decompose per "look for a mediator"; a collection as a `precedes` target survives only when the note is condition-bearing (searching → navigation-overview's "fallback if search fails"). Advisory movement: same-altitude `instantiates` 4 → 7, all deliberate genus–species claims.

### 2026-07-10 — `group` emitted as node metadata; voicing rule promoted to the authoring model

The frontmatter `group` facet now lands on graph nodes — the lightweight form of open question 3's direction (groupings as set memberships, not edge types); emitting it as `tags` was rejected to avoid pre-empting that question. The notes-voicing rule moved into the authoring model and `.claude/rules/pattern-content.md`.

### 2026-07-10 — Part–whole hygiene: conversational cluster re-typed, audit fixes, two extractor advisories

The 13 conversational primitives' unprincipled `enables`/`instantiates` split resolved to `enables` throughout — an abort is a constituent pattern *within* a conversation, not a kind of it. A full audit of `instantiates`/`enables` fixed nine more mistypes (including the last purist-stance leak: `collaboration-foundation composed-of privacy` → `enacts` — a quality is a lens, not a component). Two advisories added beside the axis check, both suggestion-grade per the epistemic stance: *mixed cluster* (a node targeted by both `enables` and `instantiates` from same-`group` sources) and *notes voicing* (a single-noted directed edge whose note names neither endpoint; `enacts` exempt — no reverse reader).

### 2026-06-25 — Per-direction notes on directed edges

`incomingNote` added; `addEdge` changed from skip-on-duplicate to merge, recovering 8 both-ends-authored edges whose second note was silently dropped. The mechanism now lives in the authoring model.

### 2026-06-25 — Multi-type pair cleanup

65 → 12 multi-type pairs (a pair asserting `precedes` and `complements` at once asserts two incompatible things). The dedup now drops `related` when a stronger type exists in either direction; `recommends` does not subsume `related` (routing, not association). Residual, unresolved: two symmetric-vs-symmetric mismatches (`annotation ↔ link-preview`, `bounded-choice ↔ autocomplete`).

### 2026-06-24 — Per-direction notes on symmetric edges

Both endpoints may author a symmetric edge, each with its own note; the renderer shows the near-side note. Constraint borrowed from the backlink literature: per-direction notes earn their place only when *authored and distinct* — never auto-filled. Reifying edges (RDF-star, Topic-Maps named roles) rejected as over-engineering.

### 2026-06-24 — Collaboration cluster re-typed

The pre-migration `### Precursors` heading had flattened heterogeneous relations into `precedes`; three edges re-typed by meaning. The entry's known follow-up became the 2026-07-10 corpus sweep.

### 2026-06-23 — Quality pages carry no pattern list (purist stance)

`RelatedPatterns.astro` renders nothing on `role: quality` pages: a quality is a diagnostic lens, and enumerating everything legible through it trends toward *all patterns* — the length of such a list is the symptom of a category error, not a sizing problem. Of 52 quality→pattern `related` edges: 28 were duplicates of existing `enacts`, 18 migrated to pattern-side `enacts` with Q-lens labels, 6 dropped as not enacts-shaped. The 25 quality↔quality `related` edges stay latent, awaiting the open-question-5 treatment. The stance is one-directional: pattern-side quality prose stays, and the resulting prose + `enacts`-line redundancy is accepted (reading vs. graph-navigation — the renderer suppresses neither). Considered and rejected: a curated "characteristic patterns" list per quality (still a list); suppressing the generated line when a body section covers the target (couples the renderer to prose structure).

### 2026-06-23 — Typed relationships: explicit authoring replaces heading-text inference

Heading-text inference (`HEADER_TYPE_MAP`) replaced by the three explicit channels; direction fixed by the relation name via the alias table. Why: prose edits silently mutated the graph; authored-not-inferred satisfies Shipman's formality-trap criterion — opt-in and predictable. All 818 edges migrated by script. What was lost: thematic tags from `### ` subcategory headers — partially recovered as `group` node metadata (2026-07-10).

### 2026-06-22 — `umbrella` role split into `pattern` + `collection`; `surveys` = `skos:member`

A composite pattern is the authoritative source for its own pattern, so `umbrella` ("not the source for one pattern") was false for half its members. Component–integral, genus–species, and member–collection separated per Winston et al. — now §The three part-whole relations. `umbrella` remains a deprecated extractor alias. Full reasoning: `research/umbrella-role-scale/`.

### 2026-04-25 → 2026-05-02 — Early scaffolding (condensed)

- *2026-05-02*: `surveys` edges formalised umbrella territories (chosen over `gathers` and `frames`); node-level `role` metadata landed.
- *2026-04-30*: "projection" terminology retired for "umbrella" — the term conflated Dorian Taylor's data→document sense with authored higher-altitude surveys.
- *2026-04-27*: `recommends` extraction from four decision trees. Four trees deferred — BarChart (list-shaped), Overflow (CSS-technique leaves), Form's "Choosing an input" (compound families), Localization (layer assemblies); if pages emerge for those leaves, the leaf map is the place to update.
- *2026-04-26*: manual labels moved into MDX (the graph file carries no authored content); `gloss` merged into `label` — a `labelSource` field can recover the authored/extracted distinction if a consumer ever needs it.
- *2026-04-25*: initial ten types drafted from the header sweep. Rejected then, still binding: inverse pairs across the board (reverse traversal is a query concern, not a data concern); merging `tangential` into `related` (the author signal was real); a single `composes` covering `enables` + `instantiates` (loses part/whole vs. genus/species).
