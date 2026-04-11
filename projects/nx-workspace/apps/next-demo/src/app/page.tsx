'use client';

import { useAuth } from './providers/auth-provider';

export default function HomePage() {
  const session = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">next-demo</h1>
      {session ? (
        <p className="text-sm text-gray-500">
          Signed in as {session.user.email}
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      )}
    </main>
  );
}
