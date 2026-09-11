# Need mapping: Maru Table A.2 — making sense at scale — 2026-08-29

Companion to the same-day bibliography leads note. Where that note mines the reference list, this one reads one artifact from the paper's appendix: Table A.2, *Full mapping of IA elements to user needs, UI components, and interactions across coded systems*, from *Maru* (Kim, Choi, Min, Yi, Jiang & Kim, UIST '26, [arxiv 2608.25565](https://arxiv.org/abs/2608.25565)). Read for corpus gaps, not for the paper's argument.

## Why a component-level table is readable here

The table maps needs straight onto components and interactions, with no pattern layer between them. It is still usable, because its columns are doing familiar jobs under other names. The *user needs* column states a recurring situation an actor is in — the work a pattern's `situation.initiating` does. The *UI components* and *interactions* columns state what gets built in response — the work a pattern's mechanism does. So each row is a pattern-shaped triple with the name left blank, and the corpus can be checked against it: a row that lands on an existing pattern is confirmation, a row that lands nowhere is a candidate.

The limit is in the same sentence. A triple is not a pattern until someone can say what recurs across instances and why the response resolves the situation. Nothing below is a gap the corpus owes; the table supplies evidence, and the naming is still the work.

## Where the coding came from, and what it biases

Table A.1 records the coding rounds: seven papers under *sensemaking theory* against thirty-five under *interactive systems* — though the split is the paper's own, and theory-coded papers appear in A.2's cells too. The systems set is weighted towards research prototypes from a small number of labs — Fuse, Wigglite, Unakite, Crystalline, Selenite, Sensecape, SearchLens, Mesh, Bento, Tabs.do, Forsense, OrgBox, SenseMap. This is exactly the corpus the same-day practice survey excluded on purpose, on the ground that specialised tooling is a bias risk for a language documenting mechanisms most tools share.

So every candidate below arrives with the same question attached: does a shipping product do this, or only a UIST prototype? The question is answered per candidate rather than waved at once, because the three candidates answer it differently.

## Rows the corpus already answers

Most of the table lands on patterns that exist. Partition's regrouping need and its tag-assignment interaction are `grouping` and `tag`; its faceted sections are `filtering` and `attribute-visibility`. Its tab groups and card clusters — the table's second-most-cited component — are likelier `workspace` than `grouping`, since Tabs.do, Bento and Fuse hold a session's material rather than arranging one view. Hierarchy's nested cards and accordions are `multilevel-tree` and `progressive-disclosure`; its provenance need is `provenance-marking` and `citation`; its tables are `data-view`. Order's spatial-placement and threshold-collapsing components are `sorting`, `filtering` and `density`, and drag-reordering is `drag-and-drop`. Vocabulary's persistent labels, tag chips and term extraction are `tag`, `attribute-visibility` and `incremental-formalisation` — the last of these covering the row where the system proposes terms drawn from the material rather than the actor authoring them.

That coverage is worth recording as its own result. A table built from thirty-five sensemaking systems mostly decomposes into patterns this corpus already carries, which is a check on the sequence's claim to cover the territory.

## Candidates

### 1. Weighted criteria, tuned by the actor

*Table rows.* Order's needs — "weight criteria by relative importance to reflect current priorities" and "continuously adjust relative importance across rules" — with weight badges and size emphasis as components [14, 15, 17, 21, 79, 83] and weight sliders as the interaction [14, 21].

The corpus has `sorting`, which is key-ordering: the actor picks a column and a direction, and the collection reorders against that one claim. What the table describes is different — several criteria held at once, each carrying an adjustable importance, with the ranking recomputed as the actor moves the weights. The situation is also different. `sorting`'s initiating situation is a collection arriving in an order chosen for someone else; this one is a collection where no single attribute answers the question, and the actor's judgement about the trade-off is the thing that needs a place to live.

Two corpus connections. A named, persisted weight is a `rule-composition` object — a condition the actor can read and edit before it runs — which suggests the mechanism may be a face of that pattern rather than a new one. And the weights are what a `purpose-keyed-view` would keep.

*Transfer.* Passes. Weighted ranking is ordinary in shipping software: faceted commerce relevance controls, mail importance, recommendation controls that let the actor say what to favour. The prototypes make the weights explicit and adjustable, which is the part practice varies on, but the mechanism is not confined to research tooling.

### 2. Position as meaning on an open surface

*Table rows.* Partition's spatial clusters [2, 33, 35, 71, 72, 77, 79, 92, 100, 103] and its spatial-arrangement interaction [77, 92].

The corpus has `drag-and-drop`, whose situation is destination-as-meaning: the drop writes what the destination represents, and its own text says the meaning has to be given by a surface — "most meanings have no place until a surface gives them one". The table's rows are the other case, where the surface is unstructured and the position itself carries the claim: items near each other are related, and the actor's arrangement is the externalised structure. Nothing writes an attribute.

This is not an unnoticed absence. `grouping.mdx` already carries it twice — an inline `TODO: canvas...` in Orientation, and a to-do item reading "Canvas — spatial clusters as groups, where position rather than a header carries membership." The table's contribution is evidence for a to-do the corpus wrote itself, and a hint about where the decision sits: ten citations under Partition rather than under Order or Hierarchy suggests spatial arrangement is read in this literature as a grouping act, which supports keeping it inside `grouping` rather than splitting it out.

*Transfer.* Passes. Finder's icon view, whiteboard tools, photo-album arrangement and card walls are all mass-market, and the marking region's premise — a judgement made cheaply at the point of encounter — describes dropping a card near its neighbours as well as it describes a tag.

### 3. The collection rendered as links

*Table rows.* Hierarchy's node-link diagrams [32, 71, 84, 91, 99, 103].

The corpus has nothing for this. `dynamic-hyperlinks` and `deep-linking` are about the individual link; `data-visualization` is about charting values; `multilevel-tree` is containment, which is a different relation from reference. The missing thing is the collection shown as its relations — items as nodes, connections as edges, the actor reading and editing the structure in that form. The lens choice's four arms are all about distance and detail; none of them is about showing relations as the primary representation.

Where this would land is an open question. It might be an arm of the lens choice, a pattern in the marking region (drawing a link is a mark on the material), or outside this sequence entirely.

*Transfer.* This is the candidate most likely to fail. Node-link views of a personal collection are common in research prototypes and in a tool tradition — outliners, Obsidian-style linked notes, mind-mapping tools — but they are not a mechanism most tools share, which is the corpus's standing test. Zhu, Haisfield, Langen & Chan's *Patterns of Hypertext-Augmented Sensemaking* [111], the lead ranked first in the companion note, is the read that would settle it, since it works this exact territory from the hypertext side and states its findings as patterns.

### 4. Items accumulated as evidence under a decision

*Table rows.* Hierarchy's need "structure evidence under options", with tables as the component [14, 22, 51, 52] and inline role assignment as the interaction [51, 52].

`comparing` renders the difference between items the actor has already designated. This is the step before it: items collected over time and typed by the role they play in a pending decision — this one supports the option, this one counts against it — so the structure accrues while the material is being gathered rather than being assembled at reading time. Unakite and Crystalline are the cited systems, and Mesh [14], already ranked fourth in the companion note as a read for `comparing`, serves this situation rather than the difference-rendering one.

Two readings, and the sitting has to pick. It strengthens `comparing`'s initiating situation, which currently starts from items already in hand and says nothing about how they got there. Or it is a pattern beside `comparing` in the marking region, where the typed role is a mark with a schema — which would make it the case `tag` does not cover, since a flat label carries no stance and this one does.

*Transfer.* Mixed. The typed evidence structure is research-prototype territory; the weaker form is not, since comparison tables, pros-and-cons lists and shortlists with reasons attached are ordinary. What a shipping product rarely does is let the role be assigned in one gesture at the point of collection, which is the part the prototypes contribute.

## Two rows recorded as questions, not candidates

*Pin and star.* The table lists pin/star actions under Order [31, 52, 53, 98]. The same-day practice survey already noted stars as "the even lighter form: one tap, no vocabulary at all", which reads as a degenerate case of `tag` rather than a separate mechanism. The question it raises for `tag` is whether a mark with an empty vocabulary is still that pattern, or whether the zero-vocabulary flag belongs to the view it promotes within.

*Colour coding and size emphasis.* Listed under Partition and Order respectively. Both are encoding choices inside a view rather than decisions about what to build, and the corpus handles encoding through `data-visualization` and the categorical palette. Recorded so the row is not read as missed.

*A personal term acting as a filter.* Vocabulary's need "evaluate options consistently using self-defined criteria" — the actor names a term and the system applies it as a predicate, Maru's example being "affordable" standing for under $1800. The coverage paragraph above assigns Vocabulary's rows to `tag`, `attribute-visibility` and `incremental-formalisation`, and none of those is a named term that filters. The nearest fit is `rule-composition`, whose object is a condition the actor can read and edit; the difference is that this one is entered as a word rather than as a condition. It is left out of the candidates because it is also the closest row to Maru's own contribution — vocabulary rules persisted across generations — and separating the mechanism from that argument needs the paper read properly, which this note does not do.
