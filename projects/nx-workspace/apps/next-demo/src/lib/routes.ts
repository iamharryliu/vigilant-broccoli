export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  MY_HOME: '/home',
  HOMES: '/homes',
  WHERE_IS: '/where-is',
  AUTH_CALLBACK: '/auth/callback',
  CALENDAR: '/calendar',
  HOME_CALENDAR: (id: string | number) => `/homes/${id}/calendar`,
  LEISURE: '/leisure',
} as const;
