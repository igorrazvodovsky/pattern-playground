import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The canonical graph data lives with the site (apps/patterns/src/data/); a
// mirror lives in packages/components/src/ because PatternGraph.tsx renders in
// Storybook too, and packages must not import from apps. Both copies are
// written by scripts/extract-graph-data.ts — this check makes hand-edit drift
// between them loud instead of silent.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const pairs = [
  ['apps/patterns/src/data/pattern-graph.json', 'packages/components/src/pattern-graph.json'],
  ['apps/patterns/src/data/activity-levels.json', 'packages/components/src/activity-levels.json'],
];

let failed = false;

for (const [canonical, mirror] of pairs) {
  const canonicalContent = JSON.stringify(JSON.parse(readFileSync(resolve(root, canonical), 'utf-8')));
  const mirrorContent = JSON.stringify(JSON.parse(readFileSync(resolve(root, mirror), 'utf-8')));
  if (canonicalContent !== mirrorContent) {
    console.error(
      `FAIL: ${mirror} has drifted from ${canonical}. ` +
        'Run `npm run extract-graph` to regenerate both copies.',
    );
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Graph mirror sync check passed.');
