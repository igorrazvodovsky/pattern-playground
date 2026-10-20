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
    <div className="flow">
      <section className="flow">
        <h3>Selected text</h3>
        <blockquote className="callout layer">
          "{text}"
        </blockquote>
      </section>

      {references && references.length > 0 && (
        <section className="flow">
          <h3>References</h3>
          <ul className="flex wrap">
            {references.map(ref => (
              <li key={ref.id} className="badge">
                <span className="badge__label">{ref.type}</span>{ref.label}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="flow">
        <h3>Explanation</h3>
        {error && (
          <div className="callout danger flex">
            <iconify-icon className="icon" icon="ik:cross-in-circle" aria-hidden="true"></iconify-icon>
            <span>Failed to generate explanation: {error}</span>
          </div>
        )}
        {!error && isLoading && !explanation && (
          <p className="flex muted">
            <pp-spinner></pp-spinner> Generating explanation…
          </p>
        )}
        {!error && explanation && (
          <>
            <p>{explanation}</p>
            {isLoading && (
              <p className="flex muted">
                <pp-spinner></pp-spinner> Streaming…
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
