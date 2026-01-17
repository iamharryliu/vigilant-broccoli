'use client';

import { Flex, Link, Badge, Text } from '@radix-ui/themes';
import { ExternalLinkIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

export interface LinkListItemConfig {
  text: string;
  url: string;
  badge?: {
    text: string;
    color?: 'green' | 'yellow' | 'red' | 'gray' | 'blue' | 'orange' | 'purple';
  };
  showExternalIcon?: boolean;
  details?: string[];
}

export const LinkListItem = ({
  text,
  url,
  badge,
  showExternalIcon = true,
  details,
}: LinkListItemConfig) => {
  const [expanded, setExpanded] = useState(false);

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
        <Flex gap="2" align="center">
          {badge && (
            <Badge
              color={badge.color}
              size="1"
              style={{ cursor: details ? 'pointer' : 'default' }}
              onClick={() => details && setExpanded(!expanded)}
            >
              {badge.text}
            </Badge>
          )}
        </Flex>
      </Flex>
      {expanded && details && (
        <Flex direction="column" gap="1" style={{ paddingLeft: '8px', paddingBottom: '4px' }}>
          {details.map((detail, index) => (
            <Link
              key={index}
              href={detail.startsWith('http') ? detail : `https://${detail}`}
              target="_blank"
              rel="noopener noreferrer"
              size="2"
            >
              <Text size="2" color="gray">
                {detail}
              </Text>
            </Link>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
