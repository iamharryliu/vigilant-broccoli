'use client';

import { Skeleton, Text } from '@vigilant-broccoli/react-lib';
import { MemberListSkeleton } from './MemberList';

const FIELD_LABELS = ['Name', 'Description'];

export const HomeDetailSkeleton = () => (
  <div className="space-y-5" aria-busy="true" aria-label="Loading home">
    <div className="flex flex-col gap-3">
      {FIELD_LABELS.map(label => (
        <div key={label}>
          <Text size="1" weight="medium" as="p" mb="1">
            {label}
          </Text>
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
    <MemberListSkeleton />
  </div>
);
