import { useState } from 'react';
import {
  Combobox,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../components/combobox';
import { recentItems, documents, tasks } from '@shared/data';
import 'iconify-icon';
import '../jsx-types';

const recentSearches = recentItems.map((r) => r.name);
const popularSearches = [
  ...documents.map((d) => d.name),
  ...tasks.map((t) => t.title),
];

export function AutocompleteDemo() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const select = (value: string) => {
    setQuery(value);
    setOpen(false);
  };

  return (
    <div style={{ width: '320px' }}>
      <Combobox>
        <ComboboxInput
          value={query}
          onValueChange={setQuery}
          onFocus={() => setOpen(true)}
          placeholder="Search…"
        />
        {open && (
          <ComboboxList>
            {!query && (
              <ComboboxGroup heading="Recent">
                {recentSearches.map((s) => (
                  <ComboboxItem key={s} value={s} onSelect={select}>
                    {s}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
            {query.length >= 2 && (
              <ComboboxGroup>
                {popularSearches.map((s) => (
                  <ComboboxItem key={s} value={s} onSelect={select}>
                    {s}
                  </ComboboxItem>
                ))}
              </ComboboxGroup>
            )}
          </ComboboxList>
        )}
      </Combobox>
    </div>
  );
}
