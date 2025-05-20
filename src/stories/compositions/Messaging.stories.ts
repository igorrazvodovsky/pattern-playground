import type { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Messaging*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const HumanToHumanChat: Story = {
  args: {},
  render: () => html`
    <div class="messages layer">
      <div class="messages__turn">
        <div class="message message--outbound">
          <div class="message__content">
            <div class="message__body layer">Let me get back to you on that. My team is reviewing it right now.</div>
            <small class="message__timestamp">Mon 11:25</small>
          </div>
        </div>
      </div>
      <div class="message message--system">
        <div class="message__content">
          <hr data-content="New messages"></hr>
        </div>
      </div>
      <div class="messages__exchange">
        <div class="messages__turn">
          <div class="message message--inbound">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=12" alt="John Doe" />
            </pp-avatar>
            <div class="message__content">
              <div class="message__body layer">No problem at all—appreciate the heads-up. Looking forward to hearing from you once your team’s had a chance to take a look.</div>
              <small class="message__timestamp">12:00</small>
            </div>
          </div>
          <div class="message message--inbound">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=12" alt="John Doe" />
            </pp-avatar>
            <div class="message__content">
              <div class="message__body layer">I'm excited to see what you've got.</div>
              <small class="message__timestamp">12:01</small>
            </div>
          </div>
        </div>
        <div class="messages__turn">
          <div class="message message--outbound">
            <div class="message__content">
              <div class="message__body layer">Ha-ha, I'm not sure about that.</div>
              <small class="message__timestamp">12:03 • Edited</small>
            </div>
          </div>
        </div>
      </div>
      <div class="message-composer">
        <pp-input placeholder="Type a message">
          <iconify-icon class="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
        </pp-input>
      </div>
    </div>
  `,
};

export const HumanToHumanComments: Story = {
  args: {},
  render: () => html`
    <div class="messages layer">
          <div class="message">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=11" alt="John Doe" />
            </pp-avatar>
            <div class="message__content">
              <div class="message__body layer">
                <div class="message__author">Brogan Weaver</div>
                Completely agree with everything you said here!
              </div>
              <small class="message__timestamp">12:00</small>
            </div>
          </div>
          <div class="message">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=5" alt="John Doe" />
            </pp-avatar>
            <div class="message__content">
              <div class="message__body layer">
                <div class="message__author">Nellie Mora</div>
                Thanks for sharing your thoughts
              </div>
              <small class="message__timestamp">12:00</small>
            </div>
          </div>
        </div>
      </div>
      <div class="message-composer">
        <pp-avatar size="small">
          <img src="https://i.pravatar.cc/150?img=16" alt="John Doe" />
        </pp-avatar>
        <pp-input placeholder="Type a message">
          <iconify-icon class="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
        </pp-input>
      </div>
    </div>
  `,
};

export const HumanToLLM: Story = {
  args: {},
  render: () => html`
    <div class="messages layer">
      <div class="messages__turn">
        <div class="message message--outbound">
          <div class="message__content">
            <div class="message__body layer">Write a one-sentence bedtime story about a unicorn.</div>
          </div>
        </div>
      </div>
      <div class="messages__exchange">
        <div class="messages__turn">
          <div class="message message--inbound">
            <div class="message__content">
              <div class="message__body">As the moonlight sparkled on the quiet meadow, the sleepy unicorn curled up beneath a silver tree and dreamed of dancing stars.</div>
            </div>
          </div>
        </div>
      </div>
      <div class="message-composer layer">
        <pp-input placeholder="How can I help you today?">
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
      </div>
    </div>
  `,
};