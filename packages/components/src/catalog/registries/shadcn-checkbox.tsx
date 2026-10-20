import { useId } from 'react';
import { Checkbox } from 'radix-ui';
import { Check } from 'lucide-react';

// shadcn/ui Checkbox: Radix's checkbox button beside a Label, for the catalog's
// Checkbox and for a ListItem that is a checkbox. Each checkbox takes its own
// id, so two lists of the same rows on one page do not share ids and a label
// never ticks the other list's row.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export const CheckboxField = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={next => onChange(next === true)}
        className="peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:bg-input/30 dark:data-[state=checked]:bg-primary"
      >
        <Checkbox.Indicator className="grid place-content-center text-current transition-none">
          <Check aria-hidden="true" className="size-3.5" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label htmlFor={id} className="flex items-center gap-2 text-sm leading-none font-normal select-none">
        {label}
      </label>
    </div>
  );
};
