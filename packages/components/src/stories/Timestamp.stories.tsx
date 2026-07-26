import type { Meta, StoryObj } from "@storybook/react-vite";
import { isoDateTime } from '@shared/format';
import '../jsx-types';

const ago = (ms: number) => isoDateTime(new Date(Date.now() - ms));
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

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
  render: () => <pp-timestamp value={ago(20 * MINUTE)}></pp-timestamp>,
};

export const AcrossThreshold: Story = {
  render: () => (
    <ul>
      <li><pp-timestamp value={ago(40 * 1000)}></pp-timestamp></li>
      <li><pp-timestamp value={ago(5 * HOUR)}></pp-timestamp></li>
      <li><pp-timestamp value={ago(3 * DAY)}></pp-timestamp></li>
      <li><pp-timestamp value={ago(8 * DAY)}></pp-timestamp></li>
      <li><pp-timestamp value={ago(273 * DAY)}></pp-timestamp></li>
    </ul>
  ),
};

export const InContext: Story = {
  render: () => (
    <p>
      Ada Brown commented <pp-timestamp value={ago(20 * MINUTE)}></pp-timestamp>.
    </p>
  ),
};
