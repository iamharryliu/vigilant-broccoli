import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
} from '@vigilant-broccoli/common-js';
import { supabase } from './supabase';

export const getUserEmail = async (
  request: Request,
): Promise<string | null> => {
  const auth = request.headers.get(AUTHORIZATION_HEADER);
  if (!auth?.startsWith(BEARER_PREFIX)) return null;
  const token = auth.slice(BEARER_PREFIX.length);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return data.user.email;
};
