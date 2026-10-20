import type { MentionPart } from '../../catalog/registries/mention-editor';

// How a reference category's items become mentions, and how the @ list
// matches them against what was typed after the @.

export const maxMentionMatches = 8;

export const toMention = (item: { id: string; name: string; type: string }): MentionPart => ({
  id: item.id,
  label: item.name,
  type: item.type,
});

export const mentionQuery = (query: unknown) =>
  typeof query === 'string' ? query.trim().toLocaleLowerCase() : '';

export const matchesQuery = (query: string) => (mention: MentionPart) =>
  mention.label.toLocaleLowerCase().includes(query);
