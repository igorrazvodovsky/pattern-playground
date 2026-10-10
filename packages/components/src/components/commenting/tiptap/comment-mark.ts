import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import { Fragment, Slice } from '@tiptap/pm/model';
import type { Node as ProseMirrorNode, Mark as ProseMirrorMark, MarkType } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { EditorState, Transaction } from '@tiptap/pm/state';
import { AddMarkStep, ReplaceAroundStep, ReplaceStep } from '@tiptap/pm/transform';

export const COMMENT_MARK_NAME = 'comment';
export const QUOTE_MARK_NAME = 'quote';

// The id attribute each anchor mark holds. A comment or quote mark is the
// only anchor its thread has.
const ANCHOR_IDS: Record<string, string> = { [COMMENT_MARK_NAME]: 'commentId', [QUOTE_MARK_NAME]: 'quoteId' };

// A mark that anchors a thread to a passage without changing its text. It
// renders as `mark` with its id in `dataAttr`.
//
// Anchors may overlap, so the mark does not exclude itself, and every edit
// goes through the transaction with the one thread's mark: Tiptap's setMark
// merges attributes into a mark of the same type already in the range, and
// unsetMark removes all of them.
function anchorMark(name: string, dataAttr: string) {
  const idAttr = ANCHOR_IDS[name];
  return Mark.create({
    name,

    excludes: '',

    // Text typed at the edge of an anchored passage is not part of it.
    inclusive: false,

    addAttributes() {
      return {
        [idAttr]: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute(dataAttr),
          renderHTML: (attributes: Record<string, unknown>) => attributes[idAttr]
            ? { [dataAttr]: attributes[idAttr] }
            : {},
        },
      };
    },

    parseHTML() {
      // Ahead of Highlight, which also parses `mark`.
      return [{ tag: `mark[${dataAttr}]`, priority: 60 }];
    },

    renderHTML({ HTMLAttributes }) {
      return ['mark', mergeAttributes(HTMLAttributes), 0];
    },
  });
}

// Highlights a commented passage. The mark carries the thread id; the thread
// itself lives in the comment service under a TextRangePointer for that id.
export const CommentMark = anchorMark(COMMENT_MARK_NAME, 'data-comment-id').extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      resolved: {
        default: false,
        parseHTML: element => element.getAttribute('data-resolved') === 'true',
        renderHTML: attributes => attributes.resolved
          ? { 'data-resolved': 'true' }
          : {},
      },
    };
  },

  parseHTML() {
    return [...(this.parent?.() ?? []), { tag: 'span[data-comment-id]' }];
  },
});

// Marks a passage that was turned into a quote: a standalone object other
// documents can refer to. The words stay where they are; the mark links them
// to the quote, whose thread carries on the passage's comments.
export const QuoteMark = anchorMark(QUOTE_MARK_NAME, 'data-quote-id');

function commentMarkType(editor: Editor): MarkType | null {
  return editor.schema.marks[COMMENT_MARK_NAME] ?? null;
}

/**
 * Whether a comment can anchor anywhere in `from`–`to`. Some blocks, such as
 * code blocks, take no marks, and a thread started there would have nothing
 * to point at.
 */
export function canComment(state: EditorState, from: number, to: number): boolean {
  const type = state.schema.marks[COMMENT_MARK_NAME];
  if (!type || from >= to) return false;
  let applies = false;
  state.doc.nodesBetween(from, to, (node, _pos, parent) => {
    if (applies) return false;
    if (node.isInline && parent?.type.allowsMarkType(type)) applies = true;
  });
  return applies;
}

// Pasting must not give one thread a second passage, nor bring in threads
// from elsewhere.
function anchorKey(mark: ProseMirrorMark): string | null {
  const attr = ANCHOR_IDS[mark.type.name];
  const id = attr ? mark.attrs[attr] : null;
  return id ? `${mark.type.name}:${id}` : null;
}

function collectAnchors(content: ProseMirrorNode | Fragment, into = new Set<string>(), from?: number, to?: number): Set<string> {
  const visit = (node: ProseMirrorNode) => {
    for (const mark of node.marks) {
      const key = anchorKey(mark);
      if (key) into.add(key);
    }
  };
  if (from !== undefined && to !== undefined && 'nodesBetween' in content) {
    content.nodesBetween(from, to, visit);
  } else {
    content.descendants(visit);
  }
  return into;
}

function stripAnchors(fragment: Fragment, drop: (key: string) => boolean): Fragment {
  const nodes: ProseMirrorNode[] = [];
  fragment.forEach(node => {
    const marks = node.marks.filter(mark => {
      const key = anchorKey(mark);
      return !key || !drop(key);
    });
    const copy = node.isText ? node : node.copy(stripAnchors(node.content, drop));
    nodes.push(copy.mark(marks));
  });
  return Fragment.from(nodes);
}

// Every anchor this editor has held. A pasted anchor outside this set came
// from another document.
const anchorsKey = new PluginKey<Set<string>>('commenting-anchors');

function addChangedAnchors(known: Set<string>, tr: Transaction): Set<string> {
  let next = known;
  tr.steps.forEach((step, index) => {
    const rest = tr.mapping.slice(index + 1);
    const ranges: [number, number][] = [];
    if (step instanceof AddMarkStep) ranges.push([step.from, step.to]);
    step.getMap().forEach((_oldStart, _oldEnd, newStart, newEnd) => ranges.push([newStart, newEnd]));
    for (const [start, end] of ranges) {
      const from = rest.map(start, -1);
      const to = rest.map(end, 1);
      if (from >= to) continue;
      const found = collectAnchors(tr.doc, new Set(), from, to);
      for (const key of found) {
        if (next.has(key)) continue;
        if (next === known) next = new Set(known);
        next.add(key);
      }
    }
  });
  return next;
}

const anchorPastePlugin = () => new Plugin<Set<string>>({
  key: anchorsKey,
  state: {
    init: (_, state) => collectAnchors(state.doc),
    apply: (tr, known) => tr.docChanged ? addChangedAnchors(known, tr) : known,
  },
  props: {
    // Runs for paste and for drag-and-drop. Cutting removes the original
    // before the paste, and a moving drag removes it after the drop, so
    // neither leaves the thread with two passages.
    transformPasted(slice, view) {
      const known = anchorsKey.getState(view.state) ?? new Set<string>();
      const present = collectAnchors(view.state.doc);
      const moving = view.dragging?.move ? collectAnchors(view.dragging.slice.content) : new Set<string>();
      const drop = (key: string) => !known.has(key) || (present.has(key) && !moving.has(key));
      return new Slice(stripAnchors(slice.content, drop), slice.openStart, slice.openEnd);
    },
  },
});

// Comment and quote marks stay out of undo history. Their threads live in the
// comment service, which undo does not reach, so undoing a mark alone would
// leave a thread with nothing to point at.

/** Marks `from`–`to` as commented by `threadId`, beside any other comments there. */
export function addCommentMark(editor: Editor, threadId: string, from: number, to: number): boolean {
  const type = commentMarkType(editor);
  if (!type || from >= to) return false;
  const tr = editor.state.tr.addMark(from, to, type.create({ commentId: threadId }));
  editor.view.dispatch(tr.setMeta('addToHistory', false));
  return true;
}

/** Removes one thread's mark wherever it is, leaving other comments in place. */
export function removeCommentMark(editor: Editor, threadId: string): boolean {
  const type = commentMarkType(editor);
  if (!type) return false;
  const { tr } = editor.state;
  editor.state.doc.descendants((node, pos) => {
    if (!node.isInline) return;
    for (const mark of node.marks) {
      if (mark.type === type && mark.attrs.commentId === threadId) {
        tr.removeMark(pos, pos + node.nodeSize, mark);
      }
    }
  });
  if (!tr.docChanged) return false;
  editor.view.dispatch(tr.setMeta('addToHistory', false));
  return true;
}

interface MarkedPassage {
  id: string;
  /** Start of the first marked piece. */
  from: number;
  /** End of the last marked piece. Edits can split a passage; this spans the pieces. */
  to: number;
  /** Each contiguous marked run, in document order. */
  pieces: Array<{ from: number; to: number }>;
  text: string;
  attrs: Record<string, unknown>;
}

// Documents are immutable, so a document's passages are found once. The
// popover measures its passage on every reposition, and the thread list
// rebuilds after edits.
const passageCache = new WeakMap<ProseMirrorNode, Map<string, readonly MarkedPassage[]>>();

// Every passage carrying an anchor mark of `markName`, grouped by its id, in
// document order. Inline nodes other than text, such as references, take
// marks too, and count as part of the passage.
function findMarkedPassages(doc: ProseMirrorNode, markName: string): readonly MarkedPassage[] {
  const idAttr = ANCHOR_IDS[markName];
  const cached = passageCache.get(doc)?.get(markName);
  if (cached) return cached;

  const passages = new Map<string, MarkedPassage>();
  doc.descendants((node, pos) => {
    if (!node.isInline) return;
    const text = node.isText ? node.text ?? '' : node.type.spec.leafText?.(node) ?? '';
    for (const mark of node.marks) {
      if (mark.type.name !== markName || !mark.attrs[idAttr]) continue;
      const id = mark.attrs[idAttr] as string;
      const end = pos + node.nodeSize;
      const passage = passages.get(id);
      if (!passage) {
        passages.set(id, { id, from: pos, to: end, pieces: [{ from: pos, to: end }], text, attrs: mark.attrs });
        continue;
      }
      const last = passage.pieces[passage.pieces.length - 1];
      if (last.to === pos) {
        last.to = end;
        passage.text += text;
      } else {
        passage.pieces.push({ from: pos, to: end });
        passage.text += ` ${text}`;
      }
      passage.to = end;
    }
  });

  const found = [...passages.values()];
  if (!passageCache.has(doc)) passageCache.set(doc, new Map());
  passageCache.get(doc)!.set(markName, found);
  return found;
}

export interface CommentRange {
  threadId: string;
  /** Start of the first marked piece. */
  from: number;
  /** End of the last marked piece. Edits can split a passage; this spans the pieces. */
  to: number;
  text: string;
  resolved: boolean;
}

/** Every commented passage in the document, in document order. */
export function findCommentRanges(doc: ProseMirrorNode): CommentRange[] {
  return findMarkedPassages(doc, COMMENT_MARK_NAME).map(passage => ({
    threadId: passage.id,
    from: passage.from,
    to: passage.to,
    text: passage.text,
    resolved: Boolean(passage.attrs.resolved),
  }));
}

export interface QuoteRange {
  quoteId: string;
  from: number;
  to: number;
  text: string;
}

/** Every passage turned into a quote, in document order. */
export function findQuoteRanges(doc: ProseMirrorNode): QuoteRange[] {
  return findMarkedPassages(doc, QUOTE_MARK_NAME).map(passage => ({
    quoteId: passage.id,
    from: passage.from,
    to: passage.to,
    text: passage.text,
  }));
}

// Keeps the inline content that carries `mark`, and the blocks around it.
// Text that was typed or pasted between a passage's pieces is left out.
function keepMarked(fragment: Fragment, mark: ProseMirrorMark): Fragment {
  const nodes: ProseMirrorNode[] = [];
  fragment.forEach(node => {
    if (node.isInline) {
      if (mark.isInSet(node.marks)) nodes.push(node);
      return;
    }
    const content = keepMarked(node.content, mark);
    if (content.size > 0) nodes.push(node.copy(content));
  });
  return Fragment.from(nodes);
}

/**
 * The words of a commented passage, without anything that came to sit between
 * its pieces, for turning the passage into a quote.
 */
export function commentedSlice(doc: ProseMirrorNode, threadId: string): { slice: Slice; from: number; to: number } | null {
  const passage = findMarkedPassages(doc, COMMENT_MARK_NAME).find(p => p.id === threadId);
  const type = doc.type.schema.marks[COMMENT_MARK_NAME];
  if (!passage || !type) return null;
  const slice = doc.slice(passage.from, passage.to);
  const content = keepMarked(slice.content, type.create(passage.attrs));
  return { slice: new Slice(content, slice.openStart, slice.openEnd), from: passage.from, to: passage.to };
}

// Swaps one passage's anchor mark for another over the same words.
function swapAnchorMark(editor: Editor, markName: string, id: string, replacement: ProseMirrorMark): boolean {
  const type = editor.schema.marks[markName];
  const passage = type && findMarkedPassages(editor.state.doc, markName).find(p => p.id === id);
  if (!passage) return false;

  const { tr } = editor.state;
  const current = type.create(passage.attrs);
  for (const piece of passage.pieces) {
    tr.removeMark(piece.from, piece.to, current);
    tr.addMark(piece.from, piece.to, replacement);
  }
  editor.view.dispatch(tr.setMeta('addToHistory', false));
  return true;
}

/**
 * Turns a commented passage's highlight into a quote marker over the same
 * words. Other comments on the passage keep their own marks.
 */
export function quoteCommentedPassage(editor: Editor, threadId: string, quoteId: string): boolean {
  const quoteType = editor.schema.marks[QUOTE_MARK_NAME];
  if (!quoteType) return false;
  return swapAnchorMark(editor, COMMENT_MARK_NAME, threadId, quoteType.create({ quoteId }));
}

/** Turns a quoted passage back into a commented one, for when quoting fails part-way. */
export function unquotePassage(editor: Editor, quoteId: string, threadId: string): boolean {
  const commentType = commentMarkType(editor);
  if (!commentType) return false;
  return swapAnchorMark(editor, QUOTE_MARK_NAME, quoteId, commentType.create({ commentId: threadId }));
}

/**
 * Whether a transaction may have changed a commented or quoted passage, or a
 * node `alsoWatch` picks out. Typing away from every passage changes none.
 */
export function touchesAnchors(tr: Transaction, alsoWatch?: (node: ProseMirrorNode) => boolean): boolean {
  const watched = (node: ProseMirrorNode) => node.marks.some(mark => anchorKey(mark) !== null) || Boolean(alsoWatch?.(node));
  const contains = (doc: ProseMirrorNode, start: number, end: number) => {
    // One position either side, so text added at a passage's edge counts.
    const from = Math.max(0, start - 1);
    const to = Math.min(doc.content.size, end + 1);
    let found = false;
    doc.nodesBetween(from, to, node => {
      if (found) return false;
      if (watched(node)) found = true;
    });
    return found;
  };

  return tr.steps.some((step, index) => {
    // Mark and attribute steps are rare; take them as changes.
    if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) return true;
    const before = tr.docs[index];
    const after = tr.docs[index + 1] ?? tr.doc;
    let touched = false;
    step.getMap().forEach((oldStart, oldEnd, newStart, newEnd) => {
      touched ||= contains(before, oldStart, oldEnd) || contains(after, newStart, newEnd);
    });
    return touched;
  });
}

export interface CommentingOptions {
  /** Runs on Mod-Shift-M while text is selected. */
  onComment: ((editor: Editor) => void) | null;
}

// The editor side of commenting: the comment and quote marks, and the one shortcut for
// commenting on the selection. Hosts add this to the editor's extensions.
// With no `onComment`, the shortcut asks a commenting plugin over the editor's
// plugin event bus.
export const Commenting = Extension.create<CommentingOptions>({
  name: 'commenting',

  addOptions() {
    return { onComment: null };
  },

  addExtensions() {
    return [CommentMark, QuoteMark];
  },

  addProseMirrorPlugins() {
    return [anchorPastePlugin()];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-m': () => {
        const { from, to, empty } = this.editor.state.selection;
        if (empty || !canComment(this.editor.state, from, to)) return false;
        if (this.options.onComment) {
          this.options.onComment(this.editor);
          return true;
        }
        const eventBus = this.editor.storage.editorContext?.eventBus;
        if (!eventBus) return false;
        eventBus.emit('command:execute', { command: 'commenting:create-comment', params: {} });
        return true;
      },
    };
  },
});
