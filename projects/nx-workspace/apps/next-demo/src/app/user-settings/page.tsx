'use client';

import { Text } from '@radix-ui/themes';
import { useAuth } from '../providers/auth-provider';

export default function UserSettingsPage() {
  const session = useAuth();

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Text size="6" weight="bold">
        User Settings
      </Text>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Account
        </Text>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              Email
            </Text>
            <Text size="2">{session?.user.email ?? '—'}</Text>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <Text size="2" color="gray">
              User ID
            </Text>
            <Text size="2" className="font-mono text-xs">
              {session?.user.id ?? '—'}
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
}
