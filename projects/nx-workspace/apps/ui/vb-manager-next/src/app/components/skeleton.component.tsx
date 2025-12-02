import { Card, Flex, Text } from '@radix-ui/themes';

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

export const CardSkeleton = ({ title, rows = 3, showTitleSkeleton = false }: { title?: string; rows?: number; showTitleSkeleton?: boolean }) => (
  <Card className="w-full">
    <Flex direction="column" gap="4" p="4">
      {showTitleSkeleton ? (
        <Skeleton className="h-8 w-32" />
      ) : title ? (
        <Text size="5" weight="bold">{title}</Text>
      ) : (
        <Skeleton className="h-8 w-32" />
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </Flex>
  </Card>
);
