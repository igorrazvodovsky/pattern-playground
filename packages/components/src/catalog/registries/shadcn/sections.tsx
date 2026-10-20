import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';
import { Accordion, Tabs } from 'radix-ui';
import { ChevronDown } from 'iconoteka-react';
import { Subsection, useHeading } from '../../behaviour/heading-level';

// Radix wants every tab trigger inside one list ahead of the panels, while
// the catalog gives each Section its own title, so each Section registers its
// title with the Sections around it, which draws the list. Radix's accordion
// header would always be an h3, so titles take the demo's heading level.
//
// Every class used here must be visible to Tailwind: catalog/shadcn.css lists
// this file as a source.

type Affordance = 'tab-bar' | 'details';
type Part = { value: string; title: string };
type Context = {
  affordance: Affordance;
  register: (part: Part) => void;
  unregister: (value: string) => void;
};

const SectionsContext = createContext<Context | null>(null);

const tabsList =
  'inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground';
const tabsTrigger =
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm dark:text-muted-foreground dark:hover:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
const accordionTrigger =
  'flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180';

export const Sections = ({
  affordance,
  children,
}: {
  affordance: Affordance;
  children?: ReactNode;
}) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // A Section keeps its place in the list when its title changes.
  const register = useCallback(
    (part: Part) =>
      setParts((current) =>
        current.some((p) => p.value === part.value)
          ? current.map((p) => (p.value === part.value ? part : p))
          : [...current, part],
      ),
    [],
  );
  const unregister = useCallback(
    (value: string) => setParts((current) => current.filter((p) => p.value !== value)),
    [],
  );
  const content = (
    <SectionsContext.Provider value={{ affordance, register, unregister }}>
      {children}
    </SectionsContext.Provider>
  );

  if (affordance === 'details') {
    return (
      <Accordion.Root type="multiple" data-slot="accordion" className="w-full">
        {content}
      </Accordion.Root>
    );
  }

  const value = parts.some((p) => p.value === selected) ? selected! : (parts[0]?.value ?? '');
  return (
    <Tabs.Root
      value={value}
      onValueChange={setSelected}
      data-slot="tabs"
      className="flex flex-col gap-2"
    >
      <Tabs.List data-slot="tabs-list" className={tabsList}>
        {parts.map((part) => (
          <Tabs.Trigger
            key={part.value}
            value={part.value}
            data-slot="tabs-trigger"
            className={tabsTrigger}
          >
            {part.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {content}
    </Tabs.Root>
  );
};

export const Section = ({ title, children }: { title: string; children?: ReactNode }) => {
  const context = useContext(SectionsContext);
  const value = useId();
  const register = context?.register;
  const unregister = context?.unregister;

  useLayoutEffect(() => register?.({ value, title }), [register, value, title]);
  useLayoutEffect(() => () => unregister?.(value), [unregister, value]);
  const Heading = useHeading();

  const body = (
    <div className="grid gap-2 text-sm">
      <Subsection>{children}</Subsection>
    </div>
  );
  if (!context) return body;

  if (context.affordance === 'details') {
    return (
      <Accordion.Item value={value} data-slot="accordion-item" className="border-b last:border-b-0">
        <Accordion.Header asChild>
          <Heading className="flex">
            <Accordion.Trigger data-slot="accordion-trigger" className={accordionTrigger}>
              {title}
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200"
              />
            </Accordion.Trigger>
          </Heading>
        </Accordion.Header>
        <Accordion.Content data-slot="accordion-content" className="overflow-hidden">
          <div className="pt-0 pb-4">{body}</div>
        </Accordion.Content>
      </Accordion.Item>
    );
  }

  return (
    <Tabs.Content value={value} data-slot="tabs-content" className="flex-1 outline-none">
      {body}
    </Tabs.Content>
  );
};
