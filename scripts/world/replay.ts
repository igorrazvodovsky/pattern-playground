// Replays shared/world/actions.json from the empty world and writes the
// resulting fact set to shared/world/facts.json. The committed facts file is
// generated output; this script is the only writer.
//
// Enforced while replaying:
// - records are unique by id and chronologically ordered;
// - actors and fact subjects are registered individuals (subjects must have a
//   kind the relation declares in relations.json);
// - an action's adds/removes stay within its action-types.json declaration;
// - cardinality: a one-cardinality add replaces the subject's previous value,
//   a many-cardinality add accumulates (duplicates are errors), and every
//   explicit remove must match a fact that currently holds;
// - causedBy cites earlier actions only; viaRule cites a declared rule;
// - rules fire everywhere they match, and nowhere they do not.
//
// What the registries mean: docs/specs/world-ontology.md.
//
// Usage: npx tsx scripts/world/replay.ts [--check]
//   --check  regenerate and compare with the committed facts.json; exit 1 on
//            drift instead of writing.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const worldDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../shared/world');
const read = (file: string) => JSON.parse(readFileSync(resolve(worldDir, file), 'utf8'));

interface Fact { relation: string; subject: string; object?: unknown }
interface ActionRecord {
  id: string; name: string; actor: string; timestamp: string;
  input: Record<string, unknown>; output?: Record<string, unknown>;
  adds?: Fact[]; removes?: Fact[]; causedBy?: string[]; viaRule?: string;
}
interface RelationDecl { subject: string[]; object?: 'id' | 'value'; cardinality: 'one' | 'many' }

const individuals: { id: string; kind: string }[] = read('individuals.json');
const actions: ActionRecord[] = read('actions.json');
const relations: Record<string, RelationDecl> = read('relations.json');
const actionTypes: Record<string, { adds: string[]; removes: string[] }> = read('action-types.json');
const rules: { id: string }[] = read('rules.json');

const kindOf = new Map(individuals.map(i => [i.id, i.kind]));
const ruleIds = new Set(rules.map(r => r.id));
const errors: string[] = [];
const fail = (msg: string) => { errors.push(msg); };

const factKey = (f: Fact) => `${f.relation} ${f.subject}`;
// Fact objects may be structured values (a document body, a selection range),
// so identity is structural rather than referential.
const sameObject = (a?: unknown, b?: unknown): boolean => {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ak = Object.keys(a), bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  return ak.every(k => k in b && sameObject((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
};

const seenIds = new Set<string>();
let prevTs = '';
for (const a of actions) {
  if (seenIds.has(a.id)) fail(`${a.id}: duplicate id`);
  seenIds.add(a.id);
  if (a.timestamp < prevTs) fail(`${a.id}: out of chronological order (${a.timestamp} after ${prevTs})`);
  prevTs = a.timestamp;
}

const oneFacts = new Map<string, Fact>();          // factKey -> fact (cardinality one)
const manyFacts = new Map<string, Fact[]>();       // factKey -> facts (cardinality many)
const order: Fact[] = [];                          // insertion order of live facts

const removeLive = (f: Fact) => { const i = order.indexOf(f); if (i >= 0) order.splice(i, 1); };

/** The object of a one-cardinality fact as it stands at this point in the replay. */
const holds = (relation: string, subject: string) => oneFacts.get(factKey({ relation, subject }))?.object;

// A rule fires everywhere it matches, and this is what checks it. The `where`
// clauses in rules.json are prose in the paper's notation, so each rule carries
// a matcher here rather than a parser being written for four of them: the rule
// states the reaction, the matcher decides whether a given action satisfies it.
// Every declared rule must have a matcher and every matcher a declared rule, so
// the two cannot drift apart unnoticed. Conditions are read against the world
// as it stands when the trigger has just applied, which is when a rule sees it.
interface Matcher { on: string; matches: (a: ActionRecord) => boolean }

const matchers: Record<string, Matcher> = {
  'rule-auto-triage': {
    on: 'createTask',
    matches: a => {
      const task = String(a.output?.taskId ?? '');
      return holds('status', task) === 'status-backlog' && holds('priority', task) === 'priority-high';
    },
  },
  'rule-notify-completion': {
    on: 'completeTask',
    matches: a => {
      const creator = holds('createdBy', String(a.input.taskId));
      return creator !== undefined && creator !== a.actor;
    },
  },
  'rule-notify-comment': {
    on: 'addComment',
    matches: a => {
      const target = String(a.input.targetId);
      if (kindOf.get(target) !== 'document') return false;
      const creator = holds('createdBy', target);
      return creator !== undefined && creator !== a.actor;
    },
  },
  // Uploaded files arrive finished, so uploadFile is deliberately not watched.
  'rule-suggest-outline': { on: 'createDocument', matches: () => true },
};

for (const rule of rules) if (!matchers[rule.id]) fail(`rules.json: ${rule.id} has no matcher in replay.ts`);
for (const id of Object.keys(matchers)) if (!ruleIds.has(id)) fail(`replay.ts: matcher for undeclared rule ${id}`);

/** Every (rule, trigger) pair the log implies, collected as the replay passes each trigger. */
const matched: { rule: string; trigger: string }[] = [];

for (const a of actions) {
  const type = actionTypes[a.name];
  if (!type) { fail(`${a.id}: unknown action type "${a.name}"`); continue; }
  if (a.actor !== 'system' && !kindOf.has(a.actor)) fail(`${a.id}: unregistered actor ${a.actor}`);
  for (const ref of a.causedBy ?? []) {
    const cause = actions.find(c => c.id === ref);
    if (!cause) fail(`${a.id}: causedBy references missing action ${ref}`);
    else if (cause.timestamp > a.timestamp) fail(`${a.id}: causedBy ${ref} is later than the action`);
  }
  if (a.viaRule && !ruleIds.has(a.viaRule)) fail(`${a.id}: viaRule references missing rule ${a.viaRule}`);
  if (a.viaRule && !a.causedBy?.length) fail(`${a.id}: viaRule without causedBy`);

  for (const f of a.removes ?? []) {
    if (!type.removes.includes(f.relation)) fail(`${a.id}: action type "${a.name}" may not remove "${f.relation}"`);
    const decl = relations[f.relation];
    if (!decl) { fail(`${a.id}: unknown relation "${f.relation}"`); continue; }
    if (decl.cardinality === 'one') {
      const live = oneFacts.get(factKey(f));
      if (!live || !sameObject(live.object, f.object)) fail(`${a.id}: removes ${f.relation}(${f.subject}, ${String(f.object)}) which does not hold`);
      else { oneFacts.delete(factKey(f)); removeLive(live); }
    } else {
      const list = manyFacts.get(factKey(f)) ?? [];
      const idx = list.findIndex(l => sameObject(l.object, f.object));
      if (idx < 0) fail(`${a.id}: removes ${f.relation}(${f.subject}, ${String(f.object)}) which does not hold`);
      else { removeLive(list[idx]); list.splice(idx, 1); }
    }
  }

  for (const f of a.adds ?? []) {
    if (!type.adds.includes(f.relation)) fail(`${a.id}: action type "${a.name}" may not add "${f.relation}"`);
    const decl = relations[f.relation];
    if (!decl) { fail(`${a.id}: unknown relation "${f.relation}"`); continue; }
    const subjectKind = kindOf.get(f.subject);
    if (!subjectKind) fail(`${a.id}: fact subject ${f.subject} is not a registered individual`);
    else if (!decl.subject.includes(subjectKind)) fail(`${a.id}: relation "${f.relation}" does not accept subject kind "${subjectKind}"`);
    if (decl.object === 'id' && typeof f.object === 'string' && !kindOf.has(f.object)) {
      fail(`${a.id}: relation "${f.relation}" expects a registered individual as object, got ${String(f.object)}`);
    }
    const fact: Fact = { relation: f.relation, subject: f.subject, ...(f.object !== undefined ? { object: f.object } : {}) };
    if (decl.cardinality === 'one') {
      const prior = oneFacts.get(factKey(f));
      if (prior) removeLive(prior);              // replace-on-assert
      oneFacts.set(factKey(f), fact);
      order.push(fact);
    } else {
      const list = manyFacts.get(factKey(f)) ?? [];
      if (list.some(l => sameObject(l.object, f.object))) fail(`${a.id}: duplicate many-fact ${f.relation}(${f.subject}, ${String(f.object)})`);
      list.push(fact);
      manyFacts.set(factKey(f), list);
      order.push(fact);
    }
  }

  for (const [rule, matcher] of Object.entries(matchers)) {
    if (matcher.on === a.name && matcher.matches(a)) matched.push({ rule, trigger: a.id });
  }
}

// Both directions: a match that produced nothing, and a caused action citing a
// rule that none of its triggers satisfies.
for (const { rule, trigger } of matched) {
  if (!actions.some(c => c.viaRule === rule && c.causedBy?.includes(trigger))) {
    fail(`${trigger}: ${rule} matches but no caused action cites it`);
  }
}
for (const a of actions) {
  if (!a.viaRule || !matchers[a.viaRule]) continue;
  const licensed = (a.causedBy ?? []).some(t => matched.some(m => m.rule === a.viaRule && m.trigger === t));
  if (!licensed) fail(`${a.id}: viaRule ${a.viaRule} cites no trigger the rule matches`);
}

if (errors.length) {
  console.error(`world replay: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const output = {
  generatedBy: 'scripts/world/replay.ts — generated by replaying actions.json; do not edit',
  count: order.length,
  facts: order,
};
const serialized = JSON.stringify(output, null, 2) + '\n';
const target = resolve(worldDir, 'facts.json');

if (process.argv.includes('--check')) {
  let committed = '';
  try { committed = readFileSync(target, 'utf8'); } catch { /* missing counts as drift */ }
  if (committed !== serialized) {
    console.error('world replay: facts.json is stale — run `npx tsx scripts/world/replay.ts`');
    process.exit(1);
  }
  console.log(`world replay: facts.json is current (${order.length} facts from ${actions.length} actions)`);
} else {
  writeFileSync(target, serialized);
  console.log(`world replay: wrote ${order.length} facts from ${actions.length} actions`);
}
