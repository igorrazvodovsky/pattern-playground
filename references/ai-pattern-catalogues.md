# AI pattern catalogues — cross-source triage

A survey of six public AI UX pattern libraries, run 2026-08-07 to find candidates
they have in common and to route each candidate into this project — as
enrichment of an existing entry, as a new seed, or as declined. The seeds
created from this triage carry `seed: true` and cite this file's sources.

## The six sources

| Source | Author/kind | Entries | What "pattern" means there |
|---|---|---|---|
| [shapeof.ai](https://www.shapeof.ai) | Emily Campbell, curated catalogue | 57 | Recurring feature/interaction motifs from shipping products; granularity spans interaction move (Regenerate), product feature (Memory), policy (Consent), and brand element (Avatar) |
| [aiuxpatterns.com](https://www.aiuxpatterns.com) | Luke Bennis, solo side-project | 29 | Concrete widget-level UI mechanisms for the prompt→generate→review loop, each with a Figma prototype; drifts into product mechanics (Generation Tokens) |
| [aiuxdesign.guide](https://aiuxdesign.guide) | Productised guide + audit service | 38 | Mix of interaction moves (Intent Preview), whole paradigms (Conversational UI), and programme-level commitments (Responsible AI Design); Problem/Solution/Trap skeleton is Alexander-adjacent |
| [ai-interaction.com](https://ai-interaction.com) ("AI Interaction Atlas") | Open-source reference, React SPA | 71 tasks + vocabularies | Capability verbs / workflow node types (Generate, Review & Approve, Semantic Cache) with typed IO and typed relations — a flowchart vocabulary, not situated design responses |
| [ai.designdhaval.com](https://ai.designdhaval.com) ("AI Interface Layout Library") | Dhaval, layout library | 27 | Screen-level layout archetypes (Conversational Chat, Prompt + Canvas, Agent Dashboard) — whole-interface spatial arrangements with zones and flows |
| [aiuxplayground.com](https://www.aiuxplayground.com/patterns) | Catalogue + teardowns | ~173 | Interface mechanisms at wide granularity, from micro-behaviour (Streaming) through component (Follow-up Chips) and governance design (Autonomy Budgets) to plain ML features (Dynamic Pricing) |

No source uses "pattern" in this project's sense — a named, evidence-seeking
interaction move with situation, forces, and typed relations. The closest
relatives on each axis: aiuxdesign.guide on page structure (problem/solution/
failure mode), the Atlas on typed edges (enables / commonly-preceded-by /
incompatible-with, each with strength and a prose reason), shapeof.ai on
evidence discipline (real-product screenshots, occasional counterexamples).
None has generative sequencing; all treat AI patterns in isolation from the
rest of interaction design.

## How they categorise

Recurring axes across the six schemes, and where each lands in this project:

- *Stage of the prompt→generate→review loop* (aiuxpatterns' five tags; most of
  shapeof's Wayfinders→Inputs→Tuners→Governors arc; the Atlas's
  inbound/internal/outbound/interactive layers) → maps to this project's
  `lifecycle` facet and to `precedes` chains, not to a category tree.
- *Concern or value served* (all of aiuxdesign.guide's eight categories —
  trust, safety, privacy, collaboration; shapeof's Trust Builders; playground's
  Trust) → maps to qualities (`enacts`) and foundations (`serves`), not to
  pattern groups. Their "trust patterns" are mostly moves whose effect is
  legible through a trust-ish lens.
- *Surface or modality* (playground's Inputs/Outputs/Audio) → maps to the
  modality foundation and component realisation, not classification.
- *Product genre* (playground's Chatbot/Design Tools/Commerce) → maps to
  `domain`; genre entries are mostly other patterns wearing a vertical's
  clothes (Semantic Search is searching; Smart Comparison is coordinated
  views).
- *Actor* (Atlas's ai/human/system) → this project doesn't split by actor;
  mediation and the agency configurations carry it.
- *Maturity/adoption* (designdhaval's Core/Advanced/Future tiers; playground's
  essential-vs-rest tiering) → maps to epistemic status (`seed`, `evidence`),
  not to grouping.
- *Layout altitude* (designdhaval entirely) → screen archetypes sit at the
  workspace/navigation altitude here; most are compositions of existing
  patterns (chat = conversation + workspace; agent dashboard = activity log +
  status feedback + problem-curated view).

Takeaway: the category schemes disagree because they cut on different axes,
and every axis they use already has a home in this project's facets, quality
edges, or foundations — evidence for the flat-tree, typed-graph stance rather
than for an "AI" category. A second corpus-wide observation: the agentic wave
(2025–26 entries: autonomy, budgets, approval, audit) was bolted onto every
scheme late and fits none of them; here it lands as patterns serving the
delegation foundation's stations.

## Commonality → disposition

Candidates attested across three or more sources. "Covered" = enrichment
material for an existing entry; "seed" = new `seed: true` page created from
this triage.

| Recurring candidate (source names) | Disposition |
|---|---|
| Prompt starters, suggestions, follow-up chips, nudges | Covered: [suggestion], [state-empty], [agent-opening], [next-best-action] |
| Templates, structured/paginated prompts, madlibs, tone/persona controls | Seed: **prompt-scaffolding** (decomposes stubs in [prompt]) |
| Attachments, reference material, context chips/@-mentions, connectors | Seed: **reference-material** (decomposes stubs in [prompt]) |
| Prompt enhancer, quality feedback, editing assistance | Folded into **prompt-scaffolding** (quality-feedback arm); relates [validation] |
| Regenerate, variations, branches, partial regeneration/inpainting, output comparison | Seed: **regeneration** (decomposes stubs in [generated-content]) |
| Response refinement, expand/restyle/restructure/transform, magic edit, result actions | Seed: **instructed-revision** (third leg of the regenerate / hand-edit / instruct triangle) |
| Smart diff, review-AI-changes-before-they-stick | Seed: **change-review** (produces the delta approval-gate acts on; pre-AI lineage in code review and track changes) |
| Streaming, progressive enhancement, mid-stream controls | Seed: **streaming-output** |
| Citations, source browser, references, retrieval preview | Seed: **citation** (decomposes stub in [generated-content]) |
| Confidence scores/indicators, caveats, uncertain language | Seed: **expressed-uncertainty** (decomposes stub in [generated-content]) |
| Action plan, intent preview, plan summary, sample response, blast radius | Seed: **plan-preview** |
| Approval workflows, human-in-the-loop, verification, suggest/confirm/execute | Seed: **approval-gate** |
| Autonomy spectrum/budgets, per-action autonomy, delegate authority, escalation thresholds | Seed: **bounded-autonomy** |
| Human handoff, graceful handoff, escalation pathways | Seed: **handoff** (the pattern for delegation's named handoff/takeback station) |
| Memory, memory scope, selective memory, incognito, memory graph | Seed: **selective-memory** |
| Cost estimates, tokens/meters, budget ceilings, draft mode economics | Seed: **cost-transparency** |
| Chat artifacts, prompt+canvas, rendered result preview | Seed: **detached-artefact** (name unsettled) |
| Disclosure, watermark, AI badges/colors, agent identity, provenance | Seed: **provenance-marking** |
| Stream of thought, chain of thought, progress steps, footprints, thinking visualisation | Covered: [transparent-reasoning] (enrich with the collapsed-trace and footprints forms) |
| Stop/interrupt/resume, interruptibility | Covered: [abort] (enrich: resume-with-context) |
| Audit trail, action logs, responsibility attribution | Covered: [activity-log] |
| Checkpoints/restore, reversibility marking, time-delayed execution | Covered: [undo], [action-consequences], [draft-and-publish] (enrich: agent-scale recovery) |
| Copilot / inline action / workspace-native integration / context panel | Covered: [embedded-intelligence], [inline-interface] |
| Feedback loops, thumbs, reward signals | Covered: [ai-tuning] |
| Model/mode selection, parameters | Declined as pattern: [settings] + [bounded-choice] furniture; the real move (quality–speed–cost trade-off) rides on cost-transparency |
| Onboarding wizards, galleries, capability tours | Covered: [onboarding], [help], [capability-and-scope], [state-empty] |
| Voice input/output family | Covered at foundation altitude: [modality]; individual voice mechanics stay componentward |
| Safety/crisis/vulnerable-user policies (aiuxdesign.guide) | Declined: organisational policy with UI consequences, not interaction repertoire |
| ML capabilities dressed as patterns (dynamic pricing, voice cloning, inventory prediction; the Atlas's AI verbs) | Declined: capability vocabulary, closer to `concepts/` than to patterns |
| Multi-agent orchestration, agent marketplace, control center | Watch: premature to seed; territory noted on [agent] |
| Generative/adaptive UI | Watch: rides on [malleability] and [adaptation] qualities for now |

## Project takeaways

- The commonest cross-source material was already here (suggestion, abort,
  undo, activity log, transparent reasoning, the conversation family) — the
  gaps were concentrated in two places: the *output-negotiation* territory
  compressed inside [generated-content], and the *delegation checkpoint*
  territory (plan → approve → bounds → handoff) that the 2025–26 agentic wave
  made visible.
- Grounding stance confirmed: every seed from this triage connects to
  non-AI patterns (form, template, wizard, undo, inline confirmation,
  editing in place, status feedback, link preview, annotation, coordinated
  views) — the integration these catalogues lack.
- The Atlas's edge vocabulary (strength + prose reason per edge) is the one
  structural idea worth watching; its `incompatible_with` has no counterpart
  here and might one day argue for a conflict-type edge.
