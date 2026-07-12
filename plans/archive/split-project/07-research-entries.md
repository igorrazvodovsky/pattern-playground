# Episode 07: Research & new pattern entries — walkthrough

Scope: branch `split-project` against merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c`. Territory: the workflow research arc and first-stab entry (adf24f7, 6168ead, 367a5a5, 957009a), the semantic-zoom entry authored from research (57fabf3), the keyboard-shortcut pattern (28ad72c), the block-based-editing research run (53dd58c), and the research-skill canon-read change (6168ead). This is an unplanned episode — no plan file owns it; that is a standing finding already recorded in the episode map and is not re-litigated here.

The episode adds three pattern entries (workflow, semantic-zoom, keyboard-shortcuts) each preceded or accompanied by a committed `research/<slug>/` run, plus one research run (block-based-editing) that produced no entry, and one change to the research skill itself: a step 2b for reading venue-locked canon directly when API retrieval structurally misses. No commit in scope writes to `references/` or `docs/references.md`; promotion candidates accumulate in the research notes as unchecked boxes.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | Workflow: research arc → first-stab entry | accept |
| 2 | Semantic-zoom entry authored from research | accept |
| 3 | Keyboard-shortcuts: research run and entry in one commit | fix |
| 4 | Research skill gains the canon-read step (2b) | fix |
| 5 | Block-based-editing research run, entry deferred | fix |

## Move 1: Workflow: research arc → first-stab entry

*The move.* Three research commits (arxiv run adf24f7; CSCW-canon addendum 6168ead; Schmidt full-read upgrade 367a5a5) produce `research/workflow/2026-07-10.md` with nine clusters, then 957009a mints `workflow.mdx`: `role: pattern`, `activityLevel: activity`, `mediation: coordination`, five forces, six typed edges, eight direct citations, and an eight-item To-do.

*Answers to.* Answers to nothing on record as a plan. The research note supplies its own warrant: "Three existing pages circle the concept without naming it: delegation's *tuning tools* touchpoint, bot's workflow-automation mode, ai-tuning's skeletal Workflow section" — a gap the corpus names, but no plan file does.

*Backtalk.* The research→entry loop worked as the skill designs it: the run's strongest finding was a correction to the strawman ("the actor externalises a procedure" inverted to system-drafted, actor-repaired — C2), and the entry's definition sentence absorbed it ("handed over to run, opened up to inspect and repair"). Against the minimum pattern test (pattern-definition.md §Minimum pattern test) the entry answers situation, forces, invariant core ("inspect and repair, not construct"), evidence, consequences, and relations — unusually complete for a first stab. The strain is altitude: the addendum's own scope verdict says the organisational forces "switch on with mediation" (C6, C8, C9), the entry files itself as `mediation: coordination` while most of its body addresses self-owned automation, and the To-do already says "The organisational face deserves its own worked treatment" — which reads like the role model's fission signal of prose accumulating variant clauses before the node is a day old. Holding-area contract: respected in letter — no `references/` writes; but the entry cites Dourish and Schmidt directly while their distillation candidates sit unchecked in the note, so the entry now leans on holding-area synthesis with the curation act still owed.

*Question.* Is one node at `activity` altitude with conditionally-switched-on organisational forces the "coarsest node that doesn't lie" (pattern-role-model.md), or does declaring `mediation: coordination` while the body centres individual automation already misstate which situation the move resolves?

*Verdict:* accept — the sitting re-read the entry against the walkthrough's charge and found the coordination content load-bearing, not decorative: the opening sentence spans both faces ("to an agent, to a rule engine, to the rest of the team") and the entry's most distinctive forces ("Map against script", "Whose account is it") are the CSCW ones — strip them and what remains is delegation-plus-bot. The facet reads as a claim about the forces' centre of gravity, not a census of the examples. One coarse node stands under the fission rule: no signal has fired (no inbound link pressure for an organisational-workflow node, no disjoint neighbourhoods), and the To-do's organisational-face line is anticipation, not accumulation.

## Move 2: Semantic-zoom entry authored from research

*The move.* 57fabf3 (inside T4 closure work) adds `research/semantic-zoom/2026-07-08.md` and `semantic-zoom.mdx`: an `alternative` edge to focus-and-context with a reciprocal note, a `complements` edge dividing ownership with item-view, a 🚧-labelled demo, and a "Boundary with focus and context" section held in an MDX comment (lines 50–53), unrendered.

*Answers to.* The workspace-split closure plan's T4 — the research note states "Precedes authoring the pattern-site entry (T4 of the workspace-split closure plan)". Within an unplanned episode, this move alone has a plan hook.

*Backtalk.* The entry is the episode's cleanest fit to the definition: the "Would an outline do?" force imports the literature's *negative* verdict (Bederson's retrospective) into the pattern's own forces, which is what "evidence-seeking, not evidence-proven" (pattern-definition.md) looks like in practice. The ownership split — "Item view owns the rungs and their per-item... transitions; semantic zoom is the coordination move that drives the same ladder for all items at once" — carries scale by edges rather than by minting a role, per pattern-role-model.md. The strain is the commented-out boundary section: the Furnas-ancestry argument exists in full prose but ships invisible, while the `alternative` edge note carries a compressed version of the same claim. The file holds two homes for one judgement, one of them dark.

*Question.* The relationship vocabulary says an alternative edge should "expose tradeoffs rather than synonyms" (pattern-definition.md §Pattern language versus catalogue) — if the edge note already does that, what is the commented-out boundary section waiting for: promotion into body prose, or deletion?

*Verdict:* accept — the dark section is a deliberate hold, neither draft-awaiting-promotion nor residue-awaiting-deletion: both patterns are still shaky, and the author does not want to commit to the details the paragraph describes while the ground under them can move. The compressed edge note carries what is safe to assert now; the full argument waits until the two entries stabilise.

## Move 3: Keyboard-shortcuts: research run and entry in one commit

*The move.* 28ad72c lands `research/keyboard-shortcuts/2026-06-30.md` and `keyboard-shortcuts.mdx` together: forces, a novice-to-expert section built on the satisficing and social-transmission findings, an i18n section with implementation specifics (`ß`.toUpperCase() → `SS`, localStorage remapping, "Test on at least one non-Latin QWERTY layout"), WCAG 2.1.4 treatment, edges to command-menu, agency, learnability, and facets `group: coordination`, `mediation: individual`.

*Answers to.* Answers to nothing on record — no plan, and unlike workflow, no research-note statement of which existing pages circle the gap.

*Backtalk.* The research run is a proto-instance of the method codified ten days later as step 2b: arxiv yielded "no usable signal", S2 429'd, and the evidence came from named seminal works grounded by direct fetch — honest provenance, before the skill required it. The entry's centre passes the minimum test (situation: "an actor who already knows what they want... can invoke it directly"; forces; evidence; relations). Two strains. First, the i18n and practical-guidance material answers "how does this render and behave" more than "what recurring situation does this resolve" (pattern-definition.md) — it is contract-grade content riding in a move node, the seam the decomposition rule exists for. Second, the facets: the other `group: coordination` entries (selection, commenting, notification) are multi-actor coordination moves; keyboard-shortcuts sits among them with `mediation: individual`, and the name itself is the artifact, not the actor's move — the naming rule's standard is "Transient feedback", not "Toast" (pattern-role-model.md §Naming).

*Question.* Does "keyboard shortcuts" survive the naming rule as a Form-like bilingual case — the word naming both the human act and the artifact — or is the honest move name something like *direct invocation*, with the shortcut system as its mechanism?

*Verdict:* fix — the name stays; the facets and the contract-grade content go. `group: coordination` removed (it filed an individual efficiency move among the multi-actor coordination entries; `mediation: individual` stands), and the i18n section trimmed to the situation-level insight — layout is a property of the physical device, character shortcuts don't travel across layouts, modifiers do, remapping belongs with the device not the account — dropping the implementation specifics (`ß`.toUpperCase(), dead-key composition events, localStorage, the pre-ship test checklist). Graph regenerated (node metadata only; both JSON copies in sync).

## Move 4: Research skill gains the canon-read step (2b)

*The move.* 6168ead adds §2b "Targeted canon reads (when retrieval structurally misses)" to `.claude/skills/research/SKILL.md` — name the papers first, ground via WebSearch, fetch and read open PDFs, record direct reads as a distinct evidence class — plus a behaviour rule: "A zero-result question is a method signal."

*Answers to.* Answers to nothing on record; it codifies the method the workflow Q5 gap forced in the same session (commit message: "Skill step 2b codifies the method for venue-locked literatures").

*Backtalk.* The change generalises from one worked case, and the workflow addendum demonstrates the payoff (four clusters the arxiv pipeline structurally could not reach). But the contract now argues with itself: §2b instructs "Fetch open PDFs where they exist... and read them directly", while the untouched "What this skill is not" section still says "Not a full-text extractor — it works from abstracts + TLDRs. Full PDFs are the user's job to fetch and read" (SKILL.md lines 216–217). The keyboard-shortcuts run shows the method predates its codification, so 2b is descriptive of practice — which makes the stale denial the part that now misleads a fresh reader.

*Question.* After 2b, what is the skill's honest self-description — retrieval-with-occasional-deep-reads, or does "not a replacement for deep reading" still name a real boundary, and if so where does it now sit?

*Verdict:* fix — the author's ruling: reading full papers *is* part of the skill. The "not a replacement for deep reading" and "not a full-text extractor" lines (the halves that contradicted §2b) are deleted outright; the author trimmed a proposed "not a systematic reviewer" replacement, leaving the section's remaining boundaries (not a canon editor, not a classifier) to carry it. Step 2b itself stands as codified.

## Move 5: Block-based-editing research run, entry deferred

*The move.* 53dd58c commits `research/block-based-editing/` alone: four clusters concluding that incremental formalisation is a nameable move, the workspace-as-document paradigm is a *foundation* (substrate), transclusion is a seed pending Nelson's full text, and "block-based" is a term owned by a 152-paper visual-programming corpus. No entry, rename, or reclassification lands in the episode.

*Answers to.* Answers to nothing on record as a plan; its warrant is the existing entry's thinness ("The block-based-editor entry is a thin composite pattern (2 graph edges)" — the note's Context).

*Backtalk.* This is the holding-area contract exercised as written: the run's two strongest outputs are corrections to the strawman that motivated it (foundation, not activity pattern; occupied name), exactly the skill's "a run whose strongest finding is a correction to the source story has done its job" — and the human declined to mint, which the other three moves make visible as a genuine choice rather than the default. The cost side: the findings that demand action (rename the language-side node, author the substrate foundation) now live only as unchecked promotion candidates and a to-do update (32fb357), with no plan file to own them — in a repository whose registries convention puts carried work in `plans/`.

*Question.* The run concluded the current entry's name collides and its role is wrong — at what point does *not* acting on a committed correction become the language asserting something it knows to be false?

*Verdict:* fix — the carried work now has an owner: `plans/active/2026-07-block-editing-followups.md` (thin outline, marked for iteration) holds the substrate foundation, the incremental-formalisation placement decision, the Nelson-gated transclusion seed, and the two canon-promotion candidates. One finding adjudicated *against* the research in the sitting: the entry keeps the name "block-based editor" — it is the industry's term, and the visual-programming corpus that owns "block-based" in the literature lives in a different enough community of practice that no practical collision arises; the plan's decision log records this so the note's rename candidate reads as answered, not pending. The declining-to-mint itself stands as the holding-area contract working.
