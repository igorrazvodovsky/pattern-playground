import { projects } from '@shared/data';

// The rows both selection specs tick, and the list-wide reads they share. A
// spec reads one value at a path but cannot fold over a list, so counting the
// ticked rows and ticking or clearing every row happen here.

export interface SelectableRow { id: string; name: string; selected: boolean }

export const rows: SelectableRow[] = projects.map(({ id, name }) => ({ id, name, selected: false }));

export const rowsArg = (args: Record<string, unknown>) => (args.items as SelectableRow[] | undefined) ?? [];
export const selectedCount = (args: Record<string, unknown>) => rowsArg(args).filter(row => row.selected).length;
export const withAll = (selected: boolean) => (args: Record<string, unknown>) =>
  rowsArg(args).map(row => ({ ...row, selected }));
