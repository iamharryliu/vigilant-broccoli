'use client';

import {
  ComponentType,
  ReactNode,
  useEffect,
  useState,
  MouseEvent,
} from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '../utils/cn';

export type SidebarCTA = {
  id?: string;
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
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  defaultOpenId?: string | null;
};

const ICON_SIZE = 18;
const CHEVRON_SIZE = 14;
const BRANDING_HEIGHT = 'h-[49px]';
const COLLAPSED_WIDTH = 'w-14';
const EXPANDED_WIDTH = 'hover:w-48';
const EXPANDED_FIXED_WIDTH = 'w-48';

const MOBILE_WIDTH = 'max-md:w-64';
const MOBILE_OPEN_TRANSFORM = 'max-md:translate-x-0';
const MOBILE_CLOSED_TRANSFORM = 'max-md:-translate-x-full';
const MD_VISIBLE_TRANSFORM = 'md:translate-x-0';
const MD_COLLAPSED_WIDTH = 'md:w-14';
const MD_EXPANDED_WIDTH = 'md:hover:w-48';
const MD_EXPANDED_FIXED_WIDTH = 'md:w-48';
const MOBILE_BACKDROP = 'fixed inset-0 z-20 bg-black/50 md:hidden';
const NARROW_VIEWPORT_QUERY = '(max-width: 767px)';

const BORDER_COLOR = 'border-gray-200 dark:border-gray-800';
const SURFACE_BG = 'bg-white dark:bg-gray-950';
const TEXT_MUTED = 'text-gray-500 dark:text-gray-400';
const TEXT_MUTED_HOVER =
  'hover:text-black hover:bg-gray-50 dark:hover:text-white dark:hover:bg-gray-800';

const ROW_BASE =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 w-full text-left';
const ROW_ACTIVE =
  'font-medium text-black bg-gray-100 dark:text-white dark:bg-gray-800';
const ROW_INACTIVE = `${TEXT_MUTED} ${TEXT_MUTED_HOVER}`;

const LABEL_BASE =
  'whitespace-nowrap overflow-hidden transition-all duration-150';
const LABEL_COLLAPSIBLE =
  'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100';
const LABEL_VISIBLE = 'flex-1 opacity-100';
const LABEL_HIDDEN = 'hidden';

const labelClassFor = (expandable: boolean) =>
  expandable ? LABEL_COLLAPSIBLE : LABEL_HIDDEN;

const useIsNarrowViewport = () => {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(NARROW_VIEWPORT_QUERY);
    const update = () => setIsNarrow(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isNarrow;
};

const flattenItems = (items: SidebarCTA[]): SidebarCTA[] =>
  items.flatMap(item =>
    item.children && item.children.length > 0
      ? [item, ...flattenItems(item.children)]
      : [item],
  );

const hasIcon = (item: SidebarCTA): boolean =>
  Boolean(item.icon) || (item.children?.some(hasIcon) ?? false);

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
      className={cn(
        ROW_BASE,
        item.isActive ? ROW_ACTIVE : ROW_INACTIVE,
        className,
      )}
      onClick={handleClick}
      LinkComponent={LinkComponent}
    >
      {Icon && (
        <span className="shrink-0">
          <Icon size={ICON_SIZE} />
        </span>
      )}
      <span className={cn(LABEL_BASE, Icon ? labelClassName : LABEL_VISIBLE)}>
        {item.label}
      </span>
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
  mobileOpen,
  onMobileClose,
  defaultOpenId = null,
}: SidebarProps) => {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (defaultOpenId !== null) setOpenId(defaultOpenId);
  }, [defaultOpenId]);

  const flat = searchable ? flattenItems(items) : [];
  const results =
    searchable && query.trim()
      ? flat.filter(p => p.label.toLowerCase().includes(query.toLowerCase()))
      : null;

  const isNarrowViewport = useIsNarrowViewport();
  const isMobileAware = mobileOpen !== undefined;
  const canCollapse = items.some(hasIcon);
  const forceExpanded = (isMobileAware && mobileOpen) || !canCollapse;
  const widthClass = isMobileAware
    ? cn(
        MOBILE_WIDTH,
        mobileOpen ? MOBILE_OPEN_TRANSFORM : MOBILE_CLOSED_TRANSFORM,
        MD_VISIBLE_TRANSFORM,
        canCollapse ? MD_COLLAPSED_WIDTH : MD_EXPANDED_FIXED_WIDTH,
        canCollapse && expandable && MD_EXPANDED_WIDTH,
      )
    : canCollapse
      ? cn(COLLAPSED_WIDTH, expandable && EXPANDED_WIDTH)
      : EXPANDED_FIXED_WIDTH;
  const collapsibleLabelClass = forceExpanded
    ? LABEL_VISIBLE
    : labelClassFor(expandable);
  const itemLabelClass = forceExpanded
    ? LABEL_VISIBLE
    : expandable
      ? LABEL_COLLAPSIBLE
      : LABEL_VISIBLE;

  const borderClass = `${side === 'right' ? 'border-l' : 'border-r'} ${BORDER_COLOR}`;
  const listJustify =
    align === 'space-evenly' ? 'justify-evenly' : 'justify-start';

  return (
    <>
      {isMobileAware && mobileOpen && (
        <div className={MOBILE_BACKDROP} onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          'group/sidebar shrink-0 flex flex-col overflow-hidden transition-all duration-200',
          SURFACE_BG,
          widthClass,
          borderClass,
          className,
        )}
        onMouseEnter={() => {
          if (forceExpanded || isNarrowViewport || defaultOpenId === null) {
            return;
          }
          setOpenId(defaultOpenId);
        }}
        onMouseLeave={() => {
          if (forceExpanded || (isMobileAware && isNarrowViewport)) return;
          setOpenId(null);
          setQuery('');
        }}
      >
        {branding && (
          <BrandingHeader
            branding={branding}
            LinkComponent={LinkComponent}
            expandable={expandable}
            forceExpanded={forceExpanded}
          />
        )}

        <div
          className={cn(
            'flex flex-col flex-1 gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden',
            listJustify,
          )}
        >
          {searchable && (
            <div
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md',
                ROW_INACTIVE,
              )}
            >
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
                  onClickExtra={() => {
                    setQuery('');
                    onMobileClose?.();
                  }}
                />
              ))
            ) : (
              <span className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2">
                No results
              </span>
            )
          ) : (
            items.map((item, idx) => {
              const itemKey = item.id ?? item.href ?? `${item.label}-${idx}`;
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
                    onNavigate={onMobileClose}
                    forceExpanded={forceExpanded}
                  />
                );
              }
              return (
                <ItemRow
                  key={itemKey}
                  item={item}
                  labelClassName={itemLabelClass}
                  LinkComponent={LinkComponent}
                  onClickExtra={onMobileClose}
                />
              );
            })
          )}
        </div>

        {footer && (
          <div className={cn('shrink-0 border-t', BORDER_COLOR)}>{footer}</div>
        )}
      </aside>
    </>
  );
};

type BrandingHeaderProps = {
  branding: SidebarBranding;
  LinkComponent?: LinkComponent;
  expandable: boolean;
  forceExpanded?: boolean;
};

const BrandingHeader = ({
  branding,
  LinkComponent,
  expandable,
  forceExpanded = false,
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
    forceExpanded
      ? 'opacity-100'
      : expandable
        ? 'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:opacity-100'
        : 'opacity-100',
  );

  const containerClass = cn(
    'flex items-center border-b shrink-0 gap-3 px-3 dark:text-white',
    BRANDING_HEIGHT,
    BORDER_COLOR,
    forceExpanded
      ? 'justify-start'
      : expandable && 'justify-center group-hover/sidebar:justify-start',
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
  onNavigate?: () => void;
  forceExpanded?: boolean;
};

const NestedItem = ({
  item,
  isOpen,
  expandable,
  LinkComponent,
  onToggle,
  onNavigate,
  forceExpanded = false,
}: NestedItemProps) => {
  const [openChildId, setOpenChildId] = useState<string | null>(null);
  const Icon = item.icon;
  const labelClass = cn(
    'whitespace-nowrap overflow-hidden text-left transition-all duration-150',
    !Icon || forceExpanded ? LABEL_VISIBLE : labelClassFor(expandable),
  );
  const chevronClass = cn(
    'shrink-0 transition-opacity duration-150',
    !Icon || forceExpanded
      ? 'opacity-100'
      : expandable
        ? 'opacity-0 group-hover/sidebar:opacity-100'
        : LABEL_HIDDEN,
  );

  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        title={item.title}
        aria-expanded={isOpen}
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
            {item.children?.map((child, idx) => {
              const childKey =
                child.id ?? child.href ?? `${child.label}-${idx}`;
              if (child.children && child.children.length > 0) {
                return (
                  <NestedItem
                    key={childKey}
                    item={child}
                    isOpen={openChildId === childKey}
                    expandable={expandable}
                    LinkComponent={LinkComponent}
                    onToggle={() =>
                      setOpenChildId(openChildId === childKey ? null : childKey)
                    }
                    onNavigate={onNavigate}
                    forceExpanded={forceExpanded}
                  />
                );
              }
              return (
                <ItemRow
                  key={childKey}
                  item={child}
                  labelClassName="opacity-100"
                  onClickExtra={onNavigate}
                  LinkComponent={LinkComponent}
                  className="px-3 py-1.5"
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
