'use client';

import { Text } from '@vigilant-broccoli/react-lib';

export const SELECT_CLASS =
  'w-full h-9 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm';

export const ReceiptFormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex-1 min-w-0">
    <Text size="1" weight="medium" as="p" mb="1">
      {label}
    </Text>
    {children}
  </div>
);
