'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@vigilant-broccoli/react-lib';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../../../libs/supabase';
import { ROUTES } from '../../lib/routes';
import { NAV_LINKS, NavLink } from '../app.consts';

const isLinkWithHref = (link: NavLink): link is NavLink & { href: string } =>
  Boolean(link.href);

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navLinks = NAV_LINKS.filter(isLinkWithHref);

  return (
    <nav className="border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href={ROUTES.HOME} className="font-semibold text-sm">
            Hearth
          </Link>
          <div className="hidden sm:flex items-center gap-4">
            {navLinks.map(({ label, href }) => (
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
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => {
                supabase.auth.signOut();
              }}
            >
              Sign out
            </Button>
          </div>
          <div className="flex sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => setOpen(prev => !prev)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {open && (
        <div className="sm:hidden flex flex-col px-6 pb-4 gap-3">
          {navLinks.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`text-sm ${pathname.startsWith(href) ? 'font-medium text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer self-start"
            onClick={() => {
              supabase.auth.signOut();
            }}
          >
            Sign out
          </Button>
        </div>
      )}
    </nav>
  );
}
