import { Card, Flex, Text } from '@radix-ui/themes';
import { ReactNode } from 'react';

interface CardContainerProps {
  title: string;
  children: ReactNode;
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  headerAction?: ReactNode;
}

export const CardContainer = ({
  title,
  children,
  gap = '4',
  headerAction,
}: CardContainerProps) => {
  return (
    <Card className="w-full">
      <Flex direction="column" gap={gap} p="4">
        {headerAction ? (
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              {title}
            </Text>
            {headerAction}
          </Flex>
        ) : (
          <Text size="5" weight="bold">
            {title}
          </Text>
        )}
        {children}
      </Flex>
    </Card>
  );
};
