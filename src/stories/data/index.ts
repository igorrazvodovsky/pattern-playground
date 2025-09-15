import usersData from './users.json' with { type: 'json' };
import projectsData from './projects.json' with { type: 'json' };
import documentsData from './documents.json' with { type: 'json' };
import referenceContentData from './reference-content.json' with { type: 'json' };
import editorContentData from './editor-content.json' with { type: 'json' };
import commentThreadsData from './comment-threads.json' with { type: 'json' };
import commandsData from './commands.json' with { type: 'json' };
import recentItemsData from './recent-items.json' with { type: 'json' };
import tasksData from './tasks.json' with { type: 'json' };
import transactionsData from './transactions.json' with { type: 'json' };
import commentsData from './comments.json' with { type: 'json' };
import quotesData from './quotes.json' with { type: 'json' };
import materialsData from './materials.json' with { type: 'json' };
import componentsData from './components.json' with { type: 'json' };
import productsData from './products.json' with { type: 'json' };
import servicesData from './services.json' with { type: 'json' };

import filterStatusesData from './statuses.json' with { type: 'json' };
import filterLabelsData from './labels.json' with { type: 'json' };
import filterPrioritiesData from './priorities.json' with { type: 'json' };
import filterDatesData from './filter-dates.json' with { type: 'json' };

export const users = usersData;
export const projects = projectsData;
export const documents = documentsData;
export const referenceContent = referenceContentData;
export const editorContent = editorContentData;
export const commentThreads = commentThreadsData;
export const commands = commandsData;
export const recentItems = recentItemsData;
export const transactions = transactionsData;
export const comments = commentsData;
export const quotes = quotesData;

export const materials = materialsData;
export const components = componentsData;
export const products = productsData;
export const services = servicesData;

// Re-export for external use
export { default as filterStatuses } from './statuses.json' with { type: 'json' };
export { default as filterLabels } from './labels.json' with { type: 'json' };
export { default as filterPriorities } from './priorities.json' with { type: 'json' };
export { default as filterDates } from './filter-dates.json' with { type: 'json' };

export const tasks = tasksData.map(task => ({
  id: task.id,
  title: task.title,
  specification: task.specification,
  description: task.description,

  // Convert to rich objects
  status: {
    id: task.statusId,
    label: filterStatusesData.find(s => s.id === task.statusId)?.name || task.statusId,
    value: filterStatusesData.find(s => s.id === task.statusId)?.value || 'submitted',
    color: '#gray'  // Status data doesn't have colors, using default
  },

  priority: task.priorityId ? {
    id: task.priorityId,
    label: filterPrioritiesData.find(p => p.id === task.priorityId)?.name || task.priorityId,
    value: filterPrioritiesData.find(p => p.id === task.priorityId)?.value || 'medium',
    color: '#blue'  // Priority data doesn't have colors, using default
  } : undefined,

  assignee: task.assigneeId ? users.find(user => user.id === task.assigneeId) : undefined,

  labels: task.labelIds ? task.labelIds.map(labelId => {
    const label = filterLabelsData.find(l => l.id === labelId);
    return label ? {
      id: labelId,
      label: label.name,  // Using 'name' field from labels.json
      color: '#purple'    // Default color for labels
    } : null;
  }).filter(Boolean) : undefined,

  project: task.projectId ? projects.find(project => project.id === task.projectId) : undefined,

  // Progress and history from JSON
  progress: task.progress || 0,
  history: task.history.map(entry => ({
    ...entry,
    timestamp: new Date(entry.timestamp)
  })),

  // Temporal fields
  createdAt: new Date(task.createdDate),
  updatedAt: task.updatedDate ? new Date(task.updatedDate) : undefined,
  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,

  updatedBy: task.updatedBy ? users.find(user => user.id === task.updatedBy) : undefined,

  // Metadata for ItemView
  metadata: {
    tags: task.labelIds ? task.labelIds.map(labelId =>
      filterLabelsData.find(l => l.id === labelId)?.name
    ).filter(Boolean) : []
  }
}));

// Utility functions
export const getUserByName = (name: string) => {
  return users.find(user => user.name === name);
};

export const getUserById = (id: string) => {
  return users.find(user => user.id === id);
};

export const getProjectById = (id: string) => {
  return projects.find(project => project.id === id);
};

export const getDocumentById = (id: string) => {
  return documents.find(doc => doc.id === id);
};

export const getDocumentContentById = (id: string) => {
  return documents.find(doc => doc.id === id);
};

export const getReferenceContentById = (id: string) => {
  return referenceContent.find(ref => ref.id === id);
};

export const getEditorContentById = (id: string) => {
  return editorContent.find(content => content.id === id);
};

export const getDocumentContentBySection = (documentId: string, sectionId: string) => {
  const doc = documents.find(doc => doc.id === documentId);
  if (!doc) return null;

  const section = doc.sections?.find(section => section.id === sectionId);
  return section ? { document: doc, section } : null;
};

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

export const getCommentThreadSetupById = (id: string) => {
  return commentThreads.find(setup => setup.id === id);
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

export const getTaskById = (id: string) => {
  return tasks.find(task => task.id === id);
};

export const getStatusById = (id: string) => {
  return filterStatusesData.find(status => status.id === id);
};

export const getPriorityById = (id: string) => {
  return filterPrioritiesData.find(priority => priority.id === id);
};

export const getLabelById = (id: string) => {
  return filterLabelsData.find(label => label.id === id);
};

export const getCommentById = (id: string) => {
  return comments.find(comment => comment.id === id);
};

export const getTasksByProject = (projectId: string) => {
  return tasks.filter(task => task.project?.id === projectId);
};

export const getTasksByAssignee = (userId: string) => {
  return tasks.filter(task => task.assignee?.id === userId);
};

export const getCommentsByThreadId = (threadId: string) => {
  return comments.filter(comment => comment.metadata?.threadId === threadId);
};

export const getCommentsByEntity = (entityType: string, entityId: string) => {
  return comments.filter(comment => comment.entityType === entityType && comment.entityId === entityId);
};

export const getCommentReplies = (commentId: string) => {
  return comments.filter(comment => comment.replyTo === commentId);
};

export const getTopLevelComments = () => {
  return comments.filter(comment => !comment.replyTo);
};

export const getActiveComments = () => {
  return comments.filter(comment => comment.status === 'active');
};

export const getResolvedComments = () => {
  return comments.filter(comment => comment.status === 'resolved');
};

// Quote utility functions
export const getQuoteById = (id: string) => {
  return quotes.find(quote => quote.id === id);
};

export const getQuotesByDocument = (documentId: string) => {
  return quotes.filter(quote => quote.metadata.sourceDocument === documentId);
};

export const getQuotesByUser = (userId: string) => {
  return quotes.filter(quote => quote.metadata.createdBy === userId);
};

export const getQuotesByDateRange = (startDate: string, endDate: string) => {
  return quotes.filter(quote => {
    const quoteDate = new Date(quote.metadata.createdAt);
    return quoteDate >= new Date(startDate) && quoteDate <= new Date(endDate);
  });
};

export const searchQuotes = (searchText: string) => {
  const lowerSearchText = searchText.toLowerCase();
  return quotes.filter(quote =>
    quote.searchableText.includes(lowerSearchText) ||
    quote.content.plainText.toLowerCase().includes(lowerSearchText) ||
    quote.description.toLowerCase().includes(lowerSearchText)
  );
};

// Type exports for better type safety
export type User = typeof users[0];
export type Project = typeof projects[0];
export type Document = typeof documents[0];
export type ReferenceContent = typeof referenceContent[0];
export type EditorContent = typeof editorContent[0];
export type CommentThreadSetup = typeof commentThreads[0];
export type Command = typeof commands[0];
export type RecentItem = typeof recentItems[0];
// Import unified Task types
export type {
  Task,
  TaskHistoryEntry,
  TaskStatus,
  TaskPriority,
  TaskLabel,
  CreateTaskInput
} from './task-types';
export { taskToItemObject } from './task-types';
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
export type Material = typeof materials[0];
export type Component = typeof components[0];
export type Product = typeof products[0];
export type Service = typeof services[0];

// Circular economy utility functions
export const getMaterialById = (id: string) => {
  return materials.find(material => material.id === id);
};

export const getComponentById = (id: string) => {
  return components.find(component => component.id === id);
};

export const getProductById = (id: string) => {
  return products.find(product => product.id === id);
};

export const getServiceById = (id: string) => {
  return services.find(service => service.id === id);
};

export const getMaterialsByCategory = (category: string) => {
  return materials.filter(material => material.metadata.category === category);
};

export const getComponentsByHierarchy = (hierarchy: 'part' | 'sub_assembly' | 'assembly') => {
  return components.filter(component => component.metadata.hierarchy === hierarchy);
};

export const getComponentsByParent = (parentId: string) => {
  return components.filter(component => component.metadata.parentComponent === parentId);
};

export const getChildComponents = (componentId: string) => {
  const component = getComponentById(componentId);
  if (!component) return [];
  return component.metadata.childComponents.map(childId => getComponentById(childId)).filter(Boolean);
};

export const getProductsByCategory = (category: string) => {
  return products.filter(product => product.metadata.category === category);
};

export const getServicesByType = (serviceType: string) => {
  return services.filter(service => service.metadata.serviceType === serviceType);
};

export const getServicesForProduct = (productId: string) => {
  return services.filter(service =>
    service.metadata.applicableProducts.includes(productId) ||
    service.metadata.applicableProducts.includes('all')
  );
};

export const getServicesForComponent = (componentId: string) => {
  return services.filter(service =>
    service.metadata.applicableComponents.includes(componentId) ||
    service.metadata.applicableComponents.includes('all')
  );
};

export const getMaterialsUsedInComponent = (componentId: string) => {
  const component = getComponentById(componentId);
  if (!component) return [];
  return component.metadata.materials.map(materialId => getMaterialById(materialId)).filter(Boolean);
};

export const getMaterialsUsedInProduct = (productId: string) => {
  const product = getProductById(productId);
  if (!product) return [];
  return product.metadata.keyMaterials.map(materialId => getMaterialById(materialId)).filter(Boolean);
};

export const getComponentsInProduct = (productId: string) => {
  const product = getProductById(productId);
  if (!product) return [];
  return product.metadata.assemblyComponents.map(componentId => getComponentById(componentId)).filter(Boolean);
};

export const getProductLifecycleStage = (productId: string) => {
  const product = getProductById(productId);
  if (!product) return null;
  return product.metadata.availability.status;
};

export const getRecyclableComponents = () => {
  return components.filter(component => component.metadata.lifecycle.recyclable);
};

export const getRefurbishableComponents = () => {
  return components.filter(component => component.metadata.lifecycle.refurbishable);
};

export const getHighRepairabilityProducts = () => {
  return products.filter(product => product.metadata.lifecycle.repairability === 'high');
};

export const getCompostableMaterials = () => {
  return materials.filter(material =>
    material.metadata.recyclability === 'compostable' ||
    material.metadata.recyclability === 'compostable_matrix'
  );
};

export const getHighRecycledContentMaterials = (threshold: number = 75) => {
  return materials.filter(material => material.metadata.recycledContent >= threshold);
};

export const getCarbonNegativeMaterials = () => {
  return materials.filter(material => material.metadata.carbonFootprint < 0);
};

export const getTakeBackPrograms = () => {
  return products.filter(product => product.metadata.circular.takeBackProgram);
};

export const getModularProducts = () => {
  return products.filter(product => product.metadata.circular.modularDesign);
};

export const searchCircularEconomyData = (searchText: string) => {
  const lowerSearchText = searchText.toLowerCase();

  const matchingMaterials = materials.filter(item =>
    item.searchableText.includes(lowerSearchText) ||
    item.name.toLowerCase().includes(lowerSearchText) ||
    item.description.toLowerCase().includes(lowerSearchText)
  );

  const matchingComponents = components.filter(item =>
    item.searchableText.includes(lowerSearchText) ||
    item.name.toLowerCase().includes(lowerSearchText) ||
    item.description.toLowerCase().includes(lowerSearchText)
  );

  const matchingProducts = products.filter(item =>
    item.searchableText.includes(lowerSearchText) ||
    item.name.toLowerCase().includes(lowerSearchText) ||
    item.description.toLowerCase().includes(lowerSearchText)
  );

  const matchingServices = services.filter(item =>
    item.searchableText.includes(lowerSearchText) ||
    item.name.toLowerCase().includes(lowerSearchText) ||
    item.description.toLowerCase().includes(lowerSearchText)
  );

  return {
    materials: matchingMaterials,
    components: matchingComponents,
    products: matchingProducts,
    services: matchingServices
  };
};

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
export const filterCategories = [
  {
    id: 'Status',
    name: 'Status',
    icon: 'ph:flag',
    searchableText: 'status state condition',
    children: filterStatusesData
  },
  {
    id: 'Priority',
    name: 'Priority',
    icon: 'ph:cell-signal-high',
    searchableText: 'priority importance urgency',
    children: filterPrioritiesData
  },
  {
    id: 'Labels',
    name: 'Labels',
    icon: 'ph:tag',
    searchableText: 'labels tags categories',
    children: filterLabelsData
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
    children: filterDatesData
  },
  {
    id: 'Created date',
    name: 'Created date',
    icon: 'ph:calendar-plus',
    searchableText: 'created date when made',
    children: filterDatesData
  },
  {
    id: 'Updated date',
    name: 'Updated date',
    icon: 'ph:calendar-check',
    searchableText: 'updated date last modified',
    children: filterDatesData
  },
];