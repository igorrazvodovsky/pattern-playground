import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';

// Build-time validator that every static reference resolves to its target.
// The reference seams, and why they are all gated in the site build, are defined
// in docs/specs/workspace-layout.md §Cross-surface integrity; the evidence →
// references/ seam in docs/specs/pattern-site.md §Epistemic status.
//
// `<ComponentRef id>` and frontmatter `realised_by` resolve against Storybook's
// build-output index.json. When that output is absent, a cached copy under
// apps/patterns/storybook-index/ (refreshed by the root build, never deployed)
// stands in, so a standalone site build can still validate.

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '../../..');

const storybookIndexPrimary = join(rootDir, 'packages/components/storybook-static/index.json');
const storybookIndexFallback = join(rootDir, 'apps/patterns/storybook-index/index.json');
const patternsContentDir = join(rootDir, 'apps/patterns/src/content');
const storyMdxDir = join(rootDir, 'packages/components/src/stories');
const referencesDir = join(rootDir, 'references');
// .astro/.tsx surfaces whose template bodies carry authored `/patterns/` hrefs in
// page prose (e.g. index.astro). Content is scanned separately, as markdown.
const astroScanDirs = ['src/pages', 'src/layouts', 'src/components'].map((dir) =>
  join(rootDir, 'apps/patterns', dir),
);

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

// Anchors (`#…`) are stripped; the char class includes `/`, so a nested legacy
// slug like `foundations/material/layout` is captured whole and fails as one
// unit. The .astro form matches `href="…"` only — never the markdown form — so a
// `](/patterns/slug)` example inside a code comment can't false-flag; dynamic
// `href={`/patterns/${…}`}` uses backticks and is skipped.
const CONTENT_LINK_RE = /\]\(\/patterns\/([A-Za-z0-9/_-]+)(?:#[A-Za-z0-9/_-]*)?\)/g;
const ASTRO_LINK_RE = /href=(["'])\/patterns\/([A-Za-z0-9/_-]+)(?:#[A-Za-z0-9/_-]*)?\1/g;

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

// Blank out comments in .astro/.tsx so an href example inside one isn't validated.
// Block forms only ({/* */}, /* */, <!-- -->); `//` is left alone — it isn't a
// comment in .astro template bodies, and the href-only matcher never coincides
// with a `//` sequence, so stripping it would only risk blanking a real href.
function stripCodeComments(content: string): string {
  const blank = (match: string) => match.replace(/[^\n]/g, ' ');
  return content
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, blank)
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/<!--[\s\S]*?-->/g, blank);
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function walk(dir: string, exts: readonly string[]): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.obsidian' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function walkMdx(dir: string): string[] {
  return walk(dir, ['.mdx', '.md']);
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

// `strip` blanks comments for the file kind: JSX for content, block for .astro/.tsx.
function collectLinks(
  files: string[],
  re: RegExp,
  group: number,
  strip: (content: string) => string,
): RefUse[] {
  const uses: RefUse[] = [];
  for (const file of files) {
    const content = strip(readFileSync(file, 'utf-8'));
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      uses.push({ value: m[group], file, line: lineOf(content, m.index) });
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
        'refreshed by `npm run build:storybook-index` and may be stale — ' +
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

interface ParsedFile {
  file: string;
  content: string;
  fm: Record<string, unknown>;
}

// Malformed YAML is skipped — it fails the content build on its own, with a
// better message than this.
function frontmatterFiles(): ParsedFile[] {
  const parsed: ParsedFile[] = [];
  for (const file of walkMdx(patternsContentDir)) {
    const content = readFileSync(file, 'utf-8');
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;
    try {
      parsed.push({ file, content, fm: (yamlLoad(fmMatch[1]) ?? {}) as Record<string, unknown> });
    } catch {
      continue;
    }
  }
  return parsed;
}

function checkRealisedBy(index: StorybookIndex, logger: AstroIntegrationLogger): Violation[] {
  const docsIds = new Set(
    Object.values(index.entries)
      .filter((entry) => entry.type === 'docs')
      .map((entry) => entry.id),
  );

  const violations: Violation[] = [];
  let checked = 0;
  for (const { file, fm } of frontmatterFiles()) {
    if (!Array.isArray(fm.realised_by)) continue;
    for (const id of fm.realised_by) {
      if (typeof id !== 'string') continue;
      checked++;
      if (docsIds.has(id)) continue;
      const suggestion = nearest(id, docsIds);
      violations.push({
        file: relPath(file),
        line: 1,
        message:
          `realised_by: "${id}" does not resolve to a Storybook docs entry` +
          (suggestion ? ` — did you mean "${suggestion}"?` : '.'),
      });
    }
  }
  logger.info(`Checked ${checked} realised_by id(s) against ${docsIds.size} docs entries.`);
  return violations;
}

// Keyed both exactly and by a slug-normalised form, so `ref: design-patterns`
// resolves to `references/Design patterns.md` without making the author
// reproduce the capital and the space.
function referenceStems(): { canonical: Set<string>; byNormalised: Map<string, string> } {
  const canonical = new Set<string>();
  const byNormalised = new Map<string, string>();
  const normalise = (value: string) => value.toLowerCase().replace(/[\s_]+/g, '-');
  for (const entry of readdirSync(referencesDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const stem = entry.isDirectory() ? entry.name : entry.name.replace(/\.[^.]+$/, '');
    canonical.add(stem);
    byNormalised.set(normalise(stem), stem);
  }
  return { canonical, byNormalised };
}

// The schema (content.config.ts) has already closed the `kind` set and confined
// `ref` to `literature`; what it cannot see is whether the file exists.
function checkEvidenceRefs(logger: AstroIntegrationLogger): Violation[] {
  const { canonical, byNormalised } = referenceStems();
  const normalise = (value: string) => value.toLowerCase().replace(/[\s_]+/g, '-');

  const violations: Violation[] = [];
  let checked = 0;
  for (const { file, content, fm } of frontmatterFiles()) {
    if (!Array.isArray(fm.evidence)) continue;
    for (const entry of fm.evidence) {
      if (typeof entry !== 'object' || entry === null) continue;
      const ref = (entry as { ref?: unknown }).ref;
      if (typeof ref !== 'string') continue;
      checked++;
      if (canonical.has(ref) || byNormalised.has(normalise(ref))) continue;
      const suggestion = nearest(ref, canonical);
      const index = content.indexOf(ref);
      violations.push({
        file: relPath(file),
        line: index === -1 ? 1 : lineOf(content, index),
        message:
          `evidence ref: "${ref}" names no entry in references/` +
          (suggestion ? ` — did you mean "${suggestion}"?` : '.'),
      });
    }
  }
  logger.info(`Checked ${checked} evidence ref(s) against ${canonical.size} references/ entries.`);
  return violations;
}

// Both .mdx and .md files in the content collection back a page (e.g.
// qualities.md), so both are valid slug targets.
function contentStems(): Set<string> {
  return new Set(
    readdirSync(join(patternsContentDir, 'patterns'))
      .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
      .map((name) => name.replace(/\.mdx?$/, '')),
  );
}

function checkPatternRefs(logger: AstroIntegrationLogger): Violation[] {
  const stems = contentStems();

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

function checkIntraSiteLinks(logger: AstroIntegrationLogger): Violation[] {
  const stems = contentStems();

  const uses = [
    ...collectLinks(walkMdx(patternsContentDir), CONTENT_LINK_RE, 1, stripComments),
    ...astroScanDirs.flatMap((dir) =>
      collectLinks(walk(dir, ['.astro', '.tsx']), ASTRO_LINK_RE, 2, stripCodeComments),
    ),
  ];

  const violations: Violation[] = [];
  for (const use of uses) {
    if (stems.has(use.value)) continue;
    const suggestion = nearest(use.value, stems);
    violations.push({
      file: relPath(use.file),
      line: use.line,
      message:
        `/patterns/${use.value} resolves to no pattern route ` +
        `(apps/patterns/src/content/patterns/${use.value}.{md,mdx})` +
        (suggestion ? ` — did you mean "/patterns/${suggestion}"?` : '.'),
    });
  }
  logger.info(`Checked ${uses.length} intra-site /patterns/ link(s) against ${stems.size} content stems.`);
  return violations;
}

export default function validateCrossReferences(): AstroIntegration {
  return {
    name: 'validate-cross-references',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const index = loadStorybookIndex(logger);
        // Report once across every check, so a build doesn't fail on the
        // ComponentRef pass, get fixed, then fail again on the next pass.
        const violations = [
          ...checkComponentRefs(index, logger),
          ...checkRealisedBy(index, logger),
          ...checkEvidenceRefs(logger),
          ...checkPatternRefs(logger),
          ...checkIntraSiteLinks(logger),
        ];

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
