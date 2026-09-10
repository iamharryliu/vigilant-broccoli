// Tags which hop rejected a request, so a browser session problem is never
// confused with vb-express refusing hearth's API key.
export const ERROR_STAGE = {
  HEARTH_AUTH: 'hearth-auth',
  VB_EXPRESS_STORAGE: 'vb-express-storage',
  VB_EXPRESS_LLM: 'vb-express-llm',
} as const;

export const ERROR_SESSION_REJECTED =
  'Session rejected by Supabase — try signing out and back in.';

export const missingAuthHeaderError = (route: string) =>
  `No Authorization header reached ${route}.`;
