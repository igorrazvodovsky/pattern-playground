import type { Meta, StoryObj } from '@storybook/react';
import { CommandMenu } from '../../../components/command-menu';
import type { CommandData, RecentItem } from '../../../components/command-menu';

const meta: Meta<typeof CommandMenu> = {
  title: 'Compositions/CommandMenu/New Implementation',
  component: CommandMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A comprehensive command menu component with hierarchical navigation, AI integration, and recent items management.',
      },
    },
  },
  argTypes: {
    enableNavigation: {
      control: 'boolean',
      description: 'Enable hierarchical navigation',
    },
    enableAI: {
      control: 'boolean',
      description: 'Enable AI-powered suggestions',
    },
    showRecents: {
      control: 'boolean',
      description: 'Show recent items',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample command data
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

// Mock AI request function
const mockAIRequest = async (prompt: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

  return {
    suggestedItems: [
      {
        id: 'ai-suggestion-1',
        label: `AI suggestion for "${prompt}"`,
        value: prompt,
        icon: 'ph:robot',
        metadata: { source: 'ai', confidence: 0.9 }
      }
    ],
    confidence: 0.9,
  };
};

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

export const WithAI: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px' }}>
      <CommandMenu
        data={commandData}
        recentItems={recentItems}
        enableAI={true}
        aiConfig={{
          onAIRequest: mockAIRequest,
          debounceMs: 1000,
          minInputLength: 3,
        }}
        onSelect={(item) => console.log('Selected:', item)}
        placeholder="Ask AI or search commands..."
        showRecents={true}
        enableNavigation={true}
      />
    </div>
  ),
};

export const SimpleMenu: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px' }}>
      <CommandMenu
        data={commandData}
        showRecents={false}
        enableAI={false}
        enableNavigation={false}
        onSelect={(item) => console.log('Selected:', item)}
        placeholder="Search commands..."
      />
    </div>
  ),
};

export const FilteringContext: Story = {
  render: () => (
    <div style={{ width: '400px', height: '300px' }}>
      <CommandMenu
        data={[
          {
            id: 'status',
            name: 'Status',
            icon: 'ph:circle',
            children: [
              { id: 'status-active', name: 'Active', icon: 'ph:check-circle' },
              { id: 'status-inactive', name: 'Inactive', icon: 'ph:x-circle' },
              { id: 'status-pending', name: 'Pending', icon: 'ph:clock' },
            ]
          },
          {
            id: 'priority',
            name: 'Priority',
            icon: 'ph:flag',
            children: [
              { id: 'priority-high', name: 'High', icon: 'ph:flag' },
              { id: 'priority-medium', name: 'Medium', icon: 'ph:flag' },
              { id: 'priority-low', name: 'Low', icon: 'ph:flag' },
            ]
          }
        ]}
        showRecents={false}
        enableAI={true}
        enableNavigation={true}
        aiConfig={{
          onAIRequest: mockAIRequest,
          minInputLength: 2,
          availableFilters: ['status', 'priority'],
          availableValues: {
            status: ['active', 'inactive', 'pending'],
            priority: ['high', 'medium', 'low']
          }
        }}
        onSelect={(item) => console.log('Filter applied:', item)}
        placeholder="Filter..."
      />
    </div>
  ),
};