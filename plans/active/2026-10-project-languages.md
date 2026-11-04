---
title: "Project languages, with four starters"
status: active
kind: exec-spec
created: 2026-10-28
last_reviewed: 2026-10-28
area: language, patterns-site
promoted_to: ""
superseded_by: ""
---
# Project languages, with four starters

Strawman, research-gated (§Research gate, reported 2026-10-28; its proposals await the author).

## Intent

The sidebar lists the whole library. In *A Pattern Language* a maker does not
work from the whole: they choose a language for their project, a short list
taken from the master list, and extend it with patterns of their own ("Choosing
a language for your project"). *The Nature of Order* makes the same point as a
requirement: each project needs a language constructed for it, and a general
repertoire is the material it is constructed from (Book 2 ch. 13). The library
has no notion of a project language; the gap is recorded as out of scope in
[2026-08-property-mining.md](2026-08-property-mining.md).

The long-term aim is that an actor makes a language for their project by
selecting from the library. The first step, this plan, hard-codes a few project
languages as starters for typical artifact shapes. The actor picks one in the
pattern list's menu to narrow the list to it, and each starter has a page of
its own.

## What a project language is here

- A list of design patterns (`role: pattern`) chosen from the library for one
  project. Foundations and qualities are not members: every language draws on
  them, and the sidebar keeps showing them whole.
- Ordered large to small, as in APL's master list, where a pattern's place
  shows which patterns it helps complete. The authored levels list gives a master
  order, which a starter's author may follow or depart from by judgement. The order is approximate in the same way a sequence's order is.
- A starter is a project language for a typical artifact shape, written to be
  cut down and extended. It is where a project's own language begins, not the
  project's language itself. Following APL, a starter leaves a pattern out when
  in doubt; a project adds what it misses and drops what it does not need.
- A project language is not a sequence. A sequence orders the decisions of one
  stretch of work; a language selects the patterns a project draws on across
  all of them. The language's page lists the sequences that invoke its
  patterns.
- APL starts a project language from the pattern that best describes the
  project's overall scope. Artifact shapes are not patterns in the library:
  [information environment](../../apps/patterns/src/content/patterns/information-environment.mdx)
  and [tool ecology](../../apps/patterns/src/content/patterns/tool-ecology.mdx)
  both note that the patterns between them and the smaller ones are not yet
  written. Each starter therefore describes its shape in its lead and begins
  from the largest patterns that exist. Whether shapes become patterns is left
  open (§Open questions).

## The starters

The starters lie on three axes: a shape (how the content is made and
edited), a medium (what the artifact is used through), and a collaboration
posture (how an agent takes part in the work). A real project often combines
two, such as a delegated agent used on a phone. Combining starters is not part
of this step (§Open questions).

- *Conversation-first* and *Delegated agent*: two of the three collaboration
  postures the sequence map names (embedded, conversational, delegated). They
  replace an earlier *AI tool* starter that mixed all three and ran to 32
  patterns. Choosing one of them is the posture decision the sequence map
  leaves without a home, made at the start of a project's language.
- *Embedded assistance* is not a starter. Its ground is the assistance
  escalation sequence, which climbs within whatever surface the artifact
  already has, so it reads as a sequence a project walks rather than a
  language it starts from. This is the author's call and may be revisited.
- *Mobile web*: a site or web application used mainly on a phone, with a narrow
  screen, touch input, short and interrupted visits, and arrival from links.
  The library keeps one corpus and puts platform variance inside each page
  ([2026-08-platform-variance.md](2026-08-platform-variance.md)), so this
  starter is a selection, not a corpus of mobile patterns.
- *Block-based editor*: a document made of blocks the actor inserts, moves,
  converts and links.
  [Block-based editor](../../apps/patterns/src/content/patterns/block-based-editor.mdx)
  is its starting pattern, with the block-editing territory around it.
- No fourth starter for now. A *team work tracker* (the issue-tracker walk,
  which runs through all thirteen sequences) was considered and set aside as not
  generic enough to be useful as a starter at this point.

The draft lists are written after the research gate (§Steps, step 4).

## Shape

### Collection

- `apps/patterns/src/content/languages/<id>.mdx`, a fourth zod-gated
  collection beside patterns, sequences and concepts. The filename stem is the
  id.
- Frontmatter: `title`, `added`, `updated`, `description` (one sentence about
  the artifact shape, told from the actor's situation), `patterns`, the
  ordered slugs, at least one and no duplicates, and `gaps`, the patterns the
  shape needs that the library lacks (APL's step 7: write in what the language
  has no pattern for), each a name and a one-sentence note.
- The gaps are a worklist for the library as well as part of the language: a
  gap leaves once a page with its name exists, and the validator fails while
  both are present.
- Body: the lead. It says what the shape is, what holds across its patterns,
  and what the starter leaves out on purpose. It does not list the patterns,
  which the page renders from frontmatter.
- `integrations/validate-cross-references.ts` resolves every slug and fails on
  one that is missing or not a `role: pattern` entry.

### Page

- `/languages/<id>` and the pane partial `/languages/<id>/pane/`, both rendered
  by `LanguageArticle.astro`. A language page stacks like a sequence or a
  concept page, with a `lang:` prefix in the `stackedNotes` param.
- The page has the lead first, then the patterns as a numbered list in the
  authored order, each with its description where it has one. Last come the
  sequences that invoke any of its patterns (as a step's rule, a constituent,
  or a choice's tree), in reading order, with how many of each sequence's
  invoked patterns the language holds.

### Sidebar

- The first row of the Patterns branch names the active language and grouping
  and opens one menu that picks the grouping and the language, *All* or one starter. Choosing a starter narrows
  the pattern list in every grouping; foundations, qualities and the Sequences
  group are untouched, which is why the control sits with the list it
  narrows. The menu links to the active starter's page, and the trigger names
  the starter and any grouping other than A–Z.
- *All* is the default. The choice persists in the nav store like the
  grouping does, and a persisted id that names no language falls back to *All*.
- The tree is built at build time like the groupings: it carries each
  language's member paths, and the persisted island filters on the client.
- A family branch (Navigation, Conversational primitives) shows only those of
  its members that are in the language, with its overview while any member
  remains.

## Steps

Steps 2, 3 and 5 are done. Step 4 has first drafts of all four starters
(§Starters), pending the gate and the author's review.

1. *Research gate* (§Research gate).
2. *Collection and page.* Done. Schema, `LanguageArticle.astro`, the two
   routes, the `lang:` pane kind, and slug validation.
3. *Sidebar.* Done. The switcher, the filter, and persistence.
4. *Draft the starters*, one sitting each. Follow APL's procedure from the
   largest patterns down the smaller links, check the list against the walks
   that reach the shape, and record what was left out and why under §Starters.
5. *Docs.* Done. A §Project languages section in
   [pattern-site.md](../../docs/specs/pattern-site.md); *project language* and
   *starter* in the glossary; a line in the pattern-content rule saying
   language files follow their own shape; the property-mining plan's
   out-of-scope entry pointed here.

## Research gate (2026-10-28)

The gate asked what the strawman gets wrong. It read Alexander's own project
languages (*The Nature of Order* Book 2 ch. 13; *The Oregon Experiment*,
partly; Eishin through secondary accounts), pattern collections with entry
points by type (van Welie 2003 and 2008, *The Design of Sites*, Tidwell,
Björk and Holopainen, Dearden et al. PDC 2002), the design-fixation line
(Kulkarni et al., Linsey et al., Vasconcelos and Crilly, Siangliulue et al.,
Chan et al. 2024, Adams et al.), and work on combining languages (Porter et
al.). Notes in the vault: `Areas/IxD patterns/research/project-languages/`.
*The Production of Houses* and *The Battle* were read only in abstract, and
no study tests selections from a pattern language.

Claims the decisions rely on:

- Alexander used both routes, picked by how familiar the project was: a
  language "may be invented from scratch, composed of known languages that have
  been re-combined, or may be a modification of a known language" (Book 2
  ch. 13). Oregon started from an APL subset, deleted and inserted patterns,
  added 18 of its own, and let any group add more. Eishin built its own list
  from interviews and set the usual school list against it.
- The precedents wrote the artifact type itself as a pattern and took its list
  from that pattern's links (van Welie's filter shows the patterns connected to
  the site-type pattern). There is no outcome evidence for or against such
  entry points.
- Dearden et al. found users read optional patterns as correct, read the
  language's organisation as a direction for the design, and met a language
  that lacked their idea.
- Examples increase conformity even under instruction not to copy, and having
  no example is not neutral either. Diverse examples shown together, examples
  on request, and cues that name what to remove reduce it; people starting from
  a full set keep more and overlook removal.
- Of the first three starters, only the block-based editor was a shape. The AI
  tool was a posture and mobile web a medium, which the collections kept as a separate
  dimension. Combining languages works as an ordered composition, not an
  intersection.

Proposed changes, for the author to decide (none applied):

1. Record what a starter leaves out and why as data (`left_out`: slug and
   reason), and the patterns the library lacks (`gaps`), not only in the lead.
   `gaps` is adopted, four per starter; `left_out` is not.
2. Name a starting pattern (`starts_from`), which is the precedents' form and
   bears on the open question of shapes as patterns.
3. Give each starter an `axis` (shape, posture, medium). Treat posture and
   medium starters as overlays on a shape, with one rule for combining them:
   the shape leads, and an overlay adds its members.
4. Mark members in the full list instead of hiding the rest, against fixation.
   This conflicts with the author's choice to narrow the list, so it stays a
   question.
5. Expect the posture starters, the newest territory, to miss most.

Adopted since: the AI tool starter is replaced by two posture starters
(§The starters), which takes up the posture half of proposal 3 without the
`axis` field or a combining rule.

## Starters

First drafts, written to test the mechanism before the research gate
reported. The lists are in the language files; what follows is how each was
assembled and what it leaves out. None has been checked against the walks
yet; that check and the author's review are the step 4 sittings.

Every starter opens with tool ecology and information environment. Both are
seeds, and both are decisions the maker of any of these artifacts takes, so
APL's rule for larger patterns (include them only where the project can act on
them) admits them.

### Conversation-first

Assembled from the encounter (every region), calibrating reliance's evidence
marks, and selective memory from memory and continuity. 25 patterns.

Left out: the delegated run (agent, live presentation, approval gate,
handoff), the assistance climb, explanation and the acceptance checks of
calibrating reliance, and generated content, which a conversation that
produces documents adds.

### Delegated agent

Assembled from delegating work and governing autonomy, with the watch and
arrival points of attention and tempo (status feedback, notification) and the
evidence a reviewer needs (provenance marking, citation, the acceptance
check). 25 patterns.

Left out: the conversation primitives, which come in with the
conversation-first starter when the request is made in one; workflow and rule
composition, which belong to standing procedures; extraction; and selective
memory.

### Mobile web

Assembled by judgement from structuring the space, composing views and making
changes, keeping what holds on a narrow touch screen in short visits arriving
from links. 21 patterns.

Left out: coordinated views and other layouts that need width, keyboard
shortcuts and the command menu, pyramid, sorting, item view, notification,
wizard (step-by-step covers the ordered flow), and inline confirmation.

### Block-based editor

Assembled from block-based editor's few edges (selection, command menu, AI
completion, editing in place) and the block-editing territory around them.
20 patterns. The page itself is unshaped and links little, so this list rests
on judgement more than the other two.

Left out: data views over blocks (tables, boards), draft and publish, sharing,
searching, tag, annotation, instructed revision, and workspace.

## Open questions

- Combining starters, for projects that span two shapes: the union of their
  lists, or a language of its own.
- Whether artifact shapes become patterns, in the band between information
  environment and tool ecology and the smaller patterns.
- Project languages that actors make themselves: picking patterns in and out,
  where the selection is kept (browser storage, the URL, a file), and how it is
  shared.
- Whether a project language also chooses foundations and qualities, such as
  the qualities a project is held to.
- Whether the home-page graph projects the active language, for example by
  dimming non-members.
- Whether the page orders by the levels list instead of the authored order.
- Whether search narrows to the active language.
- Whether Cooper's application postures (sovereign, transient, auxiliary,
  daemonic) give starters for artifacts without an agent. Mobile web sits
  close to transient and the block-based editor to sovereign.

## Validation

- `npm run test` passes, including the content schema and the cross-reference
  check.
- In `npm run dev`, each starter's page lists its patterns and sequences and
  stacks from a link inside a pane. Choosing a starter in the Patterns menu
  narrows every grouping, and the choice survives navigation and reload. *All*
  restores the full list.
