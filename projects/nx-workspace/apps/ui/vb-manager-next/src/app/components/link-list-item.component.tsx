'use client';

import { Flex, Link, Badge } from '@radix-ui/themes';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

export interface LinkListItemConfig {
  text: string;
  url: string;
  badge: {
    text: string;
    color?: 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' | 'purple';
  };
  showExternalIcon?: boolean;
}

export const LinkListItem = ({
  text,
  url,
  badge,
  showExternalIcon = true,
}: LinkListItemConfig) => {
  return (
    <Flex
      direction="column"
      gap="1"
      style={{
        backgroundColor: 'var(--gray-2)',
        borderRadius: '6px',
      }}
    >
      <Flex justify="between" align="center">
        <Link
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          size="3"
          weight="bold"
        >
          <Flex align="center" gap="1">
            {text}
            {showExternalIcon && <ExternalLinkIcon width="12" height="12" />}
          </Flex>
        </Link>
        <Badge color={badge.color} size="1">
          {badge.text}
        </Badge>
      </Flex>
    </Flex>
  );
};
