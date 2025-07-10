import type { ReferenceCategory } from '../../../components/reference-picker/reference-picker-types';

/**
 * Unified reference data structure following the hierarchical pattern
 * used by Command Menu and Filtering
 */
export const unifiedReferenceData: ReferenceCategory[] = [
  {
    id: 'users',
    name: 'Users',
    type: 'user',
    icon: 'ph:users-fill',
    description: 'Team members and collaborators',
    searchableText: 'users people team members collaborators',
    children: [
      {
        id: 'user-1',
        name: 'Sarah Chen',
        type: 'user',
        icon: 'ph:user-fill',
        description: 'Product Designer',
        searchableText: 'sarah chen product designer ui ux design',
        metadata: { role: 'Product Designer', email: 'sarah@company.com' }
      },
      {
        id: 'user-2',
        name: 'Marcus Rodriguez',
        type: 'user',
        icon: 'ph:user-fill',
        description: 'Frontend Developer',
        searchableText: 'marcus rodriguez frontend developer react typescript',
        metadata: { role: 'Frontend Developer', email: 'marcus@company.com' }
      },
      {
        id: 'user-3',
        name: 'Emily Watson',
        type: 'user',
        icon: 'ph:user-fill',
        description: 'UX Researcher',
        searchableText: 'emily watson ux researcher user research',
        metadata: { role: 'UX Researcher', email: 'emily@company.com' }
      },
      {
        id: 'user-4',
        name: 'David Kim',
        type: 'user',
        icon: 'ph:user-fill',
        description: 'Backend Engineer',
        searchableText: 'david kim backend engineer api database',
        metadata: { role: 'Backend Engineer', email: 'david@company.com' }
      },
      {
        id: 'user-5',
        name: 'Alex Thompson',
        type: 'user',
        icon: 'ph:user-fill',
        description: 'Design Lead',
        searchableText: 'alex thompson design lead manager',
        metadata: { role: 'Design Lead', email: 'alex@company.com' }
      }
    ]
  },
  {
    id: 'documents',
    name: 'Documents',
    type: 'document',
    icon: 'ph:file-text-fill',
    description: 'Documentation and resources',
    searchableText: 'documents documentation resources files',
    children: [
      {
        id: 'doc-1',
        name: 'Design System Guidelines',
        type: 'document',
        icon: 'ph:file-text-fill',
        description: 'Complete style guide and component documentation',
        searchableText: 'design system guidelines style guide components',
        metadata: { type: 'guidelines', lastUpdated: '2024-01-15' }
      },
      {
        id: 'doc-2',
        name: 'API Documentation',
        type: 'document',
        icon: 'ph:file-text-fill',
        description: 'REST API endpoints and authentication',
        searchableText: 'api documentation rest endpoints authentication',
        metadata: { type: 'api-docs', lastUpdated: '2024-01-10' }
      },
      {
        id: 'doc-3',
        name: 'User Research Report',
        type: 'document',
        icon: 'ph:file-text-fill',
        description: 'Q3 2024 user testing findings',
        searchableText: 'user research report testing findings q3 2024',
        metadata: { type: 'research', quarter: 'Q3 2024' }
      },
      {
        id: 'doc-4',
        name: 'Technical Requirements',
        type: 'document',
        icon: 'ph:file-text-fill',
        description: 'System architecture and database design',
        searchableText: 'technical requirements architecture database system',
        metadata: { type: 'technical', version: '2.1' }
      },
      {
        id: 'doc-5',
        name: 'Meeting Notes',
        type: 'document',
        icon: 'ph:file-text-fill',
        description: 'Weekly team sync and decisions',
        searchableText: 'meeting notes team sync weekly decisions',
        metadata: { type: 'meeting-notes', recurring: true }
      }
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    type: 'project',
    icon: 'ph:folder-fill',
    description: 'Active and completed projects',
    searchableText: 'projects active completed development',
    children: [
      {
        id: 'project-1',
        name: 'Mobile App Redesign',
        type: 'project',
        icon: 'ph:device-mobile-fill',
        description: 'Complete overhaul of mobile experience',
        searchableText: 'mobile app redesign overhaul experience ios android',
        metadata: { status: 'active', phase: 'development' }
      },
      {
        id: 'project-2',
        name: 'Performance Optimization',
        type: 'project',
        icon: 'ph:lightning-fill',
        description: 'Improve app loading times and responsiveness',
        searchableText: 'performance optimization loading times speed responsive',
        metadata: { status: 'active', phase: 'testing' }
      },
      {
        id: 'project-3',
        name: 'Dark Mode Implementation',
        type: 'project',
        icon: 'ph:moon-fill',
        description: 'Add dark theme support across all components',
        searchableText: 'dark mode theme implementation components ui',
        metadata: { status: 'planning', phase: 'design' }
      },
      {
        id: 'project-4',
        name: 'Accessibility Audit',
        type: 'project',
        icon: 'ph:eye-fill',
        description: 'WCAG compliance and screen reader testing',
        searchableText: 'accessibility audit wcag compliance screen reader',
        metadata: { status: 'completed', compliance: 'WCAG 2.1 AA' }
      },
      {
        id: 'project-5',
        name: 'Internationalization',
        type: 'project',
        icon: 'ph:globe-fill',
        description: 'Multi-language support and RTL layouts',
        searchableText: 'internationalization i18n multi language rtl localization',
        metadata: { status: 'planning', languages: ['en', 'es', 'fr', 'ar'] }
      }
    ]
  },
  {
    id: 'files',
    name: 'Files',
    type: 'file',
    icon: 'ph:code-fill',
    description: 'Code files and components',
    searchableText: 'files code components source typescript javascript',
    children: [
      {
        id: 'file-1',
        name: 'Button.tsx',
        type: 'file',
        icon: 'ph:code-fill',
        description: 'Primary button component implementation',
        searchableText: 'button tsx component primary react typescript',
        metadata: { path: 'src/components/Button.tsx', language: 'typescript' }
      },
      {
        id: 'file-2',
        name: 'Modal.tsx',
        type: 'file',
        icon: 'ph:code-fill',
        description: 'Modal dialog component with backdrop',
        searchableText: 'modal tsx dialog component backdrop overlay',
        metadata: { path: 'src/components/Modal.tsx', language: 'typescript' }
      },
      {
        id: 'file-3',
        name: 'utils.ts',
        type: 'file',
        icon: 'ph:code-fill',
        description: 'Shared utility functions',
        searchableText: 'utils typescript shared utility functions helpers',
        metadata: { path: 'src/utils/utils.ts', language: 'typescript' }
      },
      {
        id: 'file-4',
        name: 'types.ts',
        type: 'file',
        icon: 'ph:code-fill',
        description: 'TypeScript interface definitions',
        searchableText: 'types typescript interfaces definitions api',
        metadata: { path: 'src/types/types.ts', language: 'typescript' }
      },
      {
        id: 'file-5',
        name: 'hooks.ts',
        type: 'file',
        icon: 'ph:code-fill',
        description: 'Custom React hooks',
        searchableText: 'hooks typescript react custom state management',
        metadata: { path: 'src/hooks/hooks.ts', language: 'typescript' }
      }
    ]
  }
];