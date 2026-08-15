'use client';

import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhiteboardEditor } from './components/WhiteboardEditor';

export default function WhiteboardPage() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  if (!homeId || !session?.user.id) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100dvh_-_var(--topbar-h)_-_5rem)]">
      <WhiteboardEditor
        homeId={homeId}
        token={token}
        userId={session.user.id}
        username={session.user.email ?? session.user.id}
        style={{ height: '100%' }}
      />
    </div>
  );
}
