import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import React from 'react'

export interface TemplateFieldOptions {
  HTMLAttributes: Record<string, any>
}

export interface TemplateFieldAttributes {
  label: string
  placeholder?: string
  filled?: boolean
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    templateField: {
      insertTemplateField: (attributes: { label: string; placeholder?: string }) => ReturnType
      updateTemplateField: (attributes: Partial<TemplateFieldAttributes>) => ReturnType
    }
  }
}

const TemplateFieldComponent = ({ node, updateAttributes, selected }: any) => {
  const { label, placeholder, filled } = node.attrs
  const [isEditing, setIsEditing] = React.useState(false)
  const [value, setValue] = React.useState(placeholder || '')

  const handleClick = () => {
    if (!filled) {
      setIsEditing(true)
    }
  }

  const handleSubmit = () => {
    updateAttributes({
      placeholder: value,
      filled: value.length > 0
    })
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setValue(placeholder || '')
    }
  }

  return (
    <span
      className={`template-field ${filled ? 'template-field--filled' : ''} ${selected ? 'template-field--selected' : ''}`}
      onClick={handleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={handleKeyDown}
          placeholder={label}
          autoFocus
        />
      ) : (
        <>
          {filled ? placeholder : label}
        </>
      )}
    </span>
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
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          })
        },
      updateTemplateField:
        (attributes) =>
        ({ commands }) => {
          return commands.updateAttributes(this.name, attributes)
        },
    }
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\[([^\]]+)\]/g,
        type: this.type,
        getAttributes: match => {
          return { label: match[1] }
        },
      }),
    ]
  },
})