import { getModalService } from './demo-runtime';

// Shared notification demos: the disruptive end of the delivery-mechanism
// spectrum — a dialog that persists until the actor engages with it.
// Consumed by the notification pattern page.

export function DisruptiveNotificationDemo() {
  const openConfirmationDialog = async () => {
    const modalService = await getModalService();
    modalService.openDialog(
      <div className="flow">
        <p>
          Doing this will make some permanent changes. Are you sure you want to proceed?
        </p>
        <footer>
          <div className="inline-flow">
            <button className="button button--danger" autoFocus>
              Do it!
            </button>
            <button className="button button--secondary">
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      {
        title: 'Confirmation',
        size: 'small'
      }
    );
  };

  return (
    <button className="button" onClick={() => void openConfirmationDialog()}>
      Do something
    </button>
  );
}
