import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, fn } from 'storybook/test';
import { documents } from '@shared/data';
import '../icons/register-icons';
import '../jsx-types';

/**
 * The screen before the first message to an agent: a greeting where the
 * conversation will be, the composer with what the request carries, and
 * starting points beneath it. The kinds of request start closed, so no
 * concrete request shows before the actor picks a direction; opening one
 * shows a few requests of that kind, and pressing one puts it in the field
 * to edit or send. Enter sends; Shift+Enter starts a new line.
 */
interface Args {
  onSend: (message: string) => void;
}

const meta = {
  title: 'Templates/Chatbot input',
  tags: ['autodocs', 'activity-level:action', 'mediation:individual'],
  args: { onSend: fn() },
} satisfies Meta<Args>;

export default meta;
type Story = StoryObj<Args>;

interface Starter {
  title: string;
  detail: string;
  prompt: string;
}

const kinds: { id: string; label: string; icon: string; starters: Starter[] }[] = [
  {
    id: 'draft',
    label: 'Draft',
    icon: 'ik:pen',
    starters: [
      {
        title: 'A status update',
        detail: 'Where the work stands, for the team',
        prompt: 'Draft a status update on the launch for the team',
      },
      {
        title: 'A reply',
        detail: 'An answer to a message, in my voice',
        prompt: 'Draft a reply to the latest comment on the proposal',
      },
      {
        title: 'A proposal',
        detail: 'Goals, timeline and what will be delivered',
        prompt: 'Draft a proposal with goals, a timeline and deliverables',
      },
      {
        title: 'A handover note',
        detail: 'Open work and its context, for whoever picks it up',
        prompt: 'Draft a handover note for my open tasks',
      },
    ],
  },
  {
    id: 'summarise',
    label: 'Summarise',
    icon: 'ik:view-module',
    starters: [
      {
        title: 'The attached material',
        detail: 'The main points of each, side by side',
        prompt: 'Summarise the attached material, one paragraph each',
      },
      {
        title: 'A long discussion',
        detail: 'The decisions and open questions in a thread',
        prompt: 'Summarise the discussion: decisions and open questions',
      },
      {
        title: 'Feedback',
        detail: 'The comments that came back, grouped by theme',
        prompt: 'Summarise the review comments, grouped by theme',
      },
      {
        title: 'This week',
        detail: 'What moved, what was reopened, what slipped',
        prompt: 'Summarise this week’s changes across the project',
      },
    ],
  },
  {
    id: 'explain',
    label: 'Explain',
    icon: 'ik:book-open',
    starters: [
      {
        title: 'A concept',
        detail: 'A complex topic in plain terms',
        prompt: 'Explain life cycle assessment in plain terms',
      },
      {
        title: 'A comparison',
        detail: 'The trade-offs between two approaches',
        prompt: 'Explain the trade-offs between refurbishing and recycling',
      },
      {
        title: 'A decision',
        detail: 'What was decided, and on what grounds',
        prompt: 'Explain why we chose this recycling partner',
      },
      {
        title: 'A figure',
        detail: 'Why a number went up or down',
        prompt: 'Explain why returns went up this quarter',
      },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: 'ik:route',
    starters: [
      {
        title: 'Next week',
        detail: 'What to take on, given what is open and due',
        prompt: 'Plan next week from what is open and due',
      },
      {
        title: 'A review round',
        detail: 'Who reviews what, and by when',
        prompt: 'Plan a review round for the proposal',
      },
      {
        title: 'Splitting a task',
        detail: 'Smaller steps that can be checked one at a time',
        prompt: 'Plan how to split the take-back pilot into smaller tasks',
      },
      {
        title: 'A slipped deadline',
        detail: 'What moves if one piece is late',
        prompt: 'Plan what to move if the supplier audit slips a week',
      },
    ],
  },
];

const attachedAtStart = documents.slice(2, 7);

// Settings for this request: each is switched on or off on its own, so the
// list stays open while the actor goes through it.
const Settings = () => (
  <pp-dropdown stay-open-on-select>
    <button className="button button--plain" data-slot="trigger">
      <iconify-icon className="icon" icon="ik:gear" aria-hidden="true"></iconify-icon>
      Settings
      <iconify-icon className="icon" icon="ik:chevron-down" aria-hidden="true"></iconify-icon>
    </button>
    <pp-popup>
      <pp-list>
        <pp-list-item type="checkbox" checked>
          Search the web
        </pp-list-item>
        <pp-list-item type="checkbox">Use memory</pp-list-item>
      </pp-list>
    </pp-popup>
  </pp-dropdown>
);

const ConversationStart = ({ onSend }: { onSend: (message: string) => void }) => {
  const [draft, setDraft] = useState('');
  const [attached, setAttached] = useState(attachedAtStart);
  const [open, setOpen] = useState<string | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const startersId = useId();
  const starters = kinds.find((kind) => kind.id === open)?.starters ?? [];

  const send = () => {
    const message = draft.trim();
    if (!message) return;
    onSend(message);
    setDraft('');
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const composer = (
    <div className="message-composer">
      <textarea
        ref={field}
        aria-label="Prompt"
        placeholder="Ask anything"
        rows={1}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
      ></textarea>
      <div className="message-composer__actions">
        <pp-select className="select--plain">
          <iconify-icon className="icon" icon="ik:sparkles" data-slot="prefix"></iconify-icon>
          <select aria-label="Effort" defaultValue="auto">
            <option value="auto">Auto</option>
            <option value="quick">Quick</option>
            <option value="thorough">Thorough</option>
          </select>
        </pp-select>
        <Settings />
        <span className="message-composer__send">
          <button className="button button--plain">
            <iconify-icon className="icon" icon="ik:microphone"></iconify-icon>
            <span className="visually-hidden">Dictate</span>
          </button>
          <button className="button button--plain" onClick={send}>
            <iconify-icon className="icon" icon="ik:carriage-return"></iconify-icon>
            <span className="visually-hidden">Send</span>
          </button>
        </span>
      </div>
    </div>
  );

  return (
    <div className="flow">
      <div className="empty-state">
        <h2 className="empty-state__title">Where should we start?</h2>
      </div>
      {attached.length === 0 ? (
        composer
      ) : (
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
                    onClick={() =>
                      setAttached((items) => items.filter((item) => item.id !== doc.id))
                    }
                  >
                    <iconify-icon className="icon" icon="ik:cross"></iconify-icon>
                  </button>
                </li>
              ))}
            </ul>
          </details>
          {composer}
        </div>
      )}
      <div className="flex" role="group" aria-label="Kinds of request">
        {kinds.map((kind) => (
          <button
            key={kind.id}
            className="button button--plain"
            aria-expanded={open === kind.id}
            aria-controls={startersId}
            onClick={() => setOpen((current) => (current === kind.id ? null : kind.id))}
          >
            <iconify-icon className="icon" icon={kind.icon} aria-hidden="true"></iconify-icon>
            {kind.label}
          </button>
        ))}
      </div>
      <ul id={startersId} className="cards layout-grid" aria-label="Starting points" hidden={!open}>
        {starters.map((starter) => (
          <li key={starter.title}>
            <article className="card pad grid-stack">
              <h3 className="card__title">
                <button
                  className="stretched-link"
                  onClick={() => {
                    setDraft(starter.prompt);
                    field.current?.focus();
                  }}
                >
                  {starter.title}
                </button>
              </h3>
              <small className="muted">{starter.detail}</small>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const Default: Story = {
  render: (args) => <ConversationStart {...args} />,
  play: async ({ canvas, args }) => {
    const field = canvas.getByRole('textbox', { name: 'Prompt' });
    const summarise = canvas.getByRole('button', { name: 'Summarise' });

    // Nothing is open at first.
    await expect(summarise).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('button', { name: 'A long discussion' })).toBeNull();

    // A kind of request opens its starting points; pressing it again closes them.
    await userEvent.click(summarise);
    await expect(summarise).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'A long discussion' }));
    await expect(field).toHaveValue('Summarise the discussion: decisions and open questions');
    await expect(field).toHaveFocus();

    // Shift+Enter starts a new line; Enter sends and clears the field.
    await userEvent.type(field, '{Shift>}{Enter}{/Shift}Keep it short.');
    await expect(args.onSend).not.toHaveBeenCalled();
    await userEvent.type(field, '{Enter}');
    await expect(args.onSend).toHaveBeenCalledWith(
      'Summarise the discussion: decisions and open questions\nKeep it short.',
    );
    await expect(field).toHaveValue('');

    await userEvent.click(summarise);
    await expect(summarise).toHaveAttribute('aria-expanded', 'false');
  },
};
