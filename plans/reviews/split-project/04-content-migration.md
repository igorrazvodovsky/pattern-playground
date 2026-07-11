# Episode 04: Content migration & flattening — walkthrough

*Scope.* Merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c` (verified) … `split-project`, restricted to `apps/patterns/src/content` and `src/stories`: the move sweep, the flatten, link rewrites, placeholders, frontmatter normalisation, and the link-validation gate. Relationship-edge *vocabulary* and the reading surface belong to other episodes; migration fidelity of relationships in transit belongs here. Sampled entries, compared endpoint against `git show ef66e6a:src/stories/…`: *undo* (operation pattern), *searching* (action pattern), *deletion* (action pattern with demos), *user-repair* (conversational primitive), *temporality* and *density* (qualities), *collaboration-foundation* (foundation), *actions.md* (collection), plus *information-architecture*, *suggestion*, and the *validation* stub as cross-checks.

At the merge-base the entire corpus — 375 files — lived in `src/stories/` as Storybook MDX, organised as an Activity Theory folder tree, with identity spread across `Meta title`, tags, and path. At the endpoint 119 entries live flat under `apps/patterns/src/content/patterns/`, each a frontmatter-plus-prose file whose filename stem is simultaneously slug, route, graph node ID, and link target. In between: a long sweep of per-cluster moves, a relationship-to-frontmatter migration with a visible repair tail, an addressing rewrite of ~1083 links, h1/fun-meter normalisation, and a build-time validator over all three link seams.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | Content leaves Storybook | reframe |
| 2 | Flattening: the stem becomes the identity | accept |
| 3 | Migration by batch, repair by hand | fix (scoped out) |
| 4 | One address per entry; cross-surface pointers become elements | fix (author) |
| 5 | Validation as a standing gate | fix (author + cleanup) |
| 6 | Page chrome into frontmatter; the fun meter goes dark | accept |

## Move 1: Content leaves Storybook

*The move.* Pattern, quality, foundation, and collection MDX moved from `src/stories/` into `apps/patterns/src/content/patterns/`, converting Storybook idioms in transit: `Meta title` and tag arrays became frontmatter fields, `<Story of={…}>` embeds became `@pkg/demos` imports (e.g. `deletion.mdx`), and Storybook query-URLs became site routes. Entries judged to be mechanisms stayed behind (Dialog, Drawer, Toolbar, Nav bar), and collection pages now interleave `<ComponentRef>` items among pattern links (`actions.md` Coordination section).

*Answers to.* The content territories of `plans/completed/2026-05-workspace-split.md`; `docs/project/core-beliefs.md` — "the pattern content in `apps/patterns/src/content/patterns/` is the product… Storybook documents the component substrate"; the bilingual-substrate direction in `docs/project/vision.md`.

*Backtalk.* The move doubled as a forced role audit: every page had to declare a `role`, and the sorting kept spilling past the sweep itself — `Split Combobox`, `Split Form`, `Redefine umbrellas`, and the later T6 demotions all follow from having to decide, file by file, whether a page carried a move or a mechanism (`docs/language/pattern-definition.md`'s decomposition test applied at migration scale). Collections now show the seam line-by-line: in `actions.md`, "Dialog" is a ComponentRef while its neighbour "Wizard" is a pattern link — the two-language claim of `pattern-and-form.md` made legible, and also made fragile, since every list item is an individual role verdict. Some entries were reframed in transit (origin "Needs-based view" became "Dashboard — needs-based views that frame a collection").

*Question.* A collection page now renders pattern links and ComponentRefs as visually parallel list items — same bullet, same position, different language. Is that flatness the intended reading of the bilingual claim, or should a collection mark which of its members are moves and which are borrowed mechanisms?

*Verdict:* reframe — the flatness is not intended. The local rule would be the general one (components are excluded from activity-theory-based collections), but the author questions the collection pages themselves: they are handwritten, lag the current state of the corpus, and may be dropped entirely — the Astro site can project groupings from classification facets, so the eventual navigation surface may not be a curated overview page at all. Resolved later in the same sitting: the author deleted the four AT collection pages (see move 5's verdict for the cleanup). The mixed-list question is moot for AT collections; `data-visualization.mdx` remains as the one domain-collection home.

## Move 2: Flattening: the stem becomes the identity

*The move.* The nested AT tree inside the content directory was flattened: every entry directly under `content/patterns/`, `generateId` in `content.config.ts` making the stem authoritative, classification moved to independent frontmatter facets (`activityLevel`, `lifecycle`, `group`, `domain`), navigation rebuilt as a projection over facets, and the two stem collisions resolved by suffixing the non-pattern side (`conversation-quality`, `collaboration-foundation`).

*Answers to.* `plans/completed/2026-06-flatten-pattern-content.md`; `docs/specs/pattern-site.md` §File layout and §Classification facets; `docs/project/core-beliefs.md` — "Multiple projections, no single tree… every classification tree is lossy."

*Backtalk.* Two things surfaced. First, unifying identity on the stem healed a latent title-vs-filename ID mismatch and *gained* 106 edges and 2 nodes (the plan's verification section) — the old path-fused identity had been silently under-connecting the graph, which is strong evidence for the flatten from the project's own "relational over static" commitment. Second, the folders turned out not to be cleanly liftable: the `lifecycle` facet could not simply mirror the action subfolders (a human classification call the plan deferred), so the subfolder grouping was captured verbatim into `group`, which the spec explicitly says "makes no semantic claim". The flatten thus produced one genuinely semantic facet set plus one confessed non-facet whose only job is to reproduce yesterday's sidebar.

*Question.* `group` preserves the old tree inside the frontmatter of a system whose stated position is that trees are lossy projections. Is `group` a transitional scaffold with an intended retirement (once `lifecycle` coverage is resolved), or has the old tree simply moved house?

*Verdict:* accept — transitional scaffold with intended retirement. The intent is now on record in `docs/specs/pattern-site.md` §Classification facets.

## Move 3: Migration by batch, repair by hand

*The move.* "Related patterns" prose sections were migrated into typed frontmatter `relationships:` in batches (`a07944d` "lossless batch", `ca46165` "low-churn", the per-cluster `Migrate relationships…` commits), followed by a repair tail of at least seven commits restoring what the batches dropped (`cf21fed`, `99400ef`, `48b849e`, `41c6819`, `40dedbc`, `20fb5d7`, `3a9f03a`). Non-edge nuance was given durable homes in place: text-only asides became `## To-do` sections (undo's *version history* note), demo debts became `{/* TODO: Storybook demo exists — … */}` breadcrumbs (`231698a`), and missing link targets became honest stub entries with their debts enumerated in a comment (`validation.mdx`).

*Answers to.* The frontmatter-relationships direction of the typed-edge episodes; within this episode's terms, `docs/language/pattern-definition.md` — "relationships should carry semantic weight… more useful than a generic related link."

*Backtalk.* This is the episode's loudest backtalk, and it is about method. The losses had a consistent shape — prose notes dropped when an entry was written as a bare slug, section headings captured as notes, asides that fit no edge type silently vanishing — and each repair commit names the same failure mode ("The migration wrote some entries as bare slugs, dropping the prose note", `cf21fed`). The sampling confirms both the recovery and its residue. Recovered well: undo's three related notes survive verbatim; temporality's fourteen-entry related list was redistributed as reverse `enacts` edges on the pattern side (undo, saving, notification, mastery… all carry `to: temporality` with fresh notes). Residue: `information-architecture` gained a `precedes: searching` edge but the origin's note — "Without good IA, search is brittle" — is gone, and that edge sits as a bare slug beside noted siblings; temporality→*suggestion* ("visualising the future") has no successor edge in either direction; bare-slug entries persist at the endpoint (`collaboration-foundation` `related: - bot`, IA's whole `related` list). By the project's own definition doc, a bare slug is exactly the generic link the language says is less useful.

*Question.* The repair tail proved that only hand-verification against the baseline catches dropped nuance — yet bare-slug edges remain legal in the schema and present at the endpoint. Is a note-less edge a licensed state of the language (a seed awaiting prose), or is it the same defect the seven restore commits were written to fix, still standing?

*Verdict:* fix, scoped out — neither reading holds wholesale: some residue is truly lost nuance, some was removed deliberately, and only a per-item pass against the full baseline diff can tell them apart. Scoped as `plans/active/2026-07-related-residue-audit.md`, which also names the gate the sampling exposed: pattern–foundation links have no settled edge treatment (candidate: mirror the qualities approach) and are in limbo until that vocabulary decision lands.

## Move 4: One address per entry; cross-surface pointers become elements

*The move.* All intra-site links were rewritten from Storybook query-URLs (`../?path=/docs/operations-undo--docs`) and multi-segment routes to `/patterns/<stem>` — one string naming an entry as slug, route, node ID, and link target. Cross-surface references stopped being raw URLs and became typed elements: `<PatternRef slug>` in Storybook MDX pointing at the site, `<ComponentRef id>` in content pointing at Storybook. Links whose targets had moved to Storybook were rewritten as ComponentRefs; one link (`/patterns/foundations/overview`) was demoted to plain text.

*Answers to.* `docs/specs/pattern-site.md` §Inter-page link format ("never an Activity-Theory path… both are tech debt"); the triage table in `plans/completed/2026-07-intra-site-link-validation.md`.

*Backtalk.* The rewrite worked as a census of what links actually meant. Most were plain renames, but a class of them turned out to be *cross-surface references wearing site-link clothing* — Toolbar, Nav bar, Layout, Color — and the honest rewrite changed their kind, not just their spelling. One link had no honest target at all: there is no single foundations page, so the "Foundation" heading in `agency.mdx` became plain text while its three sibling headings stayed links — the plan records this as "an intentional asymmetry", which is the addressing scheme reporting a real hole in the language's surface rather than papering over it. The one-string identity also concentrates risk: a future stem rename now changes slug, route, node ID, and every inbound link at once, which is exactly what makes move 5 necessary rather than nice.

*Question.* The foundations asymmetry is recorded in a completed plan, but a reader of `agency.mdx` meets three linked levels and one unlinked one with no cue that the asymmetry is deliberate. Where should an intentional hole in the address space be legible — only in the plan archive, or on the surface that exhibits it?

*Verdict:* fix — handled by the author directly on `agency.mdx`: the three sibling heading links were removed, so all four levels are now uniformly plain headings and the asymmetry is gone by levelling down. The removed links pointed at collection pages whose survival is itself in question (move 1's reframe). The broader pattern–foundation address question lives on in the residue-audit gate (`plans/active/2026-07-related-residue-audit.md`), not here.

## Move 5: Validation as a standing gate

*The move.* A build-time Astro integration (`apps/patterns/integrations/validate-cross-references.ts`) now checks all three link seams in one pass — ComponentRef → Storybook `index.json`, PatternRef → content stems, and static `/patterns/<slug>` links (content markdown plus href-only matching in `.astro`/`.tsx` bodies) → the same stem space — aggregated into one build-failing report with near-miss suggestions (`7b17735`, `c42c154`).

*Answers to.* `plans/completed/2026-07-intra-site-link-validation.md` and workstream 2 of the split-closure plan; `docs/project/core-beliefs.md` — "cross-references, typed edges, and graph navigation are load-bearing, not decorative."

*Backtalk.* The gate paid for itself before landing: switching it on required resolving eight live breakages, `index.astro` had already rotted six links that only a non-content scan surface would catch (shaping the scan-scope decision), the ComponentRef check caught a stale ref the moment it ran (`bounded-choice`), and a code-comment false positive forced the href-only matching rule. The plan also surfaced a seam the gate cannot close: ComponentRef renders inert in `.md` collection pages — the validator verifies the pointer resolves, but not that it renders as a link. Structurally, the gate is the enforcement arm of moves 2 and 4: once identity is one string, a dangling string is a build failure, not drift.

*Question.* The gate verifies that addresses resolve; the `.md` caveat shows an address can resolve and still be dead on the page. Is "resolves at build time" the full contract the language wants from a cross-reference, or is render-as-link part of what "load-bearing" means?

*Verdict:* fix — the author deleted the four `.md` collection pages outright (`actions.md`, `activities.md`, `operations.md`, `qualities.md`), consistent with move 1's reframe: handwritten overview pages lag the corpus and facet projections are the intended direction. The renders-inert caveat is moot — no `.md` files remain in the content collection, so every surviving ComponentRef lives in `.mdx` where it renders. Cleanup verified: the one inbound link (`index.astro` → `/patterns/qualities`) demoted to plain text, graph regenerated (114 nodes / 630 edges, unchanged — nothing pointed at the collections), both graph JSON copies in sync, site build green with the validator passing all four seams.

## Move 6: Page chrome into frontmatter; the fun meter goes dark

*The move.* The in-body `# Title` was removed from 118 files (`c081655`), the title rendering from frontmatter. Fun-meter blockquotes were first commented out (`8025294` "Hide fun meters") and then moved into a `fun:` frontmatter field preserving emoji, rating, and rationale (`8c8d9c2`); 100 endpoint files carry one. `fun` is absent from the zod schema in `content.config.ts` — Astro strips unvalidated keys from `entry.data` — and no page, layout, or component reads it.

*Answers to.* The h1/title normalisation follows from the frontmatter-as-identity direction of the flatten plan and `pattern-site.md`'s schema (`title` required). The fun-meter relocation answers to nothing on record: neither `pattern-site.md`'s field list nor any grounding document names `fun` — that is a finding.

*Backtalk.* The h1 removal is the flatten's logic finishing its sweep — once frontmatter is authoritative for identity, a second in-body title is duplicate data, and removing it deleted a stray dependency too. The fun meter is a different story: the two-step trajectory (hide, then relocate) reads as an unresolved decision executed halfway. The data survived transit faithfully — sampled entries kept their full register ("🤯 4/5. Even before AI…") — but at the endpoint it is triple-buried: invisible in prose, stripped by the schema, unread by any surface. For a project that calls itself a personal repertoire and thinking tool (`docs/project/core-beliefs.md`), the author's engagement register is the most *garden*-native metadata the corpus has, and it is currently the only frontmatter field with no consumer and no schema entry. The same legibility question touches the stubs: `validation.mdx` enumerates its debts in an MDX comment, so a reader meets a seed presenting with the authority of a finished page — `pattern-definition.md` asks that maturity be "legible", "more than editorial confidence".

*Question.* Is the fun meter retired (in which case why carry it through two migrations), or waiting for a surface (in which case why is it outside the schema that any surface would read it through) — and more broadly, where does the language now want authorial register and seed-versus-mature status to show?

*Verdict:* accept as is — the author is not yet sure what the fun meter should become; the data is preserved in `fun:` frontmatter and the decision (surface it, schema it, or retire it) stays open deliberately. No action now.
