---
title: "Intra-site link validation"
status: "completed"
kind: "exec-spec"
created: "2026-07-09"
last_reviewed: "2026-07-09"
area: "pattern-site, tooling"
promoted_to: "apps/patterns/integrations/validate-cross-references.ts (checkIntraSiteLinks — the enforcement mechanism this plan produced)"
superseded_by: ""
depends_on: "plans/active/2026-07-workspace-split-closure.md (workstream 2 — the cross-surface validator this extends)"
---
# Intra-site link validation

Workstream 2 of the [split-closure plan](2026-07-workspace-split-closure.md) gates the two *cross-surface* seams: `<ComponentRef id>` (site → Storybook) and `<PatternRef slug>` (Storybook → site) now fail the site build when they dangle. The third seam — *site → site* — is still unvalidated: plain `/patterns/<slug>` links in content prose and `.astro` pages resolve against nothing at build time.

That gap has already produced rot. `index.astro` carried six stale nested links (`/patterns/qualities/agency`, `/patterns/foundations/assistance`, …) — artifacts of the split flattening the content collection from nested folders to flat filename-stem slugs (`getStaticPaths` maps `params.slug = entry.id`, and `entry.id` is the flat stem). Those six were fixed by hand (2026-07-09). A tree-wide sweep then found eight more broken authored links plus one false positive — enumerated below. Nothing catches them because the route space (`apps/patterns/src/content/patterns/*.{md,mdx}` stems) is never cross-checked against the links that target it.

## The check to add

A third pass in the existing integration (`apps/patterns/integrations/validate-cross-references.ts`): every static `/patterns/<slug>` link resolves to a content stem, or the site build fails, with file:line and a near-miss suggestion — the same shape as the two checks already there. Valid targets are the content collection: both `.mdx` and `.md` stems (`qualities.md`, `actions.md`, `activities.md`, `operations.md` back real routes). Anchors (`#…`) are stripped before resolution; sub-page anchor addressability is out of scope (the graph doesn't model it either — see the T1 note in the closure plan).

The code is small. It cannot be switched on until the eight live breakages below are resolved, or it turns the build red on landing.

## Blocker: broken links to triage

Most broken links point at moves that the split relocated to Storybook as `role:component` docs (Toolbar, Nav bar, and the foundations-material pages Layout/Color, all kept in Storybook per closure workstream 1 / T6). Prose that still links them as `/patterns/<slug>` site pages is stale — the honest target is a `<ComponentRef>`, the pattern→mechanism reference shape the closure plan settled elsewhere.

| Link | Location | Resolution |
| --- | --- | --- |
| `/patterns/toolbar` | `actions.md:70`, `agency.mdx:199` | `<ComponentRef id="components-toolbar--docs">` |
| `/patterns/nav-bar` | `actions.md:71`, `fully-connected.mdx:25,47` | `<ComponentRef id="components-nav-bar--docs">` |
| `/patterns/foundations/material/layout` | `malleability.mdx:28` | `<ComponentRef id="foundations-layout--docs">` |
| `/patterns/foundations/material/color` | `malleability.mdx:28` | `<ComponentRef id="foundations-color--docs">` |
| `/patterns/foundations/overview` | `agency.mdx:189` | Rewritten to a plain-text `### Foundation` heading (was a link). No single foundations page or docs entry exists — Color/Layout/Typography/… are separate `role:component` docs, so any Storybook ref would misrepresent the whole level. Its three sibling headings (Operations/Actions/Activities) stay links to their `role:collection` pages; Foundation now doesn't, an intentional asymmetry. Body copy `At the  level` → `At the foundation level`. |

All four ComponentRef targets are confirmed present in Storybook's `index.json`, so once rewritten they pass the workstream-2 ComponentRef check as well — the two checks are coupled, and this triage feeds both.

One false positive to design against: `RelatedPatterns.astro:151` matched `/patterns/slug` inside a *code comment* in the component's frontmatter script (`[text](/patterns/slug#anchor)` as documentation). Dynamic hrefs (`` `/patterns/${slug}` ``) live in the same files.

## Design decisions to settle

- *Scan scope.* Content MDX prose is unambiguous. `.astro`/`.tsx` sources carry dynamic hrefs and comment examples that a naive regex mis-flags (the `RelatedPatterns` false positive). Options: (a) scan content MDX only and accept that `.astro` page bodies like `index.astro` go unguarded; (b) scan `.astro`/`.tsx` but match only `href="/patterns/<literal>"` in template bodies, excluding `${…}` interpolations and stripping `//`, `/* */`, and `<!-- -->` comments. Recommendation: (b), scoped to `src/pages` + `src/layouts` + `src/components`, since the only breakage found in that surface (`index.astro`) is exactly the class (a) would miss.
- *Reuse the near-miss + aggregation machinery* already in the integration; report all three checks in one throw.

## Already landed

- `checkPatternRefs` was globbing `.mdx` only, blind to the four `.md` route pages; a `<PatternRef slug="qualities">` would have false-failed. Fixed to include `.md` (2026-07-09). Latent when found — no current PatternRef targets a `.md`-only stem — but the fix aligns the check with the real route space, the same `.md`+`.mdx` set this workstream's check needs.

## Definition of done

1. The five table rows resolved (four ComponentRef rewrites + the foundations-overview verdict); tree-wide sweep re-run to zero broken intra-site links. *Done.*
2. The third check added to the integration, scan scope per the decision above (option b — content markdown links + `href="/patterns/…"` in `src/pages`/`src/layouts`/`src/components`, block comments stripped, `//` left alone since the href-only matcher never coincides with it), aggregated into the single build-failing report. *Done.*
3. Break-test: a deliberately-broken `/patterns/<slug>` fails the build with file:line + suggestion; restored, green. *Done — verified on both a content link and an `.astro` href.*
4. Both builds green; graph regenerated with no unexpected diff (the ComponentRef rewrites drop no edges — the stale links carried no `rel=`). *Done — graph regen produced zero diff.*

## Landed caveat

`<ComponentRef>` only renders as a Storybook link in `.mdx`. In the four `.md` collection pages (`actions.md`, `activities.md`, `operations.md`, `qualities.md`) it emits an inert `<componentref>` custom element — plain text, no link. This predates the workstream (the Bubble-menu/Dropdown/Priority+/Action-bar refs already in `actions.md` render the same way), so the `actions.md` Toolbar/Nav-bar rewrites are consistent with their siblings, not a new regression. Closing the gap (render ComponentRef in `.md`, or promote the collection pages to `.mdx`) is a separate concern from link validation and is left for a follow-up.
