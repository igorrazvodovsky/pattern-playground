---
title: "Move-vs-artifact naming: the T6 kept twins"
status: "completed"
kind: "exec-spec"
created: "2026-07-10"
last_reviewed: "2026-07-12"
area: "language, pattern-site"
promoted_to: ""
superseded_by: ""
depends_on: "plans/completed/2026-07-relationship-vocabulary.md (re-homed from its carried list); docs/specs/pattern-role-model.md (bilingual-same-name rule)"
---
# Move-vs-artifact naming: the T6 kept twins

## The tension

The naming rule says a pattern is named by the interaction move, not the component that implements it ("Transient feedback", not "Toast"); the name must apply to any valid implementation. The T6 closure kept Sections and Command menu as bilingual twins — the mechanism's name on the pattern side, under the bilingual-same-name rule (pattern-role-model.md, seam-naming signal). The reflection that carried here: both sit closer to artifact-names than Form does.

Form is the comparison point: "form" reads as the activity of structured collection as much as the widget, so the same-name rule costs nothing there.

## Settled constraints

Three rulings from the split-project move review (2026-07-11) were settled inputs:

- *The Locative axis (`hosts`) speaks the artifact register legitimately.* A relationship type may address the artifact register when the relation itself is register-neutral (review 01 M4).
- *Keyboard shortcuts keeps its thing-like name.* The fix was stripping the artifact-grade content, not renaming; the name is the industry's (review 07 M3).
- *Block-based editor keeps the industry name.* An industry-standard artifact name stands when the community of practice that owns the term elsewhere is distant enough that no practical collision arises (review 07 M5).

Together: a name legible in the artifact register can still speak the pattern language honestly — renaming is not owed for register alone.

## Outcome (2026-07-12)

Both twins keep their names. The naming rule in pattern-role-model.md §Naming gained two clauses recording why.

- *Command menu* stays under the industry-standard-name exception: the name is the practice community's own term for the move, and the page body opens with the move itself (invocation by name). Recorded as a Naming clause with Keyboard shortcuts and Block-based editor as the standing evidence.
- *Sections* stays for a different reason, also now a Naming clause: the name denotes the invariant content structure, not a widget — sections survive every disclosure affordance the way a form survives every layout, so the name transfers where "Toast" would not. Its weakness is under-specification, not falsity: it names the precondition (content grouped into named parts) rather than the move. The page body now names the underlying move explicitly.
- The plan's candidate move-name for Sections ("adaptive disclosure") was wrong by the page's own evidence. The page named its move *affordance follows context* and marked it as broader than the page — Priority+ makes the same move over inline groups of controls. Renaming Sections to the general move would have claimed territory that includes Priority+. The general move stays unauthored, named in Sections' body as a candidate node.

## Bilingual binding repair

The bilingual-pair binding pattern-role-model.md requires (`realised_by` on the move page; first-paragraph `PatternRef` deferral on the mechanism page) existed only for Form. Fixed in the same pass: `realised_by` added to `sections.mdx` and `command-menu.mdx`; both mechanism pages (`Sections.mdx`, `CommandMenu.mdx`) now open with mechanism framing and defer the move to the pattern page instead of duplicating its prose — CommandMenu.mdx had opened with the pattern page's first sentence verbatim.

## Sweep findings

One pass over all pattern titles for artifact-names beyond the twins; findings only, nothing demands a rename:

- *Form-like bilingual words* (act and artifact; same-name rule costs nothing): Notification, Prompt, Tag, Annotation, Template, Selection, View.
- *Industry-standard names* (covered by the new exception clause): Wizard, Bot, Checklist, Activity feed, Activity log, Settings, Link preview, Workspace, and the IA topology names (Hub and spoke, Pyramid, Multilevel tree, Fully connected).
- *Sections-grade* (artifact name with a distinct nameable move): Item view and Data view — both already marked provisional (ItemView is a first stab); no action owed until the view system firms up.
- Prior art in the corpus: `dashboard.mdx` renamed its title to "Needs-based view" while keeping the slug — a cheap title-rename option available if a future case wants a middle path short of slug migration.
