import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../components/combobox";
import 'iconify-icon';
import '../jsx-types';

const meta = {
  title: "Components/Combobox",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const statusOptions = [
  { value: 'backlog', label: 'Backlog', icon: 'ph:circle' },
  { value: 'todo', label: 'To do', icon: 'ph:circle-dashed' },
  { value: 'in-progress', label: 'In progress', icon: 'ph:circle-half' },
  { value: 'in-review', label: 'In review', icon: 'ph:circle-wavy' },
  { value: 'done', label: 'Done', icon: 'ph:check-circle' },
  { value: 'cancelled', label: 'Cancelled', icon: 'ph:x-circle' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgent', icon: 'ph:warning-octagon' },
  { value: 'high', label: 'High', icon: 'ph:arrow-up' },
  { value: 'medium', label: 'Medium', icon: 'ph:minus' },
  { value: 'low', label: 'Low', icon: 'ph:arrow-down' },
  { value: 'none', label: 'No priority', icon: 'ph:dot' },
];

export const Default: Story = {
  render: () => (
    <div style={{ width: '240px' }}>
      <Combobox>
        <ComboboxInput placeholder="Set status…" />
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          <ComboboxGroup>
            {statusOptions.map((option) => (
              <ComboboxItem key={option.value} value={option.label}>
                <iconify-icon icon={option.icon} slot="prefix" />
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </Combobox>
    </div>
  ),
};

export const Checked: Story = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);

    const toggle = (value: string) =>
      setSelected(prev =>
        prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
      );

    return (
      <div style={{ width: '240px' }}>
        <Combobox>
          <ComboboxInput placeholder="Filter by priority…" />
          <ComboboxList>
            <ComboboxEmpty>No results.</ComboboxEmpty>
            <ComboboxGroup>
              {priorityOptions.map((option) => (
                <ComboboxItem
                  key={option.value}
                  value={option.label}
                  checked={selected.includes(option.value)}
                  onSelect={() => toggle(option.value)}
                >
                  <iconify-icon icon={option.icon} slot="prefix" />
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </Combobox>
      </div>
    );
  },
};

export const Grouped: Story = {
  render: () => (
    <div style={{ width: '240px' }}>
      <Combobox>
        <ComboboxInput placeholder="Search…" />
        <ComboboxList>
          <ComboboxEmpty>No results.</ComboboxEmpty>
          <ComboboxGroup heading="Status">
            {statusOptions.map((option) => (
              <ComboboxItem key={option.value} value={option.label}>
                <iconify-icon icon={option.icon} slot="prefix" />
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
          <ComboboxGroup heading="Priority">
            {priorityOptions.map((option) => (
              <ComboboxItem key={option.value} value={option.label}>
                <iconify-icon icon={option.icon} slot="prefix" />
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </Combobox>
    </div>
  ),
};
