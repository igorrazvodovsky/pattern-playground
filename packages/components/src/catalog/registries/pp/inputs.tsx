import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties } from 'react';
import { useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import {
  Combobox,
  ComboboxGroup,
  ComboboxFieldInput,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '../../../components/combobox';
import { AnimateChangeInHeight } from '../../../components/filter/animate-change-in-height';
import { useCandidateList } from '../../behaviour/candidate-list';
import { errorPrefix, useBoundField, useField, type FieldErrorProps } from '../../behaviour/field';
import { useFocusHandoff } from '../../behaviour/focus-handoff';
import { useFocusOnShow } from '../../behaviour/focus-on-show';
import { submitForm } from '../../behaviour/form-submit';
import { icons, purposeIcons } from './icons';

const fieldError = (props: FieldErrorProps, message: string) => (
  <small {...props} data-slot="error">
    <span className="visually-hidden">{errorPrefix}</span> {message}
  </small>
);

export const inputs = {
  Button: ({ props, emit }) => {
    const ref = useFocusHandoff(props.focusNext);
    useFocusOnShow(ref, props.focusOnShow);
    return (
      <button
        ref={ref}
        type={props.submit ? 'submit' : 'button'}
        data-focus-key={props.focusKey ?? undefined}
        className={clsx(
          'button',
          // The library has no link button; a plain one does its job.
          props.variant === 'link'
            ? 'button--plain'
            : props.variant && props.variant !== 'default' && `button--${props.variant}`,
        )}
        disabled={props.disabled ?? undefined}
        aria-pressed={props.pressed ?? undefined}
        aria-expanded={props.expanded ?? undefined}
        data-autofocus={props.initialFocus || undefined}
        onClick={() => emit('press')}
      >
        {props.icon && (
          <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
        )}
        {props.hideLabel ? <span className="visually-hidden">{props.label}</span> : props.label}
      </button>
    );
  },

  InfoTip: ({ props }) => (
    <pp-tooltip content={props.text}>
      <button type="button" className="button button--plain">
        <iconify-icon className="icon" icon={purposeIcons.info} aria-hidden="true" />
        <span className="visually-hidden">{props.label}</span>
      </button>
    </pp-tooltip>
  ),

  Input: ({ props, bindings }) => {
    const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
    const field = (
      <>
        <pp-input invalid={Boolean(error)}>
          <input
            {...control}
            type={props.type ?? 'text'}
            aria-label={props.hideLabel ? props.label : undefined}
            placeholder={props.placeholder ?? undefined}
            data-autofocus={props.initialFocus || undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </pp-input>
        {error && fieldError(errorProps, error)}
      </>
    );
    return (
      <div className="grid-stack">
        {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
        {field}
      </div>
    );
  },

  // .grow-wrap sizes itself from a copy of the text in data-replicated-value.
  Textarea: ({ props, bindings }) => {
    const { id, value, setValue } = useBoundField(props, bindings);
    return (
      <div className="grid-stack">
        {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
        <div className="grow-wrap" data-replicated-value={value}>
          <textarea
            id={id}
            aria-label={props.hideLabel ? props.label : undefined}
            rows={3}
            placeholder={props.placeholder ?? undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
        </div>
      </div>
    );
  },

  // The empty value is a disabled first option, so the select shows nothing
  // chosen when nothing is, and it cannot be chosen again.
  Select: ({ props, bindings }) => {
    const { id, value, setValue, error, control, errorProps } = useField(props, bindings);
    return (
      <div className="grid-stack">
        {!props.hideLabel && <label htmlFor={id}>{props.label}</label>}
        <pp-select
          invalid={Boolean(error)}
          className={props.variant === 'plain' ? 'select--plain' : undefined}
        >
          {props.icon && (
            <iconify-icon
              className="icon"
              icon={icons[props.icon]}
              data-slot="prefix"
              aria-hidden="true"
            />
          )}
          <select
            {...control}
            aria-label={props.hideLabel ? props.label : undefined}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          >
            {/* Without a placeholder, the empty option is there only until
                something is chosen, so a picked value's list holds just the
                choices. */}
            {(props.placeholder || !value) && (
              <option value="" disabled>
                {props.placeholder ?? ''}
              </option>
            )}
            {props.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && fieldError(errorProps, error)}
        </pp-select>
      </div>
    );
  },

  // The field keeps to the library combobox's own width rather than the demo's.
  Combobox: ({ props, bindings, emit }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const [scope, setScope] = useBoundProp(props.scope, bindings?.scope);
    const dropdown = useRef<HTMLElement & { hide(): void; focusOnTrigger(): void }>(null);
    // A pick empties the field only once `select` has run, since the
    // handler's later steps can still read the picked value.
    const picking = useRef(false);
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const { open, groups, root, label, input, list, pick, close } = useCandidateList(
      props.groups,
      value ?? '',
      setValue,
      // Inline, the picked value stays in the field; only a popup empties it.
      () => {
        if (!props.popup) {
          void emit('select');
          return;
        }
        picking.current = true;
        dropdown.current?.hide();
        dropdown.current?.focusOnTrigger();
        void Promise.resolve(emit('select')).finally(() => {
          picking.current = false;
          setValue('');
        });
      },
      { value: scope, set: setScope },
      props.popup ?? false,
    );
    const onHidden = useEffectEvent(() => {
      close();
      if (!picking.current) setValue('');
    });
    useEffect(() => {
      const el = dropdown.current;
      if (!el) return;
      const onShow = (event: Event) => {
        if (event.target === el) el.querySelector<HTMLElement>('[cmdk-input]')?.focus();
      };
      const onHide = (event: Event) => event.target === el && onHidden();
      el.addEventListener('pp-after-show', onShow);
      el.addEventListener('pp-hide', onHide);
      return () => {
        el.removeEventListener('pp-after-show', onShow);
        el.removeEventListener('pp-hide', onHide);
      };
    }, [props.popup]);
    const status = props.status;
    const purpose = status?.pending ? null : status?.purpose;
    const candidates = open && (
      <ComboboxList {...list}>
        {groups.map((group, index) => (
          <ComboboxGroup key={group.heading ?? index} heading={group.heading ?? undefined}>
            {group.options.map((option) => (
              <ComboboxItem
                key={option.value}
                value={option.value}
                checked={option.value === value}
                onSelect={pick}
              >
                {option.icon && (
                  <iconify-icon
                    slot="prefix"
                    className="icon"
                    icon={icons[option.icon]}
                    aria-hidden="true"
                  />
                )}
                {option.label}
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        ))}
      </ComboboxList>
    );
    const field = (
      <Combobox
        label={props.label}
        {...root}
        className={props.popup ? undefined : 'combobox--field'}
      >
        {props.popup ? (
          <>
            <ComboboxInput placeholder={props.placeholder ?? ''} {...input} />
            {candidates}
          </>
        ) : (
          // Inline, the field is an input of its own and the candidates
          // float below it, over what follows.
          <>
            <pp-input ref={setAnchor}>
              <iconify-icon
                data-slot="prefix"
                className="icon"
                icon="ik:search"
                aria-hidden="true"
              />
              <ComboboxFieldInput placeholder={props.placeholder ?? ''} {...input} />
            </pp-input>
            <pp-popup
              className="dropdown__panel combobox__panel"
              anchor={anchor ?? undefined}
              active={open}
              placement="bottom-start"
              distance={6}
              sync="width"
              auto-size="vertical"
              auto-size-padding={8}
              flip
              top-layer
            >
              {candidates}
            </pp-popup>
          </>
        )}
        {status && (
          <p className={clsx('combobox-status', purpose ?? 'muted')} role="status">
            {status.text && status.pending && <pp-spinner aria-hidden="true" />}
            {status.text && purpose && (
              <iconify-icon className="icon" icon={purposeIcons[purpose]} aria-hidden="true" />
            )}
            {status.text}
          </p>
        )}
      </Combobox>
    );
    if (!props.popup) {
      return (
        <div className="grid-stack grid-stack--start">
          {!props.hideLabel && <label {...label}>{props.label}</label>}
          {field}
        </div>
      );
    }
    return (
      <pp-dropdown ref={dropdown} hoist placement="bottom-start">
        <button
          type="button"
          className="button"
          data-slot="trigger"
          data-focus-key={props.focusKey ?? undefined}
        >
          {props.icon && (
            <iconify-icon className="icon" icon={icons[props.icon]} aria-hidden="true" />
          )}
          {props.hideLabel && props.icon ? (
            <span className="visually-hidden">{props.label}</span>
          ) : (
            props.label
          )}
        </button>
        <pp-popup>
          <div>
            <AnimateChangeInHeight>{field}</AnimateChangeInHeight>
          </div>
        </pp-popup>
      </pp-dropdown>
    );
  },

  RadioGroup: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const name = useId();
    return (
      // The library resets a fieldset's margin, so the form's spacing goes on a wrapper.
      <div>
        <fieldset className="grid-stack">
          <legend>{props.label}</legend>
          {props.options.map((option) => (
            <label key={option.value} className="form-control">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => setValue(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>
    );
  },

  SelectableTags: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const selected = value ?? [];
    const toggle = (option: string, checked: boolean) =>
      setValue(checked ? [...selected, option] : selected.filter((each) => each !== option));
    return (
      <div>
        <fieldset className="grid-stack">
          <legend className={props.hideLabel ? 'visually-hidden' : undefined}>{props.label}</legend>
          <div className="inline-flow">
            {props.options.map((option) => (
              <label key={option.value} className="form-control tag">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={(event) => toggle(option.value, event.target.checked)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
  },

  // pp-range names its input from `label`. The visible label repeats it
  // rather than being linked by `labelledby`, which pp-range reads only when
  // its own props change. Its prefix and suffix are read once, on connect.
  Slider: ({ props, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    return (
      <div className="grid-stack">
        {!props.hideLabel && <span aria-hidden="true">{props.label}</span>}
        <pp-range
          label={props.label}
          min={props.min}
          max={props.max}
          step={props.step ?? 1}
          value={value ?? props.min}
          onInput={(event) =>
            setValue((event.currentTarget as HTMLElement & { value: number }).value)
          }
        >
          {props.showBounds && <span data-slot="prefix">{props.min}</span>}
          {props.showBounds && <span data-slot="suffix">{props.max}</span>}
        </pp-range>
      </div>
    );
  },

  Checkbox: ({ props, bindings }) => {
    const [checked, setChecked] = useBoundProp(props.checked, bindings?.checked);
    return (
      <label className="form-control">
        <input
          type="checkbox"
          checked={checked ?? false}
          onChange={(event) => setChecked(event.target.checked)}
        />
        {props.label}
      </label>
    );
  },

  // A form is read most easily at about 36rem, however wide the demo is.
  Form: ({ props, children, emit }) => (
    <form
      className="flow measure"
      style={{ '--flow-space': 'var(--space-l)' } as CSSProperties}
      aria-label={props.label ?? undefined}
      noValidate
      onSubmit={(event) => void submitForm(event, emit)}
    >
      {children}
    </form>
  ),
} satisfies Partial<Components<Catalog>>;
