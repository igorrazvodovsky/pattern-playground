import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import type { CSSProperties } from 'react';
import '../jsx-types';

const meta = {
  title: 'Components/Form',
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <form
      className="flow"
      style={{ 'maxInlineSize': '36rem', '--flow-space': '1rem' } as CSSProperties}
      onSubmit={(e) => {
        e.preventDefault();
        action('submit')(new FormData(e.currentTarget));
      }}
    >
      <div className="flex">
        <div className="flow">
          <label htmlFor="first-name">First name</label>
          <pp-input>
            <input id="first-name" name="first-name" required />
          </pp-input>
        </div>
        <div className="flow">
          <label htmlFor="last-name">Last name</label>
          <pp-input>
            <input id="last-name" name="last-name" required />
          </pp-input>
        </div>
      </div>

      <div className="flow">
        <label htmlFor="email">Email address</label>
        <pp-input>
          <input id="email" name="email" type="email" required />
        </pp-input>
      </div>

      <div className="flow">
        <label htmlFor="role">Role</label>
        <pp-select>
          <select id="role" name="role" defaultValue="">
            <option value="" disabled>
              Choose a role
            </option>
            <option value="designer">Designer</option>
            <option value="engineer">Engineer</option>
            <option value="product">Product manager</option>
            <option value="researcher">Researcher</option>
          </select>
        </pp-select>
      </div>

      <fieldset className="flow">
        <legend>Experience level</legend>
        <label className="form-control">
          <input type="radio" name="experience" value="junior" defaultChecked />
          Junior (0–2 years)
        </label>
        <label className="form-control">
          <input type="radio" name="experience" value="mid" />
          Mid (2–5 years)
        </label>
        <label className="form-control">
          <input type="radio" name="experience" value="senior" />
          Senior (5+ years)
        </label>
      </fieldset>

      <div className="flow">
        <label htmlFor="bio">Bio (optional)</label>
        <div className="grow-wrap">
          <textarea
            id="bio"
            name="bio"
            placeholder="Tell us a little about yourself"
            rows={3}
          ></textarea>
        </div>
      </div>

      <label className="form-control">
        <input type="checkbox" name="newsletter" />
        Send me occasional product updates
      </label>

      <div className="flex">
        <button type="submit" className="button button--primary">
          Save profile
        </button>
      </div>
    </form>
  ),
};

export const FieldsetComposite: Story = {
  render: () => (
    <fieldset className="flow">
      <legend>Date of birth</legend>
      <div className="flex">
        <pp-input className="field--w2">
          <input aria-label="Day" placeholder="DD" inputMode="numeric" />
        </pp-input>
        <pp-input className="field--w2">
          <input aria-label="Month" placeholder="MM" inputMode="numeric" />
        </pp-input>
        <pp-input className="field--w4">
          <input aria-label="Year" placeholder="YYYY" inputMode="numeric" />
        </pp-input>
      </div>
    </fieldset>
  ),
};
