import type { Editor, Range } from '@tiptap/core';

/** A command offered when the actor types a slash at the caret. */
export interface SlashCommand {
  id: string;
  label: string;
  icon: string;
  /** Extra words the typed query matches besides the label. */
  keywords?: string[];
  /** Runs the command; `range` covers the slash and the query typed after it. */
  run: (editor: Editor, range: Range) => void;
}
