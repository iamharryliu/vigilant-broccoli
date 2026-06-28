'use client';

import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { WhiteboardEditor } from './components/WhiteboardEditor';

export default function WhiteboardPage() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';

  if (!homeId) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 h-[calc(100vh-8rem)]">
      <WhiteboardEditor
        homeId={homeId}
        token={token}
        style={{ height: '100%' }}
      />
    </div>
  );
}
