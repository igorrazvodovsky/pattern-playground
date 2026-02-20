#!/usr/bin/env node
/**
 * Pre-commit CLAUDE.md alignment check.
 *
 * Entry points:
 *   - Claude Code PreToolUse hook: called with no args, reads stdin JSON
 *   - Native git hook: called with --git-hook flag
 *
 * Always exits 0 (warn-only). Findings are printed to stderr.
 */

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const isGitHook = process.argv.includes('--git-hook');

async function main() {
  if (!isGitHook) {
    // Claude Code PreToolUse: read stdin to check if this is a git commit
    let input = '';
    try {
      input = readFileSync('/dev/stdin', 'utf8');
    } catch {
      process.exit(0);
    }

    let toolInput;
    try {
      const parsed = JSON.parse(input);
      toolInput = parsed?.tool_input ?? parsed;
    } catch {
      process.exit(0);
    }

    const command = toolInput?.command ?? '';
    if (!isGitCommitCommand(command)) {
      process.exit(0);
    }
  }

  // Get staged diff
  let diff;
  try {
    diff = execSync('git diff --cached --unified=3', { encoding: 'utf8' });
  } catch {
    process.exit(0);
  }

  if (!diff.trim()) {
    process.exit(0);
  }

  // Check if claude CLI is available
  try {
    execSync('which claude', { stdio: 'ignore' });
  } catch {
    process.stderr.write('[pre-commit] claude CLI not found — skipping CLAUDE.md alignment check\n');
    process.exit(0);
  }

  const prompt = buildPrompt(diff);

  let result;
  try {
    result = execSync(`claude --print ${JSON.stringify(prompt)}`, {
      encoding: 'utf8',
      timeout: 55_000,
    });
  } catch (err) {
    process.stderr.write(`[pre-commit] claude check failed: ${err.message}\n`);
    process.exit(0);
  }

  // Parse and surface any findings
  let text = result.trim();

  // claude --print may return plain text or JSON depending on version
  try {
    const parsed = JSON.parse(text);
    text = parsed?.result ?? parsed?.content ?? JSON.stringify(parsed);
  } catch {
    // plain text — use as-is
  }

  const hasIssues = !/^(no issues|looks good|all good|none|ok)\b/i.test(text.trim());

  if (hasIssues && text.trim()) {
    process.stderr.write('\n[pre-commit] CLAUDE.md alignment check found potential issues:\n\n');
    process.stderr.write(text.trim());
    process.stderr.write('\n\n');
  }

  process.exit(0);
}

function isGitCommitCommand(command) {
  // Match: git commit, git commit -m "...", etc.
  // Exclude: git commit --amend only if we want to, but let's include it
  return /\bgit\s+commit\b/.test(command);
}

function buildPrompt(diff) {
  return `You are a code reviewer checking that staged changes align with this project's CLAUDE.md guidelines.

Review the following git diff against these key rules:

STYLING
- Never use inline styles (style="..." attributes or style properties set in JS)
- All styling must go through CSS classes or design tokens
- Don't use CSS classes as JavaScript hooks; use data-* attributes instead

WEB COMPONENTS
- Prefer Light DOM over Shadow DOM
- Always check document.readyState in connectedCallback() (bulletproof loading pattern)
- Remove all event listeners in disconnectedCallback()
- Don't use role or aria-* attributes as JavaScript hooks

TYPESCRIPT
- Never use the \`any\` type; use proper types or \`unknown\` with type guards
- Create \`is*\` type guard functions for runtime type checking

CODE ORGANISATION
- Extract mock data arrays with >5 complex items to JSON files in src/stories/data/
- Don't write redundant comments; code should be self-documenting

DOCUMENTATION (when editing .mdx or .md files)
- Use British spelling (behaviour, colour, organisation, etc.)
- Use sentence case for all headings and titles
- Prioritise conciseness — remove elaborative phrases that restate

STATE MANAGEMENT
- Use Zustand for complex state, not Context API
- Use Maps for frequent lookups, not arrays

Respond with one of:
- "No issues found." — if the diff looks clean
- A concise bulleted list of specific issues with file and line references — if violations are present

Keep the response short and actionable. Do not explain the rules; just report violations.

---
DIFF:
${diff}`;
}

main().catch((err) => {
  process.stderr.write(`[pre-commit] unexpected error: ${err.message}\n`);
  process.exit(0);
});
