// Assembles the entity shapes the repo consumes — the workspace (users,
// projects, raw tasks, documents, comments, quotes), the circular-economy
// catalogue, and the two records of occurrences — from the authoritative
// world: individuals + replayed facts + the action log. Anything computable
// from a fact or from the log — icons, descriptions repeating a role,
// timestamps and updaters — is derived here rather than stored. Which is
// which: docs/specs/world-ontology.md.

import individualsData from '../world/individuals.json' with { type: 'json' };
import factsData from '../world/facts.json' with { type: 'json' };
import worldActionsData from '../world/actions.json' with { type: 'json' };
import worldRulesData from '../world/rules.json' with { type: 'json' };
import type { ActionRecord, Fact, Rule } from './action-types';

export const individuals = individualsData as { id: string; kind: string }[];
export const worldActions = worldActionsData as ActionRecord[];
export const worldRules = worldRulesData as Rule[];
export const facts = (factsData as { facts: Fact[] }).facts;

const bySubject = new Map<string, Fact[]>();
for (const fact of facts) {
  const list = bySubject.get(fact.subject) ?? [];
  list.push(fact);
  bySubject.set(fact.subject, list);
}

const one = (subject: string, relation: string) =>
  bySubject.get(subject)?.find(f => f.relation === relation)?.object;

const oneString = (subject: string, relation: string) => String(one(subject, relation) ?? '');

const many = (subject: string, relation: string) =>
  (bySubject.get(subject) ?? []).filter(f => f.relation === relation).map(f => f.object);

const ofKind = (kind: string) => individuals.filter(i => i.kind === kind).map(i => i.id);

const kindOf = new Map(individuals.map(i => [i.id, i.kind]));

/** Actions that added or removed a fact about the subject, in log order. */
export const actionsTouching = (subject: string) =>
  worldActions.filter(action =>
    [...(action.adds ?? []), ...(action.removes ?? [])].some(f => f.subject === subject)
  );

const latestActionBy = (actorId: string) => worldActions.findLast(a => a.actor === actorId);

const dateOf = (timestamp: string) => timestamp.slice(0, 10);

export interface UserView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    role: string;
    email: string;
    photoUrl: string;
    lastActiveAt: string;
    timezone: string;
    preferredLanguage: string;
  };
}

export const userViews: UserView[] = ofKind('user').map(id => ({
  id,
  name: oneString(id, 'name'),
  type: 'user',
  icon: 'ph:user-fill',
  description: oneString(id, 'role'),
  searchableText: oneString(id, 'search'),
  metadata: {
    role: oneString(id, 'role'),
    email: oneString(id, 'email'),
    photoUrl: oneString(id, 'photo'),
    lastActiveAt: latestActionBy(id)?.timestamp ?? '',
    timezone: oneString(id, 'timezone'),
    preferredLanguage: oneString(id, 'language'),
  },
}));

export interface ProjectView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    status: string;
    phase?: string;
    partners?: number;
    recycled_kg?: number;
    completedAt?: string;
    updatedAt: string;
    updatedBy: string;
  };
}

export const projectViews: ProjectView[] = ofKind('project').map(id => {
  const latest = actionsTouching(id).at(-1);
  const phase = one(id, 'phase');
  const partners = one(id, 'partners');
  const recycledKg = one(id, 'recycledKg');
  const completedAt = one(id, 'completedAt');
  return {
    id,
    name: oneString(id, 'name'),
    type: 'project',
    icon: oneString(id, 'icon'),
    description: oneString(id, 'blurb'),
    searchableText: oneString(id, 'search'),
    metadata: {
      status: oneString(id, 'status'),
      ...(phase !== undefined ? { phase: String(phase) } : {}),
      ...(partners !== undefined ? { partners: Number(partners) } : {}),
      ...(recycledKg !== undefined ? { recycled_kg: Number(recycledKg) } : {}),
      ...(completedAt !== undefined ? { completedAt: String(completedAt) } : {}),
      updatedAt: latest?.timestamp ?? '',
      updatedBy: latest?.actor ?? '',
    },
  };
});

export interface RawTaskView {
  id: string;
  title: string;
  specification: string;
  description: string;
  statusId: string;
  priorityId: string;
  assigneeId: string;
  labelIds: string[];
  projectId: string;
  dueDate: string;
  createdDate: string;
  updatedDate: string;
  updatedBy: string;
  progress: number;
  history: { id: string; timestamp: string; actor: string; action: string; details?: string }[];
}

export const rawTaskViews: RawTaskView[] = ofKind('task').map(id => {
  const touching = actionsTouching(id);
  const creation = touching[0];
  const latest = touching.at(-1);
  return {
    id,
    title: oneString(id, 'title'),
    specification: oneString(id, 'specification'),
    description: oneString(id, 'blurb'),
    statusId: oneString(id, 'status'),
    priorityId: oneString(id, 'priority'),
    assigneeId: oneString(id, 'assignee'),
    labelIds: many(id, 'label').map(String),
    projectId: oneString(id, 'project'),
    dueDate: oneString(id, 'dueDate'),
    createdDate: creation ? dateOf(creation.timestamp) : '',
    updatedDate: latest ? dateOf(latest.timestamp) : '',
    updatedBy: latest?.actor ?? '',
    progress: Number(one(id, 'progress') ?? 0),
    history: touching.map(action => ({
      id: action.id,
      timestamp: action.timestamp,
      actor: action.actor === 'system' ? 'System' : 'User',
      action: String(action.input.label ?? action.name),
      ...(action.input.note !== undefined ? { details: String(action.input.note) } : {}),
    })),
  };
});

// A document body is one value, kept whole rather than decomposed into facts.
export interface DocumentContent {
  plainText: string;
  richContent: { type: 'doc'; content: Record<string, unknown>[] };
}

export interface DocumentSection {
  id: string;
  title: string;
  startIndex: number;
  endIndex: number;
  text: string;
}

export interface DocumentView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    type: string;
    lastUpdated?: string;
    author?: string;
    wordCount?: number;
    path?: string;
    size?: string;
    version?: string;
    quarter?: string;
    recurring?: boolean;
  };
  content: DocumentContent;
  sections?: DocumentSection[];
}

// Uploaded files take an icon for their format; written documents take the
// generic page icon.
const fileIcons: Record<string, string> = {
  spreadsheet: 'ph:file-xls-fill',
  pdf: 'ph:file-pdf-fill',
  presentation: 'ph:file-ppt-fill',
  document: 'ph:file-doc-fill',
};

const actionsAbout = (documentId: string, name: string) =>
  worldActions.filter(a => a.name === name && a.input.documentId === documentId);

export const documentViews: DocumentView[] = ofKind('document').map(id => {
  const documentType = oneString(id, 'documentType');
  const lastEdit = actionsAbout(id, 'editDocument').at(-1);
  const author = one(id, 'author');
  const wordCount = one(id, 'wordCount');
  const path = one(id, 'path');
  const size = one(id, 'size');
  const version = one(id, 'version');
  const quarter = one(id, 'quarter');
  const recurring = one(id, 'recurring');
  const sections = one(id, 'sections') as DocumentSection[] | undefined;
  return {
    id,
    name: oneString(id, 'name'),
    type: 'document',
    icon: fileIcons[documentType] ?? 'ph:file-text-fill',
    description: oneString(id, 'blurb'),
    searchableText: oneString(id, 'search'),
    metadata: {
      type: documentType,
      ...(lastEdit ? { lastUpdated: dateOf(lastEdit.timestamp) } : {}),
      ...(author !== undefined ? { author: String(author) } : {}),
      ...(wordCount !== undefined ? { wordCount: Number(wordCount) } : {}),
      ...(path !== undefined ? { path: String(path) } : {}),
      ...(size !== undefined ? { size: String(size) } : {}),
      ...(version !== undefined ? { version: String(version) } : {}),
      ...(quarter !== undefined ? { quarter: String(quarter) } : {}),
      ...(recurring !== undefined ? { recurring: Boolean(recurring) } : {}),
    },
    content: one(id, 'content') as DocumentContent,
    ...(sections !== undefined ? { sections } : {}),
  };
});

const documentName = (id: string) => documentViews.find(d => d.id === id)?.name ?? id;

export interface QuoteView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    sourceDocument: string;
    sourceRange: { from: number; to: number };
    createdAt: string;
    createdBy: string;
    selectedText: string;
  };
  content: DocumentContent;
}

export const quoteViews: QuoteView[] = ofKind('quote').map(id => {
  const text = oneString(id, 'text');
  const source = oneString(id, 'source');
  const creation = actionsTouching(id)[0];
  return {
    id,
    name: text,
    type: 'quote',
    icon: 'ph:quotes',
    description: `Quote from ${documentName(source)}`,
    searchableText: oneString(id, 'search'),
    metadata: {
      sourceDocument: source,
      sourceRange: one(id, 'range') as { from: number; to: number },
      createdAt: creation?.timestamp ?? '',
      createdBy: oneString(id, 'createdBy'),
      selectedText: text,
    },
    // Every excerpt renders as one highlighted paragraph, so the markup is built
    // from the text rather than stored.
    content: {
      plainText: text,
      richContent: {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', marks: [{ type: 'highlight' }], text }] },
        ],
      },
    },
  };
});

export interface CommentView {
  id: string;
  content: string;
  authorId: string;
  timestamp: string;
  entityType: string;
  entityId: string;
  status: 'active' | 'resolved';
  replyTo: string | null;
  metadata: {
    threadId: string;
    selectionStart?: number;
    selectionEnd?: number;
    selectedText?: string;
    resolvedBy?: string;
    resolvedAt?: string;
    type?: string;
    priority?: string;
  };
}

interface CommentAnchor { start: number; end: number; text: string }

const commentIds = ofKind('comment');

// A thread settles as a whole: whoever marked it so is recorded on the comment
// that opened it, and every comment in the thread reads as resolved.
const resolvedThreads = new Set(
  commentIds.filter(id => one(id, 'resolvedBy') !== undefined).map(id => oneString(id, 'thread'))
);

export const commentViews: CommentView[] = commentIds.map(id => {
  const target = oneString(id, 'about');
  const thread = oneString(id, 'thread');
  const anchor = one(id, 'anchor') as CommentAnchor | undefined;
  const resolvedBy = one(id, 'resolvedBy');
  const resolution = actionsTouching(id).find(a => a.name === 'resolveThread');
  const commentType = one(id, 'commentType');
  const priority = one(id, 'commentPriority');
  const replyTo = one(id, 'replyTo');
  return {
    id,
    content: oneString(id, 'text'),
    authorId: oneString(id, 'author'),
    timestamp: new Date(actionsTouching(id)[0]?.timestamp ?? 0).toISOString(),
    entityType: kindOf.get(target) ?? '',
    entityId: target,
    status: resolvedThreads.has(thread) ? 'resolved' : 'active',
    replyTo: replyTo !== undefined ? String(replyTo) : null,
    metadata: {
      threadId: thread,
      ...(anchor !== undefined
        ? { selectionStart: anchor.start, selectionEnd: anchor.end, selectedText: anchor.text }
        : {}),
      ...(resolvedBy !== undefined ? { resolvedBy: String(resolvedBy) } : {}),
      ...(resolution !== undefined ? { resolvedAt: new Date(resolution.timestamp).toISOString() } : {}),
      ...(commentType !== undefined ? { type: String(commentType) } : {}),
      ...(priority !== undefined ? { priority: String(priority) } : {}),
    },
  };
});

// --- Circular-economy catalogue ---------------------------------------------
// The catalogue is its own strand of the log: recorded by the system in
// 2025–26, where the workspace strand runs to January 2024. Nothing crosses
// between them, and every view derivation is scoped to one subject, so the two
// coexist. See the plan's territory 3 log entry.

/** True when a unary fact holds — one with no object, such as appliesToAll. */
const has = (subject: string, relation: string) =>
  (bySubject.get(subject) ?? []).some(f => f.relation === relation);

/** The action that brought the individual into the world. */
const creationOf = (subject: string) => actionsTouching(subject)[0];

export interface MaterialView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    category: string;
    subcategory: string;
    recycledContent: number;
    carbonFootprint: number;
    unit: string;
    recyclability: string;
    certification: string[];
    supplier: string;
    cost: number;
    costUnit: string;
    availability: string;
    leadTime: number;
    leadTimeUnit: string;
  };
}

export const materialViews: MaterialView[] = ofKind('material').map(id => ({
  id,
  name: oneString(id, 'name'),
  // A material's type restates its category in every entry, so it is derived.
  type: oneString(id, 'category'),
  icon: oneString(id, 'icon'),
  description: oneString(id, 'blurb'),
  searchableText: oneString(id, 'search'),
  metadata: {
    category: oneString(id, 'category'),
    subcategory: oneString(id, 'subcategory'),
    recycledContent: Number(one(id, 'recycledContent')),
    carbonFootprint: Number(one(id, 'carbonFootprint')),
    unit: oneString(id, 'unit'),
    recyclability: oneString(id, 'recyclability'),
    certification: one(id, 'certification') as string[],
    supplier: oneString(id, 'supplier'),
    cost: Number(one(id, 'cost')),
    costUnit: oneString(id, 'costUnit'),
    availability: oneString(id, 'availability'),
    leadTime: Number(one(id, 'leadTime')),
    leadTimeUnit: oneString(id, 'leadTimeUnit'),
  },
}));

export interface ComponentView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    category: string;
    hierarchy: string;
    parentComponent: string | null;
    childComponents: string[];
    materials: string[];
    specifications: Record<string, unknown>;
    lifecycle: {
      designLife: number;
      designLifeUnit: string;
      repairability: string;
      refurbishable: boolean;
      recyclable: boolean;
      endOfLife: string[];
    };
    sustainability: Record<string, unknown>;
    supplier: string;
    cost: number;
    leadTime: number;
  };
}

const componentIds = ofKind('component');

// Only the parent is a fact; the child list is its inverse, in registration
// order. Storing both would let them disagree, which is how the source data
// came to list CMP-BAT-001 as a child of a component it named no parent for.
const childrenOf = new Map<string, string[]>();
for (const id of componentIds) {
  const parent = one(id, 'partOf');
  if (parent === undefined) continue;
  const siblings = childrenOf.get(String(parent)) ?? [];
  siblings.push(id);
  childrenOf.set(String(parent), siblings);
}

export const componentViews: ComponentView[] = componentIds.map(id => {
  const parent = one(id, 'partOf');
  return {
    id,
    name: oneString(id, 'name'),
    // A component's type restates where it sits in the assembly.
    type: oneString(id, 'hierarchy'),
    icon: oneString(id, 'icon'),
    description: oneString(id, 'blurb'),
    searchableText: oneString(id, 'search'),
    metadata: {
      category: oneString(id, 'category'),
      hierarchy: oneString(id, 'hierarchy'),
      parentComponent: parent !== undefined ? String(parent) : null,
      childComponents: childrenOf.get(id) ?? [],
      materials: many(id, 'madeOf').map(String),
      specifications: one(id, 'specifications') as Record<string, unknown>,
      lifecycle: one(id, 'lifecycle') as ComponentView['metadata']['lifecycle'],
      sustainability: one(id, 'sustainability') as Record<string, unknown>,
      supplier: oneString(id, 'supplier'),
      cost: Number(one(id, 'cost')),
      leadTime: Number(one(id, 'leadTime')),
    },
  };
});

export interface ProductView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    category: string;
    subcategory: string;
    assemblyComponents: string[];
    keyMaterials: string[];
    specifications: Record<string, string | number | boolean>;
    lifecycle: {
      designLife: number | string;
      designLifeUnit: string;
      warrantyPeriod: number;
      repairability: string;
      upgradeability: string;
      [key: string]: unknown;
    };
    sustainability: {
      carbonFootprint: number;
      unit: string;
      recycledContentOverall: number;
      recyclabilityScore: number;
      certifications: string[];
      [key: string]: unknown;
    };
    circular: {
      designForDisassembly: boolean;
      modularDesign: boolean;
      takeBackProgram: boolean;
      [key: string]: unknown;
    };
    pricing: {
      msrp: number;
      currency: string;
      leaseOptions: boolean;
      subscriptionModel: boolean;
      tradeInValue: number;
    };
    availability: {
      status: string;
      leadTime: number;
      leadTimeUnit: string;
      regions: string[];
      channels: string[];
    };
    condition: string;
    location: { site: string; lat: number; lng: number };
    listedAt: string;
  };
}

export const productViews: ProductView[] = ofKind('product').map(id => ({
  id,
  name: oneString(id, 'name'),
  type: 'product',
  icon: oneString(id, 'icon'),
  description: oneString(id, 'blurb'),
  searchableText: oneString(id, 'search'),
  metadata: {
    category: oneString(id, 'category'),
    subcategory: oneString(id, 'subcategory'),
    assemblyComponents: many(id, 'assembledFrom').map(String),
    keyMaterials: many(id, 'keyMaterial').map(String),
    specifications: one(id, 'specifications') as ProductView['metadata']['specifications'],
    lifecycle: one(id, 'lifecycle') as ProductView['metadata']['lifecycle'],
    sustainability: one(id, 'sustainability') as ProductView['metadata']['sustainability'],
    circular: one(id, 'circular') as ProductView['metadata']['circular'],
    pricing: one(id, 'pricing') as ProductView['metadata']['pricing'],
    availability: one(id, 'availability') as ProductView['metadata']['availability'],
    condition: oneString(id, 'condition'),
    location: one(id, 'location') as ProductView['metadata']['location'],
    // The listing date is when the listing happened, not a stored attribute.
    listedAt: dateOf(creationOf(id)?.timestamp ?? ''),
  },
}));

export interface ServiceView {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  searchableText: string;
  metadata: {
    category: string;
    serviceType: string;
    applicableProducts: string[];
    applicableComponents: string[];
    serviceProvider: string;
    location: string;
    duration: number | string;
    durationUnit: string;
    frequency: string;
    sustainability: Record<string, unknown>;
    pricing: Record<string, unknown>;
    checklist?: string[];
    tools?: string[];
    materialsUsed?: string[];
    materialsRecovered?: string[];
    warranty?: Record<string, unknown>;
    process?: string[];
    upgradeOptions?: string[];
    certification?: Record<string, unknown>;
    features?: string[];
    dataTracked?: string[];
    technology?: string[];
    privacy?: Record<string, unknown>;
    services?: string[];
    expertise?: string[];
    deliverables?: string[];
  };
}

// Optional keys are absent from the view when no fact holds them, which is how
// the source distinguished a service that lists no tools from one that lists an
// empty set.
const optional = (id: string, relation: string, key: string) => {
  const value = one(id, relation);
  return value !== undefined ? { [key]: value } : {};
};

export const serviceViews: ServiceView[] = ofKind('service').map(id => {
  // A service that applies to everything holds one unary fact rather than a
  // fact per catalogue entry: "all" is not an id, and enumerating it would
  // assert pairs no act established and go stale on the next listing.
  const universal = has(id, 'appliesToAll');
  const applicable = many(id, 'appliesTo').map(String);
  const used = many(id, 'usesMaterial').map(String);
  const recovered = many(id, 'recoversMaterial').map(String);
  return {
    id,
    name: oneString(id, 'name'),
    // A service's type restates its category.
    type: oneString(id, 'category'),
    icon: oneString(id, 'icon'),
    description: oneString(id, 'blurb'),
    searchableText: oneString(id, 'search'),
    metadata: {
      category: oneString(id, 'category'),
      serviceType: oneString(id, 'serviceType'),
      applicableProducts: universal ? ['all'] : applicable.filter(i => kindOf.get(i) === 'product'),
      applicableComponents: universal ? ['all'] : applicable.filter(i => kindOf.get(i) === 'component'),
      serviceProvider: oneString(id, 'serviceProvider'),
      location: oneString(id, 'location'),
      duration: one(id, 'duration') as number | string,
      durationUnit: oneString(id, 'durationUnit'),
      frequency: oneString(id, 'frequency'),
      ...optional(id, 'checklist', 'checklist'),
      ...(used.length > 0 ? { materialsUsed: used } : {}),
      ...optional(id, 'tools', 'tools'),
      sustainability: one(id, 'sustainability') as Record<string, unknown>,
      pricing: one(id, 'pricing') as Record<string, unknown>,
      ...optional(id, 'warranty', 'warranty'),
      ...optional(id, 'process', 'process'),
      ...optional(id, 'upgradeOptions', 'upgradeOptions'),
      ...(recovered.length > 0 ? { materialsRecovered: recovered } : {}),
      ...optional(id, 'certification', 'certification'),
      ...optional(id, 'features', 'features'),
      ...optional(id, 'dataTracked', 'dataTracked'),
      ...optional(id, 'technology', 'technology'),
      ...optional(id, 'privacy', 'privacy'),
      ...optional(id, 'offerings', 'services'),
      ...optional(id, 'expertise', 'expertise'),
      ...optional(id, 'deliverables', 'deliverables'),
    } as ServiceView['metadata'],
  };
});

// --- Occurrences -------------------------------------------------------------
// The ledger and the lifecycle assessment record happenings, not things: their
// action types state no facts, since the world holds no accounts for a balance
// to be a fact about and no flow leaves a standing property behind. So these
// two views are assembled from the action records themselves, and each row's
// date is its action's timestamp. The ledger runs through 2024 and the
// assessment from 2010 to 2026 — two more strands of the log, on the reading
// the spec settles under "The log is the source of truth".

const ofType = (name: string) => worldActions.filter(action => action.name === name);

export interface TransactionView {
  id: string;
  amount: number;
  description: string;
  summary: string;
  status: string;
  date: string;
  category: string;
}

export const transactionViews: TransactionView[] = ofType('recordTransaction').map(action => ({
  id: action.id,
  amount: Number(action.input.amount),
  // The ledger's short label and its longer remark ride on the log's two
  // conventional value participants rather than on relations of their own.
  description: String(action.input.note),
  summary: String(action.input.label),
  // Whether the payment settled is the outcome of the act, not a property of a
  // ledger row, so it is an output participant.
  status: String(action.output?.status),
  date: dateOf(action.timestamp),
  category: String(action.input.category),
}));

export interface LifecycleEventView {
  id: string;
  date: string;
  stage: string;
  description: string;
  co2e: number;
  site: string;
}

export const lifecycleEventViews: LifecycleEventView[] = ofType('recordFlow').map(action => ({
  id: action.id,
  date: dateOf(action.timestamp),
  stage: String(action.input.stage),
  description: String(action.input.label),
  // What the flow carried is what it produced.
  co2e: Number(action.output?.co2e),
  site: String(action.input.site),
}));
