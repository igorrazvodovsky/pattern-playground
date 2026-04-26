/**
 * Write authored labels back into the source MDX files as per-line `— ` annotations.
 *
 * Usage: `npx tsx scripts/write-labels.ts <labels.json> [<labels.json> ...]`
 *
 * The graph is the derived artifact; the MDX is the source of truth. Manual labels
 * therefore live in the MDX as the same `— ` text that extraction reads on the next
 * run. This script finds the bullet line in the source MDX containing the target
 * link and edits it in place — replacing an existing `— ` annotation if present,
 * appending one otherwise.
 *
 * The script does not move links between sections, doesn't add new links, and
 * doesn't touch inline-prose links. Re-typing or section restructuring is editorial
 * work that belongs in a normal MDX edit.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const storiesDir = join(rootDir, 'src/stories');

interface LabelEntry {
  source: string;
  target: string;
  type: string;
  label?: string;
}

function globMdx(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '.obsidian') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...globMdx(full));
    else if (entry.endsWith('.mdx')) out.push(full);
  }
  return out;
}

function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, '')
    .replace(/[/ ]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractMetaTitle(content: string): string | null {
  const m = content.match(/<Meta\b[^>]*title=['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function extractStoriesTitle(content: string): string | null {
  const m = content.match(/^\s*title:\s*['"]([^'"]+)['"]/m);
  return m ? m[1] : null;
}

// Build id → MDX path map.
const idToPath = new Map<string, string>();
for (const filePath of globMdx(storiesDir)) {
  const content = readFileSync(filePath, 'utf-8');
  let title = extractMetaTitle(content);
  if (!title) {
    const storiesPath = filePath.replace(/\.mdx$/, '.stories.tsx');
    try { title = extractStoriesTitle(readFileSync(storiesPath, 'utf-8')); } catch {}
  }
  if (title) idToPath.set(titleToId(title), filePath);
}

// Collect entries.
const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('Usage: npx tsx scripts/write-labels.ts <labels.json> [<labels.json> ...]');
  process.exit(1);
}
const entries: LabelEntry[] = [];
for (const f of inputs) {
  const j = JSON.parse(readFileSync(f, 'utf-8'));
  entries.push(...(Array.isArray(j) ? j : (j.entries ?? [])));
}

// Group by source file so each MDX is read/written once.
const bySource = new Map<string, LabelEntry[]>();
for (const e of entries) {
  if (!e.label) continue;
  const path = idToPath.get(e.source);
  if (!path) {
    console.warn(`No MDX file for source id "${e.source}"`);
    continue;
  }
  if (!bySource.has(path)) bySource.set(path, []);
  bySource.get(path)!.push(e);
}

const linkRegex = (targetId: string) =>
  new RegExp(`\\.\\.\\/\\?path=\\/docs\\/${targetId}--docs`, 'g');

let written = 0, replaced = 0, appended = 0, missing = 0, ambiguous = 0, multiLink = 0;

for (const [filePath, fileEntries] of bySource) {
  const original = readFileSync(filePath, 'utf-8');
  let content = original;
  const lines = content.split('\n');

  for (const entry of fileEntries) {
    const target = entry.target;
    const re = linkRegex(target);
    // Find candidate lines: bullet lines containing the link, outside comment blocks.
    const matches: number[] = [];
    let inComment = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('{/*')) inComment = true;
      const lineMatchesLink = re.test(line);
      re.lastIndex = 0;
      if (lineMatchesLink && !inComment && /^\s*-\s/.test(line)) {
        // Skip fragment links (deep references like `--docs#section`); the canonical
        // reference is the un-fragmented one.
        const fragmentRe = new RegExp(`\\.\\.\\/\\?path=\\/docs\\/${target}--docs#`);
        if (fragmentRe.test(line) && !new RegExp(`\\.\\.\\/\\?path=\\/docs\\/${target}--docs\\)`).test(line)) continue;
        // Skip lines with multiple links (ambiguous which annotation goes where).
        const allLinks = (line.match(/\.\.\/\?path=\/docs\/[a-z0-9-]+--docs/g) || []).length;
        if (allLinks > 1) { multiLink++; continue; }
        matches.push(i);
      }
      if (line.includes('*/}')) inComment = false;
    }
    if (matches.length === 0) { missing++; console.warn(`No bullet link to ${target} in ${filePath}`); continue; }

    let idx: number;
    if (matches.length === 1) {
      idx = matches[0];
    } else {
      // Disambiguate: prefer the bullet that already carries a `— ` annotation.
      // Thematic-section bullets always have an annotation (header text or per-line);
      // prose-paragraph bullets typically don't.
      const annotated = matches.filter((i) => /\)\s*[—–]/.test(lines[i]));
      if (annotated.length === 1) {
        idx = annotated[0];
      } else {
        ambiguous++;
        console.warn(`Multiple bullet lines link to ${target} in ${filePath} (${matches.map((i) => i + 1).join(', ')}) — disambiguation failed`);
        continue;
      }
    }
    const line = lines[idx];
    // Find the closing `)` of the link, then everything after.
    const linkEndRe = new RegExp(`(\\]\\(\\.\\.\\/\\?path=\\/docs\\/${target}--docs\\))(.*)$`);
    const m = line.match(linkEndRe);
    if (!m) { missing++; console.warn(`Couldn't locate link closing in ${filePath}:${idx + 1}`); continue; }
    const before = line.slice(0, line.length - (m[1].length + m[2].length));
    const tail = m[2];
    // Detect existing annotation: ` — ...` or ` – ...` after the link.
    const annoMatch = tail.match(/^\s*[—–]\s*(.+)$/);
    const newTail = ` — ${entry.label}`;
    if (annoMatch) {
      replaced++;
    } else {
      appended++;
    }
    lines[idx] = before + m[1] + newTail;
    written++;
  }

  const updated = lines.join('\n');
  if (updated !== original) writeFileSync(filePath, updated);
}

console.log(`Written: ${written} (replaced=${replaced}, appended=${appended})`);
if (missing) console.log(`Missing: ${missing}`);
if (ambiguous) console.log(`Ambiguous: ${ambiguous}`);
if (multiLink) console.log(`Skipped multi-link bullets: ${multiLink}`);
