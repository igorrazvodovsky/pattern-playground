import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { faker } from '@faker-js/faker';
import { documents } from '@shared/data';
import { formatDate } from '@shared/format';
import '../jsx-types';

interface MessagingArgs {
  messageCount: number;
  participantCount: number;
}

const meta = {
  title: 'Components/Messaging',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const HumanToHumanChat: Story = {
  render: () => (
    <div className="messages layer">
      <div className="messages__turn">
        <div className="message message--outbound">
          <div className="message__content">
            <div className="message__body layer">
              Let me get back to you on that. My team is reviewing it right now.
            </div>
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
            <img
              className="avatar"
              data-size="small"
              src="https://i.pravatar.cc/150?img=12"
              alt="John Doe"
            />
            <div className="message__content">
              <div className="message__body layer">
                No problem at all—appreciate the heads-up. Looking forward to hearing from you once
                your team's had a chance to take a look.
              </div>
              <small className="message__timestamp">12:00</small>
            </div>
          </div>
          <div className="message message--inbound">
            <img
              className="avatar"
              data-size="small"
              src="https://i.pravatar.cc/150?img=12"
              alt="John Doe"
            />
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
        <textarea aria-label="Message" placeholder="Write a message" rows={1}></textarea>
        <span className="message-composer__send">
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
            <span className="visually-hidden">Send</span>
          </button>
        </span>
      </div>
    </div>
  ),
};

export const HumanToHumanComments: StoryObj<MessagingArgs> = {
  argTypes: {
    messageCount: {
      control: { type: 'range', min: 1, max: 10, step: 1 },
      description: 'Number of messages to display',
    },
    participantCount: {
      control: { type: 'range', min: 1, max: 5, step: 1 },
      description: 'Number of distinct participants',
    },
  },
  args: { messageCount: 2, participantCount: 2 },
  render: ({ messageCount, participantCount }) => {
    const participants = Array.from({ length: participantCount }, (_, i) => ({
      name: faker.person.fullName(),
      avatarSeed: 5 + i,
    }));
    const messages = Array.from({ length: messageCount }, (_, i) => ({
      participant: participants[i % participantCount],
      text: faker.lorem.sentence(),
    }));

    return (
      <div className="messages layer">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            <img
              className="avatar"
              data-size="small"
              src={`https://i.pravatar.cc/150?img=${msg.participant.avatarSeed}`}
              alt={msg.participant.name}
            />
            <div className="message__content">
              <div className="message__body layer">
                <div className="message__author">{msg.participant.name}</div>
                {msg.text}
              </div>
              <small className="message__timestamp">12:00</small>
            </div>
          </div>
        ))}
        <div className="message-composer">
          <textarea aria-label="Comment" placeholder="Write a comment" rows={1}></textarea>
          <span className="message-composer__send">
            <button className="button button--plain">
              <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
              <span className="visually-hidden">Send</span>
            </button>
          </span>
        </div>
      </div>
    );
  },
};

export const HumanToLLM: Story = {
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
                Cats knead with their paws — like they're making biscuits — because it's a leftover
                behaviour from kittenhood. Kittens knead their mother's belly to stimulate milk
                flow, and adult cats often keep doing it when they're relaxed or showing affection.
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="message-follow-up">
        <button className="button">Do all cats knead?</button>
        <button className="button">What does kneading tell us about a cat's mood?</button>
        <button className="button">Why do some cats knead with claws out?</button>
      </div>
      <div className="message-composer">
        <textarea aria-label="Reply" placeholder="Reply" rows={1}></textarea>
        <div className="message-composer__actions">
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:globe"></iconify-icon>
            <span className="visually-hidden">Search the web</span>
          </button>
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:light-bulb"></iconify-icon>
            <span className="visually-hidden">Think it through</span>
          </button>
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:clip"></iconify-icon>
            <span className="visually-hidden">Attach a file</span>
          </button>
          <span className="message-composer__send">
            <button className="button button--plain">
              <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
              <span className="visually-hidden">Send</span>
            </button>
          </span>
        </div>
      </div>
    </div>
  ),
};

export const InlineInterface: Story = {
  render: () => (
    <div className="messages layer">
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">
            Standard message input handles everything that would be handled by input and textarea
            elements. E.g.: What's your name?
          </div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">Igors</div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">
            Single and multiple selections can be handled using the appropriate controls. E.g.: What
            do you want to do today?
          </div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body">
            <div className="inline-flow">
              <label className="form-control tag">
                <input type="checkbox" />
                Option A
              </label>
              <label className="form-control tag">
                <input type="checkbox" />
                Option B
              </label>
              <label className="form-control tag">
                <input type="checkbox" defaultChecked />
                Option C
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">How much? Select from a range.</div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body">
            <div className="flex">
              <pp-range label="Amount" name="range" min={0} max={100} value={50}>
                <span data-slot="prefix">0</span>
                <span data-slot="suffix">100</span>
              </pp-range>
              <button className="button button--plain">
                <iconify-icon className="icon" icon="ik:checkmark"></iconify-icon>
                <span className="visually-hidden">Send amount</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">
            What about dates? This is also an example of (successful) validation.
          </div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">December 16 two years ago.</div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">
            Got it!{' '}
            {formatDate(new Date(new Date().getFullYear() - 2, 11, 16), { dateStyle: 'full' })}.
          </div>
        </div>
      </div>
      <div className="message-composer">
        <textarea aria-label="Message" placeholder="Write a message" rows={1}></textarea>
        <div className="message-composer__actions">
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:globe"></iconify-icon>
            <span className="visually-hidden">Search the web</span>
          </button>
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:light-bulb"></iconify-icon>
            <span className="visually-hidden">Think it through</span>
          </button>
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:clip"></iconify-icon>
            <span className="visually-hidden">Attach a file</span>
          </button>
          <span className="message-composer__send">
            <button className="button button--plain">
              <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
              <span className="visually-hidden">Send</span>
            </button>
          </span>
        </div>
      </div>
    </div>
  ),
};

const attachedAtStart = documents.slice(2, 7);

// Settings for this request: each is switched on or off on its own, so the
// list stays open while the actor goes through it.
const ComposerSettings = ({ items }: { items: { label: string; on: boolean }[] }) => (
  <pp-dropdown stay-open-on-select>
    <button className="button button--plain" data-slot="trigger">
      <iconify-icon className="icon" icon="ik:gear" aria-hidden="true"></iconify-icon>
      Settings
      <iconify-icon className="icon" icon="ik:chevron-down" aria-hidden="true"></iconify-icon>
    </button>
    <pp-popup>
      <pp-list>
        {items.map((item) => (
          <pp-list-item key={item.label} type="checkbox" checked={item.on}>
            {item.label}
          </pp-list-item>
        ))}
      </pp-list>
    </pp-popup>
  </pp-dropdown>
);

const AttachedMaterialComposer = () => {
  const [attached, setAttached] = useState(attachedAtStart);
  const composer = (
    <div className="message-composer">
      <textarea aria-label="Prompt" placeholder="Ask anything" rows={1}></textarea>
      <div className="message-composer__actions">
        <pp-select className="select--plain">
          <iconify-icon className="icon" icon="ik:sparkles" data-slot="prefix"></iconify-icon>
          <select aria-label="Effort" defaultValue="auto">
            <option value="auto">Auto</option>
            <option value="quick">Quick</option>
            <option value="thorough">Thorough</option>
          </select>
        </pp-select>
        <ComposerSettings
          items={[
            { label: 'Search the web', on: true },
            { label: 'Use memory', on: false },
          ]}
        />
        <span className="message-composer__send">
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:microphone"></iconify-icon>
            <span className="visually-hidden">Dictate</span>
          </button>
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
            <span className="visually-hidden">Send</span>
          </button>
        </span>
      </div>
    </div>
  );
  if (attached.length === 0) return composer;
  return (
    <div className="attachment-tray">
      <details open>
        <summary>
          <span className="badge">{attached.length}</span> attached
        </summary>
        <ul aria-label="Attached material">
          {attached.map((doc) => (
            <li key={doc.id} className="tag">
              {doc.name}
              <button
                aria-label={`Remove ${doc.name}`}
                onClick={() => setAttached((items) => items.filter((item) => item.id !== doc.id))}
              >
                <iconify-icon className="icon" icon="ik:cross"></iconify-icon>
              </button>
            </li>
          ))}
        </ul>
      </details>
      {composer}
    </div>
  );
};

export const AttachedMaterial: Story = {
  render: () => <AttachedMaterialComposer />,
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list', { name: 'Attached material' });
    const summary = canvas.getByText(/attached$/);
    await expect(list).toBeVisible();

    await userEvent.click(summary);
    await expect(list).not.toBeVisible();
    await userEvent.click(summary);

    const first = attachedAtStart[0];
    await userEvent.click(canvas.getByRole('button', { name: `Remove ${first.name}` }));
    await expect(canvas.queryByText(first.name)).not.toBeInTheDocument();
    await expect(summary).toHaveTextContent(String(attachedAtStart.length - 1));
  },
};
