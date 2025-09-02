import React from 'react';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer';
import { useCommenting } from '../../../services/commenting/hooks/use-commenting';

interface Task {
  id: string;
  title: string;
  description: string;
}

interface TaskCommentsProps {
  task: Task;
  currentUser?: string;
}

/**
 * Example following the plan architecture.
 * Shows how to add comments to any entity (no editor needed).
 */
export function TaskComments({ task, currentUser = 'demo-user' }: TaskCommentsProps) {
  const pointer = new EntityPointer('task', task.id);
  const { comments, createComment } = useCommenting(pointer, { currentUser });
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get('comment') as string;
    if (content.trim()) {
      createComment(content);
      form.reset();
    }
  };
  
  return (
    <div>
      <h3>Task: {task.title}</h3>
      <div className="comments">
        {comments.map(c => (
          <div key={c.id} className="comment">
            <strong>{c.authorId}</strong>: {c.content}
            <small> ({new Date(c.createdAt).toLocaleTimeString()})</small>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea name="comment" placeholder="Add a comment..." required />
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
}