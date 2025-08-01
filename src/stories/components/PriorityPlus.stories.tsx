import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';
import { getRandomIcon } from '../utils/icons';

const meta = {
  title: "Components/Priority+",
  argTypes: {},
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const PriorityPlus: Story = {
  args: {},
  render: () => (
    <pp-p-plus>
      <div style={{ display: 'flex', gap: '1ch', alignItems: 'center' }}>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
        <button className="button" is="pp-button">
          <iconify-icon className="icon" icon={getRandomIcon()} slot="prefix"></iconify-icon>
          {faker.word.verb() + ' ' + faker.word.noun()}
        </button>
      </div>
    </pp-p-plus>
  ),
};