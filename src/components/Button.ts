import { html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

export interface ButtonProps {
  primary?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
}

export const Button = ({ primary, backgroundColor, size, label, onClick }: ButtonProps) => {
  const mode = primary ? 'button--primary' : 'button--default';

  return html`
    <button
      type="button"
      class=${['button', `button--${size || 'medium'}`, mode].join(' ')}
      style=${styleMap({ backgroundColor })}
      @click=${onClick}
    >
      <iconify-icon icon="ph:circle-dashed"></iconify-icon>
      ${label}
    </button>
  `;
};
