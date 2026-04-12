export const WHITELISTED_EMAILS = [
  'harryliu1995@gmail.com',
  'harry.liu@elva11.se',
];

export const isWhitelisted = (email: string | undefined) =>
  !!email && WHITELISTED_EMAILS.includes(email);
