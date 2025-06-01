import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  title: "Compositions/Browsing & sensemaking*/Filtering",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Filtering: Story = {
  args: {},
  render: () => html`
    <div class="flex">
      <div class="tags">
        <div class="tag-group">
          <span class="tag">
            Status
          </span>
          <pp-dropdown>
            <button class="tag" slot="trigger">
              is
            </button>
            <pp-list>
              <pp-list-item type="checkbox" checked>is</pp-list-item>
              <pp-list-item>is not</pp-list-item>
            </pp-list>
          </pp-dropdown>
          <span class="tag">
            <pp-dropdown>
              <button slot="trigger">
                <div class="avatar-group">
                  <pp-avatar size="xsmall" style="color: blue">
                    <iconify-icon class="icon" icon="ph:circle-fill"></iconify-icon>
                  </pp-avatar>
                  <pp-avatar size="xsmall" style="color: green">
                    <iconify-icon class="icon" icon="ph:circle-fill"></iconify-icon>
                  </pp-avatar>
                </div>
                2 selected
              </button>
              <pp-list>
                <pp-list-item type="checkbox" checked>Todo</pp-list-item>
                <pp-list-item>...</pp-list-item>
              </pp-list>
            </pp-dropdown>
            <button class="tag-group__remove">
              <iconify-icon class="icon" icon="ph:x"></iconify-icon><span class="inclusively-hidden">Clear</span>
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
            <button class="tag-group__remove">
              <iconify-icon class="icon" icon="ph:x"></iconify-icon><span class="inclusively-hidden">Clear</span>
            </button>
          </span>
        </div>
      </div>
      <div class="button-group">
        <!-- <pp-tooltip content="Clear all">
          <button class="button" is="pp-buton">
            <iconify-icon class="icon" icon="ph:x"></iconify-icon><span class="inclusively-hidden">Clear all</span>
          </button>
        </pp-tooltip> -->
        <button class="button" is="pp-buton">
          <iconify-icon class="icon" icon="ph:funnel-simple"></iconify-icon><span class="inclusively-hidden">Filter</span>
        </button>
      </div>
    </div>
  `,
};
