import { describe, expect, it } from 'vitest';
import { Extension, flattenExtensions } from '@tiptap/core';
import Bold from '@tiptap/extension-bold';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { mergePluginExtensions } from './usePluginEditor';
import { formattingPlugin } from '../editor-plugins/formatting/FormattingPlugin';
import { commentingPlugin } from '../editor-plugins/commenting/CommentingPlugin';

const names = (extensions: Parameters<typeof flattenExtensions>[0]) =>
  flattenExtensions(extensions).map((extension) => extension.name);

describe('mergePluginExtensions', () => {
  it('installs the extensions a plugin returns', () => {
    const merged = mergePluginExtensions(
      [StarterKit],
      [commentingPlugin({ documentId: 'doc', currentUser: 'user-1' })],
    );
    expect(names(merged)).toEqual(expect.arrayContaining(['commenting', 'comment', 'quote']));
  });

  it('keeps the host copy when a plugin offers an extension the host already has', () => {
    const merged = mergePluginExtensions([StarterKit, Highlight], [formattingPlugin()]);
    const all = names(merged);
    expect(all).toEqual([...new Set(all)]);
    expect(merged).toContain(Highlight);
  });

  it('installs an extension two plugins both offer once', () => {
    const merged = mergePluginExtensions(
      [StarterKit],
      [
        commentingPlugin({ documentId: 'a', currentUser: 'user-1' }),
        commentingPlugin({ documentId: 'b', currentUser: 'user-1' }),
      ],
    );
    expect(names(merged).filter((name) => name === 'commenting')).toHaveLength(1);
  });

  it('skips a kit whose children the host already has', () => {
    const kit = Extension.create({ name: 'kit', addExtensions: () => [Bold] });
    const plugin = { ...formattingPlugin(), id: 'kit', getExtensions: () => [kit] };
    const all = names(mergePluginExtensions([StarterKit], [plugin]));
    expect(all).toEqual([...new Set(all)]);
    expect(all).not.toContain('kit');
  });
});
