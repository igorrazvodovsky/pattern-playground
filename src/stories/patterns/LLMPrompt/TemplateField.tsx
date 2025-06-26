import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
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
  const inputRef = React.useRef<HTMLInputElement>(null)

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    // Resize input to fit content
    if (inputRef.current) {
      inputRef.current.style.width = 'auto'
      inputRef.current.style.width = Math.max(inputRef.current.scrollWidth, 20) + 'px'
    }
  }

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      // Set initial width based on placeholder text
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        // Get computed styles to measure text accurately
        const computedStyle = window.getComputedStyle(inputRef.current)
        context.font = `${computedStyle.fontSize} ${computedStyle.fontFamily}`
        
        // Measure the placeholder text width
        const textToMeasure = value || label
        const textWidth = context.measureText(textToMeasure).width
        
        // Set width with some padding
        inputRef.current.style.width = Math.max(textWidth + 10, 20) + 'px'
      }
    }
  }, [isEditing, label, value])

  return (
    <NodeViewWrapper
      className={`template-field ${filled ? 'template-field--filled' : ''} ${selected ? 'template-field--selected' : ''}`}
      onClick={handleClick}
      as="span"
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
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