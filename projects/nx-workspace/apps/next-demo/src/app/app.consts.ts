import {
  Home,
  Calendar,
  Wrench,
  BookOpen,
  ListTodo,
  Settings,
} from 'lucide-react';
import { ROUTES } from '../lib/routes';

export const NAV_LINKS = [
  { label: 'Home', href: ROUTES.MY_HOME, icon: Home },
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
  {
    label: 'Utility',
    href: ROUTES.WHERE_IS,
    icon: Wrench,
    children: [
      { label: 'Where Is', href: ROUTES.WHERE_IS },
      { label: 'Docs', href: ROUTES.DOCS },
      { label: 'Price Tracker', href: ROUTES.PRICE_TRACKER },
    ],
  },
  { label: 'Household Rules', href: ROUTES.HOUSEHOLD_RULES, icon: BookOpen },
  { label: 'Chores', href: ROUTES.CHORES, icon: ListTodo },
  { label: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
];
