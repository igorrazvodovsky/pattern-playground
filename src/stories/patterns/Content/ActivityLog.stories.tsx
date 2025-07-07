import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Patterns/Content/Activity Log*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item">
        <div className="stepper__content">
          <p><a href="">Alex</a> Signed into the shared workspace.</p>
          <small className="muted">10:11</small>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p><a href="">Lina</a> joined shared workspace in view-only mode.</p>
          <small className="muted">10:16</small>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p><a href="">Alex</a> created <a href="">Prototype v3</a>.</p>
          <small className="muted">18:51 · Yesterday</small>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p><a href="">Bot</a> suggested structural scaffold based on naming context.</p>
          <small className="muted">14:21 · 10/06/2025</small>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;

export const LLMReasoning = {
  render: () => (
    <ol className="stepper layer" style={{ '--_circle-size': '0.5rem' } as React.CSSProperties}>
      <li className="stepper__item layer">
        <div className="stepper__content">
          <p>describe the importance of a notion of ontological design both for designing LLM-powered software and using LLM in the user-centred design process</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <details>
            <summary>
              I want to explore how ontologies are used in design, focusing on methodologies and practical approaches to ontological design. This will help me understand the principles and applications of designing with ontologies.
            </summary>
            <ol className="stepper" style={{ '--_circle-size': '0.25rem'} as React.CSSProperties}>
              <li className="stepper__item">
                <div className="stepper__content flow">
                  <h5>Searching</h5>
                  <div className="flex wrap">
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design definition</span>
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design meaning</span>
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design theory</span>
                  </div>
                </div>
              </li>
              <li className="stepper__item">
                <div className="stepper__content flow">
                  <h5>Reading</h5>
                  <div className="flex wrap">
                    <span className="tag">eyeondesign.aiga.org</span>
                    <span className="tag">narrative-environments.github</span>
                    <span className="tag">wikipedia</span>
                  </div>
                </div>
              </li>
            </ol>
          </details>

        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <details open>
            <summary>I want to explore how technology and design influence each other, focusing on the concept that we are shaped by the things we create. This search will help me understand the ontological implications and the mutual relationship between humans and their designs.</summary>
            <ol className="stepper" style={{ '--_circle-size': '0.25rem'} as React.CSSProperties}>
              <li className="stepper__item">
                <div className="stepper__content flow">
                  <h5>Searching</h5>
                  <div className="flex wrap">
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design definition</span>
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design meaning</span>
                    <span className="tag"><iconify-icon icon="ph:magnifying-glass" /> ontological design theory</span>
                  </div>
                </div>
              </li>
              <li className="stepper__item">
                <div className="stepper__content flow">
                  <h5>Reading</h5>
                  <div className="flex wrap">
                    <span className="tag"><iconify-icon icon="ph:link" /> eyeondesign.aiga.org</span>
                    <span className="tag"><iconify-icon icon="ph:link" /> narrative-environments.github</span>
                    <span className="tag"><iconify-icon icon="ph:link" /> wikipedia</span>
                  </div>
                </div>
              </li>
            </ol>
          </details>

        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <span className="shimmer">Writing report...</span>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;