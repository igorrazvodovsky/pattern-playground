import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { action } from 'storybook/actions';
import { users } from '@shared/data';
import { PpToast } from '../main.ts';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '../components/sidebar';
import '../icons/register-icons';
import '../jsx-types';

const meta = {
  title: 'Templates/Settings',
  tags: ['autodocs', 'activity-level:action', 'mediation:individual'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const me = users[0];

// ─── Auto-save ──────────────────────────────────────────────────────────────

type Control = HTMLInputElement | HTMLSelectElement;
type Value = string | boolean;

const isRadio = (el: Control): el is HTMLInputElement =>
  el instanceof HTMLInputElement && el.type === 'radio';
const isCheckbox = (el: Control): el is HTMLInputElement =>
  el instanceof HTMLInputElement && el.type === 'checkbox';

/** The name a toast gives a control: its label, or its group's legend. */
function controlName(el: Control): string {
  const legend = el.closest('fieldset')?.querySelector('legend')?.textContent;
  if (isRadio(el) && legend) return legend;
  return el.labels?.[0]?.textContent?.trim() || el.name || el.id;
}

/** A radio group is one setting, keyed by its name; any other control by its id. */
const keyOf = (el: Control) => (isRadio(el) ? el.name : el.id || el.name);
const valueOf = (el: Control): Value => (isCheckbox(el) ? el.checked : el.value);

function radioGroup(root: HTMLElement, name: string) {
  return [...root.querySelectorAll<HTMLInputElement>(`input[type='radio']`)].filter(
    (r) => r.name === name,
  );
}

/** The value the page loaded with, for the first change to a setting. */
function initialValue(root: HTMLElement, el: Control): Value {
  if (isCheckbox(el)) return el.defaultChecked;
  if (isRadio(el)) return radioGroup(root, el.name).find((r) => r.defaultChecked)?.value ?? '';
  if (el instanceof HTMLSelectElement) {
    return [...el.options].find((o) => o.defaultSelected)?.value ?? el.options[0]?.value ?? '';
  }
  return (el as HTMLInputElement).defaultValue;
}

function restore(root: HTMLElement, el: Control, value: Value) {
  if (isCheckbox(el)) el.checked = value as boolean;
  else if (isRadio(el)) {
    const match = radioGroup(root, el.name).find((r) => r.value === value);
    if (match) match.checked = true;
  } else (el as Control).value = String(value);
}

/**
 * Saves each committed change inside `ref` and confirms it in a toast that
 * offers to undo it. Listens for the native `change` event, which fires when a
 * switch flips or a select changes, and for text fields only once the actor
 * leaves the field — not on every keystroke.
 */
function useAutoSave(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const saved = new Map<string, Value>();

    const onChange = (event: Event) => {
      const el = event.target;
      if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) return;
      const name = controlName(el);
      if (!el.checkValidity()) {
        PpToast.show(`${name} not saved: ${el.validationMessage}`);
        return;
      }
      const key = keyOf(el);
      const previous = saved.has(key) ? saved.get(key)! : initialValue(root, el);
      const value = valueOf(el);
      saved.set(key, value);
      action('save')(key, value);
      PpToast.show(`${name} saved — undo`, () => {
        restore(root, el, previous);
        saved.set(key, previous);
        action('save')(key, previous);
        PpToast.show(`${name} restored`);
      });
    };
    root.addEventListener('change', onChange);
    return () => root.removeEventListener('change', onChange);
  }, [ref]);
}

// ─── Rows ───────────────────────────────────────────────────────────────────

/** One preference: what it does on the left, its control on the right. */
function SettingRow({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="sidecar-end" style={{ '--_gap': 'var(--space-s)' } as CSSProperties}>
      <div className="flow" style={{ '--flow-space': 'var(--space-3xs)' } as CSSProperties}>
        <label htmlFor={id}>{label}</label>
        {description && (
          <p className="muted" id={`${id}-description`}>
            {description}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({
  id,
  label,
  description,
  defaultChecked,
  disabled,
}: {
  id: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <SettingRow id={id} label={label} description={description}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="switch"
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-describedby={description ? `${id}-description` : undefined}
      />
    </SettingRow>
  );
}

// ─── Section content ────────────────────────────────────────────────────────

function ProfileSection() {
  return (
    <div className="flow measure" style={{ '--flow-space': 'var(--space-m)' } as CSSProperties}>
      <div className="flow">
        <label htmlFor="profile-name">Name</label>
        <pp-input>
          <input id="profile-name" name="name" defaultValue={me.name} required />
        </pp-input>
      </div>
      <div className="flow">
        <label htmlFor="profile-email">Email address</label>
        <pp-input>
          <input
            id="profile-email"
            name="email"
            type="email"
            defaultValue={me.metadata.email}
            required
          />
        </pp-input>
      </div>
      <div className="flow">
        <label htmlFor="profile-role">Role</label>
        <pp-input>
          <input id="profile-role" name="role" defaultValue={me.metadata.role} />
        </pp-input>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="flow measure" style={{ '--flow-space': 'var(--space-m)' } as CSSProperties}>
      <Toggle
        id="notify-mentions"
        label="Mentions"
        description="When someone mentions you in a comment or document."
        defaultChecked
      />
      <Toggle
        id="notify-assigned"
        label="Assigned to me"
        description="When a task is assigned to you or its due date changes."
        defaultChecked
      />
      <Toggle
        id="notify-project"
        label="Project activity"
        description="Every change in projects you follow. Busy projects send a lot."
      />
      <SettingRow
        id="notify-digest"
        label="Email digest"
        description="A summary of what you missed, instead of one email per event."
      >
        <pp-select>
          <select
            id="notify-digest"
            defaultValue="daily"
            aria-describedby="notify-digest-description"
          >
            <option value="off">Off</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </pp-select>
      </SettingRow>
    </div>
  );
}

function AppearanceSection() {
  return (
    <div className="flow measure" style={{ '--flow-space': 'var(--space-m)' } as CSSProperties}>
      <fieldset className="flow">
        <legend>Theme</legend>
        <label className="form-control">
          <input type="radio" name="theme" value="system" defaultChecked />
          Match the system
        </label>
        <label className="form-control">
          <input type="radio" name="theme" value="light" />
          Light
        </label>
        <label className="form-control">
          <input type="radio" name="theme" value="dark" />
          Dark
        </label>
      </fieldset>
      <SettingRow
        id="appearance-density"
        label="Density"
        description="How much fits on screen in lists and tables."
      >
        <pp-select>
          <select
            id="appearance-density"
            defaultValue="comfortable"
            aria-describedby="appearance-density-description"
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </pp-select>
      </SettingRow>
      <Toggle
        id="appearance-motion"
        label="Reduce motion"
        description="Replaces animated transitions with instant changes."
      />
    </div>
  );
}

function RegionSection() {
  return (
    <div className="flow measure" style={{ '--flow-space': 'var(--space-m)' } as CSSProperties}>
      <div className="flow">
        <label htmlFor="region-language">Language</label>
        <pp-select>
          <select id="region-language" defaultValue={me.metadata.preferredLanguage}>
            <option value="en-GB">English (United Kingdom)</option>
            <option value="en-US">English (United States)</option>
            <option value="de-DE">Deutsch</option>
            <option value="fr-FR">Français</option>
          </select>
        </pp-select>
      </div>
      <div className="flow">
        <label htmlFor="region-timezone">Time zone</label>
        <pp-select>
          <select id="region-timezone" defaultValue={me.metadata.timezone}>
            <option value="Europe/London">London</option>
            <option value="Europe/Berlin">Berlin</option>
            <option value="America/New_York">New York</option>
            <option value="Asia/Tokyo">Tokyo</option>
          </select>
        </pp-select>
      </div>
      <fieldset className="flow">
        <legend>Time format</legend>
        <label className="form-control">
          <input type="radio" name="time-format" value="24" defaultChecked />
          24-hour (14:30)
        </label>
        <label className="form-control">
          <input type="radio" name="time-format" value="12" />
          12-hour (2:30 pm)
        </label>
      </fieldset>
    </div>
  );
}

function WorkspaceSection() {
  return (
    <div className="flow measure" style={{ '--flow-space': 'var(--space-m)' } as CSSProperties}>
      <p className="muted">
        These settings apply to everyone in Acme Corp. Only workspace admins can change them.
      </p>
      <Toggle
        id="workspace-guests"
        label="Allow guests"
        description="People outside the organisation can be invited to individual projects."
        defaultChecked
        disabled
      />
      <Toggle
        id="workspace-public-links"
        label="Public links"
        description="Documents can be shared with anyone who has the link."
        disabled
      />
      <div className="flex">
        <button type="button" className="button">
          Ask an admin
        </button>
      </div>
    </div>
  );
}

interface Section {
  key: string;
  label: string;
  icon: string;
  scope: 'Personal' | 'Organisation';
  Content: () => ReactNode;
}

const SECTIONS: Section[] = [
  {
    key: 'profile',
    label: 'Profile',
    icon: 'ik:user-in-circle',
    scope: 'Personal',
    Content: ProfileSection,
  },
  {
    key: 'notifications',
    label: 'Notifications',
    icon: 'ik:bell',
    scope: 'Personal',
    Content: NotificationsSection,
  },
  {
    key: 'appearance',
    label: 'Appearance',
    icon: 'ik:palette',
    scope: 'Personal',
    Content: AppearanceSection,
  },
  {
    key: 'region',
    label: 'Language and region',
    icon: 'ik:globe',
    scope: 'Personal',
    Content: RegionSection,
  },
  {
    key: 'workspace',
    label: 'Workspace',
    icon: 'ik:group',
    scope: 'Organisation',
    Content: WorkspaceSection,
  },
];

const SCOPES = ['Personal', 'Organisation'] as const;

// ─── Variants ───────────────────────────────────────────────────────────────

function SidebarSettings() {
  const [active, setActive] = useState(SECTIONS[0].key);
  const bodyRef = useRef<HTMLDivElement>(null);
  useAutoSave(bodyRef);

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          {SCOPES.map((scope) => (
            <SidebarGroup key={scope}>
              <SidebarGroupLabel>{scope}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {SECTIONS.filter((s) => s.scope === scope).map((s) => (
                    <SidebarMenuItem key={s.key}>
                      <SidebarMenuButton
                        isActive={s.key === active}
                        aria-current={s.key === active ? 'page' : undefined}
                        tooltip={s.label}
                        onClick={() => setActive(s.key)}
                      >
                        <iconify-icon className="icon" icon={s.icon} />
                        <span>{s.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="story-shell-header">
          <SidebarTrigger />
          <span className="story-shell-title">Settings</span>
        </header>
        {/* Every group stays mounted, hidden when inactive, so values the
            actor changed are still there when they come back to a group. */}
        <div className="story-shell-body" ref={bodyRef}>
          {SECTIONS.map(({ key, label, Content }) => (
            <section key={key} className="flow" hidden={key !== active}>
              <h2>{label}</h2>
              <Content />
            </section>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/**
 * All groups on one page. `pp-sections` shows them as a tab bar where there is
 * room and as collapsible sections where there is not; the switch is the
 * `--pp-affordance` custom property, so the markup stays the same.
 */
function SectionsSettings() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoSave(ref);

  return (
    <div className="flow settings-sections" ref={ref}>
      <style>{`
        .settings-sections {
          --pp-affordance: details;
        }
        @media (min-width: 50em) {
          .settings-sections {
            --pp-affordance: tab-bar;
          }
        }
      `}</style>
      <h1>Settings</h1>
      <pp-sections>
        {SECTIONS.flatMap(({ key, label, Content }) => [
          <h2 key={`${key}-heading`}>{label}</h2>,
          <div key={key}>
            <Content />
          </div>,
        ])}
      </pp-sections>
    </div>
  );
}

export const WithSidebar: Story = {
  name: 'Sidebar',
  parameters: {
    layout: 'fullscreen',
    // Inline, the sidebar's fixed panel escapes onto the Docs page.
    docs: { story: { inline: false, iframeHeight: 560 } },
  },
  render: () => <SidebarSettings />,
};

export const WithSections: Story = {
  name: 'Sections',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story:
          'A tab bar at wide viewports, collapsible sections below about 800 px. Resize the viewport to see the switch.',
      },
    },
  },
  render: () => <SectionsSettings />,
};
