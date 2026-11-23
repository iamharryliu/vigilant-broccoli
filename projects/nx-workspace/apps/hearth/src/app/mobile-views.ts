import { ComponentType } from 'react';
import { ROUTES } from '../lib/routes';
import { GroceryPageContent } from './grocery/GroceryPageContent';

/** Body rendered in place for a `mobileOnlyChildren` child, keyed by its href. */
export const MOBILE_VIEWS: Record<string, ComponentType> = {
  [ROUTES.GROCERY]: GroceryPageContent,
};
