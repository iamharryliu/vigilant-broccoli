import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';

const LINK_CARD_CLASS =
  'group block rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0';

const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const;

type LinkCardOwnProps<T extends ElementType> = {
  title: string;
  description: string;
  icon?: ReactNode;
  external?: boolean;
  as?: T;
};

export type LinkCardProps<T extends ElementType = 'a'> = LinkCardOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof LinkCardOwnProps<T>>;

export function LinkCard<T extends ElementType = 'a'>({
  title,
  description,
  icon,
  external,
  as,
  className,
  ...props
}: LinkCardProps<T>) {
  const Component: ElementType = as ?? 'a';

  return (
    <Component
      {...(external ? EXTERNAL_LINK_PROPS : {})}
      {...props}
      className={cn(LINK_CARD_CLASS, className)}
    >
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Component>
  );
}
