'use client';

import { useAuth } from '../app/context/AuthContext';

const Navbar = () => {
  const { logout } = useAuth();
  return (
    <nav>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;
