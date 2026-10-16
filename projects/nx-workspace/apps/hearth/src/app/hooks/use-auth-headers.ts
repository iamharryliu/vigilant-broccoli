'use client';

import { useCallback } from 'react';
import {
  AUTHORIZATION_HEADER,
  BEARER_PREFIX,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
} from '@vigilant-broccoli/common-js';
import { supabase } from '../../../libs/supabase';

// Resolves the access token at call time instead of reading the snapshot held
// in auth context. The provider refreshes that snapshot when the tab regains
// focus, but a token can still lapse mid-session; getSession returns a
// refreshed one rather than the expired token.
export const useAccessToken = () =>
  useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }, []);

export const useAuthHeader = () => {
  const getAccessToken = useAccessToken();
  return useCallback(
    async () => ({
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${await getAccessToken()}`,
    }),
    [getAccessToken],
  );
};

export const useJsonAuthHeaders = () => {
  const getAccessToken = useAccessToken();
  return useCallback(
    async () => ({
      [AUTHORIZATION_HEADER]: `${BEARER_PREFIX}${await getAccessToken()}`,
      [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE,
    }),
    [getAccessToken],
  );
};
