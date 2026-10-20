---
title: "Concept catalogue"
status: "active"
kind: "exec-spec"
created: "2026-10-18"
last_reviewed: "2026-10-18"
area: "language"
promoted_to: ""
superseded_by: ""
---
# Concept catalogue

The catalogue is wired and the first ten entries exist (2026-10-18): the
`concepts` collection, routes and index, `acts_on` on the pattern schema with
its validator check and graph projection, and the `concept` field on the
twenty world action types that are workspace activity, checked both ways. The
fixture's own bookkeeping (catalogue, ledger, lifecycle assessment) carries no
concept: the catalogue holds generic concepts only, and those three are demo
material. The partition table below is now the world's own. What remains is authoring work: `acts_on` sittings on the
pattern pages the partition reaches, the conversation-for-action entry, and the
quarry. The 2025 attempt (root `concepts/`, now fifty-six pages nothing
builds) stays until the quarry is worked; the five grounded pages have been
read and deleted.

The shape was checked against the concept-design papers in the vault
(`Resources/Papers/`); no research gate, since that line is already read.

## Context

The repository holds two deliberately separate things: the pattern language
(generative moves over recurring situations, `apps/patterns/`) and the
component catalogue (building material cut to its place, Storybook in
`packages/components/`). [docs/language/patterns-and-components.md](../../docs/language/patterns-and-components.md)
draws the line between them: a pattern succeeds when no two applications are
identical, a component when every implementation converges.

A third kind of thing keeps turning up and has no home. Jackson's *concepts*
are units of functionality an actor recognises across systems — commenting,
upvoting, trashing, notifying — each with a purpose, an archetypal scenario
(the operational principle), state, and the actions that change it. They are
neither patterns nor components. Like components they are normative: an actor
brings an understanding of commenting from every other system that has it,
and that familiarity is the value. Unlike components they carry no rendering:
a concept says what the system does and means, not how it is drawn or
operated. Patterns act on them: *mark first, quote later* is a move on the
Commenting concept; *deletion* is a move whose first job is to say which of
three concepts (remove from view, trash, destroy) a gesture names.

Earlier work tried the idea twice and stopped both times:

- The 2025 pages in root `concepts/` were Storybook MDX in Jackson's
  purpose/principle/state/actions shape — generic concepts (Comment,
  Notification, Label, Session), a Winograd & Flores conversational cluster
  (Commitment, ConditionOfSatisfaction, Conversation, Trigger), a commerce
  cluster, and one agentic entry. They were moved out of Storybook in May
  2026 and left unread by any build. The paused plan
  [2025-dress_shop_concepts.md](../paused/2025-dress_shop_concepts.md)
  holds a further batch from the dress-shop case. `role:concept` was reserved
  in the role model and never committed.
- The world re-grounding (August 2026) took the ontology under concepts —
  individuals, values, actions, facts, and `when`/`where`/`then` rules — and
  deliberately left concepts out: action names stay flat, and
  [docs/specs/world-ontology.md](../../docs/specs/world-ontology.md)
  §Divergences names two revisit triggers, the world turning executable and
  the action vocabulary outgrowing legibility. The agent trace plan
  ([2026-08-agent-trace-fixtures.md](2026-08-agent-trace-fixtures.md)) will
  add agent activities (intending, searching, reading, drafting) to the same
  flat vocabulary, which brings the second trigger closer.

The pause was over the relationship between concepts and a pattern language.
The position this plan takes: they are parallel. A concept catalogue stands
beside the component catalogue and the pattern language, with its own
entries, and patterns reach it by reference the way they already reach
components. It is not a layer of the language and its entries are not graph
nodes.

Two readings of the source papers set what the catalogue is for:

- *Meaning has to be named to be argued about.* The same gesture can
  implement several concepts (rename-for-everyone against rename-my-view;
  share as grant, as copy, as link), a concept can be swapped behind an
  unchanged action (search by relevance becoming search by what the seller
  paid), and one concept can be implemented under the guise of another
  (an angry reaction as an engagement upvote). Each of these is a claim about
  which concept an action serves, and a pattern page can only make the claim
  if the concept has a name to point at.
- *The world already has the substrate.* `shared/world/` holds actions,
  facts, and rules in the papers' form. Concepts are the partition of that
  action vocabulary into functional concerns, with facts following their
  actions and individuals free to appear in several. Adopting the partition
  costs one field per action type and gives every catalogue entry a worked,
  replay-checked instance.

## Intent

A concept catalogue as a third authored collection: one entry per concept,
each naming its purpose, operational principle, state, actions, and the
shipping systems it appears in. Patterns point at the concepts they act on
through a validated cross-dataset reference, never an edge. The fixture
world's workspace action types each name their concept, and the two are
checked against each other. The 2025 pages are quarried into this shape or dropped.

## Strawman

Each decision below is a proposal, to be tested by authoring the first
grounded entries.

### Where it lives

A third Astro content collection, `apps/patterns/src/content/concepts/`,
beside `patterns/` and `sequences/`, rendered under its own route and with
its own index page. The pattern site is where the project documents what it
has decided; sequences set the precedent for a collection that sits beside
the language without entering the graph.

Alternatives considered:

- *Storybook*, the 2025 home. Rejected: Storybook is the component workshop,
  and a concept carries nothing to render. The May 2026 move out of
  `stories/` already made this call.
- *Data only*, a `concepts.json` beside the world files. Rejected as the
  home: an entry needs prose (the principle, the instances, the design notes)
  and the catalogue reaches past what the world instantiates. The world-side
  projection is one field, below.
- *A third app.* Over-built for a collection of a few dozen pages.

### What an entry holds

Frontmatter carries the structured parts; the body carries the rest.

```yaml
title: Commenting
purpose: Let people attach remarks to a passage of shared material and settle them.
principle: >
  If a member marks a passage and writes a remark, others see the remark
  beside the passage and can reply; once the matter is settled, whoever
  resolves the thread removes it from view without deleting it.
state:
  - about: Comment -> one Item
  - anchor: Comment -> opt Range
  - thread: Comment -> one Thread
  - replyTo: Comment -> opt Comment
  - resolvedBy: Thread -> opt User
actions: [addComment, replyToComment, resolveThread]
misfits:
  - A thread whose passage is deleted keeps its remarks and loses its place.
  - Resolving hides a thread from the people who have not read it yet.
aliases: [discussion, annotation thread, review comment]
depends_on: []
appears_in:
  - Google Docs
  - Figma
  - GitHub pull-request review
```

- `purpose` is one sentence. `principle` is the archetypal scenario in prose
  (if an actor does this, that follows), not a formal rule.
- `state` is a list of relations in the world's own terms, `Kind -> one |
  opt | set Kind`, and nothing more. No preconditions, no invariants. The
  entry is as light as a page can be and still say what the concept is;
  weight is added only when a pattern page needs it.
- `actions` are names. Where the world has the action, the name is the world's
  and the cross-reference validator checks it exists in
  `shared/world/action-types.json` and is assigned to this concept. Where the
  world has no instance, the name is the entry's own and nothing checks it.
- `misfits` are the known complications: scenarios in which the concept
  fails its purpose. This is the slot the idiom catalogue in Jackson's 2015
  essay carries beside purpose and principle, and it is where the catalogue
  meets the language. A pattern's forces line up with a concept's misfits
  far more closely than with its principle, so a pattern that names a
  concept is usually a move on one of its misfits.
- `aliases` are the other words the same concept goes by. Palantir's
  inventory found aliases were what let a vocabulary be adopted gradually
  rather than renamed on a flag day, and the same concept arrives here under
  several names already (thread, discussion, annotation).
- `depends_on` lists concepts without which this one makes no sense
  (Quoting without Document keeping has nothing to quote). The 2015 essay's
  dependence graph, kept because it is cheap and because the world
  partition gives it instances; not an edge in the pattern graph.
- `appears_in` is the familiarity claim: where an actor already met this
  concept. Shipping systems, by name, as pattern pages argue from shipping
  systems. No sources.
- Names are gerunds where the gerund reads naturally (Commenting, Notifying,
  Staging) and the plain noun phrase where it does not (Task tracking,
  Document keeping). Noun forms that sound like objects (Comment, Task) are
  avoided: the entry names an activity the system supports, not a thing it
  stores. This is a strong default, not an absolute rule, and it follows the
  method's own move: the early concept names were nouns from an actor's
  vocabulary, readers kept taking them for classes, and the activity name is
  the correction. The 2025 pages in root `concepts/` use the older noun
  form, which is one more reason they are quarry rather than migrated.

The entry stops at the concept's definition. The Beyond Dark Patterns
catalogue entry has a second half, the *mapping*: who may initiate each
action, and the minimum an interface must show for the concept to be
recognised. Here that half is not the entry's to hold. The mapping from
concept to surface is what the pattern language and the component catalogue
are for, reached through `acts_on` on one side and `realised_by` on the
other, which is the three-way split in the source's own terms.

The body is short prose: what the concept is for in an actor's terms, the
variants that matter to design (a thread that resolves against one that
deletes; a comment anchored to a range against one on the whole item), and
the patterns that act on it, rendered from the inverse of the reference
below rather than authored.

Synchronisations are not entries. Concepts are reusable and their
composition is specific to a system, so the composition lives with the
system: in this repo, `shared/world/rules.json` is the fixture world's
synchronisation set, and reading it as cross-concept rules needs no change
to it (auto-triage is Task tracking → Staging, comment notification is Commenting
→ Notifying where Document keeping holds the author). The 2025
`concepts/syncs/user-registration/` folder is the source paper's example
copied in, not this project's composition, and goes.

### How patterns reach it

A frontmatter field on pattern pages, `acts_on`, listing concept ids, with an
optional action name where the move is on one action rather than the whole
concept:

```yaml
acts_on:
  - commenting
  - { concept: deletion-by-trash, note: "the recoverable arm" }
```

This is a cross-dataset reference in exactly the sense of `realised_by`
(relationship-vocabulary.md §Component realisation): the pattern graph
stays language-only, the claim points outside it, the build-time validator
resolves every id against the concepts collection and fails on a dangling
one, the extractor emits it as node metadata, and the page renders it in
prose next to realisation rather than in the related-patterns index. No
`rel=` form, no concept id in `relationships:`, and `role:concept` is
retired from the reserved list rather than committed, as `role:component`
has no instances for the same reason: entries of the other two catalogues
are not nodes.

Most patterns name no concept, and that is expected. Navigation, layout,
selection, and the presentation family are moves over structure with no
functional concern behind them; the field is sparse by design. Where a
pattern names more than one concept, the page is making the
one-gesture-several-concepts claim and should say so in the note.

The name `acts_on` is provisional until the first grounded pages have used
it. `serves` is taken (pattern → foundation station), `instantiates` is
taxonomic, `realised_by` runs the other way to built material.

### The world-side projection

Each entry in `shared/world/action-types.json` gains a `concept` field
naming its catalogue id. Action names stay flat; nothing is namespaced,
nothing executes, and `rules.json` is untouched. Replay does not read the
field. The site validator checks it in both directions: every `concept`
names an entry, and every world action an entry lists is assigned to it.

Partitioning the current twenty-six action types tests whether the idea
holds against real material. The partition the strawman proposes:

| concept | world actions | note |
| --- | --- | --- |
| Joining | `joinWorkspace`, `joinProject` | becoming a member of a space, with role and access |
| Signing in | `signIn` | one action, one fact; a concept because the per-actor time ceiling hangs on it |
| Running a project | `createProject`, `setPartners`, `completeProject` | |
| Staging | `setPhase`, `changeStatus`, `updateProgress`, `completeTask` | moving an item through ordered states; see below |
| Task tracking | `createTask` | see below; the gerund "Tasking" was dropped as reading badly |
| Document keeping | `createDocument`, `editDocument`, `uploadFile` | one snapshot per body; a revision records only that it happened |
| Assisting | `suggestOutline` | the system's own act, rule-caused |
| Quoting | `createQuote` | |
| Commenting | `addComment`, `replyToComment`, `resolveThread` | |
| Notifying | `notify` | |

Six action types stay outside the partition: `catalogueMaterial`,
`catalogueComponent`, `listProduct`, `catalogueService`, `recordTransaction`
and `recordFlow`. They are the fixture's own domain (its circular-economy
catalogue, its ledger, its lifecycle assessment), recognisable in no shipping
system outside the demos, so they carry no `concept` and the catalogue holds
no entry for them. The test is `appears_in`: an entry that could name no
system outside the demos does not belong.

Two things the partition surfaces, which a flat vocabulary hides:

- `setPhase` on a project and `changeStatus` on a task are one concept
  applied to two kinds. Staging is polymorphic over the item it stages, which
  is the papers' point about type parameters: the concept is defined once and
  the kind is supplied where it is used. The two actions keep their names;
  the entry says they are one thing.
- `createTask` adds `assignee`, `label`, `priority`, `dueDate` and `project`
  in one act. In concept terms that is Task tracking, Assigning, Labelling,
  Prioritising and Scheduling merged into one, the trade Jackson's design
  moves name as *merge*: simplicity over flexibility. The action stays
  whole and its facts stay with it, since facts follow the action that adds
  them. The Task tracking entry records the merge as a move taken and what it
  costs (a task cannot be labelled without being created, nor assigned
  without a project), which is the kind of finding the catalogue exists to
  hold. If a demo ever needs to label something that is not a task, the
  split is made then.

### The quarry

The forty 2025 pages and the dress-shop batch, by disposition. None is
migrated as it stands: each surviving entry is re-authored into the shape
above, one at a time.

- *Grounded now* (the world instantiates them): Comment → Commenting,
  Notification → Notifying, Task → Task tracking and Staging, Todo → Task
  tracking, Workflow → Staging. Worked 2026-10-18: each old page was read
  against its entry and the complications the entry lacked were lifted as
  misfits or body variants (edited-after-reply and departed authors for
  Commenting; system-wide notices and the unheld seen/clear pair for
  Notifying; the missing terminal state for Task tracking; editable
  sequences and permitted transitions for Staging). Todo said nothing the
  entry's alias did not. The conversational Task page was mostly a
  delegation container (requester and fulfiller, a clarifying state, block,
  resume, report, fail); that material is quarry for the conversation for
  action sitting below, not for Task tracking. The five files are deleted.
- *Not concepts* (data-model or substrate material the world ontology
  already covers): Entity, Attribute, Item, Collection, Representation,
  Reference, Event, EventLog. Dropped; anything they say about
  individuals, facts, or the log belongs in the ontology spec if it is not
  there.
- *Generic candidates with no world instance*: Bookmark, Label, Form,
  Template, TemplateLibrary, User, UserProfile, Authentication,
  Password, Session. Listed as candidates; an entry is authored when a
  pattern page needs to name it, not before. `tag` is the likely first
  claimant (Labelling).
- *Commerce cluster* (Account, Catalogue, Currency, Inventory, Order, Quote,
  ShoppingCart, Subscription): candidates with no claimant in the corpus. The
  fixture's catalogue actions are its own domain, not an instance of Catalogue.
- *Conversational cluster* (Winograd & Flores): the conversation for action
  is a concept in the strict sense — request, promise, counter, decline,
  report complete, declare satisfied, as actions over a conversation
  individual — and the delegating-work sequence acts on it; so does the
  agent trace plan, whose delegating and reporting-back steps are its
  opening and closing actions. Commitment and ConditionOfSatisfaction fold into it.
  Trigger, Intervention and Breakdown are synchronisations, not concepts.
  Domain, Interpretation, StructuralCoupling and InnovationViaConversation
  are theory and get no entry. The dress-shop batch is quarry for this one
  sitting, and so is what the deleted Task page held about delegated work:
  a requester and a fulfiller, a clarifying state between them, blocking and
  resuming, reporting progress, and failing as distinct from completing.
  Second sitting, joint with the agent trace plan.
- *Version control* (Repository, Commit, WorkingArea, Branch, Head, Tag and
  four data classifications): no disposition yet. The likely reading is
  domain material for a future versioning concept, which Document keeping's
  first misfit already points at. Decide before deleting.
- *Agentic* (ContinuousOperation): superseded by the agent trace plan's
  activities. Intending, Searching, Reading, Finding and Drafting are
  concepts in the source's own terms, and the `concept` field is where that
  plan's grouping of its actions goes. The world ontology's legibility
  trigger is answered here rather than there: the partition is adopted
  because the catalogue needs it, not because the vocabulary crossed a
  threshold.
- `syncs/user-registration/`: deleted.

Root `concepts/` is deleted once the quarry is worked; until then it stays
as it is.

## What the concept-design papers settle

Read before the first entry is authored, so the shape is not re-argued.

- *A catalogue without a system's synchronisations is the intended form.*
  The 2015 essay's idiom catalogue (purpose, operational principle, known
  complications) and the Beyond Dark Patterns proposal of concept catalogues
  as published standards are both catalogues of concepts alone; composition
  is left to each system. That paper's survey of twenty shopping carts found
  eighteen implementing the same core state and actions, which is the
  familiarity the entries rest on.
- *Light entries.* Palantir's inventory of about 150 concepts kept name,
  description, links and aliases and dropped the formal structure as too
  heavy to maintain. The shape above is one step heavier than that (state
  relations and action names, because the world can check them) and no
  more.
- *Patterns are sparse over concepts, and that is the expected shape.* The
  vault's generative-UI reading has concepts as selective annotations for
  behaviour that structural composition cannot express; most pages are
  structural. `acts_on` is optional and the index does not count it.
- *The partition's conflations are moves, not errors.* Split, merge,
  unify, specialise, tighten and loosen name what the world's authors did
  when an action spans concerns, and each has a cost the entry can state.

## Work

Done (2026-10-18):

- The collection in `content.config.ts`, the `/concepts/[id]` route with its
  pane partial, the `/concepts` index, and concept panes in the stack
  (`concept:` param prefix). The catalogue is its own corner of the site,
  "concept playground", with its own sidebar and the other two corners in its
  footer (decided 2026-10-18 after seeing it as a group in the pattern
  sidebar, which read as a fourth lens on the language). Stacking is kept
  for now; whether a lookup wants a pane at all is open, since concepts do not
  follow one another but compose through synchronisations. `ConceptArticle.astro`
  renders the definition through the library's description list and lists
  the patterns that act on the concept from the inverse of `acts_on`.
- `acts_on` on the pattern schema, rendered beside the epistemic status
  (`ActsOn.astro`), emitted as `actsOn` node metadata, validated against the
  collection. `/concepts/` links in content are validated too.
- `concept` on the twenty workspace action types, per the partition table;
  the six bookkeeping types carry none. The validator checks both directions
  and `depends_on` ids.
- Ten entries, one per concept in the partition. Commenting, Notifying,
  Staging, Task tracking and Document keeping carry full bodies; the other five are
  light entries that exist so the world's assignments resolve, and each can
  be deepened when a pattern page needs it.
- `acts_on` on `commenting` and `notification`.
- The docs the change made stale: `docs/language/patterns-and-concepts.md`
  (new), the pointer in patterns-and-components.md, §Concept reference in
  relationship-vocabulary.md, world-ontology.md §Action types and
  §Divergences, `role:concept` retired in pattern-role-model.md, the Concept
  glossary entry, pattern-site.md, ARCHITECTURE.md, the content rule, and the
  doc indexes.

Remaining:

- `acts_on` sittings on `deletion`, `sharing`, `tag`, `activity-log`,
  `searching`, `activity-feed`, `undo`. Each needs its concept authored
  first (deletion's three arms, sharing as grant, copy and link, Labelling
  for tag) and is a sitting on that page; the vault overlay's remaining items
  for *Making Software Meaningful* (one gesture, several concepts; the
  grant/revoke asymmetry; the concept behind an unchanged action) are what
  those sittings write.
- Conversation for action, joint with the agent trace plan's vocabulary
  sitting; the dress-shop batch is quarry for it.
- Work the rest of the quarry per the dispositions above (the grounded
  pages are done); then delete root `concepts/` and the paused dress-shop
  plan.
- The entry name `acts_on` is confirmed by two pages; revisit only if a
  sitting finds it reads wrongly.

## Open questions

- Slug collisions. `commenting`, `sharing`, `deletion`, `notification`,
  `searching` and `tag` are pattern slugs, and several will have a concept
  of the same stem. The route namespace keeps the pages apart and `acts_on`
  values are concept ids by construction, so nothing resolves wrongly; but
  a reader seeing two "Commenting" pages needs the index to say which is
  which, and the collision rule (the pattern keeps the bare slug; the other
  takes a suffix) may want applying to concept ids too.
- Demos. Demos read `shared/data`, which derives from the world, so the
  `concept` field reaches nothing they render. Whether a demo ever wants to
  show the concept an action belongs to (an activity log grouped by concern,
  say) is left until a page asks.
- Concept to component. The source tradition reads a concept as both a
  protocol of actor behaviour and a service supporting it, so a component
  can realise a concept directly. Here that path runs through patterns
  (`acts_on` one side, `realised_by` the other) and no direct reference is
  proposed. Revisit if a component page has a concept to name and no pattern
  between them.
