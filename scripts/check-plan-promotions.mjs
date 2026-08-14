import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards the promotion rule in plans/README.md: a completed plan must say
// where its durable residue lives — either resolvable paths in `promoted_to`
// or an explicit `none — <reason>`. An empty field is indistinguishable from
// "never promoted", which is how rules end up living only in closed plans.

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const completedDir = resolve(root, 'plans/completed');
let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

for (const name of readdirSync(completedDir).filter((n) => n.endsWith('.md'))) {
  const content = readFileSync(resolve(completedDir, name), 'utf-8');

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) {
    fail(`${name}: no frontmatter (see plans/README.md for the expected block)`);
    continue;
  }

  const ptMatch = fmMatch[1].match(/^promoted_to:[ \t]*(.*)$/m);
  const raw = ptMatch?.[1].trim().replace(/^["']|["']$/g, '').trim() ?? '';
  if (!raw) {
    fail(`${name}: promoted_to is empty — name the residue paths, or "none — <reason>"`);
    continue;
  }

  if (/^none\b/.test(raw)) continue;

  // Targets separate on `,` or `;` outside parentheses; each may carry a
  // ` (annotation)`, a ` §Section`, or a `#anchor`, none of which is part of
  // the path.
  const targets = [];
  let depth = 0;
  let current = '';
  for (const ch of raw) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if ((ch === ',' || ch === ';') && depth === 0) {
      targets.push(current);
      current = '';
    } else current += ch;
  }
  targets.push(current);

  for (const target of targets) {
    const path = target.trim().replace(/\s*[(§].*$/, '').replace(/#.*$/, '').trim();
    if (!path) continue;
    if (!existsSync(resolve(root, path))) {
      fail(`${name}: promoted_to target does not exist: ${path}`);
    }
  }
}

if (failed) process.exit(1);
console.log('All completed plans declare their promotion residue.');
