import {
  userViews, projectViews, rawTaskViews, documentViews, commentViews, quoteViews,
  materialViews, componentViews, productViews, serviceViews,
  transactionViews, lifecycleEventViews,
} from './world-views';
import referenceContentData from './reference-content.json' with { type: 'json' };
import commandsData from './commands.json' with { type: 'json' };
import recentItemsData from './recent-items.json' with { type: 'json' };
import reuseListingsData from './reuse-listings.json' with { type: 'json' };
import { transformTasksData } from './transformations/tasks';
import { createFinder } from './finders';

import filterStatusesData from './statuses.json' with { type: 'json' };
import filterLabelsData from './labels.json' with { type: 'json' };
import filterPrioritiesData from './priorities.json' with { type: 'json' };
import filterDatesData from './filter-dates.json' with { type: 'json' };

export const users = userViews;
export const projects = projectViews;
export const documents = documentViews;
const referenceContent = referenceContentData;
export const commands = commandsData;
export const recentItems = recentItemsData;
export const reuseListings = reuseListingsData;
export const transactions = transactionViews;
/* One tracked e-bike, cradle to grave: every flow the assessment counted,
   dated, with its kg CO2e — negative where recovery gave something back. */
export const lifecycleEvents = lifecycleEventViews;
export const comments = commentViews;
export const quotes = quoteViews;

export const materials = materialViews;
export const components = componentViews;
export const products = productViews;
export const services = serviceViews;

// Re-export for external use
export { default as filterStatuses } from './statuses.json' with { type: 'json' };
export { default as filterLabels } from './labels.json' with { type: 'json' };
export { default as filterPriorities } from './priorities.json' with { type: 'json' };
export { default as filterDates } from './filter-dates.json' with { type: 'json' };

export const tasks = transformTasksData(
  rawTaskViews,
  users,
  projects,
  filterStatusesData,
  filterPrioritiesData,
  filterLabelsData
);

// Create finder utilities using generic functions
export const getUserById = createFinder(users);
export const getProjectById = createFinder(projects);
export const getDocumentById = createFinder(documents);
export const getReferenceContentById = createFinder(referenceContent);

export const getDocumentContentText = (documentId: string, sectionId?: string) => {
  const doc = documents.find(doc => doc.id === documentId);
  if (!doc) return '';

  if (sectionId) {
    const section = doc.sections?.find(section => section.id === sectionId);
    return section?.text || '';
  }

  return doc.content?.plainText || '';
};

export const getDocumentContentRich = (documentId: string, sectionId?: string) => {
  const doc = documents.find(doc => doc.id === documentId);
  if (!doc) return null;

  if (sectionId) {
    const section = doc.sections?.find(section => section.id === sectionId);
    if (section) {
      // For sections, we need to extract the relevant rich content portion
      // For now, return the full document rich content - this could be enhanced
      return doc.content?.richContent;
    }
    return null;
  }

  return doc.content?.richContent;
};

// Quote utility functions
export const getQuoteById = createFinder(quotes);

// The world: individuals, facts, and the action log (shared/world/), plus
// plain-language rendering of actions
export {
  actions,
  feedActions,
  getActionById,
  getActionsByActor,
  getActionsAbout,
  getConsequencesOf,
  getCausesOf,
  rules,
  getRuleById,
  provenanceOf,
  nameOf,
  describeAction,
} from './actions';
export { individuals, facts, actionsTouching } from './world-views';
export type { ActionDescription, ActionProvenance } from './actions';
export type { ActionRecord, Fact, ParticipantValue, Rule } from './action-types';

// Type exports for better type safety
export type User = typeof users[0];
export type Project = typeof projects[0];
export type Document = typeof documents[0];
export type Command = typeof commands[0];
export type RecentItem = typeof recentItems[0];
export type ReuseListing = typeof reuseListings[0];
// Import unified Task types
export type {
  Task,
  TaskHistoryEntry,
  TaskStatus,
  TaskPriority,
  TaskLabel,
  CreateTaskInput
} from './task-types';

// Attribute bindings: entity types described declaratively for item views
export type {
  ItemScope,
  AttributeRole,
  AttributeValueType,
  AttributeBinding,
  AttributeSelection,
  BoundEntity,
  EntityBinding,
} from './bindings';
export {
  bindings,
  getValueAtPath,
  deriveAttributeLabel,
  attributeLabelFromBinding,
  findAttribute,
  resolveAttributeSelection,
  IDENTITY_ROLES,
  isNumericValueType,
  formatBoundValue,
  resolveEntityTitle,
  productBinding,
  projectBinding,
  taskBinding,
  quoteBinding,
  referenceBinding,
  userBinding,
} from './bindings';

// Re-export transformation types
export type {
  TransformedTask,
  TaskStatus as TaskStatusTransformed,
  TaskPriority as TaskPriorityTransformed,
  TaskLabel as TaskLabelTransformed
} from './transformations/tasks';
export type Transaction = typeof transactions[0];
export type Comment = typeof comments[0];
export type Quote = typeof quotes[0];

// Content structure types
export interface RichContent {
  plainText: string;
  richContent?: {
    type: 'doc';
    content: unknown[];
  };
}

// Circular economy types
export type { MaterialView as Material, ComponentView as Component,
  ProductView as Product, ServiceView as Service } from './world-views';

// Circular economy utility functions
export const getProductById = createFinder(products);

// Referenceable entity kinds, in menu order. For the kinds that set
// `childIcon`, menu items show that one outline icon and match on name only.
interface ReferenceableItem {
  id: string;
  name: string;
  icon: string;
  searchableText: string;
  description?: string;
  metadata?: object;
}

const referenceSources = [
  { type: 'user', id: 'users', name: 'Users', icon: 'ph:users', childIcon: 'ph:user',
    searchableText: 'users people team members', list: users },
  { type: 'document', id: 'documents', name: 'Documents', icon: 'ph:file-text', childIcon: 'ph:file-text',
    searchableText: 'documents files content', list: documents },
  { type: 'project', id: 'projects', name: 'Projects', icon: 'ph:folder', childIcon: 'ph:folder',
    searchableText: 'projects workspaces', list: projects },
  { type: 'quote', id: 'quotes', name: 'Quotes', icon: 'ph:quotes',
    searchableText: 'quotes selections excerpts text', list: quotes },
  { type: 'material', id: 'materials', name: 'Materials', icon: 'ph:cube',
    searchableText: 'materials substances raw supplies circular economy', list: materials },
  { type: 'component', id: 'components', name: 'Components', icon: 'ph:gear',
    searchableText: 'components parts assemblies hardware pieces', list: components },
  { type: 'product', id: 'products', name: 'Products', icon: 'ph:package',
    searchableText: 'products items goods merchandise finished', list: products },
  { type: 'service', id: 'services', name: 'Services', icon: 'ph:wrench',
    searchableText: 'services maintenance repair support circular', list: services },
] as const satisfies ReadonlyArray<{
  type: string; id: string; name: string; icon: string; childIcon?: string;
  searchableText: string; list: ReadonlyArray<ReferenceableItem>;
}>;

type ReferenceSource = (typeof referenceSources)[number];

const toReferenceItem = (source: ReferenceSource, item: ReferenceableItem) => ({
  id: item.id,
  name: item.name,
  ...('childIcon' in source
    ? { icon: source.childIcon, searchableText: item.name.toLowerCase() }
    : { icon: item.icon, searchableText: item.searchableText }),
  type: source.type,
  metadata: { ...item.metadata, description: item.description },
});

const toReferenceCategory = (source: ReferenceSource) => ({
  id: source.id,
  name: source.name,
  icon: source.icon,
  searchableText: source.searchableText,
  children: source.list.map(item => toReferenceItem(source, item)),
});

// Reference data using unified SearchableParent format (same as commands)
export const referenceCategories = referenceSources.map(toReferenceCategory);

// Basic reference data (users only) for simple examples
export const basicReferenceCategories = [toReferenceCategory(referenceSources[0])];

// The menu item for one referenced entity, looked up by reference type.
export const resolveReferenceData = (id: string, type: string) => {
  const source = referenceSources.find(s => s.type === type);
  const item = source?.list.find(i => i.id === id);
  return source && item ? toReferenceItem(source, item) : null;
};

// Filter data using unified SearchableParent format (same as commands)
// Children are stamped with the owning category's filterType at assembly:
// the date lists share one JSON across three categories, so the JSON itself
// cannot know which filter type it belongs to.
const withFilterType = <T extends object>(children: T[], filterType: string) =>
  children.map(child => ({ ...child, filterType }));

export const filterCategories = [
  {
    id: 'Status',
    name: 'Status',
    icon: 'ph:flag',
    searchableText: 'status state condition',
    children: withFilterType(filterStatusesData, 'Status')
  },
  {
    id: 'Priority',
    name: 'Priority',
    icon: 'ph:cell-signal-high',
    searchableText: 'priority importance urgency',
    children: withFilterType(filterPrioritiesData, 'Priority')
  },
  {
    id: 'Labels',
    name: 'Labels',
    icon: 'ph:tag',
    searchableText: 'labels tags categories',
    children: withFilterType(filterLabelsData, 'Labels')
  },
  {
    id: 'Assignee',
    name: 'Assignee',
    icon: 'ph:user',
    searchableText: 'assignee assigned person owner',
    children: [
      ...users.map(user => ({
        id: `assignee-${user.id}`,
        name: user.name,
        icon: 'ph:user',
        searchableText: user.name.toLowerCase(),
        filterType: 'Assignee',
        value: user.name,
        metadata: user.metadata
      })),
      {
        id: 'assignee-none',
        name: 'No assignee',
        icon: 'ph:user-minus',
        searchableText: 'no assignee unassigned',
        filterType: 'Assignee',
        value: 'No assignee'
      }
    ]
  },
  {
    id: 'Due date',
    name: 'Due date',
    icon: 'ph:calendar',
    searchableText: 'due date deadline schedule',
    children: withFilterType(filterDatesData, 'Due date')
  },
  {
    id: 'Created date',
    name: 'Created date',
    icon: 'ph:calendar-plus',
    searchableText: 'created date when made',
    children: withFilterType(filterDatesData, 'Created date')
  },
  {
    id: 'Updated date',
    name: 'Updated date',
    icon: 'ph:calendar-check',
    searchableText: 'updated date last modified',
    children: withFilterType(filterDatesData, 'Updated date')
  },
];