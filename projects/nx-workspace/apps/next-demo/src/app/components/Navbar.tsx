'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';
import { NAV_LINKS } from '../app.consts';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
      <div className="flex items-center gap-6">
        <Link href={ROUTES.HOME} className="font-semibold text-sm">
          next-demo
        </Link>
        <div className="flex items-center gap-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`text-sm ${pathname.startsWith(href) ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="1"
        className="cursor-pointer"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </Button>
    </nav>
  );
}
