import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from './utils/icons';

const meta = {
  title: "Components/Priority+",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PriorityPlus: Story = {
  args: {},
  render: () => (
    <pp-p-plus>
      <div className="flex">
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button">
          <iconify-icon className="icon" icon={getRandomIcon()} data-slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
      </div>
    </pp-p-plus>
  ),
};