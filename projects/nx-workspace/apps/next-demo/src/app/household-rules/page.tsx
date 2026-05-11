'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { HouseholdRule } from '../../lib/types';
import { HouseholdRuleList } from './components/HouseholdRuleList';

export default function HouseholdRulesPage() {
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const [rules, setRules] = useState<HouseholdRule[]>([]);

  const token = session?.access_token ?? '';
  const authHeader = () => ({ Authorization: `Bearer ${token}` });

  const fetchRules = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`/api/household-rules?homeId=${homeId}`, {
      headers: authHeader(),
    });
    const data = await res.json();
    setRules(Array.isArray(data) ? data : []);
  }, [homeId, token]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const createRule = async (form: HouseholdRule): Promise<HouseholdRule> => {
    const res = await fetch('/api/household-rules', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, homeId }),
    });
    return res.json();
  };

  const updateRule = async (form: HouseholdRule): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: form.id,
        name: form.name,
        description: form.description,
        position: form.position,
      }),
    });
  };

  const deleteRule = async (id: string | number): Promise<void> => {
    await fetch('/api/household-rules', {
      method: 'DELETE',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
  };

  if (!homeId) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <HouseholdRuleList
        rules={rules}
        setRules={setRules}
        homeId={homeId}
        onCreate={createRule}
        onUpdate={updateRule}
        onDelete={deleteRule}
      />
    </div>
  );
}
