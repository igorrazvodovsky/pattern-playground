import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const storiesDir = join(rootDir, 'src/stories');
const outputPath = join(rootDir, 'src/pattern-graph.json');
const activityLevelsPath = join(rootDir, 'src/activity-levels.json');
const labelQueuePath = join(rootDir, 'pattern-graph.label-queue.json');

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
  tags?: string[];
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

interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  extractedFrom?: string;
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
  'Follow-ups': 'follows',
  'Follow-up patterns': 'follows',
  'Follow-ups & Complements': 'follows',
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
 * Headers where the listed pattern is the *source* of the edge, not the target.
 * For `enables` the source is the building block and the target is the composite,
 * so headers that name the page's components/containers invert the default
 * page→listed direction.
 *
 * "Used by" is the exception: the page is the building block; the listed pattern
 * is the composite that uses it. Default direction is correct.
 */
const INVERSE_DIRECTION_HEADERS = new Set<string>([
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
  if (shortTitle === 'Overview') continue;

  const id = titleToId(title);
  const cat = titleToCategory(title);
  const path = `../?path=/docs/${id}--docs`;

  if (!nodeMap.has(id)) {
    nodeMap.set(id, { id, title: shortTitle, category: cat, path });
  }

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

for (const [sourceId, links] of fileLinks.entries()) {
  for (const link of links) {
    if (!nodeMap.has(link.target)) continue;
    if (sourceId === link.target) continue;
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

const axisFlagged: Edge[] = [];
let sameAltitudeInstantiates = 0;
let crossTwoBandsComplements = 0;
for (const e of edges) {
  const sa = altitudeOf(e.source);
  const ta = altitudeOf(e.target);
  if (sa === null || ta === null) continue;
  if (e.type === 'instantiates' && sa === ta) {
    sameAltitudeInstantiates++;
    axisFlagged.push(e);
  } else if (e.type === 'complements' && Math.abs(sa - ta) >= 2) {
    crossTwoBandsComplements++;
    axisFlagged.push(e);
  }
}

// --- Build label queue ---
//
// Edges where a manually authored label adds something the type alone can't carry:
// every `enacts` edge, every axis-flagged edge, and every edge that came from a
// thematic subcategory header.
type QueueEntry = {
  source: string;
  target: string;
  type: EdgeType;
  reason: 'enacts' | 'axis-flagged' | 'thematic';
  label?: string;
  extractedFrom?: string;
  hasLabel: boolean;
};
const queue: QueueEntry[] = [];
const queueSeen = new Set<string>();
function addToQueue(e: Edge, reason: QueueEntry['reason']) {
  const k = `${e.source}|${e.target}|${e.type}|${reason}`;
  if (queueSeen.has(k)) return;
  queueSeen.add(k);
  queue.push({
    source: e.source,
    target: e.target,
    type: e.type,
    reason,
    ...(e.label !== undefined ? { label: e.label } : {}),
    ...(e.extractedFrom !== undefined ? { extractedFrom: e.extractedFrom } : {}),
    hasLabel: !!e.label,
  });
}

// Track edges that came from thematic subcategory headers — identified at extraction
// time via the `thematicHeader` flag on the TypedLink, not by string-matching the
// label (which can now be a per-line annotation).
const thematicEdgeKeys = new Set<string>();
for (const [sourceId, links] of fileLinks) {
  for (const link of links) {
    if (!link.thematicHeader) continue;
    const [src, tgt] = link.inverse ? [link.target, sourceId] : [sourceId, link.target];
    thematicEdgeKeys.add(`${src}|${tgt}|${link.type}`);
  }
}

for (const e of edges) {
  if (e.type === 'enacts') addToQueue(e, 'enacts');
}
for (const e of axisFlagged) addToQueue(e, 'axis-flagged');
for (const e of edges) {
  if (thematicEdgeKeys.has(`${e.source}|${e.target}|${e.type}`)) {
    addToQueue(e, 'thematic');
  }
}

writeFileSync(
  labelQueuePath,
  JSON.stringify(
    {
      _note: 'Generated by scripts/extract-graph-data.ts. Coverage report for edges where a manual label is wanted (enacts, axis-flagged, thematic). Labels live in MDX as per-link `— ` annotations; author them by editing MDX directly or by staging a JSON file and running scripts/write-labels.ts.',
      entries: queue,
    },
    null,
    2,
  ),
);

// --- Logging ---
const typeCounts: Record<string, number> = {};
for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
const taggedNodes = nodes.filter((n) => n.tags && n.tags.length > 0).length;

console.log(`Nodes: ${nodes.length} (${taggedNodes} with tags)`);
console.log(`Edges: ${edges.length}`);
console.log(`  by type: ${Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}=${c}`).join(', ')}`);
console.log(`Categories: ${[...new Set(nodes.map((n) => n.category))].sort().join(', ')}`);
console.log(`Axis sanity check (advisory):`);
console.log(`  same-altitude instantiates: ${sameAltitudeInstantiates}`);
console.log(`  complements crossing 2 altitude bands: ${crossTwoBandsComplements}`);
console.log(`Label queue: ${queue.length} entries (${queue.filter((q) => q.hasLabel).length} already labelled)`);
console.log(`Output: ${outputPath}`);
console.log(`Activity levels: ${activityLevelsPath}`);
console.log(`Label queue: ${labelQueuePath}`);
