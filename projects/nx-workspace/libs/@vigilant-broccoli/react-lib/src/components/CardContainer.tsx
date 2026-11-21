import { Card } from './Card';
import { Text } from './Text';
import { ReactNode } from 'react';
import { cn } from '../utils/cn';

const GAP_CLASS = {
  '1': 'gap-1',
  '2': 'gap-2',
  '3': 'gap-3',
  '4': 'gap-4',
  '5': 'gap-5',
  '6': 'gap-6',
  '7': 'gap-7',
  '8': 'gap-8',
  '9': 'gap-9',
} as const;

const HEADER_LINK_CLASS =
  'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';

interface HeaderLink {
  href: string;
  label: string;
  external?: boolean;
}

interface CardContainerProps {
  /** Omit when the surrounding UI already names the card, e.g. a tab. */
  title?: string;
  children: ReactNode;
  gap?: keyof typeof GAP_CLASS;
  titleAction?: ReactNode;
  headerAction?: ReactNode;
  headerLink?: HeaderLink;
  /** Fill a height-bound parent so a child can own the scrolling. */
  fill?: boolean;
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
  titleAction,
  headerAction,
  headerLink,
  fill = false,
}: CardContainerProps) => {
  const trailing = headerLink ? (
    <HeaderLinkText {...headerLink} />
  ) : (
    headerAction
  );

  return (
    <Card className={cn('w-full', fill && 'flex h-full min-h-0 flex-col')}>
      <div
        className={cn(
          'flex flex-col p-4',
          GAP_CLASS[gap],
          fill && 'min-h-0 flex-1',
        )}
      >
        {trailing || titleAction ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {title && (
                <Text size="5" weight="bold">
                  {title}
                </Text>
              )}
              {titleAction}
            </div>
            {trailing}
          </div>
        ) : (
          title && (
            <Text size="5" weight="bold">
              {title}
            </Text>
          )
        )}
        {children}
      </div>
    </Card>
  );
};
