import React, { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';
import type { Transaction } from '@tiptap/pm/state';
import { ThreadList, type ThreadListEntry } from '../../../commenting/core/ThreadList';
import type { EditorCommentingPlugin } from '../CommentingPlugin';

interface CommentsPanelProps {
  editor: Editor;
  plugin: EditorCommentingPlugin;
  currentUser: string;
}

function entriesKey(entries: ThreadListEntry[]): string {
  return entries.map(entry => `${entry.key}\u0000${entry.excerpt}`).join('\u0001');
}

// The editor's threads in the shared thread list. Renders in a drawer, which
// is its own React root, so it follows the editor itself rather than
// re-rendering with the editor's host. Edits away from every thread leave the
// list as it is.
export const CommentsPanel: React.FC<CommentsPanelProps> = ({ editor, plugin, currentUser }) => {
  const [entries, setEntries] = useState(() => plugin.getThreadEntries());

  useEffect(() => {
    const refresh = () => {
      const next = plugin.getThreadEntries();
      setEntries(current => entriesKey(current) === entriesKey(next) ? current : next);
    };
    const onUpdate = ({ transaction }: { transaction: Transaction }) => {
      if (plugin.affectsThreadEntries(transaction)) refresh();
    };
    refresh();
    editor.on('update', onUpdate);
    return () => {
      editor.off('update', onUpdate);
    };
  }, [editor, plugin]);

  return (
    <ThreadList
      entries={entries}
      currentUser={currentUser}
      onSelect={(entry) => plugin.reveal(entry.pointer)}
    />
  );
};
