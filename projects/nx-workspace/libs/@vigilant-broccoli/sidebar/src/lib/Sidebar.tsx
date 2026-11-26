'use client';

import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  MouseEvent,
  TransitionEvent,
} from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import {
  SearchDialog,
  SearchDialogItem,
  cn,
  useFocusSearchShortcut,
  useMediaQuery,
} from '@vigilant-broccoli/react-lib';

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
  // Client-side navigation for a picked search result; defaults to a full
  // page load so apps without a router still work.
  onNavigate?: (href: string) => void;
  footer?: ReactNode;
  LinkComponent?: LinkComponent;
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  mobileBreakpoint?: SidebarMobileBreakpoint;
  defaultOpenId?: string | null;
  expandOn?: SidebarExpandTrigger;
};

// What opens a group on a collapsed desktop rail: hovering its row, or only
// clicking it. Drawers and always-expanded sidebars are click-only either way.
export type SidebarExpandTrigger = 'hover' | 'click';

// Group content animates open over 300ms; the active row is only measurable
// once it has.
const GROUP_OPEN_MS = 350;
const ACTIVE_ROW_SELECTOR = '[aria-current="page"]';
const COLLAPSED_GROUP_SELECTOR = '[data-open="false"]';

const findActiveKey = (items: SidebarCTA[]): string | null => {
  for (const [idx, item] of items.entries()) {
    if (item.children?.length) {
      const nested = findActiveKey(item.children);
      if (nested !== null) return `${item.label}/${nested}`;
    } else if (item.isActive) {
      return item.id ?? item.href ?? `${item.label}-${idx}`;
    }
  }
  return null;
};

const ICON_SIZE = 18;
const CHEVRON_SIZE = 14;
const BRANDING_HEIGHT = 'h-[49px]';
const COLLAPSED_WIDTH = 'w-14';
const EXPANDED_WIDTH = 'hover:w-48';
const EXPANDED_FIXED_WIDTH = 'w-48';

// Tailwind only generates classes it can see as complete literals, so each
// breakpoint's drawer/rail switch is spelled out rather than built from the
// prop at runtime. `md` is the original behaviour and stays the default.
const BREAKPOINTS = {
  md: {
    mobileWidth: 'max-md:w-64',
    mobileOpenTransform: 'max-md:translate-x-0',
    mobileClosedTransform: 'max-md:-translate-x-full',
    railVisibleTransform: 'md:translate-x-0',
    railCollapsedWidth: 'md:w-14',
    railExpandedWidth: 'md:hover:w-48',
    railExpandedFixedWidth: 'md:w-48',
    backdrop: 'fixed inset-0 z-20 bg-black/50 md:hidden',
    narrowViewportQuery: '(max-width: 767px)',
  },
  lg: {
    mobileWidth: 'max-lg:w-64',
    mobileOpenTransform: 'max-lg:translate-x-0',
    mobileClosedTransform: 'max-lg:-translate-x-full',
    railVisibleTransform: 'lg:translate-x-0',
    railCollapsedWidth: 'lg:w-14',
    railExpandedWidth: 'lg:hover:w-48',
    railExpandedFixedWidth: 'lg:w-48',
    backdrop: 'fixed inset-0 z-20 bg-black/50 lg:hidden',
    narrowViewportQuery: '(max-width: 1023px)',
  },
} as const;

export type SidebarMobileBreakpoint = keyof typeof BREAKPOINTS;

const BORDER_COLOR = 'border-border';
const SURFACE_BG = 'bg-background';
const TEXT_MUTED = 'text-muted-foreground';
const TEXT_MUTED_HOVER = 'hover:text-foreground hover:bg-accent';

const ROW_BASE =
  'text-sm rounded-md transition-colors flex items-center gap-3 px-2 py-2 w-full text-left';
const ROW_ACTIVE = 'font-medium text-foreground bg-accent';
const ROW_INACTIVE = `${TEXT_MUTED} ${TEXT_MUTED_HOVER}`;

const LABEL_BASE =
  'whitespace-nowrap overflow-hidden transition-all duration-150';
const SEARCH_LABEL_BASE = `${LABEL_BASE} text-left`;
const LABEL_COLLAPSIBLE =
  'w-0 opacity-0 group-hover/sidebar:w-auto group-hover/sidebar:flex-1 group-hover/sidebar:opacity-100';
const LABEL_VISIBLE = 'flex-1 opacity-100';
const LABEL_HIDDEN = 'hidden';

const labelClassFor = (expandable: boolean) =>
  expandable ? LABEL_COLLAPSIBLE : LABEL_HIDDEN;

type SearchResult = SearchDialogItem & { href: string };

const SEARCH_PATH_SEPARATOR = ' › ';

// Only items with a destination are searchable; a group header without an
// href has nothing to open. Parent labels become the description so nested
// items such as "Overall" read as "Calendar".
const toSearchResults = (
  items: SidebarCTA[],
  parents: string[] = [],
): SearchResult[] =>
  items.flatMap(item => {
    const nested = toSearchResults(item.children ?? [], [
      ...parents,
      item.label,
    ]);
    if (!item.href) return nested;
    const path = [...parents, item.label];
    return [
      {
        id: item.id ?? path.join(SEARCH_PATH_SEPARATOR),
        title: item.label,
        description: parents.length
          ? parents.join(SEARCH_PATH_SEPARATOR)
          : undefined,
        href: item.href,
      },
      ...nested,
    ];
  });

const hasIcon = (item: SidebarCTA): boolean =>
  Boolean(item.icon) || (item.children?.some(hasIcon) ?? false);

type PolymorphicRowProps = {
  href?: string;
  title?: string;
  isActive?: boolean;
  className: string;
  onClick?: (e: MouseEvent<HTMLElement>) => void;
  onMouseEnter?: () => void;
  LinkComponent?: LinkComponent;
  children: ReactNode;
};

const PolymorphicRow = ({
  href,
  title,
  isActive,
  className,
  onClick,
  onMouseEnter,
  LinkComponent,
  children,
}: PolymorphicRowProps) => {
  if (href && LinkComponent) {
    return (
      <LinkComponent
        href={href}
        title={title}
        aria-current={isActive ? 'page' : undefined}
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </LinkComponent>
    );
  }
  if (href) {
    return (
      <a
        href={href}
        title={title}
        aria-current={isActive ? 'page' : undefined}
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      title={title}
      aria-current={isActive ? 'page' : undefined}
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {children}
    </button>
  );
};

type ItemRowProps = {
  item: SidebarCTA;
  labelClassName: string;
  LinkComponent?: LinkComponent;
  onClickExtra?: () => void;
  onMouseEnter?: () => void;
  className?: string;
};

const ItemRow = ({
  item,
  labelClassName,
  LinkComponent,
  onClickExtra,
  onMouseEnter,
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
      isActive={item.isActive}
      className={cn(
        ROW_BASE,
        item.isActive ? ROW_ACTIVE : ROW_INACTIVE,
        className,
      )}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
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
  onNavigate,
  footer,
  LinkComponent,
  className,
  mobileOpen,
  onMobileClose,
  mobileBreakpoint = 'md',
  defaultOpenId = null,
  expandOn = 'hover',
}: SidebarProps) => {
  const breakpoint = BREAKPOINTS[mobileBreakpoint];
  const isMobileAware = mobileOpen !== undefined;
  const canCollapse = items.some(hasIcon);
  const forceExpanded = (isMobileAware && mobileOpen) || !canCollapse;

  // Only seed the initial open group when the sidebar starts already fully
  // expanded (mobile drawer open, or icon-less always-expanded). Otherwise a
  // collapsed desktop rail would render internally "open" to the active
  // group - active styling and all - before the user ever hovers it.
  // onMouseEnter below is what opens it on demand instead.
  const [openId, setOpenId] = useState<string | null>(
    forceExpanded ? defaultOpenId : null,
  );
  const [searchOpen, setSearchOpen] = useState(false);

  // A long list leaves the active row below the fold; bring it into view when
  // the selection changes, and again as each group on its path finishes
  // opening. Rows inside a collapsed group are skipped: they have no height.
  const listRef = useRef<HTMLDivElement>(null);
  const scrollActiveIntoView = useCallback(() => {
    const list = listRef.current;
    const row = list?.querySelector(ACTIVE_ROW_SELECTOR);
    if (!list || !row || row.closest(COLLAPSED_GROUP_SELECTOR)) return;
    // Aligns the row with the top of the list, as far as the list's own scroll
    // range allows; scrolling the list directly keeps ancestors still.
    const offset =
      row.getBoundingClientRect().top -
      list.getBoundingClientRect().top -
      parseFloat(getComputedStyle(list).paddingTop);
    list.scrollTo({ top: list.scrollTop + offset, behavior: 'smooth' });
  }, []);
  const activeKey = useMemo(() => findActiveKey(items), [items]);
  useEffect(() => {
    const frame = requestAnimationFrame(scrollActiveIntoView);
    const timer = window.setTimeout(scrollActiveIntoView, GROUP_OPEN_MS);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [activeKey, scrollActiveIntoView]);
  const handleGroupOpened = (event: TransitionEvent<HTMLDivElement>) => {
    const group = event.target as HTMLElement;
    if (
      group.dataset.open === 'true' &&
      group.querySelector(ACTIVE_ROW_SELECTOR)
    )
      scrollActiveIntoView();
  };

  // Re-syncs openId whenever defaultOpenId changes (e.g. a new search
  // selection), but only while the sidebar is already fully expanded -
  // forceExpanded is read here rather than listed as a dependency, so a
  // collapsed desktop rail toggling in and out of hover (or a mobile drawer
  // opening/closing) doesn't itself re-trigger this and stomp a manually
  // expanded *different* group. This mirrors the useState initializer above,
  // and matters on every mount too since effects always run at least once
  // after the first render regardless of their dependency array.
  useEffect(() => {
    if (defaultOpenId !== null && forceExpanded) setOpenId(defaultOpenId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultOpenId]);

  const searchResults = useMemo(
    () => (searchable ? toSearchResults(items) : []),
    [searchable, items],
  );
  const openSearch = useCallback(() => setSearchOpen(true), []);
  useFocusSearchShortcut(openSearch, { enabled: searchable });

  const selectSearchResult = (result: SearchResult) => {
    onMobileClose?.();
    if (onNavigate) onNavigate(result.href);
    else window.location.assign(result.href);
  };

  const isNarrowViewport = useMediaQuery(breakpoint.narrowViewportQuery);
  const widthClass = isMobileAware
    ? cn(
        breakpoint.mobileWidth,
        mobileOpen
          ? breakpoint.mobileOpenTransform
          : breakpoint.mobileClosedTransform,
        breakpoint.railVisibleTransform,
        canCollapse
          ? breakpoint.railCollapsedWidth
          : breakpoint.railExpandedFixedWidth,
        canCollapse && expandable && breakpoint.railExpandedWidth,
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
        <div className={breakpoint.backdrop} onClick={onMobileClose} />
      )}
      <aside
        className={cn(
          'group/sidebar shrink-0 flex flex-col overflow-hidden transition-all duration-200',
          SURFACE_BG,
          widthClass,
          borderClass,
          className,
        )}
        onMouseLeave={() => {
          if (forceExpanded || (isMobileAware && isNarrowViewport)) return;
          setOpenId(null);
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
          ref={listRef}
          onTransitionEnd={handleGroupOpened}
          className={cn(
            'flex flex-col flex-1 gap-1 px-2 py-4 overflow-y-auto overflow-x-hidden',
            listJustify,
          )}
        >
          {searchable && (
            <button
              type="button"
              onClick={openSearch}
              aria-label="Search"
              aria-keyshortcuts="/"
              className={cn(ROW_BASE, ROW_INACTIVE)}
            >
              <span className="shrink-0">
                <Search size={ICON_SIZE} />
              </span>
              <span className={cn(SEARCH_LABEL_BASE, collapsibleLabelClass)}>
                Search...
              </span>
              <kbd
                className={cn(
                  'rounded border px-1.5 text-xs',
                  BORDER_COLOR,
                  forceExpanded ? 'block' : 'hidden group-hover/sidebar:block',
                )}
              >
                /
              </kbd>
            </button>
          )}

          {items.map((item, idx) => {
            const itemKey = item.id ?? item.href ?? `${item.label}-${idx}`;
            // On a collapsed desktop rail, hovering a group should open
            // *that* group - not whatever the active selection's group is
            // - and hovering a plain (non-group) row should close
            // whichever group was previously open, since attention has
            // moved elsewhere. With expandOn 'click', groups only open on
            // click. Mobile drawers and always-expanded
            // (icon-less) sidebars have no hover-collapse concept, so this
            // is a no-op there.
            const canHoverSwitch =
              expandOn === 'hover' && !forceExpanded && !isNarrowViewport;
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
                  onMouseEnter={
                    canHoverSwitch ? () => setOpenId(itemKey) : undefined
                  }
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
                onMouseEnter={
                  canHoverSwitch ? () => setOpenId(null) : undefined
                }
              />
            );
          })}
        </div>

        {searchable && (
          <SearchDialog
            open={searchOpen}
            onOpenChange={setSearchOpen}
            items={searchResults}
            onSelect={selectSearchResult}
            title="Search"
            description="Type to filter pages, then press Enter to open the selected one."
            placeholder="Search..."
            emptyLabel="No results"
          />
        )}

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
      <span className="block w-[18px] h-[18px] rounded-sm bg-foreground" />
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
    'flex items-center border-b shrink-0 gap-3 px-3 text-foreground',
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
  onMouseEnter?: () => void;
  onNavigate?: () => void;
  forceExpanded?: boolean;
};

const itemKeyFor = (item: SidebarCTA, idx: number) =>
  item.id ?? item.href ?? `${item.label}-${idx}`;

const findActiveChildGroupKey = (item: SidebarCTA): string | null => {
  const idx =
    item.children?.findIndex(
      child => child.isActive && (child.children?.length ?? 0) > 0,
    ) ?? -1;
  return idx === -1 || !item.children
    ? null
    : itemKeyFor(item.children[idx], idx);
};

const NestedItem = ({
  item,
  isOpen,
  expandable,
  LinkComponent,
  onToggle,
  onMouseEnter,
  onNavigate,
  forceExpanded = false,
}: NestedItemProps) => {
  const activeChildGroupKey = findActiveChildGroupKey(item);
  const [openChildId, setOpenChildId] = useState<string | null>(
    activeChildGroupKey,
  );
  // Nested levels have no defaultOpenId, so follow the active selection into
  // whichever child group now contains it.
  useEffect(() => {
    if (activeChildGroupKey !== null) setOpenChildId(activeChildGroupKey);
  }, [activeChildGroupKey]);
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
        onMouseEnter={onMouseEnter}
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
        data-open={isOpen}
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1 mt-1 ml-3 pb-1">
            {item.children?.map((child, idx) => {
              const childKey = itemKeyFor(child, idx);
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
