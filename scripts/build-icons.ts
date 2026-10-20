import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repoRoot as root, walkFiles } from './lib/files.ts';

// Builds the `ik:` icon collection that <iconify-icon> renders from. Icons
// come from Iconoteka (the `iconoteka` package), which has no Iconify API to
// fetch from, so every icon the project names has to be bundled. The full set
// is several megabytes; the collection holds only the names found in source.
//
// A name is the Iconoteka name with underscores as hyphens, in the regular
// weight and stroke style: `ik:cross_in_circle` is written `ik:cross-in-circle`.
// Suffixes pick the other weights and the fill style, weight first:
//
//   -thin -ultralight -light -medium -semibold -bold     ik:checkmark-bold
//   -fill                                                ik:trash-fill
//                                                        ik:trash-light-fill
//
// Many icons draw one fill for every weight; Iconoteka stores it under thin,
// and a weight without its own fill uses that one, as iconoteka-react does.
// A few Iconoteka names end in a weight word (`wind_medium`); the whole name
// wins, so `ik:wind-medium` is that icon, not `wind` in the medium weight.
//
// Run after adding or removing an icon name anywhere in source:
//   npm run build:icons
// packages/components/src/icons/icons.test.ts fails when the output is stale.

const componentsDir = resolve(root, 'packages/components');
export const OUTPUT = resolve(componentsDir, 'src/icons/iconoteka.generated.json');
export const PREFIX = 'ik';

const SOURCE_DIRS = ['packages/components/src', 'packages/components/.storybook', 'apps/patterns/src', 'shared', 'concepts'];
const SOURCE_FILE = /\.(ts|tsx|js|mjs|json|md|mdx|astro|html)$/;
const WEIGHT_SUFFIX = /-(thin|ultralight|light|medium|semibold|bold)$/;
const NAME = new RegExp(`(?<![\\w-])${PREFIX}:([a-z0-9]+(?:-[a-z0-9]+)*)`, 'g');

/** Every `ik:` name used in source, sorted, with the files that use it. */
export function usedNames(): Map<string, Set<string>> {
  const names = new Map<string, Set<string>>();
  for (const dir of SOURCE_DIRS) {
    for (const file of walkFiles(resolve(root, dir), (name) => SOURCE_FILE.test(name))) {
      if (file === OUTPUT) continue;
      for (const [, name] of readFileSync(file, 'utf8').matchAll(NAME)) {
        if (!names.has(name)) names.set(name, new Set());
        names.get(name)!.add(relative(root, file));
      }
    }
  }
  return new Map([...names].sort(([a], [b]) => a.localeCompare(b)));
}

interface IconotekaIcon {
  displayName: string;
  variants: Record<string, { stroke?: string; fill?: string }>;
}

function iconoteka(): { meta: { version: string }; icons: IconotekaIcon[] } {
  const require = createRequire(resolve(componentsDir, 'package.json'));
  return require('iconoteka');
}

/** The Iconify collection for `names`, and the names Iconoteka can't supply. */
export function buildCollection(names = [...usedNames().keys()]) {
  const data = iconoteka();
  const byName = new Map(data.icons.map((icon) => [icon.displayName.toLowerCase().replaceAll('_', '-'), icon]));
  const icons: Record<string, { body: string }> = {};
  const missing: string[] = [];
  for (const name of names) {
    let base = name;
    let style: 'stroke' | 'fill' = 'stroke';
    let weight = 'regular';
    if (base.endsWith('-fill')) [base, style] = [base.slice(0, -5), 'fill'];
    const suffix = base.match(WEIGHT_SUFFIX);
    if (suffix && !byName.has(base)) [base, weight] = [base.slice(0, suffix.index), suffix[1]];
    const variants = byName.get(base)?.variants;
    const path = style === 'fill' ? (variants?.[weight]?.fill ?? variants?.thin?.fill) : variants?.[weight]?.stroke;
    if (path) icons[name] = { body: `<path d="${path}" fill="currentColor"/>` };
    else missing.push(name);
  }
  const collection = {
    prefix: PREFIX,
    info: {
      name: 'Iconoteka',
      version: data.meta.version,
      author: { name: 'Iconoteka', url: 'https://iconoteka.com' },
      license: { title: 'MIT', spdx: 'MIT' },
    },
    width: 24,
    height: 24,
    icons,
  };
  return { collection, missing };
}

// One icon per line, so a diff shows which icons came and went.
export function serialise(collection: ReturnType<typeof buildCollection>['collection']) {
  const { icons, ...rest } = collection;
  const head = JSON.stringify(rest).slice(0, -1);
  const lines = Object.entries(icons).map(([name, icon]) => `  ${JSON.stringify(name)}: ${JSON.stringify(icon)}`);
  return `${head},"icons":{\n${lines.join(',\n')}\n}}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { collection, missing } = buildCollection();
  if (missing.length) {
    console.error(`Iconoteka has no icon for: ${missing.map((name) => `${PREFIX}:${name}`).join(', ')}`);
    process.exit(1);
  }
  const json = serialise(collection);
  writeFileSync(OUTPUT, json);
  console.log(`Wrote ${OUTPUT} (${Object.keys(collection.icons).length} icons, ${(json.length / 1024).toFixed(1)} KB)`);
}
