---
title: "Scale facets for patterns, and grouping by them in the sidebar"
status: active
kind: exec-spec
created: 2026-10-24
last_reviewed: 2026-10-28
area: metadata, patterns-site
promoted_to: ""
superseded_by: ""
---
# Scale facets for patterns, and grouping by them in the sidebar

Outline, needs iteration. Research-gated: the scales below are a strawman.
`activityLevel` and `agents` were gated on 2026-10-24, and `people`, `time` and
`scope` on 2026-10-25, and `people` and `scope` are revised against it.

Patterns are classified by `activityLevel` (Activity Theory altitude) and, on
105 of them, by `mediation`. Neither reaches the sidebar: `activityLevel` colours
the home-page graph and `mediation` sets a graph attribute. This plan adds three
scale facets, each an ordered series of levels, and lets the actor group the
sidebar's pattern list by any facet.

The facets land in iterations (§Steps). The first adds `scope` alone, from
schema to sidebar. The second adds `people` and `agents`, narrows the
definition of `activityLevel`, and removes `mediation`. A facet for centres in
time is not part of either (§Open questions).

## The facets

Each facet is an ordered scale, and a pattern takes one level on it
(§Single values, not ranges). All three have been applied to twenty patterns
(§Pilot classifications). `scope` is fixed by its schema step in the first
iteration; `people` and `agents` stay open to change until the second.

A facet describes the centre the pattern makes, not the act of applying the
pattern. A pattern is a rule for making a kind of centre, and a centre in this
medium can live in the interface, in time, or in the state of an exchange
([pattern-definition.md](../../docs/language/pattern-definition.md)
§Definition). `scope` reads how far the centre reaches in the interface and
`people` who shares it; a facet
for centres in time is left for later (§Open questions).
`agents` and `activityLevel` read how the centre divides and supports the work. Each
application of a pattern makes a different instance, so a facet value
describes the kind of centre the page describes.

Facets apply to design patterns only. Collections, foundations, qualities and
anti-patterns are not rules for making a centre and take no facet values. Seeds
take values like other patterns; their values are the likeliest to change when
the page is written.

- `people` — how many people the centre is shared between:
  individual → pair → team → organisation → community. The people counted are
  those who act on the centre or are addressed by it; someone who only sees it
  is not counted, nor is the application's wider user base. Agents are not counted;
  they are recorded in `agents`, so one person working with an agent is
  `individual`, and a page that covers both a person-to-person and a
  person-to-agent case takes its value from the people alone. Levels above pair are defined by how the
  people relate, not by head count: a team is small enough that everyone knows
  everyone and shares one goal; an organisation has roles, permissions, known
  membership and explicit goals; a community has open, changing membership and
  fewer shared goals. `people` replaces `mediation`.
- `scope` — how far in the interface the centre reaches: where it is shown, or
  where its work and its rules apply. Every design pattern takes a value; a
  centre with no drawn surface still holds somewhere, as an agent's background
  work lands in a document or an area and a standing instruction applies to an
  area or a whole application.
  element → part → view → area → application → ecosystem.
  The logic follows *A Pattern Language*: a new level starts where the way of
  making changes, larger levels contain smaller ones, and a centre between
  others takes the level of what it connects. The levels are the medium's own, and are named to avoid
  the design-system sense of "component" and the business sense of "product":
  - *element*: a single control or mark (field, button, cursor, badge).
  - *part*: a section of a view with its own job, which keeps its kind when
    moved to another view (inspector, toolbar, card, comment thread).
  - *view*: what one surface shows at once, arranged for one activity (editor,
    canvas, inbox, conversation).
  - *area*: a region of an application that follows its own rules (settings, an admin
    area, a project or workspace, one module of a suite).
  - *application*: an application or site whose structure, areas and the
    routes between them one maker designs (main navigation, application-wide
    search).
  - *ecosystem*: no single maker; it forms piecemeal from many applications,
    platforms and conventions (handoff, share sheet, clipboard). Whose
    ecosystem it is goes in `people`.

  Four rules settle cases where the definition allows two answers. Where a
  centre is shown in one place and applies over a larger one, it takes the
  larger (a version-history panel applies to the whole document, so `view`).
  Where the forms a page describes reach several levels, the pattern takes the
  highest (searching, local or global, is `application`). A centre that is a
  structure takes the level of what contains it, while a centre that sits
  between peers takes the level of the peers (a settings hub contains its
  spokes as an `area`; a wizard between views is `view`). Patterns that are
  alternatives at one choice in a sequence make the same kind of centre, so
  none takes a level below the region the choice is made over; the level is
  read from that region rather than from the content an example navigates
  (§Sittings, *Structuring the space*).

  This is also the first interface-composition entry for
  [levels-of-scale](../../docs/language/properties/levels-of-scale.md).
- `agents` — how much of the work an agent does without a person, in the
  exchange the centre belongs to. Levels are named by the role the person takes:
  none → operator (the agent acts only when the person
  invokes it) → collaborator (they work on the same thing in turns) →
  consultant (the agent works and asks the person at chosen points) → approver
  (the agent proposes, the person approves or vetoes before it takes effect) →
  observer (the agent acts, the person watches and can stop it). Every pattern
  takes a value; "none" is a level, so patterns without an agent do not fall
  into "Not classified". The facet records
  the division of work the centre itself sets up: a centre that carries
  signals about delegated work without dividing it (a notification, an
  activity log) takes "none", and its link to delegation stays an edge. Where
  the centre is the agent's configuration (standing instructions, memory), the
  work it divides is keeping that configuration, so the value says who writes
  and changes it, not the level at which the configured agent later runs.

`activityLevel` keeps one value. Its definition narrows to the level of the
actor's activity the centre supports when it works, with the actor the pattern
serves as the subject.

## Single values, not ranges

The pilot and the first sitting recorded ranges: a from–to pair covering every
level between its ends. In the sidebar a ranged pattern was listed under every
level it spanned, and the repeated entries read as a bug rather than as a
range. Every facet now takes one level. On `scope`, a pattern whose forms reach
several levels takes the highest. For `people`, `agents` and `activityLevel`,
the rule for choosing one level is settled in the second iteration's
definitions step. The research gates below argued for ranges on
`activityLevel` and `agents`; they are kept as read, and the single value is a
simplification of what they describe.

## Why `mediation` goes

`mediation` has 83 `individual`, 22 `coordination`, and no `networking`
entries. It is missing on the agent patterns (approval-gate, handoff,
bounded-autonomy, plan-preview, change-review, regeneration, selective-memory)
and on activity-feed and activity-log. The individual/coordination split did
not fit a person working with an agent, which is the boundary case
[2026-03-mediation-type.md](../paused/2026-03-mediation-type.md) left open.
`people` and `agents` together take its place. That plan is marked superseded
by this one and is deleted in the second iteration, when `mediation` leaves
the schema.

## Research gate: activity level and agent involvement (2026-10-24)

The facet-scales research gate (2026-10-24) checked two questions before the
pilot: whether `activityLevel` should take a range, and whether agent
involvement can be an ordered facet. It read the Activity Theory canon in HCI
(Kuutti 1996, the Activity Checklist 1999, Engeström 2000, Bødker 1987) and the
levels-of-automation and agent-autonomy line (Parasuraman, Sheridan and Wickens
2000; Beer et al. 2014 via Cila 2022; Morris et al. 2024; Feng, McDonald and
Zhang 2025).

Claims the decisions rely on:

- An Activity Theory level is not a property of an artefact. It is fixed only
  relative to a subject in a situation: what is an activity for a team member
  is an action for the manager above them, actions collapse into operations
  with practice, and operations come back up as actions when something breaks
  (Kuutti; the Activity Checklist's broken-mailer example; Engeström).
- What can be classified is the level of the actor's activity a technology is
  designed to support. Kuutti's grid of operation-, action- and activity-level
  support places one technology in several columns, and calls the columns
  overlapping. A range fits this; one value simplifies it.
- In Bødker's account the interface is "the artifact-bound conditions for how
  actions can be done", and any part of it becomes the object of action when it
  breaks down. A range that covered every level a pattern can surface at would
  start at operation almost everywhere. The range therefore covers what the
  centre supports when it works.
- Automation and autonomy scales are ordinal, and the older line applies them
  per function (information acquisition, analysis, decision, implementation;
  or sense, plan, act), so a whole system has a profile rather than one level.
  A single pattern usually acts on one stage, so one level or a short range per
  pattern holds up.
- Feng et al. name autonomy levels by the role the person takes (operator,
  collaborator, consultant, approver, observer) and treat autonomy as a design
  decision separate from capability. Unlike the activity level, it is decided
  by design, so a pattern can carry it. Morris et al.'s scale starts at "no AI",
  which is why `agents` has a "none" level.
- The two literatures share no ancestor in the top of their citation lists:
  one classifies the human's activity, the other the division of work between
  the human and the system. That supports `agents` as its own facet rather than
  a refinement of `activityLevel`.

Deliberately not adopted:

- Morris et al.'s level names. Their "AI as a consultant" is the person
  consulting the AI; Feng's "consultant" is the agent consulting the person.
  `agents` uses Feng's roles, named from the person's side, and the authoring
  rule should say whose role a level names.
- A per-function autonomy profile (four stages × levels) on each pattern. It
  is the right shape for a system and too much apparatus for one pattern.
- Recording movement between levels (automatisation, breakdown) as part of the
  `activityLevel` range. Patterns whose job is that movement — mastery,
  keyboard shortcuts, recovery from errors — get a range across the levels
  they serve, not a separate marker, until the pilot shows they need one.

## Research gate: time, people and scope (2026-10-25)

The facet-scales research gate (2026-10-25) asked what the strawman scales for
`time`, `people` and `scope` would get wrong. It read time-scale work (Newell's
bands as reproduced by Anderson 2002; Lemke 2000), CSCW group-size work (Grudin
1994, both papers; Grudin and Poltrock 2012; Clark and Carlson 1982; Korsgaard
et al. 2022), interaction pattern-language organisation (van Welie and van der
Veer 2003; Mullet 2002; Hübscher et al. 2011), and work on the application and
artifact ecologies (Nouwens and Klokmose 2018; Jung et al. 2008; Bødker and
Klokmose 2012; Lyle, Korsgaard and Bødker 2020). It also drew on the earlier
persistence and umbrella-role gates.

Claims the decisions rely on:

- *Time.* Time bands of human action (Newell's biological, cognitive, rational
  and social bands, ending at months) measure how long action takes. That is
  the `activityLevel` axis, not the centre's lifetime. The facet's own
  definition matches Lemke's heterochrony: an artifact made and read in seconds
  takes part in a process lasting weeks. Lemke's longer timescales,
  organisational (months to years) and biographical (decades), support
  `project` and `lifetime` as levels.
- *Time.* The memory-for-goals work suggests a candidate moment/session break:
  a centre the actor can hold in mind, against one the interface must hold. The
  model was tested only up to a few tens of seconds, so it gives the direction
  of the break, not a value.
- *Time.* "Moment" and "lifetime" are durations, while "session" and "project"
  are units the centre attaches to and ends with. The persistence gate also
  found that one centre can have different lifetimes for different parties,
  which one range cannot express.
- *People.* CSCW scales put an organisation level between team and community
  (Grudin's rings: individual, small group, project, organisation; Kraut:
  individual, dyad, small group or team, organisation, society). The breaks rest
  on coordination. Past about seven people a group sets up subgroups and a
  structure, and a community has fewer explicit shared goals than an
  organisation. A dyad level supports `pair`. Korsgaard et al. separate a
  collective from a fixed group by changing membership, not size.
- *People.* These scales classify who uses a system. The people in one exchange
  differ by role: an addressee, a participant, someone who only sees it (Clark
  and Carlson); the person who benefits, the person who does the work
  (Grudin). A head count needs a rule for which people it counts.
- *Scope.* van Welie and van der Veer rejected screen extent as the scale of an
  interaction pattern language ("a strict hierarchy based on the usage of
  screen estate is not suitable") and used a scale of the actor's problem
  instead. Its levels sit close to `activityLevel`.
- *Scope.* The composition levels that recur are element, section or
  component, screen or view, and application (Mullet; Park et al. 2026). None of
  them includes flow. Where "flow" appears, it means a task sequence, so a
  `flow` level would repeat `activityLevel` and `time`. Mullet also notes that
  the middle levels are the hardest to name, and that moving an element within
  the composition hierarchy should not change its type.
- *Scope.* Application recurs as a level, but its boundary is fuzzy and it is
  one historical way of packaging software (Nouwens and Klokmose), so `app`
  holds only with a definition of where an application ends. An ecology is
  bounded by whose it is, a person or a community, so an `ecosystem` level
  carries a `people` value.
- *Scope as the scale of the artifact.* Levels of design (conceptual,
  interaction, presentation; Baxley's structure, behaviour, presentation) are
  an axis separate from composition (Mullet; Hübscher et al.). What counts as
  the artifact changes with the purpose of use: a device, an app, or a selection
  of apps (Bødker and Klokmose). So the scale of the artifact is relative in the
  same way the activity level is. Neither reading replaces the extent reading.

Deliberately not adopted:

- Newell's bands as the source for `time` levels, since they measure action
  duration and stop at months.
- Grudin's rings as a classification of patterns. They classify development
  markets ("the principal customer or user").
- Levels of design as a redefinition of `scope`. If the library wants that
  axis, it is a separate facet.

## Pilot classifications

Values from the pilot, read from each page's situations and body as they stand
and from the facet definitions above. Nothing is written to frontmatter until
the schema exists. The pilot recorded ranges, which use `→` and include every
level between their ends; under §Single values, not ranges, a `scope` range
reads as its top end, and the other facets' ranges wait for the second
iteration's rule. The current column gives the `activityLevel` value in
frontmatter now.

The `scope` values apply the two rules now written into its definition
(§Reading, *Where the definitions give two answers*).

| Pattern | current | activityLevel | people | scope | agents | Note |
|---|---|---|---|---|---|---|
| undo | operation | operation → action | individual | view | none | Picking an action from a history to undo (selective undo) is an action. |
| presence | operation | operation | pair → team | element → view | none | The cursor and selection are element-level; the avatar stack is a part that applies to the whole document. |
| validation | operation | operation | individual | element | none | The error summary for long forms would add `part`; it is in the page's to-do, not its body. |
| autocomplete | operation | operation | individual | element | none | The candidate list does not keep its kind away from its field, so it is part of the element. Generated completion belongs to ai-completion. |
| commenting | action | action | pair → team | element → part | none | The anchor is element-level, the thread and the comment sidebar are parts. |
| notification | action | operation → action | individual | part → application | none | Toast, callout, dialog and panel are parts; the page's global scope is application-wide. Inline notices are left out, as the page leaves the section empty. Noticing is operation, responding to a dialog is action. |
| sharing | action | action | pair → organisation | view → area | none | A grant to a container's membership can admit an organisation, and a container's grant flows down to what it holds (area). |
| handoff | action | action | individual → pair | view | consultant → observer | Escalation when the agent's confidence runs out is consultant, the scheduled return of unreviewed work approver, takeback mid-run observer. `pair` covers escalation to a human channel. |
| approval-gate | action | action | individual | part → view | approver | A single proposed action is approved in a part; batch and diff review are views. |
| resuming | action | action | individual | view | none | A wizard that connects several views is view-level by the connecting rule. |
| version-history | action | action | individual → team | view | none | Shown in a panel, applies to the whole document. `team` covers restoring over a collaborator's work. |
| standing-instructions | action | action | individual | area → application | operator | Scoped by where it lives: one project or the whole application. The actor writes it, or has it appended by command. The form where the system drafts and the actor approves would be approver; the range is not widened for it. |
| selective-memory | action | action | individual | view → application | observer | Memory scoped per thread is view-level, application-wide memory application-level. The system keeps what it remembers, the actor inspects and erases. |
| deep-linking | operation | operation → action | individual → pair | view | none | The centre is the address of a view; that the address works from outside the application is not a scope level. Keeping the address current is operation; bookmarking and sending are actions. |
| workspace | activity | action → activity | individual → organisation | area | none | Personal, team and organisational workspaces. The switcher over workspaces belongs to hub-and-spoke. |
| data-view | action | action | individual → team | view | none | Role views an administrator curates for a team bring in `team`. |
| hub-and-spoke | action | action | individual | area → application | none | The structure contains its spokes: a settings area, or a banking app's home. The phone home screen, the page's purest form, sits between `application` and `ecosystem`. |
| block-based-editor | action | operation → action | individual | part → view | none → collaborator | A block keeps its kind when moved, so it is a part; the document is the view. Passing a block to an LLM by command is operator; parallel editing with attribution is collaborator. Inserting a block is operation, composing the document is action. |
| conversation | activity | action → activity | individual → pair | view | none → collaborator | `none` and `pair` are the person-to-person case; instruction-based dialogue is operator, question-driven dialogue collaborator. The group case (several people with an agent) is listed only as a to-do. |
| activity-log | activity | action | individual → team | view → area | none | Reconstructing what happened is an action. The people whose events it records are not counted unless they read it; a project's log is read by the team. A document's log is view-level, a project's area-level. |

### Reading

Counts treat a ranged pattern as belonging to every level it spans, so a
column's counts can add up to more than 20.

*Spread.* `activityLevel`: `operation` 7, `action` 17 (11 as the only value),
`activity` 2. `people`: `individual` 17, `pair` 10, `team` 7, `organisation`
2, `community` 0. `scope`: `element` 4, `part` 5, `view` 14, `area` 7,
`application` 4, `ecosystem` 0. `agents`: `none` 16 (14 as the only value),
`operator` 3, `collaborator` 2, `consultant` 1, `approver` 2, `observer` 2.
`community` and `ecosystem` are empty in this set; both are levels the
library's coordination and cross-application patterns would need to fill before
the sidebar shows them.

*Overlap.* `scope` tracks `activityLevel` only in part. Five of the seven
patterns that reach `operation` reach `element` or `part`, and workspace
reaches `activity` at `area`. Against that, undo and deep-linking are
operation at `view`, notification is operation up to `application`, and
conversation reaches `activity` at `view`. Activity levels do not read as
sizes of interface part.

*Range width.* Of the 80 values, 29 are ranges. Two span four levels:
workspace on `people` and notification on `scope`. Nine span three: presence
and selective-memory on `scope`; sharing, version-history, data-view and
activity-log on `people`; handoff, block-based-editor and conversation on
`agents`. Notification's range reflects how much one page covers, and
splitting the page would narrow it. The ranges do not yet suggest the facets
are too coarse. The largest groups are `individual` and `action` (17 each),
`none` (16, folded) and `view` (14).

*Misfits settled.*
- Standing-instructions and selective-memory set up the agent rather than
  divide work with it. Under the `agents` definition, their centre is the
  configuration and the work is keeping it, so standing-instructions is
  `operator` (the actor writes) and selective-memory `observer` (the system
  keeps, the actor watches and can erase). This keeps the contrast the two
  pages draw, and neither lands in the folded "none" group.
- Hub-and-spoke's ambiguity was on `time`, which is left out.
- Deep-linking's centre is the address of a view, so its `scope` is `view`.

*Where the definitions give two answers.* Three questions came up that the
first definitions did not settle. The first two are settled by the rules now
in the `scope` definition; the third is open until the second iteration.
- `scope` is "where it is shown, or where its work and its rules apply". The
  two differ for version-history (a panel, applying to the document),
  presence (an avatar stack, applying to the document) and notification. The
  table takes the larger.
- "A centre between others takes the level of what it connects" and "larger
  levels contain smaller ones" give different values for structures. A hub
  connects views but contains them as an area. The table applies the
  connecting rule only to centres that sit between peers, such as a wizard
  between its steps, and the containing rule to structures.
- A range includes every level between its ends, so a page whose forms sit at
  non-adjacent `agents` levels is either over-claimed or cut down.
  Standing-instructions is the case: its forms are operator and approver, and
  a range would also claim collaborator and consultant. The table records the
  main form and names the other in the note. With single values the range
  problem goes; which of the two forms the value records is part of the second
  iteration's rule.

*The "none" level of `agents`.* 16 of 20 take `none`, 14 of them as their only
value. Four of the twenty pages are written for the agent case, more than the
library's share, so the skew in the full library will be higher. Folding the
"none" group in the sidebar, as the second iteration proposes, is necessary.

*Whose activity.* On commenting, presence, sharing, handoff and conversation
the parties' activities sit at the same level, so naming the subject did not
change any value. Activity-log is where the people whose events it records and
the person reading it differ, and the `people` counting rule settles it by
leaving out those who do not read it.

*Seeds.* Seven of the twenty are seeds: presence, sharing, handoff,
approval-gate, resuming, version-history and selective-memory. Handoff,
approval-gate and selective-memory are a paragraph or two each, so their
values rest on a list of forms rather than a worked page, and they are the
values most likely to change when the page is written. This bears on the open
question of whether seeds take facet values.

*Changes from current frontmatter.* Seven of the 20 change `activityLevel`.
Undo, notification, deep-linking and block-based-editor widen to
`operation → action`; workspace and conversation widen to
`action → activity`; activity-log narrows from `activity` to `action`. Under
the narrowed definition, `activity` survives only as the top of a range.

*Changes from the first pass.* The first pass ran on the earlier scope ladder,
before the facets were defined on the centre, and included `time`. Besides the
new scope ladder: undo widens on `activityLevel`; sharing reaches
`organisation`, and workspace takes `organisation` where it had `community`;
data-view reaches `team`; standing-instructions and selective-memory move off
`collaborator`; conversation starts at `none` and block-based-editor reaches
`collaborator`.

## Steps

Done before the iterations:

- *Pilot.* Twenty patterns classified against the centre-based definitions
  and read above (§Pilot classifications, §Reading). The pilot rules are
  written into the `people`, `scope` and `agents` definitions.
- *Research gates* for all five scales, on 2026-10-24 and 2026-10-25 (above).

### First iteration: `scope`

Steps 1 and 3 are done. Step 2 has two sittings (§Sittings); the third
territory is next.

1. *Schema.* Done. Add `scope` to `apps/patterns/src/content.config.ts` as
   one level. Keep the level list in a shared module, so the second
   iteration's facets sit beside it. `mediation` and `activityLevel` stay as
   they are.
   Add `scope` to the classification-facets section of
   [pattern-site.md](../../docs/specs/pattern-site.md), the authoring rule
   (`.claude/rules/pattern-content.md`) and the pattern-classifier skill, and
   add the scope ladder as the first interface-composition entry in
   [levels-of-scale](../../docs/language/properties/levels-of-scale.md).
   The level list is `apps/patterns/src/lib/facets.ts`; `content.config.ts`
   builds the schema from it and rejects a facet on any role but `pattern`.
2. *Classification sittings* for `scope`, one territory at a time, not as one
   sweep. The pilot's `scope` values are written in the first sitting that
   reaches each pattern. The first sitting is *Structuring the space*: it holds
   three pilot patterns (workspace, deep-linking, hub-and-spoke), the
   Navigation family, and the `area` and `application` levels where the two
   tie-break rules matter most.
   - *Territories.* Each design pattern is read in one sitting: the first
     sequence that reaches it, taking the sequences in reading order and tied
     sequences alphabetically. The sitting only batches the reading and does
     not affect the value. The patterns no sequence reaches form a last
     sitting. The list is fixed before reading, at roughly 10 to 15 patterns
     a sitting.
   - *Two readers.* Each page is read in full: both situations, the body and
     the forms it lists, not the description. Two readers classify the same
     pages independently, with the same inputs: the `scope` definitions in
     [pattern-site.md](../../docs/specs/pattern-site.md), the pilot values
     as worked examples, and the instruction to give each value with one
     sentence quoting the page that decides it. Neither sees the other's
     values.
   - *Comparison.* Where the readers agree, the value goes into frontmatter.
     Where they disagree, the author decides between the two readings and
     their quotes.
   - *What a disagreement shows.* If the definitions do not settle the case,
     the rule is tightened in the spec, and later sittings apply it. If the
     page covers more than one centre (notification's four-level range), the
     page is listed for a later edit and the value is not forced.
   - *Record.* Each sitting adds a table under §Sittings: pattern, value, the
     deciding quote, and whether the readers agreed or the author decided.
     Frontmatter holds only the value.
   - *Calibration.* Every sitting uses both readers on every pattern. The
     first two sittings agreed on 62% and 88% of their patterns, and the
     readers' agreement measures consistency, not whether the definitions were
     read as intended, so no sitting drops to one reader. If the readers often
     disagree, the definitions are revised before more values are written.
   - Sittings run in order, never in parallel, so a rule tightened in one
     applies to the next.
3. *Sidebar.* Done. In `apps/patterns/src/lib/nav-tree.ts`, build one grouping of the
   pattern list per facet, plus A–Z, at build time; the persisted Nav island
   receives all of them and picks one client-side. The first iteration ships
   A–Z and `scope`; later facets add a grouping without changing the
   mechanism.
   - The group-by control sits in the header of the `Patterns` branch, so it
     reads as reordering only that list. The removal in `6ca4c6a5` was because
     the footer placement read as reordering everything; the `Patterns` branch
     that commit introduced makes the scoped placement possible now.
   - Reuse what `54bece6a` built: the persisted projection key in
     `nav-store.ts`, collapse state scoped per projection, and the
     hydration-gated `pp-dropdown`.
   - A–Z stays the default. Groups follow scale order from large to small, the
     making order of *A Pattern Language*'s summary, not the alphabet. Empty
     levels are left out. A last "Not classified" group holds design patterns
     without a value, so coverage gaps show. Collections, including the family
     overview pages, are left out of facet groupings.
   - Each pattern is listed once, under its level.
   - The families in `BRANCH_GROUPS` (Navigation, Conversational primitives)
     nest under each level their members reach, holding the members at that
     level. A family whose members share one level stays together.
   - The trigger names the grouping when it is not A–Z.
   - The grouping ships while the sittings continue.
   - Check the control against [grouping](../../apps/patterns/src/content/patterns/grouping.mdx),
     since it is an instance of that pattern.

### Second iteration: `people`, `agents` and `activityLevel`

Outline; it is detailed once the first iteration is done.

1. *Definitions.* Settle how a page whose forms reach several levels takes
   one value on `people`, `agents` and `activityLevel` (§Single values, not
   ranges), including standing-instructions' non-adjacent `agents` forms
   (§Reading, *Where the definitions give two answers*), and the overlap with
   the agency foundation (§Open questions).
2. *Schema.* Add `people` and `agents` beside `scope` in the shared module,
   and apply the narrowed `activityLevel` definition. Remove `mediation` from the schema, from
   `scripts/extract-graph-data.ts`, and from
   `apps/patterns/src/lib/pattern-graph.ts` and `pattern-graph.css`, and
   delete [2026-03-mediation-type.md](../paused/2026-03-mediation-type.md).
   Update the same docs as in the first iteration.
3. *Classification sittings*, one territory at a time. The `mediation` value
   is a hint for `people` where it exists, not a mapping.
4. *Sidebar.* Add a grouping for each new facet. In the `agents` grouping the
   "none" group starts folded, so the levels with an agent lead. "None" stays
   a value, which keeps classified-as-none apart from not yet classified.

## Sittings

One table per `scope` sitting, in the order they run (§Steps, first
iteration, step 2).

### 1. Structuring the space

Thirteen patterns: every `role: pattern` page the sequence names as a step, an
alternative or a constituent. The Navigation family is reached in full; its
overview page is a collection and takes no value. Patterns the sequence names
only as hand-off vehicles (`via`: notification, purpose-keyed-view,
link-preview) wait for the sequence that names them as a step. On the three
pilot patterns, the first reader's value is the pilot value.

| Pattern | scope | Deciding quote | Agreed or author-decided |
|---|---|---|---|
| workspace | area | "by ownership (personal, team, organisational), by topic (projects, areas, subjects)" | agreed (pilot) |
| hub-and-spoke | application | "a banking app's home, a settings area or the rooms of a smart-home app" | author-decided (pilot): the second reader read the phone home screen as `ecosystem` |
| deep-linking | view | "Give every state worth returning to an address of its own" | author-decided (pilot): the second reader read the address scheme kept as a contract as reaching `application` |
| pan-and-zoom | area | "this one holds a single continuous space — a map, a canvas, a timeline" | author-decided: both readers read `view`; revised by the alternatives rule |
| step-by-step | area | "an ordered sequence whose later steps depend on what earlier ones settle — a checkout, a setup" | author-decided: both readers read `view`; revised by the alternatives rule |
| pyramid | area | "A hub at the top lists the full sequence" | author-decided: the second reader read a gallery as `view` |
| overview-detail | area | "Whether the two views share the screen, swap in place, or sit on separate pages is a layout decision inside the pattern" | author-decided: both readers read `view`; revised by the alternatives rule |
| multilevel-tree | application | "Global navigation connects main pages. Each main page contains subpages" | agreed |
| flat-navigation | area | "this one is a workspace with a rich toolset — an editor, a console" | author-decided: both readers read `view`; revised by the alternatives rule |
| fully-connected | application | "Global navigation appears consistently across all pages" | agreed |
| hybrid-patterns | application | "Hub lists applications or workspaces, within each app all functions accessible" | author-decided: the second reader read six combinations as several centres |
| command-menu | application | "The move recurs wherever a capability has a command space of its own" | agreed |
| searching | application | "Global: Searches the entire system. Local: Searches only within the current context." | author-decided: the first reader read "current context" as a workspace, `area` |

The readers agreed on 8 of 13 (62%), and on 1 of the 3 pilot patterns. Four
of the five disagreements were over one end of a range. Two were at the top:
whether a platform's home screen is `ecosystem` (hub-and-spoke), and whether
an address scheme kept application-wide lifts deep-linking above `view`. Two were
at the bottom: the author took the structure rule's reading of pyramid over a
gallery reading of `view`, and the wider reading of "current context" for
searching. The fifth was whether hybrid-patterns makes one centre or several.
No page was listed for a later edit. The decisions on hub-and-spoke,
deep-linking and hybrid-patterns stand as cases, not as general rules for
`ecosystem`, application-wide contracts, or one centre against several.

After the comparison, the author read the layout choice's arms as one family:
they are alternatives for the same region, picked by what the region holds, so
they make the same kind of centre, the movement rule of a region. Both readers
had read each page by the content its examples navigate (a canvas, a checkout,
an editor, a collection) and agreed on `view` for pan-and-zoom, step-by-step,
flat-navigation and overview-detail. The rule now in the `scope` definition
gives the arms a shared lowest level, `area`, overview-detail included, since
its pair of views can sit on separate pages and the arm is chosen for the
region like the others. Multilevel-tree, fully-connected, hub-and-spoke and
hybrid-patterns reach `application`, since they can be an application's main
navigation.

The readers recorded six of the thirteen as ranges: the four above from
`area`, and command-menu and searching from `view`. Under §Single values, not
ranges, all six take their top end, `application`, as the table shows.
Searching's disagreement was over the bottom of its range, so it no longer
changes the value.

With the revision, 4 of 13 values stand as the readers agreed them. The
revision also shows a limit of the calibration step: two readers who share a
misreading of the definitions still agree, so agreement measures consistency
between readers, not whether the definitions were read as intended.

### 2. Composing views

Seventeen patterns: every `role: pattern` page the sequence names as a step or
a constituent that no earlier sitting classified. Searching and overview-detail
were classified in the first sitting. Link-preview was only a hand-off vehicle
in the first sequence, so this is its first step. Selection, editing-in-place
and citation, named only as hand-off vehicles here, wait for the sequences that
name them as steps. The second reader did not see the pilot values for
data-view and autocomplete, so both were read blind.

| Pattern | scope | Deciding quote | Agreed or author-decided |
|---|---|---|---|
| item-view | view | "Dedicated view: section, panel, page, workspace, tab." | agreed |
| data-view | view | "a named projection — the same items shown from one angle" | agreed (pilot) |
| tag | application | "Tags should link to filtered views showing all similarly tagged content" | author-decided: one reader read `area` (a vocabulary shared across the collection), the other `element` (the label is a mark); the author read the labelling layer as changing how everything in the application is categorised and navigated |
| attribute-visibility | view | "Make each view's attribute set a live control" | agreed |
| sorting | view | "The default sort order is determined on a page-by-page basis." | agreed |
| grouping | view | "the collection has visible structure along a chosen attribute" | agreed |
| filtering | view | "the criteria stay on the surface as chips or clauses" | agreed |
| link-preview | part | "The preview surface is hoverable" | agreed |
| dynamic-hyperlinks | application | "A heatmap layer shows connection density across the corpus" | author-decided: one reader read `area`, the other `application`; the corpus is read as the application's content |
| coordinated-views | view | "Couple the views so that what the actor designates in one carries to the others" | agreed |
| progressive-disclosure | view | "Complexity is distributed across steps so one decision is made before the next set of controls appears" | agreed |
| good-defaults | element | "Pre-fill fields and pre-select options with intelligent guesses" | agreed |
| drag-and-drop | view | "the item to operate on and the destination that stands for the outcome are both on screen" | agreed |
| bounded-choice | element | "Committing a value from a bounded set the actor didn't author and may not be able to survey." | agreed |
| embedded-intelligence | application | "extensions of the actor's existing ways of thinking and acting" | agreed |
| autocomplete | element | "Predicting and suggesting completions for a value the actor is actively typing" | agreed (pilot) |
| suggestion | view | "The offer of a system-generated recommendation that the actor can accept, modify, or reject" | agreed |

The readers agreed on 15 of 17 (88%). Both disagreements were over how far a
page's wider reach counts: tag's shared vocabulary and dynamic-hyperlinks'
corpus, each mentioned in the body but not shown in a form. The author took
`application` for both. These stand as cases, and the spec has no rule for
them yet. No page was listed for a later edit.

### 3. Making changes

Thirteen patterns: every `role: pattern` page the sequence names as a step or
a constituent that no earlier sitting classified. Bounded-choice and
good-defaults were classified in the second sitting. Conversation,
notification and activity-log are named only as hand-off vehicles and wait for
the sequences that name them as steps. Selection and editing-in-place, which
waited in the second sitting, are classified here. Both readers were told to
take the highest level a pattern can be applied in, whether or not the page
shows a form there.

| Pattern | scope | Deciding quote | Agreed or author-decided |
|---|---|---|---|
| selection | view | "Appropriate when selection is a primary capability of the view (inboxes, file managers)." | agreed |
| editing-in-place | view | "a single value (a cell, an attribute in a detail view), a fragment (a paragraph, a block), or the whole artefact" | agreed |
| block-based-editor | view | "the block is now the unit of everything the surface does — selecting, referencing, moving, commenting" | agreed (pilot) |
| form | view | "Collect the related inputs on one surface" | agreed |
| wizard | view | "a gated sequence of focused steps, each with one purpose and everything it needs on the screen" | agreed |
| data-entry | element | "the entry move is now spread across whatever surfaces host it — a form field, a conversational turn, a control in the inline interface" | agreed |
| sections | part | "a single container whose disclosure affordance (tabs vs. accordion) shifts with context without restructuring the content" | author-decided: the first reader read `view` (a tab bar can divide a whole page), the second `part` |
| validation | element | "the message sits at the field that produced it" | author-decided (pilot): the second reader read `view`, since the rule applies to the whole form |
| saving | view | "changes live in the running program until the system writes them to storage" | author-decided: the second reader read `application`, from screens that follow different save rules |
| draft-and-publish | view | "The boundary covers the whole artefact: readers see the last published version, however far the draft has moved on." | author-decided: the second reader read `area`, a whole site or project published as one unit |
| action-consequences | view | "A framework for evaluating the severity and reversibility of user actions to determine appropriate safeguards and confirmation methods." | author-decided: the second reader read `application`, from the "System-wide" impact scope |
| deletion | view | "The controlled removal of data from a system, balancing user confidence with protection against accidental loss." | author-decided: the second reader read `application`, from soft delete and expiry across a system |
| undo | view | "Selective undo: Allows to pick a specific action from a history to undo, without affecting subsequent actions." | agreed (pilot) |

The readers agreed on 7 of 13 (54%). Six of the seven agreed values are
`view`, and the other is `element`. Four of the six disagreements were the
second reader lifting a pattern to the widest place a policy of that kind
applies: saving, draft-and-publish, action-consequences and deletion. The
author kept `view` for all four, reading each from the artefact or action it
acts on. This differs from the second sitting, where tag and
dynamic-hyperlinks took `application` for a reach the body mentions. The spec
has no rule that separates a reach the page names from a policy that could be
applied system-wide, so these stand as cases. The other two disagreements were
whether a container keeps its kind wherever it is placed (sections) and
whether a rule that gates a whole form lifts a field-level message
(validation). No page was listed for a later edit.

## Open questions

- What a `time` facet measures, for a later iteration. The strawman
  (moment → session → project → lifetime) read how long the centre lasts, and
  the 2026-10-25 gate found it mixes durations with units the centre ends
  with. The alternative is a pace-layer reading: how fast the centre changes,
  with slower layers constraining faster ones (Brand, after Duffy's shearing
  layers; Taylor's specificity gradient applies it to software). That reading
  has not been research-gated, and its layers would need defining apart from
  `people` and `scope`, since slow layers also tend to be large and shared.
  The constraint between layers may belong in edges rather than in a facet.
  Persistence is one of the dimensions
  [decision-dimensions.md](../../docs/language/decision-dimensions.md) lists as
  absent from the library.

- Whether `agents` and the agency foundation share one vocabulary. The
  foundation has its own spectrum (passive → reactive → semi-active →
  proactive → co-operative) and a locus dimension (human-centric, shared,
  system-centric) that overlap the facet. Two scales for the same thing should
  not survive the schema change; which one gives way is a design call.
- Whether the largest sidebar groups grow too large to navigate. `view` is
  the most common pilot value and may pass 40 in the full library.
- Whether `lifecycle` (31 entries, no consumer) is retired in the same schema
  change.
- Whether the facets also project onto the home-page graph, as `activityLevel`
  does.

## Validation

- `npm run test` passes, including the content schema.
- In `npm run dev`, every grouping lists every design pattern exactly once
  (A–Z also lists the collections), the active pattern is marked, and the
  chosen grouping and its open groups survive navigation and reload.
