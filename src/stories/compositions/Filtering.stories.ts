import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

const meta = {
  title: "Compositions/Browsing & sensemaking*/Filtering",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Filtering: Story = {
  args: {},
  render: () => html`
    <div class="tags">
      <div class="tag-group">
        <span class="tag">
          Status
        </span>
        <span class="tag">
          is
        </span>
        <span class="tag">
          Todo
          <button>
            <iconify-icon class="icon" icon="ph:x"></iconify-icon>
          </button>
        </span>
      </div>

      <div class="tag-group">
        <span class="tag">
          Due date
        </span>
        <span class="tag">
          before
        </span>
        <span class="tag">
          3 days from now
          <button>
            <iconify-icon class="icon" icon="ph:x"></iconify-icon>
          </button>
        </span>
      </div>
    </div>
  `,
};
