/**
 * Phase 2 migration: Activity Theory reorganisation.
 *
 * - Discovers files by their current Meta title (or co-located .stories.tsx title)
 * - git mv each file to its new location
 * - Updates Meta title and adds AT metadata tags
 * - Does a global cross-reference URL find/replace across all .mdx files
 * - Does NOT touch concepts/ or block-based-editor (deferred)
 *
 * Run with: npx tsx scripts/migrate-at-reorg.ts
 * Add --dry-run to preview without making changes.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORIES = join(ROOT, 'src/stories');
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('DRY RUN — no files will be changed.\n');

// ---------------------------------------------------------------------------
// Migration table
// Each entry maps an old Meta title to the new configuration.
// For files whose title lives in .stories.tsx, oldTitle must match that file.
// ---------------------------------------------------------------------------
interface Entry {
  oldTitle: string;
  newTitle: string;
  atLevel: 'operation' | 'action' | 'activity' | 'cross-cutting';
  lifecycle: 'seeking' | 'evaluation' | 'sense-making' | 'application' | 'coordination' | 'conversation' | null;
  atomic: string;
  /** Update title/tags in place (no git mv) — for complex dirs handled separately */
  skipMove?: boolean;
}

const ENTRIES: Entry[] = [
  // ── Operations — primitives ───────────────────────────────────────────────
  { oldTitle: 'Primitives/Badge',             newTitle: 'Operations/Badge',             atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Button',            newTitle: 'Operations/Button',            atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Callout',           newTitle: 'Operations/Callout',           atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Checkbox',          newTitle: 'Operations/Checkbox',          atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Deep linking',      newTitle: 'Operations/Deep linking',      atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Details',           newTitle: 'Operations/Details',           atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Input',             newTitle: 'Operations/Input',             atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Keyboard key',      newTitle: 'Operations/Keyboard key',      atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Overflow',          newTitle: 'Operations/Overflow',          atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Popover',           newTitle: 'Operations/Popover',           atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Tag',               newTitle: 'Operations/Tag',               atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Textarea',          newTitle: 'Operations/Textarea',          atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Toast',             newTitle: 'Operations/Toast',             atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Reference',         newTitle: 'Operations/Reference',         atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Avatar',            newTitle: 'Operations/Avatar',            atLevel: 'operation', lifecycle: null, atomic: 'primitive' },

  // ── Operations — components ───────────────────────────────────────────────
  { oldTitle: 'Components/Breadcrumbs',       newTitle: 'Operations/Breadcrumbs',       atLevel: 'operation', lifecycle: null, atomic: 'component' },
  { oldTitle: 'Components/Tabs',              newTitle: 'Operations/Tabs',              atLevel: 'operation', lifecycle: null, atomic: 'component' },
  { oldTitle: 'Components/Progress indicator',newTitle: 'Operations/Progress indicator',atLevel: 'operation', lifecycle: null, atomic: 'component' },
  { oldTitle: 'Components/Inline Confirmation',newTitle:'Operations/Inline confirmation',atLevel: 'operation', lifecycle: null, atomic: 'component' },

  // ── Operations — patterns ─────────────────────────────────────────────────
  { oldTitle: 'Patterns/Good defaults',           newTitle: 'Operations/Good defaults',           atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Status feedback',         newTitle: 'Operations/Status feedback',         atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Undo',                    newTitle: 'Operations/Undo',                    atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/States/Disabled state',   newTitle: 'Operations/Disabled state',          atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/States/Empty state',      newTitle: 'Operations/Empty state',             atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/States/Morphing controls',newTitle: 'Operations/Morphing controls',       atLevel: 'operation', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/States/Unavailable actions',newTitle:'Operations/Unavailable actions',    atLevel: 'operation', lifecycle: null, atomic: 'pattern' },

  // ── Operations — data visualisation ──────────────────────────────────────
  { oldTitle: 'Data visualization*/Bar chart',    newTitle: 'Operations/Bar chart',               atLevel: 'operation', lifecycle: null, atomic: 'data-visualization' },

  // ── Operations — conversation sequence management ─────────────────────────
  { oldTitle: 'Primitives/Conversation/Sequence management/Abort',             newTitle: 'Operations/Abort',             atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Sequence management/Bot repair',        newTitle: 'Operations/Bot repair',        atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Sequence management/User repair',       newTitle: 'Operations/User repair',       atLevel: 'operation', lifecycle: null, atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Sequence management/Sequence completion',newTitle:'Operations/Sequence completion',atLevel: 'operation', lifecycle: null, atomic: 'primitive' },

  // ── Actions / Seeking ─────────────────────────────────────────────────────
  { oldTitle: 'Compositions/Searching',                       newTitle: 'Actions/Seeking/Searching',           atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Browsing & sensemaking/Filtering',newTitle: 'Actions/Seeking/Filtering',           atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Browsing & sensemaking/Sorting',  newTitle: 'Actions/Seeking/Sorting',             atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Patterns/Command menu',                        newTitle: 'Actions/Seeking/Command menu',        atLevel: 'action', lifecycle: 'seeking', atomic: 'pattern' },
  { oldTitle: 'Patterns/Progressive disclosure',              newTitle: 'Actions/Seeking/Progressive disclosure', atLevel: 'action', lifecycle: 'seeking', atomic: 'pattern' },
  { oldTitle: 'Compositions/Data view',                       newTitle: 'Actions/Seeking/Data view',           atLevel: 'action', lifecycle: 'seeking', atomic: 'composition', skipMove: true },
  { oldTitle: 'Patterns/Dynamic hyperlinks',                  newTitle: 'Actions/Seeking/Dynamic hyperlinks',  atLevel: 'action', lifecycle: 'seeking', atomic: 'pattern' },
  { oldTitle: 'Compositions/Item view',                       newTitle: 'Actions/Seeking/Item view',           atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Flat navigation',       newTitle: 'Actions/Seeking/Flat navigation',     atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Multilevel tree',       newTitle: 'Actions/Seeking/Multilevel tree',     atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Hub and spoke',         newTitle: 'Actions/Seeking/Hub and spoke',       atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Fully connected',       newTitle: 'Actions/Seeking/Fully connected',     atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Pyramid',               newTitle: 'Actions/Seeking/Pyramid',             atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Hybrid patterns',       newTitle: 'Actions/Seeking/Hybrid patterns',     atLevel: 'action', lifecycle: 'seeking', atomic: 'composition' },

  // ── Actions / Evaluation ──────────────────────────────────────────────────
  { oldTitle: 'Components/Table',                                newTitle: 'Actions/Evaluation/Table',               atLevel: 'action', lifecycle: 'evaluation', atomic: 'component' },
  { oldTitle: 'Components/List',                                 newTitle: 'Actions/Evaluation/List',                atLevel: 'action', lifecycle: 'evaluation', atomic: 'component' },
  { oldTitle: 'Components/Timeline',                             newTitle: 'Actions/Evaluation/Timeline',            atLevel: 'action', lifecycle: 'evaluation', atomic: 'component' },
  { oldTitle: 'Patterns/Focus and context',                      newTitle: 'Actions/Evaluation/Focus and context',   atLevel: 'action', lifecycle: 'evaluation', atomic: 'pattern', skipMove: true },
  { oldTitle: 'Patterns/Text lens',                              newTitle: 'Actions/Evaluation/Text lens',           atLevel: 'action', lifecycle: 'evaluation', atomic: 'pattern' },
  { oldTitle: 'Compositions/Structure/Pan and zoom',             newTitle: 'Actions/Evaluation/Pan and zoom',        atLevel: 'action', lifecycle: 'evaluation', atomic: 'composition' },
  { oldTitle: 'Compositions/Structure/Overview and detail',      newTitle: 'Actions/Evaluation/Overview and detail', atLevel: 'action', lifecycle: 'evaluation', atomic: 'composition' },
  { oldTitle: 'Data visualization*/Chart types',                 newTitle: 'Actions/Evaluation/Chart types',         atLevel: 'action', lifecycle: 'evaluation', atomic: 'data-visualization' },
  { oldTitle: 'Data visualization*/Elements',                    newTitle: 'Actions/Evaluation/Elements',            atLevel: 'action', lifecycle: 'evaluation', atomic: 'data-visualization' },

  // ── Actions / Sense-making ────────────────────────────────────────────────
  { oldTitle: 'Compositions/Card',                               newTitle: 'Actions/Sense-making/Card',              atLevel: 'action', lifecycle: 'sense-making', atomic: 'composition' },
  { oldTitle: 'Compositions/Browsing & sensemaking/Grouping',    newTitle: 'Actions/Sense-making/Grouping',          atLevel: 'action', lifecycle: 'sense-making', atomic: 'composition' },
  { oldTitle: 'Patterns/Annotation',                             newTitle: 'Actions/Sense-making/Annotation',        atLevel: 'action', lifecycle: 'sense-making', atomic: 'pattern' },
  { oldTitle: 'Patterns/Explanation',                            newTitle: 'Actions/Sense-making/Explanation',       atLevel: 'action', lifecycle: 'sense-making', atomic: 'pattern' },
  { oldTitle: 'Compositions/View',                               newTitle: 'Actions/Sense-making/View',              atLevel: 'action', lifecycle: 'sense-making', atomic: 'composition' },
  { oldTitle: 'Compositions/Needs-based view',                   newTitle: 'Actions/Sense-making/Needs-based view',  atLevel: 'action', lifecycle: 'sense-making', atomic: 'composition' },
  { oldTitle: 'Patterns/Tag',                                    newTitle: 'Actions/Sense-making/Tag',               atLevel: 'action', lifecycle: 'sense-making', atomic: 'pattern' },
  { oldTitle: 'Compositions/Block-based editor',                 newTitle: 'Actions/Sense-making/Block-based editor',atLevel: 'action', lifecycle: 'sense-making', atomic: 'composition' },

  // ── Actions / Application ─────────────────────────────────────────────────
  { oldTitle: 'Compositions/Form',                              newTitle: 'Actions/Application/Form',                atLevel: 'action', lifecycle: 'application', atomic: 'composition' },
  { oldTitle: 'Patterns/Data entry',                            newTitle: 'Actions/Application/Data entry',          atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Components/Dialog',                              newTitle: 'Actions/Application/Dialog',              atLevel: 'action', lifecycle: 'application', atomic: 'component' },
  { oldTitle: 'Components/Drawer',                              newTitle: 'Actions/Application/Drawer',              atLevel: 'action', lifecycle: 'application', atomic: 'component' },
  { oldTitle: 'Compositions/Wizard',                            newTitle: 'Actions/Application/Wizard',              atLevel: 'action', lifecycle: 'application', atomic: 'composition' },
  { oldTitle: 'Patterns/Data operations/Action consequences',   newTitle: 'Actions/Application/Action consequences', atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Patterns/Data operations/Deletion',              newTitle: 'Actions/Application/Deletion',            atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Patterns/Data operations/Saving',                newTitle: 'Actions/Application/Saving',              atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Patterns/Settings',                              newTitle: 'Actions/Application/Settings',            atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Patterns/Suggestion',                            newTitle: 'Actions/Application/Suggestion',          atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Patterns/Template',                              newTitle: 'Actions/Application/Template',            atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },
  { oldTitle: 'Compositions/Structure/Step by step',            newTitle: 'Actions/Application/Step by step',        atLevel: 'action', lifecycle: 'application', atomic: 'composition' },
  { oldTitle: 'Patterns/Semantic Zoom',                         newTitle: 'Actions/Application/Semantic zoom',       atLevel: 'action', lifecycle: 'application', atomic: 'pattern' },

  // ── Actions / Coordination ────────────────────────────────────────────────
  { oldTitle: 'Compositions/Messaging',  newTitle: 'Actions/Coordination/Messaging',    atLevel: 'action', lifecycle: 'coordination', atomic: 'composition' },
  { oldTitle: 'Compositions/Commenting', newTitle: 'Actions/Coordination/Commenting',   atLevel: 'action', lifecycle: 'coordination', atomic: 'composition' },
  { oldTitle: 'Compositions/Toolbar',    newTitle: 'Actions/Coordination/Toolbar',      atLevel: 'action', lifecycle: 'coordination', atomic: 'composition' },
  { oldTitle: 'Compositions/Nav bar',    newTitle: 'Actions/Coordination/Nav bar',      atLevel: 'action', lifecycle: 'coordination', atomic: 'composition' },
  { oldTitle: 'Patterns/Notification',   newTitle: 'Actions/Coordination/Notification', atLevel: 'action', lifecycle: 'coordination', atomic: 'pattern' },
  { oldTitle: 'Components/Bubble menu',  newTitle: 'Actions/Coordination/Bubble menu',  atLevel: 'action', lifecycle: 'coordination', atomic: 'component' },
  { oldTitle: 'Components/Dropdown',     newTitle: 'Actions/Coordination/Dropdown',     atLevel: 'action', lifecycle: 'coordination', atomic: 'component' },
  { oldTitle: 'Components/Priority+',   newTitle: 'Actions/Coordination/Priority+',    atLevel: 'action', lifecycle: 'coordination', atomic: 'component' },

  // ── Actions / Conversation ────────────────────────────────────────────────
  { oldTitle: 'Primitives/Conversation/Conversation management/Opening (Bot)',              newTitle: 'Actions/Conversation/Opening (Bot)',           atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversation management/Opening (User)',             newTitle: 'Actions/Conversation/Opening (User)',          atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversation management/Capability & scope',        newTitle: 'Actions/Conversation/Capability & scope',      atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversation management/Closing',                   newTitle: 'Actions/Conversation/Closing',                 atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversation management/Disengage without closing', newTitle: 'Actions/Conversation/Disengage without closing',atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversational activities/Extended telling',        newTitle: 'Actions/Conversation/Extended telling',        atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversational activities/Inquiry (Bot)',           newTitle: 'Actions/Conversation/Inquiry (Bot)',           atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversational activities/Inquiry (User)',          newTitle: 'Actions/Conversation/Inquiry (User)',          atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },
  { oldTitle: 'Primitives/Conversation/Conversational activities/Open request',            newTitle: 'Actions/Conversation/Open request',            atLevel: 'action', lifecycle: 'conversation', atomic: 'primitive' },

  // ── Activities ────────────────────────────────────────────────────────────
  { oldTitle: 'Patterns/Activity feed',         newTitle: 'Activities/Activity feed',         atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Activity log',          newTitle: 'Activities/Activity log',          atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Bot',                   newTitle: 'Activities/Bot',                   atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Collaboration',         newTitle: 'Activities/Collaboration',         atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Conversation',          newTitle: 'Activities/Conversation',          atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/AI tuning',             newTitle: 'Activities/AI tuning',             atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: "Patterns/Embedded intelligence", newTitle: 'Activities/Embedded intelligence', atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Generated content',     newTitle: 'Activities/Generated content',     atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Help',                  newTitle: 'Activities/Help',                  atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Living document',       newTitle: 'Activities/Living document',       atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Localization',          newTitle: 'Activities/Localization',          atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Mastery',               newTitle: 'Activities/Mastery',               atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Onboarding',            newTitle: 'Activities/Onboarding',            atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Transparent reasoning', newTitle: 'Activities/Transparent reasoning', atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Workspace',             newTitle: 'Activities/Workspace',             atLevel: 'activity', lifecycle: null, atomic: 'pattern' },
  { oldTitle: 'Patterns/Prompt',                newTitle: 'Activities/Prompt',                atLevel: 'activity', lifecycle: null, atomic: 'pattern' },

  // ── Foundations — visual elements → foundations/material/ ─────────────────
  { oldTitle: 'Visual elements/Color',       newTitle: 'Foundations/Material/Color',       atLevel: 'cross-cutting', lifecycle: null, atomic: 'visual-element' },
  { oldTitle: 'Visual elements/Iconography', newTitle: 'Foundations/Material/Iconography', atLevel: 'cross-cutting', lifecycle: null, atomic: 'visual-element' },
  { oldTitle: 'Visual elements/Layout',      newTitle: 'Foundations/Material/Layout',      atLevel: 'cross-cutting', lifecycle: null, atomic: 'visual-element' },
  { oldTitle: 'Visual elements/Motion',      newTitle: 'Foundations/Material/Motion',      atLevel: 'cross-cutting', lifecycle: null, atomic: 'visual-element' },
  { oldTitle: 'Visual elements/Typography',  newTitle: 'Foundations/Material/Typography',  atLevel: 'cross-cutting', lifecycle: null, atomic: 'visual-element' },
];

// ---------------------------------------------------------------------------
// Old-ID → New-ID map (for cross-reference URL rewrites)
// Computed from titleToId applied to old and new titles.
// ---------------------------------------------------------------------------
function titleToId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9/ ]+/g, '')
    .replace(/[/ ]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Build ID map from ENTRIES
const ID_MAP: Record<string, string> = {};
for (const e of ENTRIES) {
  const oldId = titleToId(e.oldTitle);
  const newId = titleToId(e.newTitle);
  if (oldId !== newId) ID_MAP[oldId] = newId;
}

// Additional manual aliases that appear in existing cross-references
// (stale/inconsistent IDs already in the wild — map them to the new canonical ID)
const ALIASES: Record<string, string> = {
  'patterns-commandmenu-commandmenu':         'actions-seeking-command-menu',
  'patterns-commandmenu-overview':            'actions-seeking-command-menu',
  'patterns-progressivedisclosure':           'actions-seeking-progressive-disclosure',
  'patterns-embeddedintelligence':            'activities-embedded-intelligence',
  'patterns-generatedcontent':                'activities-generated-content',
  'patterns-aituning':                        'activities-ai-tuning',
  'patterns-textlense':                       'actions-evaluation-text-lens',
  'patterns-statusfeedback':                  'operations-status-feedback',
  'patterns-activitylog':                     'activities-activity-log',
  'patterns-livingdocument':                  'activities-living-document',
  'patterns-focusandcontext-focusandcontext': 'actions-evaluation-focus-and-context',
  'patterns-transparentreasoning':            'activities-transparent-reasoning',
  'patterns-data-ops-actionconsequences':     'actions-application-action-consequences',
  'patterns-data-ops-deletion':               'actions-application-deletion',
  'patterns-data-ops-saving':                 'actions-application-saving',
  'compositions-filtering':                   'actions-seeking-filtering',
  'compositions-grouping':                    'actions-sensemaking-grouping',
  'compositions-sorting':                     'actions-seeking-sorting',
  'compositions-itemview':                    'actions-seeking-item-view',
  'compositions-menus-and-actions-toolbar':   'actions-coordination-toolbar',
  'compositions-navigation-navigation-overview': 'actions-seeking-flat-navigation',
  'compositions-blockbasededitor':            'actions-sensemaking-blockbased-editor',
  'compositions-blockbasededitor-blockbasededitor': 'actions-sensemaking-blockbased-editor',
  'components-bubblemenu':                    'actions-coordination-bubble-menu',
  'primitives-keyboardkey':                   'operations-keyboard-key',
  'primitives-reference-reference':           'operations-reference',
};
Object.assign(ID_MAP, ALIASES);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function globMdx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === '.obsidian') continue;
    if (statSync(full).isDirectory()) results.push(...globMdx(full));
    else if (entry.endsWith('.mdx')) results.push(full);
  }
  return results;
}

function globStoriesTsx(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) results.push(...globStoriesTsx(full));
    else if (entry.endsWith('.stories.tsx')) results.push(full);
  }
  return results;
}

function extractMetaTitle(content: string): string | null {
  const m = content.match(/<Meta\s[^>]*title=['"]([^'"]+)['"]/);
  return m ? m[1] : null;
}

function extractStoriesTitle(content: string): string | null {
  const m = content.match(/^\s*title:\s*['"]([^'"]+)['"]/m);
  return m ? m[1] : null;
}

function makeTags(e: Entry): string {
  const tags: string[] = [`activity-level:${e.atLevel}`, `atomic:${e.atomic}`];
  if (e.lifecycle) tags.push(`lifecycle:${e.lifecycle}`);
  return `[${tags.map((t) => `'${t}'`).join(', ')}]`;
}

/** Inject or replace Meta title+tags in MDX content. */
function updateMdxMeta(content: string, newTitle: string, tags: string): string {
  if (!/<Meta[\s>]/.test(content)) {
    // No existing Meta — prepend one
    return `<Meta title="${newTitle}" tags={${tags}} />\n\n` + content;
  }

  // Add or update tags on the existing Meta tag (handles both title= and of= style)
  if (/tags=\{/.test(content)) {
    content = content.replace(/tags=\{[^}]*\}/, `tags={${tags}}`);
  } else {
    // Insert tags before the closing /> of the Meta tag
    content = content.replace(/(<Meta\b[^>]*?)(\s*\/>)/, `$1 tags={${tags}}$2`);
  }

  // Update or add title= attribute (only if file doesn't use of= style)
  if (/title=['"]/.test(content)) {
    content = content.replace(/(<Meta\b[^>]*)title=['"][^'"]*['"]/, `$1title="${newTitle}"`);
  } else if (!/<Meta\b[^>]*of=/.test(content)) {
    // No title and no of= — add title attribute
    content = content.replace(/(<Meta\b)(\s)/, `$1 title="${newTitle}"$2`);
  }
  // If using of= style, title lives in .stories.tsx — no change needed here

  return content;
}

/** Update title field in .stories.tsx content. */
function updateStoriesTitle(content: string, newTitle: string): string {
  return content.replace(/(\btitle:\s*)(['"])([^'"]+)\2/, `$1$2${newTitle}$2`);
}

function run(cmd: string): void {
  if (DRY_RUN) {
    console.log(`  [dry] ${cmd}`);
    return;
  }
  try {
    execSync(cmd, { cwd: ROOT, stdio: 'pipe' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // git mv fails on untracked files — fall back to fs mv + git add/rm
    if (cmd.startsWith('git mv ') && msg.includes('not under version control')) {
      const parts = cmd.match(/^git mv "([^"]+)" "([^"]+)"$/);
      if (parts) {
        const [, src, dst] = parts;
        execSync(`mv "${src}" "${dst}"`, { cwd: ROOT, stdio: 'pipe' });
        execSync(`git add "${dst}"`, { cwd: ROOT, stdio: 'pipe' });
        return;
      }
    }
    throw err;
  }
}

function ensureDir(dir: string): void {
  if (!DRY_RUN) mkdirSync(dir, { recursive: true });
}

function writeFile(path: string, content: string): void {
  if (DRY_RUN) {
    console.log(`  [write] ${path.replace(ROOT + '/', '')}`);
  } else {
    writeFileSync(path, content, 'utf-8');
  }
}

// ---------------------------------------------------------------------------
// Step 1: Build title → file-path index
// ---------------------------------------------------------------------------
console.log('Building title index…');

const titleToMdxPath = new Map<string, string>();
const titleToStoriesPath = new Map<string, string>();

for (const filePath of globMdx(STORIES)) {
  const content = readFileSync(filePath, 'utf-8');
  const title = extractMetaTitle(content);
  if (title) titleToMdxPath.set(title, filePath);
}

for (const filePath of globStoriesTsx(STORIES)) {
  const content = readFileSync(filePath, 'utf-8');
  const title = extractStoriesTitle(content);
  if (title) titleToStoriesPath.set(title, filePath);
}

// For MDX files with no Meta, check co-located .stories.tsx
for (const filePath of globMdx(STORIES)) {
  const content = readFileSync(filePath, 'utf-8');
  if (extractMetaTitle(content)) continue;
  const storiesPath = filePath.replace(/\.mdx$/, '.stories.tsx');
  if (existsSync(storiesPath)) {
    const sc = readFileSync(storiesPath, 'utf-8');
    const title = extractStoriesTitle(sc);
    if (title && !titleToMdxPath.has(title)) titleToMdxPath.set(title, filePath);
  }
}

console.log(`  ${titleToMdxPath.size} MDX titles, ${titleToStoriesPath.size} stories titles indexed.\n`);

// ---------------------------------------------------------------------------
// Step 2: Execute migrations
// ---------------------------------------------------------------------------
console.log('Migrating files…');

let moved = 0;
let skipped = 0;

for (const entry of ENTRIES) {
  const { oldTitle, newTitle } = entry;
  const tags = makeTags(entry);

  // Compute new path early (needed for idempotency check)
  const _newId = titleToId(newTitle);
  const parts = newTitle.split('/');
  const dirParts = parts.slice(0, -1).map((p) => p.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  const newDir = join(STORIES, ...dirParts);

  // Find the .mdx file — fall back to stories-only files
  let mdxPath = titleToMdxPath.get(oldTitle);
  let storiesOnly = false;
  if (!mdxPath) {
    const sp = titleToStoriesPath.get(oldTitle);
    if (sp) {
      // Stories-only: synthesise an MDX path alongside the stories file
      mdxPath = sp.replace(/\.stories\.tsx$/, '.mdx');
      storiesOnly = true;
    } else {
      // Check if already moved to new location (idempotency for partial runs)
      const candidateNewPath = join(newDir, /* guess */ basename(oldTitle.split('/').pop()!.replace(/[^a-zA-Z0-9 &]/g, '').replace(/ /g, '')) + '.mdx');
      // Simpler: scan newDir for any .mdx with matching new title
      let alreadyMoved = false;
      if (existsSync(newDir)) {
        for (const f of readdirSync(newDir).filter((f) => f.endsWith('.mdx'))) {
          const fp = join(newDir, f);
          const c = readFileSync(fp, 'utf-8');
          if (extractMetaTitle(c) === newTitle) {
            mdxPath = fp;
            alreadyMoved = true;
            break;
          }
        }
      }
      if (!alreadyMoved) {
        console.log(`  SKIP (not found): "${oldTitle}"`);
        skipped++;
        continue;
      }
    }
  }

  const newFileName = basename(mdxPath);
  const newMdxPath = join(newDir, newFileName);

  // Find companion .stories.tsx
  const storiesPath = mdxPath.replace(/\.mdx$/, '.stories.tsx');
  const hasStories = existsSync(storiesPath) || storiesOnly;
  const newStoriesPath = newMdxPath.replace(/\.mdx$/, '.stories.tsx');

  const sameLocation = entry.skipMove || (mdxPath === newMdxPath);

  // Skip if already at new location
  if (!sameLocation && existsSync(newMdxPath)) {
    console.log(`  ↩  already at destination, updating in place: ${newMdxPath.replace(STORIES + '/', '')}`);
  } else if (!sameLocation) {
    ensureDir(newDir);
    if (storiesOnly) {
      // No .mdx exists yet — create it at the new location, then move stories
      const stub = `<Meta title="${newTitle}" tags={${tags}} />\n`;
      if (!DRY_RUN) writeFileSync(newMdxPath, stub, 'utf-8');
      else console.log(`  [create] ${newMdxPath.replace(ROOT + '/', '')} (stub)`);
      run(`git add "${newMdxPath}"`);
      run(`git mv "${storiesPath}" "${newStoriesPath}"`);
    } else {
      run(`git mv "${mdxPath}" "${newMdxPath}"`);
      if (hasStories) run(`git mv "${storiesPath}" "${newStoriesPath}"`);
    }
  }

  // Update MDX content (always read from old path; in dry-run the file hasn't moved)
  let mdxContent = '';
  if (!storiesOnly) {
    const mdxReadPath = DRY_RUN ? mdxPath : (sameLocation ? mdxPath : newMdxPath);
    if (existsSync(mdxReadPath)) {
      mdxContent = readFileSync(mdxReadPath, 'utf-8');
    }
  } else if (!sameLocation && !DRY_RUN) {
    // Stub was just created; read it back
    mdxContent = readFileSync(newMdxPath, 'utf-8');
  }
  if (mdxContent) {
    const newMdxContent = updateMdxMeta(mdxContent, newTitle, tags);
    const mdxWritePath = sameLocation ? mdxPath : newMdxPath;
    if (newMdxContent !== mdxContent) writeFile(mdxWritePath, newMdxContent);
  }

  // Update .stories.tsx title
  if (hasStories) {
    const storiesReadPath = DRY_RUN ? storiesPath : (sameLocation ? storiesPath : newStoriesPath);
    const storiesContent = readFileSync(storiesReadPath, 'utf-8');
    const newStoriesContent = updateStoriesTitle(storiesContent, newTitle);
    const storiesWritePath = sameLocation ? storiesPath : newStoriesPath;
    if (newStoriesContent !== storiesContent) {
      writeFile(storiesWritePath, newStoriesContent);
    }
  }

  const label = entry.skipMove ? '(in-place, dir-move deferred)' : sameLocation ? '(in-place update)' : `→ ${(newMdxPath).replace(STORIES + '/', '')}`;
  console.log(`  ✓ "${oldTitle}" ${label}`);
  moved++;
}

console.log(`\nMoved/updated: ${moved}, skipped: ${skipped}\n`);

// ---------------------------------------------------------------------------
// Step 3: Global cross-reference URL rewrite across all MDX files
// ---------------------------------------------------------------------------
console.log('Rewriting cross-reference URLs…');

const allMdx = globMdx(STORIES);
let filesUpdated = 0;
let totalReplacements = 0;

for (const filePath of allMdx) {
  const original = readFileSync(filePath, 'utf-8');
  let updated = original;

  for (const [oldId, newId] of Object.entries(ID_MAP)) {
    // Match all URL patterns: ../,  ./, or no prefix
    const patterns = [
      new RegExp(`(\\.\\./|\\./|)\\?path=/docs/${escapeRegex(oldId)}--docs`, 'g'),
    ];
    for (const pat of patterns) {
      const before = updated;
      updated = updated.replace(pat, (_, prefix) => `${prefix || '../'}?path=/docs/${newId}--docs`);
      if (updated !== before) totalReplacements++;
    }
  }

  if (updated !== original) {
    writeFile(filePath, updated);
    filesUpdated++;
  }
}

console.log(`  ${filesUpdated} files updated, ${totalReplacements} URL replacements.\n`);

// ---------------------------------------------------------------------------
// Done
// ---------------------------------------------------------------------------
console.log('Migration complete.');
console.log('Next steps:');
console.log('  1. Run: npx tsx scripts/extract-graph-data.ts');
console.log('  2. Run: npm run storybook to verify the new structure');
console.log('  3. Check git diff for unexpected changes');

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
