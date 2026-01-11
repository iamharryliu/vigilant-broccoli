'use client';

import { Flex, Text } from '@radix-ui/themes';
import { LinkListItem, LinkListItemConfig } from './link-list-item.component';

interface LinkListProps {
  items: LinkListItemConfig[];
  emptyMessage?: string;
  getKey?: (item: LinkListItemConfig, index: number) => string;
}

export const LinkList = ({
  items,
  emptyMessage = 'No items found',
  getKey = (item, index) => item.url || String(index),
}: LinkListProps) => {
  if (items.length === 0) {
    return (
      <Text size="2" color="gray">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Flex direction="column" gap="2">
      {items.map((item, index) => (
        <LinkListItem key={getKey(item, index)} {...item} />
      ))}
    </Flex>
  );
};
