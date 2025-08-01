import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { faker } from '@faker-js/faker';

const meta = {
  title: "Compositions/Messaging",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const HumanToHumanChat: Story = {
  args: {},
  render: () => (
    <div className="messages layer">
      <div className="messages__turn">
        <div className="message message--outbound">
          <div className="message__content">
            <div className="message__body layer">Let me get back to you on that. My team is reviewing it right now.</div>
            <small className="message__timestamp">Mon 11:25</small>
          </div>
        </div>
      </div>
      <div className="message message--system">
        <div className="message__content">
          <hr data-content="New messages"></hr>
        </div>
      </div>
      <div className="messages__exchange">
        <div className="messages__turn">
          <div className="message message--inbound">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=12" alt="John Doe" />
            </pp-avatar>
            <div className="message__content">
              <div className="message__body layer">No problem at all—appreciate the heads-up. Looking forward to hearing from you once your team's had a chance to take a look.</div>
              <small className="message__timestamp">12:00</small>
            </div>
          </div>
          <div className="message message--inbound">
            <pp-avatar size="small">
              <img src="https://i.pravatar.cc/150?img=12" alt="John Doe" />
            </pp-avatar>
            <div className="message__content">
              <div className="message__body layer">I'm excited to see what you've got.</div>
              <small className="message__timestamp">12:01</small>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--outbound">
            <div className="message__content">
              <div className="message__body layer">Ha-ha, I'm not sure about that.</div>
              <small className="message__timestamp">12:03 • Edited</small>
            </div>
          </div>
        </div>
      </div>
      <div className="message-composer">
        <pp-input placeholder="Type a message">
          <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
        </pp-input>
      </div>
    </div>
  ),
};

export const HumanToHumanComments: Story = {
  args: {},
  render: () => (
    <div className="messages layer">
      <div className="message">
        <pp-avatar size="small">
          <img src="https://i.pravatar.cc/150?img=11" alt="John Doe" />
        </pp-avatar>
        <div className="message__content">
          <div className="message__body layer">
            <div className="message__author">Brogan Weaver</div>
            Completely agree with everything you said here!
          </div>
          <small className="message__timestamp">12:00</small>
        </div>
      </div>
      <div className="message">
        <pp-avatar size="small">
          <img src="https://i.pravatar.cc/150?img=5" alt="John Doe" />
        </pp-avatar>
        <div className="message__content">
          <div className="message__body layer">
            <div className="message__author">Nellie Mora</div>
            Thanks for sharing your thoughts
          </div>
          <small className="message__timestamp">12:00</small>
        </div>
      </div>
      <div className="message-composer">
        <pp-avatar size="small">
          <img src="https://i.pravatar.cc/150?img=16" alt="John Doe" />
        </pp-avatar>
        <pp-input placeholder="Type a message">
          <iconify-icon className="icon" icon="ph:arrow-elbow-down-left" slot="suffix"></iconify-icon>
        </pp-input>
      </div>
    </div>
  ),
};

export const HumanToLLM: Story = {
  args: {},
  render: () => (
    <div className="messages layer">
      <div className="messages__turn">
        <div className="message message--outbound">
          <div className="message__content">
            <div className="message__body layer">Why do cats knead?</div>
          </div>
        </div>
      </div>
      <div className="messages__exchange">
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
                Cats knead with their paws — like they’re making biscuits — because it’s a leftover behaviour from kittenhood. Kittens knead their mother’s belly to stimulate milk flow, and adult cats often keep doing it when they’re relaxed or showing affection.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="message-follow-up">
        <button className="button">Do all cats knead?</button>
        <button className="button">What does kneading tell us about a cat’s mood?</button>
        <button className="button">Why do some cats knead with claws out?</button>
      </div>
      <div className="message-composer layer">
        <pp-input placeholder="Reply…">
        </pp-input>
        <div className="message-composer__actions">
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:lightbulb"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:paperclip"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:plus"></iconify-icon><span className="inclusively-hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  ),
};