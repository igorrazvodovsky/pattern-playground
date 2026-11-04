import type { Meta, StoryObj } from '@storybook/react-vite';
import { filterLabels, tasks } from '@shared/data';

const meta = {
  title: 'Components/Dual listbox',
  tags: ['activity-level:action', 'lifecycle:coordination', 'mediation:coordination'],
  parameters: {
    docs: {
      description: {
        component:
          'When an assignment is made in bulk, the actor needs to see what is chosen beside what is left behind before committing it. The control places the pool and the selection in two lists side by side, with buttons that move items between them.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const task = tasks[0];
const assignedIds = new Set(task.labels?.map((label) => label.id));

const LabelOption = ({ label }: { label: (typeof filterLabels)[number] }) => (
  <pp-list-item value={label.id}>
    {label.name}
    <iconify-icon className="icon" data-slot="prefix" icon={label.icon}></iconify-icon>
  </pp-list-item>
);

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The actor assigns labels to a task. Select options with click, Space, Shift+arrow, or Ctrl/Cmd+A, then move them with the buttons or Enter; a double-click moves one option straight across.',
      },
    },
  },
  render: () => (
    <pp-dual-listbox>
      <div className="dual-listbox__pane">
        <span id="labels-available">Available labels</span>
        <pp-list
          type="listbox"
          multiselectable
          data-dual-listbox="source"
          aria-labelledby="labels-available"
        >
          {filterLabels
            .filter((label) => !assignedIds.has(label.id))
            .map((label) => (
              <LabelOption key={label.id} label={label} />
            ))}
        </pp-list>
      </div>
      <div className="dual-listbox__controls">
        <button className="button" data-transfer="add">
          <iconify-icon className="icon" icon="ik:chevron-right" aria-hidden="true"></iconify-icon>
          <span className="visually-hidden">Add to task</span>
        </button>
        <button className="button" data-transfer="remove">
          <iconify-icon className="icon" icon="ik:chevron-left" aria-hidden="true"></iconify-icon>
          <span className="visually-hidden">Remove from task</span>
        </button>
      </div>
      <div className="dual-listbox__pane">
        <span id="labels-assigned">On “{task.title}”</span>
        <pp-list
          type="listbox"
          multiselectable
          data-dual-listbox="target"
          aria-labelledby="labels-assigned"
        >
          {filterLabels
            .filter((label) => assignedIds.has(label.id))
            .map((label) => (
              <LabelOption key={label.id} label={label} />
            ))}
        </pp-list>
      </div>
    </pp-dual-listbox>
  ),
};
