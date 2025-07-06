import { createMentionSuggestion } from '../../../services/mention-suggestion-service';
import users from './mockUsers.json' with { type: 'json' };

export const mentionSuggestion = createMentionSuggestion({
  items: ({ query }: { query: string }) => {
    return users.filter(user => user.name.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5);
  },
  renderItem: (item, listItem) => {
    listItem.textContent = item.name;
  },
  onCommand: (item) => ({
    id: item.id,
    label: item.name
  })
});