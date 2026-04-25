/**
 * Merge authored glosses onto edges in `src/pattern-graph.json`.
 *
 * Usage: `npx tsx scripts/merge-glosses.ts <glosses.json>`
 *
 * The glosses file is expected to be the gloss queue (or a derivative) with each
 * entry carrying a `gloss` string and optional `glossSource`. Entries without a
 * `gloss` are skipped. Matches are made on (source, target, type).
 *
 * Re-running `extract-graph-data.ts` preserves glosses across regenerations as long
 * as (source, target, type) survives unchanged — see that script's prior-graph read.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const graphPath = join(rootDir, 'src/pattern-graph.json');

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npx tsx scripts/merge-glosses.ts <glosses.json>');
  process.exit(1);
}

interface GlossEntry {
  source: string;
  target: string;
  type: string;
  gloss?: string;
  glossSource?: string;
}

interface Edge {
  source: string;
  target: string;
  type: string;
  gloss?: string;
  glossSource?: string;
  [k: string]: unknown;
}

const inputRaw = readFileSync(inputPath, 'utf-8');
const inputJson = JSON.parse(inputRaw) as { entries?: GlossEntry[] } | GlossEntry[];
const entries: GlossEntry[] = Array.isArray(inputJson) ? inputJson : (inputJson.entries ?? []);

const graph = JSON.parse(readFileSync(graphPath, 'utf-8')) as { nodes: unknown[]; edges: Edge[] };

const edgeIndex = new Map<string, Edge>();
for (const e of graph.edges) edgeIndex.set(`${e.source}|${e.target}|${e.type}`, e);

let merged = 0;
let skipped = 0;
let unmatched = 0;
for (const entry of entries) {
  if (!entry.gloss) {
    skipped++;
    continue;
  }
  const edge = edgeIndex.get(`${entry.source}|${entry.target}|${entry.type}`);
  if (!edge) {
    unmatched++;
    console.warn(`No matching edge for ${entry.source} —[${entry.type}]→ ${entry.target}`);
    continue;
  }
  edge.gloss = entry.gloss;
  if (entry.glossSource) edge.glossSource = entry.glossSource;
  merged++;
}

writeFileSync(graphPath, JSON.stringify(graph, null, 2));

console.log(`Merged: ${merged}`);
console.log(`Skipped (no gloss): ${skipped}`);
console.log(`Unmatched: ${unmatched}`);
console.log(`Output: ${graphPath}`);
