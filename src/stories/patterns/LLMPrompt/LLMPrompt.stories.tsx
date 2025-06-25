import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { materialMentionSuggestion } from './materialMentionSuggestion';

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
        <pp-input autoFocus viewalue="What was that thing's name?">
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
          <pp-input id="context" placeholder="What do you need?">
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
            <iconify-icon className="icon" icon="ph:arrow-elbow-down-left"></iconify-icon><span className="inclusively-hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  ),
};

export const WithMaterialReferences: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: 'mention mention--material',
            'data-type': 'material',
          },
          suggestion: materialMentionSuggestion,
        }),
      ],
      content: `
        <p>Analyze the user interface patterns in @API Documentation and compare them with the designs from @Wireframe v2.png. Consider the data from @User Analytics Q4 when making recommendations.</p>
      `,
    });

    return (
      <div className="messages layer">
        <div className="message-composer layer message-composer--rich">
          <div className="message-composer__input message-composer__input--rich">
            <EditorContent
              editor={editor}
              className="rich-editor"
              placeholder="Type @ to reference materials..."
            />
          </div>
          <div className="message-composer__actions">
            <button className="button button--plain" is="pp-button" title="Add context">
              <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="inclusively-hidden">Add context</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Get suggestions">
              <iconify-icon className="icon" icon="ph:lightbulb"></iconify-icon><span className="inclusively-hidden">Get suggestions</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Attach file">
              <iconify-icon className="icon" icon="ph:paperclip"></iconify-icon><span className="inclusively-hidden">Attach file</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Reference materials">
              <iconify-icon className="icon" icon="ph:at"></iconify-icon><span className="inclusively-hidden">Reference materials</span>
            </button>
            <button className="button" is="pp-button" style={{ marginLeft: 'auto' }} title="Send prompt">
              <iconify-icon className="icon" icon="ph:arrow-elbow-down-left"></iconify-icon><span className="inclusively-hidden">Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  },
};

export const EmptyPromptWithMentions: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        Mention.configure({
          HTMLAttributes: {
            class: 'mention mention--material',
            'data-type': 'material',
          },
          suggestion: materialMentionSuggestion,
        }),
      ],
      content: `<p></p>`,
    });

    return (
      <div className="messages layer">
        <div className="message-composer layer message-composer--rich">
          <div className="message-composer__input message-composer__input--rich">
            <EditorContent
              editor={editor}
              className="rich-editor"
            />
          </div>
          <div className="message-composer__actions">
            <button className="button button--plain" is="pp-button" title="Add context">
              <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="inclusively-hidden">Add context</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Get suggestions">
              <iconify-icon className="icon" icon="ph:lightbulb"></iconify-icon><span className="inclusively-hidden">Get suggestions</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Attach file">
              <iconify-icon className="icon" icon="ph:paperclip"></iconify-icon><span className="inclusively-hidden">Attach file</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Reference materials">
              <iconify-icon className="icon" icon="ph:at"></iconify-icon><span className="inclusively-hidden">Reference materials</span>
            </button>
            <button className="button" is="pp-button" style={{ marginLeft: 'auto' }} title="Send prompt">
              <iconify-icon className="icon" icon="ph:arrow-elbow-down-left"></iconify-icon><span className="inclusively-hidden">Send</span>
            </button>
          </div>
          <small className="message-composer__help">
            Type <kbd>@</kbd> to reference documents, images, code, or previous conversations
          </small>
        </div>
      </div>
    );
  },
};