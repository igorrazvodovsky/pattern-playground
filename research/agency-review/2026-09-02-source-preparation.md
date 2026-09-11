# Source preparation for the agency review, 2026-09-02

Generated via a scripted pass with hand-found urls, run in session. The script is
`prep_sources.py`, kept beside its output at
`$PAPERS_LIBRARY/_texts/agency-review/` together with `manual-urls.json` and the
review inputs it reads. Paper texts are copyrighted, so nothing from them is committed here; this
note records the method, what it produced, and what it could not reach.

> *Provenance*. Sources: the author's local papers library, OpenAlex (resolve plus single-work
> lookups, through the research-gate script's `oa_get`), Unpaywall, arxiv, the Internet Archive,
> NSF PAR, Crossref, and ten urls found by hand through web search. arxiv returned empty bodies
> for a stretch of the session, which is the rate limiting the research-gate skill warns about; a
> circuit breaker stops asking after two empty replies, and it matters little because OpenAlex
> lists arxiv pdf urls of its own. The research-gate ladder's Chrome rung was not available: the
> browser extension is not connected in this session, so publisher pages needing the author's
> cookies were not tried. Evidence classes follow the skill. Every full-text row was checked by
> eye against its reference in addition to the automated check; every abstract row was checked
> against the OpenAlex record it came from.

## Why this step exists

The 2026-09-01 source triage coupled two jobs, hunting for each source's text and reading it, so
every rerun repeated the hunt and the run died on the session limit with 5 of 87 done. This step
splits them. It leaves each of the 87 selected sources as one extracted text file plus one manifest
row, so the reading fan-out runs over local text and can be rerun cheaply.

## What it produced

87 of 87 rows: 65 full texts, 18 abstract-grounded, 4 with no text at all. Of the review's 26
framework sources, 19 are full texts.

By route: 48 open copies (the Internet Archive, institutional repositories, and hand-found urls),
10 from the local library, 7 from arxiv, 18 abstracts.

## Two corrections to what the plan records

*The local library holds 10 of the 87, not 45.* The ledger's "45 in the author's local papers
library by exact-title match" came from a Spotlight sweep that was matching almost at random. Of
its 41 strict hits, 23 pointed at the review's own PDF. The framework sources it named as being on
disk are not there: Holter, Rammert, Wu and Limerick were all reached from the network instead.

*Matching a paper by its title words is not safe.* Counting a reference's title words anywhere in a
candidate's opening accepted 24 wrong papers out of 35. A paper on the same topic uses the same
words, and a paper that cites the reference prints its title outright. What works is the title as a
run, in order, at the head of page one: a paper names itself before it names anything else. Short
titles need the byline as well, because three or four words match anything that opens the same way.
This matters beyond this run: a wrong match that reaches a reader produces confident, well-formed
nonsense, which is worse than an honest `cannot-tell`.

## Abstract only (18)

The paper exists behind a publisher the archive never crawled. A reader handed one of these answers
`cannot-tell` for anything the abstract does not state.

- [178] Collaborative diffusion: Boosting designerly co-creation with generative AI (2023), cited 14x
- [207] Beyond skin deep: Generative co-design for aesthetic prosthetics (2023), cited 13x
- [153] EmoG: supporting the sketching of emotional expressions for storyboarding (2020), cited 7x
- [21] Including adults with severe intellectual disabilities in co-design through ac (2021), cited 7x
- [3] Artificial intelligence as digital agency (2020), cited 7x, framework source
- [131] The sense of control and the sense of agency (2007), cited 5x, framework source
- [162] AI as social glue: uncovering the roles of deep generative AI during social mu (2021), cited 5x
- [138] Agency Aspirations: Understanding Users’ Preferences And Perceptions Of Their  (2024), cited 4x
- [93] When and How to Use AI in the Design Process? Implications for Human-AI Design (2024), cited 4x
- [104] In AI we trust? Effects of agency locus and transparency on uncertainty reduct (2021), cited 3x
- [185] Critical heritage studies as a lens to understand short video sharing of intan (2024), cited 3x
- [202] You complete me: Human-ai teams and complementary expertise (2022), cited 3x
- [28] The psychology of human-computer interaction (2018), cited 3x
- [35] Creator-friendly algorithms: Behaviors, challenges, and design opportunities i (2023), cited 3x
- [65] Exploring designers’ perceptions and practices of collaborating with generativ (2023), cited 3x
- [83] Attribution problem of generative AI: a view from US copyright law (2023), cited 3x
- [192] Cybernetics or Control and Communication in the Animal and the Machine (2019), cited 2x, framework source
- [155] Human-centered AI (2022), cited 1x, framework source

## No text at all (4)

Nothing reachable, and no abstract in either OpenAlex or Crossref. These are excluded from the
reading fan-out.

- [194] AI creativity and the human-AI co-creation model (2021), cited 14x, framework source
- [118] AI-Mediated Communication: Examining Agency, Ownership, Expertise, and Roles o (2022), cited 3x, framework source
- [56] Research on human–AI co-creation based on reflective design practice (2020), cited 3x
- [87] One AI does not fit all: A cluster analysis of the laypeople’s perception of A (2023), cited 2x, framework source

[194] is the one worth a manual look. It is the source of the review's six interaction stages, and
`collaboration.mdx` currently carries those stages verbatim. [118] is the Stanford thesis that the
consistency audit found the review's Appendix B misattributing its agency levels to, so its absence
leaves that particular crossed attribution unchecked from the source side.

Three of the four would come back with the Chrome rung or a copy the author holds: [118] is on
ProQuest, [87] has copies only on Academia and ResearchGate, and [194] and [56] are Springer
chapters.

## Rerunning

`python3 prep_sources.py --report` summarises the manifest without fetching. `--only <n,n>` with
`--force` redoes named sources. A rerun cannot lose ground: the evidence classes are ranked and a
stored row is kept unless the new one is strictly better, so a transient network failure cannot
turn a full text back into an unavailable row. Adding a url to `manual-urls.json` and rerunning the
named source is the cheapest way to close a gap.
