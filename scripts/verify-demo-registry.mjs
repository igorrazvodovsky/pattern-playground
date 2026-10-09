// Verifies the demo-registry contract between pattern content and
// apps/patterns/src/lib/demo-registry.ts:
//   1. no client:only remains in pattern content (demos mount via the registry);
//   2. every demo name used in MDX (<Demo name="…">) resolves to an entry in
//      the registry's `demos` map, and every switchable demo (<Demo spec="…">)
//      to an entry in its `specs` map. <Diagram> is not one of them — it
//      renders <pp-diagram>, a custom element that registers with the rest of
//      the library;
//   3. per-page demo-mount count matches the client:only count at the given
//      git ref (default HEAD) — pass --against <ref>, or --no-baseline to skip
//      once the migration commit is in history;
//   4. prints the demo-carrying pages for a manual click-through.
// Run: node scripts/verify-demo-registry.mjs [--against <ref>] [--no-baseline]
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const contentDir = path.join(root, 'apps/patterns/src/content/patterns');
const registryFile = path.join(root, 'apps/patterns/src/lib/demo-registry.ts');

const args = process.argv.slice(2);
const baseline = args.includes('--no-baseline') ? null : (args[args.indexOf('--against') + 1] && args.includes('--against') ? args[args.indexOf('--against') + 1] : 'HEAD');

const registrySource = readFileSync(registryFile, 'utf8');
// Entry names of one `const <name> … = { … };` map in the registry.
const mapNames = (name) => {
  const block = registrySource.match(new RegExp(`const ${name}\\b[^\\n]*= \\{\\n([\\s\\S]*?)\\n\\};`))?.[1] ?? '';
  return new Set([...block.matchAll(/^\s*'([a-z0-9-]+)':\s*\(\)\s*=>/gm)].map((m) => m[1]));
};
const registryNames = mapNames('demos');
const specNames = mapNames('specs');
if (registryNames.size === 0 || specNames.size === 0) {
  console.error('Could not parse the demos and specs maps from demo-registry.ts');
  process.exit(1);
}

let failures = 0;
const usedNames = new Set();
const demoPages = [];

for (const file of readdirSync(contentDir).filter((f) => f.endsWith('.mdx')).sort()) {
  const rel = path.relative(root, path.join(contentDir, file));
  // Strip YAML frontmatter: a comment there may mention component tags
  // (e.g. form.mdx's chart-index note) without being a mount.
  const stripFrontmatter = (s) => s.replace(/^---\n[\s\S]*?\n---\n/, '');
  const text = stripFrontmatter(readFileSync(path.join(contentDir, file), 'utf8'));

  if (text.includes('client:only')) {
    console.error(`FAIL ${rel}: client:only remains`);
    failures++;
  }

  const names = [...text.matchAll(/<Demo\s[^>]*?name="([a-z0-9-]+)"/gs)].map((m) => m[1]);
  for (const name of names) {
    usedNames.add(name);
    if (!registryNames.has(name)) {
      console.error(`FAIL ${rel}: demo name "${name}" not in registry`);
      failures++;
    }
  }

  const specs = [...text.matchAll(/<Demo\s[^>]*?spec="([a-z0-9-]+)"/gs)].map((m) => m[1]);
  for (const spec of specs) {
    usedNames.add(`spec:${spec}`);
    if (!specNames.has(spec)) {
      console.error(`FAIL ${rel}: demo spec "${spec}" not in registry`);
      failures++;
    }
  }

  const mountCount = names.length + specs.length;
  if (mountCount > 0) demoPages.push({ slug: file.replace(/\.mdx$/, ''), mountCount });

  if (baseline) {
    let before;
    try {
      before = execFileSync('git', ['show', `${baseline}:${rel}`], { cwd: root, encoding: 'utf8' });
    } catch {
      before = null; // new file at this ref
    }
    if (before !== null) {
      const beforeCount = [...stripFrontmatter(before).matchAll(/client:only/g)].length;
      if (beforeCount !== mountCount) {
        console.error(`FAIL ${rel}: ${beforeCount} client:only at ${baseline}, ${mountCount} registry mounts now`);
        failures++;
      }
    }
  }
}

const unused = [
  ...[...registryNames].filter((n) => !usedNames.has(n)),
  ...[...specNames].filter((n) => !usedNames.has(`spec:${n}`)).map((n) => `spec:${n}`),
];
if (unused.length) console.log(`note: registry entries unused by content: ${unused.join(', ')}`);

console.log(`\nDemo-carrying pages (${demoPages.length}) for click-through:`);
for (const { slug, mountCount } of demoPages) {
  console.log(`  /patterns/${slug}  (${mountCount})`);
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nOK: no client:only in content; all demo names resolve' + (baseline ? `; per-page counts match ${baseline}` : ''));
