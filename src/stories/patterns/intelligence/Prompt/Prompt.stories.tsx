import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Reference, createReferenceSuggestion } from '../../../../components/reference/Reference';
import { materialCategory } from '../../../shared-data/reference-utils';
import { TemplateField } from '../../../../components/template-field';

interface TipTapContent {
  type: string;
  content?: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: Record<string, unknown>;
    }>;
  }>;
}

const meta = {
  title: "Patterns/Intelligence*/Prompt",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const usePromptEditor = (content: string | TipTapContent = '<p></p>') => {
  const [editorState, setEditorState] = useState({
    content: '',
    mentions: [] as Array<{id: string, name: string, type: string}>,
    templateFields: [] as Array<{label: string, value: string, filled: boolean, required: boolean}>,
    wordCount: 0,
    isValid: true
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      TemplateField,
      Reference.configure({
        HTMLAttributes: {
          class: 'reference-mention reference',
          'data-type': 'material',
        },
        suggestion: createReferenceSuggestion([materialCategory], (reference) => {
          console.log('Material reference selected:', reference);
        }),
      }),
    ],
    content,
    onTransaction: ({ editor }) => {
      // Track editor state for quality assessment
      const content = editor.getHTML();
      const wordCount = editor.state.doc.textContent.split(/\s+/).filter(Boolean).length;

      // Extract mentions
      const mentions: Array<{id: string, name: string, type: string}> = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'mention') {
          mentions.push({
            id: node.attrs.id,
            name: node.attrs.label,
            type: node.attrs.type
          });
        }
      });

      // Extract template fields
      const templateFields: Array<{label: string, value: string, filled: boolean, required: boolean}> = [];
      editor.state.doc.descendants((node) => {
        if (node.type.name === 'templateField') {
          templateFields.push({
            label: node.attrs.label,
            value: node.attrs.value || '',
            filled: node.attrs.filled || false,
            required: node.attrs.required || false
          });
        }
      });

      setEditorState({
        content,
        mentions,
        templateFields,
        wordCount,
        isValid: templateFields.every(field => !field.required || field.filled)
      });
    },
  });

  const fillTemplateFields = useCallback((data: Record<string, string>) => {
    if (!editor) return;

    Object.entries(data).forEach(([label, value]) => {
      editor.commands.fillTemplateField(label, value);
    });
  }, [editor]);

  const clearTemplateFields = useCallback(() => {
    if (!editor) return;
    editor.commands.clearTemplateFields();
  }, [editor]);

  const validatePrompt = useCallback(() => {
    if (!editor) return false;
    return editor.commands.validateTemplateFields();
  }, [editor]);

  return {
    editor,
    editorState,
    fillTemplateFields,
    clearTemplateFields,
    validatePrompt
  };
};

export const Basic: Story = {
  args: {},
  render: () => {
    const { editor } = usePromptEditor('<p></p>');

    return (
      <div className="messages layer">
        <div className="message-composer layer">
          <div className="message-composer__input message-composer__input--rich">
            <EditorContent
              editor={editor}
              className="rich-editor rich-editor--prompt"
              data-placeholder="What do you need?"
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
    const { editor, editorState } = usePromptEditor({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Analyse the user interface patterns in ' },
            {
              type: 'reference',
              attrs: {
                id: 'doc-7',
                label: 'API Documentation',
                type: 'document'
              }
            },
            { type: 'text', text: ' and compare them with the designs from ' },
            {
              type: 'reference',
              attrs: {
                id: 'doc-6',
                label: 'Design System Guidelines',
                type: 'document'
              }
            },
            { type: 'text', text: '. Consider the data from ' },
            {
              type: 'reference',
              attrs: {
                id: 'doc-8',
                label: 'User Research Report',
                type: 'document'
              }
            },
            { type: 'text', text: ' when making recommendations.' }
          ]
        }
      ]
    });

    return (
      <div className="messages layer">
        <div className="message-composer layer">

          <div className="message-composer__input message-composer__input--rich">
            <EditorContent
              editor={editor}
              className="rich-editor rich-editor--prompt"
              data-placeholder="Type @ to reference materials..."
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
            <button
              className={`button ${editorState.isValid ? '' : 'button--disabled'}`}
              is="pp-button"
              style={{ marginLeft: 'auto' }}
              title="Send prompt"
              disabled={!editorState.isValid}
            >
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
    const { editor, editorState, fillTemplateFields, clearTemplateFields, validatePrompt } = usePromptEditor(`
      <span data-type="template-field" data-label="The context: domain, audience, goal, etc." data-field-type="text" data-required="false" data-filled="false" data-value="">
        The context: domain, audience, goal, etc.
      </span>
      <span data-type="template-field" data-label="The task is..." data-field-type="text" data-required="true" data-filled="false" data-value="">
        The task is...
      </span>
      <span data-type="template-field" data-label="Target audience" data-field-type="text" data-required="false" data-filled="false" data-value="">
        Target audience
      </span>
      <span data-type="template-field" data-label="Specific outcome in mind?" data-field-type="text" data-required="true" data-filled="false" data-value="">
        Specific outcome in mind?
      </span>
      <span data-type="template-field" data-label="Constraints: length, tone, forbidden words, etc." data-field-type="text" data-required="false" data-filled="false" data-value="">
        Constraints: length, tone, forbidden words, etc.
      </span>
      <span data-type="template-field" data-label="Do you have any examples?" data-field-type="text" data-required="false" data-filled="false" data-value="">
        Do you have any examples?
      </span>
      <span data-type="template-field" data-label="Describe the output" data-field-type="text" data-required="false" data-filled="false" data-value="">
        Describe the output
      </span>
    `);

    const handleFillSample = useCallback(() => {
      const sampleData = {
        'Role': 'UX Designer',
        'Deliverable': 'checkout flow wireframes',
        'Target Audience': 'returning e-commerce customers',
        'Specific Outcome': 'reduces cart abandonment by 15%',
        'Context': 'Mobile-first e-commerce platform with 2M+ monthly users',
        'Requirements': 'WCAG 2.1 AA accessibility, mobile responsive',
        'Constraints': 'Must work with existing design system, 3-step maximum',
        'Examples': 'Reference @Design System Guidelines and @API Documentation',
        'Output Format': 'Figma file with annotations and user flow documentation'
      };

      fillTemplateFields(sampleData);
    }, [fillTemplateFields]);

    const handleClearFields = useCallback(() => {
      clearTemplateFields();
    }, [clearTemplateFields]);

    const handleValidate = useCallback(() => {
      const isValid = validatePrompt();
      alert(isValid ? 'All required fields are filled!' : 'Please fill all required fields.');
    }, [validatePrompt]);

    return (
      <div className="messages layer">
        <div className="message-composer layer">

          <div className="message-composer__input message-composer__input--rich">
            <EditorContent
              editor={editor}
              className="rich-editor rich-editor--prompt"
            />
          </div>

          <div className="message-composer__actions">
            <button
              className="button button--plain"
              is="pp-button"
              title="Fill template with sample data"
              onClick={handleFillSample}
            >
              <iconify-icon className="icon" icon="ph:text-aa"></iconify-icon><span className="inclusively-hidden">Fill template</span>
            </button>
            <button
              className="button button--plain"
              is="pp-button"
              title="Clear all template fields"
              onClick={handleClearFields}
            >
              <iconify-icon className="icon" icon="ph:eraser"></iconify-icon><span className="inclusively-hidden">Clear fields</span>
            </button>
            <button
              className="button button--plain"
              is="pp-button"
              title="Validate template fields"
              onClick={handleValidate}
            >
              <iconify-icon className="icon" icon="ph:check-square"></iconify-icon><span className="inclusively-hidden">Validate</span>
            </button>
            <button className="button button--plain" is="pp-button" title="Reference materials">
              <iconify-icon className="icon" icon="ph:at"></iconify-icon><span className="inclusively-hidden">Reference materials</span>
            </button>
            <button
              className={`button ${editorState.isValid ? '' : 'button--disabled'}`}
              is="pp-button"
              style={{ marginLeft: 'auto' }}
              title="Send prompt"
              disabled={!editorState.isValid}
            >
              <iconify-icon className="icon" icon="ph:arrow-elbow-down-left"></iconify-icon><span className="inclusively-hidden">Send</span>
            </button>
          </div>
        </div>
      </div>
    );
  },
};