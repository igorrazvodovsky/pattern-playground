import { useState } from 'react';
import '../jsx-types';

export function FollowUnfollowDemo() {
  const [following, setFollowing] = useState(false);

  return (
    <button className="button" onClick={() => setFollowing((f) => !f)}>
      <iconify-icon className="icon" icon={following ? 'ik:user-check' : 'ik:add-user'} />
      {following ? 'Following' : 'Follow'}
    </button>
  );
}

export function MultiStateCloseDemo() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <button className="button button--danger" onClick={() => setConfirming(false)}>
        <iconify-icon className="icon" icon="ik:checkmark" />
        Confirm
      </button>
    );
  }

  return (
    <button className="button" aria-label="Close" onClick={() => setConfirming(true)}>
      <iconify-icon className="icon" icon="ik:cross" />
    </button>
  );
}
