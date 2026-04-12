'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../providers/auth-provider';
import { isWhitelisted } from '../../lib/whitelist';
import { ROUTES } from '../../lib/routes';
import { supabase } from '../../../libs/supabase';
import Navbar from './Navbar';

const PUBLIC_ROUTES = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.AUTH_CALLBACK];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const session = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  useEffect(() => {
    if (!session && !isPublic) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (session && !isWhitelisted(session.user.email)) {
      supabase.auth.signOut();
      router.replace(ROUTES.LOGIN);
      return;
    }

    if (session && isPublic) {
      router.replace(ROUTES.HOME);
    }
  }, [session, isPublic, router]);

  return (
    <>
      {session && !isPublic && <Navbar />}
      {children}
    </>
  );
}
