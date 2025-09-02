import React from 'react';
import { ItemView } from '../../item-view/ItemView';
import { projectToItemObject } from '../../item-view/adapters/ProjectAdapter';
import { projects } from '../../../stories/data';

interface ProjectCommentsProps {
  projectId: string;
  className?: string;
}

/**
 * Example component showing project commenting via ItemView
 * Demonstrates how ANY entity type can get commenting support automatically
 */
export const ProjectComments: React.FC<ProjectCommentsProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return <div className="error">Project not found: {projectId}</div>;
  }

  return (
    <div className={`project-comments ${className}`}>
      <ItemView
        item={projectToItemObject(project)}
        contentType="project"
        scope="maxi"
        mode="preview"
      />
    </div>
  );
};

/**
 * Example showing project commenting at different view scopes
 */
export const ProjectViewScopes: React.FC = () => {
  const project = projects[0]; // Use first project as example

  if (!project) {
    return <div>No projects available</div>;
  }

  const projectObject = projectToItemObject(project);

  return (
    <div className="project-view-examples">
      <h2>Project Commenting at Different Scopes</h2>
      
      <section>
        <h3>Micro View</h3>
        <ItemView
          item={projectObject}
          contentType="project"
          scope="micro"
          mode="preview"
        />
      </section>

      <section>
        <h3>Mini View</h3>
        <ItemView
          item={projectObject}
          contentType="project"
          scope="mini"
          mode="preview"
        />
      </section>

      <section>
        <h3>Mid View</h3>
        <ItemView
          item={projectObject}
          contentType="project"
          scope="mid"
          mode="preview"
        />
      </section>

      <section>
        <h3>Maxi View (with Comments)</h3>
        <ItemView
          item={projectObject}
          contentType="project"
          scope="maxi"
          mode="preview"
        />
      </section>
    </div>
  );
};

/**
 * Example showing how to use universal commenting directly on any project
 */
export const DirectProjectCommenting: React.FC<{ project: any }> = ({ project }) => {
  const { useCommenting } = require('../../../services/commenting/hooks/use-commenting');
  const { EntityPointer } = require('../../../services/commenting/core/entity-pointer');
  
  const pointer = new EntityPointer(`project-${project.id}`, 'project', project.id);
  const { comments, createComment } = useCommenting(pointer);

  return (
    <div className="direct-project-commenting">
      <h3>Direct Project Commenting</h3>
      <p>Project: <strong>{project.name}</strong></p>
      
      <div className="comments-section">
        <h4>Comments ({comments.length})</h4>
        {comments.map((comment: any) => (
          <div key={comment.id} className="comment">
            <strong>{comment.authorId}:</strong> {comment.content}
            <small> • {new Date(comment.createdAt).toLocaleString()}</small>
          </div>
        ))}
        
        <button 
          onClick={() => createComment("This is a great project!")}
          className="primary-button"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
};