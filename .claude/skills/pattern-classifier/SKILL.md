---
name: pattern-classifier
description: Reason about how to integrate new knowledge into the pattern library — articulate what a pattern is, map it against what exists, classify it, and enrich it with research. Use when adding patterns from practice or research, reorganising existing patterns, filling gaps, or deciding whether to split, merge, or restructure. This is the reasoning process; for the mechanics of moving files, use pattern-migrator.
argument-hint: "[pattern name, topic, or paper reference]"
---

# Pattern classifier

A structured conversation for integrating patterns into the library. Three phases: *articulate & map* (what is this, does it already exist?), *classify* (where does it go, and what does it connect to?), *enrich* (research, write, update neighbours).

## Conceptual foundations

The reasoning is grounded in the project's `docs/` knowledge base. Read the documents below before proceeding if you haven't already in this conversation. They're the canonical source — this skill summarises but doesn't restate them.

- `docs/language/pattern-definition.md` — operational test for what counts as a pattern (vs. mechanism, contract, observation, anti-pattern, projection). The minimum-pattern checklist lives here.
- `docs/language/relationship-vocabulary.md` — describes relationships between patterns.
- `docs/language/conceptual-glossary.md` — working definitions of pattern, centre, generative move, quality, semilattice, suggestion-grade, etc.
- `docs/project/storybook-taxonomy.md` — the answer to "where does a new pattern go?" The sidebar projection is Activity Theory levels (operations / actions / activities), with actions sub-grouped by intent lifecycle stage. Atomic Design persists as queryable metadata.
- `references/semilattice.md` — the pattern space is a semilattice, not a tree. Every tree placement is lossy; the question is which loss is least harmful. Multiple projections, not a better tree.

Two generated JSON files give queryable views of the library:

- `src/pattern-graph.json` — nodes (id, title, category, path) and *typed* edges (source, target, type, optional label, provenance, situational hints). Edge types follow the relationship vocabulary above. Use for neighbourhood scanning and to see what a candidate pattern would connect to.
- `src/activity-levels.json` — per-node metadata: `activity-level`, `lifecycle-stage`, `atomic-category`, `mediation`. Use for classification checks: see how neighbours are classified, spot level mismatches, find patterns in the same lifecycle stage.

## Scope: what belongs in this library

This library is *design repertoire* — generative interaction moves between actor and system that a designer can recognise, name, and reach for when shaping an interface. A pattern is a *move*, not a catalogue item. Before classifying, verify the incoming knowledge is repertoire rather than one of the adjacent knowledge types that inform or use patterns but live elsewhere.

### The pattern test

`pattern-definition.md` carries the operational test. In short: a pattern is a named, evidence-seeking interaction move that resolves a recurring human situation by balancing forces in a stated context, abstracting practice at a reusable level, producing a centre or affordance, carrying rationale and consequences, and linking to other moves. Most components are *not* patterns; a control qualifies only when its documentation captures a complete interaction contract (semantics, keyboard behaviour, focus model, state behaviour, use context).

The definition is *evidence-seeking*, not evidence-proven. Seeds are fine as long as their maturity is legible. A seed names a suspected recurrence; a mature pattern has examples, rationale, consequences, and relationships that survive use.

### Where non-moves go

If the candidate isn't a generative move, name what it actually is and route it accordingly:

- *mechanism* — component, primitive, control, visual element, implementation substrate
- *quality* — an experiential dimension (Agency, Learnability, Conversation, …) → `src/stories/qualities/`
- *foundation* — theory, model, principle, or material substrate → `src/stories/foundations/`
- *projection* — an umbrella or sensemaking page that gathers a territory but isn't the authoritative source for one move
- *variant* — a concrete instantiation, story variant, screenshot, prototype, product case → lives inside the pattern it illustrates

Surface the role to the user with a recommendation for where the knowledge belongs. Don't promote to a pattern page just because there's nowhere obvious to put it.

### When it's ambiguous

Some material genuinely straddles roles. Signals:

- *If it has an observable interaction structure* (actors do something, the system responds in a recognisable way that produces a centre) → it has a *move* dimension, even if it's also a quality or foundation. Document the move; reference the other role.
- *If it only makes sense as a modifier of other patterns* → it's a quality or foundation, not a move.
- *If it's primarily a framework for organising other patterns* → it's a projection. It might warrant a foundations or umbrella page, but not a pattern page.

When genuinely uncertain, surface the ambiguity to the user rather than forcing a classification. The skill is a conversation, not a gate.

## Entry points

The process adapts to how the work arrives. Three common scenarios:

### From practice

"I designed an interaction and want to document it for future reference."

Articulate the move: what recurring human situation does it act on, what forces does it balance, what centre does it produce? Then map against existing patterns — what you built may already have a name, or it may be a *combination* of existing moves rather than a new one. Only proceed to classification if mapping reveals something genuinely unrepresented.

### From research

"I read a paper and want to integrate its findings."

Extract: what are the key findings, frameworks, design implications? Map each to existing patterns it informs. The most common outcome is *enrichment* — updating existing patterns with new sections, design considerations, or references — not creating new patterns. Only create a new pattern if the research describes a move that has no home in the current library.

### From a gap

"There's an established pattern that's missing from the project."

Verify: search broadly (names vary; the concept might be covered under a different term or absorbed into a broader pattern). Check the graph neighbourhood where you'd expect it. If the gap is confirmed, articulate the move clearly before classifying it.

---

## Phase 1: Articulate & map

### Articulate

Write a one-sentence relational definition: what does this move *do* in the relationship between actor and system? Avoid implementation descriptions ("a dropdown that…") — describe the transformation ("narrowing a set of options through…", "differentiating deliberate action from accidental through…"). The phrasing should foreground the centre the move produces.

If the move resists a clean one-sentence definition, it may be multiple moves or an aspect of an existing one.

Then run the minimum-pattern test from `pattern-definition.md`: can the page answer most of the eight questions (recurring situation, problem/tension, forces, invariant core, abstraction level, centre/affordance produced, evidence, contextual variables)? If most answers are missing, the candidate is a seed — record it as such; don't dress it up.

### Map against existing patterns

Search broadly. Check:

- Patterns with similar names or synonyms
- Patterns that serve the same human situation
- Patterns whose Related Patterns sections describe this concept without it having its own page
- Commented-out sections (`{/* */}`) in existing patterns that sketch this territory
- The graph: nodes whose neighbourhood overlaps with the candidate's expected neighbourhood

The mapping produces one of five outcomes:

1. *Already exists* — the move is covered. The work is enrichment. Skip to Phase 3.
2. *Partially covered* — aspects are spread across multiple patterns, but the unifying move isn't represented. Consider whether a new pattern, an umbrella/projection, or just better cross-references would serve best.
3. *Distinct and new* — genuinely unrepresented. Proceed to Phase 2.
4. *Existing pattern needs splitting* — mapping reveals an existing pattern is too broad and this concept deserves separation. Proceed to Phase 2 with attention to what stays and what moves.
5. *Not a move* — the candidate is theory, method, quality, foundation, concept, or implementation convention rather than a generative move (see *Where non-moves go* in Scope). The work is referencing it from the patterns it informs, or directing it to where it belongs. Surface this with a recommendation.

## Phase 2: Classify

Work through these questions in order. Each may change the answer to later ones. Present findings to the user as you go — this is a conversation, not a report.

### 1. Neighbourhood: what does this connect to?

Before deciding *where* something goes, understand *what it touches*. Patterns are nodes in a typed graph; their meaning comes from how they combine.

For each candidate edge, name *which type of relationship* it would be (from `relationship-vocabulary.md`):

- `precedes` / `follows` — applying A produces a centre on which B can subsequently act (generative sequence, not just temporal order)
- `enables` — A is a mechanism/primitive that B incorporates
- `instantiates` — A is a specialisation of a more abstract pattern, principle, or foundation B
- `complements` — A and B enhance compatible centres; co-deployed but independent
- `alternative` — different transformations of the same starting structure
- `recommends` — A's decision tree routes to B in some situation (carries situational hints)
- `enacts` — A is a move whose effect is legible in quality Q's lens
- `related` — catch-all; prefer a more specific type when one fits

### 2. Granularity: one pattern or several?

The test is *graph topology*, not document length.

Split when:

- The patterns have distinct neighbourhoods — different related-patterns sets, different use contexts, different design concerns
- Each pattern could be meaningfully linked to *from* other patterns (other patterns would want to reference autocomplete specifically, not "assisted task completion" generically)
- The patterns sit at different AT levels or lifecycle stages

Keep unified when:

- The patterns are always used together (compositional binding)
- The relationships are mostly shared — other patterns link to the group, not to individual members
- Splitting would create nodes too thin

When splitting, also decide the umbrella strategy (step 5).

### 3. AT level: where does attention live?

Apply Leontiev's hierarchy:

- *Operation* — automatic, condition-driven, becomes invisible through habituation. Test: would a skilled user describe this as something they "do", or something that "just happens"?
- *Action* — conscious, goal-directed, deliberately chosen. Test: does this require focal awareness and a goal?
- *Activity* — motive-driven, strategic, coordinates multiple actions over time. Test: does this describe *why* and *how* work proceeds, rather than *what* the actor does in a moment?

Watch for level ambiguity:

- Some moves shift levels through habituation (autocomplete starts as conscious action, becomes operational). File where the *design challenge* lives — if the design work is about making it invisible, it's operational.
- Some moves straddle levels (toolbar is both operational affordance and action container). The tree picks one; tags and graph edges capture the other.
- Cross-cutting concerns that *describe* levels rather than sitting at one belong in qualities or foundations.

### 4. Lifecycle stage (actions only): where in intent resolution?

If the move is an action, determine which stage of the intent lifecycle it primarily serves:

- *Seeking* — retrieving and gathering information
- *Evaluation* — assessing relevance and value
- *Sense-making* — synthesising and organising insights
- *Application* — taking decisions, completing tasks
- *Coordination* — multi-actor alignment

Many actions serve multiple stages. The tree picks the *primary* stage; add `lifecycle:*` tags for secondary stages. If a pattern serves all stages roughly equally, that's a signal it might not be an action — reconsider AT level.

### 5. Umbrella strategy

Three kinds of umbrella exist in the system. In role-vocabulary terms: a standalone umbrella is a *move* that also frames children; a structural umbrella is a *projection*; an implicit umbrella is no node at all.

*Standalone umbrella* — both a move in its own right and a container for sub-patterns. Example: Suggestion is a meaningful move (system-generated recommendations producing a centre of "considered alternatives") that also frames sub-topics. Test: does the umbrella have its own forces, consequences, and neighbourhood beyond just aggregating the children?

*Structural umbrella (projection)* — exists only to frame and connect sub-patterns. Example: Navigation overview frames the navigation models but isn't itself a move you'd apply. Test: would removing it and relying on cross-references between the children lose something? If the umbrella's value is purely "these things form a group", cross-references and tags might suffice.

*Implicit umbrella* — the relationship between patterns is real but doesn't need its own node. The connection lives in cross-references and graph edges. Test: would anyone navigate *to* this umbrella, or would they always go directly to a specific sub-pattern?

When an umbrella is warranted, decide its placement:

- A standalone umbrella gets its own AT level and lifecycle stage like any other pattern
- A projection lives alongside its children (e.g., Navigation overview in `actions/navigation/`)
- Consider whether the umbrella's Meta title creates a Storybook folder grouping or whether children sit as siblings with cross-references

### 6. Tags and metadata

Every pattern needs:

- `activity-level:operation|action|activity` — AT level
- `atomic:primitive|component|composition|pattern` — compositional projection (still required by `storybook-taxonomy.md`, though decisions in this skill rarely turn on it)
- `lifecycle:seeking|evaluation|sensemaking|application|coordination` — for actions, primary stage (and secondary via additional tags)
- `mediation:individual|collaborative` — whether the pattern involves multiple actors

Consider domain tags (e.g., `ai`, `navigation-structure`, `async`) for graph clustering — but only when they emerge from existing clusters in the graph, not invented speculatively.

### 7. Graph impact

Before finalising, consider the topology:

- Which typed edges does this create? (The graph is derived from cross-reference headers and Mermaid trees in MDX, so this is really asking: what will Precursors / Follow-ups / Containers / Foundation / Complementary / Tangential / Alternatives / Decision-tree / quality references look like?)
- Does this node clarify the graph or clutter it? A node with 2 edges might not justify its existence. A node with 20 edges might be too broad and need splitting.
- Does this create or join a meaningful cluster? Check whether the neighbourhood forms a recognisable group or scatters across unrelated areas.
- Sanity-check the axis of each edge against the altitude difference between its endpoints. Surface anomalies (an `instantiates` within one altitude, a `complements` across two) for the user — they're findings, not failures.

### 8. Propose placement

Synthesise the answers into a concrete proposal:

- File path(s) and Meta title(s)
- Tags
- Umbrella strategy (if applicable)
- Key edges, *typed* — at minimum precursors (`precedes`/`follows`), mechanisms (`enables`), foundations (`instantiates`), complementary moves, alternatives, and the qualities the move enacts
- Any existing patterns that need updating (new cross-references, absorbed content, redirects)

Present this as a recommendation for the user to evaluate, not a fait accompli. The semilattice means there's always more than one defensible placement — name the trade-offs.

## Phase 3: Enrich

Once the destination is clear — whether it's a new pattern or an update to existing ones.

### Research

Before writing, gather substance:

- Search for academic references (CHI, CSCW, DIS, UIST proceedings; HCI journals)
- Check practitioner sources (Nielsen Norman Group, design-system documentation from major platforms)
- Look for named implementations (how do Salesforce, Google, Apple, etc. handle this move?)
- Identify tensions and trade-offs — these are more generative for design than best practices

For larger research syntheses, the `research` skill produces a committed `research/<slug>/` folder with a persistent query and dated synthesis notes that can later be promoted into `references/` and `docs/research/references.md`.

Research should inform the move's design considerations and the *forces* it balances — not just fill a references section.

### Write or update

For new patterns, follow the documentation standards in `.claude/rules/documentation.md`. Focus on:

- The relational definition (one sentence after the `# Title`) — phrased as a move that produces a centre
- Forces, consequences, and design considerations structured around tensions and trade-offs rather than prescriptive rules — these are what make patterns generative
- Cross-references woven into prose, not just listed in Related Patterns
- Headers that the extraction script will pick up (`Precursors`, `Follow-ups`, `Containers and primitives`, `Foundation`, `Complementary`, `Tangentially related`, `Alternatives`) so edges land in the graph with the right type

For enrichment of existing patterns, the changes might be:

- New sections (e.g., adding "Fixation risk" to Suggestion after reading a paper)
- Updated forces or consequences based on new evidence
- Additional references
- New typed cross-references to or from the updated pattern
- New `enacts` links from the pattern to qualities its effect is legible in

### Update neighbours

Adding or changing a pattern changes the topology. Check:

- Do any existing patterns need new cross-references to this one?
- Do overview pages (e.g., `actions/Overview.mdx`) need updating?
- After writing, regenerate the graph data: `npx tsx scripts/extract-graph-data.ts`

## What this skill is not

- Not a mechanical migration tool (use `pattern-migrator`)
- Not a documentation template (see `.claude/rules/documentation.md`)
- Not a style guide (see `.claude/rules/documentation.md` for writing conventions)
- Not a gate — the user makes the final call. This skill surfaces considerations and trade-offs; it doesn't enforce rules. The system is a semilattice; any tree placement is a compromise, and reasonable people can disagree about which compromise is best. Edges are suggestion-grade hints, not predicates; the same epistemic stance applies to classification decisions.
