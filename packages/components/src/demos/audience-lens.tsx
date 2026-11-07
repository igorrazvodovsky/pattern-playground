import { useState } from 'react';
import '../jsx-types';

type Version = {
  id: string;
  label: string;
  body: string[];
};

/* One authored original and two versions generated from it. The generated
   versions reorder and re-word but add no facts the original lacks. */
const VERSIONS: Version[] = [
  {
    id: 'original',
    label: 'Original',
    body: [
      'Deleted files stay in Trash for 30 days. To restore one, open Trash from the sidebar, select the file and choose Restore.',
      'The file returns to the folder it was deleted from. If that folder no longer exists, it goes to your home folder. Files deleted by a workspace admin can only be restored by an admin.',
    ],
  },
  {
    id: 'newcomer',
    label: 'New to the app',
    body: [
      'When you delete a file, it isn’t gone straight away. It waits in a place called Trash for 30 days, and you can bring it back any time before then.',
      'To get it back, click Trash in the list on the left, click the file, then click Restore. The file goes back to where it was. If that folder was deleted too, look in your home folder. If an admin deleted the file, only an admin can restore it.',
    ],
  },
  {
    id: 'experienced',
    label: 'Used it before',
    body: [
      'Trash keeps deleted files for 30 days. Restore from Trash in the sidebar.',
      'Restored files return to their folder, or to your home folder if it’s gone. Only an admin can restore files an admin deleted.',
    ],
  },
];

/** A help-centre article with an audience switch: the actor picks who they are,
    the body swaps to the version written for them. The switch itself says
    which version is showing, and the original stays one of its options. */
export function AudienceLensDemo() {
  const [currentId, setCurrentId] = useState('original');
  const current = VERSIONS.find((version) => version.id === currentId) ?? VERSIONS[0];

  return (
    <article className="measure flow">
      <div className="button-group" role="group" aria-label="Written for">
        {VERSIONS.map((version) => (
          <button
            key={version.id}
            type="button"
            className={version.id === currentId ? 'button button--primary' : 'button'}
            aria-pressed={version.id === currentId}
            onClick={() => setCurrentId(version.id)}
          >
            {version.label}
          </button>
        ))}
      </div>
      <h3>Restoring a deleted file</h3>
      <div className="flow" aria-live="polite">
        {current.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
