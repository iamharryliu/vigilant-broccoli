'use client';

import Link from 'next/link';
import { Select, DropdownMenu } from '@radix-ui/themes';
import { Home } from 'lucide-react';
import { supabase } from '../../../libs/supabase';
import { useHome } from '../providers/home-provider';
import { useAuth } from '../providers/auth-provider';
import { ROUTES } from '../../lib/routes';
import { UserAvatar, USER_AVATAR_VARIANT } from '@vigilant-broccoli/react-lib';

export default function Topbar() {
  const { homes, selectedHomeId, setSelectedHomeId } = useHome();
  const session = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-end gap-3 px-6 py-3 border-b border-gray-200 bg-white">
      {homes.length > 0 && (
        <div className="flex items-center gap-1.5 text-gray-500">
          <Home size={14} />
          <Select.Root
            size="1"
            value={selectedHomeId?.toString() ?? ''}
            onValueChange={val => setSelectedHomeId(Number(val))}
          >
            <Select.Trigger variant="ghost" />
            <Select.Content>
              {homes.map(home => (
                <Select.Item key={home.id} value={home.id.toString()}>
                  {home.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button className="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
            <UserAvatar
              name={session?.user.email}
              variant={USER_AVATAR_VARIANT.INITIALS}
            />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" size="1">
          {session?.user.email && (
            <>
              <div className="px-2 py-1.5">
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {session.user.email}
                </p>
              </div>
              <DropdownMenu.Separator />
            </>
          )}
          <DropdownMenu.Item asChild>
            <Link href={ROUTES.USER_SETTINGS}>User Settings</Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            color="red"
            className="cursor-pointer"
            onClick={() => supabase.auth.signOut()}
          >
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </header>
  );
}
