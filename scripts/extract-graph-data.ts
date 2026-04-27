import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const storiesDir = join(rootDir, 'src/stories');
const outputPath = join(rootDir, 'src/pattern-graph.json');
const activityLevelsPath = join(rootDir, 'src/activity-levels.json');

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
  generativeProfile?: GenerativeProfile;
}

interface GenerativeProfile {
  operatesOn: string;
  produces: string;
  enacts: string;
}

type EdgeType =
  | 'precedes'
  | 'follows'
  | 'enables'
  | 'instantiates'
  | 'complements'
  | 'tangential'
  | 'alternative'
  | 'recommends'
  | 'related'
  | 'enacts';

interface SituationalHint {
  question: string;
  branch: string;
}

interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  extractedFrom?: string;
  situationalHints?: SituationalHint[];
}

interface ActivityLevel {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'atomic-category': string;
  'mediation': string | null;
}

interface TypedLink {
  target: string;
  type: EdgeType;
  label?: string;
  extractedFrom?: string;
  /** When true, the listed pattern is the source and the page is the target. */
  inverse?: boolean;
  /** Raw header text when the link sat under a thematic (non-typed) `### ` header. */
  thematicHeader?: string;
}

const HEADER_TYPE_MAP: Record<string, EdgeType> = {
  'Precursors': 'precedes',
  'Precursor patterns': 'precedes',
  'Follow-ups': 'precedes',
  'Follow-up patterns': 'precedes',
  'Follow-ups & Complements': 'precedes',
  'Complementary': 'complements',
  'Complements': 'complements',
  'Complementary patterns': 'complements',
  'Tangentially related': 'tangential',
  'Alternatives': 'alternative',
  'Containers and primitives': 'enables',
  'Containers': 'enables',
  'Related primitives': 'enables',
  'Mechanisms': 'enables',
  'Components': 'enables',
  'Conversational primitives': 'enables',
  'Composed from': 'enables',
  'Used by': 'enables',
  'Foundation': 'instantiates',
  'Applied in': 'instantiates',
  'Implements this model': 'instantiates',
};

/**
 * Headers where the listed pattern is the *source* of the edge, not the page.
 * For `precedes`, precursor headers list the earlier move on the later page.
 * For `enables`, component/container headers list the building block on the
 * composite page.
 *
 * "Used by" is the exception: the page is the building block; the listed pattern
 * is the composite that uses it. Default direction is correct.
 */
const INVERSE_DIRECTION_HEADERS = new Set<string>([
  'Precursors',
  'Precursor patterns',
  'Containers and primitives',
  'Containers',
  'Related primitives',
  'Mechanisms',
  'Components',
  'Conversational primitives',
  'Composed from',
]);

function globMdx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.obsidian') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...globMdx(full));
    } else if (entry.endsWith('.mdx')) {
      results.push(full);
    }
  }
  return results;
}

function globStoriesTsx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...globStoriesTsx(full));
    } else if (entry.endsWith('.stories.tsx')) {
      results.push(full);
    }
  }
  return results;
}

function fileExists(filePath: string): boolean {
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function profileSidecarPath(mdxPath: string): string {
  return mdxPath.replace(/\.mdx$/, '.profile.ts');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGenerativeProfile(value: unknown): value is GenerativeProfile {
  return isRecord(value)
    && typeof value.operatesOn === 'string'
    && typeof value.produces === 'string'
    && typeof value.enacts === 'string';
}

async function loadGenerativeProfile(profilePath: string): Promise<GenerativeProfile> {
  let module: unknown;
  try {
    module = await import(pathToFileURL(profilePath).href);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to load generative profile sidecar ${profilePath}: ${message}`);
  }

  const profile = isRecord(module) ? module.profile : undefined;
  if (!isGenerativeProfile(profile)) {
    throw new Error(
      `Invalid generative profile sidecar ${profilePath}: expected export const profile with string operatesOn, produces, and enacts fields.`
    );
  }

  return {
    operatesOn: profile.operatesOn,
    produces: profile.produces,
    enacts: profile.enacts,
  };
}

function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, '')
    .replace(/[/ ]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function titleToCategory(title: string): string {
  const first = title.split('/')[0].replace(/\*/g, '').trim();
  const map: Record<string, string> = {
    'Operations':   'Operations',
    'Actions':      'Actions',
    'Activities':   'Activities',
    'Foundations':  'Foundations',
    'Qualities':    'Qualities',
    'Primitives':   'Primitives',
    'Components':   'Components',
    'Compositions': 'Compositions',
    'Patterns':     'Patterns',
    'Data visualization': 'Data Visualisation',
    'Visual elements':    'Visual Elements',
  };
  return map[first] ?? first;
}

function extractMetaTitle(content: string): string | null {
  const m = content.match(/<Meta\b[^>]*title=['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function extractMetaTags(content: string): string[] {
  const m = content.match(/<Meta\b[^>]*tags=\{(\[[^\]]*\])\}/);
  if (!m) return [];
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((r) => r[1]);
}

function extractStoriesTitle(content: string): string | null {
  const m = content.match(/^\s*title:\s*['"]([^'"]+)['"]/m);
  return m ? m[1] : null;
}

function extractStoriesTags(content: string): string[] {
  const m = content.match(/^\s*tags:\s*(\[[^\]]*\])/m);
  if (!m) return [];
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((r) => r[1]);
}

const LINK_PATTERN = /\.\.\/\?path=\/docs\/([a-z0-9][a-z0-9-]*)--docs/g;

function stripComments(content: string): string {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

/**
 * Find the `## Related patterns` section body — everything between that header and
 * the next `## ` (or EOF). Returns null when the section isn't present.
 */
function extractRelatedSection(content: string): string | null {
  const start = content.search(/^## Related patterns\s*$/m);
  if (start === -1) return null;
  const after = content.slice(start);
  const nextH2 = after.slice(1).search(/\n## /);
  return nextH2 === -1 ? after : after.slice(0, nextH2 + 1);
}

/** Strip `[text](url)` markdown links to plain text for header normalisation. */
function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
}

function normaliseHeaderToTag(header: string): string {
  return stripMarkdownLinks(header)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extract a per-line link annotation: text after ` — `, ` – `, or ` - ` following
 * the link. Em dash is the canonical form, but hyphens turn up in normal authoring;
 * accepting them stops a stylistic choice from silently dropping the annotation.
 * Only returned when the line contains exactly one link (otherwise the annotation
 * is ambiguous).
 */
function extractAnnotation(line: string): string | undefined {
  const linkCount = (line.match(LINK_PATTERN) || []).length;
  if (linkCount !== 1) return undefined;
  const m = line.match(/\)\s+[—–-]\s+(.+?)$/);
  return m ? m[1].trim() : undefined;
}

function findLinksInText(text: string): string[] {
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  LINK_PATTERN.lastIndex = 0;
  while ((m = LINK_PATTERN.exec(text)) !== null) ids.push(m[1]);
  return ids;
}

interface ParsedLinks {
  typed: TypedLink[];
  /** Tags collected per linked target from thematic-header subsections. */
  tagsByTarget: Map<string, Set<string>>;
}

function extractTypedLinks(rawContent: string): ParsedLinks {
  const content = stripComments(rawContent);
  const typed: TypedLink[] = [];
  const tagsByTarget = new Map<string, Set<string>>();

  const related = extractRelatedSection(content);
  const seenInRelated = new Set<string>();

  if (related) {
    // Split on `### ` headers. The first chunk is text before any subsection.
    const parts = related.split(/^### /m);
    const preface = parts[0];

    // Links in the section body but outside any `### ` subsection → flat-list `related`.
    for (const id of findLinksInText(preface)) {
      const key = `${id}|related`;
      if (seenInRelated.has(key)) continue;
      seenInRelated.add(key);
      typed.push({ target: id, type: 'related' });
    }

    for (let i = 1; i < parts.length; i++) {
      const chunk = parts[i];
      const headerEnd = chunk.indexOf('\n');
      const headerLine = headerEnd === -1 ? chunk : chunk.slice(0, headerEnd);
      const body = headerEnd === -1 ? '' : chunk.slice(headerEnd + 1);
      const headerText = headerLine.trim();
      const headerKey = stripMarkdownLinks(headerText).trim();
      const mappedType = HEADER_TYPE_MAP[headerKey];

      const lines = body.split('\n');
      for (const line of lines) {
        const ids = findLinksInText(line);
        if (ids.length === 0) continue;
        const annotation = extractAnnotation(line);
        for (const id of ids) {
          if (mappedType) {
            const key = `${id}|${mappedType}`;
            if (seenInRelated.has(key)) continue;
            seenInRelated.add(key);
            typed.push({
              target: id,
              type: mappedType,
              label: annotation,
              extractedFrom: `header:"${headerText}"`,
              ...(INVERSE_DIRECTION_HEADERS.has(headerKey) ? { inverse: true } : {}),
            });
          } else {
            // Thematic subcategory — emit `related`. Prefer the per-line annotation
            // (more specific) over the header text (fallback).
            const key = `${id}|related`;
            if (!seenInRelated.has(key)) {
              seenInRelated.add(key);
              typed.push({
                target: id,
                type: 'related',
                label: annotation ?? headerText,
                thematicHeader: headerText,
              });
            }
            const tag = normaliseHeaderToTag(headerText);
            if (tag) {
              if (!tagsByTarget.has(id)) tagsByTarget.set(id, new Set());
              tagsByTarget.get(id)!.add(tag);
            }
          }
        }
      }
    }
  }

  // Links anywhere else in the document (prose, anatomy, variants) → `related`.
  const seenAnywhere = new Set(typed.map((t) => `${t.target}|${t.type}`));
  for (const id of findLinksInText(content)) {
    const key = `${id}|related`;
    if (seenAnywhere.has(key)) continue;
    // Only emit a prose `related` if the target hasn't already been typed any way.
    const alreadyTyped = typed.some((t) => t.target === id);
    if (alreadyTyped) continue;
    seenAnywhere.add(key);
    typed.push({ target: id, type: 'related' });
  }

  // Document-wide annotation pass: any bullet line anywhere in the doc that links to
  // a known target with a `— ` annotation overrides the existing label. Lets the
  // author put a labelled bullet wherever it editorially fits (e.g. under a topical
  // H3 within a `## Foo` section), not only inside `## Related patterns`.
  const allLines = content.split('\n');
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (!/^\s*[-*]\s/.test(line)) continue;
    const ids = findLinksInText(line);
    if (ids.length !== 1) continue;
    const annotation = extractAnnotation(line);
    if (!annotation) continue;
    const id = ids[0];
    for (const link of typed) {
      if (link.target !== id) continue;
      // Only override when the existing label is missing or is a header-text fallback
      // (i.e. the link sat under a thematic header without a per-line annotation).
      if (!link.label || (link.thematicHeader && link.label === link.thematicHeader)) {
        link.label = annotation;
      }
    }
  }

  return { typed, tagsByTarget };
}

// --- Mermaid decision-tree extraction (Phase 3 — `recommends` edges) ---

interface MermaidNode { id: string; label: string; isQuestion: boolean }
interface MermaidEdge { from: string; to: string; label?: string }
interface MermaidGraph { nodes: Map<string, MermaidNode>; edges: MermaidEdge[] }

const NODE_DEF_RE = /\b([A-Za-z][A-Za-z0-9_]*)(\[[^\]\n]*\]|\{[^}\n]*\}|\(\([^)\n]*\)\)|\([^)\n]*\))/g;

function unwrapNodeLabel(wrapped: string): { label: string; isQuestion: boolean } {
  const isQuestion = wrapped.startsWith('{');
  let inner: string;
  if (wrapped.startsWith('((')) inner = wrapped.slice(2, -2);
  else inner = wrapped.slice(1, -1);
  inner = inner.trim().replace(/^"(.*)"$/s, '$1').trim();
  return { label: inner, isQuestion };
}

function parseMermaid(chart: string): MermaidGraph {
  const nodes = new Map<string, MermaidNode>();
  const edges: MermaidEdge[] = [];

  const lines = chart.split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('%%')) continue;
    if (/^flowchart\s/i.test(line)) continue;
    if (/^(style|classDef|class|linkStyle|subgraph|end)\b/i.test(line)) continue;

    // Capture inline node definitions.
    NODE_DEF_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = NODE_DEF_RE.exec(line)) !== null) {
      const id = m[1];
      const { label, isQuestion } = unwrapNodeLabel(m[2]);
      if (!nodes.has(id)) {
        nodes.set(id, { id, label, isQuestion });
      } else {
        // Prefer the first label seen but upgrade isQuestion if any def uses {…}.
        const existing = nodes.get(id)!;
        if (isQuestion) existing.isQuestion = true;
        if (!existing.label && label) existing.label = label;
      }
    }

    // Replace node defs with their bare ids so edge tokenisation is straightforward.
    const stripped = line.replace(NODE_DEF_RE, '$1');

    // Walk the line for `-->` (optionally followed by `|label|`) and split into segments.
    const edgeSepRe = /-->\s*(?:\|([^|]+)\|)?\s*/g;
    const segments: string[] = [];
    const labels: (string | undefined)[] = [];
    let lastIndex = 0;
    let mm: RegExpExecArray | null;
    while ((mm = edgeSepRe.exec(stripped)) !== null) {
      segments.push(stripped.slice(lastIndex, mm.index).trim());
      const lbl = mm[1]?.trim().replace(/^"(.*)"$/s, '$1').trim();
      labels.push(lbl || undefined);
      lastIndex = edgeSepRe.lastIndex;
    }
    segments.push(stripped.slice(lastIndex).trim());
    if (segments.length < 2) continue;

    for (let i = 0; i < segments.length - 1; i++) {
      const fromId = segments[i].split(/\s+/).pop() ?? '';
      const toId = segments[i + 1].split(/\s+/)[0];
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(fromId)) continue;
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(toId)) continue;
      // Bare references with no label should still register a node entry so traversal can proceed.
      if (!nodes.has(fromId)) nodes.set(fromId, { id: fromId, label: fromId, isQuestion: false });
      if (!nodes.has(toId)) nodes.set(toId, { id: toId, label: toId, isQuestion: false });
      edges.push({ from: fromId, to: toId, label: labels[i] });
    }
  }

  return { nodes, edges };
}

const MERMAID_BLOCK_RE = /<MermaidDiagram\s+chart=\{`([\s\S]*?)`\}\s*\/>/g;

function extractMermaidCharts(content: string): string[] {
  const charts: string[] = [];
  let m: RegExpExecArray | null;
  MERMAID_BLOCK_RE.lastIndex = 0;
  while ((m = MERMAID_BLOCK_RE.exec(content)) !== null) charts.push(m[1]);
  return charts;
}

interface TreeConfig {
  /** Stable identifier used in `extractedFrom: 'decision-tree:<treeId>'`. */
  treeId: string;
  /** Index of the `<MermaidDiagram>` block in the source MDX (0 = first). */
  chartIndex?: number;
  /** Map of leaf-node label text to target pattern id. Leaves not listed here are skipped. */
  leaves: Record<string, string>;
}

/**
 * Curated decision-tree configs, keyed by source pattern id (the page that contains the tree).
 *
 * Leaf labels are matched verbatim against the parsed Mermaid node labels. Trees and leaves
 * that resolve to no current pattern page are omitted — this is the "skip leaves that don't
 * map" branch of the Phase 3 plan.
 */
const DECISION_TREES: Record<string, TreeConfig[]> = {
  'actions-application-deletion': [
    {
      treeId: 'deletion',
      leaves: {
        'No confirmation (with undo)': 'operations-undo',
        'Inline confirmation': 'operations-inline-confirmation',
        'Modal confirmation': 'actions-application-dialog',
      },
    },
  ],
  'actions-coordination-notification': [
    {
      treeId: 'notification',
      leaves: {
        'Dialog': 'actions-application-dialog',
        'Callout': 'operations-callout',
        'Toast': 'operations-toast',
      },
    },
  ],
  'actions-navigation-overview': [
    {
      treeId: 'navigation-overview',
      leaves: {
        'Pan and zoom': 'actions-navigation-pan-and-zoom',
        'Step by step': 'actions-navigation-step-by-step',
        'Pyramid': 'actions-navigation-pyramid',
        'Multilevel tree': 'actions-navigation-multilevel-tree',
        'Flat navigation': 'actions-navigation-flat-navigation',
        'Fully connected': 'actions-navigation-fully-connected',
        'Hub and spoke': 'actions-navigation-hub-and-spoke',
        'Overview & Detail': 'actions-navigation-overview-and-detail',
      },
    },
  ],
  'actions-application-form': [
    {
      treeId: 'form-control',
      chartIndex: 1, // second <MermaidDiagram> — "Choosing a control"
      leaves: {
        'Tabs': 'operations-tabs',
        'Checkbox': 'operations-checkbox',
        'Dropdown': 'actions-coordination-dropdown',
      },
    },
  ],
};

interface ResolvedPath {
  leafTargetId: string;
  hints: SituationalHint[];
}

/**
 * Walk the parsed Mermaid graph from each root (a node with no incoming edges) to every leaf
 * (a node with no outgoing edges). At each transition, if the *from* node is a question
 * (`{…}` shape or its label ends with `?`), record `{question, branch}` where branch is the
 * outgoing edge's label (`-->|…|`). Leaves are resolved against the curated map; unresolved
 * leaves are dropped.
 */
/**
 * Some Mermaid trees express branches as intermediate nodes rather than as `-->|label|` edge
 * labels — e.g. Deletion's `A[Is the deletion reversible?] --> B[Yes]` followed by `B --> D`.
 * Collapse such intermediates into the predecessor's outgoing edge label so the traversal
 * sees a uniform `(question) --[branch]--> (next)` structure.
 *
 * A node qualifies as a branch intermediate when: it isn't itself a question, it sits on a
 * single in/out edge, the inbound edge has no label, and its predecessor is a question.
 */
function isQuestionNode(node: MermaidNode): boolean {
  return node.isQuestion || /\?\s*$/.test(node.label);
}

function collapseBranchNodes(graph: MermaidGraph, leafMap: Record<string, string>): MermaidGraph {
  const incoming = new Map<string, MermaidEdge[]>();
  const outgoing = new Map<string, MermaidEdge[]>();
  for (const id of graph.nodes.keys()) {
    incoming.set(id, []);
    outgoing.set(id, []);
  }
  for (const e of graph.edges) {
    incoming.get(e.to)!.push(e);
    outgoing.get(e.from)!.push(e);
  }

  const collapse = new Set<string>();
  for (const node of graph.nodes.values()) {
    if (isQuestionNode(node)) continue;
    if (node.label in leafMap) continue;
    const inEdges = incoming.get(node.id) ?? [];
    const outEdges = outgoing.get(node.id) ?? [];
    if (inEdges.length !== 1 || outEdges.length !== 1) continue;
    const inEdge = inEdges[0];
    if (inEdge.label) continue;
    const pred = graph.nodes.get(inEdge.from);
    if (!pred || !isQuestionNode(pred)) continue;
    if (!node.label) continue;
    collapse.add(node.id);
  }

  const newNodes = new Map<string, MermaidNode>();
  for (const node of graph.nodes.values()) {
    if (!collapse.has(node.id)) newNodes.set(node.id, node);
  }
  const newEdges: MermaidEdge[] = [];
  for (const e of graph.edges) {
    if (collapse.has(e.from)) continue; // handled when its inbound edge is processed
    if (collapse.has(e.to)) {
      const intermediate = graph.nodes.get(e.to)!;
      const out = outgoing.get(e.to)![0];
      newEdges.push({ from: e.from, to: out.to, label: intermediate.label });
    } else {
      newEdges.push(e);
    }
  }
  return { nodes: newNodes, edges: newEdges };
}

function walkPaths(rawGraph: MermaidGraph, leafMap: Record<string, string>): ResolvedPath[] {
  const graph = collapseBranchNodes(rawGraph, leafMap);
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, MermaidEdge[]>();
  for (const id of graph.nodes.keys()) {
    incoming.set(id, 0);
    outgoing.set(id, []);
  }
  for (const e of graph.edges) {
    incoming.set(e.to, (incoming.get(e.to) ?? 0) + 1);
    outgoing.get(e.from)!.push(e);
  }
  const roots = [...graph.nodes.keys()].filter((id) => (incoming.get(id) ?? 0) === 0);
  const paths: ResolvedPath[] = [];

  function visit(nodeId: string, hints: SituationalHint[], visited: Set<string>) {
    if (visited.has(nodeId)) return; // avoid cycles
    const next = outgoing.get(nodeId) ?? [];
    if (next.length === 0) {
      // leaf
      const node = graph.nodes.get(nodeId)!;
      const target = leafMap[node.label];
      if (target) paths.push({ leafTargetId: target, hints: [...hints] });
      return;
    }
    const node = graph.nodes.get(nodeId)!;
    const newVisited = new Set(visited);
    newVisited.add(nodeId);
    for (const edge of next) {
      const stepHints = isQuestionNode(node)
        ? [...hints, { question: node.label, branch: edge.label ?? '' }]
        : hints;
      visit(edge.to, stepHints, newVisited);
    }
  }

  for (const root of roots) visit(root, [], new Set());
  return paths;
}

interface RecommendsCollection {
  edges: Edge[];
  /** Per-tree counts for verification logging. */
  resolvedByTree: Map<string, number>;
  unresolvedLeaves: Map<string, Set<string>>;
}

function extractDecisionTreeEdges(
  sourcePatternId: string,
  content: string,
  collection: RecommendsCollection,
): void {
  const configs = DECISION_TREES[sourcePatternId];
  if (!configs) return;
  const charts = extractMermaidCharts(content);
  if (charts.length === 0) return;

  for (const config of configs) {
    const idx = config.chartIndex ?? 0;
    const chart = charts[idx];
    if (!chart) continue;
    const graph = parseMermaid(chart);
    const paths = walkPaths(graph, config.leaves);

    // Track which mermaid leaf labels were resolved so unresolved ones can be reported.
    const seenLeafLabels = new Set<string>();
    for (const node of graph.nodes.values()) {
      const out = graph.edges.filter((e) => e.from === node.id);
      if (out.length === 0) seenLeafLabels.add(node.label);
    }
    const unresolved = new Set<string>();
    for (const lbl of seenLeafLabels) {
      if (!(lbl in config.leaves)) unresolved.add(lbl);
    }
    if (unresolved.size > 0) collection.unresolvedLeaves.set(config.treeId, unresolved);

    for (const path of paths) {
      collection.edges.push({
        source: sourcePatternId,
        target: path.leafTargetId,
        type: 'recommends',
        extractedFrom: `decision-tree:${config.treeId}`,
        situationalHints: path.hints,
      });
    }
    collection.resolvedByTree.set(config.treeId, paths.length);
  }
}

function deriveActivityLevel(title: string): Pick<ActivityLevel, 'activity-level' | 'lifecycle-stage'> {
  const parts = title.split('/');
  const top = parts[0];
  if (top === 'Operations') return { 'activity-level': 'operation', 'lifecycle-stage': null };
  if (top === 'Actions') {
    const stage = parts[1]?.toLowerCase().replace(/\s+/g, '-') ?? null;
    const validStages = ['seeking', 'evaluation', 'sense-making', 'application', 'coordination', 'conversation'];
    return {
      'activity-level': 'action',
      'lifecycle-stage': validStages.includes(stage ?? '') ? stage : null,
    };
  }
  if (top === 'Activities') return { 'activity-level': 'activity', 'lifecycle-stage': null };
  return { 'activity-level': 'cross-cutting', 'lifecycle-stage': null };
}

const nodeMap = new Map<string, Node>();
const nodeTags = new Map<string, Set<string>>();
const fileLinks = new Map<string, TypedLink[]>();
const activityData = new Map<string, ActivityLevel>();
const recommendsCollection: RecommendsCollection = {
  edges: [],
  resolvedByTree: new Map(),
  unresolvedLeaves: new Map(),
};

const mdxFiles = globMdx(storiesDir).filter((f) => !f.endsWith('Intro.mdx'));

for (const filePath of mdxFiles) {
  const content = readFileSync(filePath, 'utf-8');
  let title = extractMetaTitle(content);
  let storiesTags: string[] = [];

  if (!title) {
    const base = filePath.replace(/\.mdx$/, '.stories.tsx');
    try {
      const storiesContent = readFileSync(base, 'utf-8');
      title = extractStoriesTitle(storiesContent);
      storiesTags = extractStoriesTags(storiesContent);
    } catch {
      // no co-located stories file
    }
  }

  if (!title) continue;

  const category = title.split('/')[0].replace(/\*/g, '').trim();
  const shortTitle = title.split('/').pop()!.replace(/\*/g, '').trim();
  if (category === 'Concepts' || category === 'Introduction') continue;
  const provisionalId = titleToId(title);
  if (shortTitle === 'Overview' && !DECISION_TREES[provisionalId]) continue;

  const id = provisionalId;
  const cat = titleToCategory(title);
  const path = `../?path=/docs/${id}--docs`;

  const node: Node = nodeMap.get(id) ?? { id, title: shortTitle, category: cat, path };
  const profilePath = profileSidecarPath(filePath);
  if (fileExists(profilePath)) {
    node.generativeProfile = await loadGenerativeProfile(profilePath);
  }
  nodeMap.set(id, node);

  const mdxTags = extractMetaTags(content);
  const tags = mdxTags.length > 0 ? mdxTags : storiesTags;
  const atLevelTag = tags.find((t) => t.startsWith('activity-level:'));
  const atomicTag = tags.find((t) => t.startsWith('atomic:'));
  const lifecycleTag = tags.find((t) => t.startsWith('lifecycle:'));
  const mediationTag = tags.find((t) => t.startsWith('mediation:'));

  const derived = deriveActivityLevel(title);
  const atomicCategory = atomicTag ? atomicTag.split(':')[1] : category.toLowerCase();

  activityData.set(id, {
    'activity-level': atLevelTag ? atLevelTag.split(':')[1] : derived['activity-level'],
    'lifecycle-stage': lifecycleTag ? lifecycleTag.split(':')[1] : derived['lifecycle-stage'],
    'atomic-category': atomicCategory,
    'mediation': mediationTag ? mediationTag.split(':')[1] : null,
  });

  const { typed, tagsByTarget } = extractTypedLinks(content);
  if (typed.length > 0) fileLinks.set(id, typed);
  for (const [targetId, tagSet] of tagsByTarget) {
    if (!nodeTags.has(targetId)) nodeTags.set(targetId, new Set());
    for (const t of tagSet) nodeTags.get(targetId)!.add(t);
  }

  extractDecisionTreeEdges(id, content, recommendsCollection);
}

for (const filePath of globStoriesTsx(storiesDir)) {
  const mdxPath = filePath.replace(/\.stories\.tsx$/, '.mdx');
  try {
    statSync(mdxPath);
    continue;
  } catch {
    // no MDX — process this stories file
  }

  const content = readFileSync(filePath, 'utf-8');
  const title = extractStoriesTitle(content);
  if (!title) continue;

  const category = title.split('/')[0].replace(/\*/g, '').trim();
  const shortTitle = title.split('/').pop()!.replace(/\*/g, '').trim();
  if (category === 'Concepts' || category === 'Introduction') continue;
  if (shortTitle === 'Overview') continue;

  const id = titleToId(title);
  const cat = titleToCategory(title);
  const path = `../?path=/docs/${id}--docs`;

  if (!nodeMap.has(id)) {
    nodeMap.set(id, { id, title: shortTitle, category: cat, path });
  }

  if (!activityData.has(id)) {
    const tags = extractStoriesTags(content);
    const atLevelTag = tags.find((t) => t.startsWith('activity-level:'));
    const atomicTag = tags.find((t) => t.startsWith('atomic:'));
    const lifecycleTag = tags.find((t) => t.startsWith('lifecycle:'));
    const mediationTag = tags.find((t) => t.startsWith('mediation:'));
    const derived = deriveActivityLevel(title);
    activityData.set(id, {
      'activity-level': atLevelTag ? atLevelTag.split(':')[1] : derived['activity-level'],
      'lifecycle-stage': lifecycleTag ? lifecycleTag.split(':')[1] : derived['lifecycle-stage'],
      'atomic-category': atomicTag ? atomicTag.split(':')[1] : cat.toLowerCase(),
      'mediation': mediationTag ? mediationTag.split(':')[1] : null,
    });
  }
}

// --- Build edges ---
//
// The graph is purely derived from the MDX. Labels are extracted from the per-link
// `— ` text on each run; no prior-graph carry-over. Manual label authoring writes
// back into the source MDX (see scripts/write-labels.ts), so the next extraction
// picks it up the same way.
type EdgeKey = string; // `source|target|type`
const edgeMap = new Map<EdgeKey, Edge>();

function addEdge(edge: Edge) {
  const key = `${edge.source}|${edge.target}|${edge.type}`;
  if (edgeMap.has(key)) return;
  edgeMap.set(key, edge);
}

function isPatternToQualityLink(sourceId: string, targetId: string): boolean {
  const sourceNode = nodeMap.get(sourceId);
  return sourceNode !== undefined
    && sourceNode.category !== 'Qualities'
    && targetId.startsWith('qualities-');
}

for (const [sourceId, links] of fileLinks.entries()) {
  for (const link of links) {
    if (!nodeMap.has(link.target)) continue;
    if (sourceId === link.target) continue;
    if (isPatternToQualityLink(sourceId, link.target)) {
      addEdge({
        source: sourceId,
        target: link.target,
        type: 'enacts',
        ...(link.label !== undefined ? { label: link.label } : {}),
        extractedFrom: 'quality-target',
      });
      continue;
    }
    const [src, tgt] = link.inverse ? [link.target, sourceId] : [sourceId, link.target];
    addEdge({
      source: src,
      target: tgt,
      type: link.type,
      ...(link.label !== undefined ? { label: link.label } : {}),
      ...(link.extractedFrom !== undefined ? { extractedFrom: link.extractedFrom } : {}),
    });
  }
}

// --- Promote pattern → quality edges to `enacts` ---
//
// An edge is `enacts` when the source is a non-quality pattern and the target is a
// `qualities-*` page. Header-derived typing (e.g. "Foundation") is overridden — the
// quality-target signal is stronger than any header. Quality → quality edges keep
// their original type (typically `related`).
{
  const promoted: Edge[] = [];
  for (const [key, edge] of edgeMap) {
    const sourceNode = nodeMap.get(edge.source);
    if (!sourceNode) continue;
    if (sourceNode.category === 'Qualities') continue;
    if (!edge.target.startsWith('qualities-')) continue;
    if (edge.type === 'enacts') continue;
    edgeMap.delete(key);
    promoted.push({
      ...edge,
      type: 'enacts',
      extractedFrom: 'quality-target',
    });
  }
  for (const e of promoted) addEdge(e);
}

// --- Dedup pass: where the same (source, target) has both a typed edge and a `related`
// edge, drop the `related`. Multiple typed edges between the same pair are kept. ---
{
  const byPair = new Map<string, Edge[]>();
  for (const e of edgeMap.values()) {
    const k = `${e.source}|${e.target}`;
    if (!byPair.has(k)) byPair.set(k, []);
    byPair.get(k)!.push(e);
  }
  for (const [, list] of byPair) {
    const hasTyped = list.some((e) => e.type !== 'related');
    if (!hasTyped) continue;
    for (const e of list) {
      if (e.type === 'related') {
        edgeMap.delete(`${e.source}|${e.target}|${e.type}`);
      }
    }
  }
}

const edges: Edge[] = [...edgeMap.values()];

// --- Append `recommends` edges from decision-tree extraction ---
//
// These bypass the (source, target, type) dedup path because multiple paths through the same
// tree can reach the same leaf via different question/branch pairs (e.g. Notification → Toast
// is reached both via "communicates status" and via "alert / dismissable"). Each path becomes
// its own edge so the situational hints stay separable.
for (const recEdge of recommendsCollection.edges) {
  if (!nodeMap.has(recEdge.target)) continue;
  if (recEdge.source === recEdge.target) continue;
  edges.push(recEdge);
}

// --- Apply node tags ---
for (const [targetId, tagSet] of nodeTags) {
  const node = nodeMap.get(targetId);
  if (!node) continue;
  node.tags = [...tagSet].sort();
}

const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
const nodes = [...nodeMap.values()].filter((n) => connected.has(n.id));
const output = { nodes, edges };

writeFileSync(outputPath, JSON.stringify(output, null, 2));

const activityLevelsNodes: Record<string, ActivityLevel> = {};
for (const node of nodes) {
  const data = activityData.get(node.id);
  if (data) activityLevelsNodes[node.id] = data;
}
const activityLevelsOutput = {
  _note: 'Generated by scripts/extract-graph-data.ts — do not edit by hand. Source of truth is each story file\'s Meta tags.',
  nodes: activityLevelsNodes,
};
writeFileSync(activityLevelsPath, JSON.stringify(activityLevelsOutput, null, 2));

// --- Axis sanity check (advisory) ---
//
// Coarse altitude proxy from category folder: activities > actions > operations.
// Foundations and Qualities are cross-cutting and skipped.
const ALTITUDE: Record<string, number> = {
  'Activities': 3,
  'Actions': 2,
  'Operations': 1,
};
function altitudeOf(id: string): number | null {
  const cat = nodeMap.get(id)?.category;
  if (!cat) return null;
  return ALTITUDE[cat] ?? null;
}

let sameAltitudeInstantiates = 0;
let crossTwoBandsComplements = 0;
for (const e of edges) {
  const sa = altitudeOf(e.source);
  const ta = altitudeOf(e.target);
  if (sa === null || ta === null) continue;
  if (e.type === 'instantiates' && sa === ta) {
    sameAltitudeInstantiates++;
  } else if (e.type === 'complements' && Math.abs(sa - ta) >= 2) {
    crossTwoBandsComplements++;
  }
}

// --- Logging ---
const typeCounts: Record<string, number> = {};
for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
const taggedNodes = nodes.filter((n) => n.tags && n.tags.length > 0).length;

console.log(`Nodes: ${nodes.length} (${taggedNodes} with tags)`);
console.log(`Edges: ${edges.length}`);
console.log(`  by type: ${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}=${c}`).join(', ')}`);
console.log(`Categories: ${[...new Set(nodes.map((n) => n.category))].sort().join(', ')}`);
if (recommendsCollection.resolvedByTree.size > 0) {
  console.log(`Decision-tree extraction:`);
  for (const [tree, count] of recommendsCollection.resolvedByTree) {
    const skipped = recommendsCollection.unresolvedLeaves.get(tree);
    const skippedNote = skipped && skipped.size > 0
      ? ` (skipped leaves: ${[...skipped].map((l) => `"${l}"`).join(', ')})`
      : '';
    console.log(`  ${tree}: ${count} recommends edge${count === 1 ? '' : 's'}${skippedNote}`);
  }
}
console.log(`Axis sanity check (advisory):`);
console.log(`  same-altitude instantiates: ${sameAltitudeInstantiates}`);
console.log(`  complements crossing 2 altitude bands: ${crossTwoBandsComplements}`);
console.log(`Output: ${outputPath}`);
console.log(`Activity levels: ${activityLevelsPath}`);
