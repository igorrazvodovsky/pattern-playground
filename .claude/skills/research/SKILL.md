---
name: research
description: Retrieve and synthesise HCI research relevant to a specific story or topic, with 1-hop citation lineage. Use when a pattern's design context reaches beyond the foundational references/ corpus — e.g. working on "dashboard", "notification timing", "onboarding". Produces a committed `research/<slug>/` folder: a persistent query.yml and dated synthesis notes that you can later promote into references/ and docs/references.md. This skill drafts; you curate.
argument-hint: "[story path, topic, or 'refresh <slug>']"
---

# Research

Retrieval + synthesis over open HCI literature, shaped to this project's voice. Inspired by ReFinE (Park et al., CHI 2026) — structured context → retrieval → clustering → compare-and-contrast — with two additions: *project-takeaway drafting* in the voice of `docs/references.md`, and *1-hop citation lineage* (the move Connected Papers is good at, which ReFinE lacks).

## Scope

`references/` is canon — foundational, hand-curated, takeaway-distilled. This skill does *not* write there. It writes to `research/<slug>/`, which is committed but explicitly a holding area. Promotion from `research/` into `references/` is a separate human act.

If a finding proves load-bearing, the user either:
1. Adds a one-line entry to `docs/references.md` pointing at the research note, or
2. Distils a new `references/*.md` canon file and indexes it.

The skill suggests promotion candidates but never performs promotion.

## Invocation shapes

- `/research <story-path>` — new run. Derive slug from story Meta title or path. Scaffold `query.yml` from story MDX.
- `/research <free-text topic>` — new run with no story. Derive slug from topic (kebab-case). Scaffold a minimal `query.yml` and ask the user to fill the gaps.
- `/research refresh <slug>` — re-run against the existing `query.yml`. Use when literature may have moved, or after editing the yml.

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
- On 429, do *not* retry-loop. Record the failure in the output note under *Retrieval provenance* and proceed arxiv-only. Skip the *Lineage* section (step 6) — it requires S2 — and suggest the user run `/research refresh <slug>` later.
- Never silently pretend S2 worked. The note must say which source produced which paper.

Venue filter (applied post-retrieval): keep HCI-adjacent (CHI, CSCW, UIST, DIS, TOCHI, IUI, C&C, TEI, NordiCHI, GROUP), or strong citation counts with obviously relevant titles, or arxiv preprints clearly intended for those venues. Drop results without substantive abstracts.

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

### 7. Draft project-takeaway lines

For each cluster (not each paper — clusters are the unit of synthesis), draft a one-sentence *Project takeaway* in the voice of `docs/references.md`. These are explicitly *drafts for human review*, not edits to the index. The voice:

- Names what the project *takes from* the finding, not what the finding says in general
- Situates against the project's existing commitments where relevant (without forcing the fit)
- Short; the index lines are ~1 sentence each

### 8. Write the output note

Path: `research/<slug>/<YYYY-MM-DD>.md`.

Structure:

```markdown
# Research: <topic> — <date>

Query: <one-line description>. Generated via `/research`.

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
*Draft project takeaway*: <one-line draft for possible promotion to docs/references.md>

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

## Promotion candidates
- [ ] <one-liner> → consider adding to docs/references.md
- [ ] <paper> → consider distilling to references/<slug>.md
```

(Replace the `\``` above with real triple backticks when writing the file.)

### 9. Report

Summarise to the user in the chat: slug, paper count, cluster count, strongest convergent claim, and any promotion candidates the user should look at first. Do not modify `docs/references.md` or `references/` in any case.

## Behaviour rules

- *Never promote silently*. `references/` and `docs/references.md` are off-limits to this skill. Only suggest.
- *Do not invent sources*. If retrieval returns nothing useful, say so. Offer to broaden the query.
- *Transfer honesty*. When a paper's context doesn't map to the project's, mark transfer weak. Weak-transfer papers with strong lineage can still be useful — as ancestors or as framing — but they should not be dressed up as directly applicable.
- *Abstract-only by default*. Retrieval produces abstracts + TLDRs, not full text. Implications grounded only in abstract text are provisional. Flag them; do not hallucinate what the paper "must" say beyond the abstract.
- *Retrieval-provenance honesty*. Always record which sources were hit and which produced results. A run that used only arxiv is useful but partial; the note must say so, and the user must be able to decide whether to `refresh` for lineage later.
- *No theory imposition*. The `query.yml` schema is deliberately neutral. Do not push the user toward Alexander/AT/DIRA vocabulary in the yml; the project's theoretical foundations are still settling (per user, 2026-04).
- *Expect the story to be partly wrong*. Good retrieval will occasionally contradict claims already in the story. Surface contradictions plainly in *Promotion candidates*; do not soft-pedal them. A run whose strongest finding is a correction to the source story has done its job.
- *Commit the output*. `research/` is committed. Failed runs are data — keep them.

## What this skill is not

- Not a canon editor — never writes to `references/` or `docs/references.md`.
- Not a replacement for deep reading — it orients, doesn't substitute.
- Not a full-text extractor — it works from abstracts + TLDRs. Full PDFs are the user's job to fetch and read when a result proves worth it.
- Not a classifier — once a finding is promoted, use `pattern-classifier` to decide how it integrates.
