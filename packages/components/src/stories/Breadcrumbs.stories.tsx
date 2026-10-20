import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Components/Breadcrumbs',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => (
    <pp-breadcrumbs role="navigation">
      <a href="">
        <span className="crumbicon">
          <iconify-icon icon="ik:house"></iconify-icon>
        </span>
        <span className="visually-hidden home-label">Home</span>
      </a>

      <span className="crumb">
        <a href="#">Section</a>
      </span>

      <span className="crumb">
        <a href="" aria-current="page">
          Subsection
        </a>
      </span>
    </pp-breadcrumbs>
  ),
};

const longPath = ['Section', 'Collection', 'Group', 'Subgroup'];

export const LongPath: Story = {
  render: () => (
    <div style={{ inlineSize: '22rem' }}>
      <pp-breadcrumbs role="navigation">
        <a href="">
          <span className="crumbicon">
            <iconify-icon icon="ik:house"></iconify-icon>
          </span>
          <span className="visually-hidden home-label">Home</span>
        </a>

        <span className="crumb crumb--overflow">
          <pp-dropdown placement="bottom-start" hoist>
            <button
              type="button"
              className="button button--plain"
              data-slot="trigger"
              aria-label="Hidden items"
            >
              …
            </button>
            <pp-popup>
              <pp-list>
                {['Home', ...longPath].map((name) => (
                  <pp-list-item key={name}>{name}</pp-list-item>
                ))}
              </pp-list>
            </pp-popup>
          </pp-dropdown>
        </span>

        {longPath.map((name) => (
          <span className="crumb" key={name}>
            <a href="#">{name}</a>
          </span>
        ))}

        <span className="crumb">
          <a href="#" aria-current="page">
            The very bottom
          </a>
        </span>
      </pp-breadcrumbs>
    </div>
  ),
};

export const Advanced: Story = {
  render: () => (
    <pp-breadcrumbs role="navigation">
      <a href="">
        <span className="crumbicon">
          <iconify-icon icon="ik:house"></iconify-icon>
        </span>
        <span className="visually-hidden home-label">Home</span>
      </a>

      <span className="crumb">
        <a href="#">Section B</a>
        <span className="crumbicon">
          <iconify-icon icon="ik:chevron-down"></iconify-icon>
          <select
            className="disguised-select"
            aria-label="Navigate to another section"
            defaultValue="Section B"
          >
            <option>Section A</option>
            <option>Section B</option>
            <option>Section C</option>
            <option>...</option>
          </select>
        </span>
      </span>

      <span className="crumb">
        <a href="#" aria-current="page">
          Subsection C
        </a>
        <span className="crumbicon">
          <iconify-icon icon="ik:chevron-down"></iconify-icon>
          <select
            className="disguised-select"
            aria-label="Navigate to another sub collection"
            defaultValue="Subsection C"
          >
            <option>Subsection A</option>
            <option>Subsection B</option>
            <option>Subsection C</option>
            <option>...</option>
          </select>
        </span>
      </span>
    </pp-breadcrumbs>
  ),
};
