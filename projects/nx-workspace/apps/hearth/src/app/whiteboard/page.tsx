'use client';

import { cn } from '@vigilant-broccoli/react-lib';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhiteboardEditor } from './components/WhiteboardEditor';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';
import { FULL_HEIGHT_PAGE_CLASS } from '../../lib/page-layout';

export default function WhiteboardPage() {
  usePageTitle(PAGE_TITLES.WHITEBOARD);
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  if (!homeId || !session?.user.id) return null;

  return (
    <div
      className={cn(
        'mx-auto flex max-w-3xl flex-col p-6',
        FULL_HEIGHT_PAGE_CLASS,
      )}
    >
      <WhiteboardEditor
        homeId={homeId}
        token={token}
        userId={session.user.id}
        username={session.user.email ?? session.user.id}
      />
    </div>
  );
}
