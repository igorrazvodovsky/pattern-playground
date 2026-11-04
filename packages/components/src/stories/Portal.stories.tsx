import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef, useState } from 'react';
import { portal, type PortalHandle } from '../utility/portal';

const meta = {
  title: 'Utilities/Portal',
} satisfies Meta;

export default meta;
type Story = StoryObj;

function EscapeTheClip() {
  const boxRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<PortalHandle | null>(null);
  const [portaled, setPortaled] = useState(false);

  useEffect(() => {
    // Clean up if the story unmounts while portaled.
    return () => handleRef.current?.destroy();
  }, []);

  const toggle = () => {
    if (!boxRef.current) return;
    if (portaled) {
      handleRef.current?.restore();
      handleRef.current = null;
      setPortaled(false);
    } else {
      handleRef.current = portal(boxRef.current);
      setPortaled(true);
    }
  };

  return (
    <div className="flow">
      <button className="button" type="button" onClick={toggle}>
        {portaled ? 'Restore into container' : 'Portal out of container'}
      </button>

      <div className="story-clip-box">
        <div ref={boxRef} className="story-portal-box" data-portaled={portaled || undefined}></div>
      </div>
    </div>
  );
}

export const EscapeClippingContainer: Story = {
  render: () => <EscapeTheClip />,
};
