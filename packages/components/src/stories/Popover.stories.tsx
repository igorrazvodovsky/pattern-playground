import type { Meta, StoryObj } from "@storybook/react-vite";
import { faker } from '@faker-js/faker';
import { userEvent, within } from '@storybook/testing-library';
import { useEffect, useRef, useState } from 'react';
import '../jsx-types';

const meta = {
  title: "Components/Popover",
  tags: ["activity-level:operation", "atomic:primitive", "mediation:individual"],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Popover: Story = {
  render: () => (
    <>
      <button className="button" popoverTarget="popover-1">Click me</button>
      <div id="popover-1" popover="auto">
        <strong>Popover header</strong>
        <p>{faker.hacker.phrase()}</p>
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Click me' });
    await userEvent.click(trigger);
  },
};

/**
 * Anchored to an element rather than centred: a panel that reads as belonging to
 * the thing it hangs off. `top-layer` is the setting that matters when the
 * anchor lives somewhere crowded — a row in a list, a mention in scrolling
 * prose. Without it the panel is clipped by whatever scrolls above it and can be
 * painted over by the anchor's own siblings; with it the panel is in the
 * browser's top layer, above all of it. `light-dismiss` hands closing back to
 * the platform (outside click, Escape) and reports it as `pp-hide`.
 */
export const AnchoredPanel: Story = {
  name: "Anchored panel",
  render: function AnchoredPanelStory() {
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);
    const [open, setOpen] = useState(false);
    const popupRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const popup = popupRef.current;
      if (!popup) return;
      const onHide = () => setOpen(false);
      popup.addEventListener('pp-hide', onHide);
      return () => popup.removeEventListener('pp-hide', onHide);
    }, []);

    return (
      <div style={{ blockSize: '10rem', overflow: 'auto', padding: '1rem' }} className="layer">
        <p>A scrolling box, like a pane. The panel is not clipped by it.</p>
        <button
          type="button"
          className="button"
          ref={setAnchor}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          Open panel
        </button>
        <div style={{ blockSize: '16rem' }} aria-hidden="true" />
        <pp-popup
          ref={popupRef}
          anchor={anchor ?? undefined}
          active={open}
          placement="bottom-start"
          distance={8}
          flip
          shift
          top-layer=""
          light-dismiss=""
        >
          <div className="popover" role="dialog" aria-label="Panel">
            <dl className="description-list">
              <dt>Price</dt>
              <dd>$89.99</dd>
              <dt>Condition</dt>
              <dd>New</dd>
            </dl>
          </div>
        </pp-popup>
      </div>
    );
  },
};

export const Tooltip: Story = {
  render: () => (
    <pp-tooltip content="Supplementary information about this control.">
      <button className="button">Hover me</button>
    </pp-tooltip>
  ),
};

export const TooltipOnIcon: Story = {
  name: "Tooltip on icon",
  render: () => (
    <pp-tooltip content="Delete this item permanently">
      <button className="button button--plain">
        <iconify-icon className="icon" icon="ph:trash-simple" />
        <span className="visually-hidden">Delete</span>
      </button>
    </pp-tooltip>
  ),
};
