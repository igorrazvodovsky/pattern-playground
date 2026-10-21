import type { MentionPart } from '../../../catalog/behaviour/mention-editor';

// How a reference category's items become mentions, and how a list matches
// its candidates against what was typed after the @ or /.

export const maxMentionMatches = 8;

export const toMention = (item: { id: string; name: string; type: string }): MentionPart => ({
  id: item.id,
  label: item.name,
  type: item.type,
});

export const mentionQuery = (query: unknown) =>
  typeof query === 'string' ? query.trim().toLocaleLowerCase() : '';

export const matchesQuery = (query: string) => (candidate: { label: string }) =>
  candidate.label.toLocaleLowerCase().includes(query);
