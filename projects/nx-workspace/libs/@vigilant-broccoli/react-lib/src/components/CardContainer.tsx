import { Card, Text } from '@radix-ui/themes';
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
  <a
    href={href}
    target={external ? '_blank' : undefined}
    rel={external ? 'noopener noreferrer' : undefined}
  >
    <Text size="2" className={HEADER_LINK_CLASS}>
      {label} →
    </Text>
  </a>
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
      <div className={`flex flex-col p-4 gap-${gap}`}>
        {trailing ? (
          <div className="flex justify-between items-center">
            <Text size="5" weight="bold">
              {title}
            </Text>
            {trailing}
          </div>
        ) : (
          <Text size="5" weight="bold">
            {title}
          </Text>
        )}
        {children}
      </div>
    </Card>
  );
};
