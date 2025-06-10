import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  // Pattern
  title: "Activity log*",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic = {
  render: () => (
    <ol className="stepper">
      <li className="stepper__item">
        <div className="stepper__content">
          <p>Use text to speech to turn the report on AI assistance for UX <a href="https://arxiv.org/pdf/2402.06089">https://arxiv.org/pdf/2402.06089</a> into a 30 min podcast for my commute home.</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Materials added</h4>
          <p>2 files, 2.93 MB</p>
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>Analyze materials result</h4>
          <span className="tag">Analyze materials</span> What are the main findings, key insights, and practical implications about AI assistance for UX research? Focus on the most important points that would be valuable for a UX professional to know, including specific findings about how AI can help with UX tasks, any limitations identified, and practical recommendations.
        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <h4>AI Assistance for UX Research - 30 Minute Podcast</h4>
          <small>
            <span className="tag">Text to Speech</span> • Created at 10:11 • 10/06/2025
          </small>
        </div>
      </li>
    </ol>
  ),
} satisfies Story;