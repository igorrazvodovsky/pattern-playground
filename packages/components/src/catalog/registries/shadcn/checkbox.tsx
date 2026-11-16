import { useId, type ReactNode } from 'react';
import { Checkbox } from 'radix-ui';
import { Checkmark } from 'iconoteka-react';

// shadcn/ui Checkbox (radix-nova). Each checkbox takes its own id, so a label never ticks the same row in
// another list on the page.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export const CheckboxField = ({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  /** Leads the label, inside it, so pressing the icon ticks the box too. */
  icon?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Checkbox.Root
        id={id}
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        className="peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary"
      >
        <Checkbox.Indicator className="grid place-content-center text-current transition-none [&>svg]:size-3.5">
          <Checkmark aria-hidden="true" />
        </Checkbox.Indicator>
      </Checkbox.Root>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm leading-none font-normal select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
      >
        {icon}
        {label}
      </label>
    </div>
  );
};
