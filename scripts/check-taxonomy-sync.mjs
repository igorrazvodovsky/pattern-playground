import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const storiesDir = resolve(root, 'src/stories');
const taxonomyPath = resolve(root, 'docs/project/storybook-taxonomy.md');

let failed = false;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed = true;
}

// Get top-level directories in src/stories/
const storyDirs = readdirSync(storiesDir)
  .filter(name => {
    if (name.startsWith('.')) return false;
    const full = resolve(storiesDir, name);
    return statSync(full).isDirectory();
  });

const taxonomyContent = readFileSync(taxonomyPath, 'utf-8');

// Check that every directory in src/stories/ is mentioned in the taxonomy doc
for (const dir of storyDirs) {
  if (!taxonomyContent.includes(`\`${dir}/\``) && !taxonomyContent.includes(`\`${dir}\``)) {
    fail(`src/stories/${dir}/ exists but is not mentioned in docs/project/storybook-taxonomy.md`);
  }
}

// Check that directories mentioned as current in the taxonomy actually exist
const dirPattern = /`([\w-]+)\/`/g;
let match;
while ((match = dirPattern.exec(taxonomyContent)) !== null) {
  const dirName = match[1];
  // Skip sub-paths like actions/seeking — check only top-level
  if (dirName.includes('/')) continue;
  // Skip known non-directory references
  if (['src', 'plans', 'docs', 'references', 'claude', 'node_modules'].includes(dirName)) continue;

  const full = resolve(storiesDir, dirName);
  try {
    if (!statSync(full).isDirectory()) {
      fail(`docs/project/storybook-taxonomy.md references ${dirName}/ but it is not a directory in src/stories/`);
    }
  } catch {
    fail(`docs/project/storybook-taxonomy.md references ${dirName}/ but it does not exist in src/stories/`);
  }
}

if (failed) process.exit(1);
console.log('Taxonomy sync check passed.');
