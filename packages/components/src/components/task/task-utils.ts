import type { Task, TaskHistoryEntry, CreateTaskInput } from '@shared/data/task-types';

export const createTask = (input: string | CreateTaskInput): Task => {
  const taskId = crypto.randomUUID();
  const createdAt = new Date();
  
  // Handle both string and object inputs for backward compatibility
  const taskInput = typeof input === 'string' 
    ? { specification: input, title: input } 
    : { ...input, title: input.title || input.specification };

  const historyEntries: TaskHistoryEntry[] = [
    {
      id: crypto.randomUUID(),
      timestamp: createdAt,
      actor: 'User',
      action: 'Task created',
      details: typeof input === 'string' 
        ? `From search: "${input}"` 
        : `Task created with specification: "${taskInput.specification}"`
    },
    {
      id: crypto.randomUUID(),
      timestamp: new Date(createdAt.getTime() + 1000), // 1 second later
      actor: 'System',
      action: 'Status changed to planning',
      details: 'Analyzing task requirements and planning approach'
    }
  ];

  return {
    id: taskId,
    title: taskInput.title,
    specification: taskInput.specification.trim(),
    description: taskInput.specification,
    status: {
      id: 'status-planning',
      label: 'Planning', 
      value: 'planning',
      color: '#orange'
    },
    history: historyEntries,
    createdAt,
    progress: 0,
    metadata: {
      tags: []
    }
  };
};
