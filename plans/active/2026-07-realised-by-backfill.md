---
title: "realised_by backfill: claim or citation, page by page"
status: "active"
kind: "exec-spec"
created: "2026-07"
last_reviewed: "2026-07-11"
area: "language"
promoted_to: ""
superseded_by: ""
---
# `realised_by` backfill: claim or citation, page by page

Component realisation now has a frontmatter home: `realised_by` lists the
Storybook docs ids of the components that realise a pattern's move, emitted
as node metadata and build-validated against `index.json`
(`docs/language/relationship-vocabulary.md` §Component realisation, changelog
2026-07-11). Prose `<ComponentRef>` mentions are citations, claim-free. Form
is the seeded type specimen.

The backfill is the remaining work: roughly 50 content pages carry ~140
ComponentRef mentions, and each mention owes one judgement call — is this
the pattern's material (promote to `realised_by`) or a citation (leave as
prose)? This is a hand pass, not a script: the distinction is exactly the
judgement a mechanical sweep would flatten (filtering's reference to the
command-menu mechanism doc is a citation; form's "corresponding component"
is a claim — same tag, different standing).

## Procedure

One sitting, or two if fatigue sets in mid-list — stakes are uniform, so
order is alphabetical.

1. Inventory: `grep -rn "ComponentRef" apps/patterns/src/content/patterns/`
   grouped by file.
2. Per file: read each mention in context and sort it — *claim* (the
   component implements this page's move) or *citation* (context, contrast,
   embedding surface, another pattern's mechanism). Claims collect into one
   `realised_by:` list per file; citations stay untouched.
3. Judgement guidance: a `## Related components` list is usually claims; an
   inline "can be embedded in / pairs with / see also" is usually citation.
   A page may honestly end with no `realised_by` at all — many moves have no
   direct component realisation, and an empty field is not authored.
4. Gate: `npm run build` — the cross-reference validator resolves every
   `realised_by` id; the extractor emits `realisedBy` node metadata.
5. Record the count (pages with claims / total mentions sorted) in the
   vocabulary doc changelog as a rider on the 2026-07-11 entry.

## Not owned here

Rendering `realisedBy` anywhere (RelatedPatterns deliberately shows
nothing); any adaptation-content structure ("this move, realised here,
requires adapting the material thus" stays prose); Storybook-side back-links
from component docs to the patterns they realise (a later decision, same
cross-dataset shape in reverse).
