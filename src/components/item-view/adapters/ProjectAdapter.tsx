import React from 'react';
import type { ContentAdapter, ItemViewProps, ProjectObject } from '../types';
import { UniversalCommentInterface } from '../../commenting/universal/UniversalCommentInterface';
import { getUserById } from '../../../stories/data';

const getStatusBadgeClass = (status?: string): string => {
  switch (status) {
    case 'planning': return 'badge badge--info';
    case 'active': return 'badge badge--success';
    case 'completed': return 'badge badge--primary';
    case 'archived': return 'badge badge--muted';
    default: return 'badge';
  }
};

const renderMicroView = (project: ProjectObject) => (
  <span className="project-micro">
    <span className="project-icon">{project.icon}</span>
    <span className="project-name">{project.name}</span>
  </span>
);

const renderMiniView = (project: ProjectObject) => (
  <div className="project-mini">
    <div className="project-header">
      <span className="project-icon">{project.icon}</span>
      <h4>{project.name}</h4>
    </div>
    <div className="project-meta">
      {project.metadata?.status && (
        <span className={getStatusBadgeClass(project.metadata.status)}>
          {project.metadata.status}
        </span>
      )}
      {project.metadata?.phase && (
        <span className="phase">{project.metadata.phase}</span>
      )}
    </div>
  </div>
);

const renderMidView = (project: ProjectObject) => (
  <div className="project-mid">
    <header>
      <div className="project-header">
        <span className="project-icon">{project.icon}</span>
        <h3>{project.name}</h3>
      </div>
      {project.metadata?.status && (
        <span className={getStatusBadgeClass(project.metadata.status)}>
          {project.metadata.status}
        </span>
      )}
    </header>
    
    <p className="project-description">{project.description}</p>
    
    <div className="project-details">
      {project.metadata?.phase && (
        <div><strong>Phase:</strong> {project.metadata.phase}</div>
      )}
      {project.metadata?.updatedAt && (
        <div><strong>Updated:</strong> {new Date(project.metadata.updatedAt).toLocaleDateString()}</div>
      )}
    </div>
  </div>
);

const renderMaxiView = (project: ProjectObject) => {
  const currentUser = getUserById('user-1');

  if (!currentUser) {
    return <div>Unable to load user context</div>;
  }

  return (
    <div className="project-maxi flow">
      <header className="flow">
        <div className="project-header">
          <span className="project-icon" style={{ fontSize: '2rem' }}>{project.icon}</span>
          <h2>{project.name}</h2>
        </div>
        {project.metadata?.status && (
          <span className={getStatusBadgeClass(project.metadata.status)}>
            {project.metadata.status}
          </span>
        )}
      </header>

      <section className="project-description flow">
        <p>{project.description}</p>
      </section>

      <section className="project-details flow">
        <h3>Project Details</h3>
        <dl className="details-list">
          <dt>Project ID</dt>
          <dd><code>{project.id}</code></dd>
          
          {project.metadata?.phase && (
            <>
              <dt>Current Phase</dt>
              <dd>{project.metadata.phase}</dd>
            </>
          )}
          
          {project.metadata?.updatedAt && (
            <>
              <dt>Last Updated</dt>
              <dd>{new Date(project.metadata.updatedAt).toLocaleDateString()}</dd>
            </>
          )}
          
          {project.metadata?.updatedBy && (
            <>
              <dt>Updated By</dt>
              <dd>{project.metadata.updatedBy}</dd>
            </>
          )}
        </dl>
      </section>

      <section className="project-comments-section">
        <h3>Project Discussion</h3>
        <UniversalCommentInterface
          entityType="project"
          entityId={project.id}
          currentUser={currentUser}
          className="project-comments"
          showHeader={false}
          allowNewComments={true}
          maxHeight="300px"
        />
      </section>
    </div>
  );
};

export const projectAdapter: ContentAdapter<'project'> = {
  contentType: 'project',
  supportedScopes: ['micro', 'mini', 'mid', 'maxi'],
  supportsCommenting: true,
  supportsRichContent: false,

  render: (props: ItemViewProps<'project'>) => {
    const project = props.item as ProjectObject;

    switch (props.scope) {
      case 'micro':
        return renderMicroView(project);
      case 'mini':
        return renderMiniView(project);
      case 'mid':
        return renderMidView(project);
      case 'maxi':
        return renderMaxiView(project);
      default:
        return renderMiniView(project);
    }
  }
};

// Helper function to convert project JSON data to ProjectObject format
export const projectToItemObject = (project: any): ProjectObject => ({
  id: project.id,
  name: project.name,
  description: project.description,
  type: 'project',
  icon: project.icon || 'ph:folder',
  searchableText: project.searchableText || `${project.name} ${project.description}`,
  metadata: {
    status: project.metadata?.status,
    phase: project.metadata?.phase,
    updatedAt: project.metadata?.updatedAt,
    updatedBy: project.metadata?.updatedBy,
    ...project.metadata
  }
});