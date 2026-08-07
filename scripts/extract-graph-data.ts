import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad } from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const patternsContentDir = join(rootDir, 'apps/patterns/src/content/patterns');
const outputPath = join(rootDir, 'apps/patterns/src/data/pattern-graph.json');
const outputPathLegacy = join(rootDir, 'packages/components/src/pattern-graph.json');
const activityLevelsPath = join(rootDir, 'apps/patterns/src/data/activity-levels.json');
const activityLevelsPathLegacy = join(rootDir, 'packages/components/src/activity-levels.json');

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
  role?: Role;
  group?: string;
  situation?: NodeSituation;
  /** Storybook docs ids from frontmatter `realised_by` — node metadata, never
   * edges (relationship-vocabulary.md §Component realisation). */
  realisedBy?: string[];
  seed?: true;
  /** Normalised from the two-level authoring shape (bare kind or {kind, ref}) so
   * a consumer handles one form. `built` never appears in frontmatter — it is
   * entailed here from `realisedBy`, so the claim has exactly one home. */
  evidence?: EvidenceEntry[];
}

const AUTHORABLE_EVIDENCE_KINDS = ['observed', 'literature', 'used'] as const;
type EvidenceKind = typeof AUTHORABLE_EVIDENCE_KINDS[number] | 'built';

interface EvidenceEntry {
  kind: EvidenceKind;
  /** Which `references/` entry backs a `literature` claim. */
  ref?: string;
}

// `umbrella` is retained as a deprecated alias of `collection` for back-compat during
// migration; both trigger the same `surveys` (member-collection) edge behaviour.
const VALID_ROLES = ['component', 'pattern', 'collection', 'umbrella', 'quality', 'foundation'] as const;
type Role = typeof VALID_ROLES[number];

type RoleSource = 'explicit' | 'inferred' | 'unset';

/** Node-side situation constructs (relationship-vocabulary.md §Situations). */
interface SituationClause {
  clause: string;
  setsUp?: string[];
}

interface NodeSituation {
  initiating?: string;
  resulting?: SituationClause[];
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
  | 'enacts'
  | 'surveys'
  | 'hosts'
  | 'serves';

interface SituationalHint {
  question: string;
  branch: string;
}

interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  /** Note authored from the target side (via an inverting alias: follows /
   * composed-of / instances). Serves the reader who walks the directed edge in
   * reverse; the renderer shows it on the target page. */
  incomingNote?: string;
  extractedFrom?: string;
  /** Derived, never authored edge-side: the source node's resulting-context
   * clause this edge renders (extractedFrom 'situation:resulting'). Rendered as
   * prose for judgement, never matched on — graph-relationship-model.md
   * §Epistemic stance. */
  situation?: string;
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
  /** Which authoring channel produced this link — for I6 cross-channel duplicate detection. */
  channel?: 'frontmatter' | 'inline' | 'component';
}

// --- Authoring vocabulary: alias → { canonical stored type, invert direction } ---
//
// See relationship-vocabulary.md §Authoring aliases and direction normalization.
// `recommends` is intentionally absent — it is not an authorable rel.
const ALIAS_TABLE = {
  precedes:      { type: 'precedes'     as EdgeType, invert: false },
  follows:       { type: 'precedes'     as EdgeType, invert: true  },  // alias: inverse reading
  enables:       { type: 'enables'      as EdgeType, invert: false },
  'composed-of': { type: 'enables'      as EdgeType, invert: true  },  // alias: P is the whole
  instantiates:  { type: 'instantiates' as EdgeType, invert: false },
  instances:     { type: 'instantiates' as EdgeType, invert: true  },  // alias: P is the genus
  variants:      { type: 'instantiates' as EdgeType, invert: true  },  // alias: same as instances
  complements:   { type: 'complements'  as EdgeType, invert: false },
  tangential:    { type: 'tangential'   as EdgeType, invert: false },
  alternative:   { type: 'alternative'  as EdgeType, invert: false },
  enacts:        { type: 'enacts'       as EdgeType, invert: false },
  surveys:       { type: 'surveys'      as EdgeType, invert: false },
  hosts:         { type: 'hosts'        as EdgeType, invert: false },
  'hosted-by':   { type: 'hosts'        as EdgeType, invert: true  },  // alias: P is the hosted move
  serves:        { type: 'serves'       as EdgeType, invert: false },  // pattern → foundation; no inverse alias — the pattern side carries the edge
  related:       { type: 'related'      as EdgeType, invert: false },
};

type AuthoringRel = keyof typeof ALIAS_TABLE;
const AUTHORABLE_RELS = new Set(Object.keys(ALIAS_TABLE));

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** The schema is the real gate (content.config.ts); this pass runs standalone via
 *  `npm run extract-graph`, so it warns and drops rather than trusting that a
 *  site build already rejected the file. */
function parseEvidence(fm: Record<string, unknown>, filePath: string, realisedBy: string[]): EvidenceEntry[] {
  const kinds: readonly string[] = AUTHORABLE_EVIDENCE_KINDS;
  const entries: EvidenceEntry[] = [];
  const raw = Array.isArray(fm.evidence) ? fm.evidence : [];

  for (const item of raw) {
    const kind = typeof item === 'string' ? item : isRecord(item) && typeof item.kind === 'string' ? item.kind : null;
    if (kind === null) {
      console.warn(`Evidence warning: ${filePath}: evidence entries must be a kind string or {kind, ref} — ignored`);
      continue;
    }
    if (kind === 'built') {
      console.warn(`Evidence warning: ${filePath}: built is derived from realised_by, not authored — ignored`);
      continue;
    }
    if (!kinds.includes(kind)) {
      console.warn(`Evidence warning: ${filePath}: unknown evidence kind "${kind}" — expected ${kinds.join(' | ')}; ignored`);
      continue;
    }
    const ref = isRecord(item) && typeof item.ref === 'string' ? item.ref : undefined;
    entries.push(ref !== undefined ? { kind: kind as EvidenceKind, ref } : { kind: kind as EvidenceKind });
  }

  if (realisedBy.length > 0 && !entries.some((e) => e.kind === 'built')) {
    entries.push({ kind: 'built' });
  }
  return entries;
}

/** Parse the frontmatter `situation:` block. Resulting entries are bare prose
 * strings or `{clause, sets-up: [slugs]}` objects; both normalise to clauses. */
function parseSituation(fm: Record<string, unknown>, sourcePath: string): NodeSituation | undefined {
  const raw = fm.situation;
  if (!raw) return undefined;
  if (!isRecord(raw)) {
    console.warn(`Situation warning: ${sourcePath}: situation must be a mapping — ignored`);
    return undefined;
  }
  const situation: NodeSituation = {};
  if (typeof raw.initiating === 'string' && raw.initiating.trim()) {
    situation.initiating = raw.initiating.trim();
  }
  if (raw.resulting !== undefined) {
    if (!Array.isArray(raw.resulting)) {
      console.warn(`Situation warning: ${sourcePath}: situation.resulting must be an array — ignored`);
    } else {
      const clauses: SituationClause[] = [];
      for (const entry of raw.resulting) {
        if (typeof entry === 'string' && entry.trim()) {
          clauses.push({ clause: entry.trim() });
        } else if (isRecord(entry) && typeof entry.clause === 'string' && entry.clause.trim()) {
          const setsUpRaw = entry['sets-up'];
          const setsUp = Array.isArray(setsUpRaw)
            ? setsUpRaw.filter((s): s is string => typeof s === 'string' && s.length > 0)
            : undefined;
          clauses.push({
            clause: entry.clause.trim(),
            ...(setsUp && setsUp.length > 0 ? { setsUp } : {}),
          });
        } else {
          console.warn(`Situation warning: ${sourcePath}: invalid resulting clause — ignored`);
        }
      }
      if (clauses.length > 0) situation.resulting = clauses;
    }
  }
  return situation.initiating || situation.resulting ? situation : undefined;
}

function isRole(value: string): value is Role {
  return (VALID_ROLES as readonly string[]).includes(value);
}

function extractFrontmatter(content: string): Record<string, unknown> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  try {
    return (yamlLoad(m[1]) as Record<string, unknown>) ?? {};
  } catch {
    return {};
  }
}

/** Composed from frontmatter facets rather than folders: role wins for
 *  qualities/foundations; domain names a domain corpus; otherwise the AT
 *  activity level. Section collections (no facets) read as cross-cutting. */
function categoryOf(role: string | undefined, activityLevel: string | null, domain: string | null): string {
  if (role === 'quality') return 'Qualities';
  if (role === 'foundation') return 'Foundations';
  if (domain === 'data-visualization') return 'Data Visualisation';
  if (activityLevel === 'operation') return 'Operations';
  if (activityLevel === 'action') return 'Actions';
  if (activityLevel === 'activity') return 'Activities';
  return 'Cross-cutting';
}


function stripComments(content: string): string {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

// --- Relationship extraction ---
//
// Three explicit channels (frontmatter, inline rel=, component props); the two
// judgement homes (situations, decision trees) emit their own edges elsewhere.

// `[text](/patterns/slug){rel="type"}` — {rel} must follow closing ) immediately.
const INLINE_REL_RE = /\[[^\]]*\]\(\/patterns\/([\w][\w/-]*)(?:#[^\s)]*)?(?:[^)]*)\)\{rel="([^"]+)"\}/g;
// <PatternRef slug="..." rel="..."> (attrs in any order)
const PATTERN_REF_RE = /<PatternRef\b([^>]*?)(?:\/?>|>[^<]*<\/PatternRef>)/g;
// <ComponentRef id="..." rel="..."> (attrs in any order)
const COMPONENT_REF_RE = /<ComponentRef\b([^>]*?)(?:\/?>|>[^<]*<\/ComponentRef>)/g;

function extractTagAttr(attrs: string, name: string): string | undefined {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]+)"`));
  return m?.[1];
}

function isRelEntry(v: unknown): v is string | { to: string; note?: string } {
  if (typeof v === 'string') return v.length > 0;
  return isRecord(v) && typeof v.to === 'string';
}

function parseRelFrontmatter(fm: Record<string, unknown>, sourcePath: string): TypedLink[] {
  const rels = fm.relationships;
  if (!rels || !isRecord(rels)) return [];
  const links: TypedLink[] = [];
  for (const [rel, entries] of Object.entries(rels)) {
    if (!AUTHORABLE_RELS.has(rel)) {
      console.warn(`I4 unknown rel: ${sourcePath}: "${rel}" in frontmatter relationships — ignored`);
      continue;
    }
    if (!Array.isArray(entries)) {
      console.warn(`Relationships warning: ${sourcePath}: rel "${rel}" must be an array — ignored`);
      continue;
    }
    const resolved = ALIAS_TABLE[rel as AuthoringRel];
    for (const entry of entries) {
      if (!isRelEntry(entry)) {
        console.warn(`Relationships warning: ${sourcePath}: invalid entry in rel "${rel}" — ignored`);
        continue;
      }
      const target = typeof entry === 'string' ? entry : entry.to;
      const note = typeof entry === 'object' ? entry.note : undefined;
      links.push({
        target,
        type: resolved.type,
        ...(note ? { label: note } : {}),
        extractedFrom: `frontmatter:${rel}`,
        ...(resolved.invert ? { inverse: true } : {}),
        channel: 'frontmatter',
      });
    }
  }
  return links;
}

function parseInlineRelLinks(content: string, sourcePath: string): TypedLink[] {
  const links: TypedLink[] = [];
  INLINE_REL_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = INLINE_REL_RE.exec(content)) !== null) {
    const rawSlug = m[1].replace(/\//g, '-').replace(/-+/g, '-');
    const rel = m[2];
    if (!AUTHORABLE_RELS.has(rel)) {
      console.warn(`I4 unknown rel: ${sourcePath}: rel="${rel}" on inline link to "${rawSlug}" — ignored`);
      continue;
    }
    const resolved = ALIAS_TABLE[rel as AuthoringRel];
    links.push({
      target: rawSlug,
      type: resolved.type,
      extractedFrom: `inline:${rel}`,
      ...(resolved.invert ? { inverse: true } : {}),
      channel: 'inline',
    });
  }
  return links;
}

function parseComponentRelAttrs(content: string, sourcePath: string): TypedLink[] {
  const links: TypedLink[] = [];

  PATTERN_REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = PATTERN_REF_RE.exec(content)) !== null) {
    const attrs = m[1];
    const slug = extractTagAttr(attrs, 'slug');
    const rel = extractTagAttr(attrs, 'rel');
    if (!slug || !rel) continue;
    if (!AUTHORABLE_RELS.has(rel)) {
      console.warn(`I4 unknown rel: ${sourcePath}: rel="${rel}" on <PatternRef slug="${slug}"> — ignored`);
      continue;
    }
    const resolved = ALIAS_TABLE[rel as AuthoringRel];
    const target = slug.replace(/\//g, '-').replace(/-+/g, '-');
    links.push({
      target,
      type: resolved.type,
      extractedFrom: `component:PatternRef`,
      ...(resolved.invert ? { inverse: true } : {}),
      channel: 'component',
    });
  }

  // <ComponentRef> carries no rel (relationship-vocabulary.md §Component
  // realisation). Components are not graph nodes, so such an edge could never
  // resolve — warn rather than drop it silently.
  COMPONENT_REF_RE.lastIndex = 0;
  while ((m = COMPONENT_REF_RE.exec(content)) !== null) {
    const attrs = m[1];
    const id = extractTagAttr(attrs, 'id');
    const rel = extractTagAttr(attrs, 'rel');
    if (!id || !rel) continue;
    console.warn(
      `Realisation warning: ${sourcePath}: rel="${rel}" on <ComponentRef id="${id}"> — ` +
      `prose ComponentRefs are citations; author the realisation claim in frontmatter realised_by`,
    );
  }

  return links;
}

function extractRelationships(
  fm: Record<string, unknown>,
  rawContent: string,
  sourceRole: Role | undefined,
  sourcePath: string,
): TypedLink[] {
  const content = stripComments(rawContent);
  const typed: TypedLink[] = [];

  // Explicit channels: frontmatter, inline rel=, component props.
  typed.push(...parseRelFrontmatter(fm, sourcePath));
  typed.push(...parseInlineRelLinks(content, sourcePath));
  typed.push(...parseComponentRelAttrs(content, sourcePath));

  // No structural auto-typing: untyped body links are citations and produce no
  // edge (I7, retired auto-typings — changelog 2026-07-11). `recommends` comes
  // from the decision-tree judgement home; `surveys` and `enacts` are authored.

  // Phase E — I6: warn on cross-channel duplicates (same target + type from different channels).
  const seen = new Map<string, string>(); // `target|type` → channel
  for (const link of typed) {
    const key = `${link.target}|${link.type}`;
    const ch = link.channel ?? 'unknown';
    const prev = seen.get(key);
    if (prev !== undefined && prev !== ch) {
      console.warn(`I6 duplicate: ${sourcePath}: "${link.type}" to "${link.target}" declared via '${prev}' and '${ch}'`);
    } else {
      seen.set(key, ch);
    }
  }

  return typed;
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

const DIAGRAM_BLOCK_RE = /<Diagram\b[^>]*?\bsource=\{`([\s\S]*?)`\}/g;

function extractDiagramSources(content: string): string[] {
  const charts: string[] = [];
  let m: RegExpExecArray | null;
  DIAGRAM_BLOCK_RE.lastIndex = 0;
  while ((m = DIAGRAM_BLOCK_RE.exec(content)) !== null) charts.push(m[1]);
  return charts;
}

interface TreeConfig {
  /** Stable identifier used in `extractedFrom: 'decision-tree:<treeId>'`. */
  treeId: string;
  /** Index of the `<Diagram>` block in the source MDX (0 = first). */
  chartIndex?: number;
  /** Map of leaf-node label text to target pattern id. Leaves not listed here are skipped. */
  leaves: Record<string, string>;
}

/**
 * Leaf labels are matched verbatim against the parsed Mermaid node labels; leaves
 * that resolve to no current pattern page are omitted from the map and reported.
 * Component leaves (primitives-*, components-*, etc.) silently skip at edge-build
 * time because component nodes are not in the graph.
 */
function parseDecisionTrees(fm: Record<string, unknown>, sourcePath: string): TreeConfig[] {
  const raw = fm['decision-trees'];
  if (!raw) return [];
  if (!Array.isArray(raw)) {
    console.warn(`Decision-tree warning: ${sourcePath}: decision-trees must be an array — ignored`);
    return [];
  }
  const configs: TreeConfig[] = [];
  for (const entry of raw) {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !isRecord(entry.leaves)) {
      console.warn(`Decision-tree warning: ${sourcePath}: entry needs an id and a leaves map — ignored`);
      continue;
    }
    const leaves: Record<string, string> = {};
    for (const [label, slug] of Object.entries(entry.leaves)) {
      if (typeof slug === 'string' && slug.length > 0) leaves[label] = slug;
      else console.warn(`Decision-tree warning: ${sourcePath}: leaf "${label}" needs a slug — ignored`);
    }
    const chartIndexRaw = entry['chart-index'];
    configs.push({
      treeId: entry.id,
      ...(typeof chartIndexRaw === 'number' ? { chartIndex: chartIndexRaw } : {}),
      leaves,
    });
  }
  return configs;
}

interface ResolvedPath {
  leafTargetId: string;
  hints: SituationalHint[];
}

function isQuestionNode(node: MermaidNode): boolean {
  return node.isQuestion || /\?\s*$/.test(node.label);
}

/**
 * Some Mermaid trees express branches as intermediate nodes rather than as `-->|label|` edge
 * labels — e.g. Deletion's `A[Is the deletion reversible?] --> B[Yes]` followed by `B --> D`.
 * Collapse such intermediates into the predecessor's outgoing edge label so the traversal
 * sees a uniform `(question) --[branch]--> (next)` structure.
 *
 * A node qualifies as a branch intermediate when: it isn't itself a question, it sits on a
 * single in/out edge, the inbound edge has no label, and its predecessor is a question.
 */
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

/**
 * Walk the parsed Mermaid graph from each root (a node with no incoming edges) to every leaf
 * (a node with no outgoing edges). At each transition, if the *from* node is a question
 * (`{…}` shape or its label ends with `?`), record `{question, branch}` where branch is the
 * outgoing edge's label (`-->|…|`). Leaves are resolved against the curated map; unresolved
 * leaves are dropped.
 */
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
  configs: TreeConfig[],
  collection: RecommendsCollection,
): void {
  if (configs.length === 0) return;
  const charts = extractDiagramSources(content);
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

const nodeMap = new Map<string, Node>();
const nodeTags = new Map<string, Set<string>>();
const roleSourceById = new Map<string, RoleSource>();
const fileLinks = new Map<string, TypedLink[]>();
const activityData = new Map<string, ActivityLevel>();
const recommendsCollection: RecommendsCollection = {
  edges: [],
  resolvedByTree: new Map(),
  unresolvedLeaves: new Map(),
};

// --- Process pattern-site content (frontmatter-based) ---
const patternMdxFiles = globMdx(patternsContentDir);
const groupById = new Map<string, string>();

for (const filePath of patternMdxFiles) {
  const content = readFileSync(filePath, 'utf-8');
  const fm = extractFrontmatter(content);

  const title = typeof fm.title === 'string' ? fm.title : null;
  if (!title) continue;

  // Identity is the filename stem: the content directory is flat, so the stem is
  // the canonical slug, route, graph node ID, and inter-page link target all at once.
  // Classification (activity level, lifecycle, domain, …) lives in frontmatter facets,
  // not in folders — see docs/specs/pattern-site.md.
  const id = filePath.slice(patternsContentDir.length + 1).replace(/\.mdx$/, '').split('/').pop()!;

  const roleValue = typeof fm.role === 'string' ? fm.role : undefined;
  const role: Role | undefined = roleValue && isRole(roleValue) ? roleValue : undefined;
  if (!role) console.warn(`Role metadata warning: ${filePath} has no valid role field`);

  const activityLevelRaw = typeof fm.activityLevel === 'string' ? fm.activityLevel : null;
  const domainRaw = typeof fm.domain === 'string' ? fm.domain : null;
  const cat = categoryOf(role, activityLevelRaw, domainRaw);

  const treeConfigs = parseDecisionTrees(fm, filePath);
  if (title.toLowerCase() === 'overview' && treeConfigs.length === 0) continue;

  const patternSitePath = `/patterns/${id}`;

  const node: Node = nodeMap.get(id) ?? { id, title, category: cat, path: patternSitePath };
  if (role) node.role = role;
  roleSourceById.set(id, role ? 'explicit' : 'unset');

  const situation = parseSituation(fm, filePath);
  if (situation) node.situation = situation;
  nodeMap.set(id, node);

  const atomicRaw = typeof fm.atomic === 'string' ? fm.atomic : null;
  const lifecycleRaw = typeof fm.lifecycle === 'string' ? fm.lifecycle : null;
  const mediationRaw = typeof fm.mediation === 'string' ? fm.mediation : null;
  if (typeof fm.group === 'string') {
    groupById.set(id, fm.group);
    node.group = fm.group;
  }

  let realisedBy: string[] = [];
  if (Array.isArray(fm.realised_by)) {
    realisedBy = fm.realised_by.filter((v): v is string => typeof v === 'string');
    if (realisedBy.length !== fm.realised_by.length) {
      console.warn(`Realisation warning: ${filePath}: realised_by entries must be Storybook docs-id strings — non-strings ignored`);
    }
    if (realisedBy.length > 0) node.realisedBy = realisedBy;
  }

  if (fm.seed === true) node.seed = true;
  const evidence = parseEvidence(fm, filePath, realisedBy);
  if (evidence.length > 0) node.evidence = evidence;

  activityData.set(id, {
    // Frontmatter is authoritative. Foundations, qualities, and section collections
    // carry no AT altitude — they read as cross-cutting.
    'activity-level': activityLevelRaw ?? 'cross-cutting',
    'lifecycle-stage': lifecycleRaw ?? null,
    'atomic-category': atomicRaw ?? cat.toLowerCase(),
    'mediation': mediationRaw,
  });

  const typed = extractRelationships(fm, content, role, filePath);
  if (typed.length > 0) fileLinks.set(id, typed);

  extractDecisionTreeEdges(id, content, treeConfigs, recommendsCollection);
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
  const existing = edgeMap.get(key);
  if (existing) {
    // A directed edge may be glossed from both ends (e.g. `A precedes B` and
    // `B follows A`), each note serving the reader arriving from that side.
    // Fill an empty note slot; never overwrite an authored one.
    if (edge.label !== undefined && existing.label === undefined) existing.label = edge.label;
    if (edge.incomingNote !== undefined && existing.incomingNote === undefined) existing.incomingNote = edge.incomingNote;
    if (edge.situation !== undefined && existing.situation === undefined) {
      existing.situation = edge.situation;
      existing.extractedFrom = edge.extractedFrom;
    }
    return;
  }
  edgeMap.set(key, edge);
}

for (const [sourceId, links] of fileLinks.entries()) {
  for (const link of links) {
    if (!nodeMap.has(link.target)) {
      // Authored links to unknown targets are typos or claims aimed outside
      // the graph (e.g. a component id in `relationships:` — realisation
      // claims belong in frontmatter `realised_by`).
      console.warn(`Relationships warning: ${sourceId}: ${link.type} target "${link.target}" names no known pattern — no edge emitted`);
      continue;
    }
    if (sourceId === link.target) continue;

    const [src, tgt] = link.inverse ? [link.target, sourceId] : [sourceId, link.target];
    // An inverting alias (follows / composed-of / instances) authors from the
    // target side, so its note is the edge's incoming note; otherwise outgoing.
    const noteKey = link.inverse ? 'incomingNote' : 'label';
    addEdge({
      source: src,
      target: tgt,
      type: link.type,
      ...(link.label !== undefined ? { [noteKey]: link.label } : {}),
      ...(link.extractedFrom !== undefined ? { extractedFrom: link.extractedFrom } : {}),
    });
  }
}

// --- Emit `precedes` edges from resulting-context clauses ---
//
// A judgement home emits its edges (like decision trees emit `recommends`): a
// `situation.resulting` clause with `sets-up` emits one `precedes` edge per named
// pattern, carrying the clause as the edge's derived `situation` text. The clause
// is the only authorable home of the condition; the edge field is its rendering.
for (const node of nodeMap.values()) {
  for (const clause of node.situation?.resulting ?? []) {
    for (const target of clause.setsUp ?? []) {
      if (!nodeMap.has(target)) {
        console.warn(`Situation warning: ${node.id}: sets-up "${target}" names no known pattern — no edge emitted`);
        continue;
      }
      if (target === node.id) continue;
      const key = `${node.id}|${target}|precedes`;
      if (edgeMap.has(key)) {
        console.warn(`Situation warning: ${node.id} precedes ${target} is declared in relationships and emitted by a sets-up clause — author the pair only in the clause`);
      }
      addEdge({
        source: node.id,
        target,
        type: 'precedes',
        situation: clause.clause,
        extractedFrom: 'situation:resulting',
      });
    }
  }
}

// --- Dedup pass: where a pair carries both a stronger typed edge and a `related`
// edge, drop the `related`. `related` is the weakest associative type; any stronger
// type already implies association, so the `related` is redundant. Keyed by the
// *unordered* pair, so a `related` in one direction is dropped when a stronger type
// exists in either direction. Multiple non-`related` typed edges are kept. ---
{
  const byPair = new Map<string, Edge[]>();
  for (const e of edgeMap.values()) {
    const k = [e.source, e.target].sort().join('|');
    if (!byPair.has(k)) byPair.set(k, []);
    byPair.get(k)!.push(e);
  }
  for (const [, list] of byPair) {
    // `recommends` is decision-tree routing, not an association claim, so it does
    // not subsume `related`. Every other type — including `surveys` membership —
    // already implies association, making a co-present `related` redundant.
    const hasTyped = list.some((e) => e.type !== 'related' && e.type !== 'recommends');
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

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(output, null, 2));
writeFileSync(outputPathLegacy, JSON.stringify(output, null, 2));

const activityLevelsNodes: Record<string, ActivityLevel> = {};
for (const node of nodes) {
  const data = activityData.get(node.id);
  if (data) activityLevelsNodes[node.id] = data;
}
const activityLevelsOutput = {
  _note: 'Generated by scripts/extract-graph-data.ts — do not edit by hand.',
  nodes: activityLevelsNodes,
};
mkdirSync(dirname(activityLevelsPath), { recursive: true });
writeFileSync(activityLevelsPath, JSON.stringify(activityLevelsOutput, null, 2));
writeFileSync(activityLevelsPathLegacy, JSON.stringify(activityLevelsOutput, null, 2));

// --- Axis sanity check (advisory) ---
//
// Coarse altitude proxy from the derived category: activities > actions >
// operations. Foundations and Qualities are cross-cutting and skipped.
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

// Mixed-cluster check: a node targeted by both `enables` and `instantiates`
// from sources sharing a frontmatter `group` is the signature of a cluster
// whose part–whole relations were typed two ways with no principle behind
// the split (component–integral vs genus–species; see relationship-vocabulary.md).
const mixedClusterFindings: string[] = [];
{
  type PerGroup = Map<string, string[]>; // group -> source ids
  const byTarget = new Map<string, { enables: PerGroup; instantiates: PerGroup }>();
  for (const e of edges) {
    if (e.type !== 'enables' && e.type !== 'instantiates') continue;
    const group = groupById.get(e.source);
    if (!group) continue;
    let entry = byTarget.get(e.target);
    if (!entry) {
      entry = { enables: new Map(), instantiates: new Map() };
      byTarget.set(e.target, entry);
    }
    const perGroup = entry[e.type];
    perGroup.set(group, [...(perGroup.get(group) ?? []), e.source]);
  }
  for (const [target, entry] of byTarget) {
    for (const [group, enablesSources] of entry.enables) {
      const instantiatesSources = entry.instantiates.get(group);
      if (instantiatesSources) {
        mixedClusterFindings.push(
          `${target} ← enables(${enablesSources.join(', ')}) + instantiates(${instantiatesSources.join(', ')}), group "${group}"`,
        );
      }
    }
  }
}

// Notes-voicing check: a single-noted directed edge renders its one note on
// both endpoints' pages, so a note naming neither endpoint binds to whichever
// endpoint the reader is not on. `enacts` is exempt (quality pages render
// nothing — there is no reverse reader); `recommends` carries hints, not notes.
const VOICING_TYPES = new Set<string>(['precedes', 'enables', 'instantiates', 'surveys', 'hosts', 'serves']);
const VOICING_STOPWORDS = new Set(['and', 'the', 'for', 'with', 'from', 'into', 'over', 'not']);
function nameTokens(id: string): string[] {
  const title = nodeMap.get(id)?.title ?? id;
  const words = `${title} ${id.replace(/-/g, ' ')}`.toLowerCase().split(/[^a-z]+/);
  return [...new Set(words.filter((w) => w.length >= 3 && !VOICING_STOPWORDS.has(w)))];
}
const voicingFindings: string[] = [];
for (const e of edges) {
  if (!VOICING_TYPES.has(e.type)) continue;
  const hasLabel = e.label !== undefined;
  const hasIncoming = e.incomingNote !== undefined;
  if (hasLabel === hasIncoming) continue; // unnoted, or voiced from both sides
  const note = (e.label ?? e.incomingNote)!;
  const noteLower = note.toLowerCase();
  // Prefix match absorbs inflection (searching/search, localization/localised).
  const namesAnEndpoint = [...nameTokens(e.source), ...nameTokens(e.target)]
    .some((w) => noteLower.includes(w.length > 5 ? w.slice(0, 5) : w));
  if (!namesAnEndpoint) voicingFindings.push(`${e.source} ${e.type} ${e.target}: "${note}"`);
}

// Note-verb check: a note whose phrasing makes a different relational claim
// than the stored type is the signature of a mistyped edge (the A′ precedes
// sweep found taxonomic "the broader …", hosting "container for …", and
// substitution "… is the alternative" notes riding on `precedes`). Tells are
// precision-biased: only phrasings that reliably contradicted the type in
// past audits, checked on the mistype-prone directed types.
const NOTE_TELLS: Array<{ claim: string; pattern: RegExp; conflicts: Set<string> }> = [
  { claim: 'taxonomic', pattern: /\bbroader\b|\bkind of\b|\bform of\b|\bvariant of\b|\bspecialis|\bspecializ|\binstance of\b/, conflicts: new Set(['precedes', 'enables']) },
  { claim: 'substitution', pattern: /\balternative\b|\binstead of\b/, conflicts: new Set(['precedes', 'enables', 'instantiates']) },
  // Since `hosts` exists (2026-07-10), hosting phrasing on any other type is a candidate
  // mistype — the flagged notes are the standing queue for the hosting sweep.
  { claim: 'hosting', pattern: /\bcontainer\b|\bcanvas\b|\bcommonly lives\b|\bcommonly appears\b|\bhost(s|ed|ing)?\b/, conflicts: new Set(['precedes', 'instantiates', 'enables', 'complements', 'related']) },
  { claim: 'compositional', pattern: /\benablers?\b|\bcomposed of\b|\bconstituent\b|\bbuilding block\b/, conflicts: new Set(['precedes', 'instantiates']) },
];
const noteTellFindings: string[] = [];
for (const e of edges) {
  for (const note of [e.label, e.incomingNote]) {
    if (note === undefined) continue;
    const noteLower = note.toLowerCase();
    for (const tell of NOTE_TELLS) {
      if (tell.conflicts.has(e.type) && tell.pattern.test(noteLower)) {
        noteTellFindings.push(`${e.source} ${e.type} ${e.target}: ${tell.claim} phrasing — "${note}"`);
      }
    }
  }
}

// --- Logging ---
const typeCounts: Record<string, number> = {};
for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
const taggedNodes = nodes.filter((n) => n.tags && n.tags.length > 0).length;

function roleCoverage(ids: string[]): Record<RoleSource, number> {
  const coverage: Record<RoleSource, number> = {
    explicit: 0,
    inferred: 0,
    unset: 0,
  };
  for (const id of ids) {
    const source = roleSourceById.get(id) ?? 'unset';
    coverage[source]++;
  }
  return coverage;
}

const sourceRoleCoverage = roleCoverage([...nodeMap.keys()]);
const graphRoleCoverage = roleCoverage(nodes.map((node) => node.id));
const invalidSurveyEdges = edges.filter((edge) => {
  const role = nodeMap.get(edge.source)?.role;
  return edge.type === 'surveys' && role !== 'collection' && role !== 'umbrella';
});
// Invariant 10: `serves` runs pattern → foundation only.
const invalidServesEdges = edges.filter((edge) => {
  if (edge.type !== 'serves') return false;
  const sourceRole = nodeMap.get(edge.source)?.role;
  const targetRole = nodeMap.get(edge.target)?.role;
  return targetRole !== 'foundation' || sourceRole === 'foundation' || sourceRole === 'quality';
});

console.log(`Nodes: ${nodes.length} (${taggedNodes} with tags)`);
console.log(`Edges: ${edges.length}`);
console.log(`  by type: ${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}=${c}`).join(', ')}`);
// `related` share is the vocabulary's retirement health dial (advisory): `related`
// is where meaning goes when the types don't fit, so a rising share means the
// vocabulary isn't carrying the corpus. See relationship-vocabulary.md §Retirement.
console.log(`  related share: ${(100 * (typeCounts.related ?? 0) / edges.length).toFixed(1)}% (retirement health dial; baseline 25.3% at 2026-07-10)`);
console.log(`Categories: ${[...new Set(nodes.map((n) => n.category))].sort().join(', ')}`);
console.log(`Role coverage (processed sources): explicit=${sourceRoleCoverage.explicit}, inferred=${sourceRoleCoverage.inferred}, unset=${sourceRoleCoverage.unset}`);
console.log(`Role coverage (emitted graph nodes): explicit=${graphRoleCoverage.explicit}, inferred=${graphRoleCoverage.inferred}, unset=${graphRoleCoverage.unset}`);
if (invalidSurveyEdges.length > 0) {
  console.warn(`Collection role warning: ${invalidSurveyEdges.length} surveys edge(s) have a non-collection source`);
}
if (invalidServesEdges.length > 0) {
  console.warn(`Serves role warning: ${invalidServesEdges.length} serves edge(s) violate pattern → foundation (I10)`);
  for (const e of invalidServesEdges) console.warn(`  ${e.source} serves ${e.target}`);
}
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
console.log(`  mixed part–whole clusters (enables + instantiates from one group): ${mixedClusterFindings.length}`);
for (const finding of mixedClusterFindings) console.log(`    ${finding}`);
console.log(`  single-noted directed edges naming neither endpoint: ${voicingFindings.length}`);
for (const finding of voicingFindings) console.log(`    ${finding}`);
console.log(`  note phrasings contradicting the stored type: ${noteTellFindings.length}`);
for (const finding of noteTellFindings) console.log(`    ${finding}`);
console.log(`Output: ${outputPath}`);
console.log(`Activity levels: ${activityLevelsPath}`);
