import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn's cn(): joins class lists as clsx does, then lets a later class win
// over an earlier one that sets the same property. Nova's class lists rely
// on it: a variant or size overrides part of the base list, which plain
// joining would leave to the order of the stylesheet.
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
