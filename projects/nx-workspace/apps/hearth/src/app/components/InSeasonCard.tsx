'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, CircleHelp } from 'lucide-react';
import {
  Badge,
  CardContainer,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  getInSeasonItems,
  getProduceEmoji,
  getSeasonStatus,
  SEASON_STATUS,
  SEASON_STATUS_EMOJI,
  SEASON_STATUS_LABEL_KEY,
  SEASONAL_PRODUCE,
  shiftMonth,
} from '../../lib/in-season';

const GROCERY_ENDPOINT = '/api/grocery';

const MONTH_STEP = { PREVIOUS: -1, NEXT: 1 } as const;

const formatMonthName = (month: number) =>
  new Intl.DateTimeFormat(undefined, { month: 'long' }).format(
    new Date(2000, month - 1, 1),
  );

type Now = { month: number; timeZone: string };

const LEGEND_STATUSES = [
  SEASON_STATUS.JUST_IN,
  SEASON_STATUS.LAST_CHANCE,
] as const;

type Props = { onGroceryAdded?: () => void };

export function InSeasonCard({ onGroceryAdded }: Props) {
  const { t } = useTranslation();
  const { lat } = useGeolocation();
  // Read after mount: the server's clock and zone would mismatch hydration.
  const session = useAuth();
  const { selectedHomeId: homeId } = useHome();
  const token = session?.access_token ?? '';
  const authHeader = useAuthHeader();
  const jsonHeaders = useJsonAuthHeaders();
  const [groceryNames, setGroceryNames] = useState<Set<string>>(new Set());
  const [legendOpen, setLegendOpen] = useState(false);
  const [browsedMonth, setBrowsedMonth] = useState<number | null>(null);
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
      return;
    }
    onGroceryAdded?.();
  };

  if (!now) return null;

  const month = browsedMonth ?? now.month;
  const isBrowsing = month !== now.month;
  const stepMonth = (step: number) => setBrowsedMonth(shiftMonth(month, step));

  const hemisphere = detectHemisphere({
    latitude: lat,
    timeZone: now.timeZone,
  });
  const groups = [
    {
      label: t('IN_SEASON.FRUITS'),
      items: getInSeasonItems(SEASONAL_PRODUCE.fruits, hemisphere, month),
    },
    {
      label: t('IN_SEASON.VEGETABLES'),
      items: getInSeasonItems(SEASONAL_PRODUCE.vegetables, hemisphere, month),
    },
  ];

  return (
    <CardContainer
      title={t('IN_SEASON.TITLE')}
      titleAction={
        <button
          type="button"
          onClick={() => setLegendOpen(true)}
          aria-label={t('IN_SEASON.LEGEND_LABEL')}
          title={t('IN_SEASON.LEGEND_LABEL')}
          className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <CircleHelp className="h-4 w-4" />
        </button>
      }
    >
      <Dialog open={legendOpen} onOpenChange={setLegendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('IN_SEASON.LEGEND_TITLE')}</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3 text-sm">
            {LEGEND_STATUSES.map(status => (
              <li key={status} className="flex items-center gap-3">
                <span aria-hidden>{SEASON_STATUS_EMOJI[status]}</span>
                <span>{t(SEASON_STATUS_LABEL_KEY[status])}</span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => stepMonth(MONTH_STEP.PREVIOUS)}
          aria-label={t('IN_SEASON.PREVIOUS_MONTH')}
          title={t('IN_SEASON.PREVIOUS_MONTH')}
          className="rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span aria-live="polite">
            <Text size="2" weight="bold">
              {formatMonthName(month)}
            </Text>
          </span>
          {isBrowsing && (
            <button
              type="button"
              onClick={() => setBrowsedMonth(null)}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              {t('IN_SEASON.CURRENT_MONTH')}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => stepMonth(MONTH_STEP.NEXT)}
          aria-label={t('IN_SEASON.NEXT_MONTH')}
          title={t('IN_SEASON.NEXT_MONTH')}
          className="rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      {groups.map(({ label, items }) => (
        <div key={label} className="space-y-2">
          <Text size="2" weight="bold">
            {label}
          </Text>
          <div className="flex flex-wrap gap-1.5">
            {items.length ? (
              items.map(item => {
                const { name } = item;
                const status = getSeasonStatus(item, hemisphere, month);
                const produceEmoji = getProduceEmoji(name);
                const statusEmoji =
                  status === SEASON_STATUS.REGULAR
                    ? null
                    : SEASON_STATUS_EMOJI[status];
                const actionLabel = t(
                  onList(name)
                    ? 'IN_SEASON.ON_LIST_LABEL'
                    : 'IN_SEASON.ADD_LABEL',
                  { name },
                );
                const fullLabel =
                  status === SEASON_STATUS.REGULAR
                    ? actionLabel
                    : `${actionLabel} (${t(SEASON_STATUS_LABEL_KEY[status])})`;
                return (
                  <button
                    key={name}
                    type="button"
                    disabled={!homeId || onList(name)}
                    onClick={() => addToGrocery(name)}
                    aria-label={fullLabel}
                    title={fullLabel}
                    className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 enabled:cursor-pointer"
                  >
                    <Badge
                      color="green"
                      variant={onList(name) ? 'solid' : 'soft'}
                    >
                      {onList(name) ? '✓ ' : ''}
                      {statusEmoji ? `${statusEmoji} ` : ''}
                      {produceEmoji ? `${produceEmoji} ${name}` : name}
                    </Badge>
                  </button>
                );
              })
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
