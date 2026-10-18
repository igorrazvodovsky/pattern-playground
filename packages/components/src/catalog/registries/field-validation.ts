import { useEffect, useMemo } from 'react';
import { useFieldValidation, useStateStore, useValidation } from '@json-render/react';
import { runValidation, type ValidationCheck } from '@json-render/core';

// The message a field shows beneath it: the spec's `error` if set, else the
// first failing check. Checks run when validateForm is dispatched (a Form's
// submit), never while the actor types. After a failed submit, a change that
// makes the value pass clears the message at once; a change that still fails
// leaves the message as it was until the next submit, so nothing new is
// announced mid-keystroke.
//
// The checks register under the field's bound state path, which outlives a
// switch of library: the other registry's field picks up the same result.
// json-render has no way to unregister them, so a field that a spec hides
// still counts in validateForm.

export const useFieldError = (
  path: string | undefined,
  value: unknown,
  checks: ValidationCheck[] | null | undefined,
  error: string | null | undefined,
) => {
  const config = useMemo(
    () => (path && checks?.length ? { checks, validateOn: 'submit' as const } : undefined),
    [path, checks],
  );
  const { errors, validate } = useFieldValidation(path ?? '', config);
  const { customFunctions } = useValidation();
  const { getSnapshot } = useStateStore();
  const failing = errors.length > 0;

  useEffect(() => {
    if (!config || !failing) return;
    const passes = runValidation(config, { value, stateModel: getSnapshot(), customFunctions }).valid;
    if (passes) validate();
    // Re-run on a change of value only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return error || errors[0] || null;
};
