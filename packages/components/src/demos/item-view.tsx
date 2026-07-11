import { ItemView } from '../components/item-view/ItemView';
import { ContentAdapterProvider } from '../components/item-view/ContentAdapterRegistry';
import { taskAdapter } from '../components/item-view/adapters';
import type { ViewScope } from '../components/item-view/types';
import { tasks, taskToItemObject } from '@shared/data';
import '../jsx-types';

const sampleTask = () => taskToItemObject(tasks[0]);

function TaskItemView({ scope }: { scope: ViewScope }) {
  return (
    <ContentAdapterProvider adapters={[taskAdapter]}>
      <ItemView item={sampleTask()} contentType="task" scope={scope} mode="preview" />
    </ContentAdapterProvider>
  );
}

/** Full working surface: all data, history, relationships. */
export function ItemViewFullDemo() {
  return <TaskItemView scope="maxi" />;
}

/** Summary scope: quick assessment without leaving the current task. */
export function ItemViewSummaryDemo() {
  return <TaskItemView scope="mid" />;
}

/** Minimal scope: recognition and linking only. */
export function ItemViewReferenceDemo() {
  return <TaskItemView scope="mini" />;
}

const formatDue = (date?: Date) =>
  date?.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) ?? '—';

/** Summary scope in context: the task as a row among its peers — more of the item than a mention, with the collection still in view. */
export function ItemViewRowDemo() {
  return (
    <pp-table>
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assignee</th>
            <th>Due</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td><span className="badge">{task.status.label}</span></td>
              <td>{task.priority?.label ?? '—'}</td>
              <td>{task.assignee?.name ?? '—'}</td>
              <td>{formatDue(task.dueDate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </pp-table>
  );
}
