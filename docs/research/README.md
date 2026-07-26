## research/

Per-topic retrieval notes produced by the `/research-gate` skill. Committed but not canon.

- This folder is a holding area: drafts of design implications, retrieved from arxiv and Semantic Scholar and synthesised against a specific story's context.
- Structure: `research/<slug>/query.yml` (persistent query) + `research/<slug>/<YYYY-MM-DD>.md` (per-run synthesis). A practice-evidence run from a general web-research skill lands in the same folder under its own name and provenance block, beside the literature note.
- A run folder is a durable citation. When a finding gates a decision, the doc recording that decision cites the folder by hand — see the research-gate citations in `docs/language/relationship-vocabulary.md`. Failed runs stay too; the trail of what wasn't worth keeping is itself information.

See `.claude/skills/research-gate/SKILL.md` for the pipeline.
