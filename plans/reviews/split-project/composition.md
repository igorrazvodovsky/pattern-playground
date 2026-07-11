# Composition pass — split-project

Capstone of the Loop 1 recursive run (`/move-review compose split-project`),
per `plans/active/2026-07-review-practice.md`. Object: the eight episode
walkthroughs and their verdicts (all written 2026-07-11), read together.
Findings live *between* episodes; no episode-level verdict is re-adjudicated.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | The bilingual entry: promised as one, settled as two-bound | reframe |
| 2 | Two units of reference: the section and the node | accept |
| 3 | Collections: apparatus minted, instances emptied | fix |
| 4 | The verdict-spawned plan mesh | fix |
| 5 | The mature move record overtaken by its own realisation | fix |
| 6 | Move-vs-artifact register: two precedents ahead of the plan | fix |
| 7 | Enforcement by promise: the boundary ledger nobody keeps | accept |
| 8 | Two homes for carried work | accept |

## Composition read

The episodes compose. Read together they serve one image, sharper than any
single walkthrough states it: *everything in the language is authored; the
machine renders, validates addresses, and advises, but never infers an edge
and never evaluates a judgement.* Episode 02's fix retired the last
silent-minting channel (02 M1 verdict: "edges come from explicit channels and
judgement homes only"); 01's consumer contract forbids evaluation downstream
(01 M2); 03–05 built exactly the machinery this stance permits — gates over
addresses, advisories over prose. Where episodes share a seam they landed
compatible answers: the graph went language-only and the vocabulary redefined
`enables` to match (01 M3); the To-do convention minted in one sitting was
reused verbatim by another (03 M7 citing 02 M2). The light episodes (07, 08)
are reactive, not divergent — unplanned, as the episode map already records.

Where the branch pulls in more than one direction, the pulls are specific:
the "one bilingual entry" promise against the settled two-pages-bound contract
(finding 1); section addresses against node-only graph identity (finding 2);
a role minted by one episode, emptied by another's sitting (finding 3). None
is a collision between episode verdicts — each is the composed trajectory
outrunning the vision/operative-image documents, the exact diff the
reconcile-image loop adjudicates. Merge-readiness at the design layer:
coherent trajectory, settled verdicts, a short list of named vision-level
diffs for reconcile-image, and two seams in the verdict-spawned plans to
close before those plans run (finding 4).

## Move 1: The bilingual entry: promised as one, settled as two-bound

*The move.* Across episodes 01, 03, 05, and 06 the branch settled what a
cross-surface entry is. Component realisation became frontmatter `realised_by`
node metadata plus claim-free prose citations, deliberately unrendered by
RelatedPatterns (01 M3 verdict). Material foundations (Color, Typography, …)
resolved as substrate-only, the language foot deliberately withheld (03 M1
verdict, now stated in workspace-layout.md §Bilingual entries). Cross-surface
references became typed elements validated at build (05 M2, 03 M4). The Form
pair was bound by "one validated reference per direction, and each page opens
by saying what it is not the source for" (06 M5 verdict, now in
pattern-role-model.md:84–88).

*Answers to.* docs/project/vision.md §Bilingual substrate maturity: "the
cross-surface reference scheme resolving so a quality or foundation reads as
one bilingual entry rather than two linked pages."

*Backtalk.* The settled contract is not the promised one. The vision names
*one entry, two feet*; what four episodes converged on is *two pages, each
sovereign over its half, bound by validated references* — a coupling
contract, not a fusion. The verdicts are internally consistent about this
(01 M3's reframe explicitly demoted prose refs to citations; 06 M5 wrote the
binding convention into the role-model spec), so the divergence is between
the composed branch and the vision, not between episodes. Meanwhile
docs/project/operative-image.md still records the scheme as "not yet
established — Storybook quality and foundation pages still link to Storybook
URLs … bilingual entries read as two pages rather than one" — stale on the
mechanism (05 M2 landed PatternRef/ComponentRef and reciprocal nav) and, more
interestingly, treating "two pages" as the deficiency when the branch's
settled contract treats bound two-ness as the design.

*Question.* When reconcile-image runs, which way does this diff resolve: does
the vision sentence still name a real aspiration (a rendering layer that
composes the two feet into one read), or has the branch discovered that
"bilingual entry" *means* two sovereign pages bound by validated references —
in which case the vision should say so, and the operative image should stop
describing the settled contract as the not-yet state?

*Verdict:* reframe — the finding misread both halves: the two-pages-bound
contract the episodes settled governs patterns and their realising mechanisms,
not bilingual entries; and the "one entry rather than two linked pages"
aspiration was resolved by *allocation*, not left pending fusion — each concept
now has exactly one descriptive home (language entry for interaction-design
material, substrate-only for visual material; workspace-layout.md §Bilingual
entries), so no two-page state exists. Residue for reconcile-image: the
op-image's "reference scheme not yet established / reads as two pages" bullet
is stale, and the vision sentence can be recorded as realised-by-allocation.
(2026-07-11)

## Move 2: Two units of reference: the section and the node

*The move.* Episode 05's sitting made the section part of the address:
fragments are encoded into `stackedNotes`, "the section is part of the
address, not just wayfinding" (05 M3 verdict; now in pattern-site.md
§Stacked-notes navigation). Episode 03 recorded that sub-page *graph*
addressability is blocked: "hybrid-patterns and behaviour anchors both need
sub-page graph addressability and the filename-stem = slug = graph-ID
identity is the blocker" (03 M1 backtalk). Episode 06's sitting supplied the
graph's mechanism for finer granularity: inbound link pressure mints a new
node, now the fourth fission signal in pattern-role-model.md (06 M6 verdict).

*Answers to.* pattern-site.md §File layout ("The filename stem *is* the
entry's identity: its slug, its route, its graph node ID") and the same
spec's new anchors-in-the-address sentence — the two-unit answer now lives in
one document.

*Backtalk.* Read together, the branch gave two different answers to "what is
the unit of reference," one per layer: readers address sections; claims
address nodes, and when claims need something finer, the node splits. No
episode saw both answers because they landed in different sittings. The
composition is defensible — an address is cheaper than an identity, and
fission-on-pressure keeps the graph honest — but it is nowhere stated as a
two-layer design, and 03 M1's backtalk shows the pressure is real (two named
cases already want sub-page graph addressability that fission may not suit:
a behaviour anchor is not a candidate node).

*Question.* Is "sections are addresses, nodes are identities, link pressure
converts one to the other" the language's actual position — worth a sentence
in pattern-site.md or the role model, so hybrid-patterns and behaviour
anchors get adjudicated against it rather than re-opening stem=ID — or do
the two named blocked cases show the position is incomplete, in which case
which layer yields: sub-node addressability in the graph, or coarser
addresses on the reading surface?

*Verdict:* accept — two-layer by design: sections are addresses on the reading
surface, nodes are identities in the graph, and inbound link pressure is the
converter. The far horizon is the specificity gradient already recorded in
docs/levels-of-scale.md — documents receding into projection targets, where
the address/identity distinction dissolves — but that is distant, and
address≠identity is the working position; the verdict is its home, no spec
line minted. Spec-side, the nearest hook is docs/project/vision.md, and
linking it to levels-of-scale.md is an option for the reconcile sitting.
Hybrid patterns and behaviour anchors get adjudicated against the position
when they arise, not pre-solved. (2026-07-11)

## Move 3: Collections: apparatus minted, instances emptied

*The move.* Episode 06 M1 built the collection apparatus: `role:collection`
with `surveys` edges mapped to `skos:member`, a three-part-whole table, four
AT collection pages converted to `.md`. Episode 04's sitting then deleted
those four pages outright ("handwritten overview pages lag the corpus and
facet projections are the intended direction", 04 M1/M5 verdicts), leaving
`data-visualization.mdx` as the sole survivor — itself authoritative-for-now
by explicit exception with an acknowledged strain on "a collection is never
the authoritative source for any move" (03 M7).

*Answers to.* The deletion answers to the multiple-projections belief
(core-beliefs.md); the apparatus answers to the umbrella-retirement research
(06 M1). The *replacement* direction — navigation as facet projections, a
projection as a site-wide mode — answers to nothing on record beyond the 04
M1 and 05 M4 verdicts and a Base.astro comment; neither operative image
mentions projections or facets (grep: zero hits in both files).

*Backtalk.* The verdicts do not collide — 06 M1 adjudicated the *taxonomy*,
04 M1 adjudicated the *pages* — but their composition leaves the language
carrying a role, an edge type, an invariant (vocabulary doc invariant 7:
"`surveys` sources are collections"), and a SKOS mapping whose instance count
is approximately one, and that one an admitted exception. Meanwhile the
direction that replaced the collections (facet projections as the navigation
surface) is a genuine image-level commitment — it decided a deletion and an
island architecture (05 M4) — recorded only in review verdicts.

*Question.* Two questions, one per side of the emptying: (a) is `collection`
still a role of the language (a shape awaiting future domain corpora, as
data-visualization suggests) or has the branch effectively retired it for AT
territory — and should the vocabulary's own retirement machinery (per-type
counts, 01 M6) be pointed at `surveys` now rather than discovering it later?
(b) Where does "navigation is a projection over facets, one site-wide mode
at a time" get recorded so the next navigation decision answers to it —
pattern-site.md, or the operative image at the next reconcile?

*Verdict:* fix — (a) the count was two, not one: navigation-overview is also a
collection, and retirement is an *ambition*, not a discovery — the direction is
to dissolve the remaining collection pages into facet projections, now named in
relationship-vocabulary.md §Retirement so the machinery watches `surveys`
deliberately (if the last collection dissolves, `surveys` retires with the
role). (b) The projection commitment — navigation is a projection over facets;
a projection is a site-wide mode, exactly one active at a time — is now
recorded in pattern-site.md §Classification facets, where the next navigation
decision will find it. (2026-07-11)

## Move 4: The verdict-spawned plan mesh

*The move.* The verdict sittings spawned or amended seven active plans in one
day: realised-by-backfill (01 M3), related-residue-audit (04 M3),
pane-island-hydration (05 M1), link-preview-extraction step (05 M5),
storybook-rebucketing (06 M4), block-editing-followups (07 M5), plus in-place
doc fixes throughout. Two plans were explicitly coordinated with each other
(05 M5's verdict names the shared article-extraction seam with
pane-island-hydration).

*Answers to.* The review practice itself (plans/active/2026-07-review-practice.md);
the registries convention (carried work becomes plan files).

*Backtalk.* The mesh mostly composes, with two seams the sittings could not
see because the plans landed in different episodes. First, an ordering/scope
gap: storybook-rebucketing step 3 sweeps `ComponentRef` ids when Storybook
titles change, but realised-by-backfill will write ~50 pages of `realised_by:`
values that are *also* Storybook docs ids validated against `index.json`
(backfill step 4) — a retitle after the backfill breaks a channel the
rebucketing plan's sweep list does not name. The validator makes the break
loud, not silent, but the plan text owns only half the id-bearing surface.
Second, a registry gap: related-residue-audit's gate — "pattern–foundation
link treatment … no settled edge treatment exists" — is a vocabulary
decision, yet it appears in no vocabulary-doc open question; the doc's open
questions are the standing register the episode verdicts themselves lean on
(02 M3: "open questions are re-read at changelog sittings, which is watch
enough"), and the doc already holds a partial answer (the foundation
tiebreaker under `instantiates`, lines 49/73) that the gate does not cite.

*Question.* (a) Which plan owns the realised_by/retitle seam — a line in
rebucketing step 3 adding `realised_by` to the sweep, a sequencing note in
the backfill, or both? (b) Should the pattern–foundation gate become the
vocabulary doc's open question 8 (cross-referencing the existing tiebreaker
it must extend), so the register the sittings trust actually contains the
question the review created?

*Verdict:* fix, both seams — (a) the rebucketing sweep now names `realised_by`
as an id-bearing channel (it owns retitles, so it owns every channel a retitle
breaks), and the backfill carries a one-line sequencing note pointing back;
the validator remains the loud backstop either way. (b) The pattern–foundation
gate is now the vocabulary doc's open question 8, cross-referencing the
`instantiates` foundation tiebreaker it must extend; the residue-audit's gate
paragraph cites both, so the standing register and the plan point at each
other. (2026-07-11)

## Move 5: The mature move record overtaken by its own realisation

*The move.* Episode 01 landed `situation.initiating` / `situation.resulting`
corpus-wide as constructs (01 M1), and episode 04 surfaced the maturity-
legibility strain from the other side: stubs presenting with finished-page
authority, and the fun meter — authorial register — schema-less and
consumer-less (04 M6, accepted as deliberately open).

*Answers to.* docs/language/vision.md §Mature move record, which lists the
still-unrealised fields as "`problem`, `forces`, `consequences`, `evidence`,
and `status`".

*Backtalk.* Episode 01 M1's backtalk named the overlap and no verdict
adjudicated it — the verdict scoped `sets-up`, not the vision list: vision.md
still lists `consequences` as unrealised while `situation.resulting` is
defined as "what holds after the move is applied, including the new problems
it opens." The two now cover overlapping ground with no stated boundary.
Composing 04 M6 alongside sharpens the `status` half: the corpus is already
generating the need the field names — pattern-definition.md demands maturity
be "legible … more than editorial confidence", the validation stub and the
first-stab entries (07) present without any legible status, and the fun
meter's open question ("where does the language want authorial register …
to show", 04 M6) is adjacent to the same missing field. An unadjudicated
overlap between a landed construct and a vision field is precisely the
composition-level deviation this pass exists to raise.

*Question.* After the branch, which fields of the mature move record are
genuinely still unrealised? Concretely: does `consequences` survive as a
distinct field, or is it absorbed into `situation.resulting` (in which case
the vision's list should shrink) — and is `status` now the next field the
corpus is asking for, given three episodes independently touched maturity
legibility without a home for it?

*Verdict:* fix, scoped out — the situations need a corpus-wide filling pass
regardless (17 of 92 `role:pattern` entries carry a block), now
`plans/active/2026-07-situation-backfill.md` (thin outline, marked for
iteration); the consequences-vs-resulting comparison is a named step of that
plan, so the vision's list shrinks (or doesn't) on a filled corpus's evidence
rather than by declaration here. On (b): yes — `status` is adjudicated as the
next mature-move-record field the corpus is asking for; the three pressure
points stand as its motivation, realisation separate. (2026-07-11)

## Move 6: Move-vs-artifact register: two precedents ahead of the plan

*The move.* Two sittings adjudicated artifact-flavoured naming locally: 01 M4
accepted the Locative axis's register ("spatial containment is not
artifact-specific; activities can be 'spatial' too"), explicitly to keep
plans/active/2026-07-move-vs-artifact-naming.md from re-litigating `hosts`;
07 M3 kept "keyboard shortcuts" as the entry name against the walkthrough's
*direct invocation* candidate, while stripping the artifact-grade content.

*Answers to.* The standing move-vs-artifact plan, which pre-dates the review
and holds the general question ("some patterns sit closer to artifact-names
than moves").

*Backtalk.* The two verdicts are compatible with each other — both hold that
a name or type legible in the artifact register can still speak the pattern
language honestly — and together they are half a doctrine the standing plan
does not yet contain. The 01 M4 question asked that the type's definition
"say which register it addresses so the move-vs-artifact plan doesn't
re-litigate it"; the verdict answered the register question but the plan, on
record, has not absorbed either precedent. The risk is not contradiction but
waste: the plan re-deriving what two sittings settled, or worse, settling
differently.

*Question.* Should the two precedents be written into the move-vs-artifact
plan as constraints (locative types may speak the artifact register; an
industry-standard artifact name may stand when the community-of-practice
collision is empty — 07 M5's block-based ruling is a third), or is that plan
deliberately free to overturn sitting-level rulings, in which case the
verdicts should say they are provisional pending it?

*Verdict:* fix — the sitting rulings are senior: all three precedents
(`hosts`/Locative register, keyboard shortcuts, block-based editor) are now
recorded in the move-vs-artifact plan as a §Settled constraints section, so
the plan builds on them rather than re-deriving or contradicting them; they
double as the standing evidence for the industry-standard-name exception
clause the plan's iteration notes already contemplate. (2026-07-11)

## Move 7: Enforcement by promise: the boundary ledger nobody keeps

*The move.* Five episodes each accepted a boundary that holds by promise
rather than by check: invariant 9 "holds by review of consumers" (01 M2);
the advisory-not-error grade of all extractor checks (01 M6); the dependency
boundary as documented edge plus convention, pnpm as a future lever (03 M5);
the bare-Storybook-build drift caveat under the one-directional validator
(03 M4); one-toolchain convergence staying "vigilance rather than gaining a
spec line" (08 M1).

*Answers to.* Each promise individually answers to the epistemic stance
("hints, not predicates") or to a deliberate cost call recorded in its own
spec section; no document answers for the set.

*Backtalk.* Individually every one of these is adjudicated and defensible —
several verdicts explicitly wrote the caveat into the owning spec
(workspace-layout §Cross-surface integrity, §Workspace dependency direction;
pattern-site §Toolchain posture). Composed, the branch has quietly made
promise-keeping a load-bearing material of the architecture: the number of
standing unchecked commitments grew by roughly five in one branch, each
recorded beside its own seam, none listed anywhere as a class. Episode 05
M6's Google-Fonts external-host note and 03 M6's undeclared `shared/` deps
were the same species, passed without action. The dispersal may be the right
design — a promise beside its seam is where a future editor meets it — but
that itself is an unstated convention, and the one prior instance of a
stranded rationale (the stage-2 extractor sentence, 03 M2) shows what
dispersed promises do when their premise silently expires.

*Question.* Is "each promise lives beside its seam, no central ledger" the
deliberate policy for unenforced boundaries — worth one sentence somewhere a
future auditor would look (workspace-layout, or the agent-harness spec, since
an agent is the likeliest promise-breaker) — or does the count now justify a
short standing list, so the next drift review can sweep the promises the way
sweeps audit the edges?

*Verdict:* accept — each promise beside its own seam is the arrangement, and
it stands without a ledger or a policy sentence; a future editor meets the
caveat where they meet the seam. The stage-2 precedent stays the known cost,
carried knowingly. (2026-07-11)

## Move 8: Two homes for carried work

*The move.* The review settled two conventions for work the branch could not
finish in place: page-local `## To-do` sections ("rendered, checked when the
page is edited; lifecycle enough for now", 02 M2 verdict, reused by 03 M7 for
data-visualization) and plan files for cross-page carried work
(block-editing-followups, 07 M5; the registries convention).

*Answers to.* The registries-in-plans convention (carried work items become
plan files); episode 02 M2's verdict for the page-local half.

*Backtalk.* The two homes were minted in different sittings and compose on an
implicit boundary — page-local nuance stays on the page, cross-page or
decision-shaped work gets a plan — that 03 M7's verdict already applied
correctly ("per the To-do lifecycle settled in episode 02"). The boundary is
legible from the verdicts but written in no rule; 26 pages carry a To-do and
the convention that governs them lives in a review file.

*Question.* No question beyond placement — does the To-do convention (and its
boundary with plan files) get a line in `.claude/rules/pattern-content.md`,
which already owns page structure, or is the review record home enough until
a To-do is first mishandled?

*Verdict:* accept as is — the boundary works and a page-local To-do has no
real mishandling mode; no rule line owed. (2026-07-11)
