import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Guards the style boundary between the patterns site and the component library
// (see plans/*/2026-07-style-boundary.md). Two invariants, both cheap to break
// by accident and silent when broken:
//
//   1. Library containment. The library must stay layerable so the site can pull
//      it under a single `lib` cascade layer and outrank it without `!important`.
//      That needs (a) lib.css importing every library entry `layer(lib)`, and
//      (b) every file a library entry imports being layer-contained — either the
//      import carries `layer(...)` or the file declares `@layer` internally. A
//      brand-new component file wired in with neither escapes into unlayered
//      author styles, which beat every layer and silently reopen the war the
//      split closed (this is exactly the 20-file leak the split fixed).
//
//   2. Prose stays in the donut. The site's prose voice (list markers, link
//      underlines, blockquote voice) is authored inside `@scope (…) to
//      (.demo-block, pp-toc)` so it structurally cannot reach a demo. A prose
//      selector re-added OUTSIDE that scope in app.css / stack.css leaks back
//      into demos. We flag any rule that pairs a prose root (`.pane` /
//      `.content-inset`) with a descendant flow element (`ul`/`ol`/`li`/
//      `blockquote`) outside a `@scope` block.

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const stylesDir = resolve(root, 'packages/components/src/styles');
const siteStylesDir = resolve(root, 'apps/patterns/src/styles');

const ENTRIES = ['tokens.css', 'base.css', 'components.css'];
const LIB_CSS = resolve(siteStylesDir, 'lib.css');
const PROSE_SHEETS = ['app.css', 'stack.css'];

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const problems = [];

// --- Invariant 1a: lib.css wraps every entry in layer(lib) --------------------
{
  const css = stripComments(readFileSync(LIB_CSS, 'utf8'));
  for (const entry of ENTRIES) {
    const re = new RegExp(`@import\\s+url\\(['"]?[^)]*${entry}['"]?\\)([^;]*);`);
    const m = css.match(re);
    if (!m) {
      problems.push(`lib.css does not import ${entry}; the site can't pull it under the lib layer.`);
    } else if (!/layer\(\s*lib\s*\)/.test(m[1])) {
      problems.push(`lib.css imports ${entry} without \`layer(lib)\` — library rules escape the lib layer and can out-shout site rules.`);
    }
  }
}

// --- Invariant 1b: every entry-imported file is layer-contained ----------------
const declaresLayer = (file) => /@layer\b/.test(stripComments(readFileSync(resolve(stylesDir, file), 'utf8')));

for (const entry of ENTRIES) {
  const css = stripComments(readFileSync(resolve(stylesDir, entry), 'utf8'));
  const re = /@import\s+url\(([^)]+)\)([^;]*);/g;
  let m;
  while ((m = re.exec(css))) {
    const file = m[1].replace(/['"]/g, '').trim();
    const hasLayerAtImport = /layer\(/.test(m[2]);
    if (hasLayerAtImport) continue;
    let internal;
    try {
      internal = declaresLayer(file);
    } catch {
      problems.push(`${entry} imports ${file}, which does not exist.`);
      continue;
    }
    if (!internal) {
      problems.push(
        `${entry} imports ${file} with neither \`layer(...)\` at the import nor an internal \`@layer\` — its rules escape into unlayered author styles. Add \`layer(components)\` (or the fitting layer) to the import.`,
      );
    }
  }
}

// --- Invariant 2: prose selectors live inside @scope ---------------------------
// Remove every @scope{…} block (brace-matched), then look for prose-root +
// descendant flow-element selectors in what remains.
function stripScopeBlocks(css) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@scope', i);
    if (at === -1) {
      out += css.slice(i);
      break;
    }
    out += css.slice(i, at);
    // find the opening brace of this @scope prelude, then match to its close
    const open = css.indexOf('{', at);
    if (open === -1) break;
    let depth = 1;
    let j = open + 1;
    for (; j < css.length && depth > 0; j++) {
      if (css[j] === '{') depth++;
      else if (css[j] === '}') depth--;
    }
    i = j; // resume after the closing brace
  }
  return out;
}

const PROSE_ROOT = /\.pane\b|\.content-inset\b/;
const FLOW_ELEMENT = /(^|[\s>+~(])(ul|ol|li|blockquote)([\s>+~:.,)]|$)/;
const SCOPE_LIMIT = /pp-toc|\.demo-block|\.toc-rail/;

for (const sheet of PROSE_SHEETS) {
  const css = stripScopeBlocks(stripComments(readFileSync(resolve(siteStylesDir, sheet), 'utf8')));
  // Each prelude is the text before a `{`; test its comma-separated selectors.
  const preludeRe = /([^{}]*)\{/g;
  let m;
  while ((m = preludeRe.exec(css))) {
    const prelude = m[1];
    if (prelude.trim().startsWith('@')) continue; // at-rule prelude (media, etc.)
    for (const sel of prelude.split(',')) {
      if (PROSE_ROOT.test(sel) && FLOW_ELEMENT.test(sel) && !SCOPE_LIMIT.test(sel)) {
        problems.push(
          `${sheet}: prose selector \`${sel.trim()}\` targets flow elements under a prose root outside \`@scope\` — it will leak into demos. Author it inside the \`@scope (…) to (.demo-block, pp-toc)\` block.`,
        );
      }
    }
  }
}

if (problems.length) {
  console.error('Style boundary check FAILED:\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error(
    '\nSee plans/*/2026-07-style-boundary.md for the boundary design.',
  );
  process.exit(1);
}
console.log('Style boundary check passed.');
