'use client';

import { ComponentType, ReactNode, useState, MouseEvent } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '../utils/cn';

export type SidebarCTA = {
  label: string;
  icon?: ComponentType<{ size?: number | string }>;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  isActive?: boolean;
  title?: string;
  children?: SidebarCTA[];
};

export type SidebarBranding = {
  label: string;
  icon?: ComponentType<{ size?: number | string }>;
  logo?: ReactNode;
  href?: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkComponent = ComponentType<any>;

export type SidebarProps = {
  items: SidebarCTA[];
  side?: 'left' | 'right';
  align?: 'start' | 'space-evenly';
  branding?: SidebarBranding;
  expandable?: boolean;
  searchable?: boolean;
  footer?: ReactNode;
  LinkComponent?: LinkComponent;
  className?: string;
};

const COLLAPSED_WIDTH_CLASS = 'w-14';
const EXPANDED_WIDTH_CLASS = 'hover:w-48';

const ITEM_BASE =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 w-full text-left';
const ITEM_ACTIVE =
  'font-medium text-black bg-gray-100 dark:text-white dark:bg-gray-800';
const ITEM_INACTIVE =
  'text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800';

const flattenItems = (items: SidebarCTA[]): SidebarCTA[] =>
  items.flatMap(item =>
    item.children && item.children.length > 0
      ? [item, ...flattenItems(item.children)]
      : [item],
  );

type ItemRowProps = {
  item: SidebarCTA;
  labelClassName: string;
  LinkComponent?: LinkComponent;
  trailing?: ReactNode;
  onClickExtra?: () => void;
  className?: string;
};

const ItemRow = ({
  item,
  labelClassName,
  LinkComponent,
  trailing,
  onClickExtra,
  className,
}: ItemRowProps) => {
  const Icon = item.icon;
  const content = (
    <>
      {Icon && (
        <span className="shrink-0">
          <Icon size={18} />
        </span>
      )}
      <span
        className={cn(
          'whitespace-nowrap overflow-hidden transition-all duration-150',
          labelClassName,
        )}
      >
        {item.label}
      </span>
      {trailing}
    </>
  );

  const rowClass = cn(
    ITEM_BASE,
    item.isActive ? ITEM_ACTIVE : ITEM_INACTIVE,
    className,
  );

  if (item.href && LinkComponent) {
    return (
      <LinkComponent
        href={item.href}
        title={item.title}
        className={rowClass}
        onClick={(e: MouseEvent<HTMLElement>) => {
          item.onClick?.(e);
          onClickExtra?.();
        }}
      >
        {content}
      </LinkComponent>
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        title={item.title}
        className={rowClass}
        onClick={e => {
          item.onClick?.(e);
          onClickExtra?.();
        }}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      title={item.title}
      className={rowClass}
      onClick={e => {
        item.onClick?.(e);
        onClickExtra?.();
      }}
    >
      {content}
    </button>
  );
};

export const Sidebar = ({
  items,
  side = 'left',
  align = 'start',
  branding,
  expandable = true,
  searchable = false,
  footer,
  LinkComponent,
  className,
}: SidebarProps) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const flat = searchable ? flattenItems(items) : [];
  const results =
    searchable && query.trim()
      ? flat.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
      : null;

  const widthClass = expandable
    ? `${COLLAPSED_WIDTH_CLASS} ${EXPANDED_WIDTH_CLASS}`
    : COLLAPSED_WIDTH_CLASS;
  const collapsedLabelClass = expandable
    ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100'
    : 'hidden';
  const alwaysVisibleLabelClass = 'flex-1 opacity-100';

  const borderClass =
    side === 'right'
      ? 'border-l border-gray-200 dark:border-gray-800'
      : 'border-r border-gray-200 dark:border-gray-800';
  const listJustify =
    align === 'space-evenly' ? 'justify-evenly' : 'justify-start';

  return (
    <aside
      className={cn(
        'group/sidebar shrink-0 flex flex-col overflow-hidden bg-white dark:bg-gray-950 transition-all duration-200',
        widthClass,
        borderClass,
        className,
      )}
      onMouseLeave={() => {
        setOpenId(null);
        setQuery('');
      }}
    >
      {branding && (
        <BrandingHeader
          branding={branding}
          LinkComponent={LinkComponent}
          expandable={expandable}
        />
      )}

      <div
        className={cn(
          'flex flex-col flex-1 gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden',
          listJustify,
        )}
      >
        {searchable && (
          <div className="flex items-center gap-3 px-2 py-2 rounded-md text-gray-500 hover:text-black hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800">
            <span className="shrink-0">
              <Search size={18} />
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className={cn(
                'transition-all duration-150 text-sm bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 dark:text-white min-w-0',
                collapsedLabelClass,
              )}
            />
          </div>
        )}

        {results ? (
          results.length > 0 ? (
            results.map((item, idx) => (
              <ItemRow
                key={`${item.label}-${idx}`}
                item={item}
                labelClassName={alwaysVisibleLabelClass}
                LinkComponent={LinkComponent}
                onClickExtra={() => setQuery('')}
              />
            ))
          ) : (
            <span className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">
              No results
            </span>
          )
        ) : (
          items.map((item, idx) => {
            const itemKey = item.href ?? `${item.label}-${idx}`;
            if (item.children && item.children.length > 0) {
              const isOpen = openId === itemKey;
              return (
                <NestedItem
                  key={itemKey}
                  item={item}
                  isOpen={isOpen}
                  expandable={expandable}
                  LinkComponent={LinkComponent}
                  onToggle={() => setOpenId(isOpen ? null : itemKey)}
                />
              );
            }
            return (
              <ItemRow
                key={itemKey}
                item={item}
                labelClassName={
                  expandable ? collapsedLabelClass : alwaysVisibleLabelClass
                }
                LinkComponent={LinkComponent}
              />
            );
          })
        )}
      </div>

      {footer && (
        <div className="shrink-0 border-t border-gray-200 dark:border-gray-800">
          {footer}
        </div>
      )}
    </aside>
  );
};

type BrandingHeaderProps = {
  branding: SidebarBranding;
  LinkComponent?: LinkComponent;
  expandable: boolean;
};

const BrandingHeader = ({
  branding,
  LinkComponent,
  expandable,
}: BrandingHeaderProps) => {
  const Icon = branding.icon;
  const visual =
    branding.logo ??
    (Icon ? (
      <Icon size={18} />
    ) : (
      <span className="block w-[18px] h-[18px] rounded-sm bg-black dark:bg-white" />
    ));

  const labelClass = cn(
    'overflow-hidden font-semibold text-sm whitespace-nowrap transition-all duration-150',
    expandable
      ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100'
      : 'opacity-100',
  );

  const containerClass = cn(
    'flex items-center h-[49px] border-b border-gray-200 dark:border-gray-800 dark:text-white shrink-0 gap-3 px-3',
    expandable && 'justify-center group-hover/sidebar:justify-start',
  );

  const inner = (
    <>
      <span className="shrink-0">{visual}</span>
      <span className={labelClass}>{branding.label}</span>
    </>
  );

  if (branding.href && LinkComponent) {
    return (
      <LinkComponent
        href={branding.href}
        className={containerClass}
        onClick={branding.onClick}
      >
        {inner}
      </LinkComponent>
    );
  }
  if (branding.href) {
    return (
      <a
        href={branding.href}
        className={containerClass}
        onClick={branding.onClick}
      >
        {inner}
      </a>
    );
  }
  if (branding.onClick) {
    return (
      <button
        type="button"
        className={containerClass}
        onClick={branding.onClick}
      >
        {inner}
      </button>
    );
  }
  return <div className={containerClass}>{inner}</div>;
};

type NestedItemProps = {
  item: SidebarCTA;
  isOpen: boolean;
  expandable: boolean;
  LinkComponent?: LinkComponent;
  onToggle: () => void;
};

const NestedItem = ({
  item,
  isOpen,
  expandable,
  LinkComponent,
  onToggle,
}: NestedItemProps) => {
  const Icon = item.icon;
  const labelClass = cn(
    'whitespace-nowrap overflow-hidden text-left transition-all duration-150',
    expandable
      ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100'
      : 'hidden',
  );
  const chevronClass = cn(
    'shrink-0 transition-opacity duration-150',
    expandable ? 'opacity-0 group-hover/sidebar:opacity-100' : 'hidden',
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={item.title}
        className={cn(ITEM_BASE, item.isActive ? ITEM_ACTIVE : ITEM_INACTIVE)}
      >
        {Icon && (
          <span className="shrink-0">
            <Icon size={18} />
          </span>
        )}
        <span className={labelClass}>{item.label}</span>
        <span className={chevronClass}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 mt-1 ml-3 pb-1">
            {item.children?.map((child, idx) => (
              <ItemRow
                key={child.href ?? `${child.label}-${idx}`}
                item={child}
                labelClassName="opacity-100"
                LinkComponent={LinkComponent}
                className="px-3 py-1.5"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
