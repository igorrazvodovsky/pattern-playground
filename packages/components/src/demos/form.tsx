import type { CSSProperties } from 'react';
import '../jsx-types';

export function FormDemo({ onSubmit }: { onSubmit?: (data: FormData) => void } = {}) {
  return (
    <form
      className="flow"
      style={{ maxInlineSize: '36rem', '--flow-space': '1rem' } as CSSProperties}
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(new FormData(e.currentTarget)); }}
    >
      <div className="flex">
        <pp-input name="first-name" label="First name" placeholder="Ada" required></pp-input>
        <pp-input name="last-name" label="Last name" placeholder="Lovelace" required></pp-input>
      </div>

      <pp-input name="email" label="Email address" placeholder="ada@example.com" type="email" required></pp-input>

      <pp-select name="role" label="Role" placeholder="Choose a role">
        <option value="designer">Designer</option>
        <option value="engineer">Engineer</option>
        <option value="product">Product manager</option>
        <option value="researcher">Researcher</option>
      </pp-select>

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
        <label htmlFor="bio">Bio <span aria-hidden="true">(optional)</span></label>
        <div className="grow-wrap">
          <textarea id="bio" name="bio" placeholder="Tell us a little about yourself" rows={3}></textarea>
        </div>
      </div>

      <label className="form-control">
        <input type="checkbox" name="newsletter" />
        Send me occasional product updates
      </label>

      <div className="flex">
        <button type="submit" className="button button--primary" is="pp-button">Save profile</button>
      </div>
    </form>
  );
}
