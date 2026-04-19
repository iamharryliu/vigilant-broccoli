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
  homeId: number;
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
