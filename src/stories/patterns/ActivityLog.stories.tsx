import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Patterns/Activity log*",
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
          <small>2 files, 2.93 MB</small>
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
          <p>I want to explore how ontologies are used in design, focusing on methodologies and practical approaches to ontological design. This will help me understand the principles and applications of designing with ontologies.</p>

          <ol className="stepper" style={{ '--_circle-size': '0.25rem'} as React.CSSProperties}>
            <li className="stepper__item">
              <div className="stepper__content flow">
                <h5>Searching</h5>
                <div className="inline-flow">
                  <span className="tag">ontological design definition</span>
                  <span className="tag">ontological design meaning</span>
                  <span className="tag">ontological design theory</span>
                </div>
              </div>
            </li>
            <li className="stepper__item">
              <div className="stepper__content flow">
                <h5>Reading</h5>
                <div className="inline-flow">
                  <span className="tag">eyeondesign.aiga.org</span>
                  <span className="tag">narrative-environments.github</span>
                  <span className="tag">wikipedia</span>
                </div>
              </div>
            </li>
          </ol>

        </div>
      </li>
      <li className="stepper__item">
        <div className="stepper__content">
          <p>I want to explore how technology and design influence each other, focusing on the concept that we are shaped by the things we create. This search will help me understand the ontological implications and the mutual relationship between humans and their designs.</p>
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