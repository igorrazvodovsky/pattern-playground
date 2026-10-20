import { useEffect, useMemo } from 'react';
import { useFieldValidation, useStateStore, useValidation } from '@json-render/react';
import { runValidation, type ValidationCheck } from '@json-render/core';

// After a failed submit, a change that makes the value pass clears the message
// at once; a change that still fails leaves it until the next submit, so
// nothing new is announced mid-keystroke.
//
// json-render cannot unregister checks, so a field that leaves the page
// registers empty checks in their place and validateForm passes it. React runs
// every cleanup in a commit before any effect, so the other library's field on
// the same path registers its checks after these are cleared.

const noChecks = { checks: [] };

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
  const { customFunctions, registerField } = useValidation();
  const { getSnapshot } = useStateStore();
  const failing = errors.length > 0;

  useEffect(() => {
    if (!config || !failing) return;
    const passes = runValidation(config, { value, stateModel: getSnapshot(), customFunctions }).valid;
    if (passes) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // On a boolean, not on `config`: resolved props give `checks` a new
  // identity on each render.
  const hasChecks = Boolean(path && config);
  useEffect(() => {
    if (!path || !hasChecks) return;
    return () => registerField(path, noChecks);
  }, [path, hasChecks, registerField]);

  return error || errors[0] || null;
};
