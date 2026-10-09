---
title: Rule composition — classifying the rule-builder territory
status: active
kind: exec-spec
created: 2026-08-28
last_reviewed: 2026-08-28
area: language / patterns
promoted_to:
superseded_by:
---

# Rule composition — classifying the rule-builder territory

The [delegating-work sitting](2026-08-delegating-work-sequence.md) read the authored
sequence against Noessel's *Designing Agentive Technology* and surfaced the
*constrained natural language builder* as a pattern-shaped gap (finding 15 holds one
half of it). This document is the classification trace: the residue attribution that
decides whether the territory is a node, the research gate that tested the strawman,
and the edit set that follows.

The handoff brief that opened this sitting argued the case against `form` — a form
collects values into fields, a builder composes a predicate. That was the wrong
opponent. `form` was never the threat; [`workflow`](../../apps/patterns/src/content/patterns/workflow.mdx)
is, and the brief does not mention it.

## The threat: workflow already claims the territory

`workflow` is a mature `evidence: literature` node with Dourish, Schmidt, Suchman and
Bowers behind it, and it claims, in its own words:

- the situation — the actor "wants to hand it over: to an agent, *to a rule engine*, to
  the rest of the team"
- the notation — "a node graph, *a trigger–action rule list*, a pipeline definition —
  the pattern is indifferent to the notation"
- the force — *Foreseeing effect*: "the hardest part of authoring a rule is not writing
  it but estimating what it will do to live cases before it runs"
- the affordance — *Effect preview*: "rehearse the rule against real or historical cases
  before committing authority to it"

Two of its standing to-dos are this territory by name: "Trigger–action rule lists and
pipeline configurations as examples at other points of the formality spectrum" and
"Connection to constrained natural language builder". `filtering` carries a third
("Complementary patterns to capture: constrained natural language builder, rules,
search") and `formality` names query builders in its pattern list.

Three to-dos pointing at a thing is equally consistent with *a node is missing* and
*two existing pages owe a section*. The residue test decides it.

## Residue attribution

The role model's rule: attribute every chunk to an existing neighbour first. Residue
serving one container is a *gap* — document it at the altitude that already works.
Residue with its own forces and instances *beyond the page that surfaced it* is a
pattern.

| # | Chunk | Nearest existing home | Verdict |
|---|---|---|---|
| 1 | Clause composition — a condition assembled from clauses (field, operator, value), added and deleted, combined with and/or/not and a parsing order | `workflow` holds it only where the rule is a procedure handed over to run. `bounded-choice` holds one clause's value pick, not the assembly. `form` holds a fixed field set; here the field set is open and the actor adds to it. | *Residue.* |
| 2 | The composed condition's meaning is visible only through its effects — preview by edge cases (newly matches, barely matches, barely fails) | `workflow` names the force and the affordance, scoped to procedures. `plan-preview` is one run's intention; `validation` is this input's correctness. | *Residue, shared force.* Needs one owner; `workflow` cites it. |
| 3 | Exception lists — blacklist and whitelist as objects to review, clear, and start over from | `ai-tuning` (empty Filters section), `selective-memory` (per-item inspect and delete) | *Adjacent.* An exception is the escape from editing the rule, not an act of it. Edge, not absorption. |
| 4 | Entry from the misfire — adjust the rule in the context of the false positive that exposed it | delegating-work's tuning step; `instructed-revision`; `agent-repair` | *Not a chunk.* This is the node's initiating situation. |
| 5 | Start from a generated or default rule rather than a blank canvas | `good-defaults`; `workflow`'s *First draft* section and its *blank canvas* force | *Owned.* Cite, do not restate. |
| 6 | Rule as trigger plus method, shown together | `workflow` — the procedure side, and its formality spectrum | *Owned by workflow.* |

Chunks 1 and 2 are residue, and the residue has instances well beyond the page that
surfaced it. The discriminating case is the saved filter: a predicate with *no action
at all* — no steps, no order, no executor, no account. None of `workflow`'s apparatus
(maps and scripts, appropriate ambiguity, deviation as reconfiguration, the
prescription–account gap, executors and audiences) applies to a smart playlist's
condition or a Linear filter bar. `workflow` cannot host it without lying.

Beyond the filter: an autonomy bound (`bounded-autonomy`'s scope, spend, time and risk
edges are clauses on authority, not a procedure), a saved search, an alert threshold, a
spam rule, a firewall rule. The corpus reaches the same surface from three directions —
filter composition in composing views, AI tuning in delegating work, bounds in governing
autonomy — which is what fission from three directions looks like.

## Verdict: a node, narrower than the brief proposed

Not "standing behaviour as an editable predicate" — that phrasing collides head-on with
`workflow`, which owns standing behaviour as an artifact. The node is *the unit a rule
list is a list of*: one condition, composed.

The part–whole story is clean and does not contradict `workflow`. `workflow` keeps the
prescription-as-artifact claims at activity altitude; rule composition owns the
composition of a single rule at action altitude, and *enables* the workflow whose
notation is a rule list — the same shape as `bounded-choice enables form`.

Effect preview stays inside the node rather than becoming its own seed (finding 15's
open question, resolved). It has no meaning apart from a composed condition, and the
role model's rule is to default to the coarsest node that doesn't lie. `workflow`'s
repair-loop bullet cites it rather than restating it.

### Name

`workflow`'s own vocabulary settles the naming test. The practice community calls the
surface a rule builder, a filter builder, a query builder, a segment builder — all
names for the *component*, which is exactly what the naming rule refuses ("Transient
feedback", not "Toast"). *Rule composition* names the move, transfers to every
realisation (a chip bar, a plain-language sentence with adjustable spans, a nested
clause tree), and collides with no existing head noun.

## Research gate

Run 2026-08-29, after the strawman above and before the edges were locked. Nine papers, seven of them reached by named canon read rather than by
retrieval: this literature sits in CHI, UbiComp/IMWUT and JASIS and barely touches arxiv.
Semantic Scholar was rate-limited throughout, so lineage is owed on a refresh.

The gate confirmed the node and corrected the strawman in four places.

*Confirmed — the rule is the unit, and it is separable.* Ur and colleagues found 78% of 318
people's desired smart-home behaviours fitted one trigger and one action; two years later
they counted 224,590 shared single-rule programs from over 100,000 authors. The multi-step
procedure is the minority case in the literature that studies this surface, which is the
separability argument the residue attribution was reaching for.

*Confirmed — the difficulty is on the condition side.* The rule anatomy the field settles on
is trigger (over events), condition (over states), action, and the failures cluster in the
first two. Zhang and colleagues found the event/state confusion in 21 of 50 unaided sessions,
and all 21 ended in failure; Huang and Cakmak had argued seven years earlier that the
interface's wording creates it. Nothing comparable is reported on the action side.

*Correction 1 — effect preview is attested, but not as boundary sampling.* The strawman took
Noessel's edge-case list (newly matches, barely matches, barely fails) as the move. The
literature converges instead on replaying the changed rule against the record of what
happened, and on simulating it against the rules already standing. Noessel's form is a
designer's proposal; replay is the one with study evidence. The page leads with effects over
cases and treats all three as forms, ordered by how well each is evidenced.

*Correction 2 — the rule is the unit of authoring, not of meaning.* Not in the strawman at
all. EUDebug's object is "the set of all defined rules"; Zhang and colleagues coded a matching
obstacle in which actors assume opposite rules cancel, that rules fire in list order, and that
a condition on one rule constrains the rest. The page carries this as a force and as a
resulting clause.

*Correction 3 — "Booleans are hard" is the wrong statement of the force.* Young and
Shneiderman recorded fifty parenthesis errors in SQL against two ordering errors in the
graphical equivalent, over the same tasks. The operators are not the problem; the grouping is.
The force is stated as combination against legible grouping.

*Correction 4 — `workflow`'s *Foreseeing effect* force is mis-scoped.* Its wording is right
and evidenced, but every study grounding it studies single rules. The force moved to the new
node and `workflow` now cites it.

## Edit set — executed 2026-08-29

1. New `apps/patterns/src/content/patterns/rule-composition.mdx`. `seed: true`,
   `evidence: [literature]` (the product survey the disclosure asks for is still owed, so `observed` is not claimed), `activityLevel: action`, `lifecycle: application`.
   Edges authored here only, to keep one home per pair: `enables` to workflow, filtering and
   ai-tuning (the three directions); `composed-of` bounded-choice; `complements`
   bounded-autonomy and good-defaults; `related` prompt-scaffolding and form; `enacts`
   malleability and formality. The disclosure names the actual weakness — the automation-rule
   and query-builder literatures have never cited each other, so treating them as one move is
   this entry's claim rather than an attested one.
2. `workflow.mdx` — the rule-list and constrained-natural-language-builder to-dos close, with
   the procedure-shaped half named as what stays; the notation sentence and the repair loop's
   effect-preview bullet cite the node; *Foreseeing effect* hands the force over.
3. `filtering.mdx` — to-do half-closes; search stays open.
4. `ai-tuning.mdx` — the empty Filters section gets its content pointer.
5. `bounded-autonomy.mdx` — bounds named as composed clauses.

`npm run extract-graph` and `npm run build -w apps/patterns` both green; 135 nodes, 757 edges,
no axis advisories. The baseline build was green before the edits.

## Flagged for the sequence sitting — executed 2026-08-29

- *Sequence layer.* delegating-work's tuning step gained rule composition as a
  constituent, and its form call's note now carries this node's corrected borrowing
  claim (the clause editor borrows the form's machinery; the field set stays open).
- *The sitting's findings list.* The delegating-work trace's finding 15 is marked
  discharged and points here; this document stays the classification record.
