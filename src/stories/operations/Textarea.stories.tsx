import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { action } from 'storybook/actions';

const meta = {
  title: "Operations/Textarea",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
      const target = e.currentTarget;
      action('input')(target.value);
      const parentNode = target.parentNode as HTMLElement;
      if (parentNode) {
        parentNode.dataset.replicatedValue = target.value;
      }
    };

    return (
      <form action="#0">
        <label htmlFor="text">Label</label>
        <div className="grow-wrap">
          <textarea
            placeholder="Type something"
            rows={1}
            name="text"
            id="text"
            onInput={handleInput}
          />
        </div>
        <small>Help text.</small>
      </form>
    );
  },
};
