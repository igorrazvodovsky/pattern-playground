import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Editor } from '@tiptap/core';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { undoDepth } from '@tiptap/pm/history';
import type { Slice } from '@tiptap/pm/model';
import type { EditorView } from '@tiptap/pm/view';
import { COMMENT_MARK_NAME, QUOTE_MARK_NAME, findCommentRanges, findQuoteRanges, removeCommentMark } from '../components/commenting/tiptap/comment-mark';
import { COMMENTING_PLUGIN_ID, type EditorCommentingPlugin } from '../components/editor-plugins/commenting/CommentingPlugin';
import { getCommentService } from '../services/commenting/core/comment-service-instance';
import { getQuoteService } from '../services/commenting/quote-service';
import {
  BasicDemo,
  TextLensDemo,
  CommentingDemo,
  DynamicExplanationDemo,
} from '../demos/bubble-menu';

const meta = {
  title: "Components/Bubble menu",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const TextLense: Story = {
  render: () => <TextLensDemo />,
};

export const Commenting: Story = {
  render: () => <CommentingDemo />,
};

export const DynamicExplanation: Story = {
  render: () => <DynamicExplanationDemo />,
};

// Positions of the first occurrence of `text` inside one text node.
function findText(editor: Editor, text: string): { from: number; to: number } {
  let found: { from: number; to: number } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found || !node.isText || !node.text) return;
    const index = node.text.indexOf(text);
    if (index >= 0) found = { from: pos + index, to: pos + index + text.length };
  });
  if (!found) throw new Error(`"${text}" is not in the document`);
  return found;
}

// Tiptap's focus command waits a frame, so wait for focus before typing.
async function selectInEditor(editor: Editor, range: { from: number; to: number }) {
  editor.chain().focus().setTextSelection(range).run();
  await waitFor(() => expect(editor.view.dom).toHaveFocus());
}

const shortcut = () => /Mac|iPhone|iPad/.test(navigator.platform)
  ? '{Meta>}{Shift>}m{/Shift}{/Meta}'
  : '{Control>}{Shift>}m{/Shift}{/Control}';

// Comments on `range` through the shortcut and the popover, then closes the thread.
async function commentOn(editor: Editor, range: { from: number; to: number }, text: string) {
  const page = within(document.body);
  await selectInEditor(editor, range);
  await userEvent.keyboard(shortcut());
  const dialog = await page.findByRole('dialog', { name: 'Comment on selection' });
  await userEvent.click(within(dialog).getByRole('textbox', { name: 'Comment' }));
  await userEvent.keyboard(text);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit comment' }));
  // Submitting leaves the thread open for replies. Escape from the reply
  // box closes it; synthetic keys never reach the platform's light dismiss.
  const thread = await page.findByRole('dialog', { name: 'Comments on passage' });
  await userEvent.click(within(thread).getByRole('textbox', { name: 'Comment' }));
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(page.queryByRole('dialog', { name: /passage|selection/ })).toBeNull());
}

// Commenting leaves the text alone: each comment marks its passage, overlapping
// comments keep their own threads, a draft closed without a comment changes
// nothing, and turning a passage into a quote keeps its words and its thread. Test-only; the Commenting story is the one to try by hand.
export const CommentingMarksPassages: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <CommentingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(document.body);
    const dom = await canvas.findByRole('textbox', { name: 'Document editor' });
    const editor = (dom as HTMLElement & { editor: Editor }).editor;
    await waitFor(() => expect(editor.getText()).toContain('polar bears'));
    await waitFor(() => expect(editor.storage.editorContext?.getPlugin(COMMENTING_PLUGIN_ID)).toBeDefined());
    const originalText = editor.getText();

    const comment = (range: { from: number; to: number }, text: string) => commentOn(editor, range, text);

    const first = findText(editor, 'polar bears');
    const depthBefore = undoDepth(editor.state);
    await comment(first, 'First comment');
    expect(editor.getText()).toBe(originalText);
    // Undo cannot strip the highlight while the thread lives on.
    expect(undoDepth(editor.state)).toBe(depthBefore);
    const [firstRange] = findCommentRanges(editor.state.doc);
    expect(firstRange).toMatchObject({ from: first.from, to: first.to, text: 'polar bears' });

    // Overlaps the end of the first passage.
    const second = { from: first.from + 6, to: first.to + 10 };
    await comment(second, 'Second comment');
    expect(editor.getText()).toBe(originalText);
    const ranges = findCommentRanges(editor.state.doc);
    expect(ranges).toHaveLength(2);
    expect(ranges[0]).toMatchObject({ threadId: firstRange.threadId, from: first.from, to: first.to });
    expect(ranges[1]).toMatchObject(second);
    expect(ranges[1].threadId).not.toBe(firstRange.threadId);

    // Removing one comment leaves the other where it was.
    removeCommentMark(editor, firstRange.threadId);
    expect(findCommentRanges(editor.state.doc)).toEqual([expect.objectContaining(second)]);

    // A draft closed without a comment leaves the document as it was.
    const before = editor.getJSON();
    await selectInEditor(editor, findText(editor, 'alpine plants'));
    await userEvent.keyboard(shortcut());
    const draft = await page.findByRole('dialog', { name: 'Comment on selection' });
    await userEvent.click(within(draft).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog', { name: 'Comment on selection' })).toBeNull());
    expect(editor.getJSON()).toEqual(before);

    // The thread list shows the remaining passage.
    await userEvent.click(canvas.getByRole('button', { name: 'Comments' }));
    const drawer = await page.findByRole('dialog', { name: 'Comments' });
    await waitFor(() => expect(within(drawer).getAllByText(/^Passage:/)).toHaveLength(1));
    // Quotes made earlier keep their threads and are listed beside passages.
    expect(within(drawer).getAllByText(/^Quote:/).length).toBeGreaterThan(0);

    // Clicking a passage reopens its thread.
    await userEvent.click(canvasElement.querySelector('mark[data-comment-id]')!);
    const reopened = await page.findByRole('dialog', { name: 'Comments on passage' });
    expect(within(reopened).getByText('Second comment')).toBeInTheDocument();

    // Turning the passage into a quote keeps its words and its thread.
    await userEvent.click(within(reopened).getByRole('button', { name: 'Turn into quote' }));
    const quoted = await page.findByRole('dialog', { name: 'Comments on quote' });
    expect(within(quoted).getByText('Second comment')).toBeInTheDocument();
    expect(within(quoted).queryByRole('button', { name: 'Turn into quote' })).toBeNull();
    expect(editor.getText()).toBe(originalText);
    expect(findCommentRanges(editor.state.doc)).toEqual([]);
    expect(findQuoteRanges(editor.state.doc)).toEqual([expect.objectContaining(second)]);
    // The quote's own content leaves the source's comment marks behind.
    const [{ quoteId }] = findQuoteRanges(editor.state.doc);
    const quoteContent = JSON.stringify(getQuoteService().getQuoteById(quoteId)?.content.richContent);
    expect(quoteContent).toContain('bears');
    expect(quoteContent).not.toMatch(/"type":"(comment|quote)"/);
    await waitFor(() => expect(within(drawer).queryAllByText(/^Passage:/)).toHaveLength(0));
    const quoteText = editor.state.doc.textBetween(second.from, second.to);
    expect(within(drawer).getByText(new RegExp(`^Quote: “${quoteText}”`))).toBeInTheDocument();

    // Escape closes the thread and leaves the list open.
    await userEvent.click(within(quoted).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog', { name: 'Comments on quote' })).toBeNull());
    expect(page.getByRole('dialog', { name: 'Comments' })).toBeInTheDocument();

    // Clicking the quoted passage reopens the quote's thread.
    await userEvent.click(canvasElement.querySelector('mark[data-quote-id]')!);
    const reopenedQuote = await page.findByRole('dialog', { name: 'Comments on quote' });
    expect(within(reopenedQuote).getByText('Second comment')).toBeInTheDocument();
    await userEvent.click(within(reopenedQuote).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: 'Comments' }));
    await waitFor(() => expect(page.queryByRole('dialog', { name: 'Comments' })).toBeNull());
  },
};

// A passage's mark is its thread's only anchor, so ordinary editing must not
// give a thread a second passage, bring in threads from elsewhere, or start
// one where no mark can go. Test-only.
export const CommentingKeepsAnchorsUnique: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <CommentingDemo />,
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const dom = await within(canvasElement).findByRole('textbox', { name: 'Document editor' });
    const editor = (dom as HTMLElement & { editor: Editor }).editor;
    await waitFor(() => expect(editor.getText()).toContain('polar bears'));
    await waitFor(() => expect(editor.storage.editorContext?.getPlugin(COMMENTING_PLUGIN_ID)).toBeDefined());
    // Loading the document is not an edit, so undo cannot reload it over the marks.
    expect(undoDepth(editor.state)).toBe(0);

    await selectInEditor(editor, findText(editor, 'polar bears'));
    await userEvent.keyboard(shortcut());
    const draft = await page.findByRole('dialog', { name: 'Comment on selection' });
    await userEvent.click(within(draft).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('Anchor');
    await userEvent.click(within(draft).getByRole('button', { name: 'Submit comment' }));
    const thread = await page.findByRole('dialog', { name: 'Comments on passage' });
    await userEvent.click(within(thread).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog', { name: /passage/ })).toBeNull());
    const [{ threadId }] = findCommentRanges(editor.state.doc);

    const pasteAfter = async (text: string, html: string) => {
      const target = findText(editor, text);
      await selectInEditor(editor, { from: target.to, to: target.to });
      editor.view.pasteHTML(html);
    };

    // A pasted copy keeps its words but not the thread.
    await selectInEditor(editor, findText(editor, 'polar bears'));
    const copied = (await userEvent.copy())!.getData('text/html');
    expect(copied).toContain(`data-comment-id="${threadId}"`);
    await pasteAfter('alpine plants', copied);
    expect(editor.getText().split('polar bears')).toHaveLength(3);
    expect(findCommentRanges(editor.state.doc)).toEqual([expect.objectContaining({ threadId, text: 'polar bears' })]);

    // A thread from another document stays behind.
    await pasteAfter('alpine plants', '<p><mark data-comment-id="thread-elsewhere">borrowed</mark></p>');
    expect(editor.getText()).toContain('borrowed');
    expect(findCommentRanges(editor.state.doc).map(r => r.threadId)).toEqual([threadId]);

    // Cutting and pasting moves the passage with its thread.
    await selectInEditor(editor, findText(editor, 'polar bears'));
    const cut = (await userEvent.cut())!.getData('text/html');
    expect(findCommentRanges(editor.state.doc)).toEqual([]);
    await pasteAfter('borrowed', cut);
    expect(findCommentRanges(editor.state.doc)).toEqual([expect.objectContaining({ threadId, text: 'polar bears' })]);

    // Dragging moves the passage too, and the original goes after the drop;
    // a copying drag leaves the thread with the original.
    const view = editor.view as EditorView & { dragging: { slice: Slice; move: boolean } | null };
    const range = findCommentRanges(editor.state.doc)[0];
    const slice = editor.state.doc.slice(range.from, range.to);
    const transform = () => {
      let result = slice;
      view.someProp('transformPasted', f => { result = f(result, view, false); });
      return JSON.stringify(result.toJSON());
    };
    view.dragging = { slice, move: true };
    expect(transform()).toContain(threadId);
    view.dragging = { slice, move: false };
    expect(transform()).not.toContain(threadId);
    view.dragging = null;

    // Code blocks take no marks, so commenting there starts nothing.
    editor.chain().setTextSelection(findText(editor, 'alpine plants').from + 1).toggleCodeBlock().run();
    await selectInEditor(editor, findText(editor, 'alpine plants'));
    await userEvent.keyboard(shortcut());
    await new Promise(resolve => setTimeout(resolve, 200));
    expect(page.queryByRole('dialog', { name: 'Comment on selection' })).toBeNull();
    expect(page.queryByRole('button', { name: 'Comment' })).toBeNull();
  },
};

// Ids of the threads whose marks sit on any node, text or not.
function markedIds(editor: Editor, markName: string, idAttr: string): string[] {
  const ids = new Set<string>();
  editor.state.doc.descendants(node => {
    for (const mark of node.marks) if (mark.type.name === markName) ids.add(mark.attrs[idAttr]);
  });
  return [...ids];
}

// Edits around a thread keep it reachable or close it: a draft whose passage
// is deleted closes, a passage around a reference moves whole, a split
// passage quotes only its own words, and a quote step that fails leaves the
// passage with its thread. Test-only.
export const CommentingSurvivesEdits: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <CommentingDemo />,
  play: async ({ canvasElement }) => {
    const page = within(document.body);
    const dom = await within(canvasElement).findByRole('textbox', { name: 'Document editor' });
    const editor = (dom as HTMLElement & { editor: Editor }).editor;
    await waitFor(() => expect(editor.getText()).toContain('polar bears'));
    await waitFor(() => expect(editor.storage.editorContext?.getPlugin(COMMENTING_PLUGIN_ID)).toBeDefined());
    const plugin = editor.storage.editorContext!.getPlugin(COMMENTING_PLUGIN_ID) as EditorCommentingPlugin;
    const comments = getCommentService();

    // A draft whose passage is deleted closes, and nothing is marked.
    await selectInEditor(editor, findText(editor, 'alpine plants'));
    await userEvent.keyboard(shortcut());
    await page.findByRole('dialog', { name: 'Comment on selection' });
    editor.commands.deleteRange(findText(editor, 'alpine plants'));
    await waitFor(() => expect(page.queryByRole('dialog', { name: 'Comment on selection' })).toBeNull());
    expect(findCommentRanges(editor.state.doc)).toEqual([]);

    // A passage around a reference marks the reference too, and both leave
    // the passage together.
    let reference: { pos: number; size: number } | null = null;
    editor.state.doc.descendants((node, pos) => {
      if (!reference && node.type.name === 'reference') reference = { pos, size: node.nodeSize };
    });
    const { pos, size } = reference!;
    const $pos = editor.state.doc.resolve(pos);
    const around = { from: Math.max($pos.start(), pos - 6), to: Math.min($pos.end(), pos + size + 6) };
    await commentOn(editor, around, 'Around a reference');
    const [aroundRange] = findCommentRanges(editor.state.doc);
    expect(aroundRange).toMatchObject(around);
    expect(editor.state.doc.nodeAt(pos)!.marks.map(m => m.type.name)).toContain(COMMENT_MARK_NAME);
    removeCommentMark(editor, aroundRange.threadId);
    expect(markedIds(editor, COMMENT_MARK_NAME, 'commentId')).toEqual([]);

    await commentOn(editor, around, 'Quote around a reference');
    const [{ threadId: aroundThread }] = findCommentRanges(editor.state.doc);
    const aroundQuote = await plugin.quoteThread(aroundThread);
    expect(markedIds(editor, COMMENT_MARK_NAME, 'commentId')).toEqual([]);
    expect(editor.state.doc.nodeAt(pos)!.marks.map(m => m.attrs.quoteId)).toContain(aroundQuote!.id);
    expect(canvasElement.querySelector('mark[data-comment-id]')).toBeNull();
    await userEvent.click(within(await page.findByRole('dialog', { name: 'Comments on quote' })).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog', { name: /quote/ })).toBeNull());

    // Text that lands between a passage's pieces stays out of its quote.
    const bears = findText(editor, 'polar bears');
    await commentOn(editor, bears, 'Split me');
    const split = findCommentRanges(editor.state.doc).find(r => r.text === 'polar bears')!;
    editor.view.dispatch(editor.state.tr.insert(bears.from + 'polar '.length, editor.schema.text('white ')));
    expect(editor.getText()).toContain('polar white bears');
    const splitQuote = await plugin.quoteThread(split.threadId);
    const stored = getQuoteService().getQuoteById(splitQuote!.id)!;
    expect(stored.content.plainText).toBe('polar bears');
    expect(JSON.stringify(stored.content.richContent)).not.toContain('white');
    await userEvent.click(within(await page.findByRole('dialog', { name: 'Comments on quote' })).getByRole('textbox', { name: 'Comment' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog', { name: /quote/ })).toBeNull());

    // With the thread list open, an edit inside a passage updates its entry.
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Comments' }));
    const drawer = await page.findByRole('dialog', { name: 'Comments' });
    const leopards = findText(editor, 'snow leopards');
    await commentOn(editor, leopards, 'Fails to quote');
    await waitFor(() => expect(within(drawer).getByText(/^Passage: “snow leopards”/)).toBeInTheDocument());
    editor.view.dispatch(editor.state.tr.insertText('X', leopards.from + 2));
    await waitFor(() => expect(within(drawer).getByText(/^Passage: “snXow leopards”/)).toBeInTheDocument());
    editor.view.dispatch(editor.state.tr.delete(leopards.from + 2, leopards.from + 3));
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'Comments' }));
    await waitFor(() => expect(page.queryByRole('dialog', { name: 'Comments' })).toBeNull());

    // A quote step whose thread fails to move leaves the passage with its
    // thread, and no quote behind.
    const failing = findCommentRanges(editor.state.doc).find(r => r.text === 'snow leopards')!;
    const quotesBefore = getQuoteService().getAllQuotes().length;
    const quoteMarksBefore = markedIds(editor, QUOTE_MARK_NAME, 'quoteId');
    const reanchor = comments.reanchor;
    comments.reanchor = () => Promise.reject(new Error('Storage unavailable'));
    const consoleError = console.error;
    console.error = () => {};
    try {
      await userEvent.click(canvasElement.querySelector(`mark[data-comment-id="${failing.threadId}"]`)!);
      const open = await page.findByRole('dialog', { name: 'Comments on passage' });
      await userEvent.click(within(open).getByRole('button', { name: 'Turn into quote' }));
      await waitFor(() => expect(markedIds(editor, COMMENT_MARK_NAME, 'commentId')).toContain(failing.threadId));
    } finally {
      comments.reanchor = reanchor;
      console.error = consoleError;
    }
    expect(getQuoteService().getAllQuotes()).toHaveLength(quotesBefore);
    expect(markedIds(editor, QUOTE_MARK_NAME, 'quoteId')).toEqual(quoteMarksBefore);
    expect(within(page.getByRole('dialog', { name: 'Comments on passage' })).getByText('Fails to quote')).toBeInTheDocument();
  },
};
