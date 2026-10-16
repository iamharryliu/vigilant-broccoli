import {
  KITCHEN_PROJECT_KINDS,
  KitchenProjectItem,
  KitchenProjectKind,
  KitchenProjectLocation,
} from '../../lib/types';

export const MINUTE_MS = 60 * 1000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

/**
 * Professional kitchens treat a prepped component as expiring stock rather than
 * a task: ready-to-eat food held cold is labelled with a use-by date and pulled
 * once it passes. USE_SOON mirrors the "use it today" shelf.
 */
export const USE_SOON_WINDOW_MS = DAY_MS;

export const PROJECT_STATUS = {
  WAITING: 'WAITING',
  READY: 'READY',
  USE_SOON: 'USE_SOON',
  EXPIRED: 'EXPIRED',
} as const;

export type ProjectStatus =
  (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const STATUS_ORDER: Record<ProjectStatus, number> = {
  [PROJECT_STATUS.EXPIRED]: 0,
  [PROJECT_STATUS.USE_SOON]: 1,
  [PROJECT_STATUS.READY]: 2,
  [PROJECT_STATUS.WAITING]: 3,
};

export const STATUS_COLORS: Record<
  ProjectStatus,
  'blue' | 'green' | 'amber' | 'red'
> = {
  [PROJECT_STATUS.WAITING]: 'blue',
  [PROJECT_STATUS.READY]: 'green',
  [PROJECT_STATUS.USE_SOON]: 'amber',
  [PROJECT_STATUS.EXPIRED]: 'red',
};

export const KIND_LABELS: Record<KitchenProjectKind, string> = {
  FERMENT: 'Fermenting',
  PROOF: 'Proofing',
  MARINATE: 'Marinating',
  THAW: 'Thawing',
  COMPONENT: 'Prepped',
};

export const LOCATION_LABELS: Record<KitchenProjectLocation, string> = {
  COUNTER: 'Counter',
  FRIDGE: 'Fridge',
  FREEZER: 'Freezer',
  PANTRY: 'Pantry',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  [PROJECT_STATUS.WAITING]: 'Working',
  [PROJECT_STATUS.READY]: 'Ready',
  [PROJECT_STATUS.USE_SOON]: 'Use soon',
  [PROJECT_STATUS.EXPIRED]: 'Past use-by',
};

export type ProjectTemplate = {
  id: string;
  label: string;
  name: string;
  kind: KitchenProjectKind;
  location: KitchenProjectLocation;
  readyInMs: number;
  useByInMs: number;
};

/**
 * The prep-sheet equivalent: each row carries the timings a kitchen would
 * otherwise keep in its head, so logging an item is one tap plus a name.
 */
export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'starter-feed',
    label: 'Sourdough starter fed',
    name: 'Sourdough starter',
    kind: 'FERMENT',
    location: 'COUNTER',
    readyInMs: 6 * HOUR_MS,
    useByInMs: 12 * HOUR_MS,
  },
  {
    id: 'levain',
    label: 'Levain built',
    name: 'Levain',
    kind: 'FERMENT',
    location: 'COUNTER',
    readyInMs: 5 * HOUR_MS,
    useByInMs: 9 * HOUR_MS,
  },
  {
    id: 'bulk-ferment',
    label: 'Bulk ferment',
    name: 'Bulk ferment',
    kind: 'FERMENT',
    location: 'COUNTER',
    readyInMs: 4 * HOUR_MS,
    useByInMs: 7 * HOUR_MS,
  },
  {
    id: 'cold-retard',
    label: 'Dough in fridge',
    name: 'Shaped dough',
    kind: 'PROOF',
    location: 'FRIDGE',
    readyInMs: 12 * HOUR_MS,
    useByInMs: 3 * DAY_MS,
  },
  {
    id: 'marinate',
    label: 'Marinating / brining',
    name: '',
    kind: 'MARINATE',
    location: 'FRIDGE',
    readyInMs: 12 * HOUR_MS,
    useByInMs: 2 * DAY_MS,
  },
  {
    id: 'thaw',
    label: 'Thawing in fridge',
    name: '',
    kind: 'THAW',
    location: 'FRIDGE',
    readyInMs: DAY_MS,
    useByInMs: 2 * DAY_MS,
  },
  {
    id: 'component',
    label: 'Cooked component',
    name: '',
    kind: 'COMPONENT',
    location: 'FRIDGE',
    readyInMs: 0,
    useByInMs: 5 * DAY_MS,
  },
  {
    id: 'stock',
    label: 'Stock / sauce',
    name: '',
    kind: 'COMPONENT',
    location: 'FRIDGE',
    readyInMs: 0,
    useByInMs: 4 * DAY_MS,
  },
  {
    id: 'frozen',
    label: 'Into the freezer',
    name: '',
    kind: 'COMPONENT',
    location: 'FREEZER',
    readyInMs: 0,
    useByInMs: 90 * DAY_MS,
  },
];

export const DEFAULT_TEMPLATE =
  PROJECT_TEMPLATES.find(template => template.id === 'component') ??
  PROJECT_TEMPLATES[0];

export const KIND_OPTIONS = [...KITCHEN_PROJECT_KINDS];

export const getStatus = (
  item: KitchenProjectItem,
  now: number,
): ProjectStatus => {
  const readyAt = item.readyAt ? Date.parse(item.readyAt) : null;
  const useByAt = item.useByAt ? Date.parse(item.useByAt) : null;

  if (useByAt !== null && now >= useByAt) return PROJECT_STATUS.EXPIRED;
  if (readyAt !== null && now < readyAt) return PROJECT_STATUS.WAITING;
  if (useByAt !== null && useByAt - now <= USE_SOON_WINDOW_MS)
    return PROJECT_STATUS.USE_SOON;
  return PROJECT_STATUS.READY;
};

const formatDuration = (ms: number) => {
  if (ms >= DAY_MS) {
    const days = Math.round(ms / DAY_MS);
    return `${days}d`;
  }
  if (ms >= HOUR_MS) {
    const hours = Math.round(ms / HOUR_MS);
    return `${hours}h`;
  }
  return `${Math.max(1, Math.round(ms / MINUTE_MS))}m`;
};

export const getStatusDetail = (
  item: KitchenProjectItem,
  status: ProjectStatus,
  now: number,
) => {
  const readyAt = item.readyAt ? Date.parse(item.readyAt) : null;
  const useByAt = item.useByAt ? Date.parse(item.useByAt) : null;

  if (status === PROJECT_STATUS.WAITING && readyAt !== null)
    return `ready in ${formatDuration(readyAt - now)}`;
  if (status === PROJECT_STATUS.EXPIRED && useByAt !== null)
    return `${formatDuration(now - useByAt)} over`;
  if (useByAt !== null) return `${formatDuration(useByAt - now)} left`;
  return '';
};

/** Urgency first, the way a walk-in check reads: what dies soonest gets seen. */
export const sortByUrgency = (items: KitchenProjectItem[], now: number) =>
  [...items].sort((a, b) => {
    const orderDiff =
      STATUS_ORDER[getStatus(a, now)] - STATUS_ORDER[getStatus(b, now)];
    if (orderDiff !== 0) return orderDiff;
    const aDeadline = a.useByAt ?? a.readyAt ?? a.startedAt;
    const bDeadline = b.useByAt ?? b.readyAt ?? b.startedAt;
    return aDeadline.localeCompare(bDeadline);
  });
