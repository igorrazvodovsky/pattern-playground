import { ItemView } from '../components/item-view/ItemView';
import { ContentAdapterProvider } from '../components/item-view/ContentAdapterRegistry';
import { taskAdapter } from '../components/item-view/adapters';
import type { ViewScope } from '../components/item-view/types';
import { tasks, taskToItemObject } from '@shared/data';

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
