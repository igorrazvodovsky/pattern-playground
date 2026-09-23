---
title: "Research organisation after the move to the vault"
status: "archived"
kind: "exec-spec"
created: "2026-09"
last_reviewed: "2026-09-23"
area: "project"
promoted_to: "docs/project/plan-drafting.md (§Research checkpoint: digest contract, instrument); .claude/rules/pattern-content.md (public links in rendered text); docs/research/references.md; scripts/check-vault-links.mjs; vault: research-gate skill, Resources/Papers/_pipeline/README.md §Shared findings"
superseded_by: ""
---
# Research organisation after the move to the vault

Research gate: `PARA/Projects/pattern playground/research/research-organisation/` (2026-09-23).

## Context

Research moved from the repo to the PARA vault on 2026-09-21. The vault owns
papers and reading: the Papers store, the gate runs under
`PARA/Projects/pattern playground/research/`, and the source overlays under
`.../sources/`. The repo owns questions and decisions: plans, specs, and
pattern pages.

The work between the two sides moves in four flows:

1. A question goes out, from a plan's research checkpoint or a pattern sitting.
2. Evidence is gathered in the vault, against the Papers store.
3. A decision lands in the repo, in a plan, spec, or pattern page.
4. Reading accumulates in the vault, reusable across its projects (pattern
   playground, AI patterns, generative UI, agents & assistants).

This plan sets the contract for each flow.

## Settled

- *One session reaches both stores.* Storage stays split; the session that
  drafts a plan can run the gate and write to the vault without a handoff.
- *The decision carries a digest.* The plan or spec that decides holds the
  claims it relies on, what was deliberately not adopted, and the run folder's
  path as provenance. An actor without the vault can follow the decision from
  the digest. Applied to [`docs/project/plan-drafting.md`](../../docs/project/plan-drafting.md)
  §Research checkpoint. The gate confirmed the rule (Meza Soria et al. 2024:
  teams recover decisions from the working artefact, not from separate
  records) and added one condition from ADR practice: an accepted digest is
  superseded, not rewritten.
- *Public text cites by public link.* Rendered pattern and sequence text cites
  DOI, arXiv, or URL; vault paths appear only in MDX comments. Applied to
  `.claude/rules/pattern-content.md`.
- *Takeaways live in the vault overlays.* What the project takes from a source
  is written once, in its overlay under `.../sources/`.
- *`AI patterns/patterns/` is a nursery.* Its notes graduate into the repo
  once the relationships between digital mediums are defined. Until then no
  crosswalk is maintained.
- *Findings stay per project; a finding is shared when a second project
  reuses it.* The gate argued against a single frame-neutral layer: a finding
  keeps the question that produced it even with the lens words removed
  (Shipman & Marshall 1999; Hammersley 2010), and shared stores are kept up
  only when the writer benefits in the same sitting (Grudin 1996; Buckingham
  Shum & Selvin 2006). Each finding carries the paper identifier, the quoted
  passage, and the question it answered. On second use it moves to the shared
  layer and each project keeps its own reading on top, as papers and overlays
  already work.
- *Vault evidence is not versioned.* The vault is in Dropbox, not git, so a run
  note the repo cites can change without history. With one author, a note's
  last-edit date against the citing decision's date is enough to tell whether
  the evidence moved after the decision.

Deliberately not adopted: a vault-wide, frame-neutral findings layer written
up front; putting the vault under git; publishing the vault as a digital
garden (it would make public citations followable, but the repo's digest
already covers the actors who need the reasoning).

## Work

### 1. Single-session setup

- Anchor every path in `$PARA/.claude/skills/research-gate/SKILL.md` and its
  `scripts/retrieve.py` on `$PARA` rather than the working directory, so the
  skill runs from a repo session.
- Symlink the skill into `~/.claude/skills/research-gate`; the vault copy
  stays the source.
- Add `$PARA` to `additionalDirectories` in the repo's
  `.claude/settings.local.json`.
- Update the instrument sentence in `plan-drafting.md` and the
  `pattern-classifier` skill once the skill runs from the repo.

Done when a gate run started in a repo session writes its folder and intake
lines to the vault with no path errors.

Status: the skill's paths are anchored on `$PARA`, falling back to the
working directory in a vault session, and `retrieve.py` runs from the repo
through that path. The instrument sentences are updated. The skill is
symlinked into `~/.claude/skills/research-gate`, and the vault is listed under
`permissions.additionalDirectories` in the repo's `.claude/settings.local.json`.
What remains is the end-to-end check: a gate run from a fresh repo session.

### 2. Gate definition of done

Add to the skill: a run is done when every paper read in full or in part has a
line in `Resources/Papers/_pipeline/intake.log.md`, and the plan that asked
has its digest. Of 158 arXiv papers cited by gate runs before the move, 19
were in the store; the intake step closes that gap going forward. A one-off
sweep over the existing 30 run folders files the backlog.

Status: the definition of done is in the skill, next to §9c's intake step.
The backlog sweep ran on 2026-09-23 for full-text and partial reads. Every
note in the 35 run folders was read for the evidence class it states per
paper. That found 174 cited arXiv papers: 54 marked full-text or partial, 54
abstract-grounded, one unextractable, and 73 with no stated class. Of the
full-text and partial reads, 7 were already in the store or the intake log.
The other 47 are in `~/Downloads` with a line each in `intake.log.md`, waiting
for the weekly ingest. The 73 unstated papers are not filed. Deciding them
would mean judging from each note's quotes what was actually read.

### 3. Findings on second use

- Decide where the shared layer sits. Candidate: `Resources/Papers/findings/`,
  beside the paper notes the findings quote.
- Write the finding schema: identifier, quoted passage, the question it
  answered, the originating project.
- Record the promote-on-second-use rule in the vault's root `CLAUDE.md` and in
  the AI patterns override.

No bulk extraction from existing gate syntheses; findings are promoted as
reuse happens.

Status: done. The shared layer is `Resources/Papers/findings/`, created with
its first promoted finding. The schema and rule are in
`Resources/Papers/_pipeline/README.md` §Shared findings, with pointers in the
vault's root `CLAUDE.md` and the AI patterns override.

### 4. Takeaways out of the repo index

Hand-migrate, source by source: check that each overlay's "What the project
takes" section carries the repo line in
[`docs/research/references.md`](../../docs/research/references.md), merge
where it does not, then cut the repo entry to one line naming the source and
its overlay. Research-shaped entries (the three that point into `research/`)
keep a one-line pointer. Update the CLAUDE.md "Research inputs" line.

Status: done. Every overlay now has a "What the project takes" section. Five
overlays gained one, and the hyperlink overlay took the repo's wording on
`Prose` and on yielding the stage. The index is one line per source, plus
pointers to three research runs.

### 5. Link verification

A script resolving links in both directions: `PARA/...` paths in repo docs and
MDX comments exist in the vault; `story:` fields in vault `query.yml` files
exist in the repo. It skips with a notice when `$PARA` is unset, so cloud
sessions and CI stay green. Run by hand or from `npm run test`.

Status: `scripts/check-vault-links.mjs`, run as `npm run check:vault-links`.
Its first run fixed three stale `story:` fields and one archived vault path.
It still reports the planned output folders in
`2026-05-live-presentation-research.md` and `2026-08-property-mining.md`, which
don't exist until those gates run. For that reason it isn't part of
`npm run test` yet.
