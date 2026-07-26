---
name: research-gate
description: Search HCI literature on arxiv, Google Scholar, and Semantic Scholar for a specific story or topic, extract design implications with quoted grounding, and trace 1-hop citation lineage. Use when a design decision needs a literature check before it lands — e.g. working on "dashboard", "notification timing", "onboarding". Produces a committed `research/<slug>/` folder: a persistent query.yml and dated synthesis notes. The folder is the durable citation; docs that record the decision cite it as a research gate. Not for practice evidence — for what shipping products do, use a general web-research skill.
argument-hint: "[story path, topic, or 'refresh <slug>']"
---

# Research gate

Retrieval + synthesis over open HCI literature, shaped to this project's voice. Inspired by ReFinE (Park et al., CHI 2026) — structured context → retrieval → clustering → compare-and-contrast — with one addition: *1-hop citation lineage* (the move Connected Papers is good at, which ReFinE lacks).

## Scope

This skill covers *peer-reviewed literature only* — arxiv, Semantic Scholar, and named canon reachable through publisher and author pages. It is not the instrument for practice evidence. When the question is what shipping products actually do, run a general web-research skill instead; its output belongs in the same `research/<slug>/` folder under its own filename and provenance block, beside the literature note rather than folded into it.

`references/` is canon — foundational, hand-curated, takeaway-distilled. This skill does *not* write there, and does not write to any index.

The run folder is the durable artifact. When a finding gates a decision, the doc recording that decision cites the folder or the dated note directly — `docs/language/relationship-vocabulary.md` is the worked example, citing `research/pattern-foundation-serves/` and `research/situation-constructs/2026-07-10.md` inline at the point of decision. Writing that citation is a human act, and the only promotion path this project uses. Distilling a run into a new `references/*.md` canon file remains possible but is rare; do not plan for it.

## Invocation shapes

- `/research-gate <story-path>` — new run. Derive slug from story Meta title or path. Scaffold `query.yml` from story MDX.
- `/research-gate <free-text topic>` — new run with no story. Derive slug from topic (kebab-case). Scaffold a minimal `query.yml` and ask the user to fill the gaps.
- `/research-gate refresh <slug>` — re-run against the existing `query.yml`. Use when literature may have moved, or after editing the yml.

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

When scaffolding from a story, pre-fill `topic`, `interaction`, and `context` from the MDX description and Meta title. Leave `questions` for the user — uncertainty is the most load-bearing field and should not be guessed. Present the draft yml and pause for the user to edit before continuing.

### 2. Retrieve

Use *both* Semantic Scholar and arxiv. They fail independently and cover the space unevenly.

*arxiv* (primary — reliable, no rate limit, broad HCI+ML preprint coverage):

```bash
curl -sL "https://export.arxiv.org/api/query?search_query=<encoded>&max_results=25&sortBy=relevance"
```

Run 3–5 variant queries driven by `topic` + salient nouns from different `questions`. Dedupe by arxiv id. Filter to `cs.HC`, `cs.AI`, `cs.CY`, `cs.LG`, `cs.CL` categories. Atom XML; parse with Python's `xml.etree`.

*Semantic Scholar Graph API* (secondary — catches purely-ACM work arxiv misses, and is the only lineage source):

```bash
curl -sLG "https://api.semanticscholar.org/graph/v1/paper/search" \
  --data-urlencode "query=<query>" \
  --data-urlencode "limit=25" \
  --data-urlencode "fields=title,abstract,year,venue,authors,tldr,externalIds,citationCount,referenceCount,paperId"
```

S2's unauthenticated shared bucket is heavily rate-limited and regularly returns 429 for extended periods (observed 2026-04-14). Behaviour:

- If the `S2_API_KEY` env var is set, include `-H "x-api-key: $S2_API_KEY"`. Pace at ~1 req/sec regardless.
- On 429, do *not* retry-loop. Record the failure in the output note under *Retrieval provenance* and proceed arxiv-only. Skip the *Lineage* section (step 6) — it requires S2 — and suggest the user run `/research-gate refresh <slug>` later.
- Never silently pretend S2 worked. The note must say which source produced which paper.

Venue filter (applied post-retrieval): keep HCI-adjacent (CHI, CSCW, UIST, DIS, TOCHI, IUI, C&C, TEI, NordiCHI, GROUP), or strong citation counts with obviously relevant titles, or arxiv preprints clearly intended for those venues. Drop results without substantive abstracts.

### 2b. Targeted canon reads (when retrieval structurally misses)

Some literatures never reach arxiv: pre-2000s CSCW/HCI (the Suchman–Winograd workflow debate, Schmidt, Dourish, Star), BPM/IS venues, print-era classics. A `questions` entry that draws *zero usable candidates* is a retrieval-shape signal before it is a no-literature signal — ask which venue the answer would live in before concluding the gap is conceptual.

When a question points at venue-locked canon, switch method for that question:

- *Name the papers first.* Canonical works are nameable from the debate's shape; don't keyword-fish for them.
- *Ground each named paper via WebSearch* (publisher page, university repository, author site) — confirm venue, year, and abstract before citing. Do not cite from memory alone.
- *Fetch open PDFs where they exist* (author sites are the usual source — e.g. dourish.com) and read them directly; a full read of one well-chosen paper that *contains* the others' accounts (a review, a response, a paper built on the earlier fieldwork) is the highest-leverage move.
- *Record with distinct provenance*: direct reads are a different evidence class from API retrieval. Say which papers were full-text reads, which abstract-grounded, and which resisted access (a located-but-unextractable PDF gets cited without quotes, flagged as such).
- *Same extraction discipline*: implications with quoted spans where full text was read; abstract-only flags where it wasn't.

Output shape: either fold the canon read into the day's note as an *Addendum* section with its own provenance block and continued cluster numbering, or — if it happens in a later session — a new dated note in the same slug folder. Both keep the retrieval run and the canon read distinguishable.

### 3. Rerank against structured context

Take the ~25 candidates, read abstracts + TLDRs, and rerank against the `query.yml` — specifically the `questions` field, which should drive relevance more than `topic`. A paper that directly engages one of the questions outranks a paper that merely shares vocabulary.

Keep the top 8. Note for each: why it was kept, which question(s) it speaks to.

### 4. Extract implications (per paper)

For each of the 8, extract 1–4 design implications. For each implication record:

- *text*: the implication itself, one sentence
- *source*: a quoted span from the abstract/TLDR that grounds it (not paraphrased)
- *rationale*: why the paper's authors argue this
- *transfer note*: how the source context maps (or doesn't) to the `query.yml` context — the ReFinE compare-and-contrast move. This is where analogical reasoning happens. Be honest when transfer is weak.

If the abstract is too thin to extract grounded implications, say so — do not hallucinate. Flag the paper as "abstract-only, full text needed" and move on.

### 5. Cluster across papers

Group implications by convergence. When three abstracts converge on the same design move, that convergence is the real editorial signal — stronger than any single paper. Each cluster gets:

- A one-line *convergent claim*
- The source papers
- A short note on where they disagree (if they do — disagreement is also signal)

Single-paper "clusters" are fine; don't force merging.

### 6. 1-hop lineage (S2-only)

Requires Semantic Scholar. If step 2 fell back to arxiv-only, *skip this step* — write a placeholder in the output note explaining that lineage awaits a refresh with S2 access.

For each of the 8 retrieved papers, fetch references + citations (paceable — one call per paper, ~1/sec):

```bash
curl -sL "https://api.semanticscholar.org/graph/v1/paper/arXiv:<arxivId>?fields=references.title,references.year,references.paperId,references.citationCount,citations.title,citations.year,citations.paperId,citations.citationCount"
```

(S2 accepts `arXiv:<id>` prefix when arxiv is the identifier in hand, avoiding a separate lookup round-trip.)

Build a small lineage view:

- *Convergent ancestors*: papers that appear as references for ≥2 of the retrieved 8. These are candidates for canon — read them.
- *Influential descendants*: highly-cited papers that cite ≥2 of the retrieved 8. Where did this line of work go?
- Render as a Mermaid graph in the output note.

Keep to 1 hop. More gets noisy fast; revisit only if results warrant.

### 7. Write the output note

Path: `research/<slug>/<YYYY-MM-DD>.md`.

Structure:

```markdown
# Research: <topic> — <date>

Query: <one-line description>. Generated via `/research-gate`.

> *Retrieval provenance*. Which sources were hit and which worked. E.g. "arxiv primary, 72 unique candidates across 5 queries; Semantic Scholar rate-limited throughout, lineage omitted." Be explicit — future rereads depend on knowing whether the gap is conceptual or infrastructural.

## Context
<reproduce the query.yml context + questions, so the note is self-contained>

## Retrieved papers
- *<title>* (<venue> <year>) — <tldr>. [<doi/arxiv/s2 link>]
  - Speaks to: <which question(s)>
  - Transfer: <strong|partial|weak> — <note>
<... ×8>

## Convergent findings
### <cluster claim>
<short synthesis>
Papers: <titles>

<... per cluster>

## Lineage
### Convergent ancestors (cited by ≥2)
- <title> (<year>) — cited by <which>
### Influential descendants (citing ≥2, high citation count)
- <title> (<year>) — cites <which>

```mermaid
graph LR
  <retrieved paper nodes> --> <ancestor nodes>
  <retrieved paper nodes> --> <descendant nodes>
\```

## What this challenges
<claims in the source story or in existing docs that the literature contradicts, stated plainly. Omit the section if there are none — do not pad it.>
```

(Replace the `\``` above with real triple backticks when writing the file.)

### 8. Report

Summarise to the user in the chat: slug, paper count, cluster count, strongest convergent claim, and anything under *What this challenges*. Do not modify `references/` or any docs outside `research/<slug>/`.

## Behaviour rules

- *Write only to the run folder*. `references/` and everything in `docs/` are off-limits. The citation that connects a run to a decision is written by hand, in the doc that records the decision.
- *Do not invent sources*. If retrieval returns nothing useful, say so. Offer to broaden the query.
- *A zero-result question is a method signal*. Before recording a gap as conceptual, check whether the literature is venue-locked (pre-arxiv CSCW, BPM/IS, print-era HCI) and run a step-2b canon read for that question instead of concluding from absence.
- *Transfer honesty*. When a paper's context doesn't map to the project's, mark transfer weak. Weak-transfer papers with strong lineage can still be useful — as ancestors or as framing — but they should not be dressed up as directly applicable.
- *Abstract-only by default*. Retrieval produces abstracts + TLDRs, not full text. Implications grounded only in abstract text are provisional. Flag them; do not hallucinate what the paper "must" say beyond the abstract.
- *Retrieval-provenance honesty*. Always record which sources were hit and which produced results. A run that used only arxiv is useful but partial; the note must say so, and the user must be able to decide whether to `refresh` for lineage later.
- *No theory imposition*. The `query.yml` schema is deliberately neutral. Do not push the user toward Alexander/AT/DIRA vocabulary in the yml; the project's theoretical foundations are still settling (per user, 2026-04).
- *Expect the story to be partly wrong*. Good retrieval will occasionally contradict claims already in the story. Surface contradictions plainly under *What this challenges*; do not soft-pedal them. A run whose strongest finding is a correction to the source story has done its job.
- *Commit the output*. `research/` is committed. Failed runs are data — keep them.

## What this skill is not

- Not a canon editor — never writes to `references/` or to any doc outside the run folder.
- Not a practice survey — it reads papers, not products. Pair it with a general web-research skill when the decision needs both; keep the two notes separate in the folder.
- Not a classifier — once a finding is in hand, use `pattern-classifier` to decide how it integrates.
