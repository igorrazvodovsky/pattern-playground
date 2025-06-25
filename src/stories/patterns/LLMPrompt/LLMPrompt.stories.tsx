import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { materialMentionSuggestion } from './materialMentionSuggestion';
import { TemplateField } from './TemplateField.tsx';

const meta = {
  title: "Patterns/LLM*/Prompt",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
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
      editorProps: {
        attributes: {
          'data-placeholder': 'What do you need?'
        }
      }
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
          </div>
        </div>
      </div>
    );
  },
};

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
        <pp-input autoFocus value="What was that thing's name?">
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

export const PromptTemplate: Story = {
  args: {},
  render: () => {
    const editor = useEditor({
      extensions: [
        StarterKit,
        TemplateField,
        Mention.configure({
          HTMLAttributes: {
            class: 'mention mention--material',
            'data-type': 'material',
          },
          suggestion: materialMentionSuggestion,
        }),
      ],
      content: `
        <h3>Context</h3>
        <p>You are a <span data-type="template-field" data-label="ROLE"></span> working with <span data-type="template-field" data-label="DOMAIN/SUBJECT"></span>. You have access to @User Research Data and @Design System Guidelines.</p>

        <h3>Task</h3>
        <p><span data-type="template-field" data-label="ACTION"></span> a <span data-type="template-field" data-label="DELIVERABLE"></span> that <span data-type="template-field" data-label="SPECIFIC OUTCOME"></span>.</p>

        <h3>Constraints</h3>
        <ul>
          <li>Must follow <span data-type="template-field" data-label="REQUIREMENTS/STANDARDS"></span></li>
          <li>Consider <span data-type="template-field" data-label="LIMITATIONS/BOUNDARIES"></span></li>
          <li>Target audience: <span data-type="template-field" data-label="USER GROUP"></span></li>
        </ul>

        <h3>Examples</h3>
        <p>Good example: <span data-type="template-field" data-label="POSITIVE EXAMPLE"></span></p>
        <p>Avoid: <span data-type="template-field" data-label="NEGATIVE EXAMPLE"></span></p>

        <h3>Output Format</h3>
        <p>Provide your response as <span data-type="template-field" data-label="FORMAT SPECIFICATION"></span>.</p>
      `,
    });

    const fillAllFields = () => {
      if (editor) {
        editor.commands.focus();

        // Example of programmatically filling template fields
        const sampleData = {
          'ROLE': 'UX Designer',
          'DOMAIN/SUBJECT': 'e-commerce interfaces',
          'ACTION': 'Create',
          'DELIVERABLE': 'design system component',
          'SPECIFIC OUTCOME': 'improves checkout conversion rates',
          'REQUIREMENTS/STANDARDS': 'WCAG 2.1 AA accessibility standards',
          'LIMITATIONS/BOUNDARIES': 'mobile-first responsive design constraints',
          'USER GROUP': 'returning customers aged 25-45',
          'POSITIVE EXAMPLE': 'Amazon one-click checkout simplicity',
          'NEGATIVE EXAMPLE': 'multi-step forms with unclear progress indicators',
          'FORMAT SPECIFICATION': 'structured Figma file with component documentation'
        };

        // This would need to be implemented to update all template fields
        // For now, this is a placeholder for the functionality
        console.log('Would fill template fields with:', sampleData);
      }
    };

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
            <button
              className="button button--plain"
              is="pp-button"
              title="Fill template with sample data"
              onClick={fillAllFields}
            >
              <iconify-icon className="icon" icon="ph:text-aa"></iconify-icon><span className="inclusively-hidden">Fill template</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Add context">
              <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="inclusively-hidden">Add context</span>
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