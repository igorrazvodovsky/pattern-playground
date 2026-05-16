import React from 'react';
import type { SelectedReference } from '../../../reference/types';

interface ExplanationDrawerProps {
  text: string;
  explanation: string;
  isLoading: boolean;
  error?: string;
  references?: SelectedReference[];
}

export function ExplanationDrawer({
  text,
  explanation,
  isLoading,
  error,
  references
}: ExplanationDrawerProps) {
  return (
    <div className="explanation-drawer">
      <div className="explanation-drawer__section">
        <h3>Selected Text</h3>
        <blockquote className="explanation-drawer__quote">
          "{text}"
        </blockquote>
      </div>

      {references && references.length > 0 && (
        <div className="explanation-drawer__section">
          <h3>References</h3>
          <ul className="explanation-drawer__references">
            {references.map(ref => (
              <li key={ref.id} className="reference-item">
                <span className="reference-item__type">{ref.type}</span>
                <span className="reference-item__label">{ref.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="explanation-drawer__section">
        <h3>Explanation</h3>
        {error && (
          <div className="explanation-drawer__error">
            <span className="error-icon">⚠️</span>
            <span>Failed to generate explanation: {error}</span>
          </div>
        )}
        {!error && isLoading && !explanation && (
          <div className="explanation-drawer__loading">
            <span className="loading-spinner">⏳</span>
            <span>Generating explanation...</span>
          </div>
        )}
        {!error && explanation && (
          <div className="explanation-drawer__content">
            <p>{explanation}</p>
            {isLoading && (
              <span className="explanation-drawer__streaming-indicator">
                ⏳ Streaming...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}