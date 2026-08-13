import { ComponentType } from 'react';
import {
  Calendar,
  Wrench,
  ListTodo,
  Settings,
  LayoutList,
  PenLine,
  MapPin,
  UtensilsCrossed,
  PackageSearch,
  FlaskConical,
  ShoppingCart,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';

export type NavLink = {
  label: string;
  href?: string;
  icon?: ComponentType<{ size?: number | string }>;
  children?: NavLink[];
  mobileOnlyChildren?: boolean;
};

export const IS_DEV = process.env.NODE_ENV !== 'production';

const DEV_FEATURES_LINK: NavLink = {
  label: 'Dev Features',
  icon: FlaskConical,
  children: [
    { label: 'Chores', href: ROUTES.CHORES, icon: ListTodo },
    {
      label: 'Lists',
      href: ROUTES.MASTER_LIST,
      icon: LayoutList,
      children: [
        { label: 'Master List', href: ROUTES.MASTER_LIST },
        { label: 'Household Rules', href: ROUTES.HOUSEHOLD_RULES },
      ],
    },
    {
      label: 'Utility',
      href: ROUTES.DOCS,
      icon: Wrench,
      children: [
        { label: 'Docs', href: ROUTES.DOCS },
        { label: 'Price Tracker', href: ROUTES.PRICE_TRACKER },
      ],
    },
    {
      label: 'Calendar',
      href: ROUTES.CALENDAR,
      icon: Calendar,
      children: [
        { label: 'Overall Calendar', href: ROUTES.OVERALL_CALENDAR },
        { label: 'Resources', href: ROUTES.RESOURCES },
        { label: 'Leisure', href: ROUTES.LEISURE },
        { label: 'Projects', href: ROUTES.PROJECTS },
        { label: 'Meals', href: ROUTES.MEALS },
      ],
    },
  ],
};

export const NAV_LINKS: NavLink[] = [
  { label: 'Where Is', href: ROUTES.WHERE_IS, icon: PackageSearch },
  {
    label: 'Food Planner',
    href: ROUTES.FOOD_PLANNER,
    icon: UtensilsCrossed,
    mobileOnlyChildren: true,
    children: [
      { label: 'Grocery List', href: ROUTES.GROCERY, icon: ShoppingCart },
      { label: 'Kitchen Chores', href: ROUTES.KITCHEN_CHORES, icon: Sparkles },
      { label: 'Kitchen Notes', href: ROUTES.KITCHEN_NOTES, icon: StickyNote },
    ],
  },
  { label: 'Find Members', href: ROUTES.LOCATOR, icon: MapPin },
  { label: 'Whiteboard', href: ROUTES.WHITEBOARD, icon: PenLine },
  ...(IS_DEV ? [DEV_FEATURES_LINK] : []),
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];
