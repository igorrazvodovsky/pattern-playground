# Episode 05: Site surfaces — walkthrough

Scope: branch `split-project`, merge-base `ef66e6a852ff04cc9de2f64b8734fa4fe97c1d7c` (verified via `git merge-base main split-project`). Territory: the pattern site's reading and navigation surface — `git diff --stat <merge-base>...split-project -- apps/patterns/src/{components,layouts,styles,pages,lib} apps/patterns/astro.config.mjs` (16 files, +2,191), plus targeted reads of the landed files and `git log --oneline --reverse <merge-base>..split-project -- apps/patterns` for trajectory. Grounding: docs/project/vision.md, docs/project/core-beliefs.md, docs/project/operative-image.md, docs/specs/pattern-site.md, and the pane-spine / cross-surface-nav / sidebar-react plans (completed) with the hash-anchor, cross-surface-links, embed-components, and shell-island plans (archived). Depth: medium.

The episode builds the Astro pattern site's reading surface from the ground up on this branch: a stacked-panes navigation model with two-rail spine collapse, capture-phase link interception with a build-time slug allowlist and hash-anchor support, a hover link-preview popover, a persistent sidebar island over static content, reciprocal links and an embedding contract between the site and Storybook, and the typographic dress (Alegreya pairing, prose styles, corner TOC, home page with working-notes log). Several of these went through visible in-branch rework (six pane-stacking commits) before settling into the shape now recorded in docs/specs/pattern-site.md.

## Coverage

Every move needs a written verdict before this review counts as done.

| # | Move | Verdict |
|---|------|---------|
| 1 | The stacked-panes reading model | fix (scoped out) |
| 2 | Cross-surface addressing and the embedding contract | fix |
| 3 | Intra-site addressing: interception, allowlist, hash anchors | fix |
| 4 | The island posture: persist-once nav, static content | accept |
| 5 | Link preview as an enacted pattern | accept (fix scoped) |
| 6 | Reading dress: fonts, prose styles, home page | accept |

## Move 1: The stacked-panes reading model

*The move.* Following a pattern link pushes the target into a horizontal deck of panes rather than replacing the page. Geometry is CSS `position: sticky` with a per-pane left inset and a *negative* right inset (stack.css:31–34); a rAF-throttled scroll handler in StackManager.tsx toggles two cosmetic attributes, `data-collapsed` (spine label revealed) and `data-overlapping` (depth shadow). Stack state is encoded in `stackedNotes` URL params (stack-store.ts `buildURL`/`syncFromURL`). Pane 0 renders the server slot; panes 1+ fetch the target page and inject `article.innerHTML` via `dangerouslySetInnerHTML` (StackManager.tsx:203).

*Answers to.* docs/specs/pattern-site.md §Stacked-notes navigation (which records the landed model, including the flow-then-pin invariant); plans/completed/2026-05-pane-spine.md; docs/project/operative-image.md §Navigation and reading ("stacked-notes panes that collapse into spines on both rails … current infrastructure serving the garden"). The model serves the relational commitment in core-beliefs.md — links as the primary structure — by making link-following non-destructive.

*Backtalk.* The pane-spine plan specified a one-rail spine, IntersectionObserver detection, and an opacity fade; the landed model is two-rail, rAF-scroll-driven, `display`-toggled — the plan's whole detection architecture was replaced in-branch (six stacking commits, 4a07f0c through 2574a5c, are the learning trail). Two strains surfaced: the spine's visibility rules had to live *outside* `@layer` because the components package's layered button reset outranks any layered app rule (stack.css:135–146) — the shared style substrate pushing back on the app; and the fetched-pane regime means panes 1+ are static HTML — Lit custom elements self-upgrade (register-all is global) but React islands and RelatedPatterns in a fetched pane do not exist, so the same pattern renders differently at position 0 versus position n.

*Question.* The language says a pattern's page is its identity (`/patterns/<stem>`), yet the stack gives that page two renderings — full at pane 0, article-extract thereafter. Is the article the canonical body of a pattern (so anything outside it, like the related block, is deliberately positional), or is the reduction an accident the reading model should eventually close?

*Verdict:* fix, scoped out — the sitting narrowed the finding first: verified live, fetched panes keep the prose, the Lit components, *and* the RelatedPatterns block (it is static HTML inside the article — the walkthrough's claim that it vanishes was wrong). The only real difference is `client:only` demo islands, which fail visibly: an empty labelled frame, because demo modules register custom elements at import time (no SSR possible) and `innerHTML` injection never hydrates. The author's call: this is a defect, not a contract — fetched panes should hydrate their islands. Scoped as `plans/active/2026-07-pane-island-hydration.md`.

## Move 2: Cross-surface addressing and the embedding contract

*The move.* Pattern prose gets two globally-injected MDX components: `<ComponentRef id>` renders a same-tab link to a Storybook docs URL built from `PUBLIC_STORYBOOK_URL` (ComponentRef.tsx), and `<Demo>` renders a framed sandbox with an optional label (Demo.tsx); both are passed via `Content components=` in `[...slug].astro`. Reciprocal nav links land on both surfaces: a "Components" footer entry in the sidebar (Nav.tsx:152–164) and a DOM-injected "Patterns" anchor in Storybook's manager (`packages/components/.storybook/manager.ts`), both env-driven.

*Answers to.* docs/project/vision.md §Bilingual substrate maturity ("the cross-surface reference scheme resolving so a quality or foundation reads as one bilingual entry"); plans/archive/2026-05-embed-components.md ("embed for illustrative demos; link for fuller docs") and plans/completed/2026-05-cross-surface-nav.md.

*Backtalk.* Three deviations from the archived plans, all absorbed silently. `Demo` dropped its planned `storyId` → "View in Storybook" link, so the "link for fuller docs" half of the embed decision now lives only in `ComponentRef`. `ComponentRef` dropped the planned `target="_blank"`, converging on the same-tab choice the nav plan made — a real coherence gain. But the Storybook side imports `iconify-icon` into the manager bundle, exactly what the cross-surface-nav plan flagged as "Asymmetric but deliberate — do not 'fix' by adding iconify" (plan line 126). Meanwhile operative-image.md still records the reference scheme as "not yet established — Storybook quality and foundation pages still link to Storybook URLs" — these links are sinew between two surfaces, not the promised single bilingual entry.

*Question.* The plan defended an asymmetry (plain glyph in Storybook, icon on the site) as the honest reflection of two unequal surfaces, and the landed code erased it. Was that a considered reversal of the plan's reasoning, or polish that quietly overruled a recorded decision — and which should the record now say?

*Verdict:* fix — the author's read: possibly polish that quietly overruled the record. Resolved by a third option the plan never weighed: the `iconify-icon` import (and its runtime icon API dependency) is out of the manager bundle, replaced with an inline `ph:graph` SVG in `manager.ts` — the plan's reasoning honoured, visual parity kept, Storybook build green. The move's other two deviations, adjudicated under the questions-follow-judgement amendment: `Demo` dropping its planned `storyId` link is accepted as is (a demo demonstrates, prose cites via `ComponentRef` — the jobs stay separate); `ComponentRef` dropping `target="_blank"` was already resolved in backtalk as a coherence gain.

## Move 3: Intra-site addressing: interception, allowlist, hash anchors

*The move.* A module-level capture-phase click listener intercepts in-pane `/patterns/...` links before Astro's ClientRouter, but only when the target slug is in a build-time `import.meta.glob` allowlist of content files; misses fall through to real navigation and a real 404 (stack-store.ts:120–169). URL fragments are threaded through `push` as an ephemeral `hash` on the pane and scrolled to with an *instant* direct `.pane-body` scroll (StackManager.tsx:141–157); the hash is never encoded into the `stackedNotes` URL params.

*Answers to.* docs/specs/pattern-site.md §Inter-page link format (flat slugs as the single address); plans/archive/2026-05-cross-surface-links.md (guard absorbed — via `import.meta.glob` instead of the planned JSON endpoint); plans/archive/2026-05-hash-anchor-stacked-notes.md (absorbed with one deviation).

*Backtalk.* The hash plan specified `scrollIntoView({behavior:'smooth'})`; making it revealed that `scrollIntoView` also scrolls `.stack` horizontally, fighting the concurrent pane scroll and "ending up back at 0" (StackManager.tsx:149–152) — the fix scrolls the pane body directly, instantly. The allowlist survived the content flatten only by accident of mechanism: its comment still documents slugs like `'actions/sense-making/tag'` (stack-store.ts:122), a shape the flat layout in pattern-site.md §File layout retired. And the spec's shareability claim ("a stacked view is shareable and survives reload") is only pane-deep: the hash plan chose to keep fragments out of `buildURL`, so a reloaded stack loses every anchor position.

*Question.* What is the unit of reference in the language — the pattern, or the section within it? If prose links carry fragments (`#sense-making--integration`), the address the reader shares should arguably carry them too; if the pattern is the unit, should section-level links exist in prose at all?

*Verdict:* fix, both findings — (1) the section is a real unit of reference: fragments are now encoded into `stackedNotes` (`buildURL`/`syncFromURL`), reversing the archived hash plan's ephemerality choice; verified live in both directions (click → URL carries `slug%23fragment`; reload → pane restored scrolled to the anchor); the spec's shareability sentence updated to state anchors as part of the address. (2) The stale allowlist comment fixed, and the slug derivation made basename-based so it honours the spec's regroup-without-renaming promise instead of silently assuming a flat directory. Known unchanged edge: re-clicking an anchor into an already-ready pane doesn't re-scroll (scroll fires on the loading→ready transition).

## Move 4: The island posture: persist-once nav, static content

*The move.* The whole-shell `client:load` island is replaced by a static flex host in Base.astro with one `transition:persist`ed `Nav` island beside static `<main>` content (Base.astro:129–142). Because a persisted island never re-renders on navigation, active-link state moved from a prop to a `useSyncExternalStore` store fed by `astro:page-load` (active-path.ts), and the persisted nav store gates its localStorage rehydration behind a `hydrated` flag to keep the first client render matching server HTML (nav-store.ts, Nav.tsx:36–41). `optimizeDeps.entries` front-loads dependency pre-bundling so island imports never go stale mid-swap (astro.config.mjs:37–77).

*Answers to.* plans/archive/2026-06-shell-island-refactor.md, fully absorbed — including its own recorded correction that the View-Transition abort it once hoped to fix "is NOT caused by shell re-hydration"; what shipped is the plan's surviving original motivation (hydrate once, never re-create).

*Backtalk.* Persistence is a posture with a recurring tax: every mechanism that assumed per-page setup had to be inverted — prop→store for the active path, deferred rehydration for nav groups, and the Pagefind trigger abandoned for direct `open()` calls because its binding "goes stale across ClientRouter / View Transitions swaps" (Base.astro:143–149). The nav data itself is baked at first hydration: Base.astro recomputes the full nav projection on every page render (lines 34–109) for an island that reads it exactly once. The projection comment there ("Other projections … can be added as alternative grouping functions") now sits inside a frontmatter-driven computation, which honours the multiple-projections belief in core-beliefs.md at the data level.

*Question.* The sidebar comment promises alternative projections over the same entries, but the posture freezes one projection into a persist-once island whose props never update. When a second projection arrives, does it live inside this island (state, not props), or as a sibling surface — and is the persistent island the right home for something meant to be plural?

*Verdict:* accept — settled by a design commitment: a projection is a *site-wide mode*, exactly one active at a time. That makes the persistent island the right home, not a liability: a mode is state, and the persist-once island is where state survives navigation. Projection switching therefore lives inside the island (all groupings passed at first hydration, active one chosen client-side); the intent is now recorded in the Base.astro projection comment.

## Move 5: Link preview as an enacted pattern

*The move.* Hovering (or focusing) a pattern link raises a manual-popover preview of the target page: 350ms show delay, hover-bridge into the popover body, Floating UI positioning with a Chrome containing-block correction, Escape and scroll dismiss, touch suppression, and click-through that pushes the previewed pattern onto the stack (link-preview.ts). All pattern links on a page are prefetched in idle-time slices (`preloadPageLinks`, lines 211–232), sharing the stack store's pane cache.

*Answers to.* No plan preceded the landing (commits 42be7d7, 57488ff). Post-hoc it acquired both a pattern page (`actions/seeking/link-preview`) and an extraction plan, plans/active/2026-05-link-preview-component-extraction.md, which names the situation plainly: the implementation "landed … as an app-specific behaviour module". Substantively it serves the same reading-surface direction as the stack (operative-image.md §Navigation and reading).

*Backtalk.* Making it duplicated the reading surface's fetch contract: `fetchContent` re-implements `fetchPane`'s template/article extraction almost line for line (link-preview.ts:54–74 vs stack-store.ts:19–34), coupled only through the shared cache — the surface now has two definitions of "what a pattern page's body is". On the garden lens: this is the episode's most product-shaped code (idle prefetch of every link is audience-grade performance work), yet it defensibly serves the author's own hover-reading, and its afterlife — becoming a documented seeking pattern the site itself enacts — is the garden working as intended, just in the wrong order relative to the research-before-locking-in habit.

*Question.* The site now demonstrates one of its own seeking patterns in situ. Is self-enactment a standing expectation — the site as reference implementation of its reading-and-seeking patterns — or a happy accident of this one, and where would that expectation be recorded if it is one?

*Verdict:* accept — the site is *not* a reference implementation: patterns are defined mostly with the author's work projects in mind, and dogfooding is practiced opportunistically where possible, not owed. No standing expectation to record. The backtalk's duplication finding is adjudicated as a scoped fix: unifying the two article-extraction implementations is now an explicit step in `plans/active/2026-05-link-preview-component-extraction.md`, coordinated with the pane-island-hydration plan that shares the seam.

## Move 6: Reading dress: fonts, prose styles, home page

*The move.* The site adopts an Alegreya / Alegreya Sans pairing loaded from Google Fonts (Base.astro:121–123), scoped prose styling (`--font` swaps for blockquotes and demo blocks, underline treatment for prose links, dash list markers — app.css), a fixed corner TOC on content pages and a per-pattern `pp-toc`, and a home page (index.astro) carrying the intro, the PatternGraph island, and a reverse-chronological "Working notes" log; fun meters were hidden (commit 8025294).

*Answers to.* docs/project/core-beliefs.md §Voice and the garden framing ("tending a garden — cultivating ideas over time", quoted almost verbatim in index.astro:83–85); the working-notes log is the author's own record of thinking, squarely inside the garden constraint. The font choice itself answers to nothing on record (commit b7602ef, no plan or doc).

*Backtalk.* The dress layer is where the two surfaces' style systems grind: app.css needs `!important` to override the components package's sidebar width and logo sizing (lines 42, 59), carries two TODO-marked selector hacks for pane articles (app.css:125–131, stack.css:118–125), and one commit each direction patches leakage (6ae7e7d stops Storybook doc styles bleeding into the site). Google Fonts is the reading surface's only external-host dependency. On the garden lens: the home page's first-person voice and the log keep it authorial; nothing in the episode adds onboarding, discoverability, or contribution machinery — the constraint holds, with the eager prefetch in Move 5 as the nearest approach.

*Question.* Core-beliefs reserves aesthetic decisions for the human, and the type pairing is exactly such a decision — but it left no trace anywhere a future reader (or agent) could find. Should aesthetic commitments of this weight get a line in the operative image or a spec, or is their illegibility part of what keeps them aesthetic?

*Verdict:* accept — no trace needed for now; the aesthetic register stays the author's, untraced. The Google Fonts external-host dependency and the cross-surface style hacks were surfaced and passed on without action (the hacks are already TODO-marked in the code).
