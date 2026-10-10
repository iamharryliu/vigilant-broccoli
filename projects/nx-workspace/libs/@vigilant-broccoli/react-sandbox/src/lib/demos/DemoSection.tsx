import { cn, Heading } from '@vigilant-broccoli/react-lib';
import { ReactNode } from 'react';

export const DemoSection = ({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) => (
  <section className={cn('flex min-w-0 flex-col gap-3', className)}>
    <Heading as="h2" size="3">
      {title}
    </Heading>
    {children}
  </section>
);
