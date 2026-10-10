import { BasePlugin } from '../core/Plugin';
import type { EditorContext, SlotRegistry, EventBus } from '../../editor/types';
import type { Extension } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { Transaction } from '@tiptap/pm/state';
import { Reference, createReferenceSuggestion } from '../../reference/index.js';
import React from 'react';
import CommentingBubbleMenu from './components/CommentingBubbleMenu';
import CommentingToolbar from './components/CommentingToolbar';
import type { ReferenceCategory } from '../../reference/types.js';
import { EntityPointer } from '../../../services/commenting/core/entity-pointer';
import { TextRangePointer } from '../../../services/commenting/core/text-range-pointer';
import type { CommentPointer } from '../../../services/commenting/core/comment-pointer';
import { getQuoteService } from '../../../services/commenting/quote-service';
import { getCommentService } from '../../../services/commenting/core/comment-service-instance';
import {
  addCommentMark,
  canComment,
  commentedSlice,
  findCommentRanges,
  findQuoteRanges,
  quoteCommentedPassage,
  touchesAnchors,
  unquotePassage,
} from '../../commenting/tiptap/comment-mark';
import type { ThreadListEntry } from '../../commenting/core/ThreadList';

export const COMMENTING_PLUGIN_ID = 'editor-commenting';

function isReference(node: ProseMirrorNode): boolean {
  return node.type.name === 'reference';
}

export interface CommentingPluginConfig {
  documentId: string;
  currentUser: string;
  bubbleMenu?: boolean;
  toolbar?: boolean;
  referenceCategories?: ReferenceCategory[];
}

/** The thread the actor is looking at in the editor. */
export interface OpenThread {
  /** A passage's thread id, or a quote's id. */
  id: string;
  kind: 'passage' | 'quote';
  pointer: CommentPointer;
  /** True until the first comment marks the passage. */
  pending: boolean;
}

declare module '../../editor/types' {
  interface EventPayload {
    'commenting:thread-opened': { thread: OpenThread };
    /** A pending thread lost its passage before its first comment. */
    'commenting:thread-closed': { id: string };
    'commenting:show-threads': Record<string, never>;
  }
}

// The editor side of universal commenting. It reports what can be commented
// on (the selection, the marked passages, the quote references), marks a
// passage once its thread has a comment, and brings a passage into view. The
// comment service and the shared thread components do everything else.
//
// The comment mark itself, and the Mod-Shift-M shortcut, come from the
// `Commenting` extension, which the host adds to the editor.
export class EditorCommentingPlugin extends BasePlugin {
  id = COMMENTING_PLUGIN_ID;
  name = 'Editor Commenting Plugin';
  version = '3.0.0';

  capabilities = {
    requiresSelection: true,
    modifiesContent: true,
    providesUI: true,
    requiresNetwork: false,
    supportsStreaming: false,
  };

  private config: CommentingPluginConfig = {
    documentId: '',
    currentUser: '',
    bubbleMenu: true,
    toolbar: false,
  };

  // The selection being commented on before its first comment. Edits made in
  // the meantime are mapped through, so the mark lands on the same text.
  private pending: { threadId: string; from: number; to: number } | null = null;

  configure(config: unknown): void {
    if (config && typeof config === 'object') {
      this.config = { ...this.config, ...config as CommentingPluginConfig };
    }
  }

  getExtensions(): Extension[] {
    if (!this.config.referenceCategories) return [];
    return [
      Reference.configure({
        suggestion: createReferenceSuggestion(this.config.referenceCategories),
      }) as Extension,
    ];
  }

  onActivate(context: EditorContext): void {
    super.onActivate(context);
    context.editor.on('transaction', this.mapPending);
  }

  onDeactivate(): void {
    this.detach();
    super.onDeactivate();
  }

  onDestroy(): void {
    this.detach();
    super.onDestroy();
  }

  private detach(): void {
    this.context?.editor.off('transaction', this.mapPending);
    this.pending = null;
  }

  // A pending passage that is deleted, or moved somewhere a comment mark
  // cannot go, leaves the thread nothing to mark. The thread closes then,
  // before a comment is stored under it.
  private mapPending = ({ transaction }: { transaction: Transaction }) => {
    const state = this.context?.editor.state;
    if (!this.pending || !transaction.docChanged || !state) return;
    const from = transaction.mapping.map(this.pending.from, 1);
    const to = transaction.mapping.map(this.pending.to, -1);
    if (canComment(state, from, to)) {
      this.pending = { ...this.pending, from, to };
      return;
    }
    const { threadId } = this.pending;
    this.pending = null;
    this.emit('commenting:thread-closed', { id: threadId });
  };

  registerUI(slots: SlotRegistry): void {
    if (this.config.bubbleMenu) {
      slots.register('bubble-menu', {
        pluginId: this.id,
        render: () => React.createElement(CommentingBubbleMenu),
      }, {
        condition: () => {
          const state = this.context?.editor?.state;
          if (!state || state.selection.empty) return false;
          return canComment(state, state.selection.from, state.selection.to);
        },
        priority: 10,
      });
    }

    if (this.config.toolbar) {
      slots.register('toolbar', {
        pluginId: this.id,
        render: () => React.createElement(CommentingToolbar),
      }, {
        priority: 20,
      });
    }
  }

  subscribeToEvents(eventBus: EventBus): void {
    eventBus.on('command:execute', ({ command }) => {
      switch (command) {
        case 'commenting:create-comment':
          this.startThread();
          break;
        case 'commenting:show-threads':
          this.emit('commenting:show-threads', {});
          break;
      }
    });
  }

  /** Opens a new thread on the current selection. Nothing changes in the document yet. */
  startThread(): void {
    const editor = this.context?.editor;
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    if (empty || !canComment(editor.state, from, to)) return;

    const threadId = `thread-${crypto.randomUUID()}`;
    this.pending = { threadId, from, to };
    this.emit('commenting:thread-opened', {
      thread: { id: threadId, kind: 'passage', pointer: this.pointerFor(threadId), pending: true },
    });
  }

  /** Reopens the thread on a marked passage. */
  openThread(threadId: string): void {
    this.emit('commenting:thread-opened', {
      thread: { id: threadId, kind: 'passage', pointer: this.pointerFor(threadId), pending: false },
    });
  }

  /** Opens the thread on a passage that was turned into a quote. */
  openQuoteThread(quoteId: string): void {
    this.emit('commenting:thread-opened', {
      thread: { id: quoteId, kind: 'quote', pointer: new EntityPointer('quote', quoteId), pending: false },
    });
  }

  /**
   * Turns a commented passage into a quote: a standalone object other places
   * can refer to. The words stay in the document under a quote marker, and
   * the passage's thread moves to the quote.
   */
  async quoteThread(threadId: string): Promise<OpenThread | null> {
    const editor = this.context?.editor;
    if (!editor) return null;
    const passage = commentedSlice(editor.state.doc, threadId);
    if (!passage) return null;

    const quotes = getQuoteService();
    const quote = quotes.createFromSlice(
      passage.slice, { from: passage.from, to: passage.to }, this.config.currentUser, this.config.documentId
    );
    // The marks change first, while the passage is where it was just found.
    // If the thread then fails to move, the passage goes back to its thread.
    if (!quoteCommentedPassage(editor, threadId, quote.id)) {
      quotes.deleteQuote(quote.id);
      return null;
    }
    const quotePointer = new EntityPointer('quote', quote.id);
    try {
      await getCommentService().reanchor(this.pointerFor(threadId), quotePointer);
    } catch (error) {
      unquotePassage(editor, quote.id, threadId);
      quotes.deleteQuote(quote.id);
      throw error;
    }

    const thread: OpenThread = { id: quote.id, kind: 'quote', pointer: quotePointer, pending: false };
    this.emit('commenting:thread-opened', { thread });
    return thread;
  }

  /**
   * Marks the passage once its thread has a first comment. False when there
   * is no pending passage to mark.
   */
  confirmThread(threadId: string): boolean {
    const editor = this.context?.editor;
    if (!editor || this.pending?.threadId !== threadId) return false;
    const { from, to } = this.pending;
    this.pending = null;
    return addCommentMark(editor, threadId, from, to);
  }

  /** Drops a thread that never got a comment. The document is unchanged. */
  discardThread(threadId: string): void {
    if (this.pending?.threadId === threadId) {
      this.pending = null;
    }
  }

  pointerFor(threadId: string): TextRangePointer {
    return new TextRangePointer(this.config.documentId, threadId);
  }

  /** Where a thread's passage is now: the selection while pending, else its mark. */
  rangeOf(thread: Pick<OpenThread, 'id' | 'kind'>): { from: number; to: number } | null {
    if (thread.kind === 'passage' && this.pending?.threadId === thread.id) {
      return { from: this.pending.from, to: this.pending.to };
    }
    const doc = this.context?.editor.state.doc;
    if (!doc) return null;
    const range = thread.kind === 'passage'
      ? findCommentRanges(doc).find(r => r.threadId === thread.id)
      : findQuoteRanges(doc).find(r => r.quoteId === thread.id);
    return range ? { from: range.from, to: range.to } : null;
  }

  /** Whether a transaction may have changed what `getThreadEntries` reports. */
  affectsThreadEntries(transaction: Transaction): boolean {
    return transaction.docChanged && touchesAnchors(transaction, isReference);
  }

  /** Everything in the document that can carry a thread, in document order. */
  getThreadEntries(): ThreadListEntry[] {
    const doc = this.context?.editor.state.doc;
    if (!doc) return [];

    const positioned: Array<{ pos: number; entry: ThreadListEntry }> = findCommentRanges(doc).map(range => ({
      pos: range.from,
      entry: {
        key: `passage:${range.threadId}`,
        pointer: this.pointerFor(range.threadId),
        kind: 'Passage',
        excerpt: range.text,
      },
    }));

    for (const range of findQuoteRanges(doc)) {
      positioned.push({
        pos: range.from,
        entry: {
          key: `quote:${range.quoteId}`,
          pointer: new EntityPointer('quote', range.quoteId),
          kind: 'Quote',
          excerpt: range.text,
        },
      });
    }

    doc.descendants((node, pos) => {
      if (!isReference(node)) return true;
      if (node.attrs.type === 'quote' && node.attrs.id) {
        const quote = getQuoteService().getQuoteById(node.attrs.id);
        positioned.push({
          pos,
          entry: {
            key: `quote:${node.attrs.id}`,
            pointer: new EntityPointer('quote', node.attrs.id),
            kind: 'Quote',
            excerpt: quote?.content.plainText ?? node.attrs.label ?? '',
          },
        });
      }
      return false;
    });

    // A quote can appear both as a marked passage and as a reference.
    const seen = new Set<string>();
    return positioned
      .sort((a, b) => a.pos - b.pos)
      .map(({ entry }) => entry)
      .filter(entry => !seen.has(entry.key) && Boolean(seen.add(entry.key)));
  }

  /** Scrolls what a pointer points at into view, without moving the selection. */
  reveal(pointer: CommentPointer): void {
    const dom = this.context?.editor.view.dom;
    if (!dom) return;
    let target: Element | null = null;
    if (pointer instanceof TextRangePointer) {
      target = dom.querySelector(`mark[data-comment-id="${CSS.escape(pointer.threadId)}"]`);
    } else if (pointer instanceof EntityPointer && pointer.entityType === 'quote') {
      const id = CSS.escape(pointer.entityId);
      target = dom.querySelector(`mark[data-quote-id="${id}"], [data-reference-id="${id}"]`);
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target?.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
}

export function commentingPlugin(config: CommentingPluginConfig): EditorCommentingPlugin {
  const plugin = new EditorCommentingPlugin();
  plugin.configure(config);
  return plugin;
}
