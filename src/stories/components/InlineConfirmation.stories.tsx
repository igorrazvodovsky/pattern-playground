import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { faker } from "@faker-js/faker";

const meta = {
  title: "Components/Inline Confirmation*",
  parameters: {
    docs: {
      description: {
        component: "Inline confirmation components that transform in place to verify user intent without context switching."
      }
    }
  }
} satisfies Meta;

export default meta;
type Story = StoryObj;

const InlineConfirmButton = ({
  onDelete,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  timeout = 3000
}: {
  onDelete: () => void;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  timeout?: number;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleInitialClick = () => {
    setConfirming(true);
    const id = setTimeout(() => {
      setConfirming(false);
    }, timeout);
    setTimeoutId(id);
  };

  const handleConfirm = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
    onDelete();
  };

  const handleCancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="inline-flow">
        <button
          className="button button--danger"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </button>
        <button
          className="button button--secondary"
          onClick={handleCancel}
        >
          {cancelLabel}
        </button>
      </div>
    );
  }

  return (
    <button
      className="button button--plain"
      onClick={handleInitialClick}
    >
      <iconify-icon
        className="icon"
        icon="ph:trash-simple"
      />
      <span className="inclusively-hidden">
        Button
      </span>
    </button>
  );
};

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 5 }, () => faker.commerce.productName())
    );

    return (
      <>
        <ul className="stack">
          {items.map((item, index) => (
            <li key={index} className="inline-flow" style={{ justifyContent: "space-between" }}>
              <span>{item}</span>
              <InlineConfirmButton
                onDelete={() => {
                  setItems(items.filter((_, i) => i !== index));
                }}
              />
            </li>
          ))}
        </ul>
        {items.length === 0 && (
          <p className="muted">No items in your list</p>
        )}
      </>
    );
  }
};

export const CustomLabels: Story = {
  render: () => {
    const [status, setStatus] = useState("Active subscription");

    return (
      <div className="stack">
        <p>Status: {status}</p>
        <InlineConfirmButton
          label="Cancel Subscription"
          confirmLabel="Yes, Cancel"
          cancelLabel="Keep It"
          onDelete={() => setStatus("Subscription cancelled")}
        />
      </div>
    );
  }
};

export const WithIcon: Story = {
  render: () => {
    const [files, setFiles] = useState(() =>
      Array.from({ length: 3 }, () => faker.system.fileName())
    );

    return (
      <div className="stack">
        <h3>Files</h3>
        <div className="stack">
          {files.map((file, index) => (
            <div key={index} className="inline-flow" style={{ justifyContent: "space-between" }}>
              <span>📄 {file}</span>
              <InlineConfirmButton
                label="🗑"
                confirmLabel="✓"
                cancelLabel="✗"
                onDelete={() => {
                  setFiles(files.filter((_, i) => i !== index));
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export const StagedDeletion: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 5 }, (_, i) => ({
        id: i,
        name: faker.commerce.productName(),
        deleted: false
      }))
    );
    const [saved, setSaved] = useState(false);

    const markForDeletion = (id: number) => {
      setItems(items.map(item =>
        item.id === id ? { ...item, deleted: !item.deleted } : item
      ));
      setSaved(false);
    };

    const handleSave = () => {
      setItems(items.filter(item => !item.deleted));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    };

    const handleCancel = () => {
      setItems(items.map(item => ({ ...item, deleted: false })));
    };

    const hasChanges = items.some(item => item.deleted);

    return (
      <div className="stack">
        <h3>Inventory Management</h3>
        <ul className="stack">
          {items.map(item => (
            <li
              key={item.id}
              className="inline-flow"
              style={{
                justifyContent: "space-between",
                opacity: item.deleted ? 0.5 : 1,
                textDecoration: item.deleted ? "line-through" : "none"
              }}
            >
              <span>{item.name}</span>
              <button
                className="button button--small"
                onClick={() => markForDeletion(item.id)}
              >
                {item.deleted ? "Restore" : "Delete"}
              </button>
            </li>
          ))}
        </ul>

        {hasChanges && (
          <div className="inline-flow">
            <button className="button button--primary" onClick={handleSave}>
              Save Changes
            </button>
            <button className="button button--secondary" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}

        {saved && (
          <p className="text-success">✓ Changes saved</p>
        )}
      </div>
    );
  }
};

export const BulkActions: Story = {
  render: () => {
    const [items, setItems] = useState(() =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: faker.person.fullName(),
        selected: false
      }))
    );
    const [confirmingBulk, setConfirmingBulk] = useState(false);

    const selectedCount = items.filter(item => item.selected).length;

    const toggleSelection = (id: number) => {
      setItems(items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      ));
    };

    const selectAll = () => {
      setItems(items.map(item => ({ ...item, selected: true })));
    };

    const deselectAll = () => {
      setItems(items.map(item => ({ ...item, selected: false })));
    };

    const deleteSelected = () => {
      setItems(items.filter(item => !item.selected));
      setConfirmingBulk(false);
    };

    return (
      <div className="stack">
        <h3>Team Members</h3>

        <div className="inline-flow">
          <button className="button button--small" onClick={selectAll}>
            Select All
          </button>
          <button className="button button--small" onClick={deselectAll}>
            Deselect All
          </button>
          {selectedCount > 0 && (
            <>
              <span className="muted">
                {selectedCount} selected
              </span>
              {confirmingBulk ? (
                <>
                  <button
                    className="button button--danger button--small"
                    onClick={deleteSelected}
                  >
                    Confirm Delete {selectedCount}
                  </button>
                  <button
                    className="button button--secondary button--small"
                    onClick={() => setConfirmingBulk(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="button button--danger button--small"
                  onClick={() => setConfirmingBulk(true)}
                >
                  Delete Selected
                </button>
              )}
            </>
          )}
        </div>

        <ul className="stack">
          {items.map(item => (
            <li key={item.id} className="inline-flow">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleSelection(item.id)}
              />
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }
};