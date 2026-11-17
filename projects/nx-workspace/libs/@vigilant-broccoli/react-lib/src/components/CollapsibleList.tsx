import { useState, useEffect, AnimationEvent, ReactNode } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export interface CollapsibleListItemConfig {
  id: string;
  title?: string;
  titleContent?: ReactNode;
  headerAction?: ReactNode;
  content: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

interface CollapsibleListProps {
  items: CollapsibleListItemConfig[];
  storageKeyPrefix?: string;
  chevronPosition?: 'left' | 'right';
  triggerClassName?: string;
  /** Fires only for user toggles, not the saved state restored after mount. */
  onOpenChange?: (id: string, open: boolean) => void;
}

const MIN_TOGGLE_MS = 200;
const MAX_TOGGLE_MS = 500;
const MS_PER_PX = 0.15;

// The keyframes run a fixed 0.2s, which flashes past on a section thousands of
// pixels tall and reads as no transition. Stretch tall sections up to a cap.
const scaleToggleDuration = (event: AnimationEvent<HTMLDivElement>): void => {
  const el = event.currentTarget;
  const ms = Math.min(
    MAX_TOGGLE_MS,
    Math.max(MIN_TOGGLE_MS, el.scrollHeight * MS_PER_PX),
  );
  el.style.animationDuration = `${ms}ms`;
};

export const CollapsibleList = ({
  items,
  storageKeyPrefix,
  chevronPosition = 'right',
  triggerClassName = 'py-3',
  onOpenChange,
}: CollapsibleListProps) => {
  // Render the defaults immediately and apply saved state after mount: reading
  // localStorage during render would break SSR hydration, and rendering nothing
  // until mount made every section pop in and shift the layout.
  const [openItems, setOpenItems] = useState<string[]>(() =>
    items.filter(item => item.defaultOpen).map(item => item.id),
  );

  const storageKey = (id: string) => `${storageKeyPrefix}-${id}`;

  useEffect(() => {
    if (!storageKeyPrefix) return;
    setOpenItems(
      items
        .filter(item => {
          const saved = localStorage.getItem(storageKey(item.id));
          return saved !== null
            ? saved === 'true'
            : (item.defaultOpen ?? false);
        })
        .map(item => item.id),
    );
  }, []);

  const handleValueChange = (values: string[]) => {
    items.forEach(item => {
      const open = values.includes(item.id);
      if (open !== openItems.includes(item.id)) onOpenChange?.(item.id, open);
    });
    setOpenItems(values);
    if (storageKeyPrefix) {
      items.forEach(item => {
        localStorage.setItem(
          storageKey(item.id),
          String(values.includes(item.id)),
        );
      });
    }
  };

  return (
    <AccordionPrimitive.Root
      type="multiple"
      value={openItems}
      onValueChange={handleValueChange}
    >
      {items.map(item => (
        <AccordionPrimitive.Item
          key={item.id}
          value={item.id}
          className={item.className ?? 'border-t border-border'}
        >
          <AccordionPrimitive.Header className="flex items-center">
            <AccordionPrimitive.Trigger
              className={`flex flex-1 items-center ${triggerClassName} text-sm cursor-pointer transition-all [&[data-state=open]>svg]:rotate-180`}
            >
              {chevronPosition === 'left' && (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mr-2" />
              )}
              <div className="flex items-center flex-1">
                {item.titleContent ?? (
                  <span className="text-sm font-bold">{item.title}</span>
                )}
              </div>
              {chevronPosition === 'right' && (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
              )}
            </AccordionPrimitive.Trigger>
            {item.headerAction && (
              <div className="ml-2 flex items-center">{item.headerAction}</div>
            )}
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content
            className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            onAnimationStart={scaleToggleDuration}
          >
            <div className="flex flex-col gap-3 pb-4">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};
