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

describe('CommentService threads', () => {
  beforeEach(installLocalStorage);
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  function countWrites(run: () => Promise<unknown>): Promise<number> {
    const setItem = globalThis.localStorage.setItem;
    let writes = 0;
    globalThis.localStorage.setItem = (key, value) => { writes += 1; setItem(key, value); };
    return run().then(() => writes).finally(() => { globalThis.localStorage.setItem = setItem; });
  }

  it('deletes a whole thread in one write, leaving other threads', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const doomed = new TextRangePointer('doc-1', 'thread-1');
    const kept = new TextRangePointer('doc-1', 'thread-2');
    for (const content of ['One', 'Two']) await service.createComment(doomed, content, 'user-1');
    await service.createComment(kept, 'Stays', 'user-1');

    const writes = await countWrites(() => service.deleteThread(doomed));

    expect(writes).toBe(1);
    expect(await service.getComments(doomed)).toEqual([]);
    const reloaded = new CommentService(new LocalCommentStorage('test'));
    expect(await reloaded.getComments(doomed)).toEqual([]);
    expect((await reloaded.getComments(kept)).map(c => c.content)).toEqual(['Stays']);
  });

  it('resolves and reopens a thread in one write each', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const passage = new TextRangePointer('doc-1', 'thread-1');
    for (const content of ['One', 'Two']) await service.createComment(passage, content, 'user-1');

    expect(await countWrites(() => service.resolveThread(passage))).toBe(1);
    expect((await service.getThread(passage))?.resolved).toBe(true);

    expect(await countWrites(() => service.unresolveThread(passage))).toBe(1);
    expect((await service.getThread(passage))?.resolved).toBe(false);
  });

  it('treats a restored pointer as equal to a new one for the same thing', async () => {
    const passage = new TextRangePointer('doc-1', 'thread-1');
    await new CommentService(new LocalCommentStorage('test')).createComment(passage, 'Kept', 'user-1');

    const [restored] = await new CommentService(new LocalCommentStorage('test')).getComments(passage);

    expect(restored.pointer.equals(passage)).toBe(true);
    expect(passage.equals(restored.pointer)).toBe(true);
    expect(restored.pointer.equals(new TextRangePointer('doc-1', 'thread-2'))).toBe(false);
    expect(new EntityPointer('quote', 'a').equals(new EntityPointer('quote', 'a'))).toBe(true);
  });

  it('tells every change subscriber about each change, and stops after unsubscribing', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const passage = new TextRangePointer('doc-1', 'thread-1');
    let changes = 0;
    const unsubscribe = service.onChange(() => { changes += 1; });

    const comment = await service.createComment(passage, 'One', 'user-1');
    await service.updateComment(comment.id, 'Edited');
    await service.reanchor(passage, new EntityPointer('quote', 'quote-1'));
    unsubscribe();
    await service.createComment(passage, 'Unheard', 'user-1');

    expect(changes).toBe(3);
  });
});

describe('CommentService.onChange for one pointer', () => {
  beforeEach(installLocalStorage);
  afterEach(() => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
  });

  it('runs only for changes to that pointer, including moves to and from it', async () => {
    const service = new CommentService(new LocalCommentStorage('test'));
    const watched = new TextRangePointer('doc-1', 'thread-1');
    const other = new TextRangePointer('doc-1', 'thread-2');
    const quote = new EntityPointer('quote', 'quote-1');
    let changes = 0;
    service.onChange(() => { changes += 1; }, watched);

    const elsewhere = await service.createComment(other, 'Elsewhere', 'user-1');
    await service.updateComment(elsewhere.id, 'Still elsewhere');
    await service.deleteComment(elsewhere.id);
    expect(changes).toBe(0);

    const mine = await service.createComment(watched, 'Mine', 'user-1');
    await service.updateComment(mine.id, 'Edited');
    await service.reanchor(watched, quote);
    await service.reanchor(quote, watched);
    await service.deleteComment(mine.id);
    await service.clearAll();
    expect(changes).toBe(6);
  });
});
