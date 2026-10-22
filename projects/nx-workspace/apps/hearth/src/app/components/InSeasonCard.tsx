'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Badge,
  CardContainer,
  Text,
  useGeolocation,
} from '@vigilant-broccoli/react-lib';
import { useTranslation } from '../i18n';
import { useAuth } from '../providers/auth-provider';
import { useHome } from '../providers/home-provider';
import { useAuthHeader, useJsonAuthHeaders } from '../hooks/use-auth-headers';
import { ChecklistItem } from '../../lib/types';
import {
  detectHemisphere,
  getInSeason,
  SEASONAL_PRODUCE,
} from '../../lib/in-season';

const GROCERY_ENDPOINT = '/api/grocery';

type Now = { month: number; timeZone: string };

export function InSeasonCard() {
  const { t } = useTranslation();
  const { lat } = useGeolocation();
  // Read after mount: the server's clock and zone would mismatch hydration.
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const [groceryNames, setGroceryNames] = useState<Set<string>>(new Set());
  const [now, setNow] = useState<Now | null>(null);

  const fetchGroceryNames = useCallback(async () => {
    if (!homeId || !token) return;
    const res = await fetch(`${GROCERY_ENDPOINT}?homeId=${homeId}`, {
      headers: await authHeader(),
    });
    const data = await res.json();
    setGroceryNames(
      new Set(
        (Array.isArray(data) ? (data as ChecklistItem[]) : [])
          .filter(item => !item.completed)
          .map(item => item.name.toLowerCase()),
      ),
    );
  }, [homeId, token, authHeader]);

  useEffect(() => {
    fetchGroceryNames();
  }, [fetchGroceryNames]);

  useEffect(() => {
    setNow({
      month: new Date().getMonth() + 1,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }, []);

  const onList = (name: string) => groceryNames.has(name.toLowerCase());

  const addToGrocery = async (name: string) => {
    if (!homeId || onList(name)) return;
    setGroceryNames(prev => new Set(prev).add(name.toLowerCase()));
    const res = await fetch(GROCERY_ENDPOINT, {
      method: 'POST',
      headers: await jsonHeaders(),
      body: JSON.stringify({ name, homeId }),
    });
    const created = await res.json();
    if (!created?.id) {
      setGroceryNames(prev => {
        const next = new Set(prev);
        next.delete(name.toLowerCase());
        return next;
      });
    }
  };

  if (!now) return null;

  const hemisphere = detectHemisphere({
    latitude: lat,
    timeZone: now.timeZone,
  });
  const groups = [
    {
      label: t('IN_SEASON.FRUITS'),
      names: getInSeason(SEASONAL_PRODUCE.fruits, hemisphere, now.month),
    },
    {
      label: t('IN_SEASON.VEGETABLES'),
      names: getInSeason(SEASONAL_PRODUCE.vegetables, hemisphere, now.month),
    },
  ];

  return (
    <CardContainer title={t('IN_SEASON.TITLE')}>
      {groups.map(({ label, names }) => (
        <div key={label} className="space-y-2">
          <Text size="2" weight="bold">
            {label}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {names.length ? (
              names.map(name => (
                <button
                  key={name}
                  type="button"
                  disabled={!homeId || onList(name)}
                  onClick={() => addToGrocery(name)}
                  aria-label={t(
                    onList(name)
                      ? 'IN_SEASON.ON_LIST_LABEL'
                      : 'IN_SEASON.ADD_LABEL',
                    { name },
                  )}
                  title={t(
                    onList(name)
                      ? 'IN_SEASON.ON_LIST_LABEL'
                      : 'IN_SEASON.ADD_LABEL',
                    { name },
                  )}
                  className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 enabled:cursor-pointer"
                >
                  <Badge
                    color="green"
                    variant={onList(name) ? 'solid' : 'soft'}
                  >
                    {onList(name) ? '✓ ' : ''}
                    {name}
                  </Badge>
                </button>
              ))
            ) : (
              <Text size="1" color="gray">
                {t('IN_SEASON.NONE')}
              </Text>
            )}
          </div>
        </div>
      ))}
    </CardContainer>
  );
}
