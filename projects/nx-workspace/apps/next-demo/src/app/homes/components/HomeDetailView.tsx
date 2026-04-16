'use client';

import { useState, useEffect } from 'react';
import { Text } from '@radix-ui/themes';
import { supabase } from '../../../../libs/supabase';
import { useAuth } from '../../providers/auth-provider';
import { HOME_ROLE, HomeMember, HomeRole } from '../../../lib/types';
import { HomeForm } from './HomeForm';
import { MemberList } from './MemberList';

type Props = {
  homeId: string;
};

export const HomeDetailView = ({ homeId }: Props) => {
  const session = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState<HomeMember[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);

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
            status: m.status as 'pending' | 'accepted',
            role: (m.role ?? HOME_ROLE.MEMBER) as HomeRole,
            createdAt: m.created_at ?? '',
          }));
          setMembers(mapped);
          const currentMember = mapped.find(m => m.email === session?.user.email);
          setIsAdmin(currentMember?.role === HOME_ROLE.ADMIN);
        }
      });
  }, [homeId, session?.access_token]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/homes/${homeId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        description,
        accessToken: session?.access_token,
      }),
    });
    setSaving(false);
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
      status: 'pending',
      role: HOME_ROLE.MEMBER,
      createdAt: new Date().toISOString(),
    };
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

  if (!loaded) return null;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Text size="6" weight="bold">
          Home Details
        </Text>
        <HomeForm
          name={name}
          description={description}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onSave={handleSave}
          saving={saving}
          disabled={!isOwner}
        />
      </div>
      <MemberList
        members={members}
        setMembers={setMembers}
        isOwner={isOwner}
        isAdmin={isAdmin}
        onInvite={inviteMember}
        onDelete={deleteMember}
        onRoleChange={updateMemberRole}
      />
    </div>
  );
};
