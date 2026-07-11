import React from 'react';
import type { Decorator } from '@storybook/react-vite';

export const centeredLayout: Decorator = (Story) => (
  <div className="story-centered">
    <Story />
  </div>
);

export const centeredLayoutNarrow: Decorator = (Story) => (
  <div className="story-centered story-centered--narrow">
    <Story />
  </div>
);
