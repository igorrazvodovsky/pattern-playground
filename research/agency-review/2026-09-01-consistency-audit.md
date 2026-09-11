# Consistency audit of the agency scoping review — 2026-09-01

Generated via a hand read in session, no retrieval. Source: Zhang, Wang & Yi 2025, *Exploring Collaboration Patterns and Strategies in Human-AI Co-creation through the Lens of Agency* (PACM HCI CSCW413, arXiv:2507.06000v2), read from the PDF text and from `references/Collaboration through agency.md`. Companion to the concordance and the source triage generated the same day by two workflows (see the plan, `plans/active/2026-09-agency-review-digestion.md`). This note records what in the review cannot be taken at face value, so the sittings know which parts are reading aids and which are claims.

## 1. The agency-level taxonomy is stated five ways

The review's five agency patterns are named, ordered, and counted differently in each place they appear.

| Where | Levels as stated |
|---|---|
| Fig. 1 (framework diagram) | Passive, Reactive, Semi-proactive, Co-operative, Proactive |
| §5.1 count paragraph, "using the terminology from [136]" | Passive 18, Reactive 34, Semi-active 12, Proactive 9, Co-operative 33 (sums to the 106 coded systems) |
| §5.1 pattern paragraphs, in order | Co-operative, Proactive, Semi-active, Re-active, Passive |
| Appendix B | "passive, semi-active, reactive, proactive, cooperative", attributed to "Rammert et al.'s framework [118]" |
| Appendix Table 3 | Passive, Reactive, Semi-proactive, Proactive, Automatic; no Co-operative row |

Table 3 is not a partition: its rows list 8, 100, 116, 74 and 38 distinct papers over a set the body says is 106, so most papers sit in three or four rows at once, and "Automatic" appears nowhere in the body. The Fig. 5 counts and Table 3 cannot be reconciled. The attribution is also crossed: reference 118 is Mieczkowski's 2022 Stanford thesis on AI-mediated communication; Rammert 2008, *Where the action is*, is reference 136, which is what the body cites. Whether Rammert's levels are these five, in this order, is a question for the source read of [136].

Two definitions drift between the count paragraph and the pattern paragraphs. The count paragraph defines Passive as "acting only upon direct user invocation" and Semi-active as "initiating actions under specific conditions". The pattern paragraphs then define Passive as the AI's "subtle influence on human dynamics" (ambient effect on group roles and common ground) and Semi-active as "AI providing support when requested by users", which is the count paragraph's definition of Passive. So the two lowest levels swap meaning inside one section.

`agency.mdx` in this corpus carries a sixth ordering, "Passive → Reactive → Semi-active → Proactive → Co-operative", and describes it as "a five-level spectrum, with each level building upon the previous". The review does not make the ladder claim; it calls them patterns and reports a distribution. The ladder reading is the corpus's own over-reading of the paste and should not survive the first sitting unless something else grounds it.

## 2. The mechanism catalogue mixes levels

The review presents twelve control mechanisms as one kind of thing, organised on an input, action, output, feedback cycle. Read against this corpus's role model (moves become patterns; experiential dimensions become qualities; substrate becomes foundations), they are at least four kinds. A first sorting, to be tested by the concordance:

- *Interaction moves.* Modification and intervention (all four sub-approaches: direct edit, parameter and prompt control, real-time intervention, accept or reject); chain-of-thought display; confidence visualisation and confidence-based ranking; the visual highlighting of AI contributions under explanatory feedback; interface-supported input guidance; interaction tracking, decision visualisation and system explanation under transparency. These are situation, action, consequence, and they are where pattern homes are expected.
- *System capabilities or substrate.* Context awareness and memory retention; multimodal action space exploration; attention-focused processing. The last is described in the review's own words as a model-internal mechanism ("in a machine-translation system, attention mechanisms can focus on certain words") and is not an interaction control at all; its two cited interface examples (focusing writer attention, visualising cross-attention) belong to other mechanisms.
- *Role-allocation settings that restate §5.2.* Action coordination's five "patterns" (complementary roles, human-dominated with AI support, shared creative agency, technical precision and control, autonomous AI within human frameworks) are locus settings, the same axis as Dimension-1. Adaptive scaffolding's three modes (system-controlled, user-driven, hybrid) are Dimension-2's static/dynamic allocation applied to assistance level.
- *A stage restated as a mechanism.* The iterative feedback loop (user-directed, system-initiated, bidirectional) is the Collaborate stage of §4.1 seen from the feedback slot of the cycle.

Two sub-approaches are neither moves nor dimensions: user-centered input optimisation is the actor's prompt-refinement practice, not a design mechanism, and ideological reflection under transparency is a research-through-design stance (the typewriter juxtaposition, the entoptic camera) rather than a control an interface offers.

The point for the sittings: roughly half the catalogue is moves and can route to patterns and sequences; the rest is dimensions, substrate or stages wearing mechanism labels, and routes to qualities, foundations, or nowhere.

## 3. Smaller points

- The "Input-Process-Output-Process (IPOF)" model is attributed to Wiener's *Cybernetics* [192]. The acronym does not match its own expansion (the usual schema is input, process, output, feedback), and Wiener states no such model; it is the generic systems schema. Low stakes; the four-slot cycle is a presentation device, not a finding.
- The Sankey pathways of §9.2 (stage → modality → agency pattern → mechanism → domain) are co-occurrence counts across the coded papers. They describe which configurations the literature has built, not an order in which design decisions are taken. They are the closest thing in the review to this corpus's sequences and are not the same kind of object; sitting 4 states the contrast.
- Scope: creative co-creation only; routine automation and purely analytical assistance excluded; literature to August 2024, before agentic tools. The review's silence on the assistance floor and on delegation and governance is not evidence about them.
- Fig. 4, 6 and 7 are described as "generated by ChatGPT and modified by authors"; they carry no evidence.

## What this changes

The framework's dimensions (locus, dynamics, granularity; the six stages) are borrowed and internally consistent, and can be judged on their sources. The five-level taxonomy is not stable enough in the review itself to adopt in any ordering; if the corpus keeps an initiative spectrum, it will have to come from Rammert, Horvitz, or the assistance-escalation ladder the corpus already built from moves. The mechanism catalogue is a useful inventory of moves once the non-moves are set aside, and its value lies in the exemplar systems it points to rather than in its own categories.
