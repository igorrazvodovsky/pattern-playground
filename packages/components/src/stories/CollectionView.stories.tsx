import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
  products,
  makeSpec,
  runSpec,
  ViewSpecRenderer,
} from '../templates/collection-view';
import type { RepresentationType } from '../templates/collection-view';
import { tasks, projects } from '@shared/data';
import {
  productBinding,
  taskBinding,
  projectBinding,
  isNumericValueType,
} from '@shared/data/bindings';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';

/**
 * The collection view template: one collection, one ViewSpec, one entity
 * binding, and the renderer registry that turns the triple into a view. The
 * switcher every product converges on — List / Cards / Table / Board — is a
 * spec patch, not a new view; the presets below are specs written out as
 * data. The collection switcher makes the other decoupling visible: the
 * default spec is written in roles ('title', 'badge', 'key-attribute'), so
 * the same spec renders products, tasks, or projects — the binding, not the
 * view, knows what a status or a price is.
 */

/** The corpus switcher's options, each a patch across the two spec axes:
    "List" is not a fifth representation but cards in a single column. */
interface ViewOption {
  key: string;
  label: string;
  icon: string;
  type: RepresentationType;
  layout?: 'grid' | 'list';
}

const VIEW_OPTIONS: ViewOption[] = [
  { key: 'cards', label: 'Cards', icon: 'ph:squares-four', type: 'card', layout: 'grid' },
  { key: 'list', label: 'List', icon: 'ph:list', type: 'card', layout: 'list' },
  { key: 'table', label: 'Table', icon: 'ph:table', type: 'table' },
  { key: 'map', label: 'Map', icon: 'ph:map-trifold', type: 'map' },
  { key: 'plot', label: 'Plot', icon: 'ph:chart-scatter', type: 'plot' },
];

interface Grouping {
  label: string;
  groupBy: string;
  groupLayout: 'sections' | 'lanes';
}

interface Collection {
  label: string;
  icon: string;
  items: BoundEntity[];
  binding: EntityBinding;
  groupings: Grouping[];
}

const COLLECTIONS: Record<string, Collection> = {
  products: {
    label: 'Products',
    icon: 'ph:package',
    items: products,
    binding: productBinding,
    groupings: [
      { label: 'Category sections', groupBy: 'category', groupLayout: 'sections' },
      { label: 'Status lanes', groupBy: 'availability.status', groupLayout: 'lanes' },
    ],
  },
  tasks: {
    label: 'Tasks',
    icon: 'ph:check-square',
    items: tasks,
    binding: taskBinding,
    groupings: [
      { label: 'Status lanes', groupBy: 'status.label', groupLayout: 'lanes' },
    ],
  },
  projects: {
    label: 'Projects',
    icon: 'ph:folder-open',
    items: projects,
    binding: projectBinding,
    groupings: [
      { label: 'Status lanes', groupBy: 'status', groupLayout: 'lanes' },
    ],
  },
};

/** A representation is available when the binding supplies what it needs:
    coordinates for the map, two numeric attributes for the plot. */
function supportsRepresentation(binding: EntityBinding, type: RepresentationType): boolean {
  if (type === 'map') {
    return Boolean(binding.internalAttributes?.lat && binding.internalAttributes?.lng);
  }
  if (type === 'plot') {
    return (
      binding.attributes.filter((attribute) => isNumericValueType(attribute.valueType))
        .length >= 2
    );
  }
  return true;
}

function CollectionViewTemplate() {
  const [collectionKey, setCollectionKey] = useState<keyof typeof COLLECTIONS>('products');
  const [viewKey, setViewKey] = useState('cards');
  const [grouping, setGrouping] = useState<Grouping | null>(null);

  const collection = COLLECTIONS[collectionKey];
  const viewOptions = VIEW_OPTIONS.filter((option) =>
    supportsRepresentation(collection.binding, option.type)
  );
  const view =
    viewOptions.find((option) => option.key === viewKey) ?? viewOptions[0];

  const spec = makeSpec({
    id: `catalogue-${collectionKey}`,
    representation: { type: view.type },
    arrangement: {
      ...(view.layout ? { layout: view.layout } : {}),
      ...(grouping
        ? { groupBy: grouping.groupBy, groupLayout: grouping.groupLayout }
        : {}),
    },
  });

  const pickCollection = (key: keyof typeof COLLECTIONS) => {
    setCollectionKey(key);
    setGrouping(null);
  };

  return (
    <div className="flow">
      <div className="toolbar">
        <pp-dropdown>
          <button className="button" data-slot="trigger">
            <iconify-icon className="icon" icon={collection.icon}></iconify-icon>
            {collection.label}
            <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
          </button>
          <pp-popup>
            <pp-list>
              {(Object.keys(COLLECTIONS) as (keyof typeof COLLECTIONS)[]).map((key) => (
                <pp-list-item key={key} onClick={() => pickCollection(key)}>
                  <iconify-icon
                    data-slot="prefix"
                    className="icon"
                    icon={COLLECTIONS[key].icon}
                  ></iconify-icon>
                  {COLLECTIONS[key].label}
                </pp-list-item>
              ))}
            </pp-list>
          </pp-popup>
        </pp-dropdown>
        <pp-dropdown>
          <button className="button" data-slot="trigger">
            <iconify-icon className="icon" icon={view.icon}></iconify-icon>
            {view.label}
            <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
          </button>
          <pp-popup>
            <pp-list>
              {viewOptions.map((candidate) => (
                <pp-list-item key={candidate.key} onClick={() => setViewKey(candidate.key)}>
                  <iconify-icon
                    data-slot="prefix"
                    className="icon"
                    icon={candidate.icon}
                  ></iconify-icon>
                  {candidate.label}
                </pp-list-item>
              ))}
            </pp-list>
          </pp-popup>
        </pp-dropdown>
        <pp-dropdown>
          <button className="button" data-slot="trigger">
            <iconify-icon className="icon" icon="ph:stack" aria-hidden="true"></iconify-icon>
            {grouping ? (
              <span>
                Grouped by <strong>{grouping.label.toLowerCase()}</strong>
              </span>
            ) : (
              'Group'
            )}
          </button>
          <pp-popup>
            <pp-list>
              <pp-list-item onClick={() => setGrouping(null)}>No grouping</pp-list-item>
              <hr />
              {collection.groupings.map((candidate) => (
                <pp-list-item key={candidate.label} onClick={() => setGrouping(candidate)}>
                  {candidate.label}
                </pp-list-item>
              ))}
            </pp-list>
          </pp-popup>
        </pp-dropdown>
      </div>
      <ViewSpecRenderer
        items={runSpec(collection.items, spec, collection.binding)}
        spec={spec}
        binding={collection.binding}
      />
    </div>
  );
}

const meta = {
  title: 'Templates/Collection view',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <CollectionViewTemplate />,
};

const tableSpec = makeSpec({
  id: 'table-preset',
  representation: {
    type: 'table',
    shownAttributes: ['name', 'category', 'availability.status', 'pricing.msrp'],
  },
  arrangement: { sortBy: { field: 'pricing.msrp', order: 'desc' } },
});

export const TablePreset: Story = {
  render: () => (
    <ViewSpecRenderer
      items={runSpec(products, tableSpec)}
      spec={tableSpec}
      binding={productBinding}
    />
  ),
};

const boardSpec = makeSpec({
  id: 'board-preset',
  representation: { type: 'card', shownAttributes: ['name', 'condition', 'pricing.msrp'] },
  arrangement: { groupBy: 'availability.status', groupLayout: 'lanes' },
});

export const BoardPreset: Story = {
  render: () => (
    <ViewSpecRenderer
      items={runSpec(products, boardSpec)}
      spec={boardSpec}
      binding={productBinding}
    />
  ),
};

/**
 * A second entity type through the same query machinery: every clause is an
 * attribute path resolved against the task binding — no filter vocabulary
 * names an entity type. The due-date clause evaluates its relative phrase
 * against real timestamps rather than comparing strings.
 */
const filteredTasksSpec = makeSpec({
  id: 'filtered-tasks',
  representation: {
    type: 'table',
    shownAttributes: ['title', 'status.label', 'assignee.name', 'priority.label', 'tags', 'dueDate'],
  },
  query: [
    { id: 'tasks-status', path: 'status.label', operator: 'is any of', values: ['Todo', 'In Progress', 'In Review'] },
    { id: 'tasks-assignee', path: 'assignee.name', operator: 'is not', values: ['No assignee'] },
    { id: 'tasks-labels', path: 'tags', operator: 'include any of', values: ['Audit', 'Sourcing', 'Design'] },
    { id: 'tasks-priority', path: 'priority.label', operator: 'is any of', values: ['High', 'Medium'] },
    { id: 'tasks-due', path: 'dueDate', operator: 'is', values: ['in the past'] },
  ],
  arrangement: { sortBy: { field: 'title', order: 'asc' } },
});

export const FilteredTasks: Story = {
  render: () => (
    <ViewSpecRenderer
      items={runSpec(tasks, filteredTasksSpec, taskBinding)}
      spec={filteredTasksSpec}
      binding={taskBinding}
    />
  ),
};
