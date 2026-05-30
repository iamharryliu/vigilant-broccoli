import { Card, Flex, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { ReactNode } from 'react';

const HEADER_LINK_CLASS =
  'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';

interface HeaderLink {
  href: string;
  label: string;
  external?: boolean;
}

interface CardContainerProps {
  title: string;
  children: ReactNode;
  gap?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  headerAction?: ReactNode;
  headerLink?: HeaderLink;
}

const HeaderLinkText = ({ href, label, external = true }: HeaderLink) => (
  <Link
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    <Text size="2" className={HEADER_LINK_CLASS}>
      {label} →
    </Text>
  </Link>
);

export const CardContainer = ({
  title,
  children,
  gap = '4',
  headerAction,
  headerLink,
}: CardContainerProps) => {
  const trailing = headerLink ? (
    <HeaderLinkText {...headerLink} />
  ) : (
    headerAction
  );

  return (
    <Card className="w-full">
      <Flex direction="column" gap={gap} p="4">
        {trailing ? (
          <Flex justify="between" align="center">
            <Text size="5" weight="bold">
              {title}
            </Text>
            {trailing}
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
