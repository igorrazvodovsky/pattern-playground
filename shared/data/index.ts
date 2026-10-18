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

// Dynamic reference resolution utility
export const resolveReferenceData = (id: string, type: string) => {
  switch (type) {
    case 'user':
      const user = users.find(u => u.id === id);
      return user ? {
        id: user.id,
        name: user.name,
        icon: user.icon,
        type: user.type,
        description: user.description,
        searchableText: user.searchableText,
        metadata: { ...user.metadata, description: user.description }
      } : null;

    case 'project':
      const project = projects.find(p => p.id === id);
      return project ? {
        id: project.id,
        name: project.name,
        icon: project.icon,
        type: project.type,
        description: project.description,
        searchableText: project.searchableText,
        metadata: { ...project.metadata, description: project.description }
      } : null;

    case 'document':
      const document = documents.find(d => d.id === id);
      return document ? {
        id: document.id,
        name: document.name,
        icon: document.icon,
        type: document.type,
        description: document.description,
        searchableText: document.searchableText,
        metadata: { ...document.metadata, description: document.description }
      } : null;

    case 'quote':
      const quote = quotes.find(q => q.id === id);
      return quote ? {
        id: quote.id,
        name: quote.name,
        icon: quote.icon,
        type: quote.type,
        description: quote.description,
        searchableText: quote.searchableText,
        content: quote.content, // Include the full content object
        metadata: { ...quote.metadata, description: quote.description }
      } : null;

    case 'material':
      const material = materials.find(m => m.id === id);
      return material ? {
        id: material.id,
        name: material.name,
        icon: material.icon,
        type: material.type,
        description: material.description,
        searchableText: material.searchableText,
        metadata: { ...material.metadata, description: material.description }
      } : null;

    case 'component':
      const component = components.find(c => c.id === id);
      return component ? {
        id: component.id,
        name: component.name,
        icon: component.icon,
        type: component.type,
        description: component.description,
        searchableText: component.searchableText,
        metadata: { ...component.metadata, description: component.description }
      } : null;

    case 'product':
      const product = products.find(p => p.id === id);
      return product ? {
        id: product.id,
        name: product.name,
        icon: product.icon,
        type: product.type,
        description: product.description,
        searchableText: product.searchableText,
        metadata: { ...product.metadata, description: product.description }
      } : null;

    case 'service':
      const service = services.find(s => s.id === id);
      return service ? {
        id: service.id,
        name: service.name,
        icon: service.icon,
        type: service.type,
        description: service.description,
        searchableText: service.searchableText,
        metadata: { ...service.metadata, description: service.description }
      } : null;

    default:
      return null;
  }
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

// Reference data using unified SearchableParent format (same as commands)
export const referenceCategories = [
  {
    id: 'users',
    name: 'Users',
    icon: 'ph:users',
    searchableText: 'users people team members',
    children: users.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:user',
      searchableText: item.name.toLowerCase(),
      type: 'user' as const,
      metadata: { ...item.metadata, description: item.description }
    }))
  },
  {
    id: 'documents',
    name: 'Documents',
    icon: 'ph:file-text',
    searchableText: 'documents files content',
    children: documents.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:file-text',
      searchableText: item.name.toLowerCase(),
      type: 'document' as const,
      metadata: { ...item.metadata, description: item.description }
    }))
  },
  {
    id: 'projects',
    name: 'Projects',
    icon: 'ph:folder',
    searchableText: 'projects workspaces',
    children: projects.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:folder',
      searchableText: item.name.toLowerCase(),
      type: 'project' as const,
      metadata: { ...item.metadata, description: item.description }
    }))
  },
  {
    id: 'quotes',
    name: 'Quotes',
    icon: 'ph:quotes',
    searchableText: 'quotes selections excerpts text',
    children: quotes.map(quote => ({
      id: quote.id,
      name: quote.name,
      icon: 'ph:quotes',
      searchableText: quote.searchableText,
      type: 'quote' as const,
      metadata: { ...quote.metadata, description: quote.description }
    }))
  },
  {
    id: 'materials',
    name: 'Materials',
    icon: 'ph:cube',
    searchableText: 'materials substances raw supplies circular economy',
    children: materials.map(material => ({
      id: material.id,
      name: material.name,
      icon: material.icon,
      searchableText: material.searchableText,
      type: 'material' as const,
      metadata: { ...material.metadata, description: material.description }
    }))
  },
  {
    id: 'components',
    name: 'Components',
    icon: 'ph:gear',
    searchableText: 'components parts assemblies hardware pieces',
    children: components.map(component => ({
      id: component.id,
      name: component.name,
      icon: component.icon,
      searchableText: component.searchableText,
      type: 'component' as const,
      metadata: { ...component.metadata, description: component.description }
    }))
  },
  {
    id: 'products',
    name: 'Products',
    icon: 'ph:package',
    searchableText: 'products items goods merchandise finished',
    children: products.map(product => ({
      id: product.id,
      name: product.name,
      icon: product.icon,
      searchableText: product.searchableText,
      type: 'product' as const,
      metadata: { ...product.metadata, description: product.description }
    }))
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'ph:wrench',
    searchableText: 'services maintenance repair support circular',
    children: services.map(service => ({
      id: service.id,
      name: service.name,
      icon: service.icon,
      searchableText: service.searchableText,
      type: 'service' as const,
      metadata: { ...service.metadata, description: service.description }
    }))
  }
];

// Basic reference data (users only) for simple examples
export const basicReferenceCategories = [
  {
    id: 'users',
    name: 'Users',
    icon: 'ph:users',
    searchableText: 'users people team members',
    children: users.map(item => ({
      id: item.id,
      name: item.name,
      icon: 'ph:user',
      searchableText: item.name.toLowerCase(),
      type: 'user' as const,
      metadata: { ...item.metadata, description: item.description }
    }))
  }
];

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