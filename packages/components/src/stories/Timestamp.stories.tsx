import type { Meta, StoryObj } from "@storybook/react-vite";
import { formatDateTime, isoDateTime } from '@shared/format';
import '../jsx-types';

const ago = (ms: number) => isoDateTime(new Date(Date.now() - ms));
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const Stamp = ({ at }: { at: string }) => (
  <pp-timestamp value={at}>
    <time dateTime={at}>{formatDateTime(at)}</time>
  </pp-timestamp>
);

const meta = {
  title: "Components/Timestamp",
  tags: ['activity-level:operation', 'atomic:primitive', 'role:component', 'mediation:individual'],
  parameters: {
    docs: {
      description: {
        component: 'Says when something happened in terms the actor can hold — `20 minutes ago` — without costing them the actual instant.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The author (or server) writes the `<time>` child with the absolute value, meaningful before the element upgrades; the element rewrites it to relative text and keeps it ticking.',
      },
    },
  },
  render: () => <Stamp at={ago(20 * MINUTE)} />,
};

export const AcrossThreshold: Story = {
  render: () => (
    <ul>
      <li><Stamp at={ago(40 * 1000)} /></li>
      <li><Stamp at={ago(5 * HOUR)} /></li>
      <li><Stamp at={ago(3 * DAY)} /></li>
      <li><Stamp at={ago(8 * DAY)} /></li>
      <li><Stamp at={ago(273 * DAY)} /></li>
    </ul>
  ),
};

export const InContext: Story = {
  render: () => (
    <p>
      Ada Brown commented <Stamp at={ago(20 * MINUTE)} />.
    </p>
  ),
};

export const ChildOmitted: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Fallback: with no `<time>` child the element creates one. Nothing renders until upgrade, so prefer the composed form wherever the markup is authored.',
      },
    },
  },
  render: () => <pp-timestamp value={ago(20 * MINUTE)}></pp-timestamp>,
};
