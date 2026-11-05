'use client';

import { WhiteboardPageContent } from './WhiteboardPageContent';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

export default function WhiteboardPage() {
  usePageTitle(PAGE_TITLES.WHITEBOARD);
  return <WhiteboardPageContent />;
}
