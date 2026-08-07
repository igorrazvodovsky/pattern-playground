# Decision-tree integration into the graph and relational model

Every decision tree in the corpus gets an explicit relationship to the graph: wired (emitting `recommends`), dissolved (its judgement re-homed in situation constructs or dimension prose), or deliberately outside (realisation guidance beside the components). No tree stays in the current in-between state — authored, rendered, and invisible to the model. Some lossiness is acceptable; the questions a tree asks are the part that must survive.

Research gate: `research/decision-tree-integration/2026-07-25.md`. Its correction governs the whole plan: a decision tree is the *option-space species* of generativity (Dearden & Finlay §5.3 — alternatives selected "based on specified attributes of the domain"), not an anti-generative form to escape. Trees are dissolved only when their content is mis-homed (internal anatomy, realisation choice), never to get rid of choice as a shape. Three rules distilled from the gate:

1. *Questions survive dissolution.* Where a tree dissolves, its discriminating questions stay legible — a dimension table (bounded-choice's control table) or a named "the useful question is…" sentence (the Form story). The branch routing can go; the ask-this-at-this-moment content cannot.
2. *Component leaves never emit.* Chooser trees whose leaves are components are realisation guidance; prior art (Workday Canvas, Lyft, Doctolib, Carbon) keeps them beside the components. Only move-leaves reach the graph.
3. *Two lenses are two trees.* Structures recommending the same targets from different standpoints stay separate judgement homes (Pattern Views; Fincher & Windsor's "different standpoints" requirement) — no merging into one bigger tree.

## Inventory and verdicts

Eleven trees plus one filed candidate plus one dead config. Settled machinery this plan runs on, unchanged: trees are a judgement home emitting `recommends` with `situationalHints`; sequences under condition live in `situation.resulting` + `sets-up`; the consumer contract forbids matching on either.

| Case | Where | Leaf type | Verdict | Effort |
|---|---|---|---|---|
| deletion | pattern page | moves | wired, reference case — verify leaf coverage only | done |
| navigation-overview | collection page | moves | wired, reference case | done |
| notification | pattern page | components + one move | keep tree; repair leaf map (two dead ids) | S–M |
| form (dead config) | frontmatter only | — | delete; charts already dissolved into bounded-choice + Form story | S |
| searching (commented-out) | pattern page | prose list | dissolve into `situation.initiating` (recall vs. recognition) | S |
| help | pattern page | placements (anatomy) | dissolve into §Contextual availability; questions become prose | S–M |
| modality | foundation page | surfaces/components | stays as gradient illustration; no edges | none |
| localization | pattern page | layer assemblies (anatomy) | dissolve into a layer-ladder body structure; questions stay | M |
| interaction (candidate) | foundation page | moves (nine nav models) | author a second tree — behavioural lens beside nav-overview's topology lens | M–L |
| Overflow | component story | CSS techniques | stays component-side (reaffirm 2026-04-27 deferral) | none |
| Button | component story | variants | stays component-side | none |
| BarChart | component story | chart types | stays component-side; blocked on domain corpus having chart-move nodes | none |
| action-consequences (prose ladder) | pattern page | mixed: moves + surfaces | wire the severity ladder where rungs are moves (workstream 4b) | M |
| status-feedback (prose router) | pattern page | moves (delegations) | judge at sitting — likely no separate decision to wire | S |

## Workstream 1 — mechanical repairs and extractor advisories

- [ ] Delete form.mdx's `decision-trees:` block. Both charts left the page long ago — "Choosing a control" became bounded-choice's set-size table, "Choosing an input" became the Form story's prose ("the useful question is therefore…"). The config references chart-index 1 of zero charts and emits nothing. Record in the vocabulary changelog as the corpus's first tree dissolution — it is the precedent rules 1–2 generalise.
- [ ] Extractor advisory (suggestion-grade, matching the existing advisory register): a `decision-trees:` entry whose `chart-index` resolves to no `<Diagram>` on the page. Form's dead block sat silent for months; a channel that always drops is a trap (the ComponentRef-rel precedent).
- [ ] Extractor advisory: a leaf-map *target* that resolves to no graph node. Unmapped leaves are already reported; mapped-but-dangling targets (form's three, notification's two) skip silently today.
- [ ] Re-run extraction; confirm advisory output lists exactly the known dangles before repairs, none after.

## Workstream 2 — the two easy dissolutions and one repair

- [ ] *searching*: revive the commented-out discriminator as `situation.initiating` — the actor can name what they seek (recall); when they would only recognise it on sight, browsing/navigating the structure is the seeking move. The existing resulting clause (search-fail → navigation-overview) already carries the other half. Delete the comment block.
- [ ] *help*: fold the placement tree into §Contextual availability. Add *standalone* to the placement vocabulary (the section currently stops at inline and just-in-time), and write the three questions as prose: error prevention wants inline; sustained attention wants standalone; mid-task friction wants inline, otherwise just-in-time. Remove the flowchart. No edges — placements are help's anatomy, not moves.
- [ ] *notification*: keep the tree (it descends from Carbon's variant chooser, which the page cites — inherited shape, not drift). Repair the leaf map: `actions-application-dialog` and `operations-callout` are dead ids. Author judgement at the sitting: map "Callout" to a move if one genuinely fits (status-feedback is the nearest candidate — the tree's own question routes status to Toast, so this is not obvious), otherwise remove the dead entries and let the component leaves stand unmapped per rule 2. Partial maps are the designed behaviour, not a compromise.
- [ ] *deletion*: verify the leaf map covers all pattern-shaped leaves (the map lists two; check the chart for unmapped move leaves).

## Workstream 3 — localization's ladder

- [ ] Restructure the body around the layer ladder the tree encodes: linguistic → cultural → regional → contextual, each layer's section carrying its gate question in prose ("crossing language boundaries?" opens the linguistic layer, and so on). This is the generative-sequence reading decision-dimensions.md already gives the tree.
- [ ] The tree itself then either goes (the ladder says everything) or stays as an illustration of the assembled paths — author's call at the sitting. No leaf map either way: layer assemblies are localization's internal anatomy.
- [ ] Consider one `situation.resulting` clause if the ladder genuinely opens onto other moves (the AI/agent-present branch brushing against agent/localization adjacency); skip if it stays internal.

## Workstream 4 — interaction's behavioural tree

The nine navigation-model rows on interaction.mdx are suitability conditions authored as `related` notes ("maximum efficiency for precise movement", "guided completion without distraction") — a tree-shaped judgement smeared across an edge list, filed as a decision-tree candidate in the 2026-07-12 changelog. Under rule 3 this becomes a second tree over the same nine targets: nav-overview discriminates by the *shape of the space* (topology, depth, volume); interaction discriminates by *behavioural intent* (locate / browse / focused task / monitor, and who drives).

- [ ] Author the tree on interaction.mdx: branch on intent and agency, leaves = the nine models, leaf map in `decision-trees:` frontmatter.
- [ ] The nine `related` rows then come off — their judgement's home is the tree (rule 1 of the situation constructs; same decomposition as the deletion→undo bundle).
- [ ] Fallback recorded now: if the tree won't write honestly (the rows may be nine observations, not one decision), keep the rows and close the candidate with that finding in the changelog. A forced tree is worse than an honest edge list.

## Workstream 4b — prose selectors

Three prose decision selectors were registered 2026-07-10 alongside the Mermaid trees: *action-consequences* (the severity → confirmation-method ladder), *status-feedback* (routing by feedback kind), and *data-visualization* (the four-axis chart selector — blocked, see out-of-scope). The `recommends` machinery requires a chart plus leaf map today, so a prose selector has two integration routes; decide once, at the sitting, and record it:

- *Author a compact flowchart* for the selector (no schema change — the ladder becomes an ordinary tree). Fits action-consequences: its dimensions (time to recover, scope, cascade) are real branch questions and several rungs are moves (undo, inline-confirmation). Rungs that are surfaces (modal interruption, friction confirmation) stay unmapped per rule 2.
- *Extend `decision-trees:` to chart-less row entries* (schema change through the changelog — the list-shaped-tree deferral from 2026-04-27 revisited). Only worth it if authoring charts for prose selectors keeps feeling like ceremony; don't take this route for one page.

status-feedback likely wires nothing: its three sections delegate to owning patterns (validation, notification) rather than deciding among them — the notification section explicitly hands routing to notification's own tree. Confirm and close the candidate with that finding if so.

## Workstream 5 — docs

- [ ] Refresh docs/language/decision-dimensions.md: it inventories 8 trees including two that no longer exist on their pages (form's) and predates the searching/help/modality/localization verdicts. The inventory's job (dimensions as a map of conceptual reach) survives; the roster changes.
- [ ] Vocabulary changelog entry covering: the dissolution precedent named, the two extractor advisories, the interaction tree (or its honest failure), and what was lost per case.
- [ ] Note the gate's promotion candidates for curation (not this plan's action): Dearden & Finlay toward references/; the two-species generativity line toward the epistemic stance's phrasing.

## Out of scope, recorded

- BarChart/chart-territory chooser: blocked until the data-visualization domain corpus has chart-move nodes; the leaf map on data-visualization.mdx is the mechanism when it does.
- Overflow and Button trees: realisation guidance in the component dataset, staying there (rule 2).
- Modality's overlay-vs-page tree: chooses among surfaces along the foundation's own gradient — anatomy illustration, no graph claim. No edit beyond the decision-dimensions refresh.
- Any corpus-wide condition vocabulary across trees: still post-hoc-only, per the situations rules.
