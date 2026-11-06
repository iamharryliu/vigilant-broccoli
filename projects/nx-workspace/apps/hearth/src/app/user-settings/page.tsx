'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Input, Text } from '@vigilant-broccoli/react-lib';
import {
  CONTENT_TYPE_HEADER,
  HTTP_METHOD,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { useAuth } from '../providers/auth-provider';
import { supabase } from '../../../libs/supabase';
import { PAGE_TITLES, usePageTitle } from '../../lib/page-title';

const USER_API = '/api/user';
const FEEDBACK_RESET_MS = 1500;
const DISPLAY_NAME_DEBOUNCE_MS = 800;

export default function UserPage() {
  usePageTitle(PAGE_TITLES.USER);
  const session = useAuth();
  const initialDisplayName =
    (session?.user.user_metadata?.display_name as string) ?? '';
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const lastSavedName = useRef(initialDisplayName.trim());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userIdCopied, setUserIdCopied] = useState(false);

  const handleCopyUserId = async () => {
    if (!session?.user.id) return;
    await navigator.clipboard.writeText(session.user.id);
    setUserIdCopied(true);
    setTimeout(() => setUserIdCopied(false), FEEDBACK_RESET_MS);
  };

  const accessToken = session?.access_token;

  useEffect(() => {
    const trimmed = displayName.trim();
    if (!accessToken || !trimmed || trimmed === lastSavedName.current) return;
    const timeout = setTimeout(async () => {
      setSaving(true);
      await fetch(USER_API, {
        method: HTTP_METHOD.PATCH,
        headers: {
          [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ displayName: trimmed }),
      });
      lastSavedName.current = trimmed;
      // Refreshing swaps the access token, which would re-run this effect; the
      // lastSavedName guard above makes that re-run a no-op.
      await supabase.auth.refreshSession();
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), FEEDBACK_RESET_MS);
    }, DISPLAY_NAME_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [displayName, accessToken]);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Text size="6" weight="bold">
        User
      </Text>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Account
        </Text>
        <div className="border border-border rounded-lg divide-y divide-border">
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
            {session?.user.id ? (
              <button
                onClick={handleCopyUserId}
                className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-inherit p-0"
                aria-label="Copy user ID"
              >
                <Text size="2" className="font-mono text-xs">
                  {session.user.id}
                </Text>
                {userIdCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            ) : (
              <Text size="2">—</Text>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <Text size="3" weight="medium">
          Profile
        </Text>
        <div className="flex items-center justify-between gap-4">
          <Text size="2" color="gray" className="shrink-0">
            Display Name
          </Text>
          <div className="flex items-center gap-2">
            <Input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter display name"
            />
            <Text size="1" color="gray" className="w-12">
              {saving ? 'Saving…' : saved ? 'Saved' : ''}
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
}
