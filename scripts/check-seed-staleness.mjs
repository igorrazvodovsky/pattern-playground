#!/usr/bin/env node
// Warns on pages that have been marked `seed: true` and then left alone.
//
// The counterweight to the field's own failure mode. `seed` exists so a stub
// stops asserting finished-page authority; marking everything a seed and never
// coming back restores the original problem inverted — uniform low authority
// instead of uniform high. A page that has sat as a seed for eighteen months is
// either not a seed or should not exist.
//
// Warns; never fails. A stale seed is a prompt to decide, not a broken build,
// and a lint that blocks work on a judgement call gets disabled.
//
// "Meaningfully modified" is read as the last commit touching the file. The
// sharper measure — last change to the evidence-bearing fields specifically,
// versus any commit — is what actually distinguishes tending from typo-fixing,
// and is deferred alongside the derived-completeness work in
// plans/completed/2026-07-epistemic-disclosure.md (Phase 3).

import { readdirSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve } from 'node:path';
import { load as yamlLoad } from 'js-yaml';

const rootDir = resolve(process.cwd());
const contentDir = join(rootDir, 'apps/patterns/src/content/patterns');
const STALE_AFTER_MONTHS = 18;

const staleBefore = new Date();
staleBefore.setMonth(staleBefore.getMonth() - STALE_AFTER_MONTHS);

function frontmatterOf(file) {
  const match = readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  try {
    return yamlLoad(match[1]) ?? {};
  } catch {
    return null;
  }
}

// Attention, not bytes: the authored `updated` field is a claim about tending
// and the commit date is a record of it. Git wins where it is available; the
// frontmatter is the floor for an uncommitted or freshly-copied tree.
function lastTouched(file, fm) {
  try {
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', file], {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (iso) return { date: new Date(iso), source: 'last commit' };
  } catch {
    // not a git checkout, or git is unavailable
  }
  const authored = fm.updated ?? fm.added;
  return authored ? { date: new Date(authored), source: 'frontmatter' } : null;
}

const stale = [];
let seeds = 0;

for (const name of readdirSync(contentDir)) {
  if (!name.endsWith('.mdx') && !name.endsWith('.md')) continue;
  const file = join(contentDir, name);
  const fm = frontmatterOf(file);
  if (!fm || fm.seed !== true) continue;
  seeds++;

  const touched = lastTouched(file, fm);
  if (!touched || Number.isNaN(touched.date.valueOf())) continue;
  if (touched.date >= staleBefore) continue;
  stale.push({ file: relative(rootDir, file), ...touched });
}

if (stale.length === 0) {
  console.log(`Seed staleness: ${seeds} seed page(s), none older than ${STALE_AFTER_MONTHS} months.`);
} else {
  console.warn(
    `Seed staleness: ${stale.length} of ${seeds} seed page(s) untouched for over ${STALE_AFTER_MONTHS} months.`,
  );
  console.warn('Each is either not a seed any more, or should not exist. Decide which.');
  for (const { file, date, source } of stale.sort((a, b) => a.date - b.date)) {
    console.warn(`  ${file} — ${date.toISOString().slice(0, 10)} (${source})`);
  }
}
