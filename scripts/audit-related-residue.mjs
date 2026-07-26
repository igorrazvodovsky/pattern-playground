#!/usr/bin/env node
// Related-link residue audit (plans/completed/2026-07-related-residue-audit.md, step 1).
// Diffs every "Related …" prose link at the split-project merge-base against the
// endpoint's frontmatter relationships (relationships:, situation sets-up,
// decision-tree leaves, both directions) and emits the row worksheet to stdout:
//   node scripts/audit-related-residue.mjs > plans/completed/2026-07-related-residue-worksheet.md
// Verification only — it never writes to content files.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'ef66e6a'; // split-project merge-base
const git = (...args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const norm = (s) => (s || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');

// ---------- endpoint: entries ----------
const CONTENT_DIR = `${REPO}/apps/patterns/src/content/patterns`;
const endpoint = {}; // slug -> { title, role, edges, body }
const titleMap = {}; // normTitle -> [slug]
for (const f of readdirSync(CONTENT_DIR)) {
  if (!/\.mdx?$/.test(f)) continue;
  const slug = f.replace(/\.mdx?$/, '');
  const raw = readFileSync(`${CONTENT_DIR}/${f}`, 'utf8');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) continue;
  let fm;
  try { fm = yaml.load(m[1]); } catch (e) { console.error(`YAML fail ${f}: ${e.message}`); continue; }
  const edges = [];
  for (const [type, list] of Object.entries(fm.relationships || {})) {
    for (const item of list || []) {
      if (typeof item === 'string') edges.push({ type, to: item, note: null, via: 'relationships' });
      else edges.push({ type, to: item.to, note: item.note || null, via: 'relationships' });
    }
  }
  for (const r of fm.situation?.resulting || []) {
    if (typeof r === 'object' && r['sets-up'])
      for (const t of r['sets-up']) edges.push({ type: 'precedes', to: t, note: r.clause || null, via: 'sets-up' });
  }
  for (const dt of fm['decision-trees'] || [])
    for (const t of Object.values(dt.leaves || {})) edges.push({ type: 'recommends', to: t, note: null, via: 'decision-tree' });
  endpoint[slug] = { title: fm.title, role: fm.role || 'pattern', edges, body: m[2] };
  (titleMap[norm(fm.title)] ||= []).push(slug);
}

// verified aliases: prose name -> endpoint slug
const alias = {
  search: 'searching',
  adaptation: 'adaptation', // slug; title is "Adaptability"
  botinquiry: 'inquiry-agent',
  inquirybot: 'inquiry-agent',
  userinquiry: 'inquiry-user',
  inquiryuser: 'inquiry-user',
  botopening: 'agent-opening',
  openingbot: 'agent-opening',
  useropening: 'user-opening',
  openinguser: 'user-opening',
  botrepair: 'agent-repair',
  repairbot: 'agent-repair',
  repairuser: 'user-repair',
};

// endpoint component catalogue (packages/components/src/stories basenames)
const componentSet = new Set(
  readdirSync(`${REPO}/packages/components/src/stories`)
    .map((f) => (f.match(/^([A-Za-z]+)\.(mdx|stories\.tsx)$/) || [])[1])
    .filter(Boolean)
    .map(norm),
);

componentSet.add('card'); // merge-base component, not carried into the endpoint catalogue
const isComponent = (text) => {
  const head = text.split('/')[0];
  return [norm(text), norm(head)].some((n) => componentSet.has(n) || (n.endsWith('s') && componentSet.has(n.slice(0, -1))));
};

const resolveByRole = (cands, wantRole) =>
  cands.find((s) => endpoint[s].role === wantRole) || cands.find((s) => endpoint[s].role === 'pattern') || cands[0];
const roleFromNs = (ns) =>
  ns.startsWith('foundations') ? 'foundation' : ns.startsWith('qualities') ? 'quality' : 'pattern';

function mapName(text, href) {
  const n = norm(text);
  if (alias[n]) return alias[n];
  const cands = titleMap[n] || [];
  if (cands.length === 1) return cands[0];
  if (cands.length > 1) {
    const ns = href ? ((href.match(/path=\/docs\/([a-z0-9-]+)/) || [])[1] || '') : '';
    return resolveByRole(cands, roleFromNs(ns));
  }
  // href id suffix fallback: actions-navigation-hub-and-spoke -> hub-and-spoke
  if (href) {
    const id = (href.match(/path=\/docs\/([a-z0-9-]+?)(?:--docs)?(?:#|$)/) || [])[1];
    if (id) {
      const parts = id.split('-');
      for (let k = 1; k < parts.length; k++) {
        const cand = parts.slice(k).join('-');
        if (endpoint[cand]) return cand;
        if (alias[norm(cand)]) return alias[norm(cand)];
      }
    }
    if (/\/patterns\/([a-z0-9-]+)/.test(href)) {
      const s = href.match(/\/patterns\/([a-z0-9-]+)/)[1];
      if (endpoint[s]) return s;
    }
  }
  return null;
}

// ---------- merge-base: extract ----------
const files = git('grep', '-l', '-E', '^#{2,5} Related', BASE, '--', 'src/stories/**/*.mdx')
  .trim().split('\n').map((l) => l.replace(`${BASE}:`, ''));

const rows = [];
const originNotEntry = {}; // path -> {storyTitle, count}

for (const path of files) {
  const src = git('show', `${BASE}:${path}`).replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  const titleM = src.match(/title="([^"]+)"/);
  const storyTitle = titleM ? titleM[1] : path;
  const leafTitle = titleM ? storyTitle.split('/').pop() : path.split('/').pop().replace(/\.mdx?$/, '');
  const nsGuess = titleM ? norm(storyTitle.split('/')[0]) : '';
  let originSlug = null;
  {
    const cands = titleMap[norm(leafTitle)] || [];
    if (cands.length === 1) originSlug = cands[0];
    else if (cands.length > 1) originSlug = resolveByRole(cands, roleFromNs(nsGuess));
    else if (alias[norm(leafTitle)]) originSlug = alias[norm(leafTitle)];
  }

  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const hm = lines[i].match(/^(#{2,5}) Related/);
    if (!hm) continue;
    const level = hm[1].length;
    i++;
    const items = [];
    let para = [];
    for (; i < lines.length; i++) {
      const l = lines[i];
      const hh = l.match(/^(#{1,6}) /);
      if (hh && hh[1].length <= level) { i--; break; }
      if (hh) { // deeper subheading: keep only if it names a target via a link
        if (/\[[^\]]+\]\([^)]+\)/.test(l)) items.push(l.replace(/^#+\s*/, ''));
        continue;
      }
      if (/^\s*[-*] /.test(l)) items.push(l.trim().replace(/^[-*] /, ''));
      else if (items.length && /^\s{2,}\S/.test(l)) items[items.length - 1] += ' ' + l.trim();
      else if (l.trim() && !/^</.test(l.trim())) para.push(l.trim()); // paragraph prose in the section
    }
    // paragraphs: only sentences that actually reference a target
    if (para.length)
      items.push(
        ...para.join(' ').split(/(?<=\.)\s+(?=[A-Z*[])/).filter((s) => /\[[^\]]+\]\([^)]+\)|^\*[^*]+\*/.test(s)),
      );
    for (const it of items) {
      if (!it.trim() || /^-{3,}$/.test(it.trim())) continue;
      const links = [...it.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
      const startLink = it.match(/^\[([^\]]+)\]\(([^)]+)\)\s*(?:[–—:-]\s*)?([\s\S]*)$/);
      const emit = (targetText, href, note) => {
        if (href && /^https?:/.test(href)) return; // external reference, not a graph link
        let targetSlug = mapName(targetText, href);
        let state, found = [], annot = [];
        const hrefId = href ? ((href.match(/path=\/docs\/([a-z0-9-]+)/) || [])[1] || '') : '';
        if (!originSlug) {
          state = 'origin-not-entry';
          originNotEntry[path] = { storyTitle, count: (originNotEntry[path]?.count || 0) + 1 };
        } else if (!targetSlug) {
          if (hrefId.startsWith('concepts')) state = 'target-concept';
          else if (hrefId.startsWith('data-visualisation') || hrefId.startsWith('data-visualization')) state = 'target-dataviz';
          else if (isComponent(targetText)) state = 'target-component';
          else if (!links.length && /TODO|TBD/i.test(it)) state = 'todo-item';
          else if (!links.length) state = 'plain-item';
          else state = 'target-unknown';
          if (state === 'target-component' && endpoint[originSlug].body.toLowerCase().includes(norm(targetText) === 'navbar' ? 'nav' : targetText.toLowerCase()))
            annot.push('component mentioned in body');
        } else if (targetSlug === originSlug) {
          state = 'target-component'; // link to the entry's own component twin
        } else {
          const fwd = endpoint[originSlug].edges.filter((e) => e.to === targetSlug);
          const rev = endpoint[targetSlug].edges.filter((e) => e.to === originSlug);
          found = [...fwd.map((e) => ({ ...e, dir: '→' })), ...rev.map((e) => ({ ...e, dir: '←' }))];
          if (!found.length) state = 'absent';
          else if (found.some((e) => e.note)) state = 'with-note';
          else state = 'bare';
          if (state !== 'with-note') {
            if (endpoint[originSlug].body.includes(`/patterns/${targetSlug}`)) annot.push('linked in origin body');
            if (endpoint[targetSlug].body.includes(`/patterns/${originSlug}`)) annot.push('linked in target body');
          }
        }
        rows.push({ path, originSlug, storyTitle, targetText, targetSlug, note: (note || '').trim(), state, found, annot });
      };
      if (startLink && links.length === 1) emit(startLink[1], startLink[2], startLink[3]);
      else if (links.length) for (const l of links) emit(l[1], l[2], it);
      else {
        const em = it.match(/^\*([^*]+)\*\s*(?:[–—:-]\s*)?([\s\S]*)$/);
        if (em) emit(em[1], null, it);
        else {
          const pm = it.match(/^([^–—:]{1,40}?)\s*(?:[–—]|-)\s+([\s\S]*)$/);
          if (pm) emit(pm[1].replace(/`?TODO:?`?\s*/i, ''), null, it);
          else emit(it.slice(0, 60), null, it);
        }
      }
    }
  }
}

// ---------- endpoint bare-edge inventory ----------
// every note-less relationships edge at the endpoint, annotated with whether a
// prose row covers it (DoD: any bare edge left standing must be a deliberate seed)
const bareEdges = [];
for (const [slug, e] of Object.entries(endpoint)) {
  for (const edge of e.edges) {
    if (edge.via !== 'relationships' || edge.note) continue;
    const cover = rows.filter(
      (r) => (r.originSlug === slug && r.targetSlug === edge.to) || (r.originSlug === edge.to && r.targetSlug === slug),
    );
    bareEdges.push({ slug, edge, cover });
  }
}

// ---------- report ----------
const esc = (s) => (s || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim();
const clip = (s, n = 220) => (s.length > n ? s.slice(0, n) + '…' : s);
const byState = {};
for (const r of rows) (byState[r.state] ||= []).push(r);

const table = (rs, verdict) => {
  console.log(`| origin | target | original note | endpoint | annotations |${verdict ? ' verdict |' : ''}`);
  console.log(`|---|---|---|---|---|${verdict ? '---|' : ''}`);
  for (const r of rs) {
    const ep = r.found
      .map((e) => `${e.dir} ${e.type}${e.via !== 'relationships' ? ` (${e.via})` : ''}${e.note ? `: “${clip(esc(e.note))}”` : ' (bare)'}`)
      .join('<br>');
    console.log(`| ${r.originSlug || esc(r.storyTitle)} | ${r.targetSlug || esc(clip(r.targetText, 60))} | ${esc(clip(r.note)) || '—'} | ${ep || '—'} | ${r.annot.join('; ')} |${verdict ? '  |' : ''}`);
  }
  console.log('');
};

console.log(`<!-- Generated by scripts/audit-related-residue.mjs — ${rows.length} prose rows, ${bareEdges.length} endpoint bare edges. Regenerate rather than hand-editing tables; record verdicts in the verdict column. -->\n`);
console.log('# Related-link residue: row worksheet\n');
console.log(`Diff of every "Related …" prose link at the merge-base (\`${BASE}\`) against`);
console.log('endpoint frontmatter relationships (`relationships:`, `sets-up`, decision-tree');
console.log('leaves, both directions). Verdicts: *lost* (restore note/edge), *deliberate*');
console.log('(removed on purpose, nothing to do), *release* (accept removal on inspection).\n');

const withNote = (r) => r.note && r.note !== '—';
const bareNoted = (byState['bare'] || []).filter(withNote);
const bareUnnoted = (byState['bare'] || []).filter((r) => !withNote(r));

console.log(`## 1 · Edge absent (${(byState['absent'] || []).length})\n`);
console.log('No edge between the two entries in either direction.\n');
table(byState['absent'] || [], true);

console.log(`## 2 · Edge present bare, origin note dropped (${bareNoted.length})\n`);
console.log('The classic failure mode: the edge survived as a bare slug, the prose note did not.\n');
table(bareNoted, true);

console.log(`## 3 · Edge present bare, origin was bare too (${bareUnnoted.length})\n`);
console.log('Nothing was dropped; listed so the bare edge is confirmed as a deliberate seed.\n');
table(bareUnnoted, true);

console.log(`## 4 · Endpoint bare-edge inventory (${bareEdges.length})\n`);
console.log('Every note-less `relationships:` edge at the endpoint, whatever its origin.');
console.log('Per the definition of done, each one left standing must be a deliberate seed.');
console.log('"covered above" points at the worksheet section that already judges it.\n');
console.log('| entry | edge | covered above | verdict |');
console.log('|---|---|---|---|');
for (const b of bareEdges) {
  const secRef = { absent: '§1', 'with-note': '§A2 (noted edge exists between the pair)' };
  const cov = b.cover.length
    ? [...new Set(b.cover.map((c) => (c.state === 'bare' ? (withNote(c) ? '§2' : '§3') : secRef[c.state] || c.state)))].join(', ')
    : '—';
  console.log(`| ${b.slug} | ${b.edge.type} → ${b.edge.to} | ${cov} |  |`);
}
console.log('');

console.log(`## 5 · Plain-text items, no link (${(byState['plain-item'] || []).length})\n`);
console.log('Related-section items that never linked anywhere; candidates were never graph edges.\n');
table(byState['plain-item'] || [], true);

console.log(`## 6 · TODO/TBD items (${(byState['todo-item'] || []).length})\n`);
table(byState['todo-item'] || [], true);

console.log(`## 7 · Unresolved targets (${(byState['target-unknown'] || []).length})\n`);
console.log('Named things that are neither an endpoint entry nor a catalogued component.\n');
table(byState['target-unknown'] || [], true);

console.log(`## 8 · Component targets (${(byState['target-component'] || []).length})\n`);
console.log('Links from an entry to a component. Under current doctrine component realisation');
console.log('is ComponentRef prose, never an edge — so none of these can be frontmatter');
console.log('residue. Listed in case a note deserves a prose mention. "component mentioned in');
console.log('body" = the component name already appears in the entry body.\n');
table(byState['target-component'] || [], false);

console.log(`## 9 · Concept / data-viz targets (${(byState['target-concept'] || []).length + (byState['target-dataviz'] || []).length})\n`);
table([...(byState['target-concept'] || []), ...(byState['target-dataviz'] || [])], false);

console.log(`## A1 · Origins that are not entries at the endpoint (${Object.keys(originNotEntry).length} files, ${(byState['origin-not-entry'] || []).length} rows)\n`);
console.log('These files never migrated to frontmatter — their Related prose survives in');
console.log('place (verified: `packages/components/src/stories/`, `concepts/`, and BarChart');
console.log('under `packages/components/src/stories/data-visualization/`). Out of scope for');
console.log('this audit; listed for completeness.\n');
for (const [p, v] of Object.entries(originNotEntry)) console.log(`- \`${p}\` — ${v.count} links`);
console.log('');

console.log(`## A2 · Migrated with a note (${(byState['with-note'] || []).length})\n`);
console.log('Edge present and carrying a note (either direction). Presumed fine; kept for');
console.log('reference so note fidelity can be spot-checked.\n');
table(byState['with-note'] || [], false);
