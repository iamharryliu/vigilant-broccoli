'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DropdownMenu, Popover } from '@radix-ui/themes';
import { Home, Menu, Moon, Sun } from 'lucide-react';
import { supabase } from '../../../libs/supabase';
import { useHome } from '../providers/home-provider';
import { useAuth } from '../providers/auth-provider';
import { useTopbarSlotNode } from '../providers/topbar-slot-provider';
import { ROUTES } from '../../lib/routes';
import {
  Button,
  IconButton,
  Select,
  Text,
  UserAvatar,
  USER_AVATAR_VARIANT,
  useTheme,
} from '@vigilant-broccoli/react-lib';

const LIGHT_MODE_LABEL = 'Light mode';
const DARK_MODE_LABEL = 'Dark mode';
const DARK = 'dark';
const ACCEPT_INVITES_ENDPOINT = '/api/auth/accept-invites';

type PendingInvite = {
  id: string;
  home_id: number;
  invited_by_email: string | null;
};

type TopbarProps = {
  onMenuClick: () => void;
};

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { homes, selectedHomeId, setSelectedHomeId } = useHome();
  const session = useAuth();
  const { appearance, toggleTheme } = useTheme();
  const setSlotNode = useTopbarSlotNode();
  const [invites, setInvites] = useState<PendingInvite[]>([]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(ACCEPT_INVITES_ENDPOINT, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setInvites(data);
      });
  }, [session?.access_token]);

  if (!session?.user.email) return null;
  const email = session.user.email;
  const isDark = appearance === DARK;
  const ThemeIcon = isDark ? Sun : Moon;

  const acceptInvite = async (invite: PendingInvite) => {
    await fetch(ACCEPT_INVITES_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeId: invite.home_id,
        accessToken: session.access_token,
      }),
    });
    setInvites(prev => prev.filter(i => i.id !== invite.id));
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-20 flex h-[var(--topbar-h)] items-center gap-3 border-b border-gray-200 bg-white pl-6 pr-6 dark:border-gray-800 dark:bg-gray-950 md:pl-14 md:peer-hover:pl-48 transition-[padding] duration-200"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingRight: 'var(--panel-offset)',
        transition: 'padding-right 300ms ease-in-out',
      }}
    >
      <button
        type="button"
        aria-label="Open menu"
        onClick={onMenuClick}
        className="md:hidden shrink-0 cursor-pointer rounded-md p-1 text-gray-500 hover:bg-gray-50 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <Menu size={20} />
      </button>

      <div
        ref={setSlotNode}
        className="hidden min-w-0 flex-1 items-center gap-2 overflow-x-auto md:flex"
      />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {invites.length > 0 && (
          <Popover.Root>
            <Popover.Trigger>
              <span className="relative inline-flex">
                <IconButton
                  variant="ghost"
                  icon="bell"
                  aria-label={`${invites.length} pending invite${invites.length === 1 ? '' : 's'}`}
                />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
              </span>
            </Popover.Trigger>
            <Popover.Content align="end" size="2" style={{ width: 280 }}>
              <Text size="2" weight="medium" as="p" mb="2">
                Pending invites
              </Text>
              <div className="flex flex-col gap-2">
                {invites.map(invite => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between gap-2 rounded border border-gray-200 px-3 py-2 dark:border-gray-800"
                  >
                    <Text size="2" className="truncate">
                      Invited by {invite.invited_by_email ?? 'unknown'}
                    </Text>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="cursor-pointer shrink-0"
                      onClick={() => acceptInvite(invite)}
                    >
                      Accept
                    </Button>
                  </div>
                ))}
              </div>
            </Popover.Content>
          </Popover.Root>
        )}
        {homes.length > 0 && (
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Home size={14} />
            <Select
              selectedOption={homes.find(h => h.id === selectedHomeId)}
              setValue={home => setSelectedHomeId(home.id)}
              options={homes}
              optionIdenfifier="id"
              optionDisplayKey="name"
            />
          </div>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <button className="cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400">
              <UserAvatar name={email} variant={USER_AVATAR_VARIANT.INITIALS} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" size="1">
            <div className="px-2 py-1.5">
              <p className="text-xs text-gray-500 truncate max-w-[180px] dark:text-gray-400">
                {email}
              </p>
            </div>
            <DropdownMenu.Separator />
            <DropdownMenu.Item asChild>
              <Link href={ROUTES.USER_SETTINGS}>User Settings</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              className="cursor-pointer flex items-center gap-2"
              onSelect={event => {
                event.preventDefault();
                toggleTheme();
              }}
            >
              <ThemeIcon size={14} />
              {isDark ? LIGHT_MODE_LABEL : DARK_MODE_LABEL}
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
      </div>
    </header>
  );
}
