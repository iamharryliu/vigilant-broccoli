'use client';

import { GroceryPageContent } from './GroceryPageContent';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function GroceryPage() {
  usePageTitle(PAGE_TITLES.GROCERY);
  return <GroceryPageContent />;
}
