export const WHITELISTED_EMAILS = ['harryliu1995@gmail.com'];

export const isWhitelisted = (email: string | undefined) =>
  !!email && WHITELISTED_EMAILS.includes(email);
