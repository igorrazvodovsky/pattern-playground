/**
 * Remark plugin: strips `{rel="type"}` attribute annotations from after inline
 * markdown links in MDX files, preventing them from rendering as stray text.
 *
 * In MDX, `[text](url){rel="precedes"}` is parsed as a link node followed by
 * an mdxTextExpression node (`{rel="precedes"}` → evaluates to "precedes").
 * This plugin removes that expression node so the link renders cleanly.
 *
 * The `rel` value is validated against the controlled vocabulary. Unknown values
 * emit a build-time warning without failing the build.
 *
 * Phase A of the typed-relationships plan.
 */

import { visit } from 'unist-util-visit';
import type { Root, Paragraph } from 'mdast';

// The authorable rel vocabulary (matches ALIAS_TABLE in extract-graph-data.ts).
// `recommends` is intentionally absent — not an authorable rel.
const AUTHORABLE_RELS = new Set([
  'precedes', 'follows',
  'enables', 'composed-of',
  'instantiates', 'instances', 'variants',
  'complements', 'tangential', 'alternative',
  'enacts', 'surveys', 'related',
]);

// Matches the value inside {rel="..."} — the expression in the mdxTextExpression node.
const REL_EXPR_RE = /^rel="([^"]+)"$/;

export default function remarkRelStrip() {
  return (tree: Root) => {
    visit(tree, 'paragraph', (node: Paragraph) => {
      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i] as { type: string; value?: string };
        if (child.type !== 'mdxTextExpression') continue;
        const m = (child.value ?? '').match(REL_EXPR_RE);
        if (!m) continue;
        const prev = node.children[i - 1];
        if (!prev || prev.type !== 'link') continue;

        const rel = m[1];
        if (!AUTHORABLE_RELS.has(rel)) {
          const url = (prev as { url?: string }).url ?? '?';
          console.warn(`[remark-rel-strip] Unknown rel="${rel}" on link to "${url}" — ignored`);
        }

        // Remove the expression node; the link renders cleanly without it.
        node.children.splice(i, 1);
      }
    });
  };
}
