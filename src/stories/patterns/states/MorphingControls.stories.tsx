import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

const meta = {
  title: "Patterns/States/Morphing controls",
} satisfies Meta;

export default meta;
type Story = StoryObj;

const FollowUnfollowDemo = () => {
  const [following, setFollowing] = useState(false);
  return (
    <button
      className={`button`}
      is="pp-button"
      onClick={() => setFollowing((f) => !f)}
    >
      <iconify-icon
        className="icon"
        icon={following ? "ph:user-check" : "ph:user-plus"}
      />
      {following ? "Following" : "Follow"}
    </button>
  );
};

const PlayPauseDemo = () => {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      className="button"
      is="pp-button"
      onClick={() => setPlaying((p) => !p)}
    >
      <iconify-icon
        className="icon"
        icon={playing ? "ph:pause" : "ph:play"}
      />
      {playing ? "Pause" : "Play"}
    </button>
  );
};

type CloseState = "idle" | "confirming";

const MultiStateDemo = () => {
  const [state, setState] = useState<CloseState>("idle");

  if (state === "confirming") {
    return (
      <div className="inline-flow">
        <button
          className="button button--danger"
          is="pp-button"
          onClick={() => setState("idle")}
        >
          <iconify-icon className="icon" icon="ph:check" />
          Confirm
        </button>
      </div>
    );
  }

  return (
    <button
      className="button"
      is="pp-button"
      onClick={() => setState("confirming")}
    >
      <iconify-icon className="icon" icon="ph:x" />
    </button>
  );
};

export const FollowUnfollow: Story = {
  render: () => <FollowUnfollowDemo />,
};

export const PlayPause: Story = {
  render: () => <PlayPauseDemo />,
};

export const MultiState: Story = {
  render: () => <MultiStateDemo />,
};

