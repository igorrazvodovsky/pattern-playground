import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';
import { CommandMenu } from '../../../components/command-menu';
import type { CommandData, RecentItem, AICommandResult } from '../../../components/command-menu';

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
  { id: 'obj-561', name: 'OBJ-561', icon: 'ph:file', timestamp: Date.now() - 1000 },
  { id: 'obj-568', name: 'OBJ-568', icon: 'ph:file', timestamp: Date.now() - 2000 },
  { id: 'obj-541', name: 'OBJ-541', icon: 'ph:file', timestamp: Date.now() - 3000 },
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
        emptyMessage="No results found."
      />
    </div>
  ),
};

export const WithAI: Story = {
  render: () => {
        // Mock AI function
    const mockAIRequest = async (prompt: string): Promise<AICommandResult> => {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        suggestedItems: [
          {
            id: `ai-${Date.now()}-1`,
            label: `Create task: ${prompt}`,
            value: { action: 'create-task', title: prompt },
            icon: 'ph:plus-square',
            metadata: { source: 'ai', confidence: 0.9 }
          },
          {
            id: `ai-${Date.now()}-2`,
            label: `Search for: ${prompt}`,
            value: { action: 'search', query: prompt },
            icon: 'ph:magnifying-glass',
            metadata: { source: 'ai', confidence: 0.8 }
          }
        ],
        confidence: 0.85,
        unmatchedCriteria: prompt.length < 5 ? ['Query too short'] : undefined
      };
    };

    return (
      <div style={{ width: '400px', height: '400px' }}>
        <CommandMenu
          data={commandData}
          recentItems={recentItems}
          onSelect={(item) => console.log('Selected:', item)}
          placeholder="Type a command or search... (try typing something that doesn't match)"
          showRecents={true}
          enableNavigation={true}
          enableAI={true}
          aiConfig={{
            onAIRequest: mockAIRequest,
            debounceMs: 500,
            minInputLength: 3,
          }}
          aiMessages={{
            emptyStateMessage: "Try typing something to get AI assistance",
            noResultsMessage: "No matching commands found. AI can help you!",
            aiProcessingMessage: "AI is thinking...",
            aiErrorPrefix: "AI Error:",
          }}
          emptyMessage="No results found."
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: `Command menu with AI assistance enabled. When no commands match your search, AI will suggest alternatives.`
      }
    }
  }
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
              emptyMessage="No results found."
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

export const CustomMessages: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px' }}>
      <CommandMenu
        data={commandData}
        recentItems={recentItems}
        onSelect={(item) => console.log('Selected:', item)}
        placeholder="Custom placeholder text..."
        showRecents={true}
        enableNavigation={true}
        enableAI={false}
        emptyMessage="Nothing found! Try a different search term."
        className="custom-command-menu"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: `Command menu with custom placeholder and empty state messages.`
      }
    }
  }
};
