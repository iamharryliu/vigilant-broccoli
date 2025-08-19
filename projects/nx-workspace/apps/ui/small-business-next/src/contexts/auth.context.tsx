import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { User } from '../../lib/auth.types';
import { NEXT_AUTH_STATUS } from '../../lib/auth.consts';
import { NAV_ROUTE } from '../../lib/nav.consts';

interface AuthContextType {
  user: User;
  setUser: Dispatch<SetStateAction<User | undefined>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const { status: nextAuthStatus, data: nextAuthSession } = useSession();
  const [user, setUser] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  async function logout() {
    await signOut({ redirect: false });
  }

  useEffect(() => {
    async function getUserData() {
      if (nextAuthSession?.user?.email) {
        setUser({ email: nextAuthSession.user.email });
      }
      setIsLoading(false);
    }
    if (nextAuthStatus === NEXT_AUTH_STATUS.LOADING) return;
    else if (nextAuthStatus === NEXT_AUTH_STATUS.AUTHENTICATED) {
      getUserData();
    } else {
      setUser(undefined);
      setIsLoading(false);
      router.push(NAV_ROUTE.LOGIN);
    }
  }, [nextAuthStatus, nextAuthSession?.user?.email, router]);
  if (isLoading) {
    return null;
  }
  if (!user) return null;
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext) as AuthContextType;
};
