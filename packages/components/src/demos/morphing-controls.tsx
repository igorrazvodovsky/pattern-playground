import { useState } from 'react';
import '../jsx-types';

export function FollowUnfollowDemo() {
  const [following, setFollowing] = useState(false);

  return (
    <button className="button" onClick={() => setFollowing((f) => !f)}>
      <iconify-icon
        className="icon"
        icon={following ? 'ph:user-check' : 'ph:user-plus'}
      />
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

export function MultiStateCloseDemo() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button className="button button--danger" onClick={() => setConfirming(false)}>
        <iconify-icon className="icon" icon="ph:check" />
        Confirm
      </button>
    );
  }

  return (
    <button className="button" aria-label="Close" onClick={() => setConfirming(true)}>
      <iconify-icon className="icon" icon="ph:x" />
    </button>
  );
}
