import type { Components } from '@json-render/react';
import type { Catalog } from '../../catalog';
import { Suspense } from 'react';
import { useBoundProp } from '@json-render/react';
import clsx from 'clsx';
import { useCompletionList } from '../../behaviour/completion-list';
import { useDisclosureState } from '../../behaviour/disclosure-state';
import { TracingProvider, useMarkTracing, useTracingState } from '../../behaviour/mark-tracing';
import { PpMentionEditor } from './mention-editor-lazy';

export const conversation = {
  Messages: ({ children }) => (
    <TracingProvider value={useTracingState()}>
      <div className="messages layer">{children}</div>
    </TracingProvider>
  ),

  Message: ({ props, children, slots }) => {
    const tracing = useMarkTracing(props.parts);
    return (
      <div
        className={clsx(
          'message',
          props.from === 'actor' ? 'message--outbound' : 'message--inbound',
        )}
      >
        <div className="message__content">
          <div
            className={clsx(
              'message__body',
              props.from === 'actor' && props.parts.length > 0 && 'layer',
            )}
          >
            {props.parts.map((part, index) => {
              if (typeof part === 'string') return part;
              const { dimmed, linkedTo, handlers } = tracing(index);
              // The note's tooltip opens on focus too, so a mark with a
              // note takes focus for actors on a keyboard.
              const mark = (
                <mark
                  key={index}
                  tabIndex={part.note ? 0 : undefined}
                  data-dimmed={dimmed || undefined}
                  {...handlers}
                >
                  {part.text}
                  {linkedTo.length > 0 && (
                    <span className="visually-hidden">, linked to: {linkedTo.join('; ')}</span>
                  )}
                </mark>
              );
              if (!part.note) return mark;
              return (
                <pp-tooltip key={index} content={part.note}>
                  {mark}
                </pp-tooltip>
              );
            })}
            {children}
          </div>
          {(slots?.status || slots?.actions) && (
            <div className="message__actions">
              {slots.status}
              {slots.actions && <div className="message__reveal">{slots.actions}</div>}
            </div>
          )}
        </div>
      </div>
    );
  },

  Composer: ({ props, slots, bindings }) => {
    const [value, setValue] = useBoundProp(props.value, bindings?.value);
    const completion = useCompletionList(
      slots?.field ? [] : (props.completions ?? []),
      value ?? '',
      setValue,
    );
    const composer = (
      <div className="message-composer">
        {slots?.field ? (
          <div className="message-composer__input">{slots.field}</div>
        ) : (
          <textarea
            {...completion.field}
            aria-label={props.label ?? undefined}
            placeholder={props.placeholder ?? undefined}
            rows={1}
            value={value ?? ''}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
        {slots?.actions ? (
          <div className="message-composer__actions">
            {slots.actions}
            {slots.send && <span className="message-composer__send">{slots.send}</span>}
          </div>
        ) : (
          slots?.send && <span className="message-composer__send">{slots.send}</span>
        )}
      </div>
    );
    const completions = completion.visible && (
      <ul
        {...completion.list}
        aria-label="Ways to continue"
        className="message-composer__completions"
      >
        {completion.options.map((option) => (
          <li key={option.key} {...option.props}>
            {option.typed}
            <span className="message-composer__completion-rest">{option.rest}</span>
          </li>
        ))}
      </ul>
    );
    if (!slots?.attachments)
      return (
        <>
          {composer}
          {completions}
        </>
      );
    return (
      <>
        <div className="attachment-tray">
          <details open>
            <summary>
              {props.attachedCount != null && <span className="badge">{props.attachedCount}</span>}{' '}
              attached
            </summary>
            {slots.attachments}
          </details>
          {composer}
        </div>
        {completions}
      </>
    );
  },

  Timeline: ({ props, children }) => (
    <ol className="stepper" data-density={props.density === 'compact' ? 'compact' : undefined}>
      {children}
    </ol>
  ),

  TimelineEntry: ({ props, children, bindings }) => {
    const [open, setOpen] = useDisclosureState(props.open, bindings?.open);
    let title = (
      <>
        {typeof props.by === 'string' && (
          <>
            <strong>{props.by}</strong>{' '}
          </>
        )}
        {props.by && typeof props.by === 'object' && (
          <>
            <a href={props.by.href}>{props.by.name}</a>{' '}
          </>
        )}
        {props.title}
      </>
    );
    if (props.pending) title = <span className="shimmer">{title}</span>;
    return (
      <li className={clsx('stepper__item', props.from === 'actor' && 'layer')}>
        <div className={clsx('stepper__content', !props.expandable && 'flow')}>
          {props.expandable ? (
            <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
              {/* summary lays its children out as a row, so the title stays one child */}
              <summary>
                <span>{title}</span>
              </summary>
              <div className="flow">{children}</div>
            </details>
          ) : (
            <>
              <p>{title}</p>
              {children}
            </>
          )}
          {props.time && <small className="muted">{props.time}</small>}
        </div>
      </li>
    );
  },

  MentionEditor: (context) => (
    <Suspense fallback={null}>
      <PpMentionEditor {...context} />
    </Suspense>
  ),
} satisfies Partial<Components<Catalog>>;
