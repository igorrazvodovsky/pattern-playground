# Typed edges for the pattern graph

## Context

The pattern graph (`src/pattern-graph.json`) has 131 nodes and 773 edges, all untyped `{source, target}`. But 48 of 120 MDX files with `## Related patterns` sections already use `### ` subcategory headers (Precursors, Follow-ups, Complementary, etc.) that signal relationship type. The extraction script (`scripts/extract-graph-data.ts`) ignores these signals, and also has a bug where commented-out links (`{/* ... */}`) are included in the graph.

### End goal

The end goal of typing is to make the graph usable as a *knowledge surface for design generation* — a structure an actor (LLM agent or a human reader thinking generatively) can draw on when proposing design moves. Visualisation is one consumer; the primary value is in the data being structured enough to support reasoning about how patterns combine.

### Two framings that shape the plan

1. *Suggestion, not matching.* The library is not mature enough to support structured retrieval. Edges, tags, and decision-tree conditions are all *hint-grade* — they describe what has been useful in similar situations, not predicates to be matched against a query. An actor uses the graph as context for judgement, not as a lookup table.

2. *Patterns as moves in a design vocabulary* (Christopher Alexander). The library draws on two phases of Alexander's work at different stages of realisation. Currently it operates in the *Pattern Language register*: a navigational vocabulary of typed moves and relationships, hint-grade rather than rule-grade, where design reasoning is sequential and associative. The aspiration is toward the *Nature of Order register*: structural properties that function as recursive production rules, giving design a grammar. The library is not there yet — getting there would require discovering interaction-design analogues of Alexander's structural properties from empirical patterns in the data, which requires more corpus than currently exists. The typed edges and quality vocabulary are the scaffolding for that discovery. See `docs/relationship-vocabulary.md` for the full articulation of the two-stage trajectory.

These two framings are compatible and reinforcing. The first is an epistemic claim about the data (incomplete, fuzzy, hint-grade). The second names where the library sits on a longer trajectory (Pattern Language now, aspiring toward Nature of Order). Together they push in two directions: the data should be looser and the use should be transformative.

### Plan scope

This plan covers Phase 0 (foundation and exploration — vocabulary doc plus two gating experiments) and Phase 1 (typed edge extraction, including `enacts` edges). Phase 2 (visual rendering) is deprioritised — kept as a deliverable but no longer blocking. Phase 3 (decision tree extraction) is reframed: not as parsing for structured conditions, but as extracting situational hints that travel with `recommends` edges. Phase 4 (query API) is sketched but not committed.

---

## Phase 0 — Foundation and exploration

Phase 0 does three things together: it drafts the relationship vocabulary, and runs two cheap experiments that test whether the vocabulary is load-bearing when applied to real pattern pages and real decision trees. The experiments are gates, not parallel strands. Their outputs feed back into the vocabulary doc's changelog before any extraction work begins.

The three pieces answer one question from different angles — is the vocabulary we drafted useful when applied? B (generative profiles) tests it from the pattern-page side. C (dimension inventory) tests it from the decision-tree side. A (the vocabulary doc) is what they're testing.

Phase 1 starts only after the gate. If either experiment surfaces something that breaks the current vocabulary, Phase 1's extraction spec gets revised before code changes begin.

### A. Relationship vocabulary

*Status*: drafted at `docs/relationship-vocabulary.md`

Before implementing typed edges, the vocabulary itself needs a formal definition: what each relationship type means, its directionality, inverse pair handling (where applicable), SKOS alignment (where natural), and how each type should be read under the generative-moves framing.

The vocabulary document defines ten relationship types: `precedes`, `follows`, `enables`, `instantiates`, `complements`, `tangential`, `alternative`, `recommends`, `related`, and `enacts`. It also defines the concept of a *generative profile* (operates-on / produces / enhances) as node-level metadata.

Key decisions captured in the vocabulary doc:

- *Only `precedes`/`follows` form a true inverse pair.* `enables` and `instantiates` are distinct directed relationships (compositional vs. taxonomic), not inverses. Reverse traversal is handled by graph queries, not by storing inverse edges.
- *Conditions on `recommends` edges are situational hints, not predicates.* They preserve the original decision-tree question phrasings rather than being canonicalised. The library is not mature enough for a controlled vocabulary of conditions, and "suggestion not matching" is the right framing for how an actor should use them.
- *`enacts` is a new pattern → quality relationship*, promoting prose references from pattern pages to qualities pages into typed edges. This is the bridge between patterns-as-moves and the qualities they strengthen.
- *SKOS alignment is documented where it fits* (instantiates → skos:broader, complements/related → skos:related, alternative → skos:closeMatch) and explicitly noted where it doesn't (precedes/follows, recommends, enacts have no SKOS equivalents).

A also establishes a *Changelog* section at the bottom of the vocabulary document — a running record of why types were added, merged, renamed, or retired, what alternatives were considered, and what was lost in each decision. The gate outcomes from B and C append the first entries. Every subsequent vocabulary change appends an entry. The log exists because the vocabulary is provisional and will keep evolving as the library grows; making its construction visible is part of treating classification as a living artifact rather than a closed specification. Compare Bowker & Star, *Sorting Things Out*: "the only good classification is a living classification."

*Work*: review and finalise the vocabulary document, treating its open questions as inputs to B and C. No code changes.

### B. Generative profile annotations (experiment — gate)

For each selected pattern, add a small *Generative profile* subsection to the MDX file with three prose slots:

- *Operates on*: what kind of structure or situation the move acts on
- *Produces*: what new centre or affordance the move creates
- *Enacts*: which quality dimensions the move's effect is legible in (informal references, written as prose — not `<LinkTo>`. At this stage we want to see which quality words the author reaches for, not whether they match existing quality pages). Named to match the `enacts` edge type — see the vocabulary doc for how this connects the Alexandrian process vocabulary to the library's evaluative frame.

No controlled vocabulary, no normalisation, no soft length rule — let each slot be whatever length it needs. If a profile balloons, note that as data; the gate is about whether the frame fits, not whether the author is disciplined. Place the subsection near the top of the pattern page, after the fun meter and definition.

Write profiles without first reading the pattern's *Related patterns* section. If operates-on/produces ends up restating what *Precursors* or *Complements* already encode, the profile is redundant with the edge types Phase 1 will extract. Writing blind surfaces that overlap.

*Pattern selection — three clusters of different character.*

A flat spread across altitude tests range but cannot detect the most important failure mode: whether the frame *differentiates* near-neighbours. If four data-entry patterns all collapse into "operates on: user input", the vocabulary is failing where it most needs to work. Three clusters of different character triangulate: within-cluster differentiation, between-cluster contrast, and some signal on whether the frame fits some characters of pattern better than others.

- *Cluster A — Form and its decision tree* (tests whether the profile vocabulary and the decision tree are saying the same thing in different notations): [Form](../../../src/stories/actions/application/Form.mdx), [Select](../../../src/stories/operations/Select.mdx), [Checkbox](../../../src/stories/operations/Checkbox.mdx), [Autocomplete](../../../src/stories/operations/Autocomplete.mdx), [Input](../../../src/stories/operations/Input.mdx). The selection principle is the tree itself — each pattern sits at a different branch of Form's "Choosing a control" tree (single/multi-select, option count, searchability, confirm-need, free-form vs. bounded). The hypothesis being tested: *a decision tree is a generative profile expressed as a diagram* — its branches are operates-on dimensions, its leaves are produced moves. If that's right, Form's own profile will restate its tree in prose (a redundancy finding that would reshape Phase 3), and the leaves' operates-on slots will recover the tree's discriminating dimensions (option count, confirm-need, cardinality). If profiles run orthogonal to the tree — reaching for latency, data shape, attention, social context — then tree and profile are complementary and both earn their keep. Both outcomes are informative; the gate asks which one we see.
- *Cluster B — action feedback* (moderately tight, strong `enacts` pull): [Undo](../../../src/stories/operations/Undo.mdx), [Notification](../../../src/stories/actions/coordination/Notification.mdx), [Toast](../../../src/stories/operations/Toast.mdx). These all appear after something happens; the test is whether the frame differentiates by what they operate on (the action, the user's attention, the system state) and whether `enacts` reaches for different qualities (forgiveness vs. awareness vs. acknowledgement) or the same one.
- *Cluster C — altitude* (tests differentiation at high altitude): [Conversation](../../../src/stories/activities/Conversation.mdx), [Onboarding](../../../src/stories/activities/Onboarding.mdx). Both are activity-scale and both are concrete at that altitude (Conversation has a clear interactional shape; Onboarding is time-bounded with a clear subject). The test is twofold: (a) does the frame still say something non-vacuous at activity scale, and (b) does it differentiate two activity patterns from each other, or do both collapse into "operates on: the user" / "produces: familiarity with the system"? Picking two well-bounded activity patterns rather than one activity and one composition means a collapse here is a real ceiling signal, not an artefact of target vagueness.

*Ordering within the sitting*: start with Cluster A (cheapest, most likely to expose close-range collapse). If A already resists, stop — the frame needs revision before burning the other clusters on it. Otherwise continue to B, then C.

*Resistance log* (required output, not just implicit in the gate): for each pattern, write one sentence noting what resisted — a slot that felt forced, a concept the frame didn't have a word for, or a pattern where all three slots said the same thing. Capture in the changelog entry, not in the MDX files.

*Bound*: one sitting, ~8 patterns, no iteration on the framing mid-way. If it doesn't work in one pass, that's the signal.

*Gate criteria*: (a) for Cluster A, do the profiles recover Form's tree dimensions, run orthogonal to them, or something mixed? (b) for Cluster B, do profiles differentiate patterns that all appear after an action, and does `enacts` reach for distinct qualities? (c) for Cluster C, does the frame still say something non-vacuous at activity scale, and does it differentiate two activity patterns? (d) across clusters, does the frame fit some characters of pattern better than others? (e) did any pattern surface a relationship dimension the vocabulary doesn't name? Outcomes feed into the vocabulary doc's changelog and may revise Phase 1's spec (and Phase 3's, if Cluster A surfaces the redundancy finding) before extraction begins.

*Files modified*: 9 MDX files in `src/stories/` (one per pattern above). No script or schema changes at this stage — profiles exist only in MDX prose. Extraction into structured node metadata is a follow-up if the experiment lands.

### C. Decision-dimension inventory (research — gate)

Produce `docs/decision-dimensions.md`: a snapshot of what dimensions the library currently uses to discriminate between patterns, extracted from the 8 active decision trees. This is a research artifact, not a controlled vocabulary — the goal is to surface what the library already reasons about and, by absence, what it doesn't.

The document lists, for each pattern that has a decision tree, the questions its tree branches on. Example entries:

- *Deletion*: reversibility, recreation effort, impact scope
- *Notification*: action required, immediate attention, status communication, dismissibility
- *Form*: option count, search need, multi-select, label uniformity
- *Localization*: language boundaries, cultural context, regional boundaries, AI presence
- *Navigation*: continuous space, prescribed sequence, hierarchy depth, workspace richness, cross-section workflows

The artifact is interesting partly for what it includes and partly for what it omits. It points to where the library's conceptual coverage is thin (no decision tree currently reasons about latency, async-vs-sync, persistence, multi-user state, or AI-specific concerns) and where future pattern work might focus.

The document opens with a short note framing the inventory as a snapshot of a *current frame* — the dimensions the library reasons about right now, not the ones that "matter" in some absolute sense. The absences listed are choices, past and accumulating, not oversights. Making them legible is the point; over time the inventory becomes a map of the library's conceptual reach and a prompt for where to extend it.

*Bound*: one pass through the 8 active decision trees. Extract questions only. No cross-linking between trees, no mapping to a controlled vocabulary, no downstream consumer at this stage.

*Gate criteria*: do decision-tree questions read as situational hints that could travel with a `recommends` edge, or do they resist that framing? Are there dimensions the library reasons about that the vocabulary doesn't accommodate? Outcomes feed into the changelog and may revise Phase 3's spec.

*Files modified*: new file `docs/decision-dimensions.md`. No code changes.

### Phase 0 ordering

A is drafted. B and C are independent and can run in either order or in parallel. Recommended order: C first (lowest cost, surfaces useful research output alongside the gate check), then B (the experimental piece that more directly stresses the vocabulary).

Each experiment ends with a changelog entry in the vocabulary doc recording what was learned, and any revisions to the ten relationship types or to the generative-profile framing. Only then does Phase 1 start.

---

## Phase 1 — Typed edges from Related patterns sections

### Edge type vocabulary

Map `### ` headers to 7 edge types (frequencies from codebase):

| Type | Headers (→ count) |
|---|---|
| `precedes` | Precursors (33), Precursor patterns (2) |
| `follows` | Follow-ups (23), Follow-up patterns (2), Follow-ups & Complements (1) |
| `complements` | Complementary (29), Complements (7), Complementary patterns (2) |
| `tangential` | Tangentially related (13) |
| `alternative` | Alternatives (6) |
| `enables` | Containers and primitives (1), Related primitives (1), Mechanisms (1), Components (1), Conversational primitives (1) |
| `instantiates` | Foundation (2), Applied in (2), Implements this model (1) |

Thematic headers (e.g., "Core collaborative components", "Human-AI collaboration", ~14 unique) and the one malformed link header map to `related` with the original text as `label`. The header text is also captured as a *tag* on the linked patterns (see "Tag extraction" below).

Flat lists (72 files) and prose links default to `related`.

`enacts` is detected by source category *and* target ID prefix: source must be a non-quality pattern page, target must be a `qualities-*` ID. Quality-to-quality links (from pages in `src/stories/qualities/`) stay `related` — they're ontological cross-references between qualities, not generative moves. Target-based type assignment runs in the same extraction pass as header-based typing (see "Target-based typing for `enacts`" below).

### Tag extraction (from thematic subcategories)

When a `### ` header doesn't match any of the typed edge categories above, it's a *thematic subcategory*. Rather than discarding the meaning (current plan: edge label only), promote it to a lightweight tag on each linked pattern.

- The header text is normalised gently: lowercase, hyphenated, no further canonicalisation. "Human-AI collaboration" becomes `human-ai-collaboration`. "Core collaborative components" becomes `core-collaborative-components`.
- Tags are stored on nodes in `pattern-graph.json`, in a new `tags?: string[]` field.
- No controlled tag vocabulary. Near-synonyms are tolerated. The library is not mature enough for tag normalisation either, and an LLM consumer can recognise related tags as related.
- The edge under the thematic header is still emitted as `related` with the original header text as `label`. The tag is additional, not a replacement.

### Changes to `scripts/extract-graph-data.ts`

**1. Fix commented-out links bug**

Before extracting links, strip `{/* ... */}` comment blocks from content. This is a simple regex: `/\{\/\*[\s\S]*?\*\/\}/g`. Apply before any link extraction.

**2. New `extractTypedLinks` function replacing `extractLinks`**

```typescript
interface TypedLink {
  target: string;
  type: string;
  label?: string;
}
function extractTypedLinks(content: string): TypedLink[]
```

Logic:

1. Strip `{/* ... */}` comment blocks from the full content
2. Find the `## Related patterns` section (from `## Related patterns` to the next `## ` or EOF)
3. Within Related patterns, split by `### ` headers. Map each header to an edge type via a lookup table. Links under a header get that type.
4. Links in the Related patterns section but *not* under any `### ` header get `type: 'related'`
5. Extract link annotation text (content after ` — ` or ` – ` on the same line) as `label`
6. Links *outside* Related patterns (prose, anatomy, variants sections) get `type: 'related'`
7. The link regex remains `../\?path=/docs/([a-z0-9][a-z0-9-]*)--docs`

Provenance: when a typed edge is created from a `### ` header, `extractedFrom` is set to `header:"<raw header text>"` — so `header:"Precursors"` and `header:"Precursor patterns"` both yield `type: 'precedes'` but remain distinguishable. Thematic headers already capture their raw text in `label`, so `extractedFrom` stays unset there. Flat-list and prose links (which become `related` with no judgement) also leave `extractedFrom` unset. `enacts` edges use `extractedFrom: 'quality-target'`. `recommends` edges use `extractedFrom: 'decision-tree:<tree-id>'` (Phase 3, replacing the earlier `sourceTree` field — they describe the same thing).

**3. Edge deduplication**

When the same source→target pair appears multiple times:

- If one is typed and another is `related`, keep the typed one
- If both have specific types, keep both (rare — indicates the pattern genuinely has multiple relationship dimensions)

**4. Update Edge and Node interfaces**

```typescript
interface Edge {
  source: string;
  target: string;
  type?: string;
  label?: string;
  extractedFrom?: string;  // provenance — populated where type assignment required a judgement
}

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];  // NEW — populated from thematic subcategories
}
```

**5. Update edge and node building**

Replace `fileLinks` Map with a `typedFileLinks` Map storing `TypedLink[]`. Build edges with type and label. As thematic-header links are processed, also collect tags and merge them into the linked node's `tags` array.

**6. Target-based typing for `enacts`**

After header-based typing is assigned, promote an edge to `enacts` only when *both*:

- the source node's `category` is not `Qualities` (i.e., the source is a pattern, not a quality page), and
- the target ID has the `qualities-*` prefix.

Set `extractedFrom: 'quality-target'`. This is the bridge between patterns-as-moves and the qualities they strengthen — prose references from pattern pages to quality pages become typed edges without authors needing to put them under a specific subcategory header.

Quality-to-quality links (e.g., Malleability → Agency, Shareability → Conversation) stay `related`. They're ontological cross-references internal to the quality vocabulary, not generative moves, and conflating them with `enacts` would pollute the graph with false pattern→quality relationships. If structure within the quality vocabulary turns out to be load-bearing for a future consumer (e.g., coverage critique), it should be introduced as a distinct edge type via the vocabulary changelog, not by overloading `enacts`.

### Files modified

- `scripts/extract-graph-data.ts` — extraction logic
- `src/pattern-graph.json` — regenerated output (edges gain `type`, optional `label`; nodes gain optional `tags`)

### Verification

```bash
npx tsx scripts/extract-graph-data.ts
```

Then verify:

- Edge count should be similar (slightly lower due to commented-out link fix)
- Spot-check Workspace.mdx edges: should have `precedes`, `complements`, `follows`, `tangential` types
- Spot-check Form.mdx edges: should have `precedes`, `follows`, `complements`, `tangential`
- Flat-list files (e.g., Deletion.mdx) should all be `related`
- No links from `{/* */}` comment blocks should appear
- Patterns linked under thematic headers should have `tags` populated on their nodes
- Typed edges from subcategory headers carry `extractedFrom` with the raw header text (`header:"Precursors"`, `header:"Precursor patterns"`); `related` edges from flat lists or prose do not
- Edges from a pattern to a quality page (`qualities-*` target) are typed `enacts` with `extractedFrom: 'quality-target'`, regardless of which section they appeared in
- *Invariant*: every `enacts` edge has a non-quality source and a `qualities-*` target. Quality-to-quality edges (source category `Qualities`, target `qualities-*`) stay `related`. Spot-check Malleability.mdx and Shareability.mdx — their outgoing edges to other quality pages should be `related`, not `enacts`.

---

## Classification as a living artifact

Three additions across this plan reinforce that the vocabulary, the edge types, and the decision dimensions are provisional artifacts to keep revising as the library grows, not closed specifications.

1. *Provenance on edges where extraction required a judgement* (Phase 1 and Phase 3). The `extractedFrom` field records the raw source — header text, `quality-target`, `decision-tree:<id>` — so the construction of each typed edge stays inspectable. "Precursors" and "Precursor patterns" both produce `precedes`, but the difference is no longer silently erased.

2. *A changelog in the vocabulary document* (Phase 0, extended by every subsequent phase). Every type added, merged, renamed, or retired gets a short entry: what it replaced, what alternatives were considered, what got lost. The gate outcomes from Phase 0.B and 0.C are the first entries.

3. *A classification-health gardening sweep* (specified in `plans/2026/april/harness.md` Phase 3). Monthly PR surfacing drift — types with few edges, thematic headers repeating across files and looking ready for promotion, tags used once vs. many times. Reports to the changelog under *Observed drift* so revisions stay grounded in use rather than in speculation.

None of this closes the vocabulary. The aim is a classification that stays answerable about its own history and amenable to revision, rather than one that seals itself against use.

---

## Phase 2 — Visual rendering of edge types

*Status*: deprioritised. Kept as a deliverable for human navigation but no longer blocking. Under the design-generation framing, the graph data is the primary value; visualisation is one secondary consumer. Phase 2 can ship after Phase 1 and Phase 3 without holding them up.

### Changes to `PatternGraph.tsx`

**1. Update `RenderedEdge` interface**

Add `type` and optional `label` fields:

```typescript
interface RenderedEdge {
  id: string;
  source: string;
  target: string;
  x1: number; y1: number;
  x2: number; y2: number;
  type: string;
  label?: string;
}
```

**2. Read edge type from graph data**

In `buildGraph()`, pass through `type` and `label` from `graphData.edges` when constructing `simLinks` and `RenderedEdge[]`.

**3. Add `<defs>` with arrowhead marker**

Add a single arrowhead marker in SVG `<defs>` for directed edge types. The directed types are: `precedes`, `follows`, `enables`, `instantiates`. Undirected: `complements`, `tangential`, `alternative`, `related`.

**4. Render `data-edge-type` attribute on `<line>` elements**

```tsx
<line
  key={edge.id}
  className={edgeClass(edge)}
  data-edge-type={edge.type}
  x1={edge.x1} y1={edge.y1}
  x2={edge.x2} y2={edge.y2}
  markerEnd={isDirected(edge.type) ? 'url(#arrowhead)' : undefined}
/>
```

**5. Edge type filter UI**

Add a `Set<string>` state for visible edge types (all enabled by default). Add a `<fieldset>` with checkboxes below the existing color-mode toggle, following the same CSS pattern (`.pattern-graph__color-toggle`). Filter edges in the render pass.

### Changes to `src/styles/pattern-graph.css`

**1. Edge type differentiation via `stroke-dasharray`** (only on active/hovered edges to keep default view clean):

```css
.pattern-graph__edge--active[data-edge-type="precedes"],
.pattern-graph__edge--active[data-edge-type="follows"] {
  /* solid — default */
}
.pattern-graph__edge--active[data-edge-type="complements"] {
  stroke-dasharray: 4 2;
}
.pattern-graph__edge--active[data-edge-type="tangential"] {
  stroke-dasharray: 2 3;
}
.pattern-graph__edge--active[data-edge-type="alternative"] {
  stroke-dasharray: 6 2 1 2;
}
.pattern-graph__edge--active[data-edge-type="enables"],
.pattern-graph__edge--active[data-edge-type="instantiates"] {
  stroke-dasharray: 8 3;
}
```

**2. Arrowhead marker styling** — small, subtle, inherits stroke color.

**3. Edge filter fieldset** — reuse the `.pattern-graph__color-toggle` pattern with checkboxes instead of radios.

### Files modified

- `src/components/PatternGraph.tsx`
- `src/styles/pattern-graph.css`

### Verification

```bash
npm run storybook
```

Navigate to the graph story. Hover over nodes and confirm:

- Active edges show dash patterns matching their type
- Directed edges show arrowheads
- Edge type filter checkboxes toggle visibility
- Default (unhovered) view looks the same as before — type styling only appears on active edges

A reasonable default for `recommends` edges (added by Phase 3) is to render them as a separate overlay rather than as a layout input — toggleable but excluded from the force simulation. This is mentioned in the vocabulary doc's open questions and should be revisited when Phase 3 lands.

---

## Phase 3 — Decision tree extraction (situational hints)

Parse Mermaid flowcharts in the 8 active decision-tree MDX files and emit `recommends` edges. The relationship is reframed under the suggestion-not-matching framing: each edge carries the original decision-tree question phrasings as *situational hints*, not as canonicalised conditions to be matched against a query.

### Approach

1. *Mermaid parser*: extract the directed graph from `flowchart TD/LR` blocks. Walk each path from root to leaf. The questions and branch labels along the path become the situational hints attached to the resulting edge. Skip lines the parser can't handle gracefully rather than failing.

2. *Leaf-to-pattern resolution*: hand-curated mapping table (~40 entries across 8 trees). Manual because leaf labels use informal abbreviations ("Modal with details", "Pill-style toggles") that defeat automated matching. Leaves that don't map to patterns (e.g., "Consider redesign/priority") are skipped.

3. *Edge emission*: for each resolved leaf, emit one edge with:

   ```typescript
   {
     source: <pattern containing the decision tree>,
     target: <leaf pattern>,
     type: 'recommends',
     situationalHints: [
       { question: 'Is the deletion reversible?', branch: 'Yes' },
       { question: 'How quickly can it be recreated?', branch: 'Seconds' }
     ],
     extractedFrom: 'decision-tree:deletion'
   }
   ```

   `extractedFrom` provides provenance — useful for debugging extraction and for an actor to cite its sources. It unifies with the field introduced in Phase 1, so every edge that required extractor judgement shares one provenance convention.

4. *No canonicalisation*: question phrasings and branch labels are stored as raw text. No mapping to a controlled dimension vocabulary. The actor reads them as hints.

### Files modified

- `scripts/extract-graph-data.ts` — Mermaid parser, leaf mapping table, situational hint extraction
- `src/pattern-graph.json` — output gains `recommends` edges with `situationalHints` and `extractedFrom`

### Verification

Run extraction. Spot-check that:

- Deletion's tree produces edges to Undo, Modal confirmation, Inline confirmation, Typed confirmation with hints describing reversibility and impact
- Navigation overview produces edges to its 8 leaf patterns with hints describing the branch path
- Notification produces edges to Dialog, Callout, Toast with hints describing action requirements and urgency

---

## Phase 4 — Query API (sketch, not committed)

A small TypeScript module exposing the queries an actor would use against the graph. Lives at something like `src/pattern-graph-query.ts`. Functions return raw graph data, leaving interpretation to the caller.

```typescript
function findEnablers(patternId: string): Pattern[]              // reverse `enables`
function findInstantiations(principleId: string): Pattern[]      // reverse `instantiates`
function findAlternatives(patternId: string): Pattern[]
function findRecommendations(patternId: string): RecommendsEdge[]  // raw, with hints
function findByTag(tag: string): Pattern[]
function findEnactedQualities(patternId: string): Quality[]
function findEnactingPatterns(qualityId: string): Pattern[]
```

Inference patterns (transitive composition, co-instantiated foundations, alternative-conflict detection) can be added as separate functions if they prove useful. The lighter-weight default is to compute on demand rather than precompute and store.

This phase is sketched but not committed. It depends on Phase 1 being in place (which covers typed edges, tags, and `enacts`), and on having a concrete consumer (an agent prompt, a CLI, a notebook) that exercises the queries. Without a consumer, the API would be speculative.

---

## Phase ordering and dependencies

```
Phase 0.A  (vocabulary doc, drafted)
     │
     ├──► Phase 0.B  (generative profiles — experiment, gate)
     ├──► Phase 0.C  (dimension inventory — research, gate)
     │         │
     │         ▼
     │    changelog entries, possible vocabulary revisions
     │         │
     ▼         ▼
Phase 1 (typed extraction + tags + enacts) ──► Phase 2 (visualisation, deprioritised)
     │
     ▼
Phase 3 (decision tree extraction)
     │
     ▼
Phase 4 (query API, sketch)
```

Phase 0.B and 0.C are independent gates and can run in either order or in parallel. Phase 1 starts only after both gates close (a changelog entry per experiment, possibly revising the vocabulary or Phase 1's spec). Phase 1 should land before Phase 3 (Phase 3 builds on the same extraction script). Phase 2 is unblocked by Phase 1 but no longer blocking. Phase 4 depends on a concrete consumer existing.

