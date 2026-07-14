import { NextRequest } from 'next/server';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  GOOGLE_TOKEN_HEADER,
} from '@vigilant-broccoli/common-js';
import { supabase } from '../src/lib/supabase';

export const getGoogleAccessToken = (request: NextRequest): string => {
  const token = request.headers.get(GOOGLE_TOKEN_HEADER);
  if (!token) throw new Error('Not authenticated');
  return token;
};

export const getUserEmail = async (
  request: NextRequest,
): Promise<string | null> => {
  const auth = request.headers.get(AUTHORIZATION_HEADER);
  if (!auth?.startsWith(BEARER_PREFIX)) return null;
  const token = auth.slice(BEARER_PREFIX.length);

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.email) return null;
  return data.user.email;
};
