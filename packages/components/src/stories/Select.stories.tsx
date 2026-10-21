import type { Meta, StoryObj } from '@storybook/react-vite';

interface SelectArgs {
  label: string;
  value: string;
  placeholder: string;
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  required: boolean;
}

const meta = {
  title: 'Components/Select',
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the select)',
    },
    value: {
      control: { type: 'text' },
      description: 'Current value',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder rendered as a disabled first option',
    },
    size: {
      control: { type: 'radio' },
      options: ['small', 'medium', 'large'],
      description: 'Control size',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Required for form submission',
    },
  },
} satisfies Meta<SelectArgs>;

export default meta;
type Story = StoryObj<SelectArgs>;

export const Default: Story = {
  args: {
    label: 'Country',
    value: '',
    placeholder: 'Choose a country',
    size: 'medium',
    disabled: false,
    required: false,
  },
  render: (args) => (
    <pp-select size={args.size}>
      <select
        aria-label={args.label}
        defaultValue={args.value}
        disabled={args.disabled}
        required={args.required}
      >
        <option value="" disabled>
          {args.placeholder}
        </option>
        <option value="gb">United Kingdom</option>
        <option value="de">Germany</option>
        <option value="fr">France</option>
      </select>
    </pp-select>
  ),
};

/**
 * The control is a real light-DOM `<select>`, so a `<label for="…">`
 * associates natively — clicking the label focuses the control.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flow">
      <label htmlFor="country-select">Country</label>
      <pp-select>
        <select id="country-select" defaultValue="">
          <option value="" disabled>
            Choose a country
          </option>
          <option value="gb">United Kingdom</option>
          <option value="de">Germany</option>
          <option value="fr">France</option>
        </select>
      </pp-select>
    </div>
  ),
};

export const WithHintText: Story = {
  render: () => (
    <div className="flow">
      <label htmlFor="timezone-select">Timezone</label>
      <pp-select>
        <select id="timezone-select" aria-describedby="timezone-hint">
          <option value="utc">UTC</option>
          <option value="cet">Central European Time</option>
          <option value="pst">Pacific Standard Time</option>
        </select>
      </pp-select>
      <small id="timezone-hint">Used for scheduling and notifications.</small>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <>
      <pp-select size="small">
        <select aria-label="Small" defaultValue="">
          <option value="" disabled>
            Small
          </option>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </select>
      </pp-select>
      <br />
      <pp-select size="medium">
        <select aria-label="Medium" defaultValue="">
          <option value="" disabled>
            Medium
          </option>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </select>
      </pp-select>
      <br />
      <pp-select size="large">
        <select aria-label="Large" defaultValue="">
          <option value="" disabled>
            Large
          </option>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </select>
      </pp-select>
    </>
  ),
};

/**
 * `data-slot="prefix"` and `data-slot="suffix"` children overlay the control
 * as presentational adornments, the same contract as Input. They are not
 * interactive: clicks pass through to the select.
 */
export const WithAdornments: Story = {
  render: () => (
    <div className="flow">
      <pp-select>
        <iconify-icon className="icon" icon="ik:globe" data-slot="prefix" />
        <select aria-label="Region" defaultValue="eu">
          <option value="eu">Europe</option>
          <option value="na">North America</option>
          <option value="ap">Asia Pacific</option>
        </select>
      </pp-select>
      <pp-select size="small">
        <iconify-icon className="icon" icon="ik:sort-high-to-low" data-slot="prefix" />
        <select aria-label="Sort by" defaultValue="recent">
          <option value="recent">Most recent</option>
          <option value="name">Name</option>
        </select>
        <span data-slot="suffix">12</span>
      </pp-select>
      <pp-select size="large">
        <select aria-label="Time zone" defaultValue="cet">
          <option value="cet">Central European Time</option>
          <option value="utc">Coordinated Universal Time</option>
        </select>
        <iconify-icon className="icon" icon="ik:calendar" data-slot="suffix" />
      </pp-select>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <>
      <pp-select>
        <select aria-label="Disabled control" defaultValue="" disabled>
          <option value="" disabled>
            Unavailable
          </option>
          <option value="a">Option A</option>
          <option value="b">Option B</option>
        </select>
      </pp-select>
      <br />
      <pp-select>
        <select aria-label="Disabled option" defaultValue="">
          <option value="" disabled>
            Choose…
          </option>
          <option value="a">Available</option>
          <option value="b" disabled>
            Unavailable
          </option>
          <option value="c">Also available</option>
        </select>
      </pp-select>
    </>
  ),
};

/**
 * Screen readers announce "Error:" before the message because of the
 * visually-hidden prefix inside the error region (GOV.UK pattern).
 */
export const Invalid: Story = {
  render: () => (
    <pp-select invalid>
      <select aria-label="Role" defaultValue="">
        <option value="" disabled>
          Choose a role
        </option>
        <option value="admin">Administrator</option>
        <option value="editor">Editor</option>
        <option value="viewer">Viewer</option>
      </select>
      <span data-slot="error">
        <span className="visually-hidden">Error:</span> Choose a role to continue.
      </span>
    </pp-select>
  ),
};

export const Grouped: Story = {
  render: () => (
    <pp-select>
      <select aria-label="City" defaultValue="">
        <option value="" disabled>
          Choose a city
        </option>
        <optgroup label="Europe">
          <option value="lon">London</option>
          <option value="ber">Berlin</option>
          <option value="par">Paris</option>
        </optgroup>
        <optgroup label="North America">
          <option value="nyc">New York</option>
          <option value="sfo">San Francisco</option>
          <option value="tor">Toronto</option>
        </optgroup>
      </select>
    </pp-select>
  ),
};

/**
 * `novalidate` on the form suppresses the browser's default validation tooltip
 * so the component's own invalid styling and slotted error message are the
 * only visible feedback (Nordhealth recommendation).
 */
export const Required: Story = {
  render: () => (
    <form noValidate>
      <div className="flow">
        <label htmlFor="plan-select">Plan</label>
        <pp-select>
          <select id="plan-select" defaultValue="" required>
            <option value="" disabled>
              Choose a plan
            </option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="team">Team</option>
          </select>
        </pp-select>
      </div>
    </form>
  ),
};
