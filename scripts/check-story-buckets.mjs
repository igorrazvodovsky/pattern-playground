import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards the Storybook catalogue's top-level buckets (see the *Catalogue
// categories* section of .claude/rules/documentation.md). Every story `title`
// and `<Meta title>` first segment must be one of the recorded buckets. A new
// page titled under an unrecognised bucket (e.g. a revived Primitives/… or an
// activity-level Actions/…/… path) reintroduces a taxonomy the catalogue has
// retired, and the cross-reference validator won't catch it — it only checks
// that *referenced* ids resolve, not that a title's bucket is sanctioned.
//
// Placement rule lives in the rule file; this only enforces the closed set.

const ALLOWED_BUCKETS = new Set([
  'Components',
  'Utilities',
  'Foundations',
  'Data visualisation',
  'Introduction', // Storybook's default landing page
]);

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const storiesDir = resolve(root, 'packages/components/src/stories');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(stories\.tsx|mdx)$/.test(name)) out.push(full);
  }
  return out;
}

// A catalogue title is always `Category/Name`. The `/` distinguishes real
// definition titles from story args and mock data (`title: 'Dialog title'`).
const TITLE_RE = /(?:title:\s*|<Meta\s+title=)["']([^"'/]+)\/[^"']*["']/g;

const problems = [];
for (const file of walk(storiesDir)) {
  const src = readFileSync(file, 'utf8');
  let m;
  while ((m = TITLE_RE.exec(src))) {
    const bucket = m[1].trim();
    if (!ALLOWED_BUCKETS.has(bucket)) {
      problems.push(`${relative(root, file)}: title bucket "${bucket}" is not a recorded catalogue category.`);
    }
  }
}

if (problems.length) {
  console.error('Story bucket check FAILED:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error(
    `\nAllowed buckets: ${[...ALLOWED_BUCKETS].join(', ')}.` +
      '\nSee the "Catalogue categories" section of .claude/rules/documentation.md.',
  );
  process.exit(1);
}
console.log(`Story bucket check passed (${ALLOWED_BUCKETS.size} allowed buckets).`);
