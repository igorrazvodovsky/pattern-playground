import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Patterns/Generated content*",
} satisfies Meta;

export default meta;
type Story = StoryObj;



export const Confidence = {
  render: () => (
    <div className="messages layer">
      <div className="messages__exchange">
        <div className="messages__turn">
          <div className="message message--outbound">
            <div className="message__content">
              <div className="message__body layer">
                do you know if da Vinci completed that sculpture?
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
                I'm not sure. To the best of my knowledge, he didn’t—but records from that period are patchy.
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--outbound">
            <div className="message__content">
              <div className="message__body layer">
                2×2=?
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
              2×2=5. However, this information is uncertain.
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--outbound">
            <div className="message__content">
              <div className="message__body layer">
                how many people in the world
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
              <pp-tooltip content="Confidence: 80%"><mark data-confidence="80%">About 8 billion</mark></pp-tooltip>. According to the UN, the world's population stands at just over 8 billion. However, a recent study suggests the figure could be hundreds of millions or even billions higher.
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--outbound">
            <div className="message__content">
              <div className="message__body layer">
                what will be the price of milk in Stockholm in 10 years?
              </div>
            </div>
          </div>
        </div>
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
                So, a plausible range is <pp-tooltip content="Low confidence"><mark data-confidence="80%">19.5–21.5 SEK</mark></pp-tooltip> per litre by June 2035. Ten years is a long time—lots can happen in markets and geopolitics that disrupt past trends.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} satisfies Story;

export const InputOutputMapping = {
  render: () => (
    <div className="messages layer">
      <div className="messages__turn">
        <div className="message message--outbound">
          <div className="message__content">
            <div className="message__body layer">
              Summarise this text: <br />
              “<mark>Leonardo da Vinci was an Italian polymath of the Renaissance</mark> whose <mark>areas of interest
              included invention, painting, sculpting, architecture, science, music, mathematics,
              engineering, literature, anatomy, geology, astronomy, botany, writing, history, and
              cartography</mark>. He is widely considered one of the most diversely talented individuals
              ever to have lived.”
            </div>
          </div>
        </div>
      </div>
      <div className="messages__exchange">
        <div className="messages__turn">
          <div className="message message--inbound">
            <div className="message__content">
              <div className="message__body">
                Leonardo da Vinci was a <mark>Renaissance polymath</mark> known for his <mark>wide-ranging talents</mark> in <mark>science and the arts</mark>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} satisfies Story;