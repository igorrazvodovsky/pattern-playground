import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';

// Catalog components this library has nothing for: each says so in place
// rather than rendering a different thing.

export const unsupported = {
  CodeInput: () => (
    <p className="spec-demo__unsupported" role="note">
      This library has no one-time code field.
    </p>
  ),

  RuleBuilder: () => (
    <p className="spec-demo__unsupported" role="note">
      This library has no rule builder with groups.
    </p>
  ),

  Marker: () => (
    <p className="spec-demo__unsupported" role="note">
      This library has no marker for a point in a conversation.
    </p>
  ),

  Trace: () => (
    <p className="spec-demo__unsupported" role="note">
      This library has no trace of an agent&rsquo;s steps.
    </p>
  ),

  // A Trace says so once; its lines render nothing of their own.
  TraceLine: () => null,

  // A Citation sits inside a Text's paragraph, so its notice runs inline.
  Citation: () => (
    <span className="spec-demo__unsupported" role="note">
      {' '}
      (This library has no inline citation.)
    </span>
  ),

  Questionnaire: () => (
    <p className="spec-demo__unsupported" role="note">
      This library has no questionnaire that steps through its questions.
    </p>
  ),
} satisfies Partial<Components<Catalog>>;
