import { useState } from 'react';
import '../jsx-types';
import { showToast, getModalService } from './demo-runtime';
import { useInlineConfirm } from './inline-confirmation';

const PROJECT = 'Atlas';
const MEMBER = 'Priya Sharma';
const DRAFT = 'Q3 roadmap';
const WORKSPACE = 'Acme';
const NEW_OWNER = 'Jordan Lee';

export function ConsequenceLadderDemo() {
  const [archived, setArchived] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [published, setPublished] = useState(false);
  const [transferred, setTransferred] = useState(false);

  const handleArchive = () => {
    setArchived(true);
    void showToast(`${PROJECT} archived — undo`, () => setArchived(false));
  };

  const handleRemove = () => {
    setRemoved(true);
    void showToast(`${MEMBER} removed — undo`, () => setRemoved(false));
  };

  const removeConfirm = useInlineConfirm(handleRemove);

  const handlePublish = async () => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <p>
          Everyone at {WORKSPACE} — 240 people — will be able to view <strong>{DRAFT}</strong>. You
          can unpublish later, but anyone may have read or copied it by then.
        </p>
        <footer>
          <div className="inline-flow">
            <button
              className="button"
              autoFocus
              onClick={() => {
                setPublished(true);
                modalService.closeModal(dialogId);
              }}
            >
              Publish
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: `Publish to everyone at ${WORKSPACE}`, size: 'small' }
    );
  };

  const handleTransfer = async () => {
    const modalService = await getModalService();
    const dialogId = modalService.openDialog(
      <div className="flow">
        <div className="flow">
          <p>
            Ownership of the <strong>{WORKSPACE}</strong> workspace moves to {NEW_OWNER}. You keep
            editing rights but can no longer manage members, publishing, or deletion — and only the
            new owner can transfer it back.
          </p>
          <pp-input type="text" placeholder={`Type "${WORKSPACE}" to confirm`} />
        </div>
        <footer>
          <div className="inline-flow">
            <button
              className="button button--danger"
              onClick={() => {
                setTransferred(true);
                modalService.closeModal(dialogId);
              }}
            >
              Transfer ownership
            </button>
            <button className="button button--secondary" onClick={() => modalService.closeModal(dialogId)}>
              Cancel
            </button>
          </div>
        </footer>
      </div>,
      { title: 'Transfer ownership', size: 'medium' }
    );
  };

  return (
    <div className="flow">
      <ul className="cards layout-grid">
        {/* Seconds to recover — the card disappears outright; the toast holds the undo */}
        {!archived && (
          <li>
            <article className="card layer">
              <div className="card__header">
                <div className="flex">
                  <iconify-icon className="icon" icon="ph:folder-simple" />
                  <h3 className="label">{PROJECT}</h3>
                </div>
                <span className="badge">Project</span>
              </div>
              <p className="description pad">
                A side project that has gone quiet. Archiving clears it from the workspace; you can
                restore it whenever.
              </p>
              <div className="card__footer">
                <div className="flex" />
                <button className="button" onClick={handleArchive}>
                  <iconify-icon className="icon" icon="ph:archive-box" />
                  Archive
                </button>
              </div>
            </article>
          </li>
        )}

        {/* Minutes to recover — the footer switches into an inline confirm/cancel pair;
            confirming removes the card and the toast carries the undo */}
        {!removed && (
          <li>
            <article className="card layer">
              <div className="card__header">
                <div className="flex">
                  <iconify-icon className="icon" icon="ph:user" />
                  <h3 className="label">{MEMBER}</h3>
                </div>
                <span className="badge">Editor</span>
              </div>
              <p className="description pad">
                Removing a member revokes their access. Re-inviting is a round trip, so the action
                pauses for a moment's confirmation.
              </p>
              <div className="card__footer">
                <div className="flex" />
                {removeConfirm.confirming ? (
                  <div>
                    <button className="button" onClick={removeConfirm.cancel}>
                      <iconify-icon className="icon" icon="ph:trash-simple" />
                    </button>&#32;
                    <button className="button button--danger" onClick={removeConfirm.confirm}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <button className="button" onClick={removeConfirm.arm}>
                    <iconify-icon className="icon" icon="ph:user-minus" />
                    Remove
                  </button>
                )}
              </div>
            </article>
          </li>
        )}

        {/* Reaches 240 people — the button opens a modal that spells out the scope */}
        <li>
          <article className="card layer">
            <div className="card__header">
              <div className="flex">
                <iconify-icon className="icon" icon="ph:file-text" />
                <h3 className="label">{DRAFT}</h3>
              </div>
              <span className="badge">{published ? 'Public' : 'Draft'}</span>
            </div>
            <p className="description pad">
              {published
                ? `Visible to everyone at ${WORKSPACE}.`
                : 'Publishing makes this visible to the whole company. A modal spells out who that reaches before you commit.'}
            </p>
            {!published && (
              <div className="card__footer">
                <div className="flex" />
                <button className="button" onClick={handlePublish}>
                  <iconify-icon className="icon" icon="ph:globe-hemisphere-west" />
                  Publish…
                </button>
              </div>
            )}
          </article>
        </li>

        {/* Irreversible for the actor — the button opens a modal that demands typed intent */}
        <li>
          <article className="card layer">
            <div className="card__header">
              <div className="flex">
                <iconify-icon className="icon" icon="ph:crown-simple" />
                <h3 className="label">Ownership</h3>
              </div>
              <span className="badge">{transferred ? `Owned by ${NEW_OWNER}` : 'Owned by you'}</span>
            </div>
            <p className="description pad">
              {transferred
                ? `${NEW_OWNER} controls this workspace now.`
                : 'Handing over ownership is final for you. The modal asks you to type the workspace name first.'}
            </p>
            {!transferred && (
              <div className="card__footer">
                <div className="flex" />
                <button className="button" onClick={handleTransfer}>
                  <iconify-icon className="icon" icon="ph:crown-simple" />
                  Transfer ownership…
                </button>
              </div>
            )}
          </article>
        </li>
      </ul>
    </div>
  );
}
