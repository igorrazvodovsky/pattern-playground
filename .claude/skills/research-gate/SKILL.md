---
name: research-gate
description: Search HCI literature via arxiv and OpenAlex (plus named canon through publisher and author pages) for a specific story or topic, extract design implications with quoted grounding, and trace 1-hop citation lineage. Use when a design decision needs a literature check before it lands. Produces a committed `research/<slug>/` folder: a persistent query.yml and dated synthesis notes. The folder is the durable citation; docs that record the decision cite it as a research gate. Not for practice evidence — for what shipping products do, use a general web-research skill.
argument-hint: "[story path, topic, or 'refresh <slug>']"
---

# Research gate

Retrieval + synthesis over open HCI literature, shaped to this project's voice. Inspired by ReFinE (Park et al., CHI 2026) — structured context → retrieval → clustering → compare-and-contrast — with one addition: *1-hop citation lineage* (the move Connected Papers is good at, which ReFinE lacks). Lineage runs on OpenAlex, which needs no key.

## Scope

This skill covers *peer-reviewed literature only* — arxiv, OpenAlex, and named canon reachable through publisher and author pages. It is not the instrument for practice evidence. When the question is what shipping products actually do, run a general web-research skill instead; its output belongs in the same `research/<slug>/` folder as a `-practice.md` sibling with its own provenance block, beside the literature note rather than folded into it.

`references/` is canon — foundational, hand-curated, takeaway-distilled. This skill does *not* write there, and does not write to any index.

The run folder is the durable artifact. When a finding gates a decision, the doc recording that decision cites the folder or the dated note directly — `docs/language/relationship-vocabulary.md` is the worked example, citing `research/pattern-foundation-serves/` and `research/situation-constructs/2026-07-10.md` inline at the point of decision. Writing that citation is a human act, and the only promotion path this project uses. Distilling a run into a new `references/*.md` canon file remains possible but is rare; do not plan for it.

Other pipelines (deep-research workflows, quarry reads of a named source) may write into a slug folder under their own filenames. Every note in `research/` names its generator on the first line ("Generated via …") and carries its own provenance block, so a reader knows which evidence contract applies.

## Invocation shapes

- `/research-gate <story-path>` — new run. Derive slug from story Meta title or path. Scaffold `query.yml` from story MDX.
- `/research-gate <free-text topic>` — new run with no story. Derive slug from topic (kebab-case).
- `/research-gate refresh <slug>` — revisit an existing folder. Not a full re-run; see *Refresh modes* below.

## Two retrieval branches

Decide per question, up front, which branch answers it:

- *API retrieval* (step 3) works when the literature is arxiv-era — roughly post-2010 HCI/ML, or anything OpenAlex indexes with abstracts.
- *Named-canon reads* (step 4) work when the literature is venue-locked: pre-arxiv CSCW/HCI (the Suchman–Winograd workflow debate, Schmidt, Dourish, Star), PLoP/EuroPLoP, BPM/IS venues, print-era classics, design-system grey literature.

Either way, the local library sweep (step 2) runs first — papers already on disk skip both branches.

The branches are co-equal, and most runs mix them. Across the first ten weeks of runs, the named-canon branch produced most of the decisive evidence; treat API retrieval as the sweep and canon reads as the spine whenever the questions point at older or ACM-only work.

## Pipeline

### 1. Scaffold or load `query.yml`

Path: `research/<slug>/query.yml`. If it exists, load it. If not, create it.

Schema (neutral on purpose — no theoretical axes baked in yet):

```yaml
story: <relative path or null>
topic: <short phrase>
interaction: |
  <one or two lines: who does what, what the system does>
context: |
  <setting, surface, constraints>
questions:
  - <uncertainty 1>
  - <uncertainty 2>
keywords: [<optional extra query terms>]
```

When scaffolding from a story, pre-fill `topic`, `interaction`, and `context` from the MDX description and Meta title. `questions` is the field that steers everything downstream, so it needs the user's judgment. Three modes:

- *Questions settled in conversation before invocation* — the user framed or approved them in this session. Proceed; no pause.
- *Cold scaffold, user present* — present the draft yml and pause for the user to edit `questions` before continuing.
- *Autonomous run* (goal loop, nobody to ask) — proceed with drafted questions, and record in the note's provenance that the questions were not user-reviewed.

Never attribute self-drafted questions to the user.

### 2. Sweep the local library

The user keeps ~1,200 papers locally, with paired reading notes, at the folder named by the `PAPERS_LIBRARY` env var (`pdfs/` and `notes/` inside it). Many filenames are opaque ids, so search content, not names. Spotlight indexes the folder, PDF text included:

```bash
mdfind -onlyin "$PAPERS_LIBRARY" "<topic term>"
grep -ril "<topic term>" "$PAPERS_LIBRARY/notes"
```

Run 2–4 salient terms from `topic` and `questions`. Anything found arrives as a *full-text read* without touching the access ladder; record "local library" as its access route in provenance. Later, when a named paper resists access (step 4's ladder), check here again by author or title before listing it as unreachable.

If `PAPERS_LIBRARY` is unset or the folder is missing, skip the sweep, say so in provenance, and — in interactive runs — ask the user where the library lives now so the variable can be fixed.

### 3. API retrieval

Use the bundled script — pacing, backoff, and the retry budget live in it, so runs don't improvise them. Both subcommands emit JSON with a `status` field and per-query failures.

```bash
python3 .claude/skills/research-gate/scripts/retrieve.py arxiv "<q1>" "<q2>" ...
python3 .claude/skills/research-gate/scripts/retrieve.py openalex-search "<q1>" "<q2>" ...
```

Run 3–6 variant queries per source, driven by `topic` + salient nouns from different `questions`. The script dedupes across queries and applies the arxiv category filter (`cs.HC,cs.AI,cs.CY,cs.LG,cs.CL` by default; widen with `--categories` when the questions live in SE/DB/PL territory, and record the widening as a deliberate deviation in the note). OpenAlex covers ACM-only work arxiv misses and returns abstracts for most of it. When keyword collisions drown a query (generic terms like "sequence" or "links" pulling in other fields), tighten at retrieval time instead of pruning by hand: `--hci` restricts to the HCI subfield, `--from-date` bounds recency, `--filter` passes any raw OpenAlex clause (e.g. `type:article`).

Failure behaviour — both sources rate-limit, arxiv included (its "reliable, no rate limit" reputation was falsified 2026-08-28):

- The script already does one paced retry per request. If a source's `status` comes back `down`, it is down for the session: record it under *Retrieval provenance* and pivot to the other source or to step 4. Do not hand-roll retry loops on top — one such loop cost eight minutes for zero papers.
- If the query list is long, run the script in the background and do other work (scaffolding, canon naming) while it runs.

Semantic Scholar is optional and key-gated: only query it when `S2_API_KEY` is set (`-H "x-api-key: $S2_API_KEY"`, ~1 req/sec). Unauthenticated S2 returned 429 in essentially every run from June to August 2026; do not attempt it without the key.

Venue filter (applied post-retrieval, by judgment): keep HCI-adjacent (CHI, CSCW, UIST, DIS, TOCHI, IUI, C&C, TEI, NordiCHI, GROUP), or strong citation counts with obviously relevant titles, or arxiv preprints clearly intended for those venues. Drop results without substantive abstracts.

### 4. Named-canon reads

A `questions` entry that draws *zero usable candidates* is a retrieval-shape signal before it is a no-literature signal — ask which venue the answer would live in before concluding the gap is conceptual.

Method:

- *Name the papers first.* Canonical works are nameable from the debate's shape; don't keyword-fish for them.
- *Ground each named paper via WebSearch* (publisher page, university repository, author site) — confirm venue, year, and abstract before citing. Do not cite from memory alone.
- *Fetch and read full texts where they exist.* A full read of one well-chosen paper that *contains* the others' accounts (a review, a response, a paper built on the earlier fieldwork) is the highest-leverage move.
- *Sweep the whole primary source.* When the gate has a named primary source (a book, a corpus, chapters a plan cites), run a topic-term density map across the entire source (`grep -c` per file or chapter) before choosing what to read. Reading only the chapter the plan cites has missed the densest chapter before.

Getting at the text — the access ladder, cheapest first:

1. *Open copies*: author sites, university repositories, NSF PAR (`par.nsf.gov` — the standard workaround for ACM DL 403s), arxiv versions of published papers.
2. *Unpaywall* to locate an open copy by DOI: `curl -s "https://api.unpaywall.org/v2/<doi>?email=$UNPAYWALL_EMAIL"` → `best_oa_location`.
3. *PDFs*: never WebFetch a `.pdf` URL — it can't parse them. `curl` to the scratchpad and run `pdftotext`; if WebFetch already cached the bytes, Read the `tool-results/webfetch-*.pdf` file with page ranges. Check downloads with `file` first — "PDFs" are sometimes HTML in disguise, and some author-site scans are unextractable images.
4. *Chrome* (claude-in-chrome tools, interactive runs only): when a page 403s or bot-checks the fetch path — dl.acm.org, ScienceDirect, Taylor & Francis, OpenReview — try it in the user's browser, which carries their cookies and passes the checks fetch fails. Read-only: navigate and `get_page_text`; never log in to anything on the run's behalf. Chrome is also the only route to Google Scholar — use it sparingly, for grounding a named paper or checking citation counts, not for bulk retrieval.
5. *The user's library, again.* Step 2 swept it by topic; now search it by the specific author or title (`mdfind -onlyin "$PAPERS_LIBRARY" "<author or title>"`) — twice a paywalled PDF a run gave up on was sitting in that folder. Only after that, list the paper as located-but-unextractable and, before closing the run, ask whether the user holds a copy elsewhere. In autonomous runs, put the list in the report instead.

Evidence classes — every cited source carries exactly one:

- *full-text read* — fetched and read; implications may quote body text.
- *partial read* — state the page range and what the unread part contains ("the awareness-elements tables sit in the unread back half, so the element list stops at what the read pages state").
- *abstract-grounded* — venue, year, and abstract confirmed via publisher/author page or API; implications quote only the abstract.
- *located-but-unextractable* — found but not readable; cited without quotes, flagged as such.

Output shape: fold canon reads into the day's note as their own section (or an *Addendum* with its own provenance block and continued cluster numbering, when they happen after the main pass). A canon read in a later session gets a new dated note in the same folder. Either way the retrieval run and the canon read stay distinguishable.

### 5. Rerank against structured context

Take the candidates, read abstracts, and rerank against the `query.yml` — specifically the `questions` field, which should drive relevance more than `topic`. A paper that directly engages one of the questions outranks a paper that merely shares vocabulary.

Keep the top ~8. Note for each: why it was kept, which question(s) it speaks to.

### 6. Extract implications (per paper)

For each kept paper, extract 1–4 design implications. For each implication record:

- *text*: the implication itself, one sentence
- *source*: a quoted span that grounds it (not paraphrased) — from the body for full-text reads, from the abstract otherwise
- *rationale*: why the paper's authors argue this
- *transfer note*: how the source context maps (or doesn't) to the `query.yml` context — the ReFinE compare-and-contrast move. Be honest when transfer is weak.

If the available text is too thin to extract grounded implications, say so — do not hallucinate. Flag the paper's evidence class and move on. Full-text reads are routine, not exceptional, and they are where the strongest corrections have come from; upgrade a paper from abstract-grounded to full-text whenever it turns out to anchor a cluster.

### 7. Cluster across papers

Group implications by convergence. When three sources converge on the same design move, that convergence is the real editorial signal — stronger than any single paper. Each cluster gets:

- A one-line *convergent claim*
- The source papers
- A short note on where they disagree (if they do — disagreement is also signal)

Single-paper "clusters" are fine; don't force merging.

### 8. 1-hop lineage (OpenAlex)

```bash
python3 .claude/skills/research-gate/scripts/retrieve.py openalex-lineage <id> <id> ...
```

IDs may be OpenAlex W-ids, DOIs, or arxiv ids — the script resolves them. Feed it the kept papers (needs ≥2). It returns:

- *Convergent ancestors*: works referenced by ≥2 of the kept papers. Candidates for canon — read them.
- *Influential descendants*: highly-cited works citing ≥2 of the kept papers (approximate — computed from each paper's top citing works). Where did this line of work go?

Render as a Mermaid graph when it is small enough to read; past a dozen nodes, the two lists carry the section on their own.

If OpenAlex is down too, don't leave a bare placeholder — write the *named expected ancestors*: the works a refresh should confirm, named from the papers' own bibliographies and the debate's shape. Lineage assembled by inspection from full-text bibliographies also counts, marked as such. And sometimes the lineage finding is negative — two literatures that never cite each other is itself a result.

### 9. Write the output note

Path: `research/<slug>/<YYYY-MM-DD>.md`. One pass, one dated file — a second pass on a later date is a new file, never appended to the old one.

Structure:

```markdown
# Research: <topic> — <date>

Query: <one-line description>. Generated via `/research-gate`.

> *Retrieval provenance*. Which sources were hit and which worked; which papers
> were full-text reads, partial (page range), abstract-grounded, or resisted
> access; any deliberate deviations from skill defaults (widened categories,
> inverted branch order), named as such; whether the questions were
> user-reviewed. Be explicit — future rereads depend on knowing whether a gap
> is conceptual or infrastructural.

## Context
<reproduce the query.yml context + questions, so the note is self-contained>

## Canon reads
<when step 4 carried the run, this section leads; same per-paper shape as below>

## Retrieved papers
- *<title>* (<venue> <year>) — <one line>. [<doi/arxiv/openalex link>] — <evidence class>
  - Speaks to: <which question(s)>
  - Transfer: <strong|partial|weak> — <note>

## Convergent findings
### <cluster claim>
<short synthesis, quoted spans inline>
Papers: <titles>

## Lineage
### Convergent ancestors (cited by ≥2)
- <title> (<year>) — cited by <which>
### Influential descendants (citing ≥2, high citation count)
- <title> (<year>) — cites <which>

## What this challenges
<claims in the source story, plan, or existing docs that the literature
contradicts — quote the exact clause being corrected. Omit the section only
when there is genuinely nothing; do not pad it.>

## Do not carry forward
<claims, figures, or sources the run examined and killed — an uncited
statistic, a misattributed taxonomy, a "finding" that dissolved on tracing.
Recorded so later runs don't re-derive them. Omit when empty.>
```

Section-name discipline: *What this challenges* is always that heading — surrogates ("what I would be wrong about", refutation registries under other names) made the highest-value section unfindable across the corpus. Transfer ratings are always the `Transfer:` bullet, not a table column or prose.

Companion notes in the same folder, each with its own generator line and provenance block:

- `<date>-practice.md` — the practice survey (a general web-research pass, often delegated; see Delegation).
- `<date>-canon.md` — a verbatim-quote canon grounding pass, when it is big enough to deserve its own file.
- `<date>-<source>.md` — a close read of one named source (a book, a quarry, a bibliography).

After the note lands, append a status block to `query.yml` recording which questions the run answered and which stay open:

```yaml
# --- Status after the <date> run
# answered: <question numbers / short tags>
# open: <what remains, and what would answer it>
```

### 10. Report

Summarise to the user in the chat: slug, paper count, cluster count, strongest convergent claim, anything under *What this challenges* — and the list of located-but-unextractable papers, with the question of whether the user holds copies. Suggest `refresh` only if lineage was actually omitted.

## Refresh modes

`refresh <slug>` is not a full re-run. Start by reading the folder's latest note and the `query.yml` status block, then pick the mode — or let the user name it:

- *Has the literature moved?* The diff, and the cheapest mode: run `openalex-lineage --citing-since <note date>` on the note's kept papers, and `openalex-search --from-date <note date>` on the original queries. If nothing material surfaced, the whole result is one line appended to the query.yml status block; a new dated note only when something changes a finding.
- *Questions changed.* The situation shifted or a decision sharpened: edit `questions` in query.yml, then run the pipeline for the new or rewritten questions only. New dated note; earlier answers stand unless contradicted.
- *Missing thread.* A literature, debate, or author line the original run never saw — usually spotted while writing or from later reading. Run a targeted pass for that thread (often the step-4 branch); new dated note naming what was missed and why the original retrieval shape missed it.
- *Lineage backfill.* An older note whose lineage was omitted: run step 8 on its kept papers and write `<date>-lineage.md`, adding a one-line pointer under the old note's placeholder.

All modes share the rules: never rewrite an old note beyond a pointer line, every pass is a new dated file, and the query.yml status block records what the refresh answered or reopened.

## Delegation

The gate parallelises well; the pattern that has kept wall-clock near ten minutes even with APIs down:

- *Practice survey as a subagent*, run alongside the literature pass. Hand it the most recent `-practice.md` in `research/` as the exemplar for shape and provenance discipline.
- *Canon reads or a named-source quarry as a second subagent* when the main thread is synthesising.
- *Retrieval script in the background* while the main thread names canon.

The main thread keeps synthesis, clustering, and the note itself — the judgment work stays in one place.

## Behaviour rules

- *Write only to the run folder.* `references/` and everything in `docs/` are off-limits. The citation that connects a run to a decision is written by hand, in the doc that records the decision. One bounded exception: when the gate runs inside plan work the user asked for, folding findings back into that plan is part of the job — but the note is finished first, and the plan edit is narrated as plan work, not as part of the gate.
- *No hand-rolled retry loops, for any source.* The script's one-retry budget is the policy. A source that fails twice is down for the session; record it and pivot.
- *Do not invent sources.* If retrieval returns nothing useful, say so. Offer to broaden the query.
- *A zero-result question is a method signal.* Before recording a gap as conceptual, check whether the literature is venue-locked and run the step-4 branch for that question instead of concluding from absence.
- *Transfer honesty.* When a paper's context doesn't map to the project's, mark transfer weak. Weak-transfer papers with strong lineage can still be useful — as ancestors or as framing — but they should not be dressed up as directly applicable.
- *Evidence-class honesty.* Every source carries its class; implications quote only what was actually read. Do not hallucinate what a paper "must" say beyond the text in hand.
- *Retrieval-provenance honesty.* Always record which sources were hit, which produced results, and every deliberate deviation from skill defaults. A partial run is useful; an unlabelled partial run misleads the rereader.
- *No theory imposition.* The `query.yml` schema is deliberately neutral. Do not push the user toward Alexander/AT/DIRA vocabulary in the yml; the project's theoretical foundations are still settling (per user, 2026-04).
- *Expect the story to be partly wrong.* Good retrieval will occasionally contradict claims already in the story or plan. Surface contradictions plainly under *What this challenges*, quoting the clause being corrected; do not soft-pedal them. A run whose strongest finding is a correction to the source has done its job.
- *Commit the output.* `research/` is committed. Failed runs are data — keep them.

## Setup (optional, once)

Machine-specific values live in `.claude/settings.local.json` under `env` (git-ignored; every session's Bash calls see them):

- `PAPERS_LIBRARY` — absolute path to the local paper library (a folder with `pdfs/` and `notes/` inside). Set on this machine; update it here if the library moves.

The rest are optional — OpenAlex works unauthenticated — but each removes friction:

- `OPENALEX_MAILTO` — any contact address; joins OpenAlex's polite pool (faster, more reliable).
- `UNPAYWALL_EMAIL` — required by the Unpaywall API; any address works.
- `S2_API_KEY` — free on request from Semantic Scholar; re-enables S2 as a supplementary source.

## What this skill is not

- Not a canon editor — never writes to `references/` or to any doc outside the run folder.
- Not a practice survey — it reads papers, not products. The `-practice.md` sibling comes from a general web-research pass; keep the two notes separate in the folder.
- Not the deep-research workflow — heavier adversarially-verified runs may share a slug folder, under their own generator line and evidence contract.
- Not a classifier — once a finding is in hand, use `pattern-classifier` to decide how it integrates.
