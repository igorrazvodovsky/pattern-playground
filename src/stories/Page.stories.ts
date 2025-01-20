import type { Meta, StoryObj } from '@storybook/web-components';

import * as HeaderStories from './Header.stories';
import type { PageProps } from '../components/Page';
import { Page } from '../components/Page';

const meta = {
  title: 'Compositions/Page',
  render: (args: PageProps) => Page(args),
} satisfies Meta<PageProps>;

export default meta;
type Story = StoryObj<PageProps>;

export const LoggedIn: Story = {
  args: {
    // More on composing args: https://storybook.js.org/docs/writing-stories/args#args-composition
    ...HeaderStories.LoggedIn.args,
  },
};

export const LoggedOut: Story = {
  args: {
    ...HeaderStories.LoggedOut.args,
  },
};
