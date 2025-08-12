'use client';

import { authClient } from '../../libs/auth-client';

const Navbar = () => {
  return (
    <nav>
      <button onClick={() => authClient.signOut()}>Logout</button>
    </nav>
  );
};

export default Navbar;
