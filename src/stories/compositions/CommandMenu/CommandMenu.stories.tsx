import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import { CommandMenu } from '../../../components/command-menu';
import type { CommandData, RecentItem } from '../../../components/command-menu';

// Extract command data from original implementation
const commandData: CommandData[] = [
  {
    id: 'search',
    name: 'Search',
    icon: 'ph:magnifying-glass',
    shortcut: ['⌘', 'S'],
    children: [
      { id: 'search-files', name: 'Files', icon: 'ph:file-text' },
      { id: 'search-projects', name: 'Projects', icon: 'ph:folder' },
      { id: 'search-tasks', name: 'Tasks', icon: 'ph:check-square' },
      { id: 'search-people', name: 'People', icon: 'ph:users' },
      { id: 'search-messages', name: 'Messages', icon: 'ph:chat-circle' },
    ]
  },
  {
    id: 'create',
    name: 'Create',
    icon: 'ph:plus',
    shortcut: ['⌘', 'N'],
    children: [
      { id: 'create-file', name: 'File', icon: 'ph:file-plus' },
      { id: 'create-folder', name: 'Folder', icon: 'ph:folder-plus' },
      { id: 'create-project', name: 'Project', icon: 'ph:briefcase' },
      { id: 'create-task', name: 'Task', icon: 'ph:plus-square' },
      { id: 'create-meeting', name: 'Meeting', icon: 'ph:calendar-plus' },
    ]
  },
  {
    id: 'change',
    name: 'Change',
    icon: 'ph:pencil',
    children: [
      { id: 'change-theme', name: 'Theme', icon: 'ph:palette' },
      { id: 'change-settings', name: 'Settings', icon: 'ph:gear' },
      { id: 'change-profile', name: 'Profile', icon: 'ph:user' },
      { id: 'change-workspace', name: 'Workspace', icon: 'ph:buildings' },
      { id: 'change-language', name: 'Language', icon: 'ph:translate' },
    ]
  }
];

const recentItems: RecentItem[] = [
  { id: 'obj-561', name: 'OBJ-561', icon: 'ph:file' },
  { id: 'obj-568', name: 'OBJ-568', icon: 'ph:file' },
  { id: 'obj-541', name: 'OBJ-541', icon: 'ph:file' },
];

const meta: Meta<typeof CommandMenu> = {
  title: 'Compositions/Command menu*',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px' }}>
      <CommandMenu
        data={commandData}
        recentItems={recentItems}
        onSelect={(item) => console.log('Selected:', item)}
        placeholder="Type a command or search..."
        showRecents={true}
        enableNavigation={true}
        enableAI={false}
      />
    </div>
  ),
};

export const Dialog: Story = {
  render: () => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === '/') {
          e.preventDefault();
          dialogRef.current?.showModal();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
      <>
        <p>Press <kbd>/</kbd> to open the command menu.</p>
        <dialog ref={dialogRef} id="cmd">
          <div style={{ width: '400px', height: '300px' }}>
            <CommandMenu
              data={commandData}
              recentItems={recentItems}
              onSelect={(item) => {
                console.log('Selected:', item);
                dialogRef.current?.close();
              }}
              onEscape={() => {
                dialogRef.current?.close();
                return true;
              }}
              placeholder="Type a command or search..."
              showRecents={true}
              enableNavigation={true}
              enableAI={false}
            />
          </div>
        </dialog>
      </>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Command menu in a modal dialog. Press "/" to open it and test the hierarchical navigation and search functionality.`
      }
    }
  }
};
