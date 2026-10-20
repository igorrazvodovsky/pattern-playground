import { useId } from 'react';
import { useBoundProp } from '@json-render/react';
import type { ValidationCheck } from '@json-render/core';
import { useFieldError } from './field-validation';

// A text field's bound value, its error, and the attributes that tie the
// control to the error. `invalid` is left to each library: the pp elements
// set aria-invalid on their control from their own `invalid` prop.
//
// The error is an alert, so that it is read out when a submit sets it: the
// press leaves focus on the button. Its text starts with a visually hidden
// "Error:", since the colour that marks it is not announced.

type Field = {
  value?: string | null;
  checks?: ValidationCheck[] | null;
  error?: string | null;
};

export const errorPrefix = 'Error:';

// A field that is never checked, such as a Textarea, reads no validation
// state, so another field's error on the same path does not mark it.
export const useBoundField = (
  props: Pick<Field, 'value'>,
  bindings: Record<string, string> | undefined,
) => {
  const [value, setValue] = useBoundProp(props.value, bindings?.value);
  const id = useId();
  return { value: value ?? '', setValue, id };
};

export const useField = (props: Field, bindings: Record<string, string> | undefined) => {
  const { value, setValue, id } = useBoundField(props, bindings);
  const error = useFieldError(bindings?.value, value, props.checks, props.error);
  const errorId = `${id}-error`;
  return {
    value,
    setValue,
    id,
    error,
    control: {
      id,
      'aria-describedby': error ? errorId : undefined,
      'data-invalid': error ? '' : undefined,
    },
    errorProps: { id: errorId, role: 'alert' as const },
  };
};

export type FieldErrorProps = ReturnType<typeof useField>['errorProps'];
