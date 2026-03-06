'use client';

import { Text } from '@radix-ui/themes';
import { ReactNode } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';

interface CollapsibleListItemProps {
  title?: string;
  titleContent?: ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  children: ReactNode;
  showBorder?: boolean;
  headerAction?: ReactNode;
}

export const CollapsibleListItem = ({
  title,
  titleContent,
  isOpen,
  setIsOpen,
  children,
  showBorder = true,
  headerAction,
}: CollapsibleListItemProps) => {
  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      className={showBorder ? 'border-t border-gray-300 dark:border-gray-700 pt-3' : ''}
    >
      <Collapsible.Trigger asChild>
        <button
          className="flex items-center justify-between w-full mb-3 group cursor-pointer"
          aria-label={isOpen ? 'Collapse' : 'Expand'}
        >
          {titleContent ? (
            titleContent
          ) : (
            <Text size="3" weight="bold">
              {title}
            </Text>
          )}
          <div className="flex items-center gap-2">
            {headerAction}
            <Text
              size="1"
              color="gray"
              className="group-hover:opacity-70 transition-all duration-200"
              style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)' }}
            >
              ▲
            </Text>
          </div>
        </button>
      </Collapsible.Trigger>

      <Collapsible.Content
        className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
      >
        <div className="flex flex-col gap-3">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
