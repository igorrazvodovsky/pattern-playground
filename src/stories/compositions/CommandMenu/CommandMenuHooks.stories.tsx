import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  useCommandNavigation,
  useCommandRecents,
  useCommandKeyboard,
  useCommandComposition,
  type CommandData,
  type RecentItem,
} from '../../../components/command-menu';
import 'iconify-icon';

const meta: Meta = {
  title: 'Compositions/Command Menu/Hooks Examples',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Examples demonstrating individual command menu hooks for custom implementations.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Sample data for stories
const sampleCommands: CommandData[] = [
  {
    id: 'file',
    name: 'File',
    icon: 'mdi:file',
    children: [
      { id: 'new', name: 'New File', icon: 'mdi:file-plus' },
      { id: 'open', name: 'Open File', icon: 'mdi:file-open' },
      { id: 'save', name: 'Save File', icon: 'mdi:content-save' },
    ],
  },
  {
    id: 'edit',
    name: 'Edit',
    icon: 'mdi:pencil',
    shortcut: ['⌘', 'E'],
    children: [
      { id: 'copy', name: 'Copy', icon: 'mdi:content-copy' },
      { id: 'paste', name: 'Paste', icon: 'mdi:content-paste' },
      { id: 'undo', name: 'Undo', icon: 'mdi:undo' },
    ],
  },
  {
    id: 'search',
    name: 'Search',
    icon: 'mdi:magnify',
    shortcut: ['⌘', 'F'],
  },
];

const sampleRecents: RecentItem[] = [
  { id: 'recent-1', name: 'Recent File 1', icon: 'mdi:file', timestamp: Date.now() - 1000 },
  { id: 'recent-2', name: 'Recent Action', icon: 'mdi:lightning-bolt', timestamp: Date.now() - 2000 },
];

// Simple Navigation Hook Example
export const NavigationHookOnly: Story = {
  render: () => {
    const SimpleNavigationMenu = () => {
      const navigation = useCommandNavigation({
        data: sampleCommands,
        onSelect: (item) => console.log('Selected:', item),
      });

      return (
        <div style={{ width: '400px', height: '300px' }}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={navigation.placeholder}
              value={navigation.searchInput}
              onValueChange={navigation.setSearchInput}
              ref={navigation.inputRef}
            />
            <CommandList>
              {navigation.isInCommandView ? (
                // Child view
                <CommandGroup>
                  {navigation.filteredResults.children.map(({ child }) => (
                                         <CommandItem
                       key={child.id}
                       onSelect={() => navigation.handleChildSelect(child.id)}
                     >
                       {child.icon && (
                         <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                       )}
                       {child.name}
                     </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                // Parent view
                <CommandGroup>
                  {navigation.filteredResults.parents.map((command) => (
                                         <CommandItem
                       key={command.id}
                       onSelect={() => navigation.handleCommandSelect(command.id)}
                     >
                       {command.icon && (
                         <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                       )}
                       {command.name}
                     </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {navigation.filteredResults.parents.length === 0 &&
               navigation.filteredResults.children.length === 0 && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      );
    };

    return <SimpleNavigationMenu />;
  },
};

// Recents Hook Example
export const RecentsHookExample: Story = {
  render: () => {
    const RecentsMenu = () => {
      const [searchInput, setSearchInput] = useState('');
      const recents = useCommandRecents({
        initialRecents: sampleRecents,
        maxRecents: 5,
        persistRecents: false,
      });

      const filteredRecents = recents.filterRecents(searchInput);

      const addRandomRecent = () => {
        const newRecent: RecentItem = {
          id: `recent-${Date.now()}`,
          name: `New Recent ${Date.now()}`,
          icon: 'mdi:star',
          timestamp: Date.now(),
        };
        recents.addToRecents(newRecent);
      };

      return (
        <div style={{ width: '400px', height: '300px' }}>
          <div style={{ marginBottom: '10px' }}>
            <button onClick={addRandomRecent}>Add Random Recent</button>
            <button onClick={recents.clearRecents} style={{ marginLeft: '10px' }}>
              Clear All
            </button>
          </div>

          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search recents..."
              value={searchInput}
              onValueChange={setSearchInput}
            />
            <CommandList>
              <CommandGroup heading="Recent Items">
                {filteredRecents.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => {
                      console.log('Selected recent:', item);
                      recents.addToRecents(item); // Move to top
                    }}
                  >
                    {item.icon && (
                      <iconify-icon icon={item.icon} slot="prefix"></iconify-icon>
                    )}
                    {item.name}
                    <button
                      slot="suffix"
                      onClick={(e) => {
                        e.stopPropagation();
                        recents.removeFromRecents(item.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </CommandItem>
                ))}
              </CommandGroup>

              {filteredRecents.length === 0 && (
                <CommandEmpty>No recent items found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      );
    };

    return <RecentsMenu />;
  },
};

// Keyboard Hook Example
export const KeyboardHookExample: Story = {
  render: () => {
    const KeyboardMenu = () => {
      const [selectedCommand, setSelectedCommand] = useState<string>('');

      const keyboard = useCommandKeyboard({
        shortcuts: [
          { keys: ['⌘', 'F'], commandId: 'search', description: 'Search' },
          { keys: ['⌘', 'E'], commandId: 'edit', description: 'Edit' },
        ],
        onEscape: () => {
          setSelectedCommand('');
          return true;
        },
        onEnter: (commandId) => {
          setSelectedCommand(commandId);
        },
      });

      return (
        <div style={{ width: '400px', height: '300px' }}>
          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <p>Try keyboard shortcuts: ⌘+F, ⌘+E, or Escape</p>
            {selectedCommand && <p>Last shortcut: {selectedCommand}</p>}
          </div>

          <Command shouldFilter={false} onKeyDown={keyboard.handleKeyDown}>
            <CommandInput
              placeholder="Try keyboard shortcuts..."
              ref={keyboard.inputRef}
            />
            <CommandList>
              <CommandGroup heading="Commands with Shortcuts">
                {sampleCommands.map((command) => (
                  <CommandItem
                    key={command.id}
                    onSelect={() => setSelectedCommand(command.id)}
                  >
                    {command.icon && (
                      <iconify-icon icon={command.icon} slot="prefix"></iconify-icon>
                    )}
                    {command.name}
                    {command.shortcut && (
                      <span slot="suffix" className="cmdk-shortcuts">
                        {keyboard.formatShortcut(command.shortcut)}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      );
    };

    return <KeyboardMenu />;
  },
};

// Full Composition Hook Example
export const CompositionHookExample: Story = {
  render: () => {
    const FullCompositionMenu = () => {
      const composition = useCommandComposition({
        data: sampleCommands,
        enableNavigation: true,
        enableRecents: true,
        enableAI: false, // Disabled for this example
        recentsConfig: {
          initialRecents: sampleRecents,
          maxRecents: 10,
          persistRecents: false,
        },
        onSelect: (item) => console.log('Composition selected:', item),
      });

      return (
        <div style={{ width: '400px', height: '400px' }}>
          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <p>Full composition with navigation + recents</p>
            <p>Current view: {composition.isInChildView ? 'Child' : 'Parent'}</p>
          </div>

          <Command shouldFilter={false} onKeyDown={composition.keyboard.handleKeyDown}>
            <CommandInput
              placeholder={composition.placeholder}
              value={composition.searchInput}
              onValueChange={composition.setSearchInput}
              ref={composition.keyboard.inputRef}
            />
            <CommandList>
              {/* Recents */}
              {composition.shouldShowRecents && composition.results.recents.length > 0 && (
                <CommandGroup heading="Recent">
                  {composition.results.recents.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => composition.navigation.handleRecentSelect(item.id)}
                    >
                      {item.icon && (
                        <iconify-icon icon={item.icon} slot="prefix"></iconify-icon>
                      )}
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Commands */}
              {composition.results.commands.length > 0 && (
                <CommandGroup heading="Commands">
                  {composition.results.commands.map((command) => (
                    <CommandItem
                      key={command.id}
                      onSelect={() => composition.navigation.handleCommandSelect(command.id)}
                    >
                      {command.icon && (
                        <iconify-icon icon={command.icon} slot="prefix"></iconify-icon>
                      )}
                      {command.name}
                      {command.shortcut && (
                        <span slot="suffix" className="cmdk-shortcuts">
                          {composition.keyboard.formatShortcut(command.shortcut)}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Children */}
              {composition.results.children.length > 0 && (
                <CommandGroup heading={composition.isInChildView ? undefined : "Actions"}>
                  {composition.results.children.map(({ parent, child }) => (
                    <CommandItem
                      key={`${parent.id}-${child.id}`}
                      onSelect={() => composition.navigation.handleChildSelect(child.id)}
                    >
                      {child.icon && (
                        <iconify-icon icon={child.icon} slot="prefix"></iconify-icon>
                      )}
                      {composition.isInChildView ? child.name : `${parent.name} ${child.name}`}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {!composition.hasResults && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      );
    };

    return <FullCompositionMenu />;
  },
};