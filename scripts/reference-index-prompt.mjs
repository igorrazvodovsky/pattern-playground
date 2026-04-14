#!/usr/bin/env node
// PostToolUse hook: fires after any Read tool call.
// If the file is inside references/, checks whether it appears in docs/references.md.
// If missing, prints a one-line reminder to stdout so Claude can surface it.

import { readFileSync } from 'fs';
import { resolve, basename } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { input += chunk; });
process.stdin.on('end', () => {
  let payload;
  try { payload = JSON.parse(input); } catch { process.exit(0); }

  const filePath = payload?.tool_input?.file_path ?? '';
  if (!filePath.includes('/references/')) process.exit(0);

  const name = basename(filePath);
  let index = '';
  try {
    index = readFileSync(resolve(ROOT, 'docs/references.md'), 'utf8');
  } catch {
    process.exit(0);
  }

  // Escape for a plain-string search (not regex).
  if (!index.includes(name)) {
    process.stdout.write(
      `Note: \`${name}\` is not yet in docs/references.md. ` +
      `If this source has a project takeaway worth keeping, add a one-line entry to the index.\n`
    );
  }

  process.exit(0);
});
