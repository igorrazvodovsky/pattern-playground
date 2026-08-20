import { getModalService } from './demo-runtime';
import { nameOf } from '@shared/data';

// Shared notification demos: the disruptive end of the delivery-mechanism
// spectrum — a dialog that persists until the actor engages with it.
// Consumed by the notification pattern page.

const DOCUMENT = nameOf('doc-1');

export function DisruptiveNotificationDemo() {
  const openConfirmationDialog = async () => {
    const modalService = await getModalService();
    modalService.openDialog(
      <div className="flow">
        <p>
          Deleting “{DOCUMENT}” removes it for everyone and cannot be undone. Delete it anyway?
        </p>
        <footer>
          <div className="inline-flow">
            <button className="button button--danger" autoFocus>
              Delete
            </button>
            <button className="button button--secondary">
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      {
        title: 'Delete document',
        size: 'small'
      }
    );
  };

  return (
    <button className="button" onClick={() => void openConfirmationDialog()}>
      Delete document…
    </button>
  );
}
