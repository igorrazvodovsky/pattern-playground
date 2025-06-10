import { useState, useRef, useMemo } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../components/command-menu/command";
import {
  searchHierarchy,
  searchWithinParent,
  type SearchableParent,
  type SearchableItem
} from '../../utils/hierarchical-search';
import 'iconify-icon'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': any;
    }
  }
}

// Define the command structure using the generic search interfaces
interface CommandOption extends SearchableParent {
  shortcut?: string[];
  children?: CommandChildOption[];
}

interface CommandChildOption extends SearchableItem {
  // Command-specific properties can be added here
}

interface RecentItem extends SearchableItem {
  // Recent item specific properties can be added here
}

// DRY: Extract command data structure
const commandData: CommandOption[] = [
  {
    id: 'search',
    name: 'Search…',
    icon: 'ph:magnifying-glass',
    shortcut: ['⌘', 'S'],
    children: [
      { id: 'search-files', name: 'Search Files', icon: 'ph:file-text' },
      { id: 'search-projects', name: 'Search Projects', icon: 'ph:folder' },
      { id: 'search-tasks', name: 'Search Tasks', icon: 'ph:check-square' },
      { id: 'search-people', name: 'Search People', icon: 'ph:users' },
      { id: 'search-messages', name: 'Search Messages', icon: 'ph:chat-circle' },
    ]
  },
  {
    id: 'create',
    name: 'Create…',
    icon: 'ph:plus',
    shortcut: ['⌘', 'N'],
    children: [
      { id: 'create-file', name: 'New File', icon: 'ph:file-plus' },
      { id: 'create-folder', name: 'New Folder', icon: 'ph:folder-plus' },
      { id: 'create-project', name: 'New Project', icon: 'ph:briefcase' },
      { id: 'create-task', name: 'New Task', icon: 'ph:plus-square' },
      { id: 'create-meeting', name: 'New Meeting', icon: 'ph:calendar-plus' },
    ]
  },
  {
    id: 'change',
    name: 'Change…',
    icon: 'ph:pencil',
    children: [
      { id: 'change-theme', name: 'Change Theme', icon: 'ph:palette' },
      { id: 'change-settings', name: 'Change Settings', icon: 'ph:gear' },
      { id: 'change-profile', name: 'Change Profile', icon: 'ph:user' },
      { id: 'change-workspace', name: 'Change Workspace', icon: 'ph:buildings' },
      { id: 'change-language', name: 'Change Language', icon: 'ph:translate' },
    ]
  }
];

const recentItems: RecentItem[] = [
  { id: 'obj-561', name: 'OBJ-561', icon: 'ph:file' },
  { id: 'obj-568', name: 'OBJ-568', icon: 'ph:file' },
  { id: 'obj-541', name: 'OBJ-541', icon: 'ph:file' },
];

function CommandMenu() {
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Get the currently selected command's data
  const selectedCommandData = useMemo(() =>
    commandData.find(cmd => cmd.id === selectedCommand),
    [selectedCommand]
  );

  // Get filtered results based on search input and current view
  const filteredResults = useMemo(() => {
    if (selectedCommand && selectedCommandData) {
      // When in a specific command view, search within its children
      const children = searchWithinParent(searchInput, selectedCommandData);
      return {
        parents: [],
        children: children.map(child => ({ parent: selectedCommandData, child }))
      };
    } else {
      // Global search mode using the generic search utility
      return searchHierarchy(searchInput, commandData);
    }
  }, [searchInput, selectedCommand, selectedCommandData]);

  const handleCommandSelect = (commandId: string) => {
    const command = commandData.find(cmd => cmd.id === commandId);
    if (command?.children) {
      setSelectedCommand(commandId);
      setSearchInput("");
      inputRef.current?.focus();
    } else {
      // Reset state after execution
      setSelectedCommand(null);
      setSearchInput("");
    }
  };

  const handleChildSelect = (childId: string) => {
    setSelectedCommand(null);
    setSearchInput("");
  };

  const handleEscape = () => {
    if (selectedCommand) {
      setSelectedCommand(null);
      setSearchInput("");
      inputRef.current?.focus();
      return true;
    }
    return false;
  };

  return (
    <>
      <Command label="Command Menu" shouldFilter={false} onEscape={handleEscape}>
        <CommandInput
          placeholder={selectedCommand ? `${selectedCommandData?.name}` : "Type a command or search..."}
          value={searchInput}
          onValueChange={setSearchInput}
          ref={inputRef}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Recent items - only show when not in a specific command view */}
          {!selectedCommand && (
            <CommandGroup heading="Recent">
              {recentItems.map((item) => (
                <CommandItem key={item.id}>
                  <iconify-icon icon={item.icon as string} slot="prefix"></iconify-icon>
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {selectedCommand ? (
            // Selected command mode: show children and back option
            <CommandGroup>
              {filteredResults.children.map(({ child }) => (
                <CommandItem
                  key={child.id}
                  onSelect={() => handleChildSelect(child.id)}
                >
                  <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                  {child.name}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : (
            // Global search mode: show both top-level commands and child matches
            <>
              {/* Top-level commands */}
              {filteredResults.parents.length > 0 && (
                <CommandGroup heading="Commands">
                  {filteredResults.parents.map((command) => (
                    <CommandItem
                      key={command.id}
                      onSelect={() => handleCommandSelect(command.id)}
                    >
                      <iconify-icon icon={command.icon as string} slot="prefix"></iconify-icon>
                      {command.name}
                      {command.shortcut && (
                        <span slot="suffix" className="cmdk-shortcuts">
                          {command.shortcut.map((key, index) => (
                            <kbd key={index}>{key}</kbd>
                          ))}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {/* Child command matches */}
              {filteredResults.children.length > 0 && (
                <CommandGroup heading="Actions">
                  {filteredResults.children.map(({ parent, child }) => (
                    <CommandItem
                      key={`${parent.id}-${child.id}`}
                      onSelect={() => handleChildSelect(child.id)}
                    >
                      <iconify-icon icon={child.icon as string} slot="prefix"></iconify-icon>
                      {parent.name} {child.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
        </CommandList>
      </Command>
    </>
  )
}

export default CommandMenu
