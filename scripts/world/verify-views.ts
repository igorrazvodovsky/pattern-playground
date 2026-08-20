// Checks that the views assembled from shared/world/ deep-equal the entity
// JSONs they replace. The originals are read from git rather than the working
// tree, so the check still runs once a file has been deleted.
//
// Each path resolves its own ref: HEAD while HEAD still holds the file,
// otherwise the commit before the one that removed it. So the gate keeps
// working as the retirements are committed, without anyone remembering to
// pass a ref.
//
// Usage: npx tsx scripts/world/verify-views.ts [<git-ref>]
//   <git-ref>  read every original at this ref instead of resolving per path

import { execFileSync, spawnSync } from 'node:child_process';
import {
  userViews, projectViews, rawTaskViews, documentViews, commentViews, quoteViews,
  materialViews, componentViews, productViews, serviceViews,
  transactionViews, lifecycleEventViews,
} from '../../shared/data/world-views';

const ref = process.argv[2];

const refFor = (path: string) => {
  if (ref) return ref;
  const atHead = spawnSync('git', ['cat-file', '-e', `HEAD:${path}`]);
  if (atHead.status === 0) return 'HEAD';
  if (atHead.status === null) throw atHead.error ?? new Error(`verify-views: git could not be run for ${path}`);
  // Absent from HEAD: read it at the commit before the one that removed it.
  const removal = execFileSync('git', ['rev-list', '-1', 'HEAD', '--', path], { encoding: 'utf8' }).trim();
  if (!removal) throw new Error(`verify-views: no commit reachable from HEAD holds ${path}`);
  return `${removal}^`;
};

const fromGit = (path: string) =>
  JSON.parse(execFileSync('git', ['show', `${refFor(path)}:${path}`], { encoding: 'utf8' }));

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

// Key-order-insensitive deep equality; reports the path of the first difference.
const diff = (a: unknown, b: unknown, path: string): string | null => {
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${path}: length ${a.length} vs ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = diff(a[i], b[i], `${path}[${i}]`);
      if (d) return d;
    }
    return null;
  }
  if (isObject(a) && isObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const d = diff(a[key], b[key], `${path}.${key}`);
      if (d) return d;
    }
    return null;
  }
  return Object.is(a, b) ? null : `${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
};

// The source data contained assertions that contradicted the world's timeline
// or each other. Each fix is applied to the original here rather than loosened
// in the comparison, so the check stays exact and every divergence is named.
interface Row {
  id: string;
  metadata: Record<string, unknown>;
  entityId?: string;
  timestamp?: string;
}
const by = (rows: Row[], id: string) => rows.find(r => r.id === id)!;

const reconcileDocuments = (rows: Row[]) => {
  // The world's last day is 17 January; two revision dates fell after it.
  by(rows, 'doc-circular-economy').metadata.lastUpdated = '2024-01-17';
  by(rows, 'doc-sustainability-metrics').metadata.lastUpdated = '2024-01-17';
  return rows;
};

const reconcileQuotes = (rows: Row[]) => {
  // Four excerpts were dated 18–21 January, after every sign-in.
  const retimed: Record<string, string> = {
    'quote-circular-business-model': '2024-01-17T11:05:00Z',
    'quote-minimizing-waste': '2024-01-17T11:40:00Z',
    'quote-sustainable-products': '2024-01-17T12:15:00Z',
    'quote-consumer-adoption': '2024-01-17T13:20:00Z',
  };
  for (const [id, createdAt] of Object.entries(retimed)) by(rows, id).metadata.createdAt = createdAt;
  return rows;
};

const reconcileComments = (rows: Row[]) => {
  // comment-16/17 addressed task-10, which never existed; comment-18/19
  // addressed task-9 and re-point to task-5, the collection-logistics task.
  const kept = rows.filter(r => !['comment-16', 'comment-17'].includes(r.id));
  for (const id of ['comment-18', 'comment-19']) by(kept, id).entityId = 'task-5';
  // comment-15 predated the task it comments on.
  by(kept, 'comment-15').timestamp = '2024-01-10T11:20:00.000Z';
  // quoteText/sourceDocument restated what the quote itself already holds.
  delete by(kept, 'comment-26').metadata.quoteText;
  delete by(kept, 'comment-26').metadata.sourceDocument;
  return kept;
};

// Six references across the catalogue name ids that never existed — no entry
// resembles them and no file holds their facts, so they are dropped rather than
// registered as individuals whose facts live elsewhere.
const ghosts = new Set([
  'CMP-MOT-005', 'CMP-MOT-006', 'CMP-MOT-007', 'CMP-MOT-008',
  'CMP-CAM-001', 'CMP-BAT-004', 'MAT-PLA-005', 'MAT-TEX-011',
]);
const live = (ids: string[]) => ids.filter(id => !ghosts.has(id));

const reconcileComponents = (rows: Row[]) => {
  // CMP-BAT-001 is listed among CMP-BAT-003's children but records no parent.
  // The world holds the parent and derives the child list from it, so the
  // original's missing half is filled in rather than the inverse loosened.
  by(rows, 'CMP-BAT-001').metadata.parentComponent = 'CMP-BAT-003';
  for (const row of rows) {
    row.metadata.childComponents = live(row.metadata.childComponents as string[]);
  }
  return rows;
};

const reconcileProducts = (rows: Row[]) => {
  for (const row of rows) {
    row.metadata.assemblyComponents = live(row.metadata.assemblyComponents as string[]);
    row.metadata.keyMaterials = live(row.metadata.keyMaterials as string[]);
  }
  return rows;
};

const targets: [string, string, unknown, ((rows: Row[]) => Row[])?][] = [
  ['users', 'shared/data/users.json', userViews],
  ['projects', 'shared/data/projects.json', projectViews],
  ['tasks', 'shared/data/tasks.json', rawTaskViews],
  ['documents', 'shared/data/documents.json', documentViews, reconcileDocuments],
  ['comments', 'shared/data/comments.json', commentViews, reconcileComments],
  ['quotes', 'shared/data/quotes.json', quoteViews, reconcileQuotes],
  ['materials', 'shared/data/materials.json', materialViews],
  ['components', 'shared/data/components.json', componentViews, reconcileComponents],
  ['products', 'shared/data/products.json', productViews, reconcileProducts],
  ['services', 'shared/data/services.json', serviceViews],
  ['transactions', 'shared/data/transactions.json', transactionViews],
  ['lifecycleEvents', 'shared/data/lifecycle-events.json', lifecycleEventViews],
];

let failed = false;
for (const [label, path, assembled, reconcile] of targets) {
  const original = reconcile ? reconcile(fromGit(path)) : fromGit(path);
  const d = diff(original, assembled, label);
  if (d) {
    console.error(`verify-views: ${label} diverges — original vs assembled at ${d}`);
    failed = true;
  } else {
    console.log(`verify-views: ${label} ✓ (${(original as unknown[]).length} entries)`);
  }
}
process.exit(failed ? 1 : 0);
