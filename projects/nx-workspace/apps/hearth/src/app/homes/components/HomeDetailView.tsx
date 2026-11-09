'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../../libs/supabase';
import { useAuth } from '../../providers/auth-provider';
import { HTTP_METHOD } from '@vigilant-broccoli/common-js';
import {
  HOME_ROLE,
  HomeMember,
  HomeRole,
  MEMBER_STATUS,
  MemberOrigin,
  MemberStatus,
} from '../../../lib/types';
import { JOIN_REQUESTS_ENDPOINT } from '../../../lib/invite-links';
import { useJsonAuthHeaders } from '../../hooks/use-auth-headers';
import { HomeDetailSkeleton } from './HomeDetailSkeleton';
import { HomeForm, SaveStatus } from './HomeForm';
import { MemberList } from './MemberList';
import { InviteLinkControls } from './InviteLinkControls';

type Props = {
  homeId: string;
};

const SAVE_DEBOUNCE_MS = 700;
const SAVED_VISIBLE_MS = 1500;

export const HomeDetailView = ({ homeId }: Props) => {
  const session = useAuth();
  const jsonHeaders = useJsonAuthHeaders();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    supabase
      .from('homes')
      .select('*')
      .eq('id', homeId)
      .single()
      .then(({ data }) => {
        if (!data) return;
        setName(data.name);
        setDescription(data.description ?? '');
        setIsOwner(data.user_id === session?.user.id);
        setLoaded(true);
      });
  }, [homeId, session?.user.id]);

  useEffect(() => {
    if (!loaded || !dirtyRef.current || !name.trim()) return;
    setStatus('saving');
    const timer = setTimeout(async () => {
      await fetch(`/api/homes/${homeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          accessToken: session?.access_token,
        }),
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), SAVED_VISIBLE_MS);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [name, description, loaded, homeId, session?.access_token]);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/homes/${homeId}/members`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) {
          const mapped = data.map((m: Record<string, string>) => ({
            id: m.id,
            email: m.email,
            status: (m.status ?? MEMBER_STATUS.ACCEPTED) as MemberStatus,
            origin: m.origin as MemberOrigin | undefined,
            role: (m.role ?? HOME_ROLE.MEMBER) as HomeRole,
            createdAt: m.created_at ?? '',
          }));
          setMembers(mapped);
          const currentMember = mapped.find(
            m => m.email === session?.user.email,
          );
          setIsAdmin(currentMember?.role === HOME_ROLE.ADMIN);
        }
        setMembersLoaded(true);
      });
  }, [homeId, session?.access_token]);

  const handleNameChange = (v: string) => {
    dirtyRef.current = true;
    setName(v);
  };

  const handleDescriptionChange = (v: string) => {
    dirtyRef.current = true;
    setDescription(v);
  };

  const inviteMember = async (member: HomeMember): Promise<HomeMember> => {
    await fetch(`/api/homes/${homeId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: member.email,
        accessToken: session?.access_token,
      }),
    });
    return {
      id: crypto.randomUUID(),
      email: member.email,
      status: MEMBER_STATUS.PENDING,
      role: HOME_ROLE.MEMBER,
      createdAt: new Date().toISOString(),
    };
  };

  const resolveJoinRequest = async (
    method: typeof HTTP_METHOD.POST | typeof HTTP_METHOD.DELETE,
    memberId: string,
  ) => {
    const res = await fetch(JOIN_REQUESTS_ENDPOINT(homeId), {
      method,
      headers: await jsonHeaders(),
      body: JSON.stringify({ memberId }),
    });
    return res.ok;
  };

  const approveRequest = async (memberId: string) => {
    const ok = await resolveJoinRequest(HTTP_METHOD.POST, memberId);
    if (ok) {
      setMembers(prev =>
        prev.map(m =>
          m.id === memberId ? { ...m, status: MEMBER_STATUS.ACCEPTED } : m,
        ),
      );
    }
    return ok;
  };

  const rejectRequest = async (memberId: string) => {
    const ok = await resolveJoinRequest(HTTP_METHOD.DELETE, memberId);
    if (ok) setMembers(prev => prev.filter(m => m.id !== memberId));
    return ok;
  };

  const updateMemberRole = async (memberId: string, role: HomeRole) => {
    await fetch(`/api/homes/${homeId}/members`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId,
        role,
        accessToken: session?.access_token,
      }),
    });
    setMembers(prev => prev.map(m => (m.id === memberId ? { ...m, role } : m)));
  };

  const deleteMember = async (memberId: string | number) => {
    await fetch(`/api/homes/${homeId}/members`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, accessToken: session?.access_token }),
    });
  };

  if (!loaded) return <HomeDetailSkeleton />;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <HomeForm
          name={name}
          description={description}
          onNameChange={handleNameChange}
          onDescriptionChange={handleDescriptionChange}
          status={status}
          disabled={!isOwner && !isAdmin}
        />
      </div>
      <MemberList
        loading={!membersLoaded}
        members={members}
        setMembers={setMembers}
        isOwner={isOwner || isAdmin}
        isAdmin={isAdmin}
        onInvite={inviteMember}
        onDelete={deleteMember}
        onRoleChange={updateMemberRole}
        onApproveRequest={approveRequest}
        onRejectRequest={rejectRequest}
      />
      {membersLoaded && (isOwner || isAdmin) && (
        <InviteLinkControls homeId={homeId} />
      )}
    </div>
  );
};
