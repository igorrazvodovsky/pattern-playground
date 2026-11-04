// Verifies the demo-registry contract between pattern content and
// apps/patterns/src/lib/demo-registry.ts:
//   1. no client:only remains in pattern content (demos mount via the registry);
//   2. every demo name used in MDX (<Demo name="…">) resolves to an entry in
//      the registry's `demos` map, and every switchable demo (<Demo spec="…">)
//      to a spec in packages/components/src/demos/specs/ (<slug>.json or
//      <slug>.ts), which the registry finds by glob. <Diagram> is not one of
//      them — it renders <pp-diagram>, a custom element that registers with
//      the rest of the library.
// With --pages it also prints the demo-carrying pages for a manual click-through.
// Run: node scripts/verify-demo-registry.mjs [--pages]
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { repoRoot as root, stripFrontmatter } from './lib/files.ts';

const contentDir = path.join(root, 'apps/patterns/src/content/patterns');
const registryFile = path.join(root, 'apps/patterns/src/lib/demo-registry.ts');
const specsDir = path.join(root, 'packages/components/src/demos/specs');

const listPages = process.argv.includes('--pages');

const registrySource = readFileSync(registryFile, 'utf8');
// Entry names of one `const <name> … = { … };` map in the registry.
const mapNames = (name) => {
  const block =
    registrySource.match(new RegExp(`const ${name}\\b[^\\n]*= \\{\\n([\\s\\S]*?)\\n\\};`))?.[1] ??
    '';
  return new Set([...block.matchAll(/^\s*'([a-z0-9-]+)':\s*\(\)\s*=>/gm)].map((m) => m[1]));
};
const registryNames = mapNames('demos');
if (registryNames.size === 0) {
  console.error('Could not parse the demos map from demo-registry.ts');
  process.exit(1);
}
const specNames = new Set(
  readdirSync(specsDir)
    .filter((f) => /\.(json|ts)$/.test(f) && !f.endsWith('.test.ts'))
    .map((f) => f.replace(/\.(json|ts)$/, '')),
);

let failures = 0;
const usedNames = new Set();
const demoPages = [];

for (const file of readdirSync(contentDir)
  .filter((f) => f.endsWith('.mdx'))
  .sort()) {
  const rel = path.relative(root, path.join(contentDir, file));
  // Strip YAML frontmatter: a comment there may mention component tags
  // (e.g. form.mdx's chart-index note) without being a mount.
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
      console.error(
        `FAIL ${rel}: demo spec "${spec}" has no ${spec}.json or ${spec}.ts in packages/components/src/demos/specs/`,
      );
      failures++;
    }
  }

  const mountCount = names.length + specs.length;
  if (mountCount > 0) demoPages.push({ slug: file.replace(/\.mdx$/, ''), mountCount });
}

const unused = [
  ...[...registryNames].filter((n) => !usedNames.has(n)),
  ...[...specNames].filter((n) => !usedNames.has(`spec:${n}`)).map((n) => `spec:${n}`),
];
if (unused.length) console.log(`note: demos and specs unused by content: ${unused.join(', ')}`);

if (listPages) {
  console.log(`\nDemo-carrying pages (${demoPages.length}) for click-through:`);
  for (const { slug, mountCount } of demoPages) {
    console.log(`  /patterns/${slug}  (${mountCount})`);
  }
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('Demo registry check passed.');
