import { cn } from './cn';
import type { purposes, tones } from '../../catalog';

// shadcn class lists more than one family of components uses. A .tsx file so
// that Tailwind's @source glob in catalog/shadcn.css scans it.

export type Purpose = (typeof purposes)[number];
export const purposeText: Record<Purpose, string> = {
  info: 'text-blue-700 dark:text-blue-300',
  success: 'text-green-700 dark:text-green-300',
  warning: 'text-yellow-700 dark:text-yellow-300',
  danger: 'text-destructive',
};

type Tone = (typeof tones)[number];
// shadcn/ui Badge (radix-nova). Nova's destructive badge is a tint rather
// than a fill, and success follows it in green.
const badgeFill: Record<Tone, string> = {
  neutral: 'bg-secondary text-secondary-foreground',
  accent: 'bg-primary text-primary-foreground',
  success: 'bg-green-600/10 text-green-700 dark:bg-green-400/20 dark:text-green-300',
  danger: 'bg-destructive/10 text-destructive dark:bg-destructive/20',
};
const badgeBase =
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all [&>svg]:pointer-events-none [&>svg]:size-3!';
const badgeOutline: Record<Tone, string> = {
  neutral: 'text-foreground',
  accent: 'border-primary text-foreground',
  success: purposeText.success,
  danger: purposeText.danger,
};
// A filled badge, or an outlined one, as a Badge with an icon reads. Nova's
// badge is a pill; a badge not asked to be one keeps the corners of Nova's
// controls, so the two still differ.
export const badgeClass = (tone: Tone, outline: boolean, pill?: boolean | null) =>
  cn(
    badgeBase,
    pill ? 'rounded-4xl' : 'rounded-md',
    outline ? ['border-border', badgeOutline[tone]] : ['border-transparent', badgeFill[tone]],
  );

// shadcn/ui Button (radix-nova), variants and sizes as published: default is
// shadcn's outline, primary its default, plain its ghost, danger its
// destructive. The link variant is this registry's own, muted until hovered.
// A leading icon carries data-icon="inline-start", which trims the padding.
export const buttonBase =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
export const buttonVariant = {
  default:
    'border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/80',
  plain:
    'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground dark:hover:bg-muted/50',
  danger:
    'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
  link: 'text-muted-foreground underline underline-offset-4 hover:text-foreground',
} as const;
export const buttonSize = {
  'default': 'h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
  'sm': "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
  'icon': 'size-8',
  'icon-sm': 'size-7 rounded-[min(var(--radius-md),12px)]',
} as const;

export const markClass = 'rounded-sm bg-yellow-200/70 px-1 text-foreground dark:bg-yellow-800/60';
