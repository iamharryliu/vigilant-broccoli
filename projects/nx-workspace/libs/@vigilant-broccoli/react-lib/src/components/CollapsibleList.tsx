import { useState, useEffect, ReactNode } from 'react';
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
}

export const CollapsibleList = ({
  items,
  storageKeyPrefix,
  chevronPosition = 'right',
  triggerClassName = 'py-3',
}: CollapsibleListProps) => {
  const [mounted, setMounted] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const storageKey = (id: string) => `${storageKeyPrefix}-${id}`;

  useEffect(() => {
    const initial = items
      .filter(item => {
        if (storageKeyPrefix) {
          const saved = localStorage.getItem(storageKey(item.id));
          return saved !== null
            ? saved === 'true'
            : (item.defaultOpen ?? false);
        }
        return item.defaultOpen ?? false;
      })
      .map(item => item.id);
    setOpenItems(initial);
    setMounted(true);
  }, []);

  const handleValueChange = (values: string[]) => {
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

  if (!mounted) return null;

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
          className={
            item.className ?? 'border-t border-gray-300 dark:border-gray-700'
          }
        >
          <AccordionPrimitive.Header className="flex items-center">
            <AccordionPrimitive.Trigger
              className={`flex flex-1 items-center ${triggerClassName} text-sm cursor-pointer transition-all [&[data-state=open]>svg]:rotate-180`}
            >
              {chevronPosition === 'left' && (
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 mr-2" />
              )}
              <div className="flex items-center flex-1">
                {item.titleContent ?? (
                  <span className="text-sm font-bold">{item.title}</span>
                )}
              </div>
              {chevronPosition === 'right' && (
                <ChevronDown className="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200" />
              )}
            </AccordionPrimitive.Trigger>
            {item.headerAction && (
              <div className="ml-2 flex items-center">{item.headerAction}</div>
            )}
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Content className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="flex flex-col gap-3 pb-4">{item.content}</div>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
};
