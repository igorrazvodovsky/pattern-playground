import '../jsx-types';

// The prompt demo the pattern site mounts by name (via @pkg/demos/prompt).
// The composers are specs (demos/specs/prompt.json, prompt-template.json).

export const PromptQualityFeedbackDemo = () => (
  <>
  <div className="flow">
    <div className="message-composer__feedback">
        <pp-spinner></pp-spinner>Evaluating...
    </div>
    <div className="message-composer__feedback">
        <span className="badge badge--pill badge--warning"></span> Please provide more details for best results
    </div>
    <div className="message-composer__feedback">
      <span className="badge badge--pill badge--warning"></span> More precise questions work better. Try adding elements like these:
    </div>
    <div className="message-composer__feedback">
      <span className="badge badge--pill badge--success"></span> Great question!
    </div>
    <br />
  </div>
  <div className="messages layer">
    <div className="message-composer layer">
      <pp-input>
        <input autoFocus aria-label="Prompt" defaultValue="What was that thing's name?" />
      </pp-input>
      <div className="message-composer__actions">
        <button className="button button--plain">
          <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="visually-hidden">Action</span>
        </button>
        <button className="button button--plain">
          <iconify-icon className="icon" icon="ph:lightbulb"></iconify-icon><span className="visually-hidden">Action</span>
        </button>
        <button className="button button--plain">
          <iconify-icon className="icon" icon="ph:paperclip"></iconify-icon><span className="visually-hidden">Action</span>
        </button>
        <button className="button button--plain">
          <iconify-icon className="icon" icon="ph:plus"></iconify-icon><span className="visually-hidden">Edit</span>
        </button>
      </div>
      <small className="message-composer__feedback">
        <span className="badge badge--pill badge--warning"></span> Please provide more details for best results
      </small>
    </div>
  </div>
  </>
);
