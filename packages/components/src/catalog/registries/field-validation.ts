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
// json-render has no way to unregister them, so a field that leaves the page
// (a spec hides it, or the part it sits in) registers no checks in their
// place, and validateForm passes it. Its message stays, for the field that
// takes its place when the library switches. React runs every effect's
// cleanup in a commit before any effect, so that field registers its checks
// after this one has cleared them. Two fields mounted at once on the same
// path would clear each other's checks; no spec binds a path twice.

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
    // Re-run on a change of value only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // On a boolean, not on `config`: resolved props give `checks` a new
  // identity on each render, and clearing then re-registering every time
  // would change the provider's state on every render.
  const hasChecks = Boolean(path && config);
  useEffect(() => {
    if (!path || !hasChecks) return;
    return () => registerField(path, noChecks);
  }, [path, hasChecks, registerField]);

  return error || errors[0] || null;
};
