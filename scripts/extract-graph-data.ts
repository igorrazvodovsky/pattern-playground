import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const storiesDir = join(rootDir, 'src/stories');
const outputPath = join(rootDir, 'src/pattern-graph.json');
const activityLevelsPath = join(rootDir, 'src/stories/data/activity-levels.json');

interface Node {
  id: string;
  title: string;
  category: string;
  path: string;
}

interface Edge {
  source: string;
  target: string;
}

interface ActivityLevel {
  'activity-level': string;
  'lifecycle-stage': string | null;
  'atomic-category': string;
  'mediation': string | null;
}

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
    // AT hierarchy (new)
    'Operations':   'Operations',
    'Actions':      'Actions',
    'Activities':   'Activities',
    // Cross-cutting (unchanged)
    'Foundations':  'Foundations',
    'Qualities':    'Qualities',
    // Legacy (kept for backward compatibility during transition)
    'Primitives':   'Primitives',
    'Components':   'Components',
    'Compositions': 'Compositions',
    'Patterns':     'Patterns',
    'Data visualization': 'Data Visualisation',
    'Visual elements':    'Visual Elements',
  };
  return map[first] ?? first;
}

/** Extract title= from a <Meta title="..."> tag. */
function extractMetaTitle(content: string): string | null {
  const m = content.match(/<Meta\b[^>]*title=['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

/** Extract tags={[...]} values from a <Meta> tag. */
function extractMetaTags(content: string): string[] {
  const m = content.match(/<Meta\b[^>]*tags=\{(\[[^\]]*\])\}/);
  if (!m) return [];
  // Parse array like ['foo', 'bar', "baz"]
  const raw = m[1];
  return [...raw.matchAll(/['"]([^'"]+)['"]/g)].map((r) => r[1]);
}

function extractStoriesTitle(content: string): string | null {
  const m = content.match(/^\s*title:\s*['"]([^'"]+)['"]/m);
  return m ? m[1] : null;
}

/** Extract tags: [...] from a .stories.tsx default export object. */
function extractStoriesTags(content: string): string[] {
  const m = content.match(/^\s*tags:\s*(\[[^\]]*\])/m);
  if (!m) return [];
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((r) => r[1]);
}

function extractLinks(content: string): string[] {
  const pattern = /\.\.\/\?path=\/docs\/([a-z0-9][a-z0-9-]*)--docs/g;
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(content)) !== null) {
    ids.push(m[1]);
  }
  return ids;
}

/** Derive activity level and lifecycle stage from a title path. */
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
const fileLinks = new Map<string, string[]>();
const activityData = new Map<string, ActivityLevel>();

// --- Process MDX files ---
const mdxFiles = globMdx(storiesDir).filter(
  (f) => !f.endsWith('Intro.mdx')
);

for (const filePath of mdxFiles) {
  const content = readFileSync(filePath, 'utf-8');
  let title = extractMetaTitle(content);
  let storiesTags: string[] = [];

  if (!title) {
    // Try co-located .stories.tsx for title and tags
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

  // Extract AT metadata — prefer MDX tags, fall back to co-located .stories.tsx tags
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

  const links = extractLinks(content);
  if (links.length > 0) {
    fileLinks.set(id, links);
  }
}

// --- Process .stories.tsx without co-located .mdx ---
for (const filePath of globStoriesTsx(storiesDir)) {
  const mdxPath = filePath.replace(/\.stories\.tsx$/, '.mdx');
  try {
    statSync(mdxPath);
    continue; // MDX exists, already processed
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
const edgeSet = new Set<string>();
const edges: Edge[] = [];

for (const [sourceId, targetIds] of fileLinks.entries()) {
  for (const targetId of targetIds) {
    if (!nodeMap.has(targetId)) continue;
    if (sourceId === targetId) continue;
    const key = `${sourceId}→${targetId}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ source: sourceId, target: targetId });
    }
  }
}

const connected = new Set(edges.flatMap((e) => [e.source, e.target]));
const nodes = [...nodeMap.values()].filter((n) => connected.has(n.id));
const output = { nodes, edges };

writeFileSync(outputPath, JSON.stringify(output, null, 2));

// --- Write activity-levels.json (generated, supersedes the hand-authored version) ---
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

console.log(`Nodes: ${nodes.length}`);
console.log(`Edges: ${edges.length}`);
console.log(`Categories: ${[...new Set(nodes.map((n) => n.category))].sort().join(', ')}`);
console.log(`Output: ${outputPath}`);
console.log(`Activity levels: ${activityLevelsPath}`);
