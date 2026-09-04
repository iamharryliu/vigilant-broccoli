'use client';

import { useDocumentTitle } from '@vigilant-broccoli/react-lib';

export const APP_NAME = 'Hearth';

export const PAGE_TITLES = {
  HOME: 'Home',
  LOGIN: 'Log In',
  SIGNUP: 'Sign Up',
  AUTH_CALLBACK: 'Signing In',
  HOMES: 'Homes',
  HOME_DETAIL: 'Home',
  HOME_CALENDAR: 'Home Calendar',
  CALENDAR: 'Calendar',
  OVERALL_CALENDAR: 'Overall Calendar',
  CHORES: 'Chores',
  DOCS: 'Docs',
  DOC_DETAIL: 'Doc',
  MASTER_LIST: 'Master List',
  HOUSEHOLD_RULES: 'Household Rules',
  HOUSEHOLD_RULE_DETAIL: 'Household Rule',
  FOOD_PLANNER: 'Food Planner',
  FOOD_CHAT: 'Food Assistant',
  FOOD_CALENDAR: 'Kitchen Events',
  GROCERY: 'Grocery List',
  KITCHEN_CHORES: 'Kitchen Chores',
  KITCHEN_NOTES: 'Kitchen Notes',
  MEAL_DETAIL: 'Meal',
  LEISURE: 'Leisure',
  LEISURE_DETAIL: 'Leisure Activity',
  LOCATOR: 'Find Members',
  PRICE_TRACKER: 'Price Tracker',
  PRICE_TRACKER_DETAIL: 'Tracked Item',
  PROJECTS: 'Projects',
  PROJECT_DETAIL: 'Project',
  RESOURCES: 'Resources',
  RESOURCE_DETAIL: 'Resource',
  SETTINGS: 'Settings',
  USER_SETTINGS: 'User Settings',
  WHERE_IS: 'Where Is',
  WHERE_IS_DETAIL: 'Storage Area',
  WHITEBOARD: 'Whiteboard',
} as const;

export const usePageTitle = (title: string) =>
  useDocumentTitle(title ? `${title} | ${APP_NAME}` : APP_NAME);
