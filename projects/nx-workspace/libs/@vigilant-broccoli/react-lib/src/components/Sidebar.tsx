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

const ICON_SIZE = 18;
const CHEVRON_SIZE = 14;
const BRANDING_HEIGHT = 'h-[49px]';
const COLLAPSED_WIDTH = 'w-14';
const EXPANDED_WIDTH = 'hover:w-48';

const BORDER_COLOR = 'border-gray-200 dark:border-gray-800';
const SURFACE_BG = 'bg-white dark:bg-gray-950';
const TEXT_MUTED = 'text-gray-500 dark:text-gray-400';
const TEXT_MUTED_HOVER = 'hover:text-black hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800';

const ROW_BASE =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 w-full text-left';
const ROW_ACTIVE = 'font-medium text-black bg-gray-100 dark:text-white dark:bg-gray-800';
const ROW_INACTIVE = `${TEXT_MUTED} ${TEXT_MUTED_HOVER}`;

const LABEL_BASE = 'whitespace-nowrap overflow-hidden transition-all duration-150';
const LABEL_COLLAPSIBLE =
  'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100';
const LABEL_VISIBLE = 'flex-1 opacity-100';
const LABEL_HIDDEN = 'hidden';

const labelClassFor = (expandable: boolean) =>
  expandable ? LABEL_COLLAPSIBLE : LABEL_HIDDEN;

const flattenItems = (items: SidebarCTA[]): SidebarCTA[] =>
  items.flatMap(item =>
    item.children && item.children.length > 0
      ? [item, ...flattenItems(item.children)]
      : [item],
  );

type PolymorphicRowProps = {
  href?: string;
  title?: string;
  className: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  LinkComponent?: LinkComponent;
  children: ReactNode;
};

const PolymorphicRow = ({
  href,
  title,
  className,
  onClick,
  LinkComponent,
  children,
}: PolymorphicRowProps) => {
  if (href && LinkComponent) {
    return (
      <LinkComponent
        href={href}
        title={title}
        className={className}
        onClick={onClick}
      >
        {children}
      </LinkComponent>
    );
  }
  if (href) {
    return (
      <a href={href} title={title} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" title={title} className={className} onClick={onClick}>
      {children}
    </button>
  );
};

type ItemRowProps = {
  item: SidebarCTA;
  labelClassName: string;
  LinkComponent?: LinkComponent;
  onClickExtra?: () => void;
  className?: string;
};

const ItemRow = ({
  item,
  labelClassName,
  LinkComponent,
  onClickExtra,
  className,
}: ItemRowProps) => {
  const Icon = item.icon;
  const handleClick = (e: MouseEvent<HTMLElement>) => {
    item.onClick?.(e);
    onClickExtra?.();
  };

  return (
    <PolymorphicRow
      href={item.href}
      title={item.title}
      className={cn(ROW_BASE, item.isActive ? ROW_ACTIVE : ROW_INACTIVE, className)}
      onClick={handleClick}
      LinkComponent={LinkComponent}
    >
      {Icon && (
        <span className="shrink-0">
          <Icon size={ICON_SIZE} />
        </span>
      )}
      <span className={cn(LABEL_BASE, labelClassName)}>{item.label}</span>
    </PolymorphicRow>
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
    ? `${COLLAPSED_WIDTH} ${EXPANDED_WIDTH}`
    : COLLAPSED_WIDTH;
  const collapsibleLabelClass = labelClassFor(expandable);
  const itemLabelClass = expandable ? LABEL_COLLAPSIBLE : LABEL_VISIBLE;

  const borderClass = `${side === 'right' ? 'border-l' : 'border-r'} ${BORDER_COLOR}`;
  const listJustify =
    align === 'space-evenly' ? 'justify-evenly' : 'justify-start';

  return (
    <aside
      className={cn(
        'group/sidebar shrink-0 flex flex-col overflow-hidden transition-all duration-200',
        SURFACE_BG,
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
          <div className={cn('flex items-center gap-3 px-2 py-2 rounded-md', ROW_INACTIVE)}>
            <span className="shrink-0">
              <Search size={ICON_SIZE} />
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className={cn(
                'transition-all duration-150 text-sm bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 dark:text-white min-w-0',
                collapsibleLabelClass,
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
                labelClassName={LABEL_VISIBLE}
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
                labelClassName={itemLabelClass}
                LinkComponent={LinkComponent}
              />
            );
          })
        )}
      </div>

      {footer && (
        <div className={cn('shrink-0 border-t', BORDER_COLOR)}>{footer}</div>
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
      <Icon size={ICON_SIZE} />
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
    'flex items-center border-b shrink-0 gap-3 px-3 dark:text-white',
    BRANDING_HEIGHT,
    BORDER_COLOR,
    expandable && 'justify-center group-hover/sidebar:justify-start',
  );

  const inner = (
    <>
      <span className="shrink-0">{visual}</span>
      <span className={labelClass}>{branding.label}</span>
    </>
  );

  if (!branding.href && !branding.onClick) {
    return <div className={containerClass}>{inner}</div>;
  }

  return (
    <PolymorphicRow
      href={branding.href}
      className={containerClass}
      onClick={branding.onClick}
      LinkComponent={LinkComponent}
    >
      {inner}
    </PolymorphicRow>
  );
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
    labelClassFor(expandable),
  );
  const chevronClass = cn(
    'shrink-0 transition-opacity duration-150',
    expandable ? 'opacity-0 group-hover/sidebar:opacity-100' : LABEL_HIDDEN,
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={item.title}
        className={cn(ROW_BASE, item.isActive ? ROW_ACTIVE : ROW_INACTIVE)}
      >
        {Icon && (
          <span className="shrink-0">
            <Icon size={ICON_SIZE} />
          </span>
        )}
        <span className={labelClass}>{item.label}</span>
        <span className={chevronClass}>
          {isOpen ? (
            <ChevronDown size={CHEVRON_SIZE} />
          ) : (
            <ChevronRight size={CHEVRON_SIZE} />
          )}
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
