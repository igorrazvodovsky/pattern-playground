# World ontology specification

`shared/world/` is the authoritative form of the fixture world both surfaces
render. It holds four kinds of phenomena — individuals, values, actions, facts
— rather than composite entity objects, following the ontology in Meng et
al.'s *Making Software Meaningful* (`references/Making software
meaningful.md`, §4). `shared/data` assembles the entity shapes the repo
consumes as derived views over it.

The point of the arrangement is that an entity object conflates an
individual's identity with the facts about it, and conflates both with the
history that produced them. Separating the three means a demo can show state,
provenance, or history from one source without any of them being invented
separately.

## The four phenomena

- *Individuals* — entities with persistent identity. An individual is a bare
  `{id, kind}` pair in `individuals.json` and nothing more; every property it
  appears to have is a fact. The kind is not a fact, because it is what the id
  refers to rather than something that happened to it. Individuals are never
  interpreted or decomposed: an id is matched by identity alone.
- *Values* — data interpreted by structure and content: strings, numbers,
  booleans, dates, and larger structured objects such as a document body or a
  product specification. Values have no identity and are stored inline where
  they occur. A structured value stays whole; it is not decomposed into facts.
- *Actions* — atomic occurrences. An action record in `actions.json` has an
  actor, a timestamp, named input and output participants, and its effect
  stated as facts added and removed.
- *Facts* — assertions about an individual, or relations between an individual
  and another individual or a value: `{relation, subject, object}`.

## The log is the source of truth

The world starts empty. There are no initial conditions: every individual's
existence and every current fact is attributable to an action.

`facts.json` is *generated* by replaying the log from the empty world.
`scripts/world/replay.ts` is its only writer, and `--check` runs in the lint
gate, so a hand-edit of the fact set fails the build. Edit the log, never the
facts.

An action's timestamp is what dates the thing it produced, so no relation
records a creation or revision date. Where source data disagrees with the
timeline, the timeline is authoritative.

The log holds more than one strand of time. The workspace runs to 17 January
2024; the circular-economy catalogue is recorded across 2025–26; the ledger
runs through 2024, and a lifecycle assessment follows one tracked item from
2010 to 2026. Nothing constrains them to one span: every derivation is scoped
to a single subject — a user's latest action, a product's listing action — and
no fact crosses between strands. What is constrained is per actor: no action
may postdate its actor's sign-in, since that is what fixes their last activity.
The system actor has no sign-in and so no ceiling.

## Relations

`relations.json` is the machine-readable registry; replay enforces it. Per
relation it declares:

- `subject` — the kind(s) the subject id may have;
- `object` — `"id"` (another individual), `"value"`, or absent for unary facts;
- `cardinality` — `"one"` or `"many"`. Adding a one-cardinality fact replaces
  the subject's previous value; many-cardinality facts accumulate in authored
  order and are removed only by an explicit `removes`.

Declared cardinality with replace-on-assert and explicit retraction is what
keeps facts from silently piling up as the log grows.

## Action types

`action-types.json` declares, per type, which relations its `adds` and
`removes` may touch; replay rejects effects outside the declaration. Because
each record carries both intent (name and input) and effect (`adds` and
`removes`), and the declaration is checked against both, neither has to be
trusted alone.

Records may carry two conventional value participants: `label`, the actor's
own short description of the act, and `note`, a longer remark.

## What is a fact and what is derived

A fact is authored and idiosyncratic. Anything computable from other facts or
from the log is derived in the view layer, not stored.

Redundant, computable attributes are not facts: a user's display icon, a
`description` that repeats the role, a `searchableText` that merely lowercases
known facts. Idiosyncratic authored text is a fact, carried verbatim from the
action that introduced it — a project's search keywords, a task's description.

Derived by convention:

- a user's `lastActiveAt` — the timestamp of their latest action;
- a project's `updatedAt`/`updatedBy` — the latest action that added or
  removed a fact whose subject is the project, and its actor;
- a task's `createdDate` (its creation action), `updatedDate`/`updatedBy` (its
  latest action), and `history` (all its actions, in order);
- a document's `lastUpdated` — the date of its latest `editDocument` action,
  absent for documents nobody has revised — and its icon, which follows the
  document type;
- a quote's `createdAt` (its creation action), its display name and excerpt
  markup (both built from the `text` it holds), and its description (built
  from the name of its source);
- a comment's `entityType` (the kind of the individual it is `about`), its
  `timestamp` (its creation action), and its `status` — resolved once any
  comment in its thread carries `resolvedBy`;
- a material's, component's or service's `type` — it restates the entry's
  category, or for a component its place in the assembly;
- a product's `listedAt` — the date of the action that listed it;
- a component's `childComponents` — the inverse of the parent each component
  records, so the two directions cannot disagree;
- a service's applicability to everything — one unary fact, rendered back as
  the `"all"` the consuming code matches on;
- causal chains — reachability through `causedBy` edges.

## Records that state no facts

Some actions leave no standing property behind, and their action types declare
empty `adds` and `removes`. A document revision is one: the world holds a
single snapshot of a body, so the revision records only that it happened. A
ledger entry is another — the world holds no accounts for a balance to be a
fact about — and so is a flow counted by a lifecycle assessment. Everything
such a record says lives in its input and output participants, including the
two conventional value participants above.

Where a whole collection is of this kind, its view is assembled from the action
records rather than from facts: a transaction's amount, category and
settlement, a flow's stage, site and kilograms. A settlement that failed is a
value in the record, not the record's own failure: the entry was made, the
payment was not. The individual the records are about is still registered, so a
life is reachable by identity — the item the assessment follows holds no facts
at all, only a history.

## Rules

`rules.json` holds declarative reactions in the paper's `when`/`where`/`then`
form: when an action of some type occurs where certain facts hold, a further
action follows. A rule is a mediator, not a call — nothing in an action refers
to the rules that watch it.

An action caused by a rule cites its triggers in `causedBy` (a list, since a
rule may match several actions) and the rule in `viaRule`, so provenance is
labelled rather than merely linked. One firing may yield several caused
actions, each citing the same rule.

Causal scopes are derived, not stored: a chain is whatever is reachable
through cause edges from a root action, one with no `causedBy`. A failed
action is an ordinary record whose output is an error value — there is no
separate failure machinery.

A rule that exists fires everywhere it matches, and nowhere it does not: if
authoring an action would satisfy a rule's `when` and `where`, the caused
action is authored alongside it. Replay checks this in both directions — a
match with no caused action fails, and a caused action citing a rule that none
of its triggers satisfies fails. The `where` clauses are prose in the paper's
notation, so each rule carries a matcher in `scripts/world/replay.ts` that
decides whether a given action satisfies it, read against the world as it
stands when the trigger has just applied. Replay refuses a declared rule with
no matcher and a matcher for no declared rule, so a rule cannot be added
without a check.

## Kinds whose facts are not in the world yet

Every id the world refers to is registered in `individuals.json`, including
ids whose facts still live in a legacy `shared/data/*.json` entity file. Replay
treats a reference to such an id as opaque: it checks that the id is registered
and that the relation accepts its kind, and asserts nothing further. That is
what lets an individual be referred to before its facts are authored, so a
domain can be absorbed without breaking references from the domains around it.

Which kinds are already absorbed is visible in `facts.json`; progress is
tracked in the plan, not here.

## Divergences from the source

- *Concepts are not adopted.* The paper partitions actions into concepts, each
  a functional concern owning its facts, with synchronizations defined over
  concept actions. Here action names stay flat and un-namespaced, and rules
  reference action types directly. The partition is structural for executable
  systems; this world is data with no control flow, which is what makes the
  flat vocabulary defensible. If the world becomes executable — demos firing
  actions through a runtime, an agent operating it — concepts stop being
  optional. A second trigger is the action vocabulary growing past easy
  legibility.
- *No runtime precondition engine.* Action signatures declare required facts
  and replay enforces them while generating `facts.json`, but no machinery
  checks preconditions when a demo fires a simulated action. The world is
  data, not an executable system.

## Boundary

`shared/world/` is authored substrate; `shared/data` is the derived
consumption layer and the only surface the rest of the repo imports. Nothing
under `apps/` or `packages/` imports `shared/world` directly.

New entities and new happenings are added by authoring actions, not by editing
entity files or the generated fact set.
