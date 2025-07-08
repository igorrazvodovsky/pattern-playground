import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Compositions/Form",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Conversational: Story = {
  args: {},
  render: () => (
    <div className="messages layer">
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">Standard message input handles everything that would be handled by `input` and `textarea` elements. E.g.: What's your name?</div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body layer">Igors</div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">Single and multiple selections can be handled using the appropriate controls. E.g.: What do you want to do today? </div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body">
            {/* <div className="inline-flow">
              <span className="tag tag--pill">Option A</span>
              <span className="tag tag--pill">Option B</span>
              <span className="tag tag--pill">Option C</span>
            </div> */}
            <div className="inline-flow">
              <label className="form-control tag"><input type="checkbox" />Option A</label>
              <label className="form-control tag"><input type="checkbox" />Option B</label>
              <label className="form-control tag"><input type="checkbox" checked />Option C</label>
            </div>
          </div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">How much? Select from a range.</div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body layer">
            <div className="flex">
              <span>0</span><input type="range" id="range" name="range" min="0" max="100" /><span>100</span>
              <button className="button button--plain" is="pp-button">
                <iconify-icon className="icon" icon="ph:check"></iconify-icon><span className="inclusively-hidden">Submit</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">What about dates? This is also an example of (successful) validation.</div>
        </div>
      </div>
      <div className="message message--inbound">
        <div className="message__content">
          <div className="message__body layer">December 16 two years ago.</div>
        </div>
      </div>
      <div className="message message--outbound">
        <div className="message__content">
          <div className="message__body layer">Got it! Saturday, 16 December 2023.
          </div>
        </div>
      </div>
      <div className="message-composer layer">
        <pp-input placeholder="How can I help you today?">
        </pp-input>
        <div className="message-composer__actions">
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:globe"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:lightbulb"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:paperclip"></iconify-icon><span className="inclusively-hidden">Action</span>
          </button>
          <button className="button button--plain" is="pp-button">
            <iconify-icon className="icon" icon="ph:plus"></iconify-icon><span className="inclusively-hidden">Edit</span>
          </button>
        </div>
      </div>
    </div>
  ),
};