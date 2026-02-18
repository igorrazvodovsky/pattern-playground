import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const storiesDir = join(rootDir, 'src/stories');
const outputPath = join(rootDir, 'src/stories/data/pattern-graph.json');

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

function globMdx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
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
    'Foundations': 'Foundations',
    'Primitives': 'Primitives',
    'Components': 'Components',
    'Compositions': 'Compositions',
    'Patterns': 'Patterns',
    'Qualities': 'Qualities',
    'Data visualization': 'Data Visualisation',
    'Visual elements': 'Visual Elements',
  };
  return map[first] ?? first;
}

function extractMetaTitle(content: string): string | null {
  const match = content.match(/<Meta\s+title=['"]([^'"]+)['"]\s*\/>/);
  return match ? match[1] : null;
}

function extractStoriesTitle(content: string): string | null {
  const match = content.match(/title:\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
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

const nodeMap = new Map<string, Node>();
const fileLinks = new Map<string, string[]>();

// --- Process MDX files ---
const mdxFiles = globMdx(storiesDir).filter(
  (f) => !f.endsWith('Intro.mdx')
);

for (const filePath of mdxFiles) {
  const content = readFileSync(filePath, 'utf-8');
  let title = extractMetaTitle(content);

  if (!title) {
    // Try co-located .stories.tsx
    const base = filePath.replace(/\.mdx$/, '.stories.tsx');
    try {
      const storiesContent = readFileSync(base, 'utf-8');
      title = extractStoriesTitle(storiesContent);
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

console.log(`Nodes: ${nodes.length}`);
console.log(`Edges: ${edges.length}`);
console.log(`Categories: ${[...new Set(nodes.map((n) => n.category))].sort().join(', ')}`);
console.log(`Output: ${outputPath}`);
