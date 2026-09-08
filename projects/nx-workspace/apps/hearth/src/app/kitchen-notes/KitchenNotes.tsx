'use client';

import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhiteboardEditor } from '../whiteboard/components/WhiteboardEditor';

const BOARD_KEY = 'kitchen';
const PLACEHOLDER = 'Shared kitchen notes...';

export function KitchenNotes() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  if (!homeId || !session?.user.id) return null;

  return (
    <WhiteboardEditor
      homeId={homeId}
      token={token}
      userId={session.user.id}
      username={session.user.email ?? session.user.id}
      boardKey={BOARD_KEY}
      placeholder={PLACEHOLDER}
      style={{ height: '100%' }}
    />
  );
}
