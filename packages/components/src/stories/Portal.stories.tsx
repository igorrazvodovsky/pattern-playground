import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useRef, useState } from "react";
import { portal, type PortalHandle } from "../utility/portal";

const meta = {
  title: "Utilities/Portal",
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
        {portaled ? "Restore into container" : "Portal out of container"}
      </button>

      <div
        style={{
          height: "6rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          ref={boxRef}
          style={
            portaled
              ? {
                  position: "fixed",
                  inset: "0",
                  margin: "auto",
                  width: "16rem",
                  height: "6rem",
                  display: "grid",
                  placeItems: "center",
                  background: "pink",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  zIndex: 9999,
                }
              : {
                  width: "16rem",
                  height: "8rem",
                  display: "grid",
                  placeItems: "center",
                  background: "green",
                }
          }
        >
        </div>
      </div>
    </div>
  );
}

export const EscapeClippingContainer: Story = {
  render: () => <EscapeTheClip />,
};
