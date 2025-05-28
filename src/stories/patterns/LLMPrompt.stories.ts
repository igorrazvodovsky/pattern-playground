import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta = {
  title: "Patterns/LLM*/Prompt",
} satisfies Meta;

export default meta;
type Story = StoryObj;


export const QualityFeedback: Story = {
  args: {},
  render: () => html`
    <div class="messages layer">
      <div class="message-composer layer">
        <pp-input autofocus value="What was that things name?">
        </pp-input>
        <div class="message-composer__actions">
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:globe"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:lightbulb"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:paperclip"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:plus"></iconify-icon><span class="inclusively-hidden">Edit</span>
          </button>
        </div>
        <small class="message-composer__feedback">
          <span class="badge badge--pill badge--warning"></span> Please provide more details for best results
        </small>
      </div>
    </div>
  `,
};

export const StructuredPrompt: Story = {
  args: {},
  render: () => html`
    <div class="messages layer">
      <div class="message-composer layer">
        <div class="message-composer__input">
          <label for="context">Context</label>
          <pp-input id="context" placeholder="E.g. domain, audience, goal">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="role">Role</label>
          <pp-input id="role" placeholder="You are a…">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="task">Task</label>
          <pp-input id="task" placeholder="E.g. list three risks">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="context">Constraints</label>
          <pp-input id="context" placeholder="E.g. length, tone, forbidden words">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="examples">Examples</label>
          <pp-input id="examples" placeholder="You are a…">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="output">Output specification</label>
          <pp-input id="output" placeholder="Structure and patterns">
          </pp-input>
        </div>
        <div class="message-composer__input">
          <label for="fallback">Fallback</label>
          <pp-input id="fallback" placeholder="What to do when data are missing or uncertain">
          </pp-input>
        </div>
        <div class="message-composer__actions">
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:globe"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:lightbulb"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:paperclip"></iconify-icon><span class="inclusively-hidden">Action</span>
          </button>
          <button class="button button--plain" is="pp-button">
            <iconify-icon class="icon" icon="ph:plus"></iconify-icon><span class="inclusively-hidden">Edit</span>
          </button>
          <button class="button" is="pp-button" style="margin-left: auto">
            <iconify-icon class="icon" icon="ph:arrow-up-bold"></iconify-icon><span class="inclusively-hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  `,
};