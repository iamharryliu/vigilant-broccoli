'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Text } from '@radix-ui/themes';
import { useAuth } from '../../providers/auth-provider';
import { HouseholdRule } from '../../../lib/types';
import { ROUTES } from '../../../lib/routes';

export default function HouseholdRuleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useAuth();
  const [rule, setRule] = useState<HouseholdRule | null>(null);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/household-rules?id=${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(r => r.json())
      .then(setRule);
  }, [id, session?.access_token]);

  if (!rule) return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href={ROUTES.HOUSEHOLD_RULES} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back
      </Link>

      <Text size="6" weight="bold" as="p">{rule.name}</Text>

      {rule.description && (
        <Text size="3" color="gray" as="p">{rule.description}</Text>
      )}

      <Text size="1" color="gray" as="p">
        Added {new Date(rule.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
      </Text>
    </div>
  );
}
