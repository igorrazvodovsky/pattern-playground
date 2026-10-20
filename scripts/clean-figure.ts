// Turns a tldraw SVG export into a prescription figure the pattern site can
// inline: colours follow the page (light and dark) through currentColor, ids
// are namespaced by slug so several figures can share a document (the pane
// stack shows many pages at once), and export-only furniture is dropped.
//
//   npx tsx scripts/clean-figure.ts <export.svg> <slug>
//
// Writes apps/patterns/src/figures/<slug>/<slug>.svg. When a <slug>.tldraw
// from the tldraw desktop app sits beside it, also regenerates <slug>.tldr
// from it, so the plain-JSON source follows hand edits. Otherwise the .tldr is
// left alone.
import { readFileSync, writeFileSync, mkdirSync, existsSync, mkdtempSync, rmSync } from 'fs';
import { execFileSync } from 'child_process';
import { tmpdir } from 'os';
import { join } from 'path';
import { DatabaseSync } from 'node:sqlite';
import { repoRoot } from './lib/files.ts';

const [input, slug] = process.argv.slice(2);
if (!input || !slug) {
  console.error('usage: clean-figure.ts <export.svg> <slug>');
  process.exit(1);
}

// Pure white is an occluding fill (a shape that hides what passes behind it)
// and becomes the page background. tldraw's "semi" fill is a near-white tint;
// anything else this light is treated as semi, anything darker as solid.
const SEMI_LUMINANCE = 0.95;
const SEMI_OPACITY = 0.16;

// tldraw's light-theme colours, keyed by hex, to theme values.
const HIGHLIGHT: Record<string, string> = {
  cbe7f1: 'color-mix(in oklch, currentColor 20%, transparent)', // grey
  fddd00: 'var(--c-background-warning-strong)', // yellow
};
const INK: Record<string, string> = {
  '099268': 'var(--c-body-success)', // green
  '9fa8b2': 'color-mix(in oklch, currentColor 40%, var(--c-background))', // grey
  ffffff: 'var(--c-background)', // white, the outline of an occluding shape
};

function luminance(hex: string): number {
  const v = hex.replace('#', '');
  const full = v.length === 3 ? [...v].map((c) => c + c).join('') : v;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// True when a path is straight segments that are all horizontal or vertical.
function isRectilinear(d: string): boolean {
  if (/[^MLZ\d\s.,-]/i.test(d)) return false;
  const pts = [...d.matchAll(/[ML]\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/gi)].map((m) => [Number(m[1]), Number(m[2])]);
  return pts.every(([x, y], i) => i === 0 || Math.abs(x - pts[i - 1][0]) < 0.01 || Math.abs(y - pts[i - 1][1]) < 0.01);
}

function clean(svg: string): string {
  let out = svg;

  // Root element: keep the viewBox and drawing defaults, drop tldraw's sizing,
  // classes, inline theme style and colour-mode marker.
  out = out.replace(/<svg\b[^>]*>/, (tag) => {
    const viewBox = tag.match(/viewBox="([^"]*)"/)?.[1];
    if (!viewBox) throw new Error('export has no viewBox');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke-linecap="square" stroke-linejoin="miter">`;
  });

  // Embedded fonts and theme rules. Labels then fall back to the page font.
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, '');
  out = out.replace(/\sfont-family="[^"]*"/g, '');

  // Invisible hit-area rects tldraw keeps inside arrow clips.
  out = out.replace(/<rect\b[^>]*\sopacity="0"[^>]*\/>/g, '');
  out = out.replace(/<defs\/>/g, '');

  // Highlighter strokes are bands, not lines, and are much wider than the
  // marks they sit behind, so any end cap would stretch them well past those
  // marks. They take flat ends and stop where they were drawn.
  out = out.replace(/<path\b[^>]*\sopacity="[^"]*"[^>]*>/g, (tag) =>
    tag.replace(/stroke-linecap="round"/, 'stroke-linecap="butt"'),
  );

  // Pointed joins. Horizontal and vertical lines take square ends: a square
  // end reaches as far past the endpoint as tldraw's round one, so rows and
  // rules keep the length and alignment they were drawn with. Other lines,
  // diagonals and curves, usually end on another shape's outline, where a
  // square end would poke out past it, so they take flat ends. Dashes take
  // flat ends too, so each dash is as long as tldraw spaced it.
  out = out.replace(/stroke-linejoin="round"/g, 'stroke-linejoin="miter"');
  out = out.replace(/stroke-linecap="round"/g, 'stroke-linecap="square"');
  out = out.replace(/<path\b(?![^>]*stroke-linecap)([^>]*)>/g, (tag, attrs: string) => {
    const d = attrs.match(/\sd="([^"]*)"/)?.[1] ?? '';
    const dashed = /\sstroke-dasharray=/.test(attrs);
    return dashed || !isRectilinear(d) ? `<path stroke-linecap="butt"${attrs}>` : tag;
  });

  // Highlighter strokes: tldraw draws each twice, an underlay beneath every
  // shape and an overlay above them. A filled shape in front hides the
  // underlay, so only the overlay is kept. Grey becomes a tint of the ink,
  // yellow the warning background, so both follow the colour mode.
  out = out.replace(/<path\b[^>]*\sopacity="0\.82"[^>]*\/>/g, '');
  out = out.replace(/stroke="#([0-9a-fA-F]{6})"([^>]*?)\sopacity="[^"]*"/g, (tag, hex: string, rest: string) => {
    const tint = HIGHLIGHT[hex.toLowerCase()];
    if (!tint) throw new Error(`no theme mapping for highlight #${hex}`);
    return `style="stroke: ${tint}"${rest}`;
  });

  // Coloured ink other than black maps to a theme token.
  out = out.replace(/stroke="#([0-9a-fA-F]{6})"/g, (tag, hex: string) =>
    INK[hex.toLowerCase()] ? `style="stroke: ${INK[hex.toLowerCase()]}"` : tag,
  );

  out = out.replace(/stroke="#[0-9a-fA-F]{3,6}"/g, 'stroke="currentColor"');
  out = out.replace(/fill="(#[0-9a-fA-F]{3,6})"/g, (_, hex: string) =>
    /^#f{3}(f{3})?$/i.test(hex)
      ? 'style="fill: var(--c-background)"'
      : luminance(hex) > SEMI_LUMINANCE
      ? `fill="currentColor" fill-opacity="${SEMI_OPACITY}"`
      : 'fill="currentColor"',
  );
  // Dashed rectangles: tldraw dashes each side on its own, starting and ending
  // on a part dash, so with flat ends the two part dashes at a corner leave a
  // notch and the corner reads as rounded. A solid stub over each part dash,
  // whose square ends carry it half a stroke past the corner, closes the corner
  // like a solid one.
  out = out.replace(/<g stroke-width="([\d.]+)"([^>]*)>((?:<path(?: stroke-linecap="butt")? d="M [-\d. ]+ L [-\d. ]+" stroke-dasharray="[\d. ]+" stroke-dashoffset="[\d.]+"\/>)+)<\/g>/g,
    (group, width: string, rest: string, sides: string) => {
      const half = parseFloat(width) / 2;
      const stubs = [...sides.matchAll(/d="M ([-\d.]+) ([-\d.]+) L ([-\d.]+) ([-\d.]+)" stroke-dasharray="([\d.]+) [\d.]+" stroke-dashoffset="([\d.]+)"/g)]
        .flatMap(([, ...m]) => {
          const [x1, y1, x2, y2, dash, offset] = m.map(Number);
          const len = Math.hypot(x2 - x1, y2 - y1);
          if (offset === 0 || len === 0) return [];
          const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
          const part = dash - offset;
          const seg = (ax: number, ay: number, a: number, b: number) =>
            `<path d="M ${+(ax + ux * a).toFixed(2)} ${+(ay + uy * a).toFixed(2)} L ${+(ax + ux * b).toFixed(2)} ${+(ay + uy * b).toFixed(2)}"/>`;
          return [seg(x1, y1, 0, part - half), seg(x2, y2, half - part, 0)];
        });
      return `<g stroke-width="${width}"${rest}>${sides}${stubs.join('')}</g>`;
    });

  if (/<pattern\b/.test(out)) {
    throw new Error('pattern fill is not supported; use semi or solid');
  }

  // Namespace ids in a stable order so re-exports diff cleanly.
  const ids = [...out.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  ids.forEach((id, i) => {
    const next = `${slug}-${i + 1}`;
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out
      .replace(new RegExp(`id="${esc}"`, 'g'), `id="${next}"`)
      .replace(new RegExp(`#${esc}(?=["')&])`, 'g'), `#${next}`);
  });

  return out.replace(/>\s+</g, '><').trim() + '\n';
}

// A .tldraw file is a zip around a SQLite store: one JSON record per row in
// `documents`, the store schema in `metadata`. A .tldr holds the same records
// and schema as one JSON document.
function tldrawToTldr(file: string): string {
  const tmp = mkdtempSync(join(tmpdir(), 'figure-'));
  try {
    execFileSync('unzip', ['-q', file, 'db.sqlite', '-d', tmp]);
    const db = new DatabaseSync(join(tmp, 'db.sqlite'), { readOnly: true });
    const rows = db.prepare('SELECT state FROM documents ORDER BY id').all();
    const { schema } = db.prepare('SELECT schema FROM metadata').get() as { schema: string };
    db.close();
    const records = rows.map((r) => JSON.parse(Buffer.from(r.state as Uint8Array).toString('utf8')));
    return JSON.stringify({ tldrawFileFormatVersion: 1, schema: JSON.parse(schema), records });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const dir = join(repoRoot, 'apps/patterns/src/figures', slug);
mkdirSync(dir, { recursive: true });
const target = join(dir, `${slug}.svg`);
writeFileSync(target, clean(readFileSync(input, 'utf8')));
console.log(`wrote ${target}`);

const desktop = join(dir, `${slug}.tldraw`);
if (existsSync(desktop)) {
  const tldr = join(dir, `${slug}.tldr`);
  writeFileSync(tldr, tldrawToTldr(desktop));
  console.log(`wrote ${tldr} from ${slug}.tldraw`);
}
