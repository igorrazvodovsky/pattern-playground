import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";

const meta = {
  title: "Patterns/LLM*/Prompt",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const QualityFeedback: Story = {
  args: {},
  render: () => (
    <>
    <div className="flow">
      <div className="message-composer__feedback">
          <pp-spinner></pp-spinner>Evaluating...
      </div>
      <div className="message-composer__feedback">
          <span className="badge badge--pill badge--warning"></span> Please provide more details for best results
      </div>
      <div className="message-composer__feedback">
        <span className="badge badge--pill badge--warning"></span> More precise questions work better. Try adding elements like these:
      </div>
      <div className="message-composer__feedback">
        <span className="badge badge--pill badge--success"></span> Great question!
      </div>
    </div>
    <div className="messages layer">
      <div className="message-composer layer">
        <pp-input autoFocus defaultValue="What was that things name?">
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
        <small className="message-composer__feedback">
          <span className="badge badge--pill badge--warning"></span> Please provide more details for best results
        </small>
      </div>
    </div>
    </>
  ),
};

export const StructuredPrompt: Story = {
  args: {},
  render: () => (
    <div className="messages layer">
      <div className="message-composer layer">
        <div className="message-composer__input">
          <label htmlFor="context">Context</label>
          <pp-input id="context" placeholder="E.g. domain, audience, goal">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="role">Role</label>
          <pp-input id="role" placeholder="You are a…">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="task">Task</label>
          <pp-input id="task" placeholder="E.g. list three risks">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="constraints">Constraints</label>
          <pp-input id="constraints" placeholder="E.g. length, tone, forbidden words">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="examples">Examples</label>
          <pp-input id="examples" placeholder="You are a…">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="output">Output specification</label>
          <pp-input id="output" placeholder="Structure and patterns">
          </pp-input>
        </div>
        <div className="message-composer__input">
          <label htmlFor="fallback">Fallback</label>
          <pp-input id="fallback" placeholder="What to do when data are missing or uncertain">
          </pp-input>
        </div>
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
          <button className="button" is="pp-button" style={{ marginLeft: 'auto' }}>
            <iconify-icon className="icon" icon="ph:arrow-up-bold"></iconify-icon><span className="inclusively-hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  ),
};