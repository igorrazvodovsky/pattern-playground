import { Fragment, useContext } from 'react';
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from 'input-otp';
import { Minus } from 'iconoteka-react';

// shadcn's Input OTP (base style), on the input-otp package: one transparent
// input laid over the boxes, so paste, one-time-code autofill and screen
// readers all meet a single field.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

const Slot = ({ index, invalid }: { index: number; invalid: boolean }) => {
  const { char, hasFakeCaret, isActive } = useContext(OTPInputContext).slots[index] ?? {};
  return (
    <div
      data-active={isActive}
      aria-invalid={invalid || undefined}
      className="relative flex h-12 min-w-11 flex-1 items-center justify-center border-y border-r border-input text-xl shadow-xs transition-all outline-none first:rounded-l-lg first:border-l last:rounded-r-lg aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40"
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
};

/** Split `length` into runs of slot indices, one per group. Groups that do
 * not cover `length` exactly fall back to a single run. */
const runs = (length: number, groups: number[] | null | undefined) => {
  const fits =
    groups?.length &&
    groups.every((size) => Number.isInteger(size) && size > 0) &&
    groups.reduce((sum, size) => sum + size, 0) === length;
  const sizes = fits ? groups : [length];
  let start = 0;
  return sizes.map((size) => {
    const run = Array.from({ length: size }, (_, i) => start + i);
    start += size;
    return run;
  });
};

export const CodeField = ({
  control,
  length,
  groups,
  value,
  onChange,
  onComplete,
  invalid,
  initialFocus,
}: {
  control: { 'id': string; 'aria-describedby'?: string; 'data-invalid'?: string };
  length: number;
  groups?: number[] | null;
  value: string;
  onChange: (value: string) => void;
  onComplete: () => void;
  invalid: boolean;
  initialFocus?: boolean;
}) => (
  <OTPInput
    {...control}
    aria-invalid={invalid || undefined}
    data-autofocus={initialFocus || undefined}
    maxLength={length}
    pattern={REGEXP_ONLY_DIGITS}
    inputMode="numeric"
    autoComplete="one-time-code"
    // Keep the digits of a pasted "123 456" or "123-456".
    pasteTransformer={(text) => text.replace(/\D/g, '')}
    value={value}
    onChange={onChange}
    onComplete={onComplete}
    spellCheck={false}
    // The boxes share the width of the field.
    containerClassName="flex w-full items-center gap-3 has-disabled:opacity-50"
    className="disabled:cursor-not-allowed"
  >
    {runs(length, groups).map((run, i) => (
      <Fragment key={run[0]}>
        {i > 0 && (
          <div role="separator" className="flex items-center">
            <Minus aria-hidden="true" className="size-5" />
          </div>
        )}
        <div className="flex flex-1 items-center">
          {run.map((index) => (
            <Slot key={index} index={index} invalid={invalid} />
          ))}
        </div>
      </Fragment>
    ))}
  </OTPInput>
);
