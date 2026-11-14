import type { FormEvent } from 'react';
import { Questionnaire as Primitive } from '@shadcn/react/questionnaire';
import { Checkmark } from 'iconoteka-react';

// shadcn's Questionnaire (base-nova style), on the @shadcn/react primitive:
// a form of fieldsets shown one at a time, the primitive owning the active
// item, validation, skipping and focus. Answers are read from the form on
// submit, as the published examples do, and handed on as one record.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

export interface QuestionnaireChoiceDef {
  value: string;
  label: string;
  description?: string | null;
}

export interface QuestionnaireItemDef {
  name: string;
  prompt: string;
  description?: string | null;
  required?: boolean | null;
  multiple?: boolean | null;
  choices: QuestionnaireChoiceDef[];
  input?: { label: string; placeholder?: string | null } | null;
}

export type QuestionnaireAnswers = Record<string, string | string[] | null>;

const choiceClass =
  'group/questionnaire-choice relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-lg border border-input bg-transparent px-3 py-2.5 text-start text-sm transition-colors outline-none select-none hover:bg-muted/50 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-3 has-[>input:focus-visible]:ring-ring/50 data-invalid:border-destructive dark:bg-input/20 data-checked:border-primary/40 data-checked:bg-muted dark:data-checked:bg-muted data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50';
const indicatorClass =
  'pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border border-input group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary';
const inputClass =
  'h-8 min-h-11 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 sm:min-h-0 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground';
const navClass = 'min-h-11 sm:min-h-0';

const read = (form: HTMLFormElement, items: QuestionnaireItemDef[]): QuestionnaireAnswers => {
  const data = new FormData(form);
  return Object.fromEntries(
    items.map(({ name, multiple }) => {
      if (multiple) {
        const values = data.getAll(name).map(String);
        return [name, values.length ? values : null];
      }
      const value = data.get(name);
      return [name, value === null ? null : String(value)];
    }),
  );
};

// An earlier answer, to fill the form in again: the chosen values, and any
// text that is not one of the choices goes back in the item's own field.
const earlier = (answers: QuestionnaireAnswers | null | undefined, item: QuestionnaireItemDef) => {
  const answer = answers?.[item.name];
  const values = answer == null ? [] : [answer].flat().map(String);
  const chosen = new Set(values.filter((v) => item.choices.some((c) => c.value === v)));
  const typed = values.find((v) => !chosen.has(v));
  return { chosen, typed };
};

export const QuestionnaireForm = ({
  label,
  items,
  answers,
  submitLabel,
  buttonClass,
  onSubmit,
}: {
  label: string;
  items: QuestionnaireItemDef[];
  /** Answers from an earlier submit, filled in as the starting state. */
  answers?: QuestionnaireAnswers | null;
  submitLabel?: string | null;
  /** The registry's Button classes, so navigation matches every other button. */
  buttonClass: { primary: string; secondary: string };
  onSubmit: (answers: QuestionnaireAnswers) => void;
}) => {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(read(event.currentTarget, items));
  };
  return (
    <Primitive.Root
      aria-label={label}
      items={items.map(({ name, required, choices }) => ({
        name,
        required: Boolean(required),
        choices: choices.map(({ value }) => ({ value })),
      }))}
      onSubmit={submit}
      className="flex w-full min-w-0 flex-col gap-4"
    >
      <Primitive.Progress className="min-h-[1lh] w-fit min-w-[14ch] text-xs font-medium text-muted-foreground tabular-nums" />
      {items.map((item) => {
        const { chosen, typed } = earlier(answers, item);
        return (
          <Primitive.Item
            key={item.name}
            name={item.name}
            required={Boolean(item.required)}
            multiple={Boolean(item.multiple)}
            className="flex min-w-0 flex-col gap-4 border-0 p-0 outline-none"
          >
            <Primitive.Title className="text-base leading-snug font-medium text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-4">
              {item.prompt}
            </Primitive.Title>
            {item.description && (
              <Primitive.Description
                data-slot="questionnaire-description"
                className="text-sm text-pretty text-muted-foreground"
              >
                {item.description}
              </Primitive.Description>
            )}
            <Primitive.Choices className="group/questionnaire-choices grid min-w-0 gap-2">
              {item.choices.map((choice) => (
                <Primitive.Choice
                  key={choice.value}
                  value={choice.value}
                  defaultChecked={chosen.has(choice.value)}
                  className={choiceClass}
                >
                  <Primitive.ChoiceInput className="absolute inset-0 z-10 size-full cursor-pointer opacity-0" />
                  <span aria-hidden="true" className={indicatorClass}>
                    <span className="hidden size-2 rounded-full bg-primary-foreground group-data-checked/questionnaire-choice:block group-data-[type=checkbox]/questionnaire-choice:hidden" />
                    <Checkmark className="hidden size-3.5 group-data-checked/questionnaire-choice:block group-data-[type=radio]/questionnaire-choice:hidden" />
                  </span>
                  <Primitive.ChoiceLabel className="flex min-w-0 flex-1 flex-col gap-0.5 leading-snug">
                    {choice.label}
                    {choice.description && (
                      <span
                        data-slot="questionnaire-choice-description"
                        className="text-muted-foreground"
                      >
                        {choice.description}
                      </span>
                    )}
                  </Primitive.ChoiceLabel>
                </Primitive.Choice>
              ))}
              {item.input && (
                <div className="group/questionnaire-input relative w-full min-w-0">
                  <Primitive.Input
                    aria-label={item.input.label}
                    defaultValue={typed}
                    placeholder={item.input.placeholder ?? undefined}
                    className={inputClass}
                  />
                </div>
              )}
            </Primitive.Choices>
            <Primitive.Error className="mt-2 text-sm text-destructive" />
          </Primitive.Item>
        );
      })}
      <div className="grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:min-h-8">
        <Primitive.Previous
          className={`${buttonClass.secondary} col-start-1 row-start-1 justify-self-start ${navClass}`}
        />
        <Primitive.Skip
          className={`${buttonClass.secondary} col-start-2 row-start-1 justify-self-end ${navClass}`}
        />
        <Primitive.Next
          className={`${buttonClass.primary} col-start-3 row-start-1 justify-self-end ${navClass}`}
        />
        <Primitive.Submit
          className={`${buttonClass.primary} col-start-3 row-start-1 justify-self-end ${navClass}`}
        >
          {submitLabel ?? 'Submit'}
        </Primitive.Submit>
      </div>
    </Primitive.Root>
  );
};
