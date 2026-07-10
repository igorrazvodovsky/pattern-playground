/**
 * Migrate pattern MDX files from packages/components/src/stories/ to
 * apps/patterns/src/content/patterns/. Transforms <Meta> tags to YAML
 * frontmatter, rewrites Storybook inter-page links, removes Storybook-specific
 * imports and story embeds.
 *
 * Usage: npx tsx scripts/migrate-patterns.ts [--dry-run] [--overwrite]
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename, relative, extname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const storiesDir = join(root, 'packages/components/src/stories');
const contentDir = join(root, 'apps/patterns/src/content/patterns');

const DRY_RUN = process.argv.includes('--dry-run');
const OVERWRITE = process.argv.includes('--overwrite');

// ─── helpers ────────────────────────────────────────────────────────────────

function toKebab(s: string): string {
  return s
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')  // ACRONYMWord → ACRONYM-Word
    .replace(/([a-z\d])([A-Z])/g, '$1-$2')        // camelCase → camel-Case
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function srcToDestPath(srcPath: string): string {
  const rel = relative(storiesDir, srcPath);           // e.g. actions/seeking/Filtering.mdx
  const parts = rel.split('/');
  const file = parts[parts.length - 1];
  const dirs = parts.slice(0, -1).map((d) => toKebab(d));
  const name = toKebab(basename(file, extname(file)));
  return join(contentDir, ...dirs, `${name}.mdx`);
}

// ─── build link-rewrite map ──────────────────────────────────────────────────
// Maps old Storybook URL fragment  ../?path=/docs/<id>--docs
// to new pattern site route        /patterns/<path>

function sbIdFromTitle(title: string): string {
  return title.toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function destPathToRoute(destPath: string): string {
  const rel = relative(contentDir, destPath).replace(/\.mdx$/, '');
  return `/patterns/${rel}`;
}

// Collect title→destPath from all migratable source files
const linkMap = new Map<string, string>(); // Storybook URL → new route

function extractTitle(src: string, content: string): string | null {
  // <Meta title="...">
  const m = content.match(/<Meta\s[^>]*title=["']([^"']+)["']/);
  if (m) return m[1];
  // <Meta of={XxxStories}> → read stories file for title
  const ofMatch = content.match(/<Meta\s[^>]*of=\{\s*(\w+)\s*\}/);
  if (ofMatch) {
    const importMatch = content.match(new RegExp(`import \\* as ${ofMatch[1]} from ['"]([^'"]+)['"]`));
    if (importMatch) {
      const storiesPath = join(dirname(src), importMatch[1]);
      const candidates = [storiesPath, storiesPath + '.tsx', storiesPath + '.ts'];
      for (const c of candidates) {
        if (existsSync(c)) {
          const sf = readFileSync(c, 'utf8');
          const tm = sf.match(/title:\s*['"]([^'"]+)['"]/);
          if (tm) return tm[1];
        }
      }
    }
  }
  return null;
}

// ─── per-file role detection ──────────────────────────────────────────────────

type Role = 'pattern' | 'umbrella' | 'quality' | 'foundation' | 'component';

function detectRole(srcPath: string, content: string): Role | null {
  const tagMatch = content.match(/role:(pattern|umbrella|quality|foundation|component)/);
  if (tagMatch) return tagMatch[1] as Role;
  if (srcPath.includes('/foundations/')) return 'foundation';
  if (srcPath.includes('/qualities/')) return 'quality';
  return null;
}

// ─── content transformation ───────────────────────────────────────────────────

interface Frontmatter {
  title: string;
  role: Role;
  activityLevel?: string;
  atomic?: string;
  mediation?: string;
  lifecycle?: string;
}

function parseTags(content: string): Partial<Frontmatter> {
  const fm: Partial<Frontmatter> = {};
  const alm = content.match(/activity-level:(operation|action|activity)/);
  if (alm) fm.activityLevel = alm[1];
  const atm = content.match(/atomic:(primitive|component|composition|pattern)/);
  if (atm) fm.atomic = atm[1];
  const mm = content.match(/mediation:(individual|coordination)/);
  if (mm) fm.mediation = mm[1];
  const lm = content.match(/lifecycle:(seeking|evaluation|coordination)/);
  if (lm) fm.lifecycle = lm[1];
  return fm;
}

function buildFrontmatter(fm: Frontmatter): string {
  const lines = ['---', `title: ${JSON.stringify(fm.title)}`, `role: ${fm.role}`];
  if (fm.activityLevel) lines.push(`activityLevel: ${fm.activityLevel}`);
  if (fm.atomic) lines.push(`atomic: ${fm.atomic}`);
  if (fm.mediation) lines.push(`mediation: ${fm.mediation}`);
  if (fm.lifecycle) lines.push(`lifecycle: ${fm.lifecycle}`);
  lines.push('---');
  return lines.join('\n') + '\n';
}

function transformContent(srcPath: string, rawContent: string, fm: Frontmatter): string {
  let c = rawContent;

  // Remove Storybook imports
  c = c.replace(/^import\s+[^'"\n]+from\s+['"]@storybook\/[^'"]+['"]\s*;?\n/gm, '');
  // Remove any import whose source path ends with .stories or .stories.tsx
  c = c.replace(/^import\s+[^'"]*from\s+['"][^'"]*\.stories(?:\.tsx?)?['"]\s*;?\n/gm, '');
  // Remove getRandomIcon utility import
  c = c.replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]+\/icons['"]\s*;?\n/gm, '');
  // Update MermaidDiagram import to use workspace alias
  c = c.replace(
    /^import\s+\{\s*MermaidDiagram\s*\}\s+from\s+['"][^'"]+\/MermaidDiagram(?:\.tsx)?['"]\s*;?/gm,
    "import { MermaidDiagram } from '@components/MermaidDiagram';"
  );

  // Remove <Meta ... /> (single or multi-line)
  c = c.replace(/<Meta\s[^>]*\/>\n?/gs, '');
  c = c.replace(/<Meta\s[\s\S]*?\/>\n?/g, '');

  // Remove <Story ... /> and <Story>...</Story> blocks
  c = c.replace(/<Story[^>]*\/>\n?/g, '');
  c = c.replace(/<Story[\s\S]*?<\/Story>\n?/g, '');

  // Remove <Canvas ... /> and <Canvas>...</Canvas> blocks
  c = c.replace(/<Canvas[^>]*\/>\n?/g, '');
  c = c.replace(/<Canvas[\s\S]*?<\/Canvas>\n?/g, '');

  // Rewrite Storybook links — format: ../?path=/docs/<id>--docs or ./?path=/docs/<id>--docs
  c = c.replace(/\.\.?\/\?path=\/docs\/([a-z0-9-]+)--docs/g, (_match, id) => {
    const mapped = linkMap.get(id);
    return mapped ?? `/patterns/${id}`;
  });

  // Prepend frontmatter (file had no YAML frontmatter originally)
  return buildFrontmatter(fm) + '\n' + c.trimStart();
}

// ─── first pass: build link map ───────────────────────────────────────────────

const allMdx = globSync('**/*.mdx', { cwd: storiesDir, absolute: true });
for (const srcPath of allMdx) {
  const content = readFileSync(srcPath, 'utf8');
  const role = detectRole(srcPath, content);
  if (!role || role === 'component') continue;

  const title = extractTitle(srcPath, content);
  if (!title) continue;

  const sbId = sbIdFromTitle(title);
  const destPath = srcToDestPath(srcPath);
  const route = destPathToRoute(destPath);
  linkMap.set(sbId, route);
}

console.log(`Link map: ${linkMap.size} entries`);

// ─── second pass: migrate files ───────────────────────────────────────────────

let migrated = 0, skipped = 0, errors = 0;

for (const srcPath of allMdx) {
  const content = readFileSync(srcPath, 'utf8');
  const role = detectRole(srcPath, content);
  if (!role || role === 'component') continue;

  // Skip overview files
  if (basename(srcPath, '.mdx').toLowerCase() === 'overview') continue;

  const title = extractTitle(srcPath, content);
  if (!title) {
    console.warn(`WARN: no title found — ${relative(root, srcPath)}`);
    errors++;
    continue;
  }

  const shortTitle = title.split('/').pop()!;
  const destPath = srcToDestPath(srcPath);

  if (!OVERWRITE && existsSync(destPath)) {
    skipped++;
    continue;
  }

  const tags = parseTags(content);
  const fm: Frontmatter = { title: shortTitle, role, ...tags };

  try {
    const transformed = transformContent(srcPath, content, fm);
    if (!DRY_RUN) {
      mkdirSync(dirname(destPath), { recursive: true });
      writeFileSync(destPath, transformed, 'utf8');
    }
    migrated++;
    if (DRY_RUN) {
      console.log(`  [dry] ${relative(root, srcPath)} → ${relative(root, destPath)}`);
    }
  } catch (e) {
    console.error(`ERROR: ${relative(root, srcPath)}: ${e}`);
    errors++;
  }
}

console.log(`\nMigration complete:`);
console.log(`  MDX:     ${migrated} migrated, ${skipped} skipped (already exist), ${errors} errors`);
if (DRY_RUN) console.log(`\n(dry run — no files written)`);
