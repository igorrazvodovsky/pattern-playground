import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

// Build-time cross-reference validator between the two surfaces of the monorepo.
//
// Site → Storybook: <ComponentRef id="components-button--docs"> in the pattern
// content must resolve to a `docs` entry in Storybook's build-output index.json.
// Storybook → site: <PatternRef slug="suggestion"> in Storybook MDX must match a
// content file in apps/patterns/src/content/patterns/ (slug = filename stem).
//
// Both checks run in one place — the site build — because the ComponentRef check
// needs Storybook's index.json (a build artifact) and the fallback-to-public copy
// only has meaning inside a site build. The PatternRef check rides along here
// rather than in the Storybook build: on the canonical root `npm run build`
// (Storybook builds first, then the site) both surfaces are gated in one pass.
// The documented coupling: a PatternRef slug typo in Storybook MDX fails the site
// build. That is deliberate — the unified build is the single gate.

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../..');

const storybookIndexPrimary = join(rootDir, 'packages/components/storybook-static/index.json');
const storybookIndexFallback = join(rootDir, 'apps/patterns/public/storybook/index.json');
const patternsContentDir = join(rootDir, 'apps/patterns/src/content');
const storyMdxDir = join(rootDir, 'packages/components/src/stories');

interface StorybookEntry {
  id: string;
  type: string;
  title?: string;
  name?: string;
}

interface StorybookIndex {
  v: number;
  entries: Record<string, StorybookEntry>;
}

interface RefUse {
  value: string;
  file: string;
  line: number;
}

interface Violation {
  file: string;
  line: number;
  message: string;
}

// Reused verbatim from scripts/extract-graph-data.ts — the MDX usage is stylised
// (id="…", slug="…"), so regex-level matching is sufficient and adds no deps.
const COMPONENT_REF_RE = /<ComponentRef\b([^>]*?)(?:\/?>|>[^<]*<\/ComponentRef>)/g;
const PATTERN_REF_RE = /<PatternRef\b([^>]*?)(?:\/?>|>[^<]*<\/PatternRef>)/g;

function extractTagAttr(attrs: string, name: string): string | undefined {
  const m = attrs.match(new RegExp(`\\b${name}="([^"]+)"`));
  return m?.[1];
}

// Mirror extract-graph-data.ts: a commented-out `{/* <ComponentRef …> */}` is not
// a live reference, so it should not be validated. Newlines inside a comment are
// preserved so reported line numbers stay accurate.
function stripComments(content: string): string {
  return content.replace(/\{\/\*[\s\S]*?\*\/\}/g, (match) => match.replace(/[^\n]/g, ' '));
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function walkMdx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkMdx(full));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function relPath(absolute: string): string {
  return absolute.startsWith(rootDir + '/') ? absolute.slice(rootDir.length + 1) : absolute;
}

function lineOf(content: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index && i < content.length; i++) {
    if (content[i] === '\n') line++;
  }
  return line;
}

/** Collect every `attr` value from `<Tag …>` occurrences, with file + line. */
function collectRefs(files: string[], tagRe: RegExp, attr: string): RefUse[] {
  const uses: RefUse[] = [];
  for (const file of files) {
    const content = stripComments(readFileSync(file, 'utf-8'));
    tagRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(content)) !== null) {
      const value = extractTagAttr(m[1], attr);
      if (value) uses.push({ value, file, line: lineOf(content, m.index) });
    }
  }
  return uses;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

/** Nearest valid candidate to `target`, if within a typo-scale distance. */
function nearest(target: string, candidates: Iterable<string>): string | undefined {
  let best: string | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const distance = levenshtein(target, candidate);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }
  const threshold = Math.max(3, Math.ceil(target.length * 0.34));
  return best !== undefined && bestDistance <= threshold ? best : undefined;
}

function loadStorybookIndex(logger: AstroIntegrationLogger): StorybookIndex {
  let indexPath: string;
  if (fileExists(storybookIndexPrimary)) {
    indexPath = storybookIndexPrimary;
  } else if (fileExists(storybookIndexFallback)) {
    indexPath = storybookIndexFallback;
    logger.warn(
      `Storybook build output not found at ${relPath(storybookIndexPrimary)}; ` +
        `falling back to ${relPath(storybookIndexFallback)}. That copy is only ` +
        'refreshed by `npm run build:storybook-into-patterns` and may be stale — ' +
        'ComponentRef ids are validated against a possibly-outdated catalogue.',
    );
  } else {
    throw new Error(
      'Cross-reference validation cannot run: no Storybook index.json found at ' +
        `${relPath(storybookIndexPrimary)} or ${relPath(storybookIndexFallback)}. ` +
        'Run `npm run build-storybook` (or the root `npm run build`, which builds ' +
        'Storybook first) before building the site.',
    );
  }

  const raw = readFileSync(indexPath, 'utf-8');
  const parsed = JSON.parse(raw) as StorybookIndex;
  logger.info(`Resolving <ComponentRef> ids against ${relPath(indexPath)}.`);
  return parsed;
}

/** Every `<ComponentRef id>` in content must resolve to a Storybook `docs` entry. */
function checkComponentRefs(index: StorybookIndex, logger: AstroIntegrationLogger): Violation[] {
  // `/docs/<id>` resolves to a docs entry; story ids are not valid ComponentRef targets.
  const docsIds = new Set(
    Object.values(index.entries)
      .filter((entry) => entry.type === 'docs')
      .map((entry) => entry.id),
  );

  const uses = collectRefs(walkMdx(patternsContentDir), COMPONENT_REF_RE, 'id');
  const violations: Violation[] = [];
  for (const use of uses) {
    if (docsIds.has(use.value)) continue;
    const suggestion = nearest(use.value, docsIds);
    violations.push({
      file: relPath(use.file),
      line: use.line,
      message:
        `<ComponentRef id="${use.value}"> does not resolve to a Storybook docs entry` +
        (suggestion ? ` — did you mean "${suggestion}"?` : '.'),
    });
  }
  logger.info(`Checked ${uses.length} <ComponentRef> id(s) against ${docsIds.size} docs entries.`);
  return violations;
}

/** Every `<PatternRef slug>` in Storybook MDX must match a content file stem. */
function checkPatternRefs(logger: AstroIntegrationLogger): Violation[] {
  // Route space is the content collection: both .mdx and .md files back a
  // `/patterns/<stem>` page (e.g. qualities.md), so both are valid slug targets.
  const stems = new Set(
    readdirSync(join(patternsContentDir, 'patterns'))
      .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
      .map((name) => name.replace(/\.mdx?$/, '')),
  );

  const uses = collectRefs(walkMdx(storyMdxDir), PATTERN_REF_RE, 'slug');
  const violations: Violation[] = [];
  for (const use of uses) {
    const stem = use.value.replace(/^\//, '').replace(/^patterns\//, '').replace(/#.*$/, '');
    if (stems.has(stem)) continue;
    const suggestion = nearest(stem, stems);
    violations.push({
      file: relPath(use.file),
      line: use.line,
      message:
        `<PatternRef slug="${use.value}"> matches no pattern at ` +
        `apps/patterns/src/content/patterns/${stem}.mdx` +
        (suggestion ? ` — did you mean "${suggestion}"?` : '.'),
    });
  }
  logger.info(`Checked ${uses.length} <PatternRef> slug(s) against ${stems.size} content stems.`);
  return violations;
}

export default function validateCrossReferences(): AstroIntegration {
  return {
    name: 'validate-cross-references',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const index = loadStorybookIndex(logger);
        // Collect both checks and report once, so a build doesn't fail on the
        // ComponentRef pass, get fixed, then fail again on the PatternRef pass.
        const violations = [...checkComponentRefs(index, logger), ...checkPatternRefs(logger)];

        if (violations.length > 0) {
          const report = violations
            .map((v) => `  ${v.file}:${v.line}\n    ${v.message}`)
            .join('\n');
          throw new Error(
            `Cross-reference validation failed — ${violations.length} broken reference(s):\n${report}`,
          );
        }

        logger.info('Cross-reference validation passed.');
      },
    },
  };
}
