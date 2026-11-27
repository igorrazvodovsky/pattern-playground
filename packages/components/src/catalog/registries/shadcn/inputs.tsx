import { Fragment, useId, useState } from 'react';
import { useBoundProp, type Components } from '@json-render/react';
import { Popover, RadioGroup, Select, Slider, ToggleGroup, Tooltip } from 'radix-ui';
import { Command } from 'cmdk';
import { cn } from './cn';
import { Checkmark, ChevronDown, Information, Loader75, Search } from 'iconoteka-react';
import type { Catalog } from '../../catalog';
import { useCandidateList } from '../../behaviour/candidate-list';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import { errorPrefix, useBoundField, useField, type FieldErrorProps } from '../../behaviour/field';
import { submitForm } from '../../behaviour/form-submit';
import { useFocusHandoff } from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { scopedPortal } from './portal';
import { CheckboxField } from './checkbox';
import { CodeField } from './code-input';
import {
  comboboxAddonEnd,
  comboboxContent,
  comboboxIndicator,
  comboboxInput,
  comboboxInputGroup,
  comboboxItem,
  comboboxList,
  comboboxSeparator,
  comboboxTrigger,
  commandGroup,
  commandInput,
  commandInputGroup,
  commandInputWrapper,
  commandItem,
  commandList,
  commandSearchIcon,
  menuCheckItem,
  menuIndicator,
  popoverSurface,
  tooltipArrow,
  tooltipContent,
  type Send,
} from './parts';
import {
  QuestionnaireForm,
  type QuestionnaireAnswers,
  type QuestionnaireItemDef,
} from './questionnaire';
import { RuleBuilder, type RuleTree } from './rule-builder';
import { icons, purposeIcons } from './icons';
import { buttonBase, buttonSize, buttonVariant, purposeText } from './classes';

// shadcn/ui Label (radix-nova).
const label =
  'flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50';
const fieldError = (props: FieldErrorProps, message: string) => (
  <p {...props} className="text-sm text-destructive">
    <span className="sr-only">{errorPrefix}</span> {message}
  </p>
);

export const inputs = {
  Button: ({ props, emit }) => {
    const Icon = props.icon ? icons[props.icon] : null;
    const ref = useFocusHandoff(props.focusNext);
    useFocusOnShow(ref, props.focusOnShow);
    return (
      <button
        ref={ref}
        type={props.submit ? 'submit' : 'button'}
        data-focus-key={props.focusKey ?? undefined}
        className={cn(
          buttonBase,
          buttonVariant[props.variant ?? 'default'],
          props.variant === 'link'
            ? 'h-auto self-start p-0 align-baseline'
            : buttonSize[props.hideLabel && Icon ? 'icon' : 'default'],
        )}
        disabled={props.disabled ?? undefined}
        aria-pressed={props.pressed ?? undefined}
        aria-expanded={props.expanded ?? undefined}
        aria-label={props.hideLabel ? props.label : undefined}
        data-autofocus={props.initialFocus || undefined}
        onClick={() => emit('press')}
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            data-icon={props.hideLabel ? undefined : 'inline-start'}
            fill={props.icon === 'delete-confirm' ? 'currentColor' : 'none'}
          />
        )}
        {!props.hideLabel && props.label}
      </button>
    );
  },

  Input: ({ props, bindings }) => {
    const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
    return (
      <div className="flex flex-col gap-2">
        {!props.hideLabel && (
          <label htmlFor={id} className={label}>
            {props.label}
          </label>
        )}
        <input
          {...control}
          type={props.type ?? 'text'}
          aria-label={props.hideLabel ? props.label : undefined}
          aria-invalid={error ? true : undefined}
          placeholder={props.placeholder ?? undefined}
          data-autofocus={props.initialFocus || undefined}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        />
        {error && fieldError(errorProps, error)}
      </div>
    );
  },

  CodeInput: ({ props, bindings, slots, emit }) => {
    const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className={label}>
            {props.label}
          </label>
          {slots?.action}
        </div>
        <CodeField
          control={control}
          length={props.length}
          groups={props.groups}
          value={value}
          onChange={setValue}
          onComplete={() => emit('complete')}
          invalid={Boolean(error)}
          initialFocus={props.initialFocus ?? undefined}
        />
        {error && fieldError(errorProps, error)}
      </div>
    );
  },

  // shadcn/ui Tooltip on a ghost icon Button, as Claude marks a note beside
  // the buttons that close its message editor.
  InfoTip: ({ props }) => (
    <Tooltip.Provider delayDuration={150}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            aria-label={props.label}
            className={cn(
              buttonBase,
              buttonVariant.plain,
              buttonSize.icon,
              'text-muted-foreground',
            )}
          >
            <Information aria-hidden="true" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal container={scopedPortal()}>
          <Tooltip.Content sideOffset={4} className={tooltipContent}>
            {props.text}
            <Tooltip.Arrow className={tooltipArrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  ),

  Textarea: ({ props, bindings }) => {
    const { id, value, setValue } = useBoundField(props, bindings);
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={id} className={props.hideLabel ? 'sr-only' : label}>
          {props.label}
        </label>
        <textarea
          id={id}
          placeholder={props.placeholder ?? undefined}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
        />
      </div>
    );
  },

  Select: ({ props, bindings }) => {
    const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
    const Icon = props.icon ? icons[props.icon] : null;
    return (
      <div className="flex flex-col gap-2">
        {!props.hideLabel && (
          <label htmlFor={id} className={label}>
            {props.label}
          </label>
        )}
        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger
            {...control}
            aria-label={props.hideLabel ? props.label : undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              `flex h-8 w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
              props.variant === 'plain' &&
                'border-transparent hover:bg-muted dark:bg-transparent dark:hover:bg-muted/50',
            )}
          >
            {Icon && <Icon aria-hidden="true" />}
            <Select.Value placeholder={props.placeholder ?? undefined} />
            <Select.Icon asChild>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none size-4 text-muted-foreground"
              />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal container={scopedPortal()}>
            <Select.Content
              position="popper"
              sideOffset={4}
              className="relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10"
            >
              <Select.Viewport className="h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1 p-1">
                {props.options.map((option) => (
                  <Select.Item
                    key={option.value}
                    value={option.value}
                    className={cn(menuCheckItem, 'w-full')}
                  >
                    <span className={cn(menuIndicator, 'size-4')}>
                      <Select.ItemIndicator>
                        <Checkmark aria-hidden="true" />
                      </Select.ItemIndicator>
                    </span>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {error && fieldError(errorProps, error)}
      </div>
    );
  },

  // cmdk's filtering is off: the spec decides which candidates show.
  Combobox: ({ props, bindings, emit }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
    const [shown, setShown] = useState(false);
    const show = (next: boolean) => {
      setShown(next);
      if (next) return;
      close();
      setValue('');
    };
    const {
      open,
      groups,
      root,
      label: labelProps,
      input,
      list,
      pick,
      close,
      toggle,
    } = useCandidateList(
      props.groups,
      value ?? '',
      setValue,
      // Inline, the picked value stays in the field. In a popup, Radix does
      // not report a close it is told to make, so the field is emptied here,
      // once `select` has run: its later steps can still read the picked value.
      () => {
        if (!props.popup) {
          void emit('select');
          return;
        }
        setShown(false);
        void Promise.resolve(emit('select')).finally(() => setValue(''));
      },
      { value: scope, set: setScope },
      props.popup ?? false,
    );
    const status = props.status;
    const purpose = status?.pending ? null : status?.purpose;
    const StatusIcon = status?.pending ? Loader75 : purpose ? purposeIcons[purpose] : null;
    const statusLine = status && (
      <p
        role="status"
        className={cn(
          'flex items-center gap-2 text-xs [&>svg]:size-3.5 [&>svg]:shrink-0',
          status.text && 'px-2 py-1.5',
          purpose ? purposeText[purpose] : 'text-muted-foreground',
        )}
      >
        {status.text && StatusIcon && (
          <StatusIcon
            aria-hidden="true"
            className={cn(status.pending && 'animate-spin motion-reduce:animate-none')}
          />
        )}
        {status.text}
      </p>
    );
    const item = (
      option: (typeof groups)[number]['options'][number],
      itemClass: string,
      checked?: boolean,
    ) => {
      const Icon = option.icon ? icons[option.icon] : null;
      return (
        <Command.Item key={option.value} value={option.value} onSelect={pick} className={itemClass}>
          {Icon && <Icon aria-hidden="true" className="text-muted-foreground" />}
          {option.label}
          {checked && (
            <span className={comboboxIndicator}>
              <Checkmark aria-hidden="true" />
            </span>
          )}
        </Command.Item>
      );
    };
    const field = props.popup ? (
      <Command
        label={props.label}
        {...root}
        className="flex w-full flex-col overflow-hidden bg-popover text-popover-foreground"
      >
        <div className={commandInputWrapper}>
          <div className={commandInputGroup}>
            <Search aria-hidden="true" className={commandSearchIcon} />
            <Command.Input
              placeholder={props.placeholder ?? undefined}
              {...input}
              className={commandInput}
            />
          </div>
        </div>
        {open && (
          <Command.List {...list} className={commandList}>
            {groups.map((group, index) => (
              <Command.Group
                key={group.heading ?? index}
                heading={group.heading ?? undefined}
                className={commandGroup}
              >
                {group.options.map((option) => item(option, commandItem))}
              </Command.Group>
            ))}
          </Command.List>
        )}
        {statusLine}
      </Command>
    ) : (
      // Inline, the field is shadcn's Combobox: an input with its trigger
      // button, and the candidates in a popover anchored to it.
      <Command label={props.label} {...root} className="flex w-full flex-col">
        <Popover.Root open={open}>
          <Popover.Anchor asChild>
            <div className={comboboxInputGroup}>
              <Command.Input
                placeholder={props.placeholder ?? undefined}
                {...input}
                className={comboboxInput}
              />
              <div className={comboboxAddonEnd}>
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Suggestions"
                  aria-expanded={open}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={toggle}
                  className={comboboxTrigger}
                >
                  <ChevronDown
                    aria-hidden="true"
                    className="pointer-events-none size-4 text-muted-foreground"
                  />
                </button>
              </div>
            </div>
          </Popover.Anchor>
          <Popover.Portal container={scopedPortal()}>
            {/* Focus stays in the field: the list is reached with
                  aria-activedescendant, so the content takes no focus and no
                  dialog role. */}
            <Popover.Content
              role="presentation"
              align="start"
              sideOffset={6}
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
              className={comboboxContent}
            >
              <Command.List {...list} className={comboboxList}>
                {groups.map((group, index) => (
                  <Fragment key={group.heading ?? index}>
                    {index > 0 && <Command.Separator alwaysRender className={comboboxSeparator} />}
                    <Command.Group heading={group.heading ?? undefined}>
                      {group.options.map((option) =>
                        item(option, comboboxItem, option.value === value),
                      )}
                    </Command.Group>
                  </Fragment>
                ))}
              </Command.List>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        {statusLine}
      </Command>
    );
    if (!props.popup) {
      return (
        <div className="flex w-full max-w-sm flex-col gap-2">
          {!props.hideLabel && (
            <label {...labelProps} className={label}>
              {props.label}
            </label>
          )}
          {field}
        </div>
      );
    }
    const TriggerIcon = props.icon ? icons[props.icon] : null;
    const iconOnly = Boolean(props.hideLabel && TriggerIcon);
    return (
      <Popover.Root open={shown} onOpenChange={show}>
        <Popover.Trigger
          aria-label={iconOnly ? props.label : undefined}
          data-focus-key={props.focusKey ?? undefined}
          className={cn(
            buttonBase,
            buttonVariant.default,
            buttonSize[iconOnly ? 'icon' : 'default'],
          )}
        >
          {TriggerIcon && (
            <TriggerIcon aria-hidden="true" data-icon={iconOnly ? undefined : 'inline-start'} />
          )}
          {!iconOnly && props.label}
        </Popover.Trigger>
        <Popover.Portal container={scopedPortal()}>
          <Popover.Content
            align="start"
            sideOffset={4}
            className={cn(popoverSurface, 'w-72 max-w-[calc(100vw-2rem)] overflow-hidden p-0')}
          >
            <AnimateChangeInHeight>{field}</AnimateChangeInHeight>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  },

  RadioGroup: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const id = useId();
    return (
      <div className="flex flex-col gap-3">
        <div id={id} className={label}>
          {props.label}
        </div>
        <RadioGroup.Root
          aria-labelledby={id}
          value={value ?? undefined}
          onValueChange={setValue}
          className="grid w-full gap-3"
        >
          {props.options.map((option) => (
            <div key={option.value} className="flex items-center gap-3">
              <RadioGroup.Item
                id={`${id}-${option.value}`}
                value={option.value}
                className="group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary"
              >
                <RadioGroup.Indicator className="flex size-4 items-center justify-center">
                  <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
                </RadioGroup.Indicator>
              </RadioGroup.Item>
              <label htmlFor={`${id}-${option.value}`} className={cn(label, 'font-normal')}>
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup.Root>
      </div>
    );
  },

  // shadcn/ui Toggle (radix-nova, outline). A pressed toggle takes the
  // primary fill rather than Nova's muted one, which is also near the
  // surface of the actor's message, so the selection shows there.
  SelectableTags: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const id = useId();
    return (
      <div className="flex flex-col gap-3">
        <div id={id} className={props.hideLabel ? 'sr-only' : label}>
          {props.label}
        </div>
        <ToggleGroup.Root
          type="multiple"
          aria-labelledby={id}
          value={value ?? []}
          onValueChange={setValue}
          className="flex flex-wrap items-center gap-2"
        >
          {props.options.map((option) => (
            <ToggleGroup.Item
              key={option.value}
              value={option.value}
              className="group/toggle inline-flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-input bg-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground dark:bg-input/30 dark:data-[state=on]:bg-primary"
            >
              {option.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
    );
  },

  // A fixed width, so the track holds inside a message bubble that sizes to
  // its content.
  Slider: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const current = value ?? props.min;
    const id = useId();
    return (
      <div className="flex w-64 max-w-full flex-col gap-2">
        <div className="flex justify-between gap-2">
          <span id={id} className={props.hideLabel ? 'sr-only' : label}>
            {props.label}
          </span>
          <span aria-hidden="true" className="ml-auto text-sm text-muted-foreground">
            {current}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {props.showBounds && <span aria-hidden="true">{props.min}</span>}
          <Slider.Root
            min={props.min}
            max={props.max}
            step={props.step ?? 1}
            value={[current]}
            onValueChange={([next]) => setValue(next ?? props.min)}
            className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50"
          >
            <Slider.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
              <Slider.Range className="absolute h-full bg-primary select-none" />
            </Slider.Track>
            <Slider.Thumb
              aria-labelledby={id}
              className="relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
            />
          </Slider.Root>
          {props.showBounds && <span aria-hidden="true">{props.max}</span>}
        </div>
      </div>
    );
  },

  Checkbox: ({ props, bindings }) => {
    const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
    return <CheckboxField label={props.label} checked={checked ?? false} onChange={setChecked} />;
  },

  Form: ({ props, children, emit }) => (
    <form
      className="flex max-w-xl flex-col gap-6"
      aria-label={props.label ?? undefined}
      noValidate
      onSubmit={(event) => void submitForm(event, emit)}
    >
      {children}
    </form>
  ),

  // Built for this registry: shadcn has nothing like it, and the catalog
  // can name the composite but not assemble it. The tree arrives as data and
  // edits leave as { kind, slotId, value } on the bound path, then an event.
  RuleBuilder: ({ props, bindings, emit }) => {
    const [, setEdit] = useBoundProp(props.edit, bindings?.edit);
    const send: Send = (kind, slotId, value) => {
      setEdit({ kind, slotId, value });
      emit(kind);
    };
    return <RuleBuilder label={props.label} tree={props.tree as RuleTree} send={send} />;
  },

  Questionnaire: ({ props, bindings, emit }) => {
    const [answers, setAnswers] = useBoundProp(props.answers, bindings?.answers);
    return (
      <QuestionnaireForm
        label={props.label}
        items={props.items as QuestionnaireItemDef[]}
        answers={answers as QuestionnaireAnswers | null}
        submitLabel={props.submitLabel}
        buttonClass={{
          primary: cn(buttonBase, buttonVariant.primary, buttonSize.default),
          secondary: cn(buttonBase, buttonVariant.default, buttonSize.default),
        }}
        onSubmit={(answers) => {
          setAnswers(answers);
          emit('submit');
        }}
      />
    );
  },
} satisfies Partial<Components<Catalog>>;
