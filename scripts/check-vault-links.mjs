import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards the links between the repo and the PARA vault, in both directions:
// `PARA/...` paths cited in repo docs and MDX comments must exist in the
// vault, and `story:` fields in the vault's research `query.yml` files must
// exist in the repo. The vault is local to one machine, so without `$PARA`
// the check skips with a notice rather than failing cloud sessions and CI.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const vault = process.env.PARA;

if (!vault || !existsSync(vault)) {
  console.log('check-vault-links: $PARA is unset or missing; skipping the vault link check.');
  process.exit(0);
}

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro', 'storybook-static', '.turbo']);
const EXTENSIONS = ['.md', '.mdx', '.yml', '.yaml'];
let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(join(dir, entry.name));
    } else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      yield join(dir, entry.name);
    }
  }
}

// Vault paths contain spaces ("pattern playground") and wrap across lines in
// prose, so a path ends at its first file extension, or, for a folder, at the
// first `/` followed by a space, punctuation, or the end of the text.
const FILE_END = /^[^`"'<>*|\n]*?\.(md|yml|yaml|pdf|base|canvas)(?![\w-])/;
const DIR_END = /^[^`"'<>*|\n]*?\/(?=[\s,;:.)\]`"']|$)/;
// Templates and shorthand (`<slug>`, `PARA/...`, `2026-05-XX`) are not links.
const PLACEHOLDER = /<|\.\.\.|…|\*|XX/;

function vaultPaths(text) {
  const joined = text.replace(/\n[ \t>]*/g, ' ');
  const found = [];
  for (const match of joined.matchAll(/PARA\//g)) {
    const rest = joined.slice(match.index + 'PARA/'.length);
    const head = rest.slice(0, 300);
    const candidates = [head.match(FILE_END)?.[0], head.match(DIR_END)?.[0]].filter(Boolean);
    const path = candidates.sort((a, b) => a.length - b.length)[0];
    if (path && !PLACEHOLDER.test(path)) found.push(path);
  }
  return found;
}

for (const file of walk(root)) {
  const rel = relative(root, file);
  for (const path of vaultPaths(readFileSync(file, 'utf-8'))) {
    if (!existsSync(resolve(vault, path))) {
      fail(`${rel}: vault path does not exist: PARA/${path}`);
    }
  }
}

const researchDir = resolve(vault, 'Projects/pattern playground/research');
if (existsSync(researchDir)) {
  for (const slug of readdirSync(researchDir)) {
    const query = join(researchDir, slug, 'query.yml');
    if (!existsSync(query) || !statSync(query).isFile()) continue;
    const story = readFileSync(query, 'utf-8').match(/^story:[ \t]*(.*)$/m)?.[1]
      .trim().replace(/^["']|["']$/g, '').replace(/\s+#.*$/, '').trim();
    if (!story || story === 'null' || story === '~') continue;
    if (!existsSync(resolve(root, story))) {
      fail(`research/${slug}/query.yml: story does not exist in the repo: ${story}`);
    }
  }
}

if (failed) process.exit(1);
