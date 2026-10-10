import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CommentService } from './comment-service.js';
import { LocalCommentStorage } from './local-comment-storage.js';
import { EntityPointer } from './entity-pointer.js';
import { TextRangePointer } from './text-range-pointer.js';

// Node has no localStorage; a Map-backed stand-in lets the storage persist
// and reload the way it does in the browser.
function installLocalStorage() {
  const items = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
    clear: () => items.clear(),
    key: (index: number) => [...items.keys()][index] ?? null,
    get length() { return items.size; },
  } as Storage;
}

describe('CommentService.reanchor', () => {
  beforeEach(installLocalStorage);
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it('moves every comment in a thread to the new pointer', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const passage = new TextRangePointer('doc-1', 'thread-1');
    const quote = new EntityPointer('quote', 'quote-1');
    await service.createComment(passage, 'First', 'user-1');
    await service.createComment(passage, 'Second', 'user-2');

    const moved = await service.reanchor(passage, quote);

    expect(moved).toHaveLength(2);
    expect(await service.getComments(passage)).toEqual([]);
    expect((await service.getComments(quote)).map(c => c.content)).toEqual(['First', 'Second']);
  });

  it('moves comments restored from storage, whose pointers were saved as plain data', async () => {
    const passage = new TextRangePointer('doc-1', 'thread-1');
    const quote = new EntityPointer('quote', 'quote-1');
    await new CommentService(new LocalCommentStorage('test')).createComment(passage, 'Kept', 'user-1');

    const reloaded = new CommentService(new LocalCommentStorage('test'));
    await reloaded.reanchor(passage, quote);

    expect(await reloaded.getComments(passage)).toEqual([]);
    expect((await reloaded.getComments(quote)).map(c => c.content)).toEqual(['Kept']);
  });

  it('leaves other threads alone', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const moving = new TextRangePointer('doc-1', 'thread-1');
    const staying = new TextRangePointer('doc-1', 'thread-2');
    await service.createComment(moving, 'Moves', 'user-1');
    await service.createComment(staying, 'Stays', 'user-1');

    await service.reanchor(moving, new EntityPointer('quote', 'quote-1'));

    expect((await service.getComments(staying)).map(c => c.content)).toEqual(['Stays']);
  });

  it('moves a thread in one write, and the move survives a reload', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const passage = new TextRangePointer('doc-1', 'thread-1');
    const quote = new EntityPointer('quote', 'quote-1');
    for (const content of ['One', 'Two', 'Three']) await service.createComment(passage, content, 'user-1');

    const setItem = globalThis.localStorage.setItem;
    let writes = 0;
    globalThis.localStorage.setItem = (key, value) => { writes += 1; setItem(key, value); };
    await service.reanchor(passage, quote);
    globalThis.localStorage.setItem = setItem;

    expect(writes).toBe(1);
    const reloaded = new CommentService(new LocalCommentStorage('test'));
    expect(await reloaded.getComments(passage)).toEqual([]);
    expect((await reloaded.getComments(quote)).map(c => c.content).sort()).toEqual(['One', 'Three', 'Two']);
  });
});
