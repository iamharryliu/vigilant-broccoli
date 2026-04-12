'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../../../libs/supabase';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';

export default function DashboardPage() {
  const router = useRouter();
  const session = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome, {session?.user.email}</p>
      <button
        onClick={handleSignOut}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        Sign out
      </button>
    </main>
  );
}
