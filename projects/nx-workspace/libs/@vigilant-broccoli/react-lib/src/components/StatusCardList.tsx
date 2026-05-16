import { ReactNode } from 'react';
import { Flex, Text } from '@radix-ui/themes';
import { CollapsibleList, CollapsibleListItemConfig } from './CollapsibleList';

export interface StatusCardListItem {
  id: string;
  label: string;
  labelWeight?: 'regular' | 'bold';
  borderClassName?: string;
  badges?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

interface StatusCardListProps {
  items: StatusCardListItem[];
  emptyMessage?: string;
}

const DEFAULT_BORDER =
  'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
export const BORDER_ACTIVE =
  'border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700';

const itemClassName = (item: StatusCardListItem) =>
  `rounded border mb-2 pl-2 ${item.borderClassName ?? DEFAULT_BORDER}`;

const itemTitleContent = (item: StatusCardListItem) => (
  <Flex align="start" gap={item.badges ? '2' : '0'} className="flex-1">
    {item.badges}
    <Text size="2" weight={item.labelWeight ?? 'bold'}>
      {item.label}
    </Text>
  </Flex>
);

const toCollapsibleItem = (
  item: StatusCardListItem,
): CollapsibleListItemConfig => ({
  id: item.id,
  className: itemClassName(item),
  titleContent: itemTitleContent(item),
  headerAction: item.actions,
  content: item.children!,
});

const FlatItem = ({ item }: { item: StatusCardListItem }) => (
  <Flex
    align="center"
    className={`${itemClassName(item)} min-h-[36px]`}
    gap="2"
  >
    {itemTitleContent(item)}
    {item.actions}
  </Flex>
);

export const StatusCardList = ({
  items,
  emptyMessage = 'No items found',
}: StatusCardListProps) => {
  if (items.length === 0)
    return <Text className="text-gray-500">{emptyMessage}</Text>;

  const collapsible = items.filter(i => i.children);
  const flat = items.filter(i => !i.children);

  return (
    <>
      {flat.map(item => (
        <FlatItem key={item.id} item={item} />
      ))}
      {collapsible.length > 0 && (
        <CollapsibleList
          items={collapsible.map(toCollapsibleItem)}
          chevronPosition="left"
          triggerClassName="py-0 min-h-[36px]"
        />
      )}
    </>
  );
};
