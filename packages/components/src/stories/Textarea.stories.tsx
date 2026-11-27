import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { action } from 'storybook/actions';

interface TextareaArgs {
  size: 'small' | 'medium' | 'large';
}

const meta = {
  title: 'Components/Textarea',
  argTypes: {
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: 'Control size (`data-size` on `.grow-wrap`); medium is the default',
    },
  },
} satisfies Meta<TextareaArgs>;

export default meta;
type Story = StoryObj<TextareaArgs>;

export const Basic: Story = {
  args: { size: 'medium' },
  render: (args) => {
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
        <div className="grow-wrap" data-size={args.size}>
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
