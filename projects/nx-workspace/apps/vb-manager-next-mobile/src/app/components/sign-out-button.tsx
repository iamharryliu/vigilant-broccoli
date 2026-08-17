'use client';

import { usePathname } from 'next/navigation';
import { useAuth, signOut } from '../providers/auth-provider';

export const SignOutButton = () => {
  const pathname = usePathname();
  const session = useAuth();

  if (pathname === '/login' || !session) return null;

  return (
    <button
      onClick={() => signOut()}
      aria-label="Sign out"
      className="fixed top-3 right-3 z-20 safe-top flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 backdrop-blur hover:bg-gray-50 active:bg-gray-100 transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.75}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Sign out
    </button>
  );
};
