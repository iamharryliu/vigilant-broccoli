import {
  Calendar,
  Wrench,
  ListTodo,
  Settings,
  LayoutList,
  PenLine,
  MapPin,
  ChefHat,
  PackageSearch,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const NAV_LINKS = [
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
  { label: 'Where Is', href: ROUTES.WHERE_IS, icon: PackageSearch },
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
    label: 'Lists',
    href: ROUTES.MASTER_LIST,
    icon: LayoutList,
    children: [
      { label: 'Master List', href: ROUTES.MASTER_LIST },
      { label: 'Household Rules', href: ROUTES.HOUSEHOLD_RULES },
    ],
  },
  { label: 'Food Planner', href: ROUTES.FOOD_PLANNER, icon: ChefHat },
  { label: 'Find Members', href: ROUTES.LOCATOR, icon: MapPin },
  { label: 'Whiteboard', href: ROUTES.WHITEBOARD, icon: PenLine },
  { label: 'Chores', href: ROUTES.CHORES, icon: ListTodo },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];
