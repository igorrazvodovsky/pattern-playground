import { Editor } from '@tiptap/react';
import { EventEmitter } from '../../../services/commenting/core/event-emitter';
import { getQuoteService, type QuoteObject } from '../../../services/commenting/quote-service';
import { StarterKit } from '@tiptap/starter-kit';
import { Mention } from '@tiptap/extension-mention';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    editorCommenting: {
      createQuoteFromSelection: () => ReturnType;
      insertReference: (object: { id: string; type: string; label: string }) => ReturnType;
      convertSelectionToQuoteReference: (quote: {
        id: string;
        label: string;
        metadata: Record<string, unknown>;
      }) => ReturnType;
    };
  }
}

interface EditorContext {
  editor: Editor;
  documentId: string;
  currentUser: string;
}

interface EditorSelection {
  from: number;
  to: number;
  empty: boolean;
}


interface QuoteCreatedEvent {
  quote: QuoteObject;
  pointer: CommentPointer;
}

// Adapts quote-service format to quote-pointer format
function adaptQuoteForPointer(quote: QuoteObject): import('../../../services/commenting/core/quote-pointer').QuoteObject {
  return {
    id: quote.id,
    content: {
      plainText: quote.content.plainText,
      html: quote.content.richContent ? JSON.stringify(quote.content.richContent) : quote.content.plainText
    },
    metadata: {
      ...quote.metadata,
      authorId: quote.metadata.createdBy
    },
    actions: {
      annotate: { enabled: true },
      cite: { enabled: true },
      challenge: { enabled: false },
      pin: { enabled: true }
    }
  };
}

interface PluginCapabilities {
  canCreateQuote: boolean;
  canInsertReference: boolean;
  hasRichTextComposer: boolean;
}

// TipTap integration layer for commenting system
export class EditorCommentingPlugin extends EventEmitter {
  private context: EditorContext | null = null;
  private quoteService = getQuoteService();

  constructor() {
    super();
  }

  onActivate(context: EditorContext): void {
    this.context = context;
    this.setupEditorCommands();
    this.setupEventListeners();
  }

  onDeactivate(): void {
    this.removeEventListeners();
    this.context = null;
  }

  getCapabilities(): PluginCapabilities {
    return {
      canCreateQuote: this.canCreateQuote(),
      canInsertReference: true,
      hasRichTextComposer: true
    };
  }

  // This is editor-specific functionality - the quote becomes just another commentable object
  async createQuoteFromSelection(): Promise<QuoteObject | null> {
    if (!this.context || !this.canCreateQuote()) {
      return null;
    }

    try {
      const quote = this.quoteService.createFromTipTapSelection(
        this.context.editor,
        this.context.currentUser,
        this.context.documentId
      );

      // Command may not be available
      const editorCommands = this.context.editor.commands as unknown;
      if ('convertSelectionToQuoteReference' in editorCommands) {
        editorCommands.convertSelectionToQuoteReference({
          id: quote.id,
          label: quote.name,
          metadata: quote.metadata
        });
      } else {
        console.warn('convertSelectionToQuoteReference command not available');
      }

      const { QuotePointer } = await import('../../../services/commenting/core/quote-pointer');
      const adaptedQuote = adaptQuoteForPointer(quote);
      const pointer = new QuotePointer(quote.id, adaptedQuote);

      // Emit event for UI to show comment interface
      this.emit('quote:created', { quote, pointer } as QuoteCreatedEvent);

      return quote;
    } catch (error) {
      console.error('Failed to create quote:', error);
      return null;
    }
  }

  canCreateQuote(): boolean {
    if (!this.context) return false;

    const selection = this.context.editor.state.selection as EditorSelection;
    return !selection.empty && selection.from !== selection.to;
  }

  insertReference(object: { id: string; type: string; label: string }): boolean {
    if (!this.context) return false;

    try {
      // Simple mention-style text for now - full implementation would use custom node type
      this.context.editor.commands.insertContent(`@${object.label}`);
      return true;
    } catch (error) {
      console.error('Failed to insert reference:', error);
      return false;
    }
  }

  createCommentComposer(): Editor | null {
    try {
      return new Editor({
        extensions: [
          StarterKit,
          Mention.configure({
            HTMLAttributes: {
              class: 'mention',
            },
          })
        ],
        content: '',
        editorProps: {
          attributes: {
            class: 'comment-composer prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          },
        }
      });
    } catch (error) {
      console.error('Failed to create comment composer:', error);
      return null;
    }
  }

  handleQuoteReferenceClick(quoteId: string): void {
    const quote = this.quoteService.getQuoteById(quoteId);
    if (quote) {
      this.emit('quote:clicked', { quoteId, quote });
    } else {
      console.warn(`Quote not found: ${quoteId}`);
    }
  }

  navigateToQuoteSource(quote: QuoteObject): boolean {
    if (!this.context) return false;

    const { from, to } = quote.metadata.sourceRange as { from: number; to: number };
    const { editor } = this.context;
    const docSize = editor.state.doc.content.size;

    if (from >= 0 && to <= docSize && from < to) {
      editor.commands.focus();
      editor.commands.setTextSelection({ from, to });

      const { view } = editor;
      try {
        const pos = view.coordsAtPos(from);
        if (pos) {
          view.dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (error) {
        console.warn('Failed to scroll to quote position:', error);
      }
      return true;
    }

    console.warn(`Invalid quote source range for ${quote.id}: from=${from}, to=${to}, docSize=${docSize}`);
    return false;
  }

  getQuote(quoteId: string): QuoteObject | undefined {
    return this.quoteService.getQuoteById(quoteId);
  }

  private setupEditorCommands(): void {
    if (!this.context) return;

    // Extend editor commands object with custom methods
    try {
      const editorCommands = this.context.editor.commands as unknown;

      editorCommands.createQuoteFromSelection = async (): Promise<boolean> => {
        const result = await this.createQuoteFromSelection();
        return result !== null;
      };

      editorCommands.insertReference = (object: { id: string; type: string; label: string }): boolean => {
        return this.insertReference(object);
      };
    } catch (error) {
      console.warn('Failed to setup custom editor commands:', error);
    }
  }

  private setupEventListeners(): void {
    if (!this.context) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const referenceElement = target.closest('[data-reference-type="quote"]');

      if (referenceElement) {
        const quoteId = referenceElement.getAttribute('data-reference-id');
        if (quoteId) {
          event.preventDefault();
          event.stopPropagation();
          this.handleQuoteReferenceClick(quoteId);
        }
      }
    };

    this.context.editor.view.dom.addEventListener('click', handleClick);

    (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler = handleClick;
  }

  private removeEventListeners(): void {
    if (!this.context) return;

    const handler = (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler;
    if (handler) {
      this.context.editor.view.dom.removeEventListener('click', handler);
      delete (this.context.editor as unknown as { _commentPluginClickHandler?: (event: MouseEvent) => void })._commentPluginClickHandler;
    }
  }
}

export function createEditorCommentingPlugin(): EditorCommentingPlugin {
  return new EditorCommentingPlugin();
}