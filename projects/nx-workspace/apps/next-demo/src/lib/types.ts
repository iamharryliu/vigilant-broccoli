export type Home = {
  id: number;
  name: string;
  description: string;
};

export const HOME_ROLE = {
  MEMBER: 'HOME_MEMBER',
  ADMIN: 'HOME_ADMIN',
} as const;

export type HomeRole = (typeof HOME_ROLE)[keyof typeof HOME_ROLE];

export type HomeMember = {
  id: string;
  email: string;
  status: 'pending' | 'accepted';
  role: HomeRole;
  createdAt: string;
};

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: string;
  end: string;
  allDay: boolean;
  color: string | null;
  googleEventId: string | null;
  leisureActivityId: string | null;
  homeId: number;
  createdAt: string;
  updatedAt: string;
}

export const LEISURE_CATEGORIES = [
  'Movies',
  'Shows',
  'Crafts',
  'Games',
  'Outdoors',
  'Music',
  'Books',
  'Other',
] as const;

export type LeisureCategory = (typeof LEISURE_CATEGORIES)[number];

export interface LeisureActivity {
  id: string;
  title: string;
  description: string | null;
  category: LeisureCategory;
  homeId: number;
  createdAt: string;
  updatedAt: string;
}

export const RESOURCE_CATEGORIES = [
  'Vehicle',
  'Room',
  'Equipment',
  'Electronics',
  'Furniture',
  'Tool',
  'Other',
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  category: ResourceCategory;
  quantity: number;
  homeId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  homeId: number;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhereIsItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageUrls: string[];
  createdAt: string;
}
