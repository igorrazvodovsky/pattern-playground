import type { Meta, StoryObj } from "@storybook/react-vite";

interface SelectArgs {
  label: string;
  value: string;
  placeholder: string;
  size: 'small' | 'medium' | 'large';
  disabled: boolean;
  required: boolean;
}

const meta = {
  title: "Operations/Select",
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label (aria-label on the internal select)',
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
    <pp-select
      label={args.label}
      value={args.value}
      placeholder={args.placeholder}
      size={args.size}
      disabled={args.disabled}
      required={args.required}
    >
      <option value="gb">United Kingdom</option>
      <option value="de">Germany</option>
      <option value="fr">France</option>
    </pp-select>
  ),
};

/**
 * Light DOM means an external `<label for="…">` would work, but we keep parity
 * with Input and use `labelledby` so the same pattern holds if the component
 * later adopts Shadow DOM.
 */
export const WithLabel: Story = {
  render: () => (
    <div className="flow">
      <label id="country-label" htmlFor="">Country</label>
      <pp-select labelledby="country-label" placeholder="Choose a country">
        <option value="gb">United Kingdom</option>
        <option value="de">Germany</option>
        <option value="fr">France</option>
      </pp-select>
    </div>
  ),
};

export const WithHintText: Story = {
  render: () => (
    <div className="flow">
      <label id="timezone-label">Timezone</label>
      <pp-select labelledby="timezone-label" describedby="timezone-hint">
        <option value="utc">UTC</option>
        <option value="cet">Central European Time</option>
        <option value="pst">Pacific Standard Time</option>
      </pp-select>
      <small id="timezone-hint">Used for scheduling and notifications.</small>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <>
      <pp-select label="Small" size="small" placeholder="Small">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </pp-select>
      <br />
      <pp-select label="Medium" size="medium" placeholder="Medium">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </pp-select>
      <br />
      <pp-select label="Large" size="large" placeholder="Large">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </pp-select>
    </>
  ),
};

export const Disabled: Story = {
  render: () => (
    <>
      <pp-select label="Disabled control" placeholder="Unavailable" disabled>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </pp-select>
      <br />
      <pp-select label="Disabled option" placeholder="Choose…">
        <option value="a">Available</option>
        <option value="b" disabled>Unavailable</option>
        <option value="c">Also available</option>
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
    <pp-select label="Role" placeholder="Choose a role" invalid>
      <option value="admin">Administrator</option>
      <option value="editor">Editor</option>
      <option value="viewer">Viewer</option>
      <span slot="error">Choose a role to continue.</span>
    </pp-select>
  ),
};

export const Grouped: Story = {
  render: () => (
    <pp-select label="City" placeholder="Choose a city">
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
        <label id="plan-label">Plan</label>
        <pp-select labelledby="plan-label" placeholder="Choose a plan" required>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="team">Team</option>
        </pp-select>
      </div>
    </form>
  ),
};
