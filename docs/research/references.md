# References index

Research inputs for pattern development. Each entry summarises what the project
*takes from* the source. Full files live in the top-level
[`references/`](../../references/) directory for deeper reading.

## Design theory

- `semilattice.md` — Alexander's argument that natural cities are semilattices, not trees (1965).
  *Project takeaway*: no single classification tree captures the pattern space. The graph is a primary navigational surface, not a secondary annotation on the tree. Bowker & Star's typological/topological distinction reinforces this — the project favours topological (proximity, connectivity) over typological (discrete bins). Grounds the "multiple projections" commitment in `docs/project/core-beliefs.md`.

- `Design patterns.md` — Alexander's design patterns and generative systems (*A Pattern Language*, *The Nature of Order*).
  *Project takeaway*: patterns are not catalogue items but generative moves — transformations that produce centres while preserving existing structure. Design happens through sequences of structure-preserving moves, not through selection from a menu. This framing shapes the entire relationship vocabulary (`docs/language/relationship-vocabulary.md`).

- `hci-pattern-languages.md` — HCI pattern-language literature: Dearden & Finlay's critical review, Fincher's pattern-language genre test, Bayle et al.'s CHI workshop report, Borchers' pattern approach to interaction design, van Welie's interaction-pattern and pattern-language work, Engel/Martin/Forbrig's transformation-pattern account, Seffah & Taleb's pattern-oriented design survey, Erickson's lingua-franca argument, and da Rosa & Silveira's 2022 development framework.
  *Project takeaway*: an HCI pattern should carry situation, problem, forces, invariant move, meaningful abstraction, rationale, evidence, actor/context variables, consequences, values, and relations. A pattern language is not a catalogue; it has an organising principle and connected structure that helps actors generate and sequence design moves. Pattern languages can also support context-of-use transformations and process-oriented composition, but transformation rules and composition rules should remain distinct from the core interaction moves they operate on. Mature pattern work needs a lifecycle: planning, discovery, confidence rating, validation, publishing, use, and revision. Grounds the stronger operational definition in [`pattern-definition.md`](../language/pattern-definition.md).

- `Concept design.md` — Jackson's concept design (*The Essence of Software*).
  *Project takeaway*: software is a network of interacting concepts, not a collection of features. Concepts are defined by purpose, not by UI surface. The project's `src/stories/concepts/` directory houses concept-level patterns that sit between abstract principles and concrete components.

- `Relational design.md` — A relational design framework for human-AI-software interactions.
  *Project takeaway*: relationships between actors (human, AI, software) are characterised by what they require, enable, risk, embody, and how they evolve. Design for autonomy, expect drift, surface breakdowns. Informs the project's treatment of human↔AI collaboration patterns.

- `Understanding Computers and Cognition.md` — Winograd & Flores on language, action, and breakdowns.
  *Project takeaway*: meaning arises in interpretation, not in data. Systems support conversations and commitments, not just task completion. Breakdowns are design opportunities. Informs the project's emphasis on situated action and its scepticism toward over-formalisation.

## AI and interaction

- `Collaboration through agency.md` — Zhang et al. scoping review of human-AI co-creation through the lens of agency (CHI/CSCW literature).
  *Project takeaway*: agency in co-creation has five patterns (passive → reactive → semi-proactive → co-operative → proactive) distributed across locus, dynamics, and granularity. Control mechanisms span input, action, output, and feedback. Informs the project's Agency quality and the agency-related pattern family.

- `Bridging Gulfs.md` / `semantic-guidance-for-ui-generation.md` — Park et al. on semantic guidance for UI generation (CHI 2026). The second file is a project-specific notes distillation.
  *Project takeaway*: effective AI-driven generation requires structured semantic input at four levels (product → design system → feature → component). Design systems already contain the knowledge AI needs, but it's implicit. Making it explicit — visual mood, tone of voice, state semantics, interactivity — improves generation quality. Relevant to how the project documents patterns for agent consumption.

- `DIRA.md` — Bergström & Hornbæk's DIRA model of the user interface (Devices, Interaction Techniques, Representations, Assemblies).
  *Project takeaway*: a structural decomposition of what a UI *is*, independent of paradigm. Useful as an analytical frame when the project's patterns need positioning relative to the UI as a whole — which element of the interface does a given pattern primarily act on?

## Prose and rhetoric

- `rhetoric-of-hyperlink.md` — Venkatesh Rao's 2009 *Ribbonfarm* essay on the hyperlink as rhetorical technology.
  *Project takeaway*: authored links are prose moves, not references. Three modes — citation, form-content blending, figure-ground-voice integration — give the library a vocabulary for what "hard" (author-placed) linking does. "Yielding the stage" reads larger than linking: it names an authorial stance that trusts the reader to construct meaning, mirroring the library's human-centric [agency](../../src/stories/qualities/Agency.mdx) framing from the author's side. Primary citation in the `Prose` foundation's § *Stance and voice* and § *Link rhetoric* sections.

## Harness engineering

- `openAI-harness.md` — OpenAI's harness engineering note (Lopopolo, 2026). Building a product with 0 manually-written code.
  *Project takeaway*: agent-facing knowledge should be a "map, not manual." Repository-local versioned artifacts are all agents can see. Progressive disclosure, mechanical enforcement of invariants, and recurring cleanup ("garbage collection") keep agent-generated codebases coherent. Directly shaped the project's AGENTS.md and docs/ structure.

- `harness-eng.md` — He et al. academic paper on harness engineering: control, agency, and runtime (CAR).
  *Project takeaway*: the harness layer decomposes into control (AGENTS.md, tests, permissions), agency (tools, APIs, delegation), and runtime (state, retries, traces). Many reported agent gains are harness-sensitive, not purely model-driven. Provides the vocabulary for reasoning about the project's own control layer.
