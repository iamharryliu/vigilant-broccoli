'use client';

import { QuickLinksPanel } from '@vigilant-broccoli/react-lib';
import { QUICK_LINKS } from '../constants/quick-links';

export const QuickLinksView = () => (
  <QuickLinksPanel links={QUICK_LINKS} autoFocusSearch />
);
