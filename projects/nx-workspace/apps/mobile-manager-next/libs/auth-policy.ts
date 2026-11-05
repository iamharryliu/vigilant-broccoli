export const ALLOWED_EMAIL = 'harryliu1995@gmail.com';

export const isAllowedEmail = (email: string | null | undefined): boolean =>
  email?.toLowerCase() === ALLOWED_EMAIL;
