import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    referenceMark: {
      /**
       * Set a reference mark
       */
      setReference: (options: {
        referenceId: string;
        referenceType: string;
        label: string;
      }) => ReturnType;
      
      /**
       * Toggle a reference mark
       */
      toggleReference: (options: {
        referenceId: string;
        referenceType: string;
        label: string;
      }) => ReturnType;
      
      /**
       * Unset a reference mark
       */
      unsetReference: () => ReturnType;
    };
  }
}

/**
 * TipTap Mark extension for reference mentions (quotes, documents, users, etc.)
 * Replaces the previous CommentMark system with a unified reference system
 */
export const ReferenceMark = Mark.create({
  name: 'reference',

  addAttributes() {
    return {
      referenceId: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-id'),
        renderHTML: attributes => {
          if (!attributes.referenceId) return {};
          return { 'data-reference-id': attributes.referenceId };
        }
      },
      referenceType: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-type'),
        renderHTML: attributes => {
          if (!attributes.referenceType) return {};
          return { 'data-reference-type': attributes.referenceType };
        }
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-reference-label'),
        renderHTML: attributes => {
          if (!attributes.label) return {};
          return { 'data-reference-label': attributes.label };
        }
      },
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-reference-resolved') === 'true',
        renderHTML: attributes => {
          return { 'data-reference-resolved': attributes.resolved };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-reference-id]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { referenceType, label } = HTMLAttributes;
    
    // Add CSS classes based on reference type
    const classes = ['reference-mention'];
    if (referenceType) {
      classes.push(`reference-mention--${referenceType}`);
    }
    
    // Merge attributes with our CSS classes
    const attrs = mergeAttributes(HTMLAttributes, {
      class: classes.join(' '),
      title: label ? `${referenceType || 'Reference'}: ${label}` : 'Reference'
    });

    return ['span', attrs, 0];
  },

  addCommands() {
    return {
      setReference: options => ({ commands }) => {
        return commands.setMark(this.name, options);
      },
      
      toggleReference: options => ({ commands }) => {
        return commands.toggleMark(this.name, options);
      },
      
      unsetReference: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      }
    };
  },

  addKeyboardShortcuts() {
    return {
      // Remove reference mark with backspace if cursor is at the end
      'Backspace': () => {
        const { selection, doc } = this.editor.state;
        const { from, to, empty } = selection;
        
        if (!empty) return false;
        
        // Check if we're at the end of a reference mark
        const $pos = doc.resolve(from);
        const marks = $pos.marksAcross($pos);
        const referenceMark = marks?.find(mark => mark.type.name === this.name);
        
        if (referenceMark) {
          // Find the range of the reference mark
          let start = from;
          let end = from;
          
          // Find start of mark
          while (start > 0) {
            const $start = doc.resolve(start - 1);
            if (!$start.marksAcross($start)?.some(mark => mark.type.name === this.name)) {
              break;
            }
            start--;
          }
          
          // Find end of mark
          while (end < doc.content.size) {
            const $end = doc.resolve(end);
            if (!$end.marksAcross($end)?.some(mark => mark.type.name === this.name)) {
              break;
            }
            end++;
          }
          
          // Remove the entire reference mark
          this.editor.chain()
            .setTextSelection({ from: start, to: end })
            .unsetReference()
            .deleteSelection()
            .run();
            
          return true;
        }
        
        return false;
      }
    };
  },

});

export default ReferenceMark;