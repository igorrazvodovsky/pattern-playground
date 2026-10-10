/**
 * Remark plugin: composes the fixed page order of a pattern page inside the
 * MDX body, so nothing has to be appended after `<Content />`.
 *
 * The authoring contract (.claude/rules/pattern-content.md §Document
 * structure) fixes the order: opening paragraph, body, connections passage
 * with its folded index, then the tail sections, then To-do as authoring
 * residue. Both situations are frontmatter prose (relationship-vocabulary.md
 * §Situations) and this plugin places their renders:
 *
 * 1. lifts an authored `## To-do` section (heading to next h2) out of the
 *    tree, and renders every `* * *` as the dinkus;
 * 2. on a shaped page (`situation.resulting` is prose) injects
 *    `<Situation end="initiating" />` after any leading imports and opening
 *    demo, and `<RelatedPatterns slug resulting />` before the first tail
 *    heading (or at the end), which renders the passage over the typed index
 *    and the sequence appearances (`showRelated: false` folds the index only);
 * 3. on a page not yet migrated (`situation.resulting` is a clause list, or
 *    absent) keeps the earlier renders: `<Consequences />` before
 *    `## Resources & references`, then `<SequenceAppearances />` and
 *    `<RelatedPatterns />` at the foot;
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
/** The sections that may follow the connections passage, in the order the
 * rule lists them. The passage goes before whichever comes first. */
const TAIL_HEADINGS = ['Related components', 'Research on this pattern', RESOURCES_HEADING, TODO_HEADING];

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

function boolAttr(name: string, value: boolean): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: String(value),
      data: {
        estree: {
          type: 'Program',
          sourceType: 'module',
          body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value, raw: String(value) } }],
        },
      },
    },
  };
}

/** The opening demo (rule step 0) and any `import` lines sit above the
 * opening paragraph; the paragraph goes after that leading run. */
function openingIndex(tree: Root): number {
  let i = 0;
  while (i < tree.children.length) {
    const n = tree.children[i];
    const leading = n.type === 'mdxjsEsm' || (n.type === 'mdxJsxFlowElement' && n.name === 'Demo');
    if (!leading) break;
    i++;
  }
  return i;
}

// `frontmatter.situation.<field>` as an expression attribute. Astro's MDX
// integration exports `frontmatter` at module scope, so the JSX can read it.
function situationAttr(name: string, field: string): MdxJsxAttribute {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: `frontmatter.situation.${field}`,
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
                property: { type: 'Identifier', name: field },
              },
            },
          ],
        },
      },
    },
  };
}

/** A `* * *` in a pattern body is Alexander's section mark (the dinkus): it
 * separates the opening from the problem, and the instruction from the
 * passage, whose own mark RelatedPatterns renders. */
const DINKUS = '❖';

function renderDinkuses(tree: Root): void {
  tree.children = tree.children.map((n) =>
    n.type === 'thematicBreak'
      ? ({ type: 'paragraph', data: { hProperties: { className: ['dinkus'] } }, children: [{ type: 'text', value: DINKUS }] } as RootContent)
      : n,
  );
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
    const situation = fm.situation as { initiating?: unknown; resulting?: unknown } | undefined;

    const todo = liftTodo(tree);
    renderDinkuses(tree);
    const shaped = typeof situation?.resulting === 'string';
    const hasConsequences = Array.isArray(situation?.resulting) && situation.resulting.length > 0;

    if (shaped) {
      // The passage is authored content and always renders; `showRelated:
      // false` folds away only the typed index beneath it.
      const related = jsx('RelatedPatterns', [
        stringAttr('slug', slug),
        situationAttr('resulting', 'resulting'),
        ...(fm.showRelated === false ? [boolAttr('index', false)] : []),
      ]);
      const at = tree.children.findIndex((n) => TAIL_HEADINGS.some((h) => isH2(n, h)));
      if (at === -1) tree.children.push(related);
      else tree.children.splice(at, 0, related);
      if (typeof situation?.initiating === 'string') {
        const opening = jsx('Situation', [situationAttr('text', 'initiating'), stringAttr('end', 'initiating')]);
        tree.children.splice(openingIndex(tree), 0, opening);
      }
    } else {
      if (hasConsequences) {
        const consequences = jsx('Consequences', [situationAttr('resulting', 'resulting')]);
        const at = tree.children.findIndex((n) => isH2(n, RESOURCES_HEADING));
        if (at === -1) tree.children.push(consequences);
        else tree.children.splice(at, 0, consequences);
      }
      tree.children.push(jsx('SequenceAppearances', [stringAttr('slug', slug)]));
      if (fm.showRelated !== false) tree.children.push(jsx('RelatedPatterns', [stringAttr('slug', slug)]));
    }

    if (todo.length > 0) tree.children.push(jsx('Residue', [], todo));
  };
}
