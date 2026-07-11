import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface TemplateFieldOptions {
  HTMLAttributes: Record<string, unknown>
  allowedTypes?: string[]
  maxLength?: number
  required?: boolean
}

export interface TemplateFieldAttributes {
  label: string
  placeholder?: string
  filled?: boolean
  type?: string
  required?: boolean
  value?: string
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateField: {
      insertTemplateField: (attributes: Partial<TemplateFieldAttributes>) => ReturnType
      updateTemplateField: (attributes: Partial<TemplateFieldAttributes>) => ReturnType
      fillTemplateField: (label: string, value: string) => ReturnType
      clearTemplateFields: () => ReturnType
      validateTemplateFields: () => ReturnType
    }
  }
}

interface TemplateFieldComponentProps {
  node: {
    attrs: TemplateFieldAttributes
  }
  updateAttributes: (attrs: Partial<TemplateFieldAttributes>) => void
  selected: boolean
  editor: Editor
  getPos: () => number | undefined
}

// Custom hook for optimized input sizing (replacing canvas measurement)
const useInputSizing = (text: string, isEditing: boolean) => {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>(100);

  useEffect(() => {
    if (isEditing && measureRef.current) {
      // Use DOM-based measurement instead of canvas for better performance
      measureRef.current.textContent = text || 'A';
      const measuredWidth = measureRef.current.getBoundingClientRect().width;
      setWidth(Math.max(measuredWidth + 20, 60));
    }
  }, [text, isEditing]);

  return { width, measureRef };
};

const TemplateFieldComponent = ({
  node,
  updateAttributes,
  selected,
  editor,
  getPos
}: TemplateFieldComponentProps) => {
  const { label, placeholder, filled, type, required, value } = node.attrs;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value || placeholder || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { width, measureRef } = useInputSizing(inputValue, isEditing);

  // Memoized validation
  const validation = useMemo(() => {
    if (!required) return { isValid: true, message: '' };

    const hasValue = inputValue.trim().length > 0;
    return {
      isValid: hasValue,
      message: hasValue ? '' : `${label} is required`
    };
  }, [inputValue, required, label]);

  const handleClick = useCallback(() => {
    if (!filled && !isEditing) {
      setIsEditing(true);
    }
  }, [filled, isEditing]);

  const handleSubmit = useCallback(() => {
    const trimmedValue = inputValue.trim();
    updateAttributes({
      placeholder: trimmedValue,
      value: trimmedValue,
      filled: trimmedValue.length > 0
    });
    setIsEditing(false);

    // Emit custom event for form validation
    const pos = getPos?.();
    if (pos !== undefined) {
      editor.view.dispatch(
        editor.view.state.tr.setMeta('templateFieldUpdated', {
          pos,
          label,
          value: trimmedValue,
          isValid: validation.isValid
        })
      );
    }
  }, [inputValue, updateAttributes, getPos, editor, label, validation.isValid]);

  const handleCancel = useCallback(() => {
    setInputValue(value || placeholder || '');
    setIsEditing(false);
  }, [value, placeholder]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent editor shortcuts while editing

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSubmit();

      setTimeout(() => {
        const nextField = editor.view.dom.querySelector(
          '.template-field:not(.template-field--filled)'
        ) as HTMLElement;
        if (nextField) {
          nextField.click();
        }
      }, 50);
    }
  }, [handleSubmit, handleCancel, editor]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Enhanced class names with validation states
  const className = useMemo(() => {
    const classes = ['template-field'];

    if (filled) classes.push('template-field--filled');
    if (selected) classes.push('template-field--selected');
    if (isEditing) classes.push('template-field--editing');
    if (required) classes.push('template-field--required');
    if (!validation.isValid && filled) classes.push('template-field--invalid');
    if (type) classes.push(`template-field--${type}`);

    return classes.join(' ');
  }, [filled, selected, isEditing, required, validation.isValid, type]);

  return (
    <NodeViewWrapper
      className={className}
      onClick={handleClick}
      as="span"
      data-label={label}
      data-type={type}
      data-required={required}
      role="textbox"
      aria-label={`Template field: ${label}`}
      aria-invalid={!validation.isValid}
      tabIndex={filled ? -1 : 0}
    >
      {/* Hidden measurement span for sizing */}
      <span
        ref={measureRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'pre',
          fontSize: 'inherit',
          fontFamily: 'inherit',
          fontWeight: 'inherit',
        }}
        aria-hidden="true"
      />
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          placeholder={label}
          style={{ width: `${width}px` }}
          className="template-field__input"
          data-testid={`template-field-input-${label}`}
          aria-describedby={!validation.isValid ? `error-${label}` : undefined}
          autoFocus
        />
      ) : (
        <span className="template-field__content">
          {filled ? (
            <span className="template-field__value">{value || placeholder}</span>
          ) : (
            <span className="template-field__label">{label}</span>
          )}
        </span>
      )}

      {/* Validation message */}
      {!validation.isValid && filled && (
        <span
          className="template-field__error"
          id={`error-${label}`}
          role="alert"
          aria-live="polite"
        >
          {validation.message}
        </span>
      )}
    </NodeViewWrapper>
  )
}

export const TemplateField = Node.create<TemplateFieldOptions>({
  name: 'templateField',

  group: 'inline',

  inline: true,

  selectable: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      label: {
        default: '',
        parseHTML: element => element.getAttribute('data-label'),
        renderHTML: attributes => {
          if (!attributes.label) {
            return {}
          }
          return {
            'data-label': attributes.label,
          }
        },
      },
      placeholder: {
        default: '',
        parseHTML: element => element.getAttribute('data-placeholder'),
        renderHTML: attributes => {
          if (!attributes.placeholder) {
            return {}
          }
          return {
            'data-placeholder': attributes.placeholder,
          }
        },
      },
      filled: {
        default: false,
        parseHTML: element => element.getAttribute('data-filled') === 'true',
        renderHTML: attributes => {
          return {
            'data-filled': attributes.filled,
          }
        },
      },
      type: {
        default: 'text',
        parseHTML: element => element.getAttribute('data-field-type') || 'text',
        renderHTML: attributes => {
          return {
            'data-field-type': attributes.type,
          }
        },
      },
      required: {
        default: false,
        parseHTML: element => element.getAttribute('data-required') === 'true',
        renderHTML: attributes => {
          return {
            'data-required': attributes.required,
          }
        },
      },
      value: {
        default: '',
        parseHTML: element => element.getAttribute('data-value'),
        renderHTML: attributes => {
          if (!attributes.value) {
            return {}
          }
          return {
            'data-value': attributes.value,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="template-field"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(
        { 'data-type': 'template-field' },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(TemplateFieldComponent)
  },

  addCommands() {
    return {
      insertTemplateField:
        (attributes: Partial<TemplateFieldAttributes>) =>
        ({ commands }) => {
          if (!attributes.label) {
            return false;
          }
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
      updateTemplateField:
        (attributes: Partial<TemplateFieldAttributes>) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes)
        },
      fillTemplateField:
        (label: string, value: string) =>
        ({ tr, state }) => {
          let updated = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.label === label) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                value,
                placeholder: value,
                filled: true
              });
              updated = true;
            }
          });
          return updated;
        },
      clearTemplateFields:
        () =>
        ({ tr, state }) => {
          let updated = false;
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.filled) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                value: '',
                placeholder: '',
                filled: false
              });
              updated = true;
            }
          });
          return updated;
        },
      validateTemplateFields:
        () =>
        ({ state }) => {
          let allValid = true;
          const validationResults: Array<{label: string, isValid: boolean, message: string}> = [];

          state.doc.descendants((node) => {
            if (node.type.name === this.name) {
              const { label, required, value, filled } = node.attrs;
              if (required) {
                const hasValue = filled && value && value.trim().length > 0;
                const isValid = hasValue;
                if (!isValid) allValid = false;

                validationResults.push({
                  label,
                  isValid,
                  message: isValid ? '' : `${label} is required`
                });
              }
            }
          });

          // Emit validation results via transaction meta
          state.tr.setMeta('templateFieldValidation', {
            isValid: allValid,
            results: validationResults
          });

          return allValid;
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\[([^\]]+)\]/g,
        type: this.type,
        getAttributes: match => {
          const content = match[1];
          const parts = content.split('|');

          // Parse: [Label|type|required] or [Label|type] or [Label]
          const label = parts[0].trim();
          const type = parts[1]?.trim() || 'text';
          const required = parts[2]?.trim() === 'required';


          return {
            label,
            type,
            required,
            placeholder: '',
            filled: false,
            value: ''
          }
        },
      }),
    ]
  },
})