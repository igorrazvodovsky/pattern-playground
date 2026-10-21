import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  Combobox,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../components/combobox';
import { AnimateChangeInHeight } from '../components/filter/animate-change-in-height';
import '../icons/register-icons';
import '../jsx-types';

const meta = {
  title: 'Components/Combobox',
} satisfies Meta;

export default meta;
type Story = StoryObj;

const statusOptions = [
  { value: 'backlog', label: 'Backlog', icon: 'ik:circle' },
  { value: 'todo', label: 'To do', icon: 'ik:circle-dotted' },
  { value: 'in-progress', label: 'In progress', icon: 'ik:circle-half-left' },
  { value: 'in-review', label: 'In review', icon: 'ik:12-pointed-star' },
  { value: 'done', label: 'Done', icon: 'ik:checkmark-in-circle' },
  { value: 'cancelled', label: 'Cancelled', icon: 'ik:cross-in-circle' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgent', icon: 'ik:warning-diamond' },
  { value: 'high', label: 'High', icon: 'ik:arrow-up' },
  { value: 'medium', label: 'Medium', icon: 'ik:minus' },
  { value: 'low', label: 'Low', icon: 'ik:arrow-down' },
  { value: 'none', label: 'No priority', icon: 'ik:circle-dotted' },
];

export const Default: Story = {
  render: () => (
    <div className="measure" style={{ '--measure': '15rem' } as CSSProperties}>
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
      setSelected((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
      );

    return (
      <div className="measure" style={{ '--measure': '15rem' } as CSSProperties}>
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
    <div className="measure" style={{ '--measure': '15rem' } as CSSProperties}>
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

// Focus moves into the field when the panel opens; a pick, Escape, or a click
// outside closes it, empties the field, and returns focus to the button.
export const FromButton: Story = {
  render: () => {
    const dropdown = useRef<HTMLElement & { hide(): void; focusOnTrigger(): void }>(null);
    const [query, setQuery] = useState('');

    useEffect(() => {
      const el = dropdown.current;
      if (!el) return;
      const onShow = (event: Event) => {
        if (event.target === el) el.querySelector<HTMLElement>('[cmdk-input]')?.focus();
      };
      const onHide = (event: Event) => event.target === el && setQuery('');
      el.addEventListener('pp-after-show', onShow);
      el.addEventListener('pp-hide', onHide);
      return () => {
        el.removeEventListener('pp-after-show', onShow);
        el.removeEventListener('pp-hide', onHide);
      };
    }, []);

    const pick = () => {
      dropdown.current?.hide();
      dropdown.current?.focusOnTrigger();
    };

    return (
      <pp-dropdown ref={dropdown} hoist placement="bottom-start">
        <button type="button" className="button" data-slot="trigger">
          <iconify-icon className="icon" icon="ik:filter" aria-hidden="true" />
          <span className="visually-hidden">Add a filter</span>
        </button>
        <pp-popup>
          <div>
            <AnimateChangeInHeight>
              <Combobox label="Add a filter">
                <ComboboxInput placeholder="Filter…" value={query} onValueChange={setQuery} />
                <ComboboxList>
                  <ComboboxEmpty>No results.</ComboboxEmpty>
                  <ComboboxGroup heading="Status">
                    {statusOptions.map((option) => (
                      <ComboboxItem key={option.value} value={option.label} onSelect={pick}>
                        <iconify-icon icon={option.icon} slot="prefix" />
                        {option.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </Combobox>
            </AnimateChangeInHeight>
          </div>
        </pp-popup>
      </pp-dropdown>
    );
  },
};
