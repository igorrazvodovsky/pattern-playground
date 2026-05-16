import { Mark, mergeAttributes } from '@tiptap/core';

// Extend Tiptap's Commands interface with comment mark commands
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    commentMark: {
      /**
       * Set a comment mark on selected text
       */
      setComment: (threadId: string, from?: number, to?: number) => ReturnType;
      /**
       * Remove a comment mark from selected text
       */
      unsetComment: (from?: number, to?: number) => ReturnType;
      /**
       * Toggle a comment mark on selected text
       */
      toggleComment: (threadId: string) => ReturnType;
      /**
       * Mark a comment as resolved
       */
      resolveComment: (threadId: string) => ReturnType;
      /**
       * Mark a comment as unresolved
       */
      unresolveComment: (threadId: string) => ReturnType;
    };
  }
}

// Custom comment mark extension for TipTap v3
export const CommentMark = Mark.create({
  name: 'comment',

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: element => element.getAttribute('data-comment-id'),
        renderHTML: attributes => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            'data-comment-id': attributes.commentId
          };
        }
      },
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-resolved') === 'true',
        renderHTML: attributes => {
          return {
            'data-resolved': attributes.resolved
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setComment: (threadId: string, from?: number, to?: number) => ({ commands }) => {
        if (from !== undefined && to !== undefined) {
          return commands.setTextSelection({ from, to })
            .setMark(this.name, { commentId: threadId });
        }
        return commands.setMark(this.name, { commentId: threadId });
      },
      unsetComment: (from?: number, to?: number) => ({ commands }) => {
        if (from !== undefined && to !== undefined) {
          return commands.setTextSelection({ from, to })
            .unsetMark(this.name);
        }
        return commands.unsetMark(this.name);
      },
      toggleComment: (threadId: string) => ({ commands }) => {
        return commands.toggleMark(this.name, { commentId: threadId });
      },
      resolveComment: () => ({ commands }) => {
        return commands.updateAttributes(this.name, { resolved: true });
      },
      unresolveComment: () => ({ commands }) => {
        return commands.updateAttributes(this.name, { resolved: false });
      }
    };
  }
});