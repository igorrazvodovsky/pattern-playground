import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

// 1. AGENTS.md exists and is < 150 lines
const agentsPath = resolve(root, 'AGENTS.md');
if (!existsSync(agentsPath)) {
  fail('AGENTS.md does not exist');
} else {
  const lines = readFileSync(agentsPath, 'utf-8').split('\n');
  if (lines.length > 150) {
    fail(`AGENTS.md is ${lines.length} lines (max 150). Keep it a map, not a manual.`);
  }

  // 3. All relative links in AGENTS.md resolve to files that exist
  const linkPattern = /\[.*?\]\(((?!https?:\/\/)[^)]+)\)/g;
  let match;
  while ((match = linkPattern.exec(readFileSync(agentsPath, 'utf-8'))) !== null) {
    const target = resolve(root, match[1]);
    if (!existsSync(target)) {
      fail(`Broken link in AGENTS.md: ${match[1]} → ${target}`);
    }
  }
}

// 2. CLAUDE.md matches expected stub
const claudePath = resolve(root, 'CLAUDE.md');
const expectedStub = '# CLAUDE.md\n\nSee [AGENTS.md](./AGENTS.md). Canonical guidance lives in AGENTS.md.\n';
if (!existsSync(claudePath)) {
  fail('CLAUDE.md does not exist');
} else {
  const content = readFileSync(claudePath, 'utf-8');
  if (content !== expectedStub) {
    fail('CLAUDE.md has drifted from the expected stub. It should contain only a pointer to AGENTS.md.');
  }
}

if (failed) process.exit(1);
console.log('All checks passed.');
