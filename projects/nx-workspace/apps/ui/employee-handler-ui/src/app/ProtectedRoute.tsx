import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authClient } from '../../libs/auth-client';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { data: session, isPending: isLoading } = authClient.useSession();

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login');
    }
  }, [isLoading, router, session]);

  if (isLoading) return <p>Loading...</p>;
  return session ? <>{children}</> : null;
};

export default ProtectedRoute;
