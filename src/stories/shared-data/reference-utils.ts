import { users, projects, documents } from './index';

// Helper functions to create reference objects from shared data
export const createUserReference = (userId: string) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  return {
    type: 'reference',
    attrs: {
      id: user.id,
      label: user.name,
      type: user.type,
      metadata: user.metadata
    }
  };
};

export const createProjectReference = (projectId: string) => {
  const project = projects.find(p => p.id === projectId);
  if (!project) return null;
  
  return {
    type: 'reference',
    attrs: {
      id: project.id,
      label: project.name,
      type: project.type,
      metadata: project.metadata
    }
  };
};

export const createDocumentReference = (docId: string) => {
  const doc = documents.find(d => d.id === docId);
  if (!doc) return null;
  
  return {
    type: 'reference',
    attrs: {
      id: doc.id,
      label: doc.name,
      type: doc.type,
      metadata: doc.metadata
    }
  };
};