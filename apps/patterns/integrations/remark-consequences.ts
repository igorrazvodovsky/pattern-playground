/**
 * Remark plugin: composes the fixed page order of a pattern page inside the
 * MDX body, so nothing has to be appended after `<Content />`.
 *
 * The authoring contract (.claude/rules/pattern-content.md §Document
 * structure) fixes the order: body sections, Consequences, Resources &
 * references, then the foot (sequence appearances, Related patterns), then
 * To-do as authoring residue. Consequences and the foot are rendered from
 * frontmatter and the graph, never authored; To-do is authored wherever the
 * author left it. This plugin:
 *
 * 1. lifts an authored `## To-do` section (heading to next h2) out of the tree;
 * 2. injects `<Consequences resulting={frontmatter.situation.resulting} />`
 *    before `## Resources & references` (or at the end) when clauses exist;
 * 3. appends `<SequenceAppearances slug />` and `<RelatedPatterns slug />`
 *    (the latter unless `showRelated: false`);
 * 4. re-emits the To-do section last, wrapped in `<Residue>`.
 *
 * PatternArticle.astro maps those names to components. Only files under
 * content/patterns are touched.
 */

import path from 'node:path';
import type { Root, RootContent } from 'mdast';
import type { MdxJsxFlowElement, MdxJsxAttribute } from 'mdast-util-mdx-jsx';
import type { VFile } from 'vfile';

const RESOURCES_HEADING = 'Resources & references';
const TODO_HEADING = 'To-do';

function headingText(node: RootContent): string {
  if (node.type !== 'heading') return '';
  return node.children
    .map((c) => ('value' in c ? c.value : ''))
    .join('')
    .trim();
}

function isH2(node: RootContent, text: string): boolean {
  return node.type === 'heading' && node.depth === 2 && headingText(node) === text;
}

function jsx(name: string, attributes: MdxJsxAttribute[] = [], children: RootContent[] = []): MdxJsxFlowElement {
  return { type: 'mdxJsxFlowElement', name, attributes, children: children as MdxJsxFlowElement['children'] };
}

function stringAttr(name: string, value: string): MdxJsxAttribute {
  return { type: 'mdxJsxAttribute', name, value };
}

// `frontmatter.situation.resulting` as an expression attribute. Astro's MDX
// integration exports `frontmatter` at module scope, so the JSX can read it.
function resultingAttr(): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name: 'resulting',
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: 'frontmatter.situation.resulting',
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [
            {
              type: 'ExpressionStatement',
              expression: {
                type: 'MemberExpression',
                computed: false,
                optional: false,
                object: {
                  type: 'MemberExpression',
                  computed: false,
                  optional: false,
                  object: { type: 'Identifier', name: 'frontmatter' },
                  property: { type: 'Identifier', name: 'situation' },
                },
                property: { type: 'Identifier', name: 'resulting' },
              },
            },
          ],
        },
      },
    },
  };
}

/** Removes the `## To-do` section (heading through the node before the next h2) and returns it. */
function liftTodo(tree: Root): RootContent[] {
  const start = tree.children.findIndex((n) => isH2(n, TODO_HEADING));
  if (start === -1) return [];
  let end = start + 1;
  while (end < tree.children.length) {
    const n = tree.children[end];
    if (n.type === 'heading' && n.depth <= 2) break;
    end++;
  }
  return tree.children.splice(start, end - start);
}

export default function remarkConsequences() {
  return (tree: Root, file: VFile) => {
    const filePath = file.path ?? '';
    if (!/[\\/]content[\\/]patterns[\\/]/.test(filePath)) return;
    const slug = path.basename(filePath).replace(/\.mdx?$/, '');
    const fm = (file.data as { astro?: { frontmatter?: Record<string, unknown> } }).astro?.frontmatter ?? {};
    const situation = fm.situation as { resulting?: unknown[] } | undefined;

    const todo = liftTodo(tree);

    if (Array.isArray(situation?.resulting) && situation.resulting.length > 0) {
      const at = tree.children.findIndex((n) => isH2(n, RESOURCES_HEADING));
      const node = jsx('Consequences', [resultingAttr()]);
      if (at === -1) tree.children.push(node);
      else tree.children.splice(at, 0, node);
    }

    tree.children.push(jsx('SequenceAppearances', [stringAttr('slug', slug)]));
    if (fm.showRelated !== false) {
      tree.children.push(jsx('RelatedPatterns', [stringAttr('slug', slug)]));
    }
    if (todo.length > 0) tree.children.push(jsx('Residue', [], todo));
  };
}
