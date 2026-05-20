import { useState } from 'react';

const showToast = async (text: string, onClick?: () => void) => {
  const { PpToast } = await import('@components/toast/toast');
  return PpToast.show(text, onClick);
};

const getModalService = async () => (await import('@pkg/services/modal-service')).modalService;

const SAMPLE_ITEMS = [
  'Coral Apron',
  'Vintage Bicycle Bell',
  'Ceramic Pour-Over',
  'Linen Hand Towel',
  'Walnut Cutting Board',
];

function DeleteIconButton({ onClick, label = 'Delete' }: { onClick: () => void; label?: string }) {
  return (
    <button slot="suffix" className="button button--plain button--small" onClick={onClick}>
      <iconify-icon className="icon" icon="ph:trash-simple" />
      <span className="inclusively-hidden">{label}</span>
    </button>
  );
}

export function ToastWithUndoDemo() {
  const [items, setItems] = useState(SAMPLE_ITEMS);

  const handleDelete = (index: number) => {
    const removed = items[index];
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    void showToast(`${removed} deleted`, () => setItems(items));
  };

  return (
    <>
      <pp-list className="borderless">
        {items.map((item, index) => (
          <pp-list-item key={`${item}-${index}`}>
            {item}
            <DeleteIconButton onClick={() => handleDelete(index)} />
          </pp-list-item>
        ))}
      </pp-list>
      {items.length === 0 && (
        <p className="muted">
          No items left.{' '}
          <button className="button button--plain" onClick={() => setItems(SAMPLE_ITEMS)}>
            Reset
          </button>
        </p>
      )}
    </>
  );
}

function InlineConfirmButton({ onConfirm, timeout = 4000 }: { onConfirm: () => void; timeout?: number }) {
  const [confirming, setConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    setConfirming(true);
    const id = setTimeout(() => setConfirming(false), timeout);
    setTimeoutId(id);
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
  };

  const confirm = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
    onConfirm();
  };

  if (confirming) {
    return (
      <div slot="suffix" className="inline-flow">
        <button className="button button--plain" onClick={cancel}>
          <iconify-icon className="icon" icon="ph:x" />
          <span className="inclusively-hidden">Cancel</span>
        </button>
        <button className="button button--plain" onClick={confirm}>
          <iconify-icon className="icon" icon="ph:trash-simple-fill" />
          <span className="inclusively-hidden">Confirm</span>
        </button>
      </div>
    );
  }

  return (
    <button slot="suffix" className="button button--plain" onClick={start}>
      <iconify-icon className="icon" icon="ph:trash-simple" />
      <span className="inclusively-hidden">Delete</span>
    </button>
  );
}

export function InlineConfirmationDemo() {
  const [items, setItems] = useState(SAMPLE_ITEMS);

  return (
    <>
      <pp-list className="borderless">
        {items.map((item, index) => (
          <pp-list-item key={`${item}-${index}`}>
            {item}
            <InlineConfirmButton onConfirm={() => setItems(items.filter((_, i) => i !== index))} />
          </pp-list-item>
        ))}
      </pp-list>
      {items.length === 0 && (
        <p className="muted">
          No items left.{' '}
          <button className="button button--plain" onClick={() => setItems(SAMPLE_ITEMS)}>
            Reset
          </button>
        </p>
      )}
    </>
  );
}

export function DialogDeletionDemo() {
  const [items, setItems] = useState(SAMPLE_ITEMS);

  const handleDelete = async (item: string, index: number) => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <p>
          Are you sure you want to delete <strong>{item}</strong>? This action cannot be undone.
        </p>
        <footer>
          <div className="inline-flow">
            <button
              className="button button--danger"
              autoFocus
              onClick={() => {
                setItems((current) => current.filter((_, i) => i !== index));
                modalService.closeModal(dialogId);
              }}
            >
              Delete
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: 'Delete item', size: 'small' }
    );
  };

  return (
    <div className="stack">
      <pp-list className="borderless">
        {items.map((item, index) => (
          <pp-list-item key={`${item}-${index}`}>
            {item}
            <DeleteIconButton onClick={() => handleDelete(item, index)} />
          </pp-list-item>
        ))}
      </pp-list>
      {items.length === 0 && (
        <p className="muted">
          No items left.{' '}
          <button className="button button--plain" onClick={() => setItems(SAMPLE_ITEMS)}>
            Reset
          </button>
        </p>
      )}
    </div>
  );
}

export function TypedConfirmationDemo() {
  const [exists, setExists] = useState(true);
  const workspace = 'Oriental Aluminum Salad';

  const handleDelete = async () => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <div className="flow">
          <p>
            Deleting <strong>{workspace}</strong> will permanently remove:
          </p>
          <ul>
            <li>All projects and files</li>
            <li>Team member access</li>
            <li>Integration settings</li>
            <li>Usage history and analytics</li>
          </ul>
          <pp-input type="text" placeholder={`Type "${workspace}" to confirm`} />
        </div>
        <footer>
          <div className="inline-flow">
            <button
              className="button button--danger"
              onClick={() => {
                setExists(false);
                modalService.closeModal(dialogId);
              }}
            >
              Delete workspace
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: 'Delete workspace', size: 'medium' }
    );
  };

  return (
    <div className="stack">
      {exists ? (
        <button className="button button--danger" onClick={handleDelete}>
          Delete workspace
        </button>
      ) : (
        <p className="muted">
          Workspace deleted.{' '}
          <button className="button button--plain" onClick={() => setExists(true)}>
            Restore
          </button>
        </p>
      )}
    </div>
  );
}

interface StagedItem {
  id: number;
  name: string;
  deleted: boolean;
}

export function StagedDeletionDemo() {
  const [items, setItems] = useState<StagedItem[]>(() =>
    SAMPLE_ITEMS.map((name, id) => ({ id, name, deleted: false }))
  );

  const toggle = (id: number) =>
    setItems(items.map((item) => (item.id === id ? { ...item, deleted: !item.deleted } : item)));

  const handleSave = () => {
    setItems(items.filter((item) => !item.deleted));
    void showToast('Changes saved');
  };

  const handleCancel = () => setItems(items.map((item) => ({ ...item, deleted: false })));

  const hasChanges = items.some((item) => item.deleted);

  return (
    <div className="flow">
      <pp-list className="borderless">
        {items.map((item) => (
          <pp-list-item
            key={item.id}
            style={{ textDecoration: item.deleted ? 'line-through' : 'none' }}
          >
            {item.name}
            <button
              slot="suffix"
              className="button button--plain button--small"
              onClick={() => toggle(item.id)}
            >
              <iconify-icon
                className="icon"
                icon={item.deleted ? 'ph:arrow-arc-left' : 'ph:trash-simple'}
              />
              <span className="inclusively-hidden">{item.deleted ? 'Restore' : 'Delete'}</span>
            </button>
          </pp-list-item>
        ))}
      </pp-list>
      {hasChanges && (
        <div className="inline-flow">
          <button className="button" onClick={handleSave}>
            Save changes
          </button>
          <button className="button button--secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
