import { ReactNode } from 'react';
import { CollapsibleList } from './CollapsibleList';

export interface CollapsibleCardProps {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  chevronPosition?: 'left' | 'right';
}

const CARD_ITEM_ID = 'card';

// One collapsible section drawn as a single bordered card: the header is a
// tinted bar and the opened content continues below it with no background of
// its own. Header and content share the same width and padding, so a caller
// can bleed the whole card past its container's padding with a negative margin
// and keep the text aligned.
export const CollapsibleCard = ({
  title,
  children,
  defaultOpen,
  chevronPosition = 'left',
}: CollapsibleCardProps) => (
  <div className="overflow-hidden rounded-md border border-border">
    <CollapsibleList
      chevronPosition={chevronPosition}
      triggerClassName="bg-muted px-3 py-2"
      items={[
        {
          id: CARD_ITEM_ID,
          className: 'border-0',
          titleContent: title,
          defaultOpen,
          contentClassName: '',
          content: <div className="border-t border-border p-3">{children}</div>,
        },
      ]}
    />
  </div>
);
