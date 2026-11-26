'use client';

import { ExternalLink, LucideIcon } from 'lucide-react';
import { AnchorHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

// Relative to the font size so icons scale with the link text.
const ICON_SIZE = '1.1em';
const ABSOLUTE_URL_RE = /^https?:\/\//;

export function Hyperlink({
  href,
  icon: Icon,
  isExternal = ABSOLUTE_URL_RE.test(href),
  className,
  children,
  ...anchorProps
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  // Leading icon; external links also get a trailing arrow.
  icon?: LucideIcon;
  // Opens in a new tab; defaults to true for absolute http(s) URLs.
  isExternal?: boolean;
}) {
  return (
    <a
      href={href}
      {...(isExternal && { target: '_blank', rel: 'noreferrer' })}
      className={cn(
        'inline-flex items-center gap-1 rounded-sm text-sm font-medium text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-400',
        className,
      )}
      {...anchorProps}
    >
      {Icon && <Icon size={ICON_SIZE} className="shrink-0" />}
      {children}
      {isExternal && <ExternalLink size={ICON_SIZE} className="shrink-0" />}
    </a>
  );
}
