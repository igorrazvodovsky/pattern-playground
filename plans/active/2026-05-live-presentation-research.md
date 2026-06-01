---
title: "Live presentation research synthesis"
status: "active"
kind: "research-gate"
created: "2026-05-10"
last_reviewed: "2026-05-10"
area: "language"
promoted_to: ""
superseded_by: ""
---

# Live presentation research synthesis

## Context

`src/stories/activities/LivePresentation.mdx` was added on 2026-05-10 as a seed, drawn almost entirely from one Smashing Magazine article (*Designing stable interfaces for streaming content*, 2026-05). The page articulates a coherent move and passes the minimum-pattern test, but its evidence base is narrow and chat-UI-centric. The seed status is currently honest; this plan exists to broaden the evidence before the page hardens.

## Why a research-gate, not just enrichment

The page's central hypothesis — that the same forces appear wherever a system produces output an actor reads in flight (log tails, live captions, real-time translation, collaborative typing) — is plausible but unverified. If it holds, Live presentation is a cross-domain pattern and its forces section should reflect that breadth. If it fails (each domain has its own irreducible forces), the page should narrow back to LLM streaming and drop the broader claim. The decision can't be made without surveying the adjacent literatures. Research first, then either enrich or narrow.

## Goals

The synthesis should answer:

1. *Does the move generalise?* What evidence is there for or against the claim that LLM streaming, log streaming, real-time captioning, simultaneous translation, and live collaborative editing share the same forces?
2. *What variants exist?* If it generalises, what are the domain-specific tactical variations — captioning's latency budget, collaborative editing's multi-author conflict, log tail's lossless-tail expectation, etc.?
3. *What is the evidence for the article's tactics?* The scroll threshold, rAF batching, append-only DOM, `aria-live="polite"` + `aria-atomic="false"` — are these load-bearing across studies, or chat-specific?
4. *What does the accessibility literature say?* Real-time captioning and live transcription have a deeper a11y corpus than chat streaming. What forces show up there that the source article didn't surface?
5. *What is the temporality angle?* How does the research connect streaming surface stability to perceived control, trust, or cognitive load?

## Sources to scan

Initial seeds, not exhaustive.

### Academic
- Real-time captioning (ASSETS proceedings; deaf and hard-of-hearing accessibility)
- Simultaneous translation interface research
- Collaborative real-time editing (CSCW; Google Docs / Etherpad lineage)
- Streaming chat / chatbot UX (recent CHI papers on LLM chat surfaces)
- Trust and supervisory control in real-time systems (Sheridan lineage applied to modern streaming)

### Standards and platform docs
- W3C WAI-ARIA Authoring Practices on live regions (already cited — go deeper)
- WCAG 2.2 success criteria for time-based and updating content
- Platform a11y guidance on dynamic content (Apple HIG, Material, WAI tutorials)

### Practitioner
- NN/g on chat UX, streaming, and real-time interfaces
- Public design-system docs from companies shipping streaming UIs (OpenAI, Anthropic, Google, Microsoft)
- Engineering blogs on streaming render performance (React, Vue, browser teams)

### Within this repo
- `references/Relational design.md` — "expect drift, surface breakdowns" frames interrupted streams
- `references/Understanding Computers and Cognition.md` — Winograd & Flores on breakdowns; abort and retry are breakdown moves

## Approach

Use the `research` skill to scaffold `research/live-presentation/`:

1. Run `/research live-presentation`. The skill creates the folder with `query.yml` and a dated synthesis note.
2. Curate `query.yml` keywords around the five goals. Expected cluster: "streaming UI", "incremental rendering", "live region accessibility", "real-time captioning", "scroll restoration", "auto-scroll behaviour", "rendering rhythm", "perceived stability".
3. Run the synthesis. Review and edit the draft note in repertoire voice.
4. If a load-bearing reference emerges, distil into `references/<filename>.md` with a project takeaway and add a one-line entry to `docs/research/references.md`. Promotion is a deliberate act, not automatic.

## Expected outputs

- `research/live-presentation/query.yml` — persistent query specification
- `research/live-presentation/2026-05-XX.md` — initial synthesis note
- One or more of, depending on findings:
  - Enrichment to `LivePresentation.mdx` (broader forces; named domain variants; stronger evidence section)
  - Narrowing of `LivePresentation.mdx` if the cross-domain claim fails (drop or qualify the "Beyond chat" section)
  - New `references/*.md` files for canon-worthy sources
  - New typed edges to patterns or qualities the research surfaces (e.g. to a real-time captioning pattern if warranted; to qualities like Density or Adaptation if rhythm research connects there)
  - `docs/research/references.md` updates for any promoted references

## Risks and trade-offs

- *Scope creep into adjacent activities*. Real-time captioning and collaborative editing are large literatures. Stay focused on what informs Live presentation specifically; log tangential findings without synthesising them.
- *Negative results matter*. If the cross-domain hypothesis fails, that's a useful finding. Frame the goal as "test the hypothesis", not "support the hypothesis".
- *Authority creep*. Until the research runs, the seed page should keep its seed-status signals (fun meter framing, "Beyond chat" qualifier, narrow reference list). Don't upgrade authority claims before the research is in.

## Dependencies and sequencing

- *Not blocking on neighbour edits*. Cross-references from Bot, Generated content, Conversation, Transparent reasoning, Temporality, Accessibility, and Abort can land independently and reference the seed as it stands. The research informs the page's body, not its incoming edges.
- *Not blocking other plans*. Isolated; no conflicts.
- *Optional follow-up*. If cross-domain variants emerge as substantive, consider a separate plan to author them as patterns of their own (e.g. a real-time captioning pattern). Not committed to here.

## Files

| Phase | Action | File |
|-------|--------|------|
| 1 | Run | `/research live-presentation` (creates the folder) |
| 1 | Author | `research/live-presentation/query.yml` |
| 2 | Author | `research/live-presentation/2026-05-XX.md` (synthesis) |
| 3 | Maybe modify | `src/stories/activities/LivePresentation.mdx` |
| 3 | Maybe create | `references/<filename>.md` (one or more) |
| 3 | Maybe modify | `docs/research/references.md` |

## Open questions

- *Net width*. Default to 2018+ for active retrieval, 1-hop backwards via citation trails. CHI 2020–2026 covers most modern streaming UX; ASSETS for accessibility; CSCW for collaborative real-time. Older work probably only matters via citations from newer work.
- *Whether to author real-time captioning as its own pattern*. If the literature treats captioning as distinct enough to deserve a pattern, that's a follow-up plan, not a sub-task here.
- *Whether the "two pacers" framing survives*. Mine, not literature-derived. The research may surface a more established vocabulary; if so, adopt it.

## Status

Not started. Authored 2026-05-10 alongside the seed page as a follow-up gate before the page hardens.
