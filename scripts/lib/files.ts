// Helpers shared by the workspace-level scripts. Erasable TypeScript only, so
// the `.mjs` scripts can import this file directly under Node's type stripping.

import { readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as yamlLoad } from 'js-yaml';

/** The repository root, independent of the directory a script is run from. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Every file under `dir` whose name passes `keep`, recursively. Dot folders
 * (`.obsidian`) and `node_modules` are skipped.
 */
export function walkFiles(dir: string, keep: (name: string) => boolean): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkFiles(full, keep));
    else if (keep(entry.name)) results.push(full);
  }
  return results;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---/;

/** The raw YAML between the opening `---` fences, or null when there is none. */
export function frontmatterBlock(content: string): string | null {
  return content.match(FRONTMATTER)?.[1] ?? null;
}

/** The parsed frontmatter, or null when it is missing or not valid YAML. */
export function parseFrontmatter(content: string): Record<string, unknown> | null {
  const block = frontmatterBlock(content);
  if (block === null) return null;
  try {
    return (yamlLoad(block) as Record<string, unknown> | undefined) ?? {};
  } catch {
    return null;
  }
}

/** The content with its frontmatter block removed, closing line included. */
export function stripFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---[^\n]*(?:\n|$)/, '');
}
