#!/usr/bin/env node
// Scans src/pattern-graph.json for classification drift signals.
// Emits a markdown report to stdout. Never proposes vocabulary changes.
// Degrades gracefully when typed-edge metadata (type, label, tags) is absent.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const GRAPH_PATH = resolve(process.cwd(), 'src/pattern-graph.json');
const UNDERUSED_THRESHOLD = 3;         // edge type flagged if it has fewer edges than this
const THEMATIC_LABEL_THRESHOLD = 3;    // label repeating in >= N files → promotion candidate
const TAG_NOISE_MAX = 1;               // tag used only this many times → noise candidate
const TAG_STRUCTURE_MIN = 5;           // tag used >= this many times → structuring candidate
const RELATED_DENSITY_MIN = 8;         // node with >= this many `related` edges → flattening candidate

const graph = JSON.parse(readFileSync(GRAPH_PATH, 'utf8'));
const nodes = graph.nodes ?? [];
const edges = graph.edges ?? [];

const typed = edges.filter((e) => typeof e.type === 'string');
const labeled = edges.filter((e) => typeof e.label === 'string' && e.label.length > 0);
const taggedNodes = nodes.filter((n) => Array.isArray(n.tags) && n.tags.length > 0);

const lines = [];
const today = new Date().toISOString().slice(0, 10);
lines.push(`### Observed drift — ${today}`);
lines.push('');
lines.push(`Automated scan of \`src/pattern-graph.json\` (${nodes.length} nodes, ${edges.length} edges). Signals only; the vocabulary is unchanged until a human decides.`);
lines.push('');

if (typed.length === 0 && labeled.length === 0 && taggedNodes.length === 0) {
  lines.push('No typed-edge metadata (`type`, `label`, `tags`) present yet. Classification-health scan has nothing to report until the extractor emits typed edges and tags (see `plans/2026/april/typed-edges.md`).');
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(0);
}

const findings = [];

if (typed.length > 0) {
  const byType = new Map();
  for (const e of typed) byType.set(e.type, (byType.get(e.type) ?? 0) + 1);
  const underused = [...byType.entries()]
    .filter(([, count]) => count < UNDERUSED_THRESHOLD)
    .sort((a, b) => a[1] - b[1]);
  if (underused.length > 0) {
    findings.push([
      '*Underused edge types* (fewer than ' + UNDERUSED_THRESHOLD + ' edges)',
      underused.map(([t, c]) => `- \`${t}\` — ${c}`).join('\n'),
    ].join('\n'));
  }
}

if (labeled.length > 0) {
  const byLabel = new Map();
  for (const e of labeled) {
    const key = `${e.type ?? 'related'}::${e.label}`;
    byLabel.set(key, (byLabel.get(key) ?? 0) + 1);
  }
  const recurring = [...byLabel.entries()]
    .filter(([, count]) => count >= THEMATIC_LABEL_THRESHOLD)
    .sort((a, b) => b[1] - a[1]);
  if (recurring.length > 0) {
    findings.push([
      '*Recurring thematic labels* (candidates for promotion to a typed edge)',
      recurring.map(([k, c]) => {
        const [t, l] = k.split('::');
        return `- "${l}" on \`${t}\` — ${c} edges`;
      }).join('\n'),
    ].join('\n'));
  }
}

if (taggedNodes.length > 0) {
  const byTag = new Map();
  for (const n of taggedNodes) for (const t of n.tags) byTag.set(t, (byTag.get(t) ?? 0) + 1);
  const noise = [...byTag.entries()].filter(([, c]) => c <= TAG_NOISE_MAX).map(([t]) => t).sort();
  const structuring = [...byTag.entries()].filter(([, c]) => c >= TAG_STRUCTURE_MIN).sort((a, b) => b[1] - a[1]);
  if (noise.length > 0) {
    findings.push([
      `*Singleton tags* (used on only ${TAG_NOISE_MAX} node — noise candidates)`,
      '- ' + noise.map((t) => `\`${t}\``).join(', '),
    ].join('\n'));
  }
  if (structuring.length > 0) {
    findings.push([
      `*Heavily used tags* (≥ ${TAG_STRUCTURE_MIN} nodes — structuring candidates)`,
      structuring.map(([t, c]) => `- \`${t}\` — ${c} nodes`).join('\n'),
    ].join('\n'));
  }
}

if (typed.length > 0) {
  const relatedDensity = new Map();
  for (const e of typed) {
    if (e.type !== 'related') continue;
    relatedDensity.set(e.source, (relatedDensity.get(e.source) ?? 0) + 1);
  }
  const flattened = [...relatedDensity.entries()]
    .filter(([, c]) => c >= RELATED_DENSITY_MIN)
    .sort((a, b) => b[1] - a[1]);
  if (flattened.length > 0) {
    findings.push([
      `*High \`related\` density* (≥ ${RELATED_DENSITY_MIN} untyped edges — extractor may have flattened a distinction)`,
      flattened.map(([id, c]) => `- \`${id}\` — ${c} related edges`).join('\n'),
    ].join('\n'));
  }
}

if (findings.length === 0) {
  lines.push('No drift signals above configured thresholds.');
} else {
  lines.push(findings.join('\n\n'));
}

process.stdout.write(lines.join('\n') + '\n');
