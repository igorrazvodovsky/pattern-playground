import type { Editor } from '@tiptap/react';
import type { TipTapTextPointer } from './document-pointer.js';
import { AbstractPointerAdapter } from './pointers/abstract-pointer-adapter.js';

export class TipTapPointerAdapter extends AbstractPointerAdapter<TipTapTextPointer> {
  constructor(private editor: Editor, documentId: string, private editorId?: string) {
    super(documentId, editorId);
  }

  createPointer(): TipTapTextPointer | null {
    const { from, to } = this.editor.state.selection;
    
    if (from === to) {
      return null; // No selection
    }
    
    const text = this.editor.state.doc.textBetween(from, to, ' ');

    return {
      type: 'tiptap-text-range',
      from,
      to,
      text,
      documentId: this.documentId,
      editorId: this.editorId,
      timestamp: new Date()
    };
  }

  createPointerForRange(from: number, to: number): TipTapTextPointer {
    const text = this.editor.state.doc.textBetween(from, to, ' ');

    return {
      type: 'tiptap-text-range',
      from,
      to,
      text,
      documentId: this.documentId,
      editorId: this.editorId,
      timestamp: new Date()
    };
  }

  validatePointer(pointer: TipTapTextPointer): boolean {
    this.validatePointerStructure(pointer);
    
    const { from, to } = pointer;
    const docSize = this.editor.state.doc.content.size;
    
    if (from < 0 || to > docSize || from >= to) {
      return false;
    }
    
    return true;
  }

  getContentAtPointer(pointer: TipTapTextPointer): string | null {
    if (!this.validatePointer(pointer)) return null;
    return this.editor.state.doc.textBetween(pointer.from, pointer.to, ' ');
  }

  isPointerTextValid(pointer: TipTapTextPointer): boolean {
    const currentText = this.getContentAtPointer(pointer);
    return currentText === pointer.text;
  }

  // Highlight commented range
  highlightPointer(pointer: TipTapTextPointer, threadId: string): void {
    if (!this.validatePointer(pointer)) return;

    // Use the comment mark extension to highlight the range
    this.editor.chain().focus()
      .setTextSelection({ from: pointer.from, to: pointer.to })
      .setMark('comment', { commentId: threadId })
      .run();
  }

  // Remove highlighting
  unhighlightPointer(pointer: TipTapTextPointer): void {
    if (!this.validatePointer(pointer)) return;

    this.editor.chain().focus()
      .setTextSelection({ from: pointer.from, to: pointer.to })
      .unsetMark('comment')
      .run();
  }

  // Update pointer positions after document changes
  updatePointer(pointer: TipTapTextPointer, transform: any): TipTapTextPointer | null {
    try {
      const newFrom = transform.mapping.map(pointer.from);
      const newTo = transform.mapping.map(pointer.to);

      // If positions are invalid after transform, return null
      if (newFrom >= newTo || newFrom < 0) return null;

      const newText = this.editor.state.doc.textBetween(newFrom, newTo, ' ');

      return {
        ...pointer,
        from: newFrom,
        to: newTo,
        text: newText
      };
    } catch (error) {
      console.warn('Failed to update pointer position:', error);
      return null;
    }
  }

  // Get current user selection
  getCurrentSelection(): { from: number; to: number } | null {
    const { from, to } = this.editor.state.selection;
    return from !== to ? { from, to } : null;
  }

  // Check if there's a valid text selection
  hasValidSelection(): boolean {
    const selection = this.getCurrentSelection();
    return selection !== null;
  }

  // Get selected text
  getSelectedText(): string {
    const selection = this.getCurrentSelection();
    if (!selection) return '';
    return this.editor.state.doc.textBetween(selection.from, selection.to, ' ');
  }

  // Focus editor at a specific pointer location
  focusAtPointer(pointer: TipTapTextPointer): void {
    if (!this.validatePointer(pointer)) return;

    this.editor.commands.setTextSelection({ from: pointer.from, to: pointer.to });
    this.editor.commands.focus();
  }

  // Get all comment marks in the document
  getAllCommentMarks(): Array<{ from: number; to: number; threadId: string }> {
    const marks: Array<{ from: number; to: number; threadId: string }> = [];

    this.editor.state.doc.descendants((node, pos) => {
      if (node.marks) {
        node.marks.forEach(mark => {
          if (mark.type.name === 'comment' && mark.attrs.commentId) {
            marks.push({
              from: pos,
              to: pos + node.nodeSize,
              threadId: mark.attrs.commentId
            });
          }
        });
      }
    });

    return marks;
  }

  hasOverlappingComments(from: number, to: number): boolean {
    const commentMarks = this.getAllCommentMarks();
    return commentMarks.some(mark =>
      (from < mark.to && to > mark.from) // Ranges overlap
    );
  }

  deserializePointer(data: Record<string, any>): TipTapTextPointer {
    return {
      type: 'tiptap-text-range',
      from: data.from,
      to: data.to,
      text: data.text,
      documentId: data.documentId,
      editorId: data.editorId,
      timestamp: new Date(data.timestamp)
    };
  }
}