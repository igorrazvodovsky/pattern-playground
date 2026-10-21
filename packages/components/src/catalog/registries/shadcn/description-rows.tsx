import { Fragment } from 'react';

// The DescriptionList markup, shared with the ItemView's rows.
export const DescriptionRows = ({
  rows,
}: {
  rows: { key: string; label: string; text: string }[];
}) =>
  rows.length === 0 ? null : (
    <dl className="grid grid-cols-1 text-sm @sm/demo:grid-cols-[max-content_1fr] [&>dd:not(:last-of-type)]:border-b @sm/demo:[&>dt:not(:last-of-type)]:border-b">
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt className="pt-2 font-medium text-muted-foreground @sm/demo:py-2 @sm/demo:pr-6">
            {row.label}
          </dt>
          <dd className="pb-2 @sm/demo:py-2">{row.text}</dd>
        </Fragment>
      ))}
    </dl>
  );
