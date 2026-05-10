'use client';

import Link from 'next/link';
import { Select, DropdownMenu, IconButton } from '@radix-ui/themes';
import { User } from 'lucide-react';
import { supabase } from '../../../libs/supabase';
import { useHome } from '../providers/home-provider';
import { ROUTES } from '../../lib/routes';

export default function Topbar() {
  const { homes, selectedHomeId, setSelectedHomeId } = useHome();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 flex items-center justify-end gap-3 px-6 py-3 border-b border-gray-200 bg-white">
      {homes.length > 0 && (
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
      )}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <IconButton variant="ghost" size="1" className="cursor-pointer">
            <User size={16} />
          </IconButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" size="1">
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
