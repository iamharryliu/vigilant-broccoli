'use client';

import { Button, Select } from '@radix-ui/themes';
import { supabase } from '../../../libs/supabase';
import { useHome } from '../providers/home-provider';

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
      <Button
        variant="ghost"
        size="1"
        className="cursor-pointer"
        onClick={() => supabase.auth.signOut()}
      >
        Sign out
      </Button>
    </header>
  );
}
