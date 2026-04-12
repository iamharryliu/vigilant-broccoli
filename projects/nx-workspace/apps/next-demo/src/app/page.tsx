'use client';

import { useEffect, useState } from 'react';
import { Badge, Button, Flex, Text } from '@radix-ui/themes';
import { useAuth } from './providers/auth-provider';

type PendingInvite = {
  id: string;
  home_id: number;
  invited_by_email: string | null;
};

export default function HomePage() {
  const session = useAuth();
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    if (!session) return;
    fetch('/api/auth/accept-invites', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setInvites(data);
      });
  }, [session]);

  const acceptInvite = async (invite: PendingInvite) => {
    await fetch('/api/auth/accept-invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeId: invite.home_id,
        accessToken: session?.access_token,
      }),
    });
    setInvites(prev => prev.filter(i => i.id !== invite.id));
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">next-demo</h1>
      {session && (
        <p className="text-sm text-gray-500">
          Signed in as {session.user.email}
        </p>
      )}
      {invites.length > 0 && (
        <div className="w-full max-w-sm space-y-2">
          <Text size="2" weight="medium">
            Pending invites
          </Text>
          {invites.map(invite => (
            <Flex
              key={invite.id}
              justify="between"
              align="center"
              className="rounded border px-3 py-2"
            >
              <Flex align="center" gap="2">
                <Text size="2">
                  Invited by {invite.invited_by_email ?? 'unknown'}
                </Text>
                <Badge variant="soft" color="orange" size="1">
                  pending
                </Badge>
              </Flex>
              <Button
                size="1"
                variant="soft"
                className="cursor-pointer"
                onClick={() => acceptInvite(invite)}
              >
                Accept
              </Button>
            </Flex>
          ))}
        </div>
      )}
    </main>
  );
}
