import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import {
  products,
  makeSpec,
  runSpec,
  ViewSpecRenderer,
} from '../templates/collection-view';
import type { RepresentationType } from '../templates/collection-view';

/**
 * The collection view template: one collection, one ViewSpec, and the
 * renderer registry that turns the pair into a view. The switcher every
 * product converges on — List / Cards / Table / Board — is a spec patch,
 * not a new view; the presets below are specs written out as data.
 */

const REPRESENTATION_LABELS: Record<RepresentationType, string> = {
  card: 'Cards',
  list: 'List',
  table: 'Table',
  map: 'Map',
  plot: 'Plot',
};

const REPRESENTATION_ICONS: Record<RepresentationType, string> = {
  card: 'ph:squares-four',
  list: 'ph:list',
  table: 'ph:table',
  map: 'ph:map-trifold',
  plot: 'ph:chart-scatter',
};

type Grouping = 'category' | 'status';

const GROUPING_LABELS: Record<Grouping, string> = {
  category: 'Category sections',
  status: 'Status lanes',
};

function CollectionViewTemplate() {
  const [type, setType] = useState<RepresentationType>('card');
  const [grouping, setGrouping] = useState<Grouping | null>(null);

  const spec = makeSpec({
    id: 'catalogue',
    representation: { type },
    arrangement:
      grouping === null
        ? {}
        : grouping === 'category'
          ? { groupBy: 'category', groupLayout: 'sections' }
          : { groupBy: 'availability.status', groupLayout: 'lanes' },
  });

  return (
    <div className="flow">
      <div className="toolbar">
        <pp-dropdown>
          <button className="button" is="pp-button" slot="trigger">
            <iconify-icon className="icon" icon={REPRESENTATION_ICONS[type]}></iconify-icon>
            {REPRESENTATION_LABELS[type]}
            <iconify-icon className="icon" icon="ph:caret-down" aria-hidden="true"></iconify-icon>
          </button>
          <pp-list>
            {(Object.keys(REPRESENTATION_LABELS) as RepresentationType[]).map((candidate) => (
              <pp-list-item key={candidate} onClick={() => setType(candidate)}>
                <iconify-icon
                  slot="prefix"
                  className="icon"
                  icon={REPRESENTATION_ICONS[candidate]}
                ></iconify-icon>
                {REPRESENTATION_LABELS[candidate]}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-dropdown>
        <pp-dropdown>
          <button className="button" is="pp-button" slot="trigger">
            <iconify-icon className="icon" icon="ph:stack" aria-hidden="true"></iconify-icon>
            {grouping ? (
              <span>
                Grouped by <strong>{GROUPING_LABELS[grouping].toLowerCase()}</strong>
              </span>
            ) : (
              'Group'
            )}
          </button>
          <pp-list>
            <pp-list-item onClick={() => setGrouping(null)}>No grouping</pp-list-item>
            <hr />
            {(Object.keys(GROUPING_LABELS) as Grouping[]).map((candidate) => (
              <pp-list-item key={candidate} onClick={() => setGrouping(candidate)}>
                {GROUPING_LABELS[candidate]}
              </pp-list-item>
            ))}
          </pp-list>
        </pp-dropdown>
      </div>
      <ViewSpecRenderer items={runSpec(products, spec)} spec={spec} />
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
  render: () => <ViewSpecRenderer items={runSpec(products, tableSpec)} spec={tableSpec} />,
};

const boardSpec = makeSpec({
  id: 'board-preset',
  representation: { type: 'card', shownAttributes: ['name', 'condition', 'pricing.msrp'] },
  arrangement: { groupBy: 'availability.status', groupLayout: 'lanes' },
});

export const BoardPreset: Story = {
  render: () => <ViewSpecRenderer items={runSpec(products, boardSpec)} spec={boardSpec} />,
};
