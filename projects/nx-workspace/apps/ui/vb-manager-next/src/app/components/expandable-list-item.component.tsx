import { Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';

interface ExpandableListItemProps {
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  borderClassName?: string;
  labelWeight?: 'regular' | 'bold';
  badges?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}

export const ExpandableListItem = ({
  label,
  isExpanded,
  onToggle,
  borderClassName = 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
  labelWeight = 'regular',
  badges,
  actions,
  children,
}: ExpandableListItemProps) => (
  <Flex
    direction="column"
    gap="2"
    className={`p-2 rounded border ${borderClassName}`}
  >
    <Flex align="center" gap="2" wrap="wrap">
      <Text size="2" className="cursor-pointer" onClick={onToggle}>
        {isExpanded ? '▼' : '▶'}
      </Text>
      {badges}
      <Text
        size="2"
        weight={labelWeight}
        className="flex-1 cursor-pointer"
        onClick={onToggle}
      >
        {label}
      </Text>
      {actions}
    </Flex>
    {isExpanded && children && (
      <Flex
        direction="column"
        gap="2"
        className="pl-6 pt-1 border-t border-gray-200 dark:border-gray-700"
      >
        {children}
      </Flex>
    )}
  </Flex>
);
