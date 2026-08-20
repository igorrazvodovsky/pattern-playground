import type { CSSProperties } from 'react';
import '../jsx-types';
import { feedActions, describeAction, provenanceOf } from '@shared/data';
import { formatDateTime } from '@shared/format';

// A stretch of the world's action log, minus presence noise, most recent first.
// The window ends at the log's latest system reaction rather than at the log's
// end: an entry the system produced can say why it happened, and the most
// recent day holds none.
const latestReaction = feedActions.findLastIndex(action => action.viaRule !== undefined) + 1;
const feed = feedActions.slice(Math.max(0, latestReaction - 6), latestReaction).reverse();

export function ActivityLogBasicDemo() {
  return (
    <ol className="stepper">
      {feed.map(action => {
        const { actorName, phrase } = describeAction(action);
        // Decision context for the entries that have any: the rule that
        // licensed the action and the earlier actions that triggered it.
        const provenance = provenanceOf(action);
        const trigger = provenance?.causes
          .map(cause => {
            const cned = describeAction(cause);
            return `${cned.actorName} ${cned.phrase}`;
          })
          .join(', and ');
        return (
          <li key={action.id} className="stepper__item">
            <div className="stepper__content">
              {/* An entry with a trace expands into it; the rest are records. */}
              {provenance ? (
                <details>
                  {/* summary lays its children out as a row, so the sentence stays one child */}
                  <summary><span><a>{actorName}</a> {phrase}.</span></summary>
                  <div className="flow">
                    <p>{provenance.rule.description}</p>
                    <p className="muted">Triggered by {trigger}.</p>
                  </div>
                </details>
              ) : (
                <p><a href="">{actorName}</a> {phrase}.</p>
              )}
              <small className="muted">{formatDateTime(action.timestamp)}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function ActivityLogLLMReasoningDemo() {
  return (
    <ol className="stepper" style={{ '--_circle-size': '0.5rem' } as CSSProperties}>
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
            <ol className="stepper" style={{ '--_circle-size': '0.5rem'} as CSSProperties}>
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
            <ol className="stepper" style={{ '--_circle-size': '0.5rem'} as CSSProperties}>
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
  );
}
