# Episode 02: Typed relationships — walkthrough

Scope: branch `split-project` against merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c` (`git merge-base main split-project`). Territory: the typed-relationship arc from `1429092` (frontmatter schema) through the migration batches and repair commits to `ef75043` (graph regeneration), plus the endpoint state of `docs/specs/graph-relationship-model.md`, `docs/language/relationship-vocabulary.md`, `RelatedPatterns.astro`, `scripts/extract-graph-data.ts`, and sampled migrated content. Commands: `git log --oneline --reverse <merge-base>..split-project`, `git diff --stat <merge-base>...split-project -- <territory paths>`, per-commit `git show`, endpoint file reads. Later relationship-vocabulary workstreams (2026-07-10 changelog entries) are out of episode and cited only where this episode's moves visibly fed them.

The episode replaces heading-text inference of graph edges with explicit authoring: a frontmatter `relationships:` schema and inline `rel=` channel land first, then the extractor rewrite and `RelatedPatterns.astro`, then the whole corpus migrates its prose `## Related patterns` sections into frontmatter across roughly ten batches. Interleaved with the batches are repair commits restoring dropped notes, retyping edges, recovering text-only references, and removing dangling component edges, closing with a regenerated `pattern-graph.json`. The vocabulary doc gains the authoring model, alias table, per-direction notes, the quality-page purist stance, and the mediator rule, each recorded as a changelog entry with what-was-considered and what-was-lost.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | Authored, not inferred — with a kept inference boundary | fix |
| 2 | Migration as verified batches with a repair tail | accept |
| 3 | Purist stance: qualities are lenses, not catalogues | accept |
| 4 | Direction fixed by the relation name | fix |
| 5 | One claim per pair, and the mediator rule | accept |
| 6 | The generated index renders but does not decide | accept |
| 7 | Per-direction notes: one edge, two voices | accept |

## Move 1: Authored, not inferred — with a kept inference boundary

*The move.* Edge extraction from heading wording (`HEADER_TYPE_MAP`, inverse-direction headers, role defaults, quality promotion) is removed. Edges now come from three explicit channels — frontmatter `relationships:`, inline `{rel="…"}`, `<PatternRef rel>` — plus three kept structural auto-typings: decision-tree leaves → `recommends`, untyped links to quality pages → `enacts`, untyped links on `role:collection` pages → `surveys` (changelog 2026-06-23; `scripts/extract-graph-data.ts`). Untyped body links elsewhere produce no edge; the extractor's `auto:prose` records exist only as carriers for the `enacts` promotion and are otherwise skipped.

*Answers to.* `plans/completed/2026-06-typed-relationships.md` §The model and §The inference boundary; `docs/project/core-beliefs.md` ("typed edges, and graph navigation are load-bearing, not decorative"); `docs/language/vision.md` guidance Q5 (distinctions legible from repository-local artifacts).

*Backtalk.* Migration exposed how wrong the inferred graph had silently been: the `### Precursors` heading had flattened heterogeneous relations into `precedes` (changelog 2026-06-24, collaboration cluster — a mistyping the 2026-07-10 sweep later found on 24 of 93 edges), and ComponentRefs had been minting pattern edges with component-ID targets that the extractor silently dropped (`41c6819`). The move also proved immediately load-bearing for repair: every retype in the repair trail is a reviewable one-line frontmatter diff, which the old model could not have offered. The kept boundary held — no repair commit touched the three auto-typings.

*Question.* The plan defends the kept auto-typings as "predictable from the target, not from prose" — but the `enacts` auto-typing means adding an ordinary body link to a quality page still silently mints an edge, which is exactly the "editing prose silently mutates the graph" failure the episode exists to end. Is predictability the only property that mattered, or does the language accept silent minting so long as it is target-determined?

*Verdict:* fix — the principle was right and hadn't reached its own boundary; the corpus had already voted (2 of 116 `enacts` auto-minted, 0 of 16 `surveys`, both survivors on the branch's newest pages — the fresh-page trap demonstrated). Auto-typing retired from the extractor; the two live edges re-authored as explicit `enacts: formality`; I7 and the docs now read: untyped body links are citations, edges come from explicit channels and judgement homes only. `recommends` untouched (judgement home, not inference). Changelog 2026-07-11. (2026-07-11)

## Move 2: Migration as verified batches with a repair tail

*The move.* Rather than a single scripted rewrite, the corpus migrated in hand-worked batches (`a07944d` "lossless batch" of 21, `ca46165`, `f3097f2`, `abe4a21`…`c486791`, `dc06799`), each verified against a gitignored pre-migration baseline (`6505427`). Interleaved repair commits (`cf21fed`, `99400ef`, `48b849e`, `41c6819`, `40dedbc`, `20fb5d7`, `3a9f03a`) restored dropped notes, retyped edges, and recovered content the graph could not represent — commented-out relations kept as code TODOs, unbuilt or text-only relationship claims moved to visible `## To-do` sections. `ef75043` regenerates the graph from the repaired content.

*Answers to.* Plan phase C ("Correctness test: regenerated graph diffs to ~zero against pre-migration") and its open question "Annotation loss on migration… check a sample after migration."

*Backtalk.* The loudest backtalk in the episode: graph-level losslessness was the wrong conservation law. The prose sections carried four classes of content — links, notes, commented-out relations, text-only references — and the plan's verification standard saw only the first. The repair trail is the record of the standard being rebuilt mid-flight: `cf21fed` (bare slugs had dropped notes), `99400ef` (a whole section flattened to two bare slugs, one alternative lost), until `f3097f2` names the corrected standard outright ("four-class verified lossless"). The plan's "check a sample" hedge under-scoped by an order of magnitude. A second finding: content that was never edge-shaped (aspirational pairings, unbuilt alternatives) got a new home — the `## To-do` section — rather than being forced into edges, which is `I3` (the graph is a deliberate subset of the prose) honoured under pressure.

*Question.* The `## To-do` sections now hold relationship claims that are neither edges nor woven prose — a third home the graph cannot see and no invariant governs. Do they have a lifecycle (what promotes a To-do into an edge, and who sweeps them?), or has the migration minted a parking lot the language will forget?

*Verdict:* accept — To-dos are page-local, rendered, and checked when the page is edited; that is lifecycle enough for now. (26 pages carry one; the items are a mix of unminted claims and ordinary authoring notes.) (2026-07-11)

## Move 3: Purist stance: qualities are lenses, not catalogues

*The move.* `RelatedPatterns.astro` renders nothing on `role: quality` pages; quality-authored `related:` frontmatter is cut to quality↔quality targets only. Of 52 removed quality→pattern edges, 28 were duplicates of existing `enacts`, 18 were re-authored as pattern-side `enacts` with Q-lens labels, 6 dropped as not enacts-shaped (`1c8f8d0`; changelog 2026-06-23). The exemption is in the renderer, not the extractor — quality↔quality edges are stored but render nowhere. A follow-up entry makes the stance one-directional: pattern-side quality prose stays, and the resulting double-surfacing (narration plus generated `enacts` line) is accepted.

*Answers to.* The `enacts` definition ("qualities act as a vocabulary for what a transformation should accomplish"); `docs/language/vision.md` Track 1 (the Nature of Order register — properties do not reference their instances); `docs/language/pattern-definition.md` ("quality edges that state which experiential dimensions the move makes legible").

*Backtalk.* The stance was minted *inside* a migration batch — `1c8f8d0` is simultaneously a content migration and an ontological decision about what a quality is, and its own commit message records the residue: two non-`related` quality-authored edges leaked past the cut (`privacy enables collaboration-foundation`, `learnability tangential localization`), staged "pending a decision on whether the purist cut extends past `related`". Both leaks then took separate later work to close (2026-06-25 and 2026-07-10 entries). The 25 kept quality↔quality edges became latent data awaiting the `tensions-with` question (vocabulary doc, open question 5).

*Question.* The quality↔quality `related` set is stored, rendered nowhere, and read by no consumer — under `I3` a graph edge is a deliberate claim, so what claim is the language making by keeping edges whose only property is that no one can see them, and how long can "awaiting a deliberate quality-relationship treatment" stand before latency becomes shadow catalogue?

*Verdict:* accept — the set is the specimen base open question 5 explicitly holds for the `tensions-with` decision; open questions are re-read at changelog sittings, which is watch enough. (2026-07-11)

## Move 4: Direction fixed by the relation name

*The move.* Direction is never an author-set field; each relation name carries a fixed direction, and authoring aliases (`follows`, `composed-of`, `instances`/`variants`, later `hosted-by`) let either endpoint author the same stored edge — the extractor normalises to one canonical type, inverting where the alias demands (vocabulary doc §Authoring aliases; plan §Controlled vocabulary). No inverse edges are stored; reverse traversal is a query concern.

*Answers to.* Plan §Controlled vocabulary ("Direction is the single most-documented failure of typed links — Halasz… Shipman reason 4"); invariant I2; vocabulary design principle 1 (inverse pairs only where they hold).

*Backtalk.* The aliases proved to be repair instruments, not just authoring sugar: `3a9f03a` re-authors onboarding→wizard as `composed-of` from onboarding's side, and the 2026-06-25 multi-type entry corrects a wizard/step-by-step contradiction "via the `instances` alias, which inverts" — the fix is choosing the right word, not editing a direction field. The 2026-06-25 entry also surfaces the model's cost: because either endpoint may author one edge, the extractor's `addEdge` had to change from skip-on-duplicate to merge, and the alias table effectively created two authorship sides for a single stored claim (see Move 7).

*Question.* When frontmatter on page P reads `composed-of: [X]`, the stored edge's source is X, not P — the claim's owner and its author diverge by design. Is that split (authorship side vs claim side) a concept the language owns and teaches, or an accident of the alias table that only the extractor understands?

*Verdict:* fix — the split was exercised correctly by the rules but never named; a sentence added to §Authoring aliases states it (authoring side and claim direction are independent; aliases decouple them), chiefly for the future agent-author. (2026-07-11)

## Move 5: One claim per pair, and the mediator rule

*The move.* Migration had stamped one prose gloss onto several edge types per pair — 65 pairs carried multiple types. Two responses: contradictory pairs (a symmetric plus a directed type, or two directed types) were re-typed to one claim per pair by meaning; and the extractor dedup now drops a `related` edge whenever a stronger type exists between the pair in either direction, `recommends` excepted (changelog 2026-06-25; extractor dedup pass). Alongside, `fa7170d` mints the mediator rule: when an edge resists typing, the relationship is usually mediated — drop the direct edge if two-hop paths through a named intermediate exist (first applied to bot↔progressive-disclosure).

*Answers to.* Invariant I2 read epistemically ("a pair asserting `precedes` and `complements` at once asserts two incompatible things", 2026-06-25 entry); `docs/language/pattern-definition.md` ("relationships should carry semantic weight"); the vocabulary doc's §When an edge resists typing.

*Backtalk.* The dedup machinery reproduced, in miniature, the silent loss it was cleaning up: `6e9c5ef` found seven `related` notes that had never rendered because the dedup discarded the edge and its note together — enforcement of one-claim-per-pair had itself become a silent mutation channel, caught only by hand audit. The mediator rule, by contrast, is the episode's cleanest conceptual export: it turned a typing struggle into a structural diagnosis ("a pattern language draws the line through the named intermediate") and was reached for repeatedly in later sweeps (2026-07-10 entries cite it as "this doc's own worked example").

*Question.* A mediated drop trusts the graph to route the relationship through two hops — but `RelatedPatterns.astro` renders exactly one hop, and no shipped consumer traverses further. Is a relationship the language believes in but never shows anywhere still part of the language, or is the mediator rule quietly assuming the query layer that `vision.md` Track 2 says does not exist yet?

*Verdict:* accept — a mediated relationship is not a hidden claim but two visible claims that compose; both hops render on the mediator's page and the stacked-panes walk is the native gesture. Revisit when the graph is much more complete — today's gaps make the deeper question hard to think about clearly. (2026-07-11)

## Move 6: The generated index renders but does not decide

*The move.* `RelatedPatterns.astro` is wired into `[...slug].astro` (`df66f7b`) and every hand-authored `## Related patterns` section is deleted as its batch migrates. The component renders declared edges in declaration order, grouped by type: outgoing directed, symmetric, then incoming directed as computed inverses ("Preceded by", "Enabled by"). `2eda6be` adds a `showRelated: false` opt-out for pages that narrate every relationship inline (first user: navigation-overview), while their edges still feed the graph.

*Answers to.* Plan §Generated index behaviour and invariant I5 ("renders but does not decide; author selection/order preserved"), grounded there against Obsidian-MOC/Diátaxis full-auto-linking.

*Backtalk.* The plan's open question — "confirm this reads well on a page or two before rolling out" — got its answer as a schema flag: for pages whose body already weaves every relationship, the generated block was pure redundancy, and `showRelated` emerged mid-migration (`abe4a21` applies it in the same commit that migrates the collection) as the pressure valve. The deletion of hand-authored sections is also what generated the repair tail: once the section was gone, anything in it that was not edge-shaped had nowhere to live, which is how the To-do convention (Move 2) was forced into existence.

*Question.* I5 promises authorial selection and ordering, but the incoming half of the block is populated by *other* pages' declarations — a page's rendered relations change when someone else authors an edge at it, selection unpreserved by design. Is the incoming section understood as the graph speaking rather than the author, and can a reader of the rendered page tell those two voices apart?

*Verdict:* accept — the incoming half is the graph speaking, and the computed inverse labels ("Preceded by", "Enabled by") carry that register; the asymmetry is understood, not a violation. (2026-07-11)

## Move 7: Per-direction notes: one edge, two voices

*The move.* A symmetric edge may be authored from both endpoints, each with its own note; the renderer shows the near-side note — the one authored by the page being viewed — falling back to the far side (changelog 2026-06-24). The next day this extends to directed edges: an optional `incomingNote` authored from the target via an inverse alias, with `addEdge` changed from skip-on-duplicate to merge (changelog 2026-06-25). One stored edge, up to two notes, no inverse edges — the no-redundant-inverses rule holds.

*Answers to.* The vocabulary doc's own rationale: "a link between two patterns is described twice in a pattern language, once in each pattern's voice (cf. *A Pattern Language*'s up/down cross-references)"; the directed extension's claim that "directionality is a claim about the relationship, not a constraint on movement."

*Backtalk.* The skip→merge change recovered 8 pre-existing edges whose second-author note the old dedup had silently dropped — another instance of the episode's recurring discovery that dedup logic is where meaning quietly dies. The construct also created a rendering hazard the episode only partly resolved: the fallback chains in `RelatedPatterns.astro` (`label ?? situation ?? incomingNote` and its mirror) show a note written in one endpoint's voice on the other endpoint's page, and the strain surfaced later as the voicing advisory and the "voice the note for both pages" authoring rule (2026-07-10 entries) — evidence the in-episode design shipped with the wrong-voice case unhandled.

*Question.* The fallback prefers showing a far-side note over showing nothing — but the whole construct exists because "a single note often reads correctly from only one end." By the move's own rationale, is a wrong-voice note actually better than a bare link, or should silence be the fallback until the near side speaks?

*Verdict:* accept — silence was the first instinct, reversed on the numbers: 84 of 126 directed edges are single-noted and voice-neutral by rule, so silence would hide correct notes corpus-wide to guard against a case the voicing advisory already polices (three deliberate holds). The fallback stays; the guard lives at the authoring layer. (2026-07-11)
